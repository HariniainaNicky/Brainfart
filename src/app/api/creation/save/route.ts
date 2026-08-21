import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const POST = async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const topic: string = (body.topic || "").trim();
  const visibility: string = body.visibility === "public" ? "public" : "private";
  const questions: { question: string; correct_answer: string; incorrect_answers: string[] }[] = body.questions || [];

  if (!topic || !Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ message: "Topic and questions required" }, { status: 400 });
  }

  if (questions.length > 20) return NextResponse.json({ message: "Too many questions" }, { status: 400 });

  try {
    const created: string[] = [];
    for (const q of questions) {
      const questionText = String(q.question || "").trim();
      const correct = String(q.correct_answer || "").trim();
      const incorrect = Array.isArray(q.incorrect_answers) ? q.incorrect_answers.map((a: string) => String(a).trim()).filter(Boolean) : [];
      if (!questionText || !correct || incorrect.length !== 3) continue;
      if (!incorrect.includes(correct) && correct) {
        const options = shuffle([correct, ...incorrect]);
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${questionText.slice(0, 20)}`;
        await prisma.question.create({
          data: {
            id,
            question: questionText,
            Answer: correct,
            options,
            Score: 10,
            source: "custom_ai",
            isValidated: true,
            userId: session.user.id,
            customTopic: topic,
            visibility,
            typeId: null,
          },
        });
        created.push(id);
      }
    }

    return NextResponse.json({ data: { topic, visibility, count: created.length, ids: created } }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to save" }, { status: 500 });
  }
};
