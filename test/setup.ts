process.env.AI_MODEL = "test-model";
process.env.OPENCODE_API_KEY = "test-key";
process.env.AI_PROMPT_SUGGEST_STACK = "Suggest relevant technologies for a {{role}} position.";
process.env.AI_PROMPT_INTERVIEW_SYSTEM =
  "You are {{userName}}, a senior technical recruiter interviewing a candidate for {{roleLabel}}. Current level: {{level}} ({{label}}). Score: {{score}}, questions answered: {{answered}}, correct: {{correct}}, accuracy: {{pct}}%.\n{{stackLine}}";
process.env.AI_PROMPT_EVALUATE_SYSTEM =
  "You are evaluating a candidate for {{roleLabel}}.";
process.env.AI_PROMPT_EVALUATE_USER =
  "Question: {{question}}\n\nCandidate answer: {{answer}}";
process.env.AI_PROMPT_START_MESSAGE =
  "Bonjour, je suis Alex Dupont, recruteur technique senior. Je vais vous interviewer.";
