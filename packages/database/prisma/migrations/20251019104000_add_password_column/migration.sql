-- AddColumn password
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password" TEXT;
