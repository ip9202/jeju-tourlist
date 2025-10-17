/**
 * 배지 시스템 타입 정의
 *
 * @description
 * - 배지 관련 모든 타입 정의
 * - TypeScript 타입 안전성 보장
 * - API 인터페이스 및 DTO 정의
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { BadgeType } from "@prisma/client";

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
  badgeId: string;
  badgeCode: string;
  badgeName: string;
  emoji: string;
  description: string;
  type: BadgeType;
  category?: string;
  earnedAt: Date;
  progress?: number;
  maxProgress?: number;
  isEarned: boolean;
}

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
 * 배지 통계 정보
 */
export interface BadgeStats {
  totalBadges: number;
  earnedBadges: number;
  totalPoints: number;
  categoryStats: Record<string, { count: number; points: number }>;
  completionRate: number;
}

/**
 * 배치 처리 결과
 */
export interface BatchProcessResult {
  processedUsers: number;
  totalBadgesAwarded: number;
  errors: string[];
  processingTime: number;
}

/**
 * 배지 자격 검증 결과
 */
export interface BadgeEligibilityResult {
  isEligible: boolean;
  progress: number;
  maxProgress: number;
  message: string;
}


/**
 * 전문가 포인트 지급 결과
 */
export interface ExpertPointsResult {
  userId: string;
  badgeCode: string;
  pointsAwarded: number;
  totalPoints: number;
}