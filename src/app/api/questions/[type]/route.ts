import { prisma } from "@/lib/prisma";
import { importTriviaQuestions } from "@/lib/trivia";
import { NextRequest, NextResponse } from "next/server";

type RawQuestion = {
  [key: string]: unknown;
};

export const GET = async (req: NextRequest, context: RouteContext<"/api/questions/[type]">) => {

  try {
    const { type: rawType } = await context.params;
    const numberOfQuestionQueryNotFormatted=  req?.nextUrl?.searchParams?.get("numberOfQuestion") || "1";
    const numberOfQuestion = parseInt(numberOfQuestionQueryNotFormatted);

    const type =
      rawType === "null" || rawType === "undefined" || !rawType
        ? null
        : rawType;

    const fetchFromDb = async (): Promise<RawQuestion[]> => {
      if (type) {
        return prisma.$queryRaw`
          SELECT *
          FROM "public"."Question"
          WHERE "typeId" = ${type} AND "isValidated" = true
          ORDER BY RANDOM()
          LIMIT ${numberOfQuestion}
        `;
      }
      return prisma.$queryRaw`
        SELECT *
        FROM "public"."Question"
        WHERE "isValidated" = true
        ORDER BY RANDOM()
        LIMIT ${numberOfQuestion}
      `;
    };

    let questions = await fetchFromDb();

    if (questions.length < numberOfQuestion && type) {
      const shortfall = Math.min(numberOfQuestion - questions.length, 50);
      const imported = await importTriviaQuestions(type, shortfall);
      if (imported > 0) {
        questions = await fetchFromDb();
      }
    }

    return NextResponse.json({ data: questions }, { status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Something went wrong while fetching questions, please try again later " +
          error,
      },
      { status: 500 },
    );
  }
};