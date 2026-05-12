import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getRoomScores, upsertScore } from "@/services/score";

export const GET = async (
  _req: NextRequest,
  context: RouteContext<"/api/rooms/[id]/scores">,
) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: roomId } = await context.params;
    const scores = await getRoomScores(roomId);
    return NextResponse.json({ data: scores }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" + error },
      { status: 500 },
    );
  }
};

export const PATCH = async (
  req: NextRequest,
  context: RouteContext<"/api/rooms/[id]/scores">,
) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: roomId } = await context.params;
    const { userId, score, finished } = await req.json();

    if (session.user.id !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await upsertScore(roomId, userId, score, finished);
    return NextResponse.json({ message: "Score updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" + error },
      { status: 500 },
    );
  }
};
