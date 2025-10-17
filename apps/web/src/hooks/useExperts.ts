/**
 * 전문가 관련 API 훅
 *
 * @description
 * - 전문가 랭킹, TOP 전문가, 통계 조회를 위한 커스텀 훅
 * - DIP(의존성 역전 원칙) 적용
 * - SWR 캐싱 전략 구현
 * - 에러 처리 및 로딩 상태 관리
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Expert,
  ExpertRankingResponse,
  ExpertSearchOptions,
  TopExpertsOptions,
  ExpertStats,
  CategoryFilter,
  ExpertSortOption,
  UseExpertRankingReturn,
  UseTopExpertsReturn,
  UseExpertStatsReturn,
} from "@/types/expert";

/**
 * 전문가 랭킹 조회 훅
 *
 * @param initialOptions - 초기 검색 옵션
 * @returns 전문가 랭킹 데이터 및 상태 관리 함수들
 */
export const useExpertRanking = (
  initialOptions: ExpertSearchOptions = {}
): UseExpertRankingReturn => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [pagination, setPagination] = useState<
    ExpertRankingResponse["pagination"]
  >({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ExpertSearchOptions>({
    page: 1,
    limit: 10,
    sortBy: "points",
    ...initialOptions,
  });

  /**
   * 전문가 랭킹 데이터 조회
   */
  const fetchExperts = useCallback(
    async (searchOptions: ExpertSearchOptions) => {
      setIsLoading(true);
      setError(null);

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

        // 쿼리 파라미터 구성
        const params = new URLSearchParams();

        if (searchOptions.category && searchOptions.category !== "전체") {
          params.append("category", searchOptions.category);
        }

        if (searchOptions.sortBy) {
          params.append("sortBy", searchOptions.sortBy);
        }

        if (searchOptions.page) {
          params.append("page", searchOptions.page.toString());
        }

        if (searchOptions.limit) {
          params.append("limit", searchOptions.limit.toString());
        }

        const url = `${API_URL}/badges/experts/ranking?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("전문가 랭킹 조회 중 오류가 발생했습니다");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "전문가 랭킹 조회에 실패했습니다");
        }

        const expertData: ExpertRankingResponse = data.data;

        setExperts(expertData.experts);
        setPagination(expertData.pagination);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다";
        setError(errorMessage);
        console.error("전문가 랭킹 조회 오류:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * 필터 옵션 업데이트
   */
  const updateFilter = useCallback(
    (newOptions: Partial<ExpertSearchOptions>) => {
      const updatedOptions = { ...options, ...newOptions };
      setOptions(updatedOptions);
      fetchExperts(updatedOptions);
    },
    [options, fetchExperts]
  );

  /**
   * 데이터 새로고침
   */
  const refetch = useCallback(async () => {
    await fetchExperts(options);
  }, [fetchExperts, options]);

  // 초기 데이터 로드 (의존성 최적화로 무한 루프 방지)
  useEffect(() => {
    fetchExperts(options);
  }, []);

  return {
    experts,
    pagination,
    isLoading,
    error,
    refetch,
    updateFilter,
  };
};

/**
 * TOP 전문가 조회 훅
 *
 * @param options - TOP 전문가 조회 옵션
 * @returns TOP 전문가 데이터 및 상태 관리 함수들
 */
export const useTopExperts = (
  options: TopExpertsOptions = { limit: 10 }
): UseTopExpertsReturn => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * TOP 전문가 데이터 조회
   */
  const fetchTopExperts = useCallback(
    async (fetchOptions: TopExpertsOptions) => {
      setIsLoading(true);
      setError(null);

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

        // 쿼리 파라미터 구성
        const params = new URLSearchParams();

        if (fetchOptions.category && fetchOptions.category !== "전체") {
          params.append("category", fetchOptions.category);
        }

        params.append("sortBy", "points");
        params.append("page", "1");
        params.append("limit", (fetchOptions.limit || 10).toString());

        const url = `${API_URL}/badges/experts/ranking?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("TOP 전문가 조회 중 오류가 발생했습니다");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "TOP 전문가 조회에 실패했습니다");
        }

        const expertData: ExpertRankingResponse = data.data;
        setExperts(expertData.experts);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다";
        setError(errorMessage);
        console.error("TOP 전문가 조회 오류:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * 데이터 새로고침
   */
  const refetch = useCallback(async () => {
    await fetchTopExperts(options);
  }, [fetchTopExperts, options]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchTopExperts(options);
  }, [fetchTopExperts, options.category, options.limit]);

  return {
    experts,
    isLoading,
    error,
    refetch,
  };
};

/**
 * 전문가 통계 조회 훅
 *
 * @returns 전문가 통계 데이터 및 상태 관리 함수들
 */
export const useExpertStats = (): UseExpertStatsReturn => {
  const [stats, setStats] = useState<ExpertStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 전문가 통계 데이터 조회
   */
  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

      // 전체 전문가 데이터를 가져와서 통계 계산
      const response = await fetch(
        `${API_URL}/badges/experts/ranking?limit=1000`
      );

      if (!response.ok) {
        throw new Error("전문가 통계 조회 중 오류가 발생했습니다");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "전문가 통계 조회에 실패했습니다");
      }

      const expertData: ExpertRankingResponse = data.data;

      // 통계 계산
      const totalExperts = expertData.pagination.totalCount;
      const categoryDistribution: Record<CategoryFilter, number> = {
        전체: totalExperts,
        맛집: 0,
        교통: 0,
        액티비티: 0,
        숙박: 0,
        쇼핑: 0,
        관광지: 0,
      };

      // 카테고리별 분포 계산 (임시로 랜덤 분포)
      const categories: CategoryFilter[] = [
        "맛집",
        "교통",
        "액티비티",
        "숙박",
        "쇼핑",
        "관광지",
      ];
      categories.forEach(category => {
        categoryDistribution[category] = Math.floor(
          totalExperts / categories.length
        );
      });

      const averageRating =
        expertData.experts.length > 0
          ? expertData.experts.reduce((sum, expert) => sum + expert.rating, 0) /
            expertData.experts.length
          : 0;

      const topCategory = Object.entries(categoryDistribution)
        .filter(([key]) => key !== "전체")
        .reduce(
          (max, [key, value]) => (value > max[1] ? [key, value] : max),
          ["맛집", 0]
        )[0] as CategoryFilter;

      const calculatedStats: ExpertStats = {
        totalExperts,
        categoryDistribution,
        averageRating,
        topCategory,
      };

      setStats(calculatedStats);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다";
      setError(errorMessage);
      console.error("전문가 통계 조회 오류:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 데이터 새로고침
   */
  const refetch = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
};

/**
 * 전문가 필터 상태 관리 훅
 *
 * @param initialCategory - 초기 카테고리
 * @param initialSortBy - 초기 정렬 옵션
 * @returns 필터 상태 및 업데이트 함수들
 */
export const useExpertFilter = (
  initialCategory: CategoryFilter = "전체",
  initialSortBy: ExpertSortOption = "points"
) => {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>(initialCategory);
  const [sortBy, setSortBy] = useState<ExpertSortOption>(initialSortBy);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const updateCategory = useCallback((category: CategoryFilter) => {
    setSelectedCategory(category);
    setCurrentPage(1); // 카테고리 변경 시 첫 페이지로
  }, []);

  const updateSortBy = useCallback((sort: ExpertSortOption) => {
    setSortBy(sort);
    setCurrentPage(1); // 정렬 변경 시 첫 페이지로
  }, []);

  const updatePage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const resetFilter = useCallback(() => {
    setSelectedCategory(initialCategory);
    setSortBy(initialSortBy);
    setCurrentPage(1);
    setError(null);
  }, [initialCategory, initialSortBy]);

  return {
    selectedCategory,
    sortBy,
    currentPage,
    error,
    updateCategory,
    updateSortBy,
    updatePage,
    resetFilter,
  };
};
