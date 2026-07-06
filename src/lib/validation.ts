import { z } from "zod";
import { NextResponse } from "next/server";

type ValidationResult<T> =
  | { parsed: T; error: null }
  | { parsed: null; error: NextResponse };

export function validateBody<T>(
  schema: z.ZodType<T>,
  data: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      parsed: null,
      error: NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 },
      ),
    };
  }
  return { parsed: result.data, error: null };
}

export const createQuestionSchema = z.object({
  question: z.string().min(1).max(500),
  score: z.number().int().min(0).max(9999),
  isValidated: z.boolean(),
  answer: z.string().min(1).max(500),
  userId: z.string().min(1),
});

export const createNotificationSchema = z.object({
  userId: z.string().min(1),
  header: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
});

export const updateNotificationSchema = z.object({
  seen: z.boolean(),
});

export const updateScoreSchema = z.object({
  score: z.number().int().min(0).max(1000),
});

export const updateImageSchema = z.object({
  image: z.string().url().max(2000),
});

export const createRoomSchema = z.object({
  title: z.string().min(1).max(200),
  questionTypeId: z.string().nullable(),
  questionCount: z.number().int().min(1).max(100),
  chronoTiming: z.number().int().min(5).max(300),
});

export const addPlayerSchema = z.object({
  userId: z.string().min(1),
});

export const upsertScoreSchema = z.object({
  userId: z.string().min(1),
  score: z.number().int().min(0).max(1000),
  finished: z.boolean(),
});

export const validateQuestionSchema = z.object({
  isValidated: z.boolean(),
  score: z.number().int().min(0).max(9999).optional(),
  typeId: z.string().optional(),
});

export const updateRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
});

export const banUserSchema = z.object({
  banned: z.boolean(),
  reason: z.string().max(500).optional(),
  expiresAt: z.string().optional(),
});

export const deleteRoomSchema = z.object({
  reason: z.string().min(1).max(500),
});
