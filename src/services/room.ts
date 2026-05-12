import { prisma } from "@/lib/prisma";
import { v4 } from "uuid";
import { RoomDto } from "@/types/dto";

export const createRoom = async (data: RoomDto, userId: string) => {
  const roomId = v4();

  await prisma.room.create({
    data: {
      id: roomId,
      title: data.title,
      chronoTiming: data.chronoTiming,
      questionTypeId: data.questionTypeId,
      questionCount: data.questionCount,
      openedById: userId,
      players: {
        connect: [{ id: userId }],
      },
    },
  });
};

export const getRoomById = async (roomId: string) => {
  const room = await prisma.room.findUnique({
    where: {
      id: roomId,
    },
    include: {
      openedBy: true,
      questions: true,
      winner: true,
      players: true,
    },
  });

  return room;
};

export const insertUserInRoom = async (roomId: string, userId: string) => {
  await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      players: {
        connect: [{ id: userId }],
      },
    },
  });
};

export const quitRoom = async (roomId: string, userId: string) => {
  await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      players: {
        disconnect: [{ id: userId }],
      },
    },
  });
};

export const deleteRoom = async (roomId: string) => {
  await prisma.room.delete({
    where: {
      id: roomId,
    },
  });
};

