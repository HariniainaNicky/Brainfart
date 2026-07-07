import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

const mockQueryRaw = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: { $queryRaw: mockQueryRaw },
}));

import { GET } from "@/app/api/questions/[type]/route";

function createRequest(url: string): NextRequest {
  return new NextRequest(url);
}

function createContext(type: string) {
  return { params: Promise.resolve({ type }) };
}

describe("GET /api/questions/[type]", () => {
  it("returns questions for a valid type", async () => {
    const questions = [{ id: "1", question: "What is JS?", typeId: "js" }];
    mockQueryRaw.mockResolvedValue(questions);

    const res = await GET(createRequest("http://localhost/api/questions/js"), createContext("js"));
    const data = await res.json();
    expect(data.data).toEqual(questions);
  });

  it("returns questions for all types when type is null", async () => {
    const questions = [{ id: "1", question: "What is JS?" }];
    mockQueryRaw.mockResolvedValue(questions);

    const res = await GET(
      createRequest("http://localhost/api/questions/null"),
      createContext("null"),
    );
    const data = await res.json();
    expect(data.data).toEqual(questions);
  });

  it("returns questions for all types when type is undefined", async () => {
    const questions = [{ id: "1", question: "What is JS?" }];
    mockQueryRaw.mockResolvedValue(questions);

    const res = await GET(
      createRequest("http://localhost/api/questions/undefined"),
      createContext("undefined"),
    );
    const data = await res.json();
    expect(data.data).toEqual(questions);
  });

  it("respects numberOfQuestion query param", async () => {
    const questions = [{ id: "1", question: "Q1?" }];
    mockQueryRaw.mockResolvedValue(questions);

    const res = await GET(
      createRequest("http://localhost/api/questions/js?numberOfQuestion=1"),
      createContext("js"),
    );
    const data = await res.json();
    expect(data.data).toEqual(questions);
  });

  it("returns 500 on database error", async () => {
    mockQueryRaw.mockRejectedValue(new Error("DB down"));

    const res = await GET(createRequest("http://localhost/api/questions/js"), createContext("js"));
    expect(res.status).toBe(500);
  });
});
