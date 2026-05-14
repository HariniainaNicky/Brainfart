import { NextRequest, NextResponse } from "next/server";
import { run } from "@/services/code-runner";

export const POST = async (req: NextRequest) => {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }

    const result = await run(code, "index.js", "javascript");
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Execution failed: " + String(error) },
      { status: 500 },
    );
  }
};
