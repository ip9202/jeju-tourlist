import { Router } from "express";
import { AnswerController } from "../controllers/answerController";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

/**
 * 답변 라우터 생성 함수
 *
 * @description
 * - 답변 관련 API 엔드포인트를 정의
 * - 인증 미들웨어 적용
 * - RESTful API 설계 원칙 준수
 *
 * @param prisma - Prisma 클라이언트 인스턴스
 * @returns Express 라우터
 */
export function createAnswerRouter(prisma: PrismaClient): Router {
  const router = Router();
  const answerController = new AnswerController(prisma);

  /**
   * @route POST /api/answers
   * @desc 답변 생성
   * @access Private
   * @body { content: string, questionId: string }
   */
  router.post("/", authMiddleware, answerController.createAnswer);

  /**
   * @route GET /api/answers/:id
   * @desc 답변 상세 조회
   * @access Public
   * @param { string } id - 답변 ID
   */
  router.get("/:id", answerController.getAnswerById);

  /**
   * @route GET /api/questions/:questionId/answers
   * @desc 질문별 답변 목록 조회
   * @access Public
   * @param { string } questionId - 질문 ID
   * @query { page?: number, limit?: number, status?: string, sortBy?: string, sortOrder?: string }
   */
  router.get(
    "/questions/:questionId/answers",
    answerController.getAnswersByQuestionId
  );

  /**
   * @route GET /api/users/:userId/answers
   * @desc 사용자별 답변 목록 조회
   * @access Public
   * @param { string } userId - 사용자 ID
   * @query { page?: number, limit?: number, status?: string, sortBy?: string, sortOrder?: string }
   */
  router.get("/users/:userId/answers", answerController.getAnswersByAuthorId);

  /**
   * @route PUT /api/answers/:id
   * @desc 답변 수정
   * @access Private (작성자만)
   * @param { string } id - 답변 ID
   * @body { content?: string, status?: string, isAccepted?: boolean }
   */
  router.put("/:id", authMiddleware, answerController.updateAnswer);

  /**
   * @route DELETE /api/answers/:id
   * @desc 답변 삭제 (소프트 삭제)
   * @access Private (작성자만)
   * @param { string } id - 답변 ID
   */
  router.delete("/:id", authMiddleware, answerController.deleteAnswer);

  /**
   * @route POST /api/answers/:id/reaction
   * @desc 답변 좋아요/싫어요 토글
   * @access Private
   * @param { string } id - 답변 ID
   * @body { isLike: boolean }
   */
  router.post(
    "/:id/reaction",
    authMiddleware,
    answerController.toggleAnswerReaction
  );

  /**
   * @route POST /api/answers/:id/accept
   * @desc 답변 채택
   * @access Private (질문 작성자만)
   * @param { string } id - 답변 ID
   * @body { questionId: string }
   */
  router.post("/:id/accept", authMiddleware, answerController.acceptAnswer);

  /**
   * @route DELETE /api/answers/:id/accept
   * @desc 답변 채택 해제
   * @access Private (질문 작성자만)
   * @param { string } id - 답변 ID
   * @body { questionId: string }
   */
  router.delete("/:id/accept", authMiddleware, answerController.unacceptAnswer);

  /**
   * @route GET /api/answers/:id/stats
   * @desc 답변 통계 조회
   * @access Public
   * @param { string } id - 답변 ID
   */
  router.get("/:id/stats", answerController.getAnswerStats);

  return router;
}
