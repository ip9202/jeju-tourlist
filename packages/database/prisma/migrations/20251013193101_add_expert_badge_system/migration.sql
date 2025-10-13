-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('CATEGORY_EXPERT', 'ACTIVITY_LEVEL', 'LOCATION_BASED', 'SOCIAL_VERIFIED', 'OFFICIAL_VERIFIED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'BADGE_PROGRESS';

-- AlterTable
ALTER TABLE "answers" ADD COLUMN "adoptedAt" TIMESTAMP(3),
ADD COLUMN "expertPoints" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "adoptedAnswers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "adoptRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "totalAnswers" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "user_badges" CASCADE;

-- DropTable
DROP TABLE "badges" CASCADE;

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "BadgeType" NOT NULL,
    "category" TEXT,
    "requiredAnswers" INTEGER NOT NULL,
    "requiredAdoptRate" DOUBLE PRECISION,
    "bonusPoints" INTEGER NOT NULL,
    "adoptBonusPoints" INTEGER,
    "requiresGpsAuth" BOOLEAN NOT NULL DEFAULT false,
    "requiresSocialAuth" BOOLEAN NOT NULL DEFAULT false,
    "requiresDocAuth" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");

-- CreateIndex
CREATE INDEX "badges_type_idx" ON "badges"("type");

-- CreateIndex
CREATE INDEX "badges_category_idx" ON "badges"("category");

-- CreateIndex
CREATE INDEX "badges_isActive_idx" ON "badges"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

-- CreateIndex
CREATE INDEX "user_badges_userId_idx" ON "user_badges"("userId");

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
