-- Make providerId nullable to support email-based authentication
ALTER TABLE "users" ALTER COLUMN "providerId" DROP NOT NULL;
