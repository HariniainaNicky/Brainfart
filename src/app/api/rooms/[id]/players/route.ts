import { auth } from "@/lib/auth";
import { insertUserInRoom } from "@/services/room";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyRoomOwnership } from "@/lib/auth-utils";

export const PUT = async (
  req: NextRequest,
  context: RouteContext<"/api/rooms/[id]/players">,
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const params = await context.params;
    const roomId: string = params.id;
    const targetUserId: string = data.userId;

    const authCheck = await verifyRoomOwnership(roomId);
    if (authCheck && session.user.id !== targetUserId) {
      return NextResponse.json(
        { message: "Forbidden: Only room owner can add other players" },
        { status: 403 },
      );
    }

    await insertUserInRoom(roomId, targetUserId);
    return NextResponse.json(
      {
        message: "User inserted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
