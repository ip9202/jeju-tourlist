import { useState } from "react";

export interface Question {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  answerCount: number;
  createdAt: string;
  viewCount: number;
  likeCount: number;
  isResolved?: boolean;
}

export interface SearchFilters {
  categoryId?: string;
  status?: "all" | "answered" | "unanswered";
  sortBy?: "createdAt" | "viewCount" | "likeCount";
  sortOrder?: "asc" | "desc";
}

export interface SearchOptions extends SearchFilters {
  query?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  questions: Question[];
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
 * 질문 검색을 위한 커스텀 훅
 *
 * @description
 * - 질문 검색 API 호출을 위한 공통 로직
 * - 검색, 필터링, 페이지네이션 지원
 * - 일관된 데이터 형식 제공
 */
export const useQuestionSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 질문 검색 실행
   *
   * @param options - 검색 옵션
   * @returns 검색 결과
   */
  const searchQuestions = async (
    options: SearchOptions
  ): Promise<SearchResult> => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 useQuestionSearch 호출:", options);
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

      // 쿼리 파라미터 구성
      const params = new URLSearchParams();

      if (options.query) {
        params.append("query", options.query);
        console.log("🔍 검색어 추가:", options.query);
      }

      if (options.categoryId) {
        params.append("categoryId", options.categoryId);
      }

      if (options.status === "answered") {
        params.append("isResolved", "true");
      } else if (options.status === "unanswered") {
        params.append("isResolved", "false");
      }

      if (options.sortBy) {
        params.append("sortBy", options.sortBy);
      }

      if (options.sortOrder) {
        params.append("sortOrder", options.sortOrder);
      }

      if (options.page) {
        params.append("page", options.page.toString());
      }

      if (options.limit) {
        params.append("limit", options.limit.toString());
      }

      const url = `${API_URL}/questions?${params.toString()}`;
      console.log("🔍 API 호출 URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        console.error(
          "🔍 API 응답 오류:",
          response.status,
          response.statusText
        );
        throw new Error("검색 중 오류가 발생했습니다");
      }

      const data = await response.json();
      console.log("🔍 API 응답 데이터:", data);

      // API 응답 데이터를 Question 인터페이스에 맞게 변환
      const transformedQuestions: Question[] = data.data.map((q: any) => ({
        id: q.id,
        title: q.title,
        content: q.content,
        author: {
          id: q.author.id,
          name: q.author.name,
        },
        category: q.category
          ? {
              id: q.category.id,
              name: q.category.name,
            }
          : undefined,
        answerCount: q.answerCount || 0,
        createdAt: q.createdAt,
        viewCount: q.viewCount || 0,
        likeCount: q.likeCount || 0,
        isResolved: q.isResolved || false,
      }));

      return {
        questions: transformedQuestions,
        pagination: data.pagination || {
          page: 1,
          limit: 20,
          total: transformedQuestions.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "검색 중 오류가 발생했습니다";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    searchQuestions,
    loading,
    error,
  };
};
