/**
 * 배치 스케줄러 API 라우터
 *
 * @description
 * - 배치 작업 관리 API 엔드포인트 정의
 * - 관리자 권한 검증
 * - Cron Job 모니터링 및 제어
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { BatchSchedulerController } from "../controllers/batch-scheduler.controller";

/**
 * 배치 스케줄러 라우터 생성
 *
 * @param prisma - Prisma 클라이언트
 * @returns Express 라우터
 */
export function createBatchSchedulerRouter(prisma: PrismaClient): Router {
  const router = Router();
  const controller = new BatchSchedulerController(prisma);

  // 인증 미들웨어 (실제 구현에서는 JWT 검증 미들웨어 사용)
  const authenticateUser = (req: any, res: any, next: any) => {
    // TODO: 실제 JWT 토큰 검증 로직 구현
    // 현재는 테스트용으로 임시 사용자 설정
    req.user = {
      id: "test-admin-id",
      isAdmin: true,
    };
    next();
  };

  // 관리자 권한 미들웨어
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "관리자 권한이 필요합니다.",
      });
    }
    next();
  };

  /**
   * @route GET /api/batch/status
   * @desc 배치 작업 상태 조회
   * @access Public
   */
  router.get("/status", controller.getStatus);

  /**
   * @route GET /api/batch/stats
   * @desc 배치 작업 통계 조회
   * @access Public
   */
  router.get("/stats", controller.getBatchStats);

  /**
   * @route PUT /api/batch/config
   * @desc 배치 작업 설정 업데이트
   * @access Private (관리자만)
   * @body { enabled, schedule, maxConcurrentUsers, retryAttempts, retryDelay, notificationEnabled, logLevel }
   */
  router.put(
    "/config",
    authenticateUser,
    requireAdmin,
    controller.updateConfig
  );

  /**
   * @route POST /api/batch/run
   * @desc 배치 작업 수동 실행
   * @access Private (관리자만)
   */
  router.post(
    "/run",
    authenticateUser,
    requireAdmin,
    controller.runManualBatch
  );

  /**
   * @route POST /api/batch/stop
   * @desc 배치 작업 중단
   * @access Private (관리자만)
   */
  router.post("/stop", authenticateUser, requireAdmin, controller.stopBatch);

  /**
   * @route GET /api/batch/logs
   * @desc 배치 작업 로그 조회
   * @access Private (관리자만)
   * @query { startDate?, endDate?, limit? }
   */
  router.get("/logs", authenticateUser, requireAdmin, controller.getBatchLogs);

  return router;
}

/**
 * 기본 배치 스케줄러 라우터 (Prisma 클라이언트 자동 주입)
 */
export const batchSchedulerRouter = createBatchSchedulerRouter(
  new PrismaClient()
);
