export const EVALUATE_PROMPT = (description: string) => `
You are a topic normalizer for trivia. Given a user's description, decide if it matches a clear trivia topic.

Description: "${description}"

Return JSON: { "matched": boolean, "topic": string }
- If description is vague, nonsense, too short, or not a trivia topic, matched=false and topic=""
- Otherwise matched=true and topic is a 2-4 word title case topic (e.g., "Ancient Egypt", "JavaScript Basics")
Only return JSON, no extra text.
`.trim();

export const GENERATE_PROMPT = (topic: string) => `
Generate 10 basic multiple-choice trivia questions for the topic "${topic}".

Return JSON array of 10 objects:
{ "question": string, "correct_answer": string, "incorrect_answers": string[3] }

Rules:
- Questions must be clear, factual, varied difficulty
- correct_answer is the right answer
- incorrect_answers are 3 plausible wrong answers
- Keep questions concise, under 150 chars
Only return JSON array, no extra text.
`.trim();
