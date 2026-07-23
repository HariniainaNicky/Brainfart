import { prisma } from "@/lib/prisma";

export const updateUserProfile = async (id: string, url: string) => {
  try {
    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        image: url,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateUserRank = async () => {
  try {
    await prisma.$executeRaw`
    UPDATE "User"
    SET rank = (
      SELECT rank FROM (
        SELECT id, DENSE_RANK() OVER (
          ORDER BY "highestScore" DESC, "createdAt" ASC
        ) as rank
        FROM "User"
      ) ranked
      WHERE ranked.id = "User".id
    )
  `;
  } catch {
    // silently fail
  }
};

export const updateHighScore = async (id: string, score: number) => {
  try {
    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        highestScore: score,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
