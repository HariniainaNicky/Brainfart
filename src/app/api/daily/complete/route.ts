import { auth } from "@/lib/auth";
import { completeDaily, getDailyQuestion } from "@/lib/daily";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const answer: string | undefined = body.answer;
    const today: string | undefined = body.today;
    if (typeof answer !== "string" || !answer.trim()) {
      return NextResponse.json({ message: "Answer required" }, { status: 400 });
    }

    const question = await getDailyQuestion(today);
    if (!question) return NextResponse.json({ message: "No daily question" }, { status: 404 });

    const correct = answer.trim() === question.Answer;
    const result = await completeDaily(session.user.id, correct, question.id, today);

    return NextResponse.json({ data: { ...result, questionId: question.id } }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
