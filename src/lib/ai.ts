import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://opencode.ai/zen/v1",
  apiKey: process.env.OPENCODE_API_KEY!,
});

const model = process.env.AI_MODEL ?? "deepseek-v4-flash";

const roleLabels: Record<string, string> = {
  backend: "Backend Developer",
  frontend: "Frontend Developer",
  fullstack: "Full Stack Developer",
  devops: "DevOps Engineer",
  data: "Data Engineer",
  datascience: "Data Scientist",
  ml: "Machine Learning Engineer",
  cybersecurity: "Cybersecurity Analyst",
  cloud: "Cloud Architect",
  mobile: "Mobile Developer",
  sysadmin: "Systems Administrator",
  qa: "QA / Test Engineer",
  sre: "Site Reliability Engineer",
  security: "Security Engineer",
  embedded: "Embedded Systems Engineer",
  game: "Game Developer",
  ai: "AI Engineer",
  dba: "Database Administrator",
  network: "Network Engineer",
  blockchain: "Blockchain Developer",
  solutions: "Solutions Architect",
  engmanager: "Engineering Manager",
  staff: "Staff Engineer",
  techlead: "Technical Lead",
  platform: "Platform Engineer",
};

export function getRoleLabel(roleKey: string): string {
  return roleLabels[roleKey] ?? roleKey;
}

function getMasteryDetails(score: number) {
  if (score >= 1000) return { level: "Expert", label: "Ready for Staff/Principal" };
  if (score >= 600) return { level: "Senior Ready", label: "Ready for senior interviews" };
  if (score >= 300) return { level: "Mid Ready", label: "Ready for mid-level interviews" };
  if (score >= 100) return { level: "Junior Ready", label: "Ready for junior interviews" };
  return { level: "Beginner", label: "Learning the basics" };
}

export function buildInterviewPrompt(
  role: string,
  mastery: { score: number; answered: number; correct: number },
  userName?: string,
) {
  const roleLabel = getRoleLabel(role);
  const { level, label } = getMasteryDetails(mastery.score);
  const pct = mastery.answered > 0
    ? Math.round((mastery.correct / mastery.answered) * 100)
    : 0;

  return `You are a senior HR technical interviewer at a top tech company. You are interviewing a candidate for a ${roleLabel} position.

Candidate profile:
- Name: ${userName ?? "Anonymous"}
- Current mastery level: ${level} (score: ${mastery.score})
- Questions answered: ${mastery.answered}
- Correct answers: ${mastery.correct}
- Accuracy rate: ${pct}%
- Overall readiness: ${label}

Instructions:
1. Ask ONE technical question at a time. Start at the ${level} difficulty level.
2. After each answer, evaluate it and give concise constructive feedback.
3. If they answer correctly, ask a follow-up or move to a harder topic.
4. If they struggle, ask clarifying questions or simplify.
5. Stay in character as an HR interviewer — be professional, encouraging, but challenging.
6. Adapt the difficulty based on their performance during this session.
7. Keep questions focused on practical knowledge and real-world scenarios.
8. After the candidate answers, provide:
   - A brief evaluation (what was good, what could be improved)
   - Whether the answer is considered correct/partially correct/incorrect
   - A score out of 10
   - Then ask the next question
9. When the candidate types "done", "finish", or "end interview", provide a final summary of their performance with strengths, weaknesses, and recommendations.`;
}

export async function startOrContinueInterview(
  role: string,
  mastery: { score: number; answered: number; correct: number },
  history: { role: "assistant" | "user"; content: string }[],
  userName?: string,
) {
  const systemPrompt = buildInterviewPrompt(role, mastery, userName);

  const res = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
    ],
  });

  return res.choices[0].message.content ?? "";
}

export async function evaluateAnswer(
  role: string,
  question: string,
  userAnswer: string,
) {
  const roleLabel = getRoleLabel(role);

  const res = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `You are an impartial evaluator for a ${roleLabel} interview.
Evaluate the candidate's answer to the question below.
Return ONLY a valid JSON object with no markdown formatting:
{
  "isCorrect": boolean,
  "score": number (0-10),
  "feedback": "brief feedback string"
}`,
      },
      {
        role: "user",
        content: `Question: "${question}"\n\nCandidate's answer: "${userAnswer}"`,
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
