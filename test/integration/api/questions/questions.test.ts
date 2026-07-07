import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const mockFindMany = vi.hoisted(() => vi.fn());
const mockQueryRaw = vi.hoisted(() => vi.fn());
const mockCreate = vi.hoisted(() => vi.fn());
const mockGetSession = vi.hoisted(() => vi.fn());
const mockValidateBody = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    question: { findMany: mockFindMany, create: mockCreate },
    $queryRaw: mockQueryRaw,
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));

vi.mock("@/lib/validation", () => ({
  validateBody: mockValidateBody,
  createQuestionSchema: {},
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Headers({ cookie: "mock" })),
}));

import { GET, POST } from "@/app/api/questions/route";

function req(url: string): NextRequest {
  return new NextRequest(url);
}

function jsonReq(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/questions", () => {
  it("returns all validated questions by default", async () => {
    const questions = [{ id: "1", question: "Q1?" }];
    mockFindMany.mockResolvedValue(questions);

    const res = await GET(req("http://localhost/api/questions"));
    const data = await res.json();
    expect(data.data).toEqual(questions);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isValidated: true } }),
    );
  });

  it("filters by search query", async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(req("http://localhost/api/questions?search=react"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { question: { contains: "react", mode: "insensitive" }, isValidated: true },
      }),
    );
  });

  it("filters by search and typeId", async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(req("http://localhost/api/questions?search=react&typeId=js"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          question: { contains: "react", mode: "insensitive" },
          typeId: "js",
          isValidated: true,
        },
      }),
    );
  });

  it("filters by typeId only", async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(req("http://localhost/api/questions?typeId=js"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { typeId: "js", isValidated: true },
      }),
    );
  });

  it("returns random questions when numberOfQuestion is set", async () => {
    mockQueryRaw.mockResolvedValue([{ id: "1" }, { id: "2" }]);

    const res = await GET(req("http://localhost/api/questions?numberOfQuestion=2"));
    const data = await res.json();
    expect(data.data).toHaveLength(2);
  });

  it("returns 500 on database error", async () => {
    mockFindMany.mockRejectedValue(new Error("DB down"));

    const res = await GET(req("http://localhost/api/questions"));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/questions", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await POST(jsonReq({ question: "Q?" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 on validation error", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "u1" }, session: { id: "s1" } });
    mockValidateBody.mockReturnValue({
      parsed: null,
      error: NextResponse.json({ message: "Invalid" }, { status: 400 }),
    });

    const res = await POST(jsonReq({}));
    expect(res.status).toBe(400);
  });

  it("creates a question successfully", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "u1" }, session: { id: "s1" } });
    mockValidateBody.mockReturnValue({
      parsed: { question: "Q?", score: 10, isValidated: false, answer: "A", userId: "u1" },
      error: null,
    });
    mockCreate.mockResolvedValue({});

    const res = await POST(jsonReq({ question: "Q?", score: 10, answer: "A" }));
    const data = await res.json();
    expect(data.message).toBe("Question created successfully");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          question: "Q?",
          Answer: "A",
          Score: 10,
          isValidated: false,
        }),
      }),
    );
  });
});
