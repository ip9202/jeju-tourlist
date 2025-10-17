"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { SearchForm, type SearchFilters } from "./SearchForm";
import { SearchResults } from "./SearchResults";
import { Breadcrumb, Button } from "@jeju-tourlist/ui";
import { ArrowLeft, TrendingUp, Clock, MessageCircle } from "lucide-react";

/**
 * SearchPage 컴포넌트
 *
 * @description
 * - 검색 페이지의 전체 레이아웃을 담당
 * - 검색 폼과 결과를 조합
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - URL 파라미터 기반 검색 상태 관리
 *
 * @example
 * ```tsx
 * <SearchPage />
 * ```
 */
export const SearchPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: "",
    category: "",
    location: "",
    dateRange: "",
    isAnswered: false,
    hasImages: false,
    sortBy: "relevance",
  });
  const [hasSearched, setHasSearched] = useState(false);

  /**
   * 컴포넌트 마운트 시 URL 파라미터에서 검색 조건 로드
   */
  useEffect(() => {
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const location = searchParams.get("location") || "";
    const dateRange = searchParams.get("dateRange") || "";
    const isAnswered = searchParams.get("isAnswered") === "true";
    const hasImages = searchParams.get("hasImages") === "true";
    const sortBy = searchParams.get("sortBy") || "relevance";

    setSearchQuery(query);
    setSearchFilters({
      query,
      category,
      location,
      dateRange,
      isAnswered,
      hasImages,
      sortBy,
    });

    // URL에 검색 조건이 있으면 자동으로 검색 실행
    if (query) {
      setHasSearched(true);
    }
  }, [searchParams]);

  /**
   * 검색 실행 핸들러
   */
  const handleSearch = (filters: SearchFilters) => {
    setSearchQuery(String(filters.query));
    setSearchFilters(filters);
    setHasSearched(true);

    // URL 업데이트
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'string' && value !== "") {
        params.set(key, value);
      }
    });

    const newUrl = `/search?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  /**
   * 검색 초기화 핸들러
   */
  const handleReset = () => {
    setSearchQuery("");
    setSearchFilters({
      query: "",
      category: "",
      location: "",
      dateRange: "",
      isAnswered: false,
      hasImages: false,
      sortBy: "relevance",
    });
    setHasSearched(false);
    window.history.pushState({}, "", "/search");
  };

  /**
   * 뒤로가기 핸들러
   */
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 브레드크럼 네비게이션 */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: "홈", href: "/" },
              { label: "검색", href: "/search" },
            ]}
          />
        </div>

        {/* 검색 폼 */}
        <div className="mb-8">
          <SearchForm
            initialFilters={searchFilters}
            onSearch={handleSearch}
            onReset={handleReset}
          />
        </div>

        {/* 검색 결과 또는 인기 검색어 */}
        {hasSearched ? (
          <SearchResults query={searchQuery} filters={searchFilters} />
        ) : (
          <div className="space-y-8">
            {/* 인기 검색어 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                인기 검색어
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "제주도 여행 코스",
                  "제주도 맛집",
                  "제주도 숙박",
                  "제주도 렌터카",
                  "제주도 날씨",
                  "제주도 포토스팟",
                  "제주도 교통",
                  "제주도 쇼핑",
                ].map((keyword, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      handleSearch({ ...searchFilters, query: keyword })
                    }
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>

            {/* 최근 검색어 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                최근 검색어
              </h3>
              <div className="text-gray-500 text-sm">
                최근 검색어가 없습니다.
              </div>
            </div>

            {/* 검색 팁 */}
            <div className="bg-indigo-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                검색 팁
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-700">
                <div>
                  <h4 className="font-medium mb-2">키워드 검색</h4>
                  <p>
                    구체적인 키워드를 사용하면 더 정확한 결과를 얻을 수
                    있습니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">카테고리 필터</h4>
                  <p>
                    관심 있는 카테고리를 선택하여 관련 질문만 볼 수 있습니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">지역 필터</h4>
                  <p>특정 지역에 대한 질문만 검색할 수 있습니다.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">고급 검색</h4>
                  <p>
                    답변 완료 여부, 이미지 포함 등 다양한 조건으로 검색할 수
                    있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 하단 액션 버튼 */}
        {hasSearched && (
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 mt-8">
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Button>

            <div className="text-sm text-gray-500">
              검색어: &quot;{searchQuery}&quot; | 총 {searchQuery ? "검색 결과" : "질문"}{" "}
              수
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
