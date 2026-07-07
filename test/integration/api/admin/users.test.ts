import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockFindMany = vi.hoisted(() => vi.fn());
const mockCount = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
const mockValidateBody = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findMany: mockFindMany, count: mockCount, update: mockUpdate },
  },
}));

vi.mock("@/lib/validation", () => ({
  validateBody: mockValidateBody,
  updateRoleSchema: {},
  banUserSchema: {},
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Headers({ cookie: "mock" })),
}));

import { GET as GET_USERS } from "@/app/api/admin/users/route";
import { PATCH as PATCH_ROLE } from "@/app/api/admin/users/[id]/role/route";
import { PATCH as PATCH_BAN } from "@/app/api/admin/users/[id]/ban/route";

function req(url: string): NextRequest {
  return new NextRequest(url);
}

function jsonReq(body: unknown): NextRequest {
  return new NextRequest("http://localhost", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

const adminSession = { user: { id: "admin1", role: "admin" }, session: { id: "s1" } };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSession.mockResolvedValue(adminSession);
});

describe("GET /api/admin/users", () => {
  it("returns 401 for non-admin", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "u1", role: "user" }, session: {} });

    const res = await GET_USERS(req("http://localhost"));
    expect(res.status).toBe(401);
  });

  it("returns paginated users with default params", async () => {
    mockFindMany.mockResolvedValue([{ id: "u1", name: "Alice" }]);
    mockCount.mockResolvedValue(1);

    const res = await GET_USERS(req("http://localhost"));
    const data = await res.json();
    expect(data.data).toHaveLength(1);
    expect(data.pagination.total).toBe(1);
  });

  it("filters by search, role, and banned params", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await GET_USERS(req("http://localhost/api/admin/users?search=alice&role=user&banned=true"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.any(Array),
          role: "user",
          banned: true,
        }),
      }),
    );
  });
});

describe("PATCH /api/admin/users/[id]/role", () => {
  it("returns 401 for non-admin", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "u1", role: "user" }, session: {} });

    const res = await PATCH_ROLE(jsonReq({ role: "admin" }), ctx("u2"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when changing own role", async () => {
    mockValidateBody.mockReturnValue({
      parsed: { role: "user" },
      error: null,
    });
    const res = await PATCH_ROLE(jsonReq({ role: "user" }), ctx("admin1"));
    expect(res.status).toBe(400);
  });

  it("returns 400 on validation error", async () => {
    mockValidateBody.mockReturnValue({
      parsed: null,
      error: NextResponse.json({ message: "Invalid" }, { status: 400 }),
    });

    const res = await PATCH_ROLE(jsonReq({}), ctx("u2"));
    expect(res.status).toBe(400);
  });

  it("updates user role successfully", async () => {
    mockValidateBody.mockReturnValue({
      parsed: { role: "admin" },
      error: null,
    });
    mockUpdate.mockResolvedValue({});

    const res = await PATCH_ROLE(jsonReq({ role: "admin" }), ctx("u2"));
    const data = await res.json();
    expect(data.message).toContain("admin");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "u2" }, data: { role: "admin" } }),
    );
  });
});

describe("PATCH /api/admin/users/[id]/ban", () => {
  it("returns 401 for non-admin", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "u1", role: "user" }, session: {} });

    const res = await PATCH_BAN(jsonReq({ banned: true }), ctx("u2"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when banning self", async () => {
    mockValidateBody.mockReturnValue({
      parsed: { banned: true },
      error: null,
    });
    const res = await PATCH_BAN(jsonReq({ banned: true }), ctx("admin1"));
    expect(res.status).toBe(400);
  });

  it("returns 400 on validation error", async () => {
    mockValidateBody.mockReturnValue({
      parsed: null,
      error: NextResponse.json({ message: "Invalid" }, { status: 400 }),
    });

    const res = await PATCH_BAN(jsonReq({}), ctx("u2"));
    expect(res.status).toBe(400);
  });

  it("bans user with reason and expiry", async () => {
    mockValidateBody.mockReturnValue({
      parsed: { banned: true, reason: "Spam", expiresAt: "2027-01-01" },
      error: null,
    });
    mockUpdate.mockResolvedValue({});

    const res = await PATCH_BAN(jsonReq({ banned: true, reason: "Spam", expiresAt: "2027-01-01" }), ctx("u2"));
    const data = await res.json();
    expect(data.message).toBe("User banned successfully");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ banned: true, banReason: "Spam", banExpires: "2027-01-01" }),
      }),
    );
  });

  it("unbans user clearing reason and expiry", async () => {
    mockValidateBody.mockReturnValue({
      parsed: { banned: false },
      error: null,
    });
    mockUpdate.mockResolvedValue({});

    const res = await PATCH_BAN(jsonReq({ banned: false }), ctx("u2"));
    const data = await res.json();
    expect(data.message).toBe("User unbanned successfully");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ banned: false, banReason: null, banExpires: null }),
      }),
    );
  });
});
