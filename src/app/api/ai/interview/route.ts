import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { v4 } from "uuid";
import { PROMPTS } from "@/lib/prompts";
import {
  startOrContinueInterview,
  startOrContinueInterviewStream,
  evaluateAnswer,
  suggestStack,
} from "@/lib/ai";

export const POST = async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { mode, role, messages, question, answer, stack, lang } = await req.json();

    if (!role) {
      return NextResponse.json(
        { message: "Role is required" },
        { status: 400 },
      );
    }

    const userId = session.user.id;

    if (mode === "suggest-stack") {
      const items = await suggestStack(role, lang ?? "English");
      return NextResponse.json({ stack: items });
    }

    const progress = await prisma.interviewProgress.upsert({
      where: { userId_role: { userId, role } },
      update: { stack: stack ?? [], lang: lang ?? "English" },
      create: {
        id: v4(),
        userId,
        role,
        stack: stack ?? [],
        lang: lang ?? "English",
      },
    });

    if (mode === "start") {
      const existingMessages = await prisma.interviewMessage.findMany({
        where: { progressId: progress.id },
        orderBy: { createdAt: "asc" },
      });

      if (existingMessages.length > 0) {
        return NextResponse.json({
          id: progress.id,
          mastery: {
            score: progress.score,
            answered: progress.answered,
            correct: progress.correct,
          },
          messages: existingMessages.map((m) => ({
            role: m.role as "assistant" | "user",
            content: m.content,
          })),
        });
      }

      const aiMessage = await startOrContinueInterview(
        role,
        progress,
        lang ?? "English",
        [
          {
            role: "assistant" as const,
            content: PROMPTS.startMessage,
          },
        ],
        session.user.name ?? undefined,
        stack,
      );

      return NextResponse.json({
        id: progress.id,
        mastery: {
          score: progress.score,
          answered: progress.answered,
          correct: progress.correct,
        },
        message: aiMessage,
      });
    }

    if (mode === "chat") {
      if (!messages || !Array.isArray(messages)) {
        return NextResponse.json(
          { message: "Messages array is required" },
          { status: 400 },
        );
      }

      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === "user") {
        await prisma.interviewMessage.create({
          data: {
            id: v4(),
            progressId: progress.id,
            role: "user",
            content: lastMsg.content,
          },
        });
      }

      const stream = startOrContinueInterviewStream(
        role,
        progress,
        lang ?? "English",
        messages,
        session.user.name ?? undefined,
        stack,
      );

      const encoder = new TextEncoder();

      const readable = new ReadableStream({
        async start(controller) {
          let fullContent = "";
          try {
            for await (const token of stream) {
              fullContent += token;
              controller.enqueue(encoder.encode(token));
            }
            await prisma.interviewMessage.create({
              data: {
                id: v4(),
                progressId: progress.id,
                role: "assistant",
                content: fullContent,
              },
            });
          } catch {
            // Stream aborted or errored — don't save partial response
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    if (mode === "evaluate") {
      if (!question || !answer) {
        return NextResponse.json(
          { message: "Question and answer are required" },
          { status: 400 },
        );
      }

      const evaluation = await evaluateAnswer(role, question, answer, lang ?? "English");

      await prisma.interviewProgress.update({
        where: { id: progress.id },
        data: {
          answered: { increment: 1 },
          correct: evaluation.isCorrect ? { increment: 1 } : undefined,
          score: { increment: evaluation.score },
        },
      });

      const updatedProgress = await prisma.interviewProgress.findUnique({
        where: { id: progress.id },
      });

      return NextResponse.json({
        ...evaluation,
        mastery: {
          score: updatedProgress!.score,
          answered: updatedProgress!.answered,
          correct: updatedProgress!.correct,
        },
      });
    }

    return NextResponse.json({ message: "Invalid mode" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};
