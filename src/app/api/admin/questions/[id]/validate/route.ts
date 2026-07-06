import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { validateBody, validateQuestionSchema } from "@/lib/validation";

export const PATCH = async (
    req: NextRequest,
    context: RouteContext<"/api/admin/questions/[id]/validate">,
) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id: questionId } = await context.params;
        const body = await req.json();
        const { parsed, error } = validateBody(validateQuestionSchema, body);
        if (error) return error;

        const updateData: { isValidated: boolean; Score?: number; typeId?: string } = {
            isValidated: parsed.isValidated,
        };

        if (parsed.score !== undefined) {
            updateData.Score = parsed.score;
        }

        if (parsed.typeId !== undefined) {
            updateData.typeId = parsed.typeId || null;
        }

        await prisma.question.update({
            where: {
                id: questionId,
            },
            data: updateData,
        });

        return NextResponse.json(
            { message: `Question ${isValidated ? "approved" : "rejected"} successfully` },
            { status: 200 },
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
