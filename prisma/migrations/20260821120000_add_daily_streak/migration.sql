-- AlterTable
ALTER TABLE "User" ADD COLUMN     "streak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN     "lastDailyAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "daily_completion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "daily_completion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_completion_userId_date_key" ON "daily_completion"("userId", "date");

-- AddForeignKey
ALTER TABLE "daily_completion" ADD CONSTRAINT "daily_completion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
