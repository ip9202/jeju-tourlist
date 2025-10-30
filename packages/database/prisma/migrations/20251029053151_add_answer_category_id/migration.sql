-- AlterTable
ALTER TABLE "answers" ADD COLUMN     "categoryId" TEXT;

-- CreateIndex
CREATE INDEX "answers_categoryId_idx" ON "answers"("categoryId");

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
