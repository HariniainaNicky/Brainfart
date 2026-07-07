import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockFindMany = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
const mockValidateBody = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { question: { findMany: mockFindMany, update: mockUpdate } },
}));

vi.mock("@/lib/validation", () => ({
  validateBody: mockValidateBody,
  validateQuestionSchema: {},
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Headers({ cookie: "mock" })),
}));

import { GET as GET_PENDING } from "@/app/api/admin/questions/pending/route";
import { PATCH as PATCH_VALIDATE } from "@/app/api/admin/questions/[id]/validate/route";

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

const adminSession = { user: { id: "admin1", role: "admin" }, session: { id: "s1" } };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSession.mockResolvedValue(adminSession);
});

describe("GET /api/admin/questions/pending", () => {
  it("returns 401 for non-admin", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "u1", role: "user" }, session: {} });

    const res = await GET_PENDING();
    expect(res.status).toBe(401);
  });

  it("returns unvalidated questions with user and type", async () => {
    mockFindMany.mockResolvedValue([
      { id: "q1", question: "Q?", user: { id: "u1", name: "Alice" }, type: { id: "t1", name: "JS" } },
    ]);

    const res = await GET_PENDING();
    const data = await res.json();
    expect(data.data).toHaveLength(1);
    expect(data.data[0].question).toBe("Q?");
  });

  it("returns empty array when no pending questions", async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await GET_PENDING();
    const data = await res.json();
    expect(data.data).toEqual([]);
  });

  it("returns 500 on database error", async () => {
    mockFindMany.mockRejectedValue(new Error("DB down"));

    const res = await GET_PENDING();
    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/admin/questions/[id]/validate", () => {
  it("returns 401 for non-admin", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "u1", role: "user" }, session: {} });

    const res = await PATCH_VALIDATE(
      new NextRequest("http://localhost", { method: "PATCH", body: JSON.stringify({ isValidated: true }) }),
      ctx("q1"),
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 on validation error", async () => {
    mockValidateBody.mockReturnValue({
      parsed: null,
      error: NextResponse.json({ message: "Invalid" }, { status: 400 }),
    });

    const res = await PATCH_VALIDATE(
      new NextRequest("http://localhost", { method: "PATCH", body: JSON.stringify({}) }),
      ctx("q1"),
    );
    expect(res.status).toBe(400);
  });

  it("approves a question", async () => {
    mockValidateBody.mockReturnValue({
      parsed: { isValidated: true, score: 100, typeId: "t1" },
      error: null,
    });
    mockUpdate.mockResolvedValue({});

    const res = await PATCH_VALIDATE(
      new NextRequest("http://localhost", { method: "PATCH", body: JSON.stringify({ isValidated: true, score: 100, typeId: "t1" }) }),
      ctx("q1"),
    );
    const data = await res.json();
    expect(data.message).toContain("approved");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "q1" },
        data: expect.objectContaining({ isValidated: true, Score: 100, typeId: "t1" }),
      }),
    );
  });

  it("rejects a question", async () => {
    mockValidateBody.mockReturnValue({
      parsed: { isValidated: false },
      error: null,
    });
    mockUpdate.mockResolvedValue({});

    const res = await PATCH_VALIDATE(
      new NextRequest("http://localhost", { method: "PATCH", body: JSON.stringify({ isValidated: false }) }),
      ctx("q1"),
    );
    const data = await res.json();
    expect(data.message).toContain("rejected");
  });
});
