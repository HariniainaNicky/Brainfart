import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockFindUnique = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
const mockVerifyOwnership = vi.hoisted(() => vi.fn());
const mockValidateBody = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: mockFindUnique, update: mockUpdate } },
}));

vi.mock("@/lib/auth-utils", () => ({
  verifyOwnership: mockVerifyOwnership,
}));

vi.mock("@/lib/validation", () => ({
  validateBody: mockValidateBody,
  updateScoreSchema: {},
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Headers({ cookie: "mock" })),
}));

import { GET, PATCH } from "@/app/api/users/[id]/route";

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

function patchReq(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/users/u1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/users/[id]", () => {
  it("returns full profile for the owner", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "u1", role: "user" }, session: {} });
    mockFindUnique.mockResolvedValue({ id: "u1", name: "Alice", accounts: [], sessions: [] });

    const res = await GET(new NextRequest("http://localhost"), ctx("u1"));
    const data = await res.json();
    expect(data.data.accounts).toBeDefined();
    expect(data.data.sessions).toBeDefined();
  });

  it("returns full profile for admin", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "admin1", role: "admin" }, session: {} });
    mockFindUnique.mockResolvedValue({ id: "u1", name: "Alice", accounts: [], sessions: [] });

    const res = await GET(new NextRequest("http://localhost"), ctx("u1"));
    const data = await res.json();
    expect(data.data.accounts).toBeDefined();
  });

  it("returns limited public profile for other users", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "other", role: "user" }, session: {} });
    mockFindUnique.mockResolvedValue({ id: "u1", name: "Alice" });

    const res = await GET(new NextRequest("http://localhost"), ctx("u1"));
    const data = await res.json();
    expect(data.data.accounts).toBeUndefined();
    expect(data.data.name).toBe("Alice");
  });

  it("returns limited profile when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    mockFindUnique.mockResolvedValue({ id: "u1", name: "Alice" });

    const res = await GET(new NextRequest("http://localhost"), ctx("u1"));
    const data = await res.json();
    expect(data.data.accounts).toBeUndefined();
  });

  it("returns 500 on database error", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "u1", role: "user" }, session: {} });
    mockFindUnique.mockRejectedValue(new Error("DB down"));

    const res = await GET(new NextRequest("http://localhost"), ctx("u1"));
    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/users/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await PATCH(patchReq({ score: 100 }), ctx("u1"));
    expect(res.status).toBe(401);
  });

  it("returns 403 when not the owner", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "other" }, session: {} });
    mockVerifyOwnership.mockResolvedValue(
      NextResponse.json({ message: "Forbidden" }, { status: 403 }),
    );

    const res = await PATCH(patchReq({ score: 100 }), ctx("u1"));
    expect(res.status).toBe(403);
  });

  it("returns 400 on validation error", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "u1" }, session: {} });
    mockVerifyOwnership.mockResolvedValue(undefined);
    mockValidateBody.mockReturnValue({
      parsed: null,
      error: NextResponse.json({ message: "Invalid" }, { status: 400 }),
    });

    const res = await PATCH(patchReq({}), ctx("u1"));
    expect(res.status).toBe(400);
  });

  it("returns 404 when user not found", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "u1" }, session: {} });
    mockVerifyOwnership.mockResolvedValue(undefined);
    mockValidateBody.mockReturnValue({
      parsed: { score: 100 },
      error: null,
    });
    mockFindUnique.mockResolvedValue(null);

    const res = await PATCH(patchReq({ score: 100 }), ctx("u1"));
    expect(res.status).toBe(404);
  });

  it("updates highestScore successfully", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "u1" }, session: {} });
    mockVerifyOwnership.mockResolvedValue(undefined);
    mockValidateBody.mockReturnValue({
      parsed: { score: 200 },
      error: null,
    });
    mockFindUnique.mockResolvedValue({ id: "u1", highestScore: 100 });

    const res = await PATCH(patchReq({ score: 200 }), ctx("u1"));
    const data = await res.json();
    expect(data.message).toBe("Score updated");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u1" },
        data: { highestScore: 200 },
      }),
    );
  });
});
