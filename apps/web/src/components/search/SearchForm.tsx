"use client";

import React, { useState } from "react";
import { Button, Input, Select, Checkbox } from "@jeju-tourlist/ui";
import { Search, Filter, Calendar, MapPin, Tag, X } from "lucide-react";

/**
 * 검색 필터 데이터 타입
 */
export interface SearchFilters {
  query: string;
  category: string;
  location: string;
  dateRange: string;
  isAnswered: boolean;
  hasImages: boolean;
  sortBy: string;
}

/**
 * SearchForm 컴포넌트 Props
 */
interface SearchFormProps {
  initialFilters?: Partial<SearchFilters>;
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
  className?: string;
}

/**
 * SearchForm 컴포넌트
 *
 * @description
 * - 고급 검색 폼을 담당하는 컴포넌트
 * - 다양한 필터 옵션과 검색 조건을 제공
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 폼 상태 관리 및 유효성 검증
 *
 * @example
 * ```tsx
 * <SearchForm
 *   onSearch={handleSearch}
 *   onReset={handleReset}
 * />
 * ```
 */
export const SearchForm: React.FC<SearchFormProps> = ({
  initialFilters = {},
  onSearch,
  onReset,
  className = "",
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "",
    location: "",
    dateRange: "",
    isAnswered: false,
    hasImages: false,
    sortBy: "relevance",
    ...initialFilters,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  /**
   * 필터 옵션 데이터
   */
  const categoryOptions = [
    { value: "", label: "전체 카테고리" },
    { value: "travel", label: "여행" },
    { value: "food", label: "맛집" },
    { value: "accommodation", label: "숙박" },
    { value: "transportation", label: "교통" },
    { value: "shopping", label: "쇼핑" },
    { value: "photo", label: "포토스팟" },
    { value: "general", label: "일반" },
  ];

  const locationOptions = [
    { value: "", label: "전체 지역" },
    { value: "jeju-si", label: "제주시" },
    { value: "seogwipo-si", label: "서귀포시" },
    { value: "jeju-island", label: "제주도 전체" },
  ];

  const dateRangeOptions = [
    { value: "", label: "전체 기간" },
    { value: "today", label: "오늘" },
    { value: "week", label: "이번 주" },
    { value: "month", label: "이번 달" },
    { value: "year", label: "올해" },
  ];

  const sortOptions = [
    { value: "relevance", label: "관련도순" },
    { value: "latest", label: "최신순" },
    { value: "oldest", label: "오래된순" },
    { value: "popular", label: "인기순" },
    { value: "answered", label: "답변완료순" },
  ];

  /**
   * 필터 값 변경 핸들러
   */
  const handleFilterChange = (
    key: keyof SearchFilters,
    value: string | boolean
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * 검색 실행 핸들러
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  /**
   * 필터 초기화 핸들러
   */
  const handleReset = () => {
    setFilters({
      query: "",
      category: "",
      location: "",
      dateRange: "",
      isAnswered: false,
      hasImages: false,
      sortBy: "relevance",
    });
    onReset();
  };

  /**
   * 고급 검색 토글 핸들러
   */
  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      <form onSubmit={handleSearch} className="space-y-4">
        {/* 기본 검색 */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="제주 여행에 대해 검색해보세요..."
              value={filters.query}
              onChange={e => handleFilterChange("query", e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" variant="primary" className="px-8">
            <Search className="h-4 w-4 mr-2" />
            검색
          </Button>
        </div>

        {/* 고급 검색 토글 */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={toggleAdvanced}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Filter className="h-4 w-4 mr-1" />
            고급 검색
            {showAdvanced ? " 숨기기" : " 보기"}
          </button>

          {Object.values(filters).some(
            value => value !== "" && value !== false && value !== "relevance"
          ) && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-4 w-4 mr-1" />
              초기화
            </button>
          )}
        </div>

        {/* 고급 검색 옵션 */}
        {showAdvanced && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 카테고리 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="h-4 w-4 inline mr-1" />
                  카테고리
                </label>
                <Select
                  value={filters.category}
                  onChange={value => handleFilterChange("category", String(value))}
                  options={categoryOptions}
                />
              </div>

              {/* 지역 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  지역
                </label>
                <Select
                  value={filters.location}
                  onChange={value => handleFilterChange("location", String(value))}
                  options={locationOptions}
                />
              </div>

              {/* 기간 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  기간
                </label>
                <Select
                  value={filters.dateRange}
                  onChange={value => handleFilterChange("dateRange", String(value))}
                  options={dateRangeOptions}
                />
              </div>

              {/* 정렬 옵션 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정렬
                </label>
                <Select
                  value={filters.sortBy}
                  onChange={value => handleFilterChange("sortBy", String(value))}
                  options={sortOptions}
                />
              </div>
            </div>

            {/* 체크박스 옵션 */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center">
                <Checkbox
                  checked={filters.isAnswered}
                  onChange={checked =>
                    handleFilterChange("isAnswered", checked)
                  }
                />
                <span className="ml-2 text-sm text-gray-700">
                  답변 완료된 질문만
                </span>
              </label>

              <label className="flex items-center">
                <Checkbox
                  checked={filters.hasImages}
                  onChange={checked => handleFilterChange("hasImages", checked)}
                />
                <span className="ml-2 text-sm text-gray-700">
                  이미지가 있는 질문만
                </span>
              </label>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
