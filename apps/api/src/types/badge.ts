/**
 * 배지 관련 타입 정의
 * 
 * @description
 * - 배지 API 응답 타입 정의
 * - 배지 데이터 구조 타입
 * - 배지 진행률 및 통계 타입
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { BadgeType } from '@prisma/client';

/**
 * 배지 기본 정보 타입
 */
export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: BadgeType;
  points: number;
  condition: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 사용자 배지 정보 타입
 */
export interface UserBadgeInfo {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  badge: BadgeInfo;
}

/**
 * 배지 진행률 정보 타입
 */
export interface BadgeProgress {
  badgeId: string;
  badge: BadgeInfo;
  currentProgress: number;
  requiredProgress: number;
  progressPercentage: number;
  isEarned: boolean;
  earnedAt?: Date;
}

/**
 * 배지 통계 정보 타입
 */
export interface BadgeStats {
  totalBadges: number;
  earnedBadges: number;
  categoryStats: {
    [key in BadgeType]: {
      total: number;
      earned: number;
      percentage: number;
    };
  };
  recentBadges: UserBadgeInfo[];
  topBadges: {
    badgeId: string;
    badge: BadgeInfo;
    userCount: number;
  }[];
}

/**
 * 배지 시스템 통계 타입 (관리자용)
 */
export interface BadgeSystemStats {
  totalUsers: number;
  totalBadges: number;
  totalUserBadges: number;
  averageBadgesPerUser: number;
  badgeDistribution: {
    badgeId: string;
    badge: BadgeInfo;
    userCount: number;
    percentage: number;
  }[];
  recentActivity: {
    date: string;
    badgesEarned: number;
    newUsers: number;
  }[];
  categoryBreakdown: {
    [key in BadgeType]: {
      totalBadges: number;
      totalEarned: number;
      averageEarned: number;
    };
  };
}

/**
 * 배지 계산 결과 타입
 */
export interface BadgeCalculationResult {
  userId?: string;
  totalProcessed: number;
  badgesAwarded: number;
  awardedBadges: UserBadgeInfo[];
  errors: string[];
  processingTime: number;
}

/**
 * 답변 채택 결과 타입
 */
export interface AnswerAdoptionResult {
  adoptedAnswerId: string;
  expertPointsAwarded: number;
  totalPoints: number;
  badgePointsAwarded: number;
  message: string;
}

/**
 * 답변 채택 상태 타입
 */
export interface AdoptionStatus {
  questionId: string;
  isAdopted: boolean;
  adoptedAnswerId?: string;
  adoptedAt?: Date;
  adopterId?: string;
}

/**
 * 사용자 채택 통계 타입
 */
export interface UserAdoptionStats {
  userId: string;
  name: string;
  nickname: string;
  totalAnswers: number;
  adoptedAnswers: number;
  adoptRate: number;
  totalPoints: number;
}

/**
 * API 응답 기본 타입
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * 페이지네이션 응답 타입
 */
export interface PaginatedResponse<T = any> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * 배지 목록 조회 옵션 타입
 */
export interface BadgeListOptions {
  category?: BadgeType;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'points';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 사용자 배지 조회 옵션 타입
 */
export interface UserBadgeOptions {
  category?: BadgeType;
  isEarned?: boolean;
  sortBy?: 'earnedAt' | 'badgeName' | 'points';
  sortOrder?: 'asc' | 'desc';
}
