/**
 * 배지 시스템 서비스
 * 
 * @description
 * - 배지 생성, 조회, 관리 로직
 * - 자동 배지 부여 시스템
 * - 배지 조건 검증 및 처리
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { PrismaClient, Badge, UserBadge, User } from '../../node_modules/.prisma/client';
import { BaseService } from './base.service';
import { CreateBadgeData } from '../types/badge';

/**
 * 배지 조건 검증 결과
 */
export interface BadgeConditionResult {
  badgeId: string;
  isEarned: boolean;
  progress: number;
  maxProgress: number;
  message?: string;
}

/**
 * 사용자 배지 정보
 */
export interface UserBadgeInfo {
  badge: Badge;
  earnedAt: Date;
  progress?: number;
  maxProgress?: number;
}

/**
 * 배지 시스템 서비스
 * 
 * @description
 * - 배지 관련 모든 비즈니스 로직 처리
 * - 자동 배지 부여 및 조건 검증
 * - 배지 통계 및 분석
 */
export class BadgeService extends BaseService {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * 배지 생성
   * 
   * @description
   * - 새로운 배지 생성
   * - 배지 조건 검증
   * - 중복 배지명 방지
   * 
   * @param data - 배지 생성 데이터
   * @returns 생성된 배지
   */
  async createBadge(data: CreateBadgeData) {
    // 중복 배지명 검증
    const existingBadge = await this.prisma.badge.findUnique({
      where: { name: data.name },
    });

    if (existingBadge) {
      throw new Error('이미 존재하는 배지명입니다.');
    }

    return await this.prisma.badge.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
        category: data.category,
        points: data.points || 0,
        condition: data.condition,
      },
    });
  }

  /**
   * 사용자 배지 부여
   * 
   * @description
   * - 사용자에게 배지 부여
   * - 중복 부여 방지
   * - 포인트 적립 처리
   * 
   * @param userId - 사용자 ID
   * @param badgeId - 배지 ID
   * @returns 부여된 사용자 배지
   */
  async awardBadge(userId: string, badgeId: string) {
    return await this.prisma.$transaction(async (tx) => {
      // 배지 정보 조회
      const badge = await tx.badge.findUnique({
        where: { id: badgeId },
      });

      if (!badge) {
        throw new Error('배지를 찾을 수 없습니다.');
      }

      if (!badge.isActive) {
        throw new Error('비활성화된 배지입니다.');
      }

      // 중복 부여 검증
      const existingUserBadge = await tx.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId,
          },
        },
      });

      if (existingUserBadge) {
        throw new Error('이미 획득한 배지입니다.');
      }

      // 사용자 배지 부여
      const userBadge = await tx.userBadge.create({
        data: {
          userId,
          badgeId,
        },
      });

      // 포인트 적립 (배지에 포인트가 있는 경우)
      if (badge.points > 0) {
        await tx.pointTransaction.create({
          data: {
            userId,
            amount: badge.points,
            balance: 0, // 실제 잔액은 PointService에서 계산
            type: 'BADGE_EARNED',
            description: `배지 획득: ${badge.name}`,
            relatedType: 'badge',
            relatedId: badgeId,
            metadata: {
              badgeName: badge.name,
              badgeCategory: badge.category,
            },
          },
        });

        // 사용자 포인트 업데이트
        await tx.user.update({
          where: { id: userId },
          data: {
            points: { increment: badge.points },
          },
        });
      }

      return userBadge;
    });
  }

  /**
   * 사용자 배지 목록 조회
   * 
   * @description
   * - 사용자가 획득한 배지 목록
   * - 배지 상세 정보 포함
   * - 카테고리별 필터링 지원
   * 
   * @param userId - 사용자 ID
   * @param category - 배지 카테고리 (선택적)
   * @returns 사용자 배지 목록
   */
  async getUserBadges(userId: string, category?: string) {
    const where: any = { userId };
    
    if (category) {
      where.badge = { category };
    }

    const userBadges = await this.prisma.userBadge.findMany({
      where,
      include: {
        badge: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return userBadges.map(ub => ({
      badge: ub.badge,
      earnedAt: ub.createdAt,
    }));
  }

  /**
   * 사용자 배지 통계 조회
   * 
   * @description
   * - 사용자별 배지 획득 통계
   * - 카테고리별 배지 분포
   * - 배지 포인트 합계
   * 
   * @param userId - 사용자 ID
   * @returns 배지 통계 정보
   */
  async getUserBadgeStats(userId: string) {
    // 사용자 배지 목록
    const userBadges = await this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    });

    // 카테고리별 통계
    const categoryStats = userBadges.reduce((acc, ub) => {
      const category = ub.badge.category;
      if (!acc[category]) {
        acc[category] = { count: 0, points: 0 };
      }
      acc[category].count++;
      acc[category].points += ub.badge.points;
      return acc;
    }, {} as Record<string, { count: number; points: number }>);

    // 전체 통계
    const totalBadges = userBadges.length;
    const totalPoints = userBadges.reduce((sum, ub) => sum + ub.badge.points, 0);

    // 전체 배지 수 (획득 가능한 배지)
    const totalAvailableBadges = await this.prisma.badge.count({
      where: { isActive: true },
    });

    return {
      totalBadges,
      totalAvailableBadges,
      completionRate: totalAvailableBadges > 0 ? (totalBadges / totalAvailableBadges) * 100 : 0,
      totalPoints,
      categoryStats,
    };
  }

  /**
   * 자동 배지 부여 검사
   * 
   * @description
   * - 사용자 활동 기반 자동 배지 부여
   * - 배지 조건 검증 및 자동 부여
   * - 배치 처리 지원
   * 
   * @param userId - 사용자 ID
   * @returns 부여된 배지 목록
   */
  async checkAndAwardBadges(userId: string) {
    // 사용자 정보 조회
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        questions: true,
        answers: true,
        questionLikes: true,
        answerLikes: true,
        userBadges: {
          include: { badge: true },
        },
      },
    });

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 활성화된 배지 목록 조회
    const availableBadges = await this.prisma.badge.findMany({
      where: { isActive: true },
    });

    const awardedBadges = [];

    // 각 배지 조건 검증
    for (const badge of availableBadges) {
      // 이미 획득한 배지인지 확인
      const hasBadge = user.userBadges.some(ub => ub.badgeId === badge.id);
      if (hasBadge) continue;

      // 배지 조건 검증
      const conditionResult = await this.checkBadgeCondition(user, badge);
      
      if (conditionResult.isEarned) {
        try {
          await this.awardBadge(userId, badge.id);
          awardedBadges.push({
            badge,
            message: conditionResult.message,
          });
        } catch (error) {
          console.error(`배지 부여 실패: ${badge.name}`, error);
        }
      }
    }

    return awardedBadges;
  }

  /**
   * 배지 조건 검증
   * 
   * @description
   * - 특정 배지의 획득 조건 검증
   * - 진행률 계산
   * - 조건별 세부 검증 로직
   * 
   * @param user - 사용자 정보
   * @param badge - 배지 정보
   * @returns 조건 검증 결과
   */
  private async checkBadgeCondition(user: any, badge: Badge): Promise<BadgeConditionResult> {
    const condition = badge.condition as any;
    let isEarned = false;
    let progress = 0;
    let maxProgress = 1;
    let message = '';

    try {
      switch (condition.type) {
        case 'question_count':
          progress = user.questions.length;
          maxProgress = condition.required;
          isEarned = progress >= condition.required;
          message = isEarned 
            ? `${condition.required}개의 질문을 작성했습니다!`
            : `${condition.required - progress}개 더 질문을 작성하세요.`;
          break;

        case 'answer_count':
          progress = user.answers.length;
          maxProgress = condition.required;
          isEarned = progress >= condition.required;
          message = isEarned 
            ? `${condition.required}개의 답변을 작성했습니다!`
            : `${condition.required - progress}개 더 답변을 작성하세요.`;
          break;

        case 'like_received':
          const totalLikes = user.questionLikes.length + user.answerLikes.length;
          progress = totalLikes;
          maxProgress = condition.required;
          isEarned = progress >= condition.required;
          message = isEarned 
            ? `${condition.required}개의 좋아요를 받았습니다!`
            : `${condition.required - progress}개 더 좋아요를 받으세요.`;
          break;

        case 'points_earned':
          progress = user.points;
          maxProgress = condition.required;
          isEarned = progress >= condition.required;
          message = isEarned 
            ? `${condition.required}포인트를 획득했습니다!`
            : `${condition.required - progress}포인트 더 획득하세요.`;
          break;

        case 'consecutive_days':
          // 연속 로그인 일수 계산 (구현 필요)
          progress = 0; // TODO: 연속 로그인 일수 계산 로직
          maxProgress = condition.required;
          isEarned = progress >= condition.required;
          message = isEarned 
            ? `${condition.required}일 연속 로그인했습니다!`
            : `${condition.required - progress}일 더 연속 로그인하세요.`;
          break;

        case 'first_question':
          progress = user.questions.length > 0 ? 1 : 0;
          maxProgress = 1;
          isEarned = progress >= 1;
          message = isEarned ? '첫 번째 질문을 작성했습니다!' : '첫 번째 질문을 작성하세요.';
          break;

        case 'first_answer':
          progress = user.answers.length > 0 ? 1 : 0;
          maxProgress = 1;
          isEarned = progress >= 1;
          message = isEarned ? '첫 번째 답변을 작성했습니다!' : '첫 번째 답변을 작성하세요.';
          break;

        default:
          console.warn(`알 수 없는 배지 조건 타입: ${condition.type}`);
          break;
      }
    } catch (error) {
      console.error(`배지 조건 검증 오류: ${badge.name}`, error);
    }

    return {
      badgeId: badge.id,
      isEarned,
      progress,
      maxProgress,
      message,
    };
  }

  /**
   * 배지 목록 조회
   * 
   * @description
   * - 전체 배지 목록 조회
   * - 카테고리별 필터링 지원
   * - 페이지네이션 지원
   * 
   * @param options - 조회 옵션
   * @returns 배지 목록
   */
  async getBadges(options: {
    category?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  } = {}) {
    const {
      category,
      isActive = true,
      page = 1,
      limit = 20,
    } = options;

    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [badges, total] = await Promise.all([
      this.prisma.badge.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.badge.count({ where }),
    ]);

    return {
      badges,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 배지 수정
   * 
   * @description
   * - 기존 배지 정보 수정
   * - 배지명 중복 검증
   * - 활성화 상태 관리
   * 
   * @param badgeId - 배지 ID
   * @param data - 수정할 데이터
   * @returns 수정된 배지
   */
  async updateBadge(badgeId: string, data: Partial<CreateBadgeData>) {
    // 배지명 중복 검증 (변경된 경우)
    if (data.name) {
      const existingBadge = await this.prisma.badge.findFirst({
        where: {
          name: data.name,
          id: { not: badgeId },
        },
      });

      if (existingBadge) {
        throw new Error('이미 존재하는 배지명입니다.');
      }
    }

    return await this.prisma.badge.update({
      where: { id: badgeId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 배지 삭제 (비활성화)
   * 
   * @description
   * - 배지 비활성화 처리
   * - 기존 사용자 배지는 유지
   * - 소프트 삭제 방식
   * 
   * @param badgeId - 배지 ID
   * @returns 비활성화된 배지
   */
  async deactivateBadge(badgeId: string) {
    return await this.prisma.badge.update({
      where: { id: badgeId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }
}
