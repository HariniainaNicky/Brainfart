import { auth } from "@/lib/auth";
import { callAI, parseJSON } from "@/lib/ai";
import { GENERATE_PROMPT } from "@/lib/creation-prompts";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type GeneratedItem = {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

export const POST = async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const topic: string = (body.topic || "").trim();
  if (!topic) return NextResponse.json({ message: "Topic required" }, { status: 400 });

  try {
    const raw = await callAI(GENERATE_PROMPT(topic));
    const parsed = parseJSON<GeneratedItem[]>(raw, []);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return NextResponse.json({ message: "AI did not return questions" }, { status: 500 });
    }
    const cleaned = parsed.slice(0, 10).map((q) => ({
      question: String(q.question || "").trim(),
      correct_answer: String(q.correct_answer || "").trim(),
      incorrect_answers: Array.isArray(q.incorrect_answers) ? q.incorrect_answers.map((a) => String(a).trim()).slice(0, 3) : [],
    })).filter((q) => q.question && q.correct_answer && q.incorrect_answers.length === 3);

    if (cleaned.length < 5) {
      return NextResponse.json({ message: "AI generated too few valid questions" }, { status: 500 });
    }

    return NextResponse.json({ data: { topic, questions: cleaned } }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "AI error" }, { status: 500 });
  }
};
