import { Router } from "express";
import { AnswerCommentController } from "../controllers/answerCommentController";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

/**
 * 답변 댓글 라우터 생성 함수
 *
 * @description
 * - 답변 댓글 관련 API 엔드포인트를 정의
 * - 인증 미들웨어 적용
 * - RESTful API 설계 원칙 준수
 *
 * @param prisma - Prisma 클라이언트 인스턴스
 * @returns Express 라우터
 */
export function createAnswerCommentRouter(prisma: PrismaClient): Router {
  const router = Router();
  const answerCommentController = new AnswerCommentController(prisma);

  /**
   * @route POST /api/answer-comments
   * @desc 답변 댓글 생성
   * @access Private
   * @body { content: string, answerId: string }
   */
  router.post("/", authMiddleware, answerCommentController.createComment);

  /**
   * @route GET /api/answer-comments/answer/:answerId
   * @desc 답변별 댓글 목록 조회
   * @access Public
   * @param { string } answerId - 답변 ID
   * @query { number } page - 페이지 번호 (기본값: 1)
   * @query { number } limit - 페이지당 항목 수 (기본값: 50)
   */
  router.get(
    "/answer/:answerId",
    answerCommentController.getCommentsByAnswerId
  );

  /**
   * @route GET /api/answer-comments/:id
   * @desc 답변 댓글 상세 조회
   * @access Public
   * @param { string } id - 답변 댓글 ID
   */
  router.get("/:id", answerCommentController.getCommentById);

  /**
   * @route PUT /api/answer-comments/:id
   * @desc 답변 댓글 수정
   * @access Private (작성자만)
   * @param { string } id - 답변 댓글 ID
   * @body { content?: string, status?: string }
   */
  router.put("/:id", authMiddleware, answerCommentController.updateComment);

  /**
   * @route DELETE /api/answer-comments/:id
   * @desc 답변 댓글 삭제 (소프트 삭제)
   * @access Private (작성자만)
   * @param { string } id - 답변 댓글 ID
   */
  router.delete("/:id", authMiddleware, answerCommentController.deleteComment);

  /**
   * @route POST /api/answer-comments/:id/reaction
   * @desc 답변 댓글 좋아요/싫어요
   * @access Private
   * @param { string } id - 답변 댓글 ID
   * @body { isLike: boolean }
   */
  router.post(
    "/:id/reaction",
    authMiddleware,
    answerCommentController.toggleReaction
  );

  return router;
}
