/**
 * 전문가 시스템 관련 타입 정의
 *
 * @description
 * - 전문가 랭킹, 필터링, 정렬 관련 타입 정의
 * - ISP(Interface Segregation Principle) 적용
 * - 각 기능별로 세분화된 인터페이스 제공
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { BadgeInfo } from "./badge";

/**
 * 전문가 정보 인터페이스
 */
export interface Expert {
  id: string;
  name: string;
  nickname: string;
  avatar: string | null;
  rank: number;
  badges: BadgeInfo[];
  primaryBadge: BadgeInfo | null;
  totalAnswers: number;
  adoptedAnswers: number;
  adoptRate: number;
  points: number;
  joinDate: Date;
  rating: number;
}

/**
 * 전문가 랭킹 응답 인터페이스
 */
export interface ExpertRankingResponse {
  experts: Expert[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * 카테고리 필터 타입
 */
export type CategoryFilter =
  | "전체"
  | "맛집"
  | "교통"
  | "액티비티"
  | "숙박"
  | "쇼핑"
  | "관광지";

/**
 * 전문가 정렬 옵션 타입
 */
export type ExpertSortOption = "points" | "answers" | "adoptRate";

/**
 * 전문가 검색 옵션 인터페이스
 */
export interface ExpertSearchOptions {
  category?: CategoryFilter;
  sortBy?: ExpertSortOption;
  page?: number;
  limit?: number;
}

/**
 * TOP 전문가 조회 옵션 인터페이스
 */
export interface TopExpertsOptions {
  category?: CategoryFilter;
  limit?: number;
}

/**
 * 전문가 통계 인터페이스
 */
export interface ExpertStats {
  totalExperts: number;
  categoryDistribution: Record<CategoryFilter, number>;
  averageRating: number;
  topCategory: CategoryFilter;
}

/**
 * 전문가 상세 정보 인터페이스
 */
export interface ExpertDetail extends Expert {
  bio?: string;
  location?: string;
  website?: string;
  isVerified: boolean;
  recentAnswers: {
    id: string;
    questionTitle: string;
    content: string;
    createdAt: Date;
    isAccepted: boolean;
  }[];
  achievements: {
    badgeCount: number;
    totalPoints: number;
    answerStreak: number;
    bestCategory: CategoryFilter;
  };
}

/**
 * 전문가 필터 상태 인터페이스
 */
export interface ExpertFilterState {
  selectedCategory: CategoryFilter;
  sortBy: ExpertSortOption;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * 전문가 랭킹 훅 반환 타입
 */
export interface UseExpertRankingReturn {
  experts: Expert[];
  pagination: ExpertRankingResponse["pagination"];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateFilter: (options: Partial<ExpertSearchOptions>) => void;
}

/**
 * TOP 전문가 훅 반환 타입
 */
export interface UseTopExpertsReturn {
  experts: Expert[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 전문가 통계 훅 반환 타입
 */
export interface UseExpertStatsReturn {
  stats: ExpertStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 카테고리별 아이콘 매핑
 */
export const CATEGORY_ICONS: Record<CategoryFilter, string> = {
  전체: "users",
  맛집: "utensils",
  교통: "car",
  액티비티: "waves",
  숙박: "bed",
  쇼핑: "shopping-bag",
  관광지: "map-pin",
};

/**
 * 카테고리별 색상 매핑
 */
export const CATEGORY_COLORS: Record<CategoryFilter, string> = {
  전체: "#6b7280",
  맛집: "#f59e0b",
  교통: "#3b82f6",
  액티비티: "#10b981",
  숙박: "#8b5cf6",
  쇼핑: "#ef4444",
  관광지: "#06b6d4",
};

/**
 * 정렬 옵션 라벨 매핑
 */
export const SORT_OPTIONS: Record<ExpertSortOption, string> = {
  points: "포인트순",
  answers: "답변수순",
  adoptRate: "채택률순",
};
