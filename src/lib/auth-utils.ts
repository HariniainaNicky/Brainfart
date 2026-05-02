import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { Session } from "@/types/better-auth";

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "admin";
}

export async function verifyOwnership(
  targetUserId: string,
): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (isAdmin(session)) {
    return null;
  }
  if (session.user.id !== targetUserId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function verifyRoomAccess(
  roomId: string,
): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (isAdmin(session)) {
    return null;
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { openedById: true, players: { select: { id: true } } },
  });

  if (!room) {
    return NextResponse.json({ message: "Room not found" }, { status: 404 });
  }

  const isOwner = room.openedById === session.user.id;
  const isPlayer = room.players.some((p) => p.id === session.user.id);

  if (!isOwner && !isPlayer) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return null;
}

export async function verifyRoomOwnership(
  roomId: string,
): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (isAdmin(session)) {
    return null;
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { openedById: true },
  });

  if (!room) {
    return NextResponse.json({ message: "Room not found" }, { status: 404 });
  }

  if (room.openedById !== session.user.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return null;
}

export async function verifyNotificationOwnership(
  notificationId: string,
): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (isAdmin(session)) {
    return null;
  }

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { userId: true },
  });

  if (!notification) {
    return NextResponse.json({ message: "Notification not found" }, { status: 404 });
  }

  if (notification.userId !== session.user.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return null;
}