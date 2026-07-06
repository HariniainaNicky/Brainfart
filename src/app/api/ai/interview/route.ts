import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { v4 } from "uuid";
import { PROMPTS } from "@/lib/prompts";
import {
  startOrContinueInterview,
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
      update: {},
      create: { id: v4(), userId, role },
    });

    if (mode === "start") {
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

      const aiMessage = await startOrContinueInterview(
        role,
        progress,
        lang ?? "English",
        messages,
        session.user.name ?? undefined,
        stack,
      );

      return NextResponse.json({ message: aiMessage, mastery: progress });
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

      return NextResponse.json(evaluation);
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
