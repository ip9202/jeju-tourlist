/**
 * 배지 리포지토리 인터페이스
 *
 * @description
 * - 배지 데이터 접근 계층 추상화
 * - SOLID 원칙 중 DIP(의존성 역전 원칙) 준수
 * - 테스트 용이성 및 확장성 제공
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { Badge, BadgeType, UserBadge } from "@prisma/client";

/**
 * 배지 생성 데이터
 */
export interface CreateBadgeData {
  code: string;
  name: string;
  emoji: string;
  description: string;
  type: BadgeType;
  category?: string;
  requiredAnswers: number;
  requiredAdoptRate?: number;
  bonusPoints: number;
  adoptBonusPoints?: number;
  requiresGpsAuth?: boolean;
  requiresSocialAuth?: boolean;
  requiresDocAuth?: boolean;
  isActive?: boolean;
}

/**
 * 배지 수정 데이터
 */
export interface UpdateBadgeData {
  name?: string;
  description?: string;
  requiredAnswers?: number;
  requiredAdoptRate?: number;
  bonusPoints?: number;
  adoptBonusPoints?: number;
  isActive?: boolean;
}

/**
 * 배지 조회 옵션
 */
export interface BadgeQueryOptions {
  category?: string;
  type?: BadgeType;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

/**
 * 사용자 배지 조회 옵션
 */
export interface UserBadgeQueryOptions {
  userId: string;
  category?: string;
  type?: BadgeType;
  isEarned?: boolean;
  page?: number;
  limit?: number;
}

/**
 * 배지 리포지토리 인터페이스
 */
export interface IBadgeRepository {
  // 배지 CRUD
  create(data: CreateBadgeData): Promise<Badge>;
  findById(id: string): Promise<Badge | null>;
  findByCode(code: string): Promise<Badge | null>;
  findMany(options?: BadgeQueryOptions): Promise<Badge[]>;
  update(id: string, data: UpdateBadgeData): Promise<Badge>;
  delete(id: string): Promise<void>;

  // 사용자 배지 관리
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;
  getUserBadges(options: UserBadgeQueryOptions): Promise<UserBadge[]>;
  getUserBadgeById(userId: string, badgeId: string): Promise<UserBadge | null>;
  getUserBadgeByCode(
    userId: string,
    badgeCode: string
  ): Promise<UserBadge | null>;
  updateUserBadgeProgress(
    userId: string,
    badgeId: string,
    progress: any
  ): Promise<UserBadge>;
  markBadgeAsEarned(userId: string, badgeId: string): Promise<UserBadge>;

  // 배지 통계
  getBadgeStats(userId: string): Promise<{
    totalBadges: number;
    earnedBadges: number;
    totalPoints: number;
    categoryStats: Record<string, { count: number; points: number }>;
  }>;

  // 배지 조건 검증
  checkBadgeEligibility(
    userId: string,
    badgeId: string
  ): Promise<{
    isEligible: boolean;
    progress: number;
    maxProgress: number;
    message: string;
  }>;

  // 배치 처리
  findEligibleUsersForBadge(badgeId: string): Promise<string[]>;
  bulkAwardBadges(userId: string, badgeIds: string[]): Promise<UserBadge[]>;

  // 추가 메서드들
  getUserBadgeProgress(userId: string): Promise<any[]>;
  findActiveUsers(): Promise<
    Array<{ id: string; name: string; email: string }>
  >;
  getBadgeSystemStats(days: number): Promise<any>;
}
