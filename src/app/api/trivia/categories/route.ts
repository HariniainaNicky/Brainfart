import { syncTriviaCategories } from "@/lib/trivia";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const categories = await syncTriviaCategories();
    return NextResponse.json({ data: categories }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
