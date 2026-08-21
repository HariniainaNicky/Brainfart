import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyOwnership } from "@/lib/auth-utils";
import { validateBody, updateScoreSchema } from "@/lib/validation";
import { updateUserRank } from "@/services/user";

export const GET = async (
  _req: NextRequest,
  context: RouteContext<"/api/users/[id]">,
) => {
  try {
    const { id: userId } = await context.params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const isOwner = session?.user.id === userId;
    const isUserAdmin = session?.user.role === "admin";

    if (isOwner || isUserAdmin) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          accounts: true,
          sessions: true,
          openedRooms: true,
          wonRooms: true,
          joinedRooms: true,
          notifications: true,
        },
      });

      return NextResponse.json({ data: user }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        displayUsername: true,
        image: true,
        rank: true,
        highestScore: true,
        createdAt: true,
        joinedRooms: { select: { id: true, title: true, startDate: true, closed: true } },
        wonRooms: { select: { id: true, title: true } },
        openedRooms: { select: { id: true, title: true, startDate: true } },
      },
    });

    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};


export const PATCH = async (  req: NextRequest, context: RouteContext<"/api/users/[id]">) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: userId } = await context.params;
    const authCheck = await verifyOwnership(userId);
    if (authCheck) return authCheck;

    const body = await req.json();
    const { parsed, error } = validateBody(updateScoreSchema, body);
    if (error) return error;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const highestScore = Math.max(user.highestScore ?? 0, parsed.score);

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        highestScore,
      },
    });

    await updateUserRank();

    return NextResponse.json(
      {
        message: "Score updated",
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
};

