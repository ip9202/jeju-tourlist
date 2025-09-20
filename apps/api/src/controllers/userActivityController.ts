import { Request, Response } from "express";
import { UserActivityService } from "../services/user-activity/UserActivityService";
import { PrismaClient } from "@prisma/client";
import { ApiResponse, PaginatedResponse } from "../types";

/**
 * 사용자 활동 컨트롤러 클래스
 *
 * @description
 * - 사용자 활동 관련 HTTP 요청을 처리
 * - 통계, 랭킹, 알림 등 사용자 활동 관리
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 */
export class UserActivityController {
  private readonly userActivityService: UserActivityService;

  constructor(private readonly prisma: PrismaClient) {
    this.userActivityService = new UserActivityService(prisma);
  }

  /**
   * 사용자 통계 조회
   * GET /api/users/:userId/stats
   */
  getUserStats = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: "사용자 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const stats = await this.userActivityService.getUserStats(userId);

      const response: ApiResponse = {
        success: true,
        data: stats,
        message: "사용자 통계를 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message === "사용자를 찾을 수 없습니다."
          ? 404
          : 500;

      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "사용자 통계 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(statusCode).json(response);
    }
  };

  /**
   * 사용자 랭킹 조회
   * GET /api/users/ranking
   */
  getUserRanking = async (req: Request, res: Response) => {
    try {
      const { limit = 10, sortBy = "points" } = req.query;

      const ranking = await this.userActivityService.getUserRanking(
        Number(limit),
        sortBy as "points" | "questions" | "answers" | "likes"
      );

      const response: ApiResponse = {
        success: true,
        data: ranking,
        message: "사용자 랭킹을 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "사용자 랭킹 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 사용자 활동 이력 조회
   * GET /api/users/:userId/activities
   */
  getUserActivityHistory = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: "사용자 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const result = await this.userActivityService.getUserActivityHistory(
        userId,
        {
          page: Number(page),
          limit: Number(limit),
        }
      );

      const response: PaginatedResponse<(typeof result.activities)[0]> = {
        success: true,
        data: result.activities,
        pagination: result.pagination,
        message: "사용자 활동 이력을 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "사용자 활동 이력 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 사용자 포인트 업데이트
   * POST /api/users/:userId/points
   */
  updateUserPoints = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { points, reason } = req.body;
      const currentUserId = req.user?.id;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: "사용자 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      if (!currentUserId) {
        const response: ApiResponse = {
          success: false,
          error: "인증이 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(401).json(response);
      }

      // 본인만 포인트 조회 가능 (관리자는 예외)
      if (userId !== currentUserId) {
        const response: ApiResponse = {
          success: false,
          error: "본인의 포인트만 조회할 수 있습니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(403).json(response);
      }

      if (typeof points !== "number") {
        const response: ApiResponse = {
          success: false,
          error: "포인트는 숫자여야 합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      if (!reason || typeof reason !== "string") {
        const response: ApiResponse = {
          success: false,
          error: "포인트 변경 사유가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const newPoints = await this.userActivityService.updateUserPoints(
        userId,
        points,
        reason
      );

      const response: ApiResponse = {
        success: true,
        data: { points: newPoints },
        message: `포인트가 ${points > 0 ? "+" : ""}${points} 업데이트되었습니다.`,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "포인트 업데이트 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 사용자 레벨 업데이트
   * POST /api/users/:userId/level
   */
  updateUserLevel = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?.id;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: "사용자 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      if (!currentUserId) {
        const response: ApiResponse = {
          success: false,
          error: "인증이 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(401).json(response);
      }

      // 본인만 레벨 업데이트 가능
      if (userId !== currentUserId) {
        const response: ApiResponse = {
          success: false,
          error: "본인의 레벨만 업데이트할 수 있습니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(403).json(response);
      }

      const newLevel = await this.userActivityService.updateUserLevel(userId);

      const response: ApiResponse = {
        success: true,
        data: { level: newLevel },
        message: "사용자 레벨이 업데이트되었습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "레벨 업데이트 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 사용자 알림 목록 조회
   * GET /api/users/:userId/notifications
   */
  getUserNotifications = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const currentUserId = req.user?.id;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: "사용자 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      if (!currentUserId) {
        const response: ApiResponse = {
          success: false,
          error: "인증이 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(401).json(response);
      }

      // 본인만 알림 조회 가능
      if (userId !== currentUserId) {
        const response: ApiResponse = {
          success: false,
          error: "본인의 알림만 조회할 수 있습니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(403).json(response);
      }

      const result = await this.userActivityService.getUserNotifications(
        userId,
        {
          page: Number(page),
          limit: Number(limit),
        }
      );

      const response: PaginatedResponse<(typeof result.notifications)[0]> = {
        success: true,
        data: result.notifications,
        pagination: result.pagination,
        message: "알림 목록을 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알림 목록 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 알림 읽음 처리
   * PATCH /api/notifications/:notificationId/read
   */
  markNotificationAsRead = async (req: Request, res: Response) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.id;

      if (!notificationId) {
        const response: ApiResponse = {
          success: false,
          error: "알림 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: "인증이 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(401).json(response);
      }

      await this.userActivityService.markNotificationAsRead(
        notificationId,
        userId
      );

      const response: ApiResponse = {
        success: true,
        message: "알림이 읽음으로 표시되었습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알림 읽음 처리 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 모든 알림 읽음 처리
   * PATCH /api/users/:userId/notifications/read-all
   */
  markAllNotificationsAsRead = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?.id;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: "사용자 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      if (!currentUserId) {
        const response: ApiResponse = {
          success: false,
          error: "인증이 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(401).json(response);
      }

      // 본인만 알림 처리 가능
      if (userId !== currentUserId) {
        const response: ApiResponse = {
          success: false,
          error: "본인의 알림만 처리할 수 있습니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(403).json(response);
      }

      await this.userActivityService.markAllNotificationsAsRead(userId);

      const response: ApiResponse = {
        success: true,
        message: "모든 알림이 읽음으로 표시되었습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "모든 알림 읽음 처리 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };
}
