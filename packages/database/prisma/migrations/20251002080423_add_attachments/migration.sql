-- AlterTable
ALTER TABLE "Question" ADD COLUMN "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[];
