import { describe, it, expect, vi } from "vitest";

const mockFindMany = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: { type: { findMany: mockFindMany } },
}));

import { GET } from "@/app/api/types/route";

describe("GET /api/types", () => {
  it("returns all question types", async () => {
    const types = [
      { id: "1", name: "JavaScript" },
      { id: "2", name: "Python" },
    ];
    mockFindMany.mockResolvedValue(types);

    const res = await GET();
    const data = await res.json();
    expect(data.data).toEqual(types);
  });

  it("returns empty array when no types exist", async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await GET();
    const data = await res.json();
    expect(data.data).toEqual([]);
  });
});
