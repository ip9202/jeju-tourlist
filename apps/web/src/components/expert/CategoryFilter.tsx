/**
 * CategoryFilter 컴포넌트
 *
 * @description
 * - 전문가 카테고리 필터링을 위한 컴포넌트
 * - OCP(Open/Closed Principle) 적용
 * - 새로운 카테고리 추가 시 확장 가능
 * - 플랫 모던 디자인 적용
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

"use client";

import React from "react";
import { CategoryFilter, CATEGORY_COLORS } from "@/types/expert";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  selectedCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  categories?: CategoryFilter[];
  variant?: "default" | "compact" | "pills";
  showIcons?: boolean;
  showCounts?: boolean;
  categoryCounts?: Record<CategoryFilter, number>;
  className?: string;
}

export const CategoryFilterComponent: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  categories = ["전체", "맛집", "교통", "액티비티", "숙박", "쇼핑", "관광지"],
  variant = "default",
  showIcons = true,
  showCounts = false,
  categoryCounts,
  className = "",
}) => {
  const getCategoryColor = (category: CategoryFilter) => {
    return CATEGORY_COLORS[category] || "#6b7280";
  };

  const getCategoryCount = (category: CategoryFilter) => {
    if (!showCounts || !categoryCounts) return null;
    return categoryCounts[category] || 0;
  };

  if (variant === "compact") {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              "flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {showIcons && (
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor:
                    selectedCategory === category
                      ? "white"
                      : getCategoryColor(category),
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      selectedCategory === category
                        ? getCategoryColor(category)
                        : "white",
                  }}
                />
              </div>
            )}
            <span>{category}</span>
            {showCounts && getCategoryCount(category) !== null && (
              <span className="text-xs opacity-75">
                ({getCategoryCount(category)})
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === "pills") {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              selectedCategory === category ? "shadow-md" : "hover:shadow-sm",
              selectedCategory === category
                ? "text-white"
                : "text-gray-700 hover:text-gray-900"
            )}
            style={{
              backgroundColor:
                selectedCategory === category
                  ? getCategoryColor(category)
                  : "#f3f4f6",
            }}
          >
            {showIcons && (
              <div className="w-4 h-4 flex items-center justify-center">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      selectedCategory === category
                        ? "white"
                        : getCategoryColor(category),
                  }}
                />
              </div>
            )}
            <span>{category}</span>
            {showCounts && getCategoryCount(category) !== null && (
              <span className="text-xs opacity-75">
                {getCategoryCount(category)}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // 기본 variant
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">카테고리 필터</h3>
        {showCounts && (
          <span className="text-xs text-gray-500">
            총 {getCategoryCount("전체") || 0}명
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              "flex items-center space-x-2 p-3 rounded-lg text-sm font-medium transition-all duration-200",
              selectedCategory === category ? "shadow-sm" : "hover:shadow-sm",
              selectedCategory === category
                ? "text-white"
                : "text-gray-700 hover:text-gray-900"
            )}
            style={{
              backgroundColor:
                selectedCategory === category
                  ? getCategoryColor(category)
                  : "#f9fafb",
            }}
          >
            {showIcons && (
              <div className="w-5 h-5 flex items-center justify-center">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor:
                      selectedCategory === category
                        ? "white"
                        : getCategoryColor(category),
                  }}
                />
              </div>
            )}
            <div className="flex-1 text-left">
              <div>{category}</div>
              {showCounts && getCategoryCount(category) !== null && (
                <div className="text-xs opacity-75">
                  {getCategoryCount(category)}명
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// 추가적인 필터 옵션 컴포넌트
interface SortFilterProps {
  sortBy: "points" | "answers" | "adoptRate";
  onSortChange: (sortBy: "points" | "answers" | "adoptRate") => void;
  className?: string;
}

export const SortFilter: React.FC<SortFilterProps> = ({
  sortBy,
  onSortChange,
  className = "",
}) => {
  const sortOptions = [
    { value: "points", label: "포인트순", icon: "trending-up" },
    { value: "answers", label: "답변수순", icon: "message-circle" },
    { value: "adoptRate", label: "채택률순", icon: "target" },
  ] as const;

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-3">정렬 기준</h3>
      <div className="space-y-2">
        {sortOptions.map(option => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={cn(
              "flex items-center space-x-2 w-full p-2 rounded-lg text-sm font-medium transition-colors",
              sortBy === option.value
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center",
                sortBy === option.value ? "bg-blue-600" : "bg-gray-300"
              )}
            >
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// 필터 상태 표시 컴포넌트
interface FilterStatusProps {
  selectedCategory: CategoryFilter;
  sortBy: "points" | "answers" | "adoptRate";
  totalCount: number;
  className?: string;
}

export const FilterStatus: React.FC<FilterStatusProps> = ({
  selectedCategory,
  sortBy,
  totalCount,
  className = "",
}) => {
  const getSortLabel = (sort: string) => {
    const labels = {
      points: "포인트순",
      answers: "답변수순",
      adoptRate: "채택률순",
    };
    return labels[sort as keyof typeof labels] || sort;
  };

  return (
    <div
      className={`flex items-center justify-between text-sm text-gray-600 ${className}`}
    >
      <div className="flex items-center space-x-2">
        <span>
          {selectedCategory === "전체" ? "전체" : selectedCategory} 전문가
        </span>
        <span>•</span>
        <span>{getSortLabel(sortBy)}</span>
      </div>
      <div>총 {totalCount.toLocaleString()}명</div>
    </div>
  );
};
