import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";
import { validateBody, deleteRoomSchema } from "@/lib/validation";

export const DELETE = async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { parsed, error } = validateBody(deleteRoomSchema, body);
        if (error) return error;

        const { reason } = parsed;

        const room = await prisma.room.findUnique({
            where: { id },
            include: {
                openedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!room) {
            return NextResponse.json(
                { message: "Room not found" },
                { status: 404 },
            );
        }

        await prisma.room.delete({
            where: { id },
        });

        await prisma.notification.create({
            data: {
                id: v4(),
                userId: room.openedBy.id,
                header: "Room Deleted",
                body: `Your room "${room.title}" has been deleted by an admin. Reason: ${reason}`,
                seen: false,
                isDeleted: false,
            },
        });

        return NextResponse.json(
            { message: "Room deleted successfully" },
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
