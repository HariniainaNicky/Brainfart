import { auth } from "@/lib/auth";
import { quitRoom } from "@/services/room";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { verifyRoomOwnership } from "@/lib/auth-utils";

export const PUT = async (req: Request, context: RouteContext<"/api/rooms/[id]/players/[userId]">) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await context.params;
    const roomId: string = params.id;
    const targetUserId: string = params.userId;

    const isRoomOwner = !(await verifyRoomOwnership(roomId));
    const isRemovingSelf = targetUserId === session.user.id;

    if (!isRoomOwner && !isRemovingSelf) {
      return NextResponse.json(
        { message: "Forbidden: You can only remove yourself or be removed by room owner" },
        { status: 403 },
      );
    }

    await quitRoom(roomId, targetUserId);
    return NextResponse.json(
      {
        message: "User removed successfully",
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
