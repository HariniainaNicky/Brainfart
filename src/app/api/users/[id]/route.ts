import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyOwnership } from "@/lib/auth-utils";

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

    const { score } = await req.json();

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        highestScore: user.highestScore + score,
      },
    });

    return NextResponse.json(
      {
        data: updatedUser,
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

