import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockFindMany = vi.hoisted(() => vi.fn());
const mockCount = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    room: { findMany: mockFindMany, count: mockCount },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Headers({ cookie: "mock" })),
}));

import { GET } from "@/app/api/admin/rooms/route";

function req(url: string): NextRequest {
  return new NextRequest(url);
}

const adminSession = { user: { id: "admin1", role: "admin" }, session: { id: "s1" } };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSession.mockResolvedValue(adminSession);
});

describe("GET /api/admin/rooms", () => {
  it("returns 401 for non-admin", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "u1", role: "user" }, session: {} });

    const res = await GET(req("http://localhost"));
    expect(res.status).toBe(401);
  });

  it("returns paginated rooms with default params", async () => {
    mockFindMany.mockResolvedValue([{ id: "r1", title: "Room 1", openedBy: { id: "u1", name: "Alice" } }]);
    mockCount.mockResolvedValue(1);

    const res = await GET(req("http://localhost"));
    const data = await res.json();
    expect(data.data).toHaveLength(1);
    expect(data.pagination).toMatchObject({ page: 1, limit: 20, total: 1, totalPages: 1 });
  });

  it("filters by search query", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await GET(req("http://localhost/api/admin/rooms?search=quiz&page=2&limit=10"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { title: { contains: "quiz", mode: "insensitive" } },
        skip: 10,
        take: 10,
      }),
    );
  });

  it("returns 500 on database error", async () => {
    mockFindMany.mockRejectedValue(new Error("DB down"));

    const res = await GET(req("http://localhost"));
    expect(res.status).toBe(500);
  });
});
