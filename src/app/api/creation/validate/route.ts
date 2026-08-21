import { auth } from "@/lib/auth";
import { callAI, parseJSON } from "@/lib/ai";
import { EVALUATE_PROMPT } from "@/lib/creation-prompts";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const description: string = (body.description || "").trim();
  if (!description || description.length < 5) {
    return NextResponse.json({ data: { matched: false, topic: "" } }, { status: 200 });
  }

  try {
    const raw = await callAI(EVALUATE_PROMPT(description));
    const parsed = parseJSON<{ matched: boolean; topic: string }>(raw, { matched: false, topic: "" });
    if (typeof parsed.matched !== "boolean" || typeof parsed.topic !== "string") {
      return NextResponse.json({ data: { matched: false, topic: "" } }, { status: 200 });
    }
    return NextResponse.json({ data: { matched: !!parsed.matched, topic: parsed.topic.trim() } }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "AI error" }, { status: 500 });
  }
};
