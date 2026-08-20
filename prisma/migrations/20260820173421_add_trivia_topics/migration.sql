-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "source" TEXT DEFAULT 'user';

-- AlterTable
ALTER TABLE "Type" ADD COLUMN     "apiCategoryId" INTEGER;
CREATE UNIQUE INDEX "Type_apiCategoryId_key" ON "Type"("apiCategoryId");