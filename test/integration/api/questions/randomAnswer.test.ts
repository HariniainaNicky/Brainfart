import { describe, it, expect, vi } from "vitest";

const mockQueryRaw = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: { $queryRaw: mockQueryRaw },
}));

import { GET } from "@/app/api/questions/randomAnswer/route";

describe("GET /api/questions/randomAnswer", () => {
  it("returns 3 random answers", async () => {
    const answers = [{ Answer: "42" }, { Answer: "foo" }, { Answer: "bar" }];
    mockQueryRaw.mockResolvedValue(answers);

    const res = await GET();
    const data = await res.json();
    expect(data.data).toEqual(answers);
  });

  it("returns empty array when no questions exist", async () => {
    mockQueryRaw.mockResolvedValue([]);

    const res = await GET();
    const data = await res.json();
    expect(data.data).toEqual([]);
  });

  it("returns 500 on database error", async () => {
    mockQueryRaw.mockRejectedValue(new Error("DB down"));

    const res = await GET();
    expect(res.status).toBe(500);
  });
});
