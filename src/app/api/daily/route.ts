import { auth } from "@/lib/auth";
import { getDailyQuestion, getUserDailyState } from "@/lib/daily";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const todayParam = url.searchParams.get("today");
    const question = await getDailyQuestion(todayParam);
    if (!question) return NextResponse.json({ message: "No question available" }, { status: 404 });

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ data: { question, streak: 0, completedToday: false } }, { status: 200 });
    }

    const state = await getUserDailyState(session.user.id, todayParam);
    return NextResponse.json(
      { data: { question, streak: state?.streak ?? 0, longestStreak: state?.longestStreak ?? 0, completedToday: state?.completedToday ?? false } },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
