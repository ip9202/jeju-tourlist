-- AddColumn acceptedAnswerId
ALTER TABLE "questions" ADD COLUMN "acceptedAnswerId" TEXT;

-- AddColumn attachments (if not already added)
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add unique constraint on acceptedAnswerId
ALTER TABLE "questions" ADD CONSTRAINT "questions_acceptedAnswerId_key" UNIQUE ("acceptedAnswerId");
