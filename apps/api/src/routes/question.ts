import { Router } from "express";
import { QuestionController } from "../controllers/questionController";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

/**
 * 질문 라우터 생성 함수
 *
 * @description
 * - 질문 관련 API 엔드포인트를 정의
 * - 인증 미들웨어 적용
 * - RESTful API 설계 원칙 준수
 *
 * @param prisma - Prisma 클라이언트 인스턴스
 * @returns Express 라우터
 */
export function createQuestionRouter(prisma: PrismaClient): Router {
  const router = Router();
  const questionController = new QuestionController(prisma);

  /**
   * @route POST /api/questions
   * @desc 질문 생성
   * @access Private
   * @body { title: string, content: string, categoryId?: string, tags?: string[], location?: string, latitude?: number, longitude?: number }
   */
  router.post("/", authMiddleware, questionController.createQuestion);

  /**
   * @route GET /api/questions
   * @desc 질문 목록 조회 (검색, 필터링, 페이지네이션 지원)
   * @access Public
   * @query { page?: number, limit?: number, query?: string, categoryId?: string, tags?: string, location?: string, status?: string, isResolved?: boolean, isPinned?: boolean, authorId?: string, dateFrom?: string, dateTo?: string, sortBy?: string, sortOrder?: string }
   */
  router.get("/", questionController.getQuestions);

  /**
   * @route GET /api/questions/popular
   * @desc 인기 질문 조회 (조회수 기준)
   * @access Public
   * @query { limit?: number }
   */
  router.get("/popular", questionController.getPopularQuestions);

  /**
   * @route GET /api/questions/:id
   * @desc 질문 상세 조회
   * @access Public
   * @param { string } id - 질문 ID
   * @query { incrementView?: boolean }
   */
  router.get("/:id", questionController.getQuestionById);

  /**
   * @route PUT /api/questions/:id
   * @desc 질문 수정
   * @access Private (작성자만)
   * @param { string } id - 질문 ID
   * @body { title?: string, content?: string, categoryId?: string, tags?: string[], location?: string, latitude?: number, longitude?: number, status?: string, isResolved?: boolean, isPinned?: boolean }
   */
  router.put("/:id", authMiddleware, questionController.updateQuestion);

  /**
   * @route DELETE /api/questions/:id
   * @desc 질문 삭제 (소프트 삭제)
   * @access Private (작성자만)
   * @param { string } id - 질문 ID
   */
  router.delete("/:id", authMiddleware, questionController.deleteQuestion);

  /**
   * @route POST /api/questions/:id/like
   * @desc 질문 좋아요 토글
   * @access Private
   * @param { string } id - 질문 ID
   */
  router.post(
    "/:id/like",
    authMiddleware,
    questionController.toggleQuestionLike
  );

  /**
   * @route POST /api/questions/:id/bookmark
   * @desc 질문 북마크 토글
   * @access Private
   * @param { string } id - 질문 ID
   */
  router.post(
    "/:id/bookmark",
    authMiddleware,
    questionController.toggleQuestionBookmark
  );

  /**
   * @route PATCH /api/questions/:id/resolve
   * @desc 질문 해결 상태 변경
   * @access Private (작성자만)
   * @param { string } id - 질문 ID
   * @body { isResolved: boolean }
   */
  router.patch(
    "/:id/resolve",
    authMiddleware,
    questionController.updateQuestionResolvedStatus
  );

  return router;
}
