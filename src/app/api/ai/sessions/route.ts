import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export const GET = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const sessions = await prisma.interviewProgress.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        where: { role: "assistant" },
        select: { content: true },
      },
    },
  });

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      role: s.role,
      score: s.score,
      answered: s.answered,
      correct: s.correct,
      stack: s.stack,
      lang: s.lang,
      updatedAt: s.updatedAt.toISOString(),
      lastMessage: s.messages[0]?.content ?? null,
    })),
  });
};
