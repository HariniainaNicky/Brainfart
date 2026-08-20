import { auth } from "@/lib/auth";
import { importTriviaQuestions, syncTriviaCategories } from "@/lib/trivia";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json().catch(() => ({}));
        const categoryId: string | undefined = body.categoryId;
        const amount = Math.min(Math.max(parseInt(body.amount) || 50, 1), 50);

        const categories = await syncTriviaCategories();

        let imported = 0;
        if (categoryId) {
            imported = await importTriviaQuestions(categoryId, amount);
        }

        return NextResponse.json(
            { data: { categories, imported } },
            { status: 200 },
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};