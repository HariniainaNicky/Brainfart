import { prisma } from "@/lib/prisma";
import { syncTriviaCategories } from "@/lib/trivia";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const cached = await prisma.type.findMany({
      where: { apiCategoryId: { not: null } },
      select: { id: true, name: true, apiCategoryId: true },
      orderBy: { name: "asc" },
    });

    if (cached.length >= 12) {
      const data = cached.map((c) => ({
        id: c.id,
        name: c.name,
        apiCategoryId: c.apiCategoryId as number,
      }));
      return NextResponse.json({ data }, {
        status: 200,
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
      });
    }

    const categories = await syncTriviaCategories();
    return NextResponse.json({ data: categories }, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
