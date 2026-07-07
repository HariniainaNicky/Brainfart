import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockFindMany = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findMany: mockFindMany } },
}));

import { GET } from "@/app/api/users/route";

function req(url: string): NextRequest {
  return new NextRequest(url);
}

beforeEach(() => {
  mockFindMany.mockReset();
});

describe("GET /api/users", () => {
  it("lists users sorted by createdAt asc by default", async () => {
    mockFindMany.mockResolvedValue([{ id: "u1", name: "Alice" }]);

    const res = await GET(req("http://localhost/api/users"));
    const data = await res.json();
    expect(data.data).toHaveLength(1);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "asc" },
        where: { rank: { gt: 0 } },
      }),
    );
  });

  it("filters by all allowed criteria values", async () => {
    for (const criteria of ["username", "email", "createdAt", "rank", "highestScore"]) {
      mockFindMany.mockResolvedValue([]);
      await GET(req(`http://localhost/api/users?criteria=${criteria}`));
      expect(mockFindMany).toHaveBeenLastCalledWith(
        expect.objectContaining({ orderBy: { [criteria]: "asc" } }),
      );
    }
  });

  it("falls back to createdAt for invalid criteria", async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(req("http://localhost/api/users?criteria=invalid"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: "asc" } }),
    );
  });

  it("returns 500 on database error", async () => {
    mockFindMany.mockRejectedValue(new Error("DB down"));

    const res = await GET(req("http://localhost/api/users"));
    expect(res.status).toBe(500);
  });
});
