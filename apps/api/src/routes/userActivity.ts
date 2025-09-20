import { Router } from "express";
import { UserActivityController } from "../controllers/userActivityController";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

/**
 * 사용자 활동 라우터 생성 함수
 *
 * @description
 * - 사용자 활동 관련 API 엔드포인트를 정의
 * - 통계, 랭킹, 알림 등 사용자 활동 관리
 * - RESTful API 설계 원칙 준수
 *
 * @param prisma - Prisma 클라이언트 인스턴스
 * @returns Express 라우터
 */
export function createUserActivityRouter(prisma: PrismaClient): Router {
  const router = Router();
  const userActivityController = new UserActivityController(prisma);

  /**
   * @route GET /api/users/ranking
   * @desc 사용자 랭킹 조회
   * @access Public
   * @query { limit?: number, sortBy?: string }
   */
  router.get("/ranking", userActivityController.getUserRanking);

  /**
   * @route GET /api/users/:userId/stats
   * @desc 사용자 통계 조회
   * @access Public
   * @param { string } userId - 사용자 ID
   */
  router.get("/:userId/stats", userActivityController.getUserStats);

  /**
   * @route GET /api/users/:userId/activities
   * @desc 사용자 활동 이력 조회
   * @access Public
   * @param { string } userId - 사용자 ID
   * @query { page?: number, limit?: number }
   */
  router.get(
    "/:userId/activities",
    userActivityController.getUserActivityHistory
  );

  /**
   * @route POST /api/users/:userId/points
   * @desc 사용자 포인트 업데이트
   * @access Private (본인만)
   * @param { string } userId - 사용자 ID
   * @body { points: number, reason: string }
   */
  router.post(
    "/:userId/points",
    authMiddleware,
    userActivityController.updateUserPoints
  );

  /**
   * @route POST /api/users/:userId/level
   * @desc 사용자 레벨 업데이트
   * @access Private (본인만)
   * @param { string } userId - 사용자 ID
   */
  router.post(
    "/:userId/level",
    authMiddleware,
    userActivityController.updateUserLevel
  );

  /**
   * @route GET /api/users/:userId/notifications
   * @desc 사용자 알림 목록 조회
   * @access Private (본인만)
   * @param { string } userId - 사용자 ID
   * @query { page?: number, limit?: number }
   */
  router.get(
    "/:userId/notifications",
    authMiddleware,
    userActivityController.getUserNotifications
  );

  /**
   * @route PATCH /api/notifications/:notificationId/read
   * @desc 알림 읽음 처리
   * @access Private
   * @param { string } notificationId - 알림 ID
   */
  router.patch(
    "/notifications/:notificationId/read",
    authMiddleware,
    userActivityController.markNotificationAsRead
  );

  /**
   * @route PATCH /api/users/:userId/notifications/read-all
   * @desc 모든 알림 읽음 처리
   * @access Private (본인만)
   * @param { string } userId - 사용자 ID
   */
  router.patch(
    "/:userId/notifications/read-all",
    authMiddleware,
    userActivityController.markAllNotificationsAsRead
  );

  return router;
}
