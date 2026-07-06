import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";
import { validateBody, createNotificationSchema } from "@/lib/validation";

export const POST = async (req: NextRequest) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const bodyData = await req.json();
        const { parsed, error } = validateBody(createNotificationSchema, bodyData);
        if (error) return error;

        const { userId, header, body } = parsed;

        const notification = await prisma.notification.create({
            data: {
                id: v4(),
                userId,
                header,
                body,
                seen: false,
                isDeleted: false,
            },
        });

        return NextResponse.json(
            {
                message: "Notification created successfully",
                notification,
            },
            { status: 201 },
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 },
        );
    }
};
