import { prisma } from "@/lib/prisma";

export const getTodayString = () => new Date().toISOString().slice(0, 10);

const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export const getDailyQuestion = async () => {
  const today = getTodayString();
  const count = await prisma.question.count({ where: { isValidated: true } });
  if (count === 0) return null;
  const offset = hashString(today) % count;
  const [question] = await prisma.question.findMany({
    where: { isValidated: true },
    orderBy: { id: "asc" },
    skip: offset,
    take: 1,
    include: { type: true },
  });
  return question ?? null;
};

export const getUserDailyState = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, longestStreak: true, lastDailyAt: true },
  });
  if (!user) return null;
  const today = getTodayString();
  const lastDate = user.lastDailyAt ? new Date(user.lastDailyAt).toISOString().slice(0, 10) : null;
  const completedToday = lastDate === today;
  // Check if streak is still valid: if lastDailyAt is yesterday, streak is intact, if older than yesterday, streak should be 0 but we keep stored value until next completion
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streakValid = lastDate === today || lastDate === yesterday;
  const displayStreak = streakValid ? user.streak : 0;
  return {
    streak: displayStreak,
    longestStreak: user.longestStreak,
    completedToday,
    lastDailyAt: user.lastDailyAt,
  };
};

export const completeDaily = async (userId: string, correct: boolean, questionId: string) => {
  const today = getTodayString();
  const existing = await prisma.dailyCompletion.findUnique({
    where: { userId_date: { userId, date: today } },
  });
  if (existing) {
    const state = await getUserDailyState(userId);
    return { alreadyCompleted: true, ...state, correct: existing.correct };
  }

  await prisma.dailyCompletion.create({
    data: { userId, date: today, questionId, correct },
  });

  if (!correct) {
    const state = await getUserDailyState(userId);
    return { alreadyCompleted: false, ...state, correct: false };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, longestStreak: true, lastDailyAt: true },
  });
  if (!user) throw new Error("User not found");

  const lastDate = user.lastDailyAt ? new Date(user.lastDailyAt).toISOString().slice(0, 10) : null;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let newStreak = 1;
  if (lastDate === yesterday) newStreak = user.streak + 1;
  else if (lastDate === today) newStreak = user.streak;
  // else lastDate is older or null => 1

  const newLongest = Math.max(user.longestStreak, newStreak);

  await prisma.user.update({
    where: { id: userId },
    data: { streak: newStreak, longestStreak: newLongest, lastDailyAt: new Date() },
  });

  return {
    alreadyCompleted: false,
    streak: newStreak,
    longestStreak: newLongest,
    completedToday: true,
    lastDailyAt: new Date(),
    correct: true,
  };
};
