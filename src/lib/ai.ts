import OpenAI from "openai";

const getClient = () => {
  const apiKey = process.env.OPENCODE_API_KEY || process.env.AI_API_KEY;
  const modelEnv = process.env.AI_MODEL;
  if (!apiKey) throw new Error("Missing OPENCODE_API_KEY");
  if (!modelEnv) throw new Error("Missing AI_MODEL");
  return {
    client: new OpenAI({
      apiKey,
      baseURL: "https://opencode.ai/zen/v1",
    }),
    model: modelEnv,
  };
};

export const callAI = async (prompt: string, system?: string) => {
  const { client, model } = getClient();
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });
  const res = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
  });
  return res.choices[0]?.message?.content || "";
};

export const parseJSON = <T>(text: string, fallback: T): T => {
  try {
    const cleaned = text.trim().replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```\s*$/, "");
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
};
