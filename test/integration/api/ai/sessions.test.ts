import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockFindManyProgress = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    interviewProgress: {
      findMany: mockFindManyProgress,
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Headers({ cookie: "mock" })),
}));

import { GET } from "@/app/api/ai/sessions/route";

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSession.mockResolvedValue({
    user: { id: "user-1" },
    session: { id: "sess-1" },
  });
});

describe("GET /api/ai/sessions", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns empty list when user has no sessions", async () => {
    mockFindManyProgress.mockResolvedValue([]);

    const res = await GET();
    const data = await res.json();
    expect(data.sessions).toEqual([]);
  });

  it("returns sessions with last message preview", async () => {
    const now = new Date();
    mockFindManyProgress.mockResolvedValue([
      {
        id: "p1",
        role: "frontend",
        stack: ["React"],
        lang: "English",
        score: 50,
        answered: 3,
        correct: 2,
        createdAt: now,
        updatedAt: now,
        messages: [{ content: "Let's start the interview!" }],
      },
      {
        id: "p2",
        role: "backend",
        stack: ["Node.js"],
        lang: "French",
        score: 10,
        answered: 1,
        correct: 1,
        createdAt: now,
        updatedAt: now,
        messages: [{ content: "Salut" }],
      },
    ]);

    const res = await GET();
    const data = await res.json();

    expect(data.sessions).toHaveLength(2);
    expect(data.sessions[0]).toMatchObject({
      id: "p1",
      role: "frontend",
      lastMessage: "Let's start the interview!",
    });
    expect(data.sessions[1]).toMatchObject({
      id: "p2",
      role: "backend",
      lastMessage: "Salut",
    });
  });

  it("returns null lastMessage when no messages exist", async () => {
    const now = new Date();
    mockFindManyProgress.mockResolvedValue([
      {
        id: "p1",
        role: "frontend",
        stack: [],
        lang: "English",
        score: 0,
        answered: 0,
        correct: 0,
        createdAt: now,
        updatedAt: now,
        messages: [],
      },
    ]);

    const res = await GET();
    const data = await res.json();
    expect(data.sessions[0].lastMessage).toBeNull();
  });
});
