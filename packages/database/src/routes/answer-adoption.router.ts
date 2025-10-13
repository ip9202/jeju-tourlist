/**
 * 답변 채택 API 라우터
 *
 * @description
 * - 답변 채택 관련 API 엔드포인트 정의
 * - 인증 미들웨어 적용
 * - 라우트별 권한 검증
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { AnswerAdoptionController } from "../controllers/answer-adoption.controller";

/**
 * 답변 채택 라우터 생성
 *
 * @param prisma - Prisma 클라이언트
 * @returns Express 라우터
 */
export function createAnswerAdoptionRouter(prisma: PrismaClient): Router {
  const router = Router();
  const controller = new AnswerAdoptionController(prisma);

  // 인증 미들웨어 (실제 구현에서는 JWT 검증 미들웨어 사용)
  const authenticateUser = (req: any, res: any, next: any) => {
    // TODO: 실제 JWT 토큰 검증 로직 구현
    // 현재는 테스트용으로 임시 사용자 설정
    req.user = {
      id: "test-user-id",
      isAdmin: false,
    };
    next();
  };

  // 관리자 권한 미들웨어 (현재 사용하지 않음)
  // const requireAdmin = (req: any, res: any, next: any) => {
  //   if (!req.user?.isAdmin) {
  //     return res.status(403).json({
  //       success: false,
  //       message: "관리자 권한이 필요합니다.",
  //     });
  //   }
  //   next();
  // };

  /**
   * @route POST /api/answers/adopt
   * @desc 답변 채택
   * @access Private
   * @body { questionId: string, answerId: string }
   */
  router.post("/adopt", authenticateUser, controller.adoptAnswer);

  /**
   * @route DELETE /api/answers/:questionId/adopt
   * @desc 답변 채택 취소
   * @access Private (질문 작성자만)
   */
  router.delete("/:questionId/adopt", authenticateUser, controller.cancelAdoption);

  /**
   * @route GET /api/answers/:questionId/adoption-status
   * @desc 질문의 채택 상태 조회
   * @access Public
   */
  router.get("/:questionId/adoption-status", controller.getAdoptionStatus);

  /**
   * @route GET /api/answers/user/:userId/stats
   * @desc 사용자별 채택 통계 조회
   * @access Private (본인 또는 관리자)
   */
  router.get("/user/:userId/stats", authenticateUser, controller.getUserAdoptionStats);

  return router;
}

/**
 * 기본 답변 채택 라우터 (Prisma 클라이언트 자동 주입)
 */
export const answerAdoptionRouter = createAnswerAdoptionRouter(new PrismaClient());
