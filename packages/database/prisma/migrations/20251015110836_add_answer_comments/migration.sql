-- CreateEnum
CREATE TYPE "AnswerCommentStatus" AS ENUM ('ACTIVE', 'DELETED', 'HIDDEN');

-- CreateTable
CREATE TABLE "answer_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "parentId" TEXT,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "status" "AnswerCommentStatus" NOT NULL DEFAULT 'ACTIVE',
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answer_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer_comment_likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "isLike" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answer_comment_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "answer_comments_authorId_idx" ON "answer_comments"("authorId");

-- CreateIndex
CREATE INDEX "answer_comments_answerId_idx" ON "answer_comments"("answerId");

-- CreateIndex
CREATE INDEX "answer_comments_parentId_idx" ON "answer_comments"("parentId");

-- CreateIndex
CREATE INDEX "answer_comments_status_idx" ON "answer_comments"("status");

-- CreateIndex
CREATE INDEX "answer_comments_createdAt_idx" ON "answer_comments"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "answer_comment_likes_userId_commentId_key" ON "answer_comment_likes"("userId", "commentId");

-- AddForeignKey
ALTER TABLE "answer_comments" ADD CONSTRAINT "answer_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_comments" ADD CONSTRAINT "answer_comments_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_comments" ADD CONSTRAINT "answer_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "answer_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_comment_likes" ADD CONSTRAINT "answer_comment_likes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "answer_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_comment_likes" ADD CONSTRAINT "answer_comment_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
