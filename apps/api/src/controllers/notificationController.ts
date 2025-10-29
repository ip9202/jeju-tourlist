/**
 * 알림 컨트롤러
 *
 * @description
 * - 알림 관련 API 엔드포인트 처리
 * - 다채널 알림 관리
 * - 알림 설정 및 개인화 관리
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { Request, Response } from "express";
import { NotificationService } from "@jeju-tourlist/database";
import { prisma } from "@jeju-tourlist/database";
import { createResponse } from "../utils/response";

/**
 * 알림 컨트롤러 클래스
 *
 * @description
 * - 알림 관련 모든 HTTP 요청 처리
 * - 요청 검증 및 응답 생성
 * - 에러 핸들링 및 로깅
 */
export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService(prisma);
  }

  /**
   * 사용자 알림 목록 조회
   *
   * @description
   * - 현재 사용자의 알림 목록 조회
   * - 페이지네이션 및 필터링 지원
   *
   * @route GET /api/notifications
   * @access Private
   */
  getNotifications = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json(createResponse(false, "인증이 필요합니다.", null));
      }

      const {
        page = 1,
        limit = 20,
        isRead,
        type,
        startDate,
        endDate,
      } = req.query;

      const options = {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 20,
        isRead:
          isRead === "true" ? true : isRead === "false" ? false : undefined,
        type: type as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const result = await this.notificationService.getUserNotifications(
        userId,
        options
      );

      res.json(createResponse(true, "알림 목록을 조회했습니다.", result));
    } catch (error) {
      console.error("알림 목록 조회 오류:", error);
      res
        .status(500)
        .json(
          createResponse(false, "알림 목록 조회 중 오류가 발생했습니다.", null)
        );
    }
  };

  /**
   * 알림 읽음 처리
   *
   * @description
   * - 특정 알림을 읽음으로 표시
   *
   * @route PUT /api/notifications/:id/read
   * @access Private
   */
  markAsRead = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res
          .status(401)
          .json(createResponse(false, "인증이 필요합니다.", null));
      }

      const result = await this.notificationService.markAsRead(id, userId);

      if (result.count === 0) {
        return res
          .status(404)
          .json(createResponse(false, "알림을 찾을 수 없습니다.", null));
      }

      res.json(
        createResponse(true, "알림을 읽음으로 표시했습니다.", {
          count: result.count,
        })
      );
    } catch (error) {
      console.error("알림 읽음 처리 오류:", error);
      res
        .status(500)
        .json(
          createResponse(false, "알림 읽음 처리 중 오류가 발생했습니다.", null)
        );
    }
  };

  /**
   * 모든 알림 읽음 처리
   *
   * @description
   * - 사용자의 모든 미읽음 알림을 읽음으로 표시
   *
   * @route PUT /api/notifications/read-all
   * @access Private
   */
  markAllAsRead = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json(createResponse(false, "인증이 필요합니다.", null));
      }

      const count = await this.notificationService.markAllAsRead(userId);

      res.json(
        createResponse(true, "모든 알림을 읽음으로 표시했습니다.", { count })
      );
    } catch (error) {
      console.error("모든 알림 읽음 처리 오류:", error);
      res
        .status(500)
        .json(
          createResponse(
            false,
            "모든 알림 읽음 처리 중 오류가 발생했습니다.",
            null
          )
        );
    }
  };

  /**
   * 알림 삭제
   *
   * @description
   * - 특정 알림 삭제
   *
   * @route DELETE /api/notifications/:id
   * @access Private
   */
  deleteNotification = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res
          .status(401)
          .json(createResponse(false, "인증이 필요합니다.", null));
      }

      const success = await this.notificationService.deleteNotification(
        id,
        userId
      );

      if (!success) {
        return res
          .status(404)
          .json(createResponse(false, "알림을 찾을 수 없습니다.", null));
      }

      res.json(createResponse(true, "알림을 삭제했습니다.", null));
    } catch (error) {
      console.error("알림 삭제 오류:", error);
      res
        .status(500)
        .json(createResponse(false, "알림 삭제 중 오류가 발생했습니다.", null));
    }
  };

  /**
   * 알림 설정 조회
   *
   * @description
   * - 사용자의 알림 설정 조회
   *
   * @route GET /api/notifications/settings
   * @access Private
   */
  getSettings = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json(createResponse(false, "인증이 필요합니다.", null));
      }

      const settings =
        await this.notificationService.getUserNotificationSettings(userId);

      res.json(createResponse(true, "알림 설정을 조회했습니다.", settings));
    } catch (error) {
      console.error("알림 설정 조회 오류:", error);
      res
        .status(500)
        .json(
          createResponse(false, "알림 설정 조회 중 오류가 발생했습니다.", null)
        );
    }
  };

  /**
   * 알림 설정 업데이트
   *
   * @description
   * - 사용자의 알림 설정 변경
   *
   * @route PUT /api/notifications/settings
   * @access Private
   */
  updateSettings = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const settings = req.body;

      if (!userId) {
        return res
          .status(401)
          .json(createResponse(false, "인증이 필요합니다.", null));
      }

      const updatedSettings =
        await this.notificationService.updateUserNotificationSettings(
          userId,
          settings
        );

      res.json(
        createResponse(true, "알림 설정을 업데이트했습니다.", updatedSettings)
      );
    } catch (error) {
      console.error("알림 설정 업데이트 오류:", error);
      res
        .status(500)
        .json(
          createResponse(
            false,
            "알림 설정 업데이트 중 오류가 발생했습니다.",
            null
          )
        );
    }
  };

  /**
   * 알림 통계 조회
   *
   * @description
   * - 사용자별 알림 통계 조회
   *
   * @route GET /api/notifications/stats
   * @access Private
   */
  getStats = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { period = 30 } = req.query;

      if (!userId) {
        return res
          .status(401)
          .json(createResponse(false, "인증이 필요합니다.", null));
      }

      const days = parseInt(period as string) || 30;
      const stats = await this.notificationService.getNotificationStats(
        userId,
        days
      );

      res.json(createResponse(true, "알림 통계를 조회했습니다.", stats));
    } catch (error) {
      console.error("알림 통계 조회 오류:", error);
      res
        .status(500)
        .json(
          createResponse(false, "알림 통계 조회 중 오류가 발생했습니다.", null)
        );
    }
  };

  /**
   * 알림 생성 (관리자용)
   *
   * @description
   * - 관리자가 수동으로 알림 생성
   * - 시스템 공지사항 등
   *
   * @route POST /api/notifications
   * @access Private (Admin only)
   */
  createNotification = async (req: Request, res: Response) => {
    try {
      // TODO: 관리자 권한 검증 추가
      // if (!req.user?.isAdmin) {
      //   return res.status(403).json(
      //     createResponse(false, '관리자 권한이 필요합니다.', null)
      //   );
      // }

      const { userId, type, title, message, data } = req.body;

      if (!userId || !type || !title || !message) {
        return res
          .status(400)
          .json(createResponse(false, "필수 필드가 누락되었습니다.", null));
      }

      const result = await this.notificationService.createNotification({
        userId,
        type,
        title,
        message,
        data,
      });

      res
        .status(201)
        .json(createResponse(true, "알림을 생성했습니다.", result));
    } catch (error) {
      console.error("알림 생성 오류:", error);
      res
        .status(500)
        .json(createResponse(false, "알림 생성 중 오류가 발생했습니다.", null));
    }
  };

  /**
   * 알림 템플릿 생성
   *
   * @description
   * - 알림 타입별 템플릿 생성
   * - 개발/테스트용
   *
   * @route POST /api/notifications/template
   * @access Private (Admin only)
   */
  createTemplate = async (req: Request, res: Response) => {
    try {
      // TODO: 관리자 권한 검증 추가
      // if (!req.user?.isAdmin) {
      //   return res.status(403).json(
      //     createResponse(false, '관리자 권한이 필요합니다.', null)
      //   );
      // }

      const { type, data } = req.body;

      if (!type) {
        return res
          .status(400)
          .json(createResponse(false, "알림 타입이 필요합니다.", null));
      }

      const template =
        await this.notificationService.createNotificationTemplate(type, data);

      res.json(createResponse(true, "알림 템플릿을 생성했습니다.", template));
    } catch (error) {
      console.error("알림 템플릿 생성 오류:", error);
      res
        .status(500)
        .json(
          createResponse(
            false,
            "알림 템플릿 생성 중 오류가 발생했습니다.",
            null
          )
        );
    }
  };

  /**
   * 알림 정리 작업
   *
   * @description
   * - 오래된 알림 정리
   * - 관리자 전용 기능
   *
   * @route POST /api/notifications/cleanup
   * @access Private (Admin only)
   */
  cleanupNotifications = async (req: Request, res: Response) => {
    try {
      // TODO: 관리자 권한 검증 추가
      // if (!req.user?.isAdmin) {
      //   return res.status(403).json(
      //     createResponse(false, '관리자 권한이 필요합니다.', null)
      //   );
      // }

      const { days = 30 } = req.body;
      const count = await this.notificationService.cleanupNotifications(days);

      res.json(createResponse(true, "알림 정리를 완료했습니다.", { count }));
    } catch (error) {
      console.error("알림 정리 오류:", error);
      res
        .status(500)
        .json(createResponse(false, "알림 정리 중 오류가 발생했습니다.", null));
    }
  };
}
