import OpenAI from "openai";
import { getRoleLabel } from "@/lib/ai-utils";
import { PROMPTS } from "@/lib/prompts";

const client = new OpenAI({
  baseURL: "https://opencode.ai/zen/v1",
  apiKey: process.env.OPENCODE_API_KEY!,
});

const model = process.env.AI_MODEL!;

function getMasteryDetails(score: number) {
  if (score >= 1000) return { level: "Expert", label: "Ready for Staff/Principal" };
  if (score >= 600) return { level: "Senior Ready", label: "Ready for senior interviews" };
  if (score >= 300) return { level: "Mid Ready", label: "Ready for mid-level interviews" };
  if (score >= 100) return { level: "Junior Ready", label: "Ready for junior interviews" };
  return { level: "Beginner", label: "Learning the basics" };
}

function fill(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

export function buildInterviewPrompt(
  role: string,
  mastery: { score: number; answered: number; correct: number },
  lang: string,
  userName?: string,
  stack?: string[],
) {
  const roleLabel = getRoleLabel(role);
  const { level, label } = getMasteryDetails(mastery.score);
  const pct = mastery.answered > 0
    ? Math.round((mastery.correct / mastery.answered) * 100)
    : 0;
  const stackLine = stack && stack.length > 0
    ? `- Tech stack: ${stack.join(", ")}`
    : "";

  const prompt = fill(PROMPTS.interviewSystem, {
    roleLabel,
    userName: userName ?? "Anonymous",
    level,
    score: String(mastery.score),
    answered: String(mastery.answered),
    correct: String(mastery.correct),
    pct: String(pct),
    stackLine,
    label,
  });

  return `${prompt}\n\nIMPORTANT: Conduct the entire interview in ${lang}. All questions, feedback, and summaries must be in ${lang}.\n\nCRITICAL FORMAT RULE: Never use bracketed placeholders like [Your Name], [Company Name], [Nom de l'entreprise], etc. Always invent specific, realistic names for yourself (interviewer) and the company. Be concrete, not generic.`;
}

export async function suggestStack(role: string, lang: string): Promise<string[]> {
  const res = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `${fill(PROMPTS.suggestStack, { role })}\n\nRespond in ${lang}.`,
      },
    ],
    response_format: { type: "json_object" },
  });

  try {
    const parsed = JSON.parse(res.choices[0].message.content!);
    return Array.isArray(parsed) ? parsed : parsed.stack ?? parsed.skills ?? parsed.technologies ?? [];
  } catch {
    return [];
  }
}

export async function startOrContinueInterview(
  role: string,
  mastery: { score: number; answered: number; correct: number },
  lang: string,
  history: { role: "assistant" | "user"; content: string }[],
  userName?: string,
  stack?: string[],
) {
  const systemPrompt = buildInterviewPrompt(role, mastery, lang, userName, stack);

  const res = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
    ],
  });

  return res.choices[0].message.content ?? "";
}

export async function* startOrContinueInterviewStream(
  role: string,
  mastery: { score: number; answered: number; correct: number },
  lang: string,
  history: { role: "assistant" | "user"; content: string }[],
  userName?: string,
  stack?: string[],
): AsyncGenerator<string> {
  const systemPrompt = buildInterviewPrompt(role, mastery, lang, userName, stack);

  const stream = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || "";
    if (text) yield text;
  }
}

export async function evaluateAnswer(
  role: string,
  question: string,
  userAnswer: string,
  lang: string,
) {
  const roleLabel = getRoleLabel(role);

  const res = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `${fill(PROMPTS.evaluateSystem, { roleLabel })}\n\nIMPORTANT: Respond in ${lang}. The feedback must be in ${lang}.`,
      },
      {
        role: "user",
        content: fill(PROMPTS.evaluateUser, { question, answer: userAnswer }),
      },
    ],
    response_format: { type: "json_object" },
  });

  try {
    return JSON.parse(res.choices[0].message.content!);
  } catch {
    return { isCorrect: false, score: 0, feedback: "Failed to evaluate answer." };
  }
}
