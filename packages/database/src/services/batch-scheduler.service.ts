/**
 * 배치 스케줄러 서비스
 *
 * @description
 * - 매일 새벽 4시 배지 계산 배치 작업
 * - 사용자별 배지 자격 검사 및 자동 부여
 * - 알림 생성 및 에러 처리
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { PrismaClient } from "@prisma/client";
import { BadgeService } from "./badge.service";
import { PointService } from "./point.service";
import { NotificationService } from "./notification.service";

/**
 * 배치 작업 결과
 */
export interface BatchJobResult {
  success: boolean;
  startTime: Date;
  endTime: Date;
  duration: number; // milliseconds
  processedUsers: number;
  newBadgesAwarded: number;
  notificationsSent: number;
  errors: Array<{
    userId: string;
    error: string;
    timestamp: Date;
  }>;
  summary: {
    totalUsers: number;
    activeUsers: number;
    usersWithNewBadges: number;
    averageProcessingTime: number;
  };
}

/**
 * 배치 작업 설정
 */
export interface BatchJobConfig {
  enabled: boolean;
  schedule: string; // Cron expression
  maxConcurrentUsers: number;
  retryAttempts: number;
  retryDelay: number; // milliseconds
  notificationEnabled: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
}

/**
 * 배치 스케줄러 서비스
 */
export class BatchSchedulerService {
  private prisma: PrismaClient;
  private badgeService: BadgeService;
  private pointService: PointService;
  private notificationService: NotificationService;
  private isRunning: boolean = false;
  private config: BatchJobConfig;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.badgeService = new BadgeService(prisma);
    this.pointService = new PointService(prisma);
    this.notificationService = new NotificationService(prisma);
    
    // 기본 설정
    this.config = {
      enabled: true,
      schedule: "0 4 * * *", // 매일 새벽 4시
      maxConcurrentUsers: 50,
      retryAttempts: 3,
      retryDelay: 5000,
      notificationEnabled: true,
      logLevel: "info",
    };
  }

  /**
   * 배치 작업 실행
   *
   * @returns 배치 작업 결과
   */
  async runBatchJob(): Promise<BatchJobResult> {
    if (this.isRunning) {
      throw new Error("배치 작업이 이미 실행 중입니다.");
    }

    this.isRunning = true;
    const startTime = new Date();
    const errors: Array<{ userId: string; error: string; timestamp: Date }> = [];
    let processedUsers = 0;
    let newBadgesAwarded = 0;
    let notificationsSent = 0;

    console.log("🔄 배치 작업 시작:", startTime.toISOString());

    try {
      // 1. 활성 사용자 목록 조회
      const activeUsers = await this.getActiveUsers();
      console.log(`📊 처리 대상 사용자: ${activeUsers.length}명`);

      // 2. 사용자별 배지 처리
      for (const user of activeUsers) {
        try {
          const userResult = await this.processUserBadges(user);
          processedUsers++;
          newBadgesAwarded += userResult.newBadgesCount;
          notificationsSent += userResult.notificationsSent;

          if (userResult.newBadgesCount > 0) {
            console.log(`🎉 사용자 ${user.name}에게 ${userResult.newBadgesCount}개 배지 부여`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
          errors.push({
            userId: user.id,
            error: errorMessage,
            timestamp: new Date(),
          });
          console.error(`❌ 사용자 ${user.name} 처리 실패:`, errorMessage);
        }
      }

      // 3. 시스템 통계 업데이트
      await this.updateSystemStats();

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      const result: BatchJobResult = {
        success: errors.length === 0,
        startTime,
        endTime,
        duration,
        processedUsers,
        newBadgesAwarded,
        notificationsSent,
        errors,
        summary: {
          totalUsers: activeUsers.length,
          activeUsers: processedUsers,
          usersWithNewBadges: errors.length === 0 ? processedUsers : processedUsers - errors.length,
          averageProcessingTime: processedUsers > 0 ? duration / processedUsers : 0,
        },
      };

      console.log("✅ 배치 작업 완료:", {
        duration: `${Math.round(duration / 1000)}초`,
        processedUsers,
        newBadgesAwarded,
        notificationsSent,
        errors: errors.length,
      });

      return result;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 활성 사용자 목록 조회
   */
  private async getActiveUsers(): Promise<Array<{ id: string; name: string; email: string }>> {
    return await this.prisma.user.findMany({
      where: {
        isActive: true,
        // 최근 30일 내 활동이 있는 사용자만 대상
        OR: [
          {
            questions: {
              some: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            },
          },
          {
            answers: {
              some: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        createdAt: "asc", // 오래된 사용자부터 처리
      },
    });
  }

  /**
   * 사용자별 배지 처리
   */
  private async processUserBadges(user: { id: string; name: string; email: string }): Promise<{
    newBadgesCount: number;
    notificationsSent: number;
  }> {
    let newBadgesCount = 0;
    let notificationsSent = 0;

    try {
      // 1. 사용자 배지 계산 및 부여
      const badgeResults = await this.badgeService.checkAndAwardBadges(user.id);
      
      // 2. 새로 획득한 배지 확인
      const newlyEarnedBadges = badgeResults.filter(result => 
        result.isEarned && result.earnedAt && 
        result.earnedAt > new Date(Date.now() - 24 * 60 * 60 * 1000) // 최근 24시간 내
      );

      newBadgesCount = newlyEarnedBadges.length;

      // 3. 새 배지에 대한 알림 생성
      if (newlyEarnedBadges.length > 0 && this.config.notificationEnabled) {
        for (const badge of newlyEarnedBadges) {
          try {
            await this.notificationService.createNotification({
              userId: user.id,
              type: "BADGE_EARNED",
              title: "새 배지를 획득했습니다! 🎉",
              message: `${badge.emoji} ${badge.name} 배지를 획득했습니다!`,
              data: {
                badgeId: badge.badgeId,
                badgeName: badge.name,
                badgeEmoji: badge.emoji,
                earnedAt: badge.earnedAt,
              },
            });
            notificationsSent++;
          } catch (error) {
            console.error(`❌ 알림 생성 실패 (사용자 ${user.name}, 배지 ${badge.name}):`, error);
          }
        }
      }

      // 4. 사용자 통계 업데이트
      await this.updateUserStats(user.id);

    } catch (error) {
      console.error(`❌ 사용자 ${user.name} 배지 처리 중 오류:`, error);
      throw error;
    }

    return { newBadgesCount, notificationsSent };
  }

  /**
   * 사용자 통계 업데이트
   */
  private async updateUserStats(userId: string): Promise<void> {
    try {
      // 답변 수 및 채택률 계산
      const [totalAnswers, adoptedAnswers] = await Promise.all([
        this.prisma.answer.count({
          where: { authorId: userId },
        }),
        this.prisma.answer.count({
          where: { authorId: userId, adoptedAt: { not: null } },
        }),
      ]);

      const adoptRate = totalAnswers > 0 ? (adoptedAnswers / totalAnswers) * 100 : 0;

      // 사용자 통계 업데이트
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          totalAnswers,
          adoptedAnswers,
          adoptRate: Math.round(adoptRate * 100) / 100,
        },
      });
    } catch (error) {
      console.error(`❌ 사용자 ${userId} 통계 업데이트 실패:`, error);
    }
  }

  /**
   * 시스템 통계 업데이트
   */
  private async updateSystemStats(): Promise<void> {
    try {
      // 전체 배지 통계 계산
      const [totalBadges, totalUserBadges, activeUsers] = await Promise.all([
        this.prisma.badge.count({ where: { isActive: true } }),
        this.prisma.userBadge.count({ where: { earnedAt: { not: null } } }),
        this.prisma.user.count({ where: { isActive: true } }),
      ]);

      console.log("📊 시스템 통계 업데이트:", {
        totalBadges,
        totalUserBadges,
        activeUsers,
        averageBadgesPerUser: activeUsers > 0 ? Math.round((totalUserBadges / activeUsers) * 100) / 100 : 0,
      });
    } catch (error) {
      console.error("❌ 시스템 통계 업데이트 실패:", error);
    }
  }

  /**
   * 배치 작업 설정 업데이트
   */
  updateConfig(newConfig: Partial<BatchJobConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log("⚙️ 배치 작업 설정 업데이트:", this.config);
  }

  /**
   * 배치 작업 상태 조회
   */
  getStatus(): {
    isRunning: boolean;
    config: BatchJobConfig;
    lastRun?: Date;
    nextRun?: Date;
  } {
    return {
      isRunning: this.isRunning,
      config: this.config,
      // TODO: 실제 구현에서는 데이터베이스에서 마지막 실행 시간 조회
      lastRun: undefined,
      nextRun: undefined,
    };
  }

  /**
   * 배치 작업 수동 실행 (관리자용)
   */
  async runManualBatch(): Promise<BatchJobResult> {
    console.log("🔧 수동 배치 작업 실행 요청");
    return await this.runBatchJob();
  }

  /**
   * 배치 작업 중단
   */
  async stopBatchJob(): Promise<void> {
    if (!this.isRunning) {
      throw new Error("실행 중인 배치 작업이 없습니다.");
    }

    console.log("⏹️ 배치 작업 중단 요청");
    // TODO: 실제 구현에서는 graceful shutdown 로직 추가
    this.isRunning = false;
  }

  /**
   * 배치 작업 로그 조회
   */
  async getBatchLogs(_options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}): Promise<Array<{
    id: string;
    startTime: Date;
    endTime: Date;
    success: boolean;
    processedUsers: number;
    newBadgesAwarded: number;
    errors: number;
  }>> {
    // TODO: 실제 구현에서는 배치 작업 로그 테이블에서 조회
    return [];
  }
}
