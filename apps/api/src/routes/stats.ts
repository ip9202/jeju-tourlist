import { Router } from "express";
import { StatsController } from "../controllers/statsController";
import { PrismaClient } from "@prisma/client";

/**
 * 통계 라우터 생성 함수
 *
 * @description
 * - 통계 관련 API 엔드포인트를 정의
 * - RESTful API 설계 원칙 준수
 * - 공개 API (인증 불필요)
 */
export function createStatsRouter(prisma: PrismaClient): Router {
  const router = Router();
  const statsController = new StatsController(prisma);

  /**
   * @route GET /api/stats
   * @description 전체 시스템 통계 조회
   * @access Public
   */
  router.get("/", statsController.getSystemStats);

  /**
   * @route GET /api/stats/realtime-questions
   * @description 실시간 질문 조회
   * @access Public
   */
  router.get("/realtime-questions", statsController.getRealtimeQuestions);

  return router;
}
