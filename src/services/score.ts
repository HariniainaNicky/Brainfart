import { prisma } from "@/lib/prisma";

export const upsertScore = async (roomId: string, userId: string, score: number, finished: boolean) => {
  await prisma.roomPlayerScore.upsert({
    where: {
      roomId_userId: { roomId, userId },
    },
    create: {
      roomId,
      userId,
      score,
      finished,
    },
    update: {
      score,
      finished,
    },
  });
};

export const getRoomScores = async (roomId: string) => {
  return prisma.roomPlayerScore.findMany({
    where: { roomId },
    include: {
      user: {
        select: { id: true, username: true, email: true, image: true },
      },
    },
    orderBy: { score: "desc" },
  });
};
