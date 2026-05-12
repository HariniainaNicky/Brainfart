-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "questionCount" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "questionTypeId" TEXT;
