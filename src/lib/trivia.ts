import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/topics";

export const TRIVIA_API_BASE_URL =
  process.env.TRIVIA_API_BASE_URL || "https://opentdb.com";

type TriviaCategory = {
  id: number;
  name: string;
};

export type TriviaQuestion = {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

// Existing manual type slugs mapped to their OpenTDB category id.
const TYPE_TO_API_CATEGORY: Record<string, number> = {
  "computer-science": 18, // Science: Computers
};

const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const fetchTriviaCategories = async (): Promise<TriviaCategory[]> => {
  const res = await fetch(`${TRIVIA_API_BASE_URL}/api_category.php`);
  if (!res.ok) throw new Error("Failed to fetch trivia categories");
  const data = await res.json();
  return data.trivia_categories ?? [];
};

export const fetchTriviaQuestions = async (
  apiCategoryId: number,
  amount: number,
): Promise<TriviaQuestion[]> => {
  const url = `${TRIVIA_API_BASE_URL}/api.php?amount=${amount}&category=${apiCategoryId}&type=multiple&encode=url3986`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch trivia questions");
  const data: { response_code?: number; results?: TriviaQuestion[] } =
    await res.json();
  if (data.response_code !== 0) return [];
  return (data.results ?? []).map((q) => ({
    ...q,
    question: decodeURIComponent(q.question),
    correct_answer: decodeURIComponent(q.correct_answer),
    incorrect_answers: q.incorrect_answers.map((a) => decodeURIComponent(a)),
  }));
};

export const syncTriviaCategories = async () => {
  const categories = await fetchTriviaCategories();
  const results: { id: string; apiCategoryId: number; name: string }[] = [];
  for (const category of categories) {
    const id =
      TYPE_TO_API_CATEGORY[slugify(category.name)] ?? slugify(category.name);
    await prisma.type.upsert({
      where: { apiCategoryId: category.id },
      create: {
        id,
        name: category.name,
        apiCategoryId: category.id,
      },
      update: { name: category.name },
    });
    results.push({ id, apiCategoryId: category.id, name: category.name });
  }
  return results;
};

export const importTriviaQuestions = async (typeId: string, amount: number) => {
  const type = await prisma.type.findUnique({ where: { id: typeId } });
  if (!type?.apiCategoryId) return 0;

  const questions = await fetchTriviaQuestions(type.apiCategoryId, amount);
  let imported = 0;
  for (const q of questions) {
    const options = shuffle([q.correct_answer, ...q.incorrect_answers]);
    await prisma.question.upsert({
      where: { question: q.question },
      create: {
        id: q.question + q.correct_answer,
        question: q.question,
        typeId: type.id,
        Score: 10,
        Answer: q.correct_answer,
        options,
        difficulty: q.difficulty,
        source: "opentdb",
        isValidated: true,
      },
      update: {},
    });
    imported++;
  }
  return imported;
};