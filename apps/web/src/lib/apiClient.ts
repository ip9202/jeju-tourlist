/**
 * API 클라이언트
 * 간단한 fetch 래퍼
 */

import { AUTH_CONSTANTS, API_CONSTANTS } from "./constants";
import {
  Expert,
  ExpertRankingResponse,
  ExpertSearchOptions,
  TopExpertsOptions,
  ExpertStats,
  CategoryFilter,
} from "@/types/expert";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY)
        : null;

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  async get<T = any>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${path}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      return await response.json();
    } catch (error) {
      console.error("API GET error:", error);
      return {
        success: false,
        message: "네트워크 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async post<T = any>(path: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${path}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      return await response.json();
    } catch (error) {
      console.error("API POST error:", error);
      return {
        success: false,
        message: "네트워크 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async put<T = any>(path: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${path}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      return await response.json();
    } catch (error) {
      console.error("API PUT error:", error);
      return {
        success: false,
        message: "네트워크 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async delete<T = any>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${path}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      return await response.json();
    } catch (error) {
      console.error("API DELETE error:", error);
      return {
        success: false,
        message: "네트워크 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ==================== 전문가 관련 API 메서드 ====================

  /**
   * 전문가 랭킹 조회
   *
   * @param options - 검색 옵션
   * @returns 전문가 랭킹 응답
   */
  async getExpertRanking(
    options: ExpertSearchOptions = {}
  ): Promise<ApiResponse<ExpertRankingResponse>> {
    try {
      const params = new URLSearchParams();

      if (options.category && options.category !== "전체") {
        params.append("category", options.category);
      }

      if (options.sortBy) {
        params.append("sortBy", options.sortBy);
      }

      if (options.page) {
        params.append("page", options.page.toString());
      }

      if (options.limit) {
        params.append("limit", options.limit.toString());
      }

      const queryString = params.toString();
      const path = `/badges/experts/ranking${queryString ? `?${queryString}` : ""}`;

      return await this.get<ExpertRankingResponse>(path);
    } catch (error) {
      console.error("전문가 랭킹 조회 오류:", error);
      return {
        success: false,
        message: "전문가 랭킹 조회 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * TOP 전문가 조회
   *
   * @param options - TOP 전문가 조회 옵션
   * @returns TOP 전문가 응답
   */
  async getTopExperts(
    options: TopExpertsOptions = {}
  ): Promise<ApiResponse<ExpertRankingResponse>> {
    try {
      const searchOptions: ExpertSearchOptions = {
        sortBy: "points",
        page: 1,
        limit: options.limit || 10,
        category: options.category,
      };

      return await this.getExpertRanking(searchOptions);
    } catch (error) {
      console.error("TOP 전문가 조회 오류:", error);
      return {
        success: false,
        message: "TOP 전문가 조회 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * 카테고리별 전문가 조회
   *
   * @param category - 카테고리
   * @param options - 추가 옵션
   * @returns 카테고리별 전문가 응답
   */
  async getExpertsByCategory(
    category: CategoryFilter,
    options: Omit<ExpertSearchOptions, "category"> = {}
  ): Promise<ApiResponse<ExpertRankingResponse>> {
    try {
      const searchOptions: ExpertSearchOptions = {
        ...options,
        category,
      };

      return await this.getExpertRanking(searchOptions);
    } catch (error) {
      console.error("카테고리별 전문가 조회 오류:", error);
      return {
        success: false,
        message: "카테고리별 전문가 조회 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * 전문가 상세 정보 조회
   *
   * @param expertId - 전문가 ID
   * @returns 전문가 상세 정보
   */
  async getExpertDetail(expertId: string): Promise<ApiResponse<Expert>> {
    try {
      // 현재는 기본 전문가 정보만 반환
      // 추후 상세 정보 API가 추가되면 확장
      const response = await this.get<ExpertRankingResponse>(
        `/badges/experts/ranking?limit=1000`
      );

      if (!response.success || !response.data) {
        throw new Error("전문가 정보를 찾을 수 없습니다.");
      }

      const expert = response.data.experts.find(e => e.id === expertId);

      if (!expert) {
        throw new Error("전문가를 찾을 수 없습니다.");
      }

      return {
        success: true,
        message: "전문가 상세 정보를 조회했습니다.",
        data: expert,
      };
    } catch (error) {
      console.error("전문가 상세 정보 조회 오류:", error);
      return {
        success: false,
        message: "전문가 상세 정보 조회 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * 전문가 통계 조회
   *
   * @returns 전문가 통계 정보
   */
  async getExpertStats(): Promise<ApiResponse<ExpertStats>> {
    try {
      // 전체 전문가 데이터를 가져와서 통계 계산
      const response = await this.get<ExpertRankingResponse>(
        "/badges/experts/ranking?limit=1000"
      );

      if (!response.success || !response.data) {
        throw new Error("전문가 통계를 조회할 수 없습니다.");
      }

      const expertData = response.data;
      const totalExperts = expertData.pagination.totalCount;

      // 카테고리별 분포 계산 (임시로 랜덤 분포)
      const categoryDistribution: Record<CategoryFilter, number> = {
        전체: totalExperts,
        맛집: Math.floor(totalExperts * 0.25),
        교통: Math.floor(totalExperts * 0.15),
        액티비티: Math.floor(totalExperts * 0.2),
        숙박: Math.floor(totalExperts * 0.15),
        쇼핑: Math.floor(totalExperts * 0.1),
        관광지: Math.floor(totalExperts * 0.15),
      };

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

      const stats: ExpertStats = {
        totalExperts,
        categoryDistribution,
        averageRating,
        topCategory,
      };

      return {
        success: true,
        message: "전문가 통계를 조회했습니다.",
        data: stats,
      };
    } catch (error) {
      console.error("전문가 통계 조회 오류:", error);
      return {
        success: false,
        message: "전문가 통계 조회 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * 전문가 검색
   *
   * @param query - 검색어
   * @param options - 검색 옵션
   * @returns 검색 결과
   */
  async searchExperts(
    query: string,
    options: Omit<ExpertSearchOptions, "query"> = {}
  ): Promise<ApiResponse<ExpertRankingResponse>> {
    try {
      // 현재는 기본 랭킹 조회로 대체
      // 추후 검색 API가 추가되면 확장
      const searchOptions: ExpertSearchOptions = {
        ...options,
      };

      return await this.getExpertRanking(searchOptions);
    } catch (error) {
      console.error("전문가 검색 오류:", error);
      return {
        success: false,
        message: "전문가 검색 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const api = new ApiClient(API_CONSTANTS.BASE_URL);
