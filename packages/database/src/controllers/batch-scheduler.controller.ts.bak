/**
 * 배치 스케줄러 컨트롤러
 *
 * @description
 * - 배치 작업 관리 API 엔드포인트
 * - Cron Job 설정 및 모니터링
 * - 관리자용 배치 작업 제어
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { BatchSchedulerService } from "../services/batch-scheduler.service";
import { z } from "zod";

/**
 * 배치 작업 설정 스키마
 */
const BatchConfigSchema = z.object({
  enabled: z.boolean().optional(),
  schedule: z.string().optional(),
  maxConcurrentUsers: z.number().min(1).max(1000).optional(),
  retryAttempts: z.number().min(0).max(10).optional(),
  retryDelay: z.number().min(1000).max(60000).optional(),
  notificationEnabled: z.boolean().optional(),
  logLevel: z.enum(["debug", "info", "warn", "error"]).optional(),
});

/**
 * 배치 스케줄러 컨트롤러
 */
export class BatchSchedulerController {
  private batchService: BatchSchedulerService;

  constructor(prisma: PrismaClient) {
    this.batchService = new BatchSchedulerService(prisma);
  }

  /**
   * 배치 작업 상태 조회
   *
   * @param req - Express Request
   * @param res - Express Response
   */
  getStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const status = this.batchService.getStatus();

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error("❌ 배치 작업 상태 조회 실패:", error);

      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      
      res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  };

  /**
   * 배치 작업 설정 업데이트 (관리자용)
   *
   * @param req - Express Request
   * @param res - Express Response
   */
  updateConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      // 관리자 권한 확인
      const isAdmin = (req as any).user?.isAdmin;
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: "관리자 권한이 필요합니다.",
        });
        return;
      }

      // 입력 데이터 검증
      const validatedData = BatchConfigSchema.parse(req.body);

      // 설정 업데이트
      this.batchService.updateConfig(validatedData);

      res.status(200).json({
        success: true,
        message: "배치 작업 설정이 업데이트되었습니다.",
        data: validatedData,
      });

      console.log("✅ 배치 작업 설정 업데이트:", validatedData);
    } catch (error) {
      console.error("❌ 배치 작업 설정 업데이트 실패:", error);

      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "입력 데이터가 올바르지 않습니다.",
          errors: error.errors,
        });
        return;
      }

      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      
      res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  };

  /**
   * 배치 작업 수동 실행 (관리자용)
   *
   * @param req - Express Request
   * @param res - Express Response
   */
  runManualBatch = async (req: Request, res: Response): Promise<void> => {
    try {
      // 관리자 권한 확인
      const isAdmin = (req as any).user?.isAdmin;
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: "관리자 권한이 필요합니다.",
        });
        return;
      }

      // 배치 작업 실행
      const result = await this.batchService.runManualBatch();

      res.status(200).json({
        success: true,
        message: "배치 작업이 완료되었습니다.",
        data: {
          startTime: result.startTime,
          endTime: result.endTime,
          duration: result.duration,
          processedUsers: result.processedUsers,
          newBadgesAwarded: result.newBadgesAwarded,
          notificationsSent: result.notificationsSent,
          errors: result.errors.length,
          summary: result.summary,
        },
      });

      console.log("✅ 수동 배치 작업 완료:", result.summary);
    } catch (error) {
      console.error("❌ 수동 배치 작업 실패:", error);

      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      
      res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  };

  /**
   * 배치 작업 중단 (관리자용)
   *
   * @param req - Express Request
   * @param res - Express Response
   */
  stopBatch = async (req: Request, res: Response): Promise<void> => {
    try {
      // 관리자 권한 확인
      const isAdmin = (req as any).user?.isAdmin;
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: "관리자 권한이 필요합니다.",
        });
        return;
      }

      // 배치 작업 중단
      await this.batchService.stopBatchJob();

      res.status(200).json({
        success: true,
        message: "배치 작업이 중단되었습니다.",
      });

      console.log("⏹️ 배치 작업 중단 완료");
    } catch (error) {
      console.error("❌ 배치 작업 중단 실패:", error);

      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      
      res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  };

  /**
   * 배치 작업 로그 조회 (관리자용)
   *
   * @param req - Express Request
   * @param res - Express Response
   */
  getBatchLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      // 관리자 권한 확인
      const isAdmin = (req as any).user?.isAdmin;
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: "관리자 권한이 필요합니다.",
        });
        return;
      }

      const { startDate, endDate, limit = 50 } = req.query;

      const logs = await this.batchService.getBatchLogs({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: parseInt(limit as string),
      });

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      console.error("❌ 배치 작업 로그 조회 실패:", error);

      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      
      res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  };

  /**
   * 배치 작업 통계 조회
   *
   * @param req - Express Request
   * @param res - Express Response
   */
  getBatchStats = async (req: Request, res: Response): Promise<void> => {
    try {
      // 최근 30일 통계 조회
      const logs = await this.batchService.getBatchLogs({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        limit: 100,
      });

      const stats = {
        totalRuns: logs.length,
        successfulRuns: logs.filter(log => log.success).length,
        failedRuns: logs.filter(log => !log.success).length,
        totalProcessedUsers: logs.reduce((sum, log) => sum + log.processedUsers, 0),
        totalNewBadges: logs.reduce((sum, log) => sum + log.newBadgesAwarded, 0),
        averageProcessingTime: logs.length > 0 
          ? logs.reduce((sum, log) => sum + (log.endTime.getTime() - log.startTime.getTime()), 0) / logs.length
          : 0,
        lastRun: logs.length > 0 ? logs[0].startTime : null,
      };

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("❌ 배치 작업 통계 조회 실패:", error);

      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      
      res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  };
}
