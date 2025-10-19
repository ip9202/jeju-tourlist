-- AddColumn attachments
ALTER TABLE "questions" ADD COLUMN "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[];
