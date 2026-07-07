import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.hoisted(() => vi.fn());

vi.mock("openai", () => ({
  default: class {
    chat = {
      completions: {
        create: mockCreate,
      },
    };
  },
}));

import {
  suggestStack,
  evaluateAnswer,
  startOrContinueInterview,
  startOrContinueInterviewStream,
} from "@/lib/ai";

const mastery = { score: 100, answered: 5, correct: 3 };

beforeEach(() => {
  mockCreate.mockReset();
});

describe("suggestStack", () => {
  it("returns parsed array from OpenAI response", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(["React", "Node.js"]) } }],
    });

    const result = await suggestStack("frontend", "English");
    expect(result).toEqual(["React", "Node.js"]);
  });

  it("handles JSON object with stack key", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ stack: ["Python", "Django"] }) } }],
    });

    const result = await suggestStack("backend", "English");
    expect(result).toEqual(["Python", "Django"]);
  });

  it("handles JSON object with skills key", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ skills: ["AWS", "Docker"] }) } }],
    });

    const result = await suggestStack("devops", "English");
    expect(result).toEqual(["AWS", "Docker"]);
  });

  it("returns empty array on parse error", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "not valid json" } }],
    });

    const result = await suggestStack("frontend", "English");
    expect(result).toEqual([]);
  });
});

describe("evaluateAnswer", () => {
  it("returns parsed evaluation from OpenAI", async () => {
    const evaluation = { isCorrect: true, score: 8, feedback: "Good answer" };
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(evaluation) } }],
    });

    const result = await evaluateAnswer("frontend", "What is React?", "A library", "English");
    expect(result).toEqual(evaluation);
  });

  it("returns fallback on parse error", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "corrupted" } }],
    });

    const result = await evaluateAnswer("frontend", "What is React?", "A library", "English");
    expect(result).toEqual({
      isCorrect: false,
      score: 0,
      feedback: "Failed to evaluate answer.",
    });
  });
});

describe("startOrContinueInterview", () => {
  it("returns AI message text", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "Tell me about your experience." } }],
    });

    const result = await startOrContinueInterview("frontend", mastery, "English", []);
    expect(result).toBe("Tell me about your experience.");
  });
});

describe("startOrContinueInterviewStream", () => {
  it("yields tokens one by one", async () => {
    async function* mockStream() {
      yield { choices: [{ delta: { content: "Hello" }, index: 0 }] };
      yield { choices: [{ delta: { content: " world" }, index: 0 }] };
      yield { choices: [{ delta: {}, index: 0 }] };
    }

    mockCreate.mockResolvedValue(mockStream());

    const tokens: string[] = [];
    for await (const token of startOrContinueInterviewStream("frontend", mastery, "English", [])) {
      tokens.push(token);
    }

    expect(tokens).toEqual(["Hello", " world"]);
  });
});
