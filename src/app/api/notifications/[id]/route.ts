import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getSession, verifyNotificationOwnership } from "@/lib/auth-utils";
import { validateBody, updateNotificationSchema } from "@/lib/validation";

export const PATCH = async (
    req: NextRequest,
    context: RouteContext<"/api/notifications/[id]">,
) => {
    const session = getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: notificationId } = await context.params;
    const authCheck = await verifyNotificationOwnership(notificationId);
    if (authCheck) return authCheck;

    const body = await req.json();
        const { parsed, error } = validateBody(updateNotificationSchema, body);
        if (error) return error;

        await prisma.notification.update({
            where: {
                id: notificationId,
            },
            data: parsed,
        });

        return NextResponse.json(
            {
                message: "Notification updated successfully",
            },
            {
                status: 200,
            },
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

export const DELETE = async (
    req: NextRequest,
    context: RouteContext<"/api/notifications/[id]">,
) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: notificationId } = await context.params;
    const authCheck = await verifyNotificationOwnership(notificationId);
    if (authCheck) return authCheck;

    await prisma.notification.update({
            where: {
                id: notificationId,
            },
            data: { isDeleted: true },
        });
        return NextResponse.json(
            {
                message: "Notification deleted successfully",
            },
            {
                status: 200,
            },
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
