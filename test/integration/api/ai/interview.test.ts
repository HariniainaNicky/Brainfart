import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockUpsert = vi.hoisted(() => vi.fn());
const mockFindMany = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
const mockFindUnique = vi.hoisted(() => vi.fn());
const mockCreateMsg = vi.hoisted(() => vi.fn());
const mockSuggestStack = vi.hoisted(() => vi.fn());
const mockStartInterview = vi.hoisted(() => vi.fn());
const mockStartStream = vi.hoisted(() => vi.fn());
const mockEvaluateAnswer = vi.hoisted(() => vi.fn());
const mockV4 = vi.hoisted(() => vi.fn(() => "mock-uuid"));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    interviewProgress: {
      upsert: mockUpsert,
      update: mockUpdate,
      findUnique: mockFindUnique,
      findMany: vi.fn(),
    },
    interviewMessage: {
      findMany: mockFindMany,
      create: mockCreateMsg,
    },
  },
}));

vi.mock("@/lib/ai", () => ({
  suggestStack: mockSuggestStack,
  startOrContinueInterview: mockStartInterview,
  startOrContinueInterviewStream: mockStartStream,
  evaluateAnswer: mockEvaluateAnswer,
}));

vi.mock("@/lib/prompts", () => ({
  PROMPTS: { startMessage: "Hello from mock interviewer." },
}));

vi.mock("uuid", () => ({ v4: mockV4 }));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Headers({ cookie: "mock" })),
}));

import { POST } from "@/app/api/ai/interview/route";

function createRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/ai/interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSession.mockResolvedValue({
    user: { id: "user-1", name: "Test User" },
    session: { id: "sess-1" },
  });
});

describe("POST /api/ai/interview", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await POST(createRequest({ mode: "start", role: "frontend" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when role is missing", async () => {
    const res = await POST(createRequest({ mode: "start" }));
    expect(res.status).toBe(400);
  });

  describe("mode: suggest-stack", () => {
    it("returns suggested stack from AI", async () => {
      mockSuggestStack.mockResolvedValue(["React", "TypeScript"]);

      const res = await POST(
        createRequest({ mode: "suggest-stack", role: "frontend", lang: "English" }),
      );
      const data = await res.json();
      expect(data.stack).toEqual(["React", "TypeScript"]);
      expect(mockSuggestStack).toHaveBeenCalledWith("frontend", "English");
    });
  });

  describe("mode: start", () => {
    it("returns existing messages when session exists", async () => {
      mockUpsert.mockResolvedValue({
        id: "progress-1",
        score: 50,
        answered: 2,
        correct: 1,
      });
      mockFindMany.mockResolvedValue([
        { id: "m1", progressId: "progress-1", role: "assistant", content: "Hello", createdAt: new Date() },
        { id: "m2", progressId: "progress-1", role: "user", content: "Hi", createdAt: new Date() },
      ]);

      const res = await POST(createRequest({ mode: "start", role: "frontend", stack: [], lang: "English" }));
      const data = await res.json();

      expect(data.id).toBe("progress-1");
      expect(data.mastery).toEqual({ score: 50, answered: 2, correct: 1 });
      expect(data.messages).toHaveLength(2);
      expect(data.messages[0]).toEqual({ role: "assistant", content: "Hello" });
    });

    it("generates first message for new session", async () => {
      mockUpsert.mockResolvedValue({
        id: "progress-2",
        score: 0,
        answered: 0,
        correct: 0,
      });
      mockFindMany.mockResolvedValue([]);
      mockStartInterview.mockResolvedValue(
        "Bonjour, je suis Alex Dupont, recruteur technique senior.",
      );

      const res = await POST(createRequest({ mode: "start", role: "devops", stack: ["Docker"], lang: "French" }));
      const data = await res.json();

      expect(data.id).toBe("progress-2");
      expect(data.mastery).toEqual({ score: 0, answered: 0, correct: 0 });
      expect(data.message).toContain("Alex Dupont");
    });
  });

  describe("mode: evaluate", () => {
    it("returns evaluation and updated mastery", async () => {
      mockUpsert.mockResolvedValue({ id: "progress-3", score: 10, answered: 1, correct: 1 });
      mockEvaluateAnswer.mockResolvedValue({
        isCorrect: true,
        score: 8,
        feedback: "Well explained",
      });
      mockUpdate.mockResolvedValue(undefined);
      mockFindUnique.mockResolvedValue({ score: 18, answered: 2, correct: 2 });

      const res = await POST(
        createRequest({
          mode: "evaluate",
          role: "frontend",
          question: "What is React?",
          answer: "A library",
          lang: "English",
        }),
      );
      const data = await res.json();

      expect(data.isCorrect).toBe(true);
      expect(data.score).toBe(8);
      expect(data.mastery).toEqual({ score: 18, answered: 2, correct: 2 });
    });
  });

  describe("mode: chat", () => {
    it("saves user message and streams response", async () => {
      mockUpsert.mockResolvedValue({ id: "progress-4", score: 0, answered: 0, correct: 0 });
      mockFindMany.mockResolvedValue([]);
      mockCreateMsg.mockResolvedValue({});

      mockStartStream.mockReturnValue({
        [Symbol.asyncIterator]() {
          const tokens = ["Next", " question:", " What is a closure?"];
          let i = 0;
          return {
            next() {
              if (i < tokens.length) {
                return Promise.resolve({ value: tokens[i++], done: false });
              }
              return Promise.resolve({ value: undefined, done: true });
            },
          };
        },
      });

      const res = await POST(
        createRequest({
          mode: "chat",
          role: "frontend",
          messages: [
            { role: "assistant", content: "What is React?" },
            { role: "user", content: "A library" },
          ],
          stack: [],
          lang: "English",
        }),
      );

      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");

      const text = await res.text();
      expect(text).toBe("Next question: What is a closure?");

      expect(mockCreateMsg).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            progressId: "progress-4",
            role: "user",
            content: "A library",
          }),
        }),
      );
    });
  });
});
