/**
 * 배지 시스템 서비스 (개선된 버전)
 *
 * @description
 * - 배지 계산, 부여, 관리 로직
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 및 DIP(의존성 역전 원칙) 준수
 * - 배지 조건 검증 및 자동 부여 시스템
 * - 배치 처리 및 통계 분석
 *
 * @author 동네물어봐 개발팀
 * @version 2.0.0
 */

import { PrismaClient, BadgeType } from "@prisma/client";
import { IBadgeRepository } from "../repositories/badge.repository";
import { BadgeRepository } from "../repositories/badge.repository.impl";

/**
 * 배지 계산 결과
 */
export interface BadgeCalculationResult {
  badgeId: string;
  badgeCode: string;
  badgeName: string;
  isEarned: boolean;
  progress: number;
  maxProgress: number;
  message: string;
  points: number;
}

/**
 * 사용자 배지 진행률 정보
 */
export interface UserBadgeProgress {
  badgeId: string;
  badgeCode: string;
  badgeName: string;
  emoji: string;
  description: string;
  type: BadgeType;
  category?: string;
  progress: number;
  maxProgress: number;
  percentage: number;
  isEarned: boolean;
  earnedAt?: Date;
  message: string;
}

/**
 * 배지 시스템 서비스
 */
export class BadgeService {
  private badgeRepository: IBadgeRepository;

  constructor(prisma: PrismaClient) {
    this.badgeRepository = new BadgeRepository(prisma);
  }

  /**
   * 사용자 배지 자격 검사 및 자동 부여
   *
   * @param userId - 사용자 ID
   * @returns 부여된 배지 목록
   */
  async checkAndAwardBadges(userId: string): Promise<BadgeCalculationResult[]> {
    console.log(`🔍 사용자 ${userId}의 배지 자격 검사 시작...`);

    // 모든 활성 배지 조회
    const badges = await this.badgeRepository.findMany({ isActive: true });
    const earnedBadges: BadgeCalculationResult[] = [];

    for (const badge of badges) {
      try {
        // 이미 획득한 배지인지 확인
        const existingUserBadge = await this.badgeRepository.getUserBadgeById(userId, badge.id);
        if (existingUserBadge?.isEarned) {
          continue;
        }

        // 배지 자격 검증
        const eligibility = await this.badgeRepository.checkBadgeEligibility(userId, badge.id);

        if (eligibility.isEligible) {
          // 배지 부여
          await this.badgeRepository.awardBadge(userId, badge.id);

          earnedBadges.push({
            badgeId: badge.id,
            badgeCode: badge.code,
            badgeName: badge.name,
            isEarned: true,
            progress: eligibility.progress,
            maxProgress: eligibility.maxProgress,
            message: eligibility.message,
            points: badge.bonusPoints,
          });

          console.log(`✅ 배지 부여: ${badge.emoji} ${badge.name} (${badge.bonusPoints}포인트)`);
        }
      } catch (error) {
        console.error(`❌ 배지 ${badge.name} 검사 중 오류:`, error);
      }
    }

    console.log(`🎉 총 ${earnedBadges.length}개의 배지를 부여했습니다.`);
    return earnedBadges;
  }

  /**
   * 사용자 배지 진행률 조회
   *
   * @param userId - 사용자 ID
   * @returns 배지 진행률 목록
   */
  async getUserBadgeProgress(userId: string): Promise<UserBadgeProgress[]> {
    const badges = await this.badgeRepository.findMany({ isActive: true });
    const progressList: UserBadgeProgress[] = [];

    for (const badge of badges) {
      const eligibility = await this.badgeRepository.checkBadgeEligibility(userId, badge.id);
      const userBadge = await this.badgeRepository.getUserBadgeById(userId, badge.id);

      progressList.push({
        badgeId: badge.id,
        badgeCode: badge.code,
        badgeName: badge.name,
        emoji: badge.emoji,
        description: badge.description,
        type: badge.type,
        category: badge.category || undefined,
        progress: eligibility.progress,
        maxProgress: eligibility.maxProgress,
        percentage: Math.min((eligibility.progress / eligibility.maxProgress) * 100, 100),
        isEarned: userBadge?.isEarned || false,
        earnedAt: userBadge?.earnedAt || undefined,
        message: eligibility.message,
      });
    }

    // 타입별, 진행률별 정렬
    return progressList.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      if (a.isEarned !== b.isEarned) {
        return a.isEarned ? 1 : -1;
      }
      return b.percentage - a.percentage;
    });
  }

  /**
   * 사용자 배지 통계 조회
   *
   * @param userId - 사용자 ID
   * @returns 배지 통계 정보
   */
  async getUserBadgeStats(userId: string) {
    return await this.badgeRepository.getBadgeStats(userId);
  }

  /**
   * 특정 배지의 획득 가능한 사용자 목록 조회
   *
   * @param badgeId - 배지 ID
   * @returns 획득 가능한 사용자 ID 목록
   */
  async getEligibleUsersForBadge(badgeId: string): Promise<string[]> {
    return await this.badgeRepository.findEligibleUsersForBadge(badgeId);
  }

  /**
   * 배치 처리: 모든 사용자의 배지 자격 검사
   *
   * @returns 처리 결과 통계
   */
  async batchProcessAllUsers(): Promise<{
    processedUsers: number;
    totalBadgesAwarded: number;
    errors: string[];
  }> {
    console.log("🔄 배지 배치 처리 시작...");

    const activeUsers = await this.badgeRepository["prisma"].user.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    let processedUsers = 0;
    let totalBadgesAwarded = 0;
    const errors: string[] = [];

    for (const user of activeUsers) {
      try {
        const earnedBadges = await this.checkAndAwardBadges(user.id);
        totalBadgesAwarded += earnedBadges.length;
        processedUsers++;

        if (earnedBadges.length > 0) {
          console.log(`👤 ${user.name}: ${earnedBadges.length}개 배지 획득`);
        }
      } catch (error) {
        const errorMessage = `사용자 ${user.name} (${user.id}) 처리 중 오류: ${error}`;
        console.error(`❌ ${errorMessage}`);
        errors.push(errorMessage);
      }
    }

    console.log(`✅ 배치 처리 완료: ${processedUsers}명 처리, ${totalBadgesAwarded}개 배지 부여`);

    return {
      processedUsers,
      totalBadgesAwarded,
      errors,
    };
  }

  /**
   * 답변 채택 시 전문가 포인트 지급
   *
   * @param userId - 답변 작성자 ID
   * @param badgeCode - 배지 코드
   * @returns 지급된 포인트
   */
  async awardExpertPoints(userId: string, badgeCode: string): Promise<number> {
    const badge = await this.badgeRepository.findByCode(badgeCode);
    if (!badge || !badge.adoptBonusPoints) {
      return 0;
    }

    // 사용자가 해당 배지를 보유하고 있는지 확인
    const userBadge = await this.badgeRepository.getUserBadgeByCode(userId, badgeCode);
    if (!userBadge?.isEarned) {
      return 0;
    }

    // 포인트 지급 (실제 구현에서는 PointService 사용)
    await this.badgeRepository["prisma"].user.update({
      where: { id: userId },
      data: {
        totalPoints: {
          increment: badge.adoptBonusPoints,
        },
      },
    });

    console.log(`💰 전문가 포인트 지급: ${userId}에게 ${badge.adoptBonusPoints}포인트 (${badge.name})`);
    return badge.adoptBonusPoints;
  }

  /**
   * 배지 생성 (관리자용)
   *
   * @param data - 배지 생성 데이터
   * @returns 생성된 배지
   */
  async createBadge(data: any) {
    return await this.badgeRepository.create(data);
  }

  /**
   * 배지 수정 (관리자용)
   *
   * @param badgeId - 배지 ID
   * @param data - 수정 데이터
   * @returns 수정된 배지
   */
  async updateBadge(badgeId: string, data: any) {
    return await this.badgeRepository.update(badgeId, data);
  }

  /**
   * 배지 목록 조회
   *
   * @param options - 조회 옵션
   * @returns 배지 목록
   */
  async getBadges(options: any = {}) {
    return await this.badgeRepository.findMany(options);
  }

  /**
   * 사용자 배지 목록 조회
   *
   * @param userId - 사용자 ID
   * @param options - 조회 옵션
   * @returns 사용자 배지 목록
   */
  async getUserBadges(userId: string, options: any = {}) {
    return await this.badgeRepository.getUserBadges({ userId, ...options });
  }
}
