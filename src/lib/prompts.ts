export const PROMPTS = {
  suggestStack: process.env.AI_PROMPT_SUGGEST_STACK!,
  interviewSystem: process.env.AI_PROMPT_INTERVIEW_SYSTEM!,
  evaluateSystem: process.env.AI_PROMPT_EVALUATE_SYSTEM!,
  evaluateUser: process.env.AI_PROMPT_EVALUATE_USER!,
  startMessage: process.env.AI_PROMPT_START_MESSAGE!,
} as const;
