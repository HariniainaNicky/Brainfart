import { prisma } from "@/lib/prisma";

export const getTodayString = (timeZone?: string) => {
  if (timeZone) {
    return new Date().toLocaleDateString("en-CA", { timeZone });
  }
  return new Date().toISOString().slice(0, 10);
};

const getTodayForRequest = (todayParam?: string | null) => {
  if (todayParam && /^\d{4}-\d{2}-\d{2}$/.test(todayParam)) return todayParam;
  return getTodayString();
};

const getYesterdayString = (today: string) => {
  const d = new Date(today + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const getDailyQuestion = async (todayParam?: string | null) => {
  const today = getTodayForRequest(todayParam);
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
  if (!question) return null;

  if (!question.options || question.options.length < 2) {
    const others = await prisma.question.findMany({
      where: { isValidated: true, id: { not: question.id } },
      select: { Answer: true },
      take: 50,
    });
    const pool = shuffle(others.map((o) => o.Answer).filter((a) => a !== question.Answer));
    const picks = pool.slice(0, 3);
    while (picks.length < 3) picks.push(`Option ${picks.length + 1}`);
    question.options = shuffle([question.Answer, ...picks]);
  } else {
    question.options = shuffle([...question.options]);
  }

  return question;
};

export const getUserDailyState = async (userId: string, todayParam?: string | null) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, longestStreak: true, lastDailyAt: true },
  });
  if (!user) return null;
  const today = getTodayForRequest(todayParam);
  const lastDate = user.lastDailyAt ? new Date(user.lastDailyAt).toISOString().slice(0, 10) : null;
  const completedToday = lastDate === today;
  const yesterday = getYesterdayString(today);
  const streakValid = lastDate === today || lastDate === yesterday;
  const displayStreak = streakValid ? user.streak : 0;
  return {
    streak: displayStreak,
    longestStreak: user.longestStreak,
    completedToday,
    lastDailyAt: user.lastDailyAt,
  };
};

export const completeDaily = async (userId: string, correct: boolean, questionId: string, todayParam?: string | null) => {
  const today = getTodayForRequest(todayParam);
  const existing = await prisma.dailyCompletion.findUnique({
    where: { userId_date: { userId, date: today } },
  });
  if (existing) {
    const state = await getUserDailyState(userId, today);
    return { alreadyCompleted: true, ...state, correct: existing.correct };
  }

  await prisma.dailyCompletion.create({
    data: { userId, date: today, questionId, correct },
  });

  if (!correct) {
    const state = await getUserDailyState(userId, today);
    return { alreadyCompleted: false, ...state, correct: false };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, longestStreak: true, lastDailyAt: true },
  });
  if (!user) throw new Error("User not found");

  const lastDate = user.lastDailyAt ? new Date(user.lastDailyAt).toISOString().slice(0, 10) : null;
  const yesterday = getYesterdayString(today);

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
