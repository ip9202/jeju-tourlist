/**
 * 접근성 개선 컴포넌트들
 * 
 * @description
 * - 전문가 대시보드의 접근성을 개선하기 위한 컴포넌트들
 * - ARIA 라벨, 키보드 네비게이션, 스크린 리더 지원
 * - WCAG 2.1 AA 수준 준수
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

"use client";

import React, { useRef, useEffect, useState } from "react";
import { Expert } from "@/types/expert";
import { BadgeInfo } from "@/types/badge";
import { 
  Star, 
  MessageCircle, 
  TrendingUp, 
  Award,
  ChevronLeft,
  ChevronRight,
  Users,
  Filter,
  SortAsc,
  SortDesc
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 접근성 개선된 버튼 컴포넌트
 */
interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    children,
    onClick,
    disabled = false,
    variant = "primary",
    size = "md",
    ariaLabel,
    ariaDescribedBy,
    className = "",
    type = "button",
    ...props
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variantClasses = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-300 disabled:text-gray-500",
      secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 disabled:bg-gray-50 disabled:text-gray-400",
      ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";

/**
 * 접근성 개선된 카드 컴포넌트
 */
interface AccessibleCardProps {
  expert: Expert;
  onClick?: (expert: Expert) => void;
  variant?: "default" | "compact" | "detailed";
  showRank?: boolean;
  showBadges?: boolean;
  showStats?: boolean;
  className?: string;
}

export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  expert,
  onClick,
  variant = "default",
  showRank = true,
  showBadges = true,
  showStats = true,
  className = ""
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleClick = () => {
    onClick?.(expert);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const getPrimaryBadgeColor = (badge: BadgeInfo | null) => {
    if (!badge?.category) return "#6b7280";
    const colors = {
      맛집: "#f59e0b",
      교통: "#3b82f6",
      액티비티: "#10b981",
      숙박: "#8b5cf6",
      쇼핑: "#ef4444",
      관광지: "#06b6d4",
    };
    return colors[badge.category as keyof typeof colors] || "#6b7280";
  };

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer",
        isFocused && "ring-2 ring-blue-500 ring-offset-2",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      aria-label={`${expert.name} 전문가 프로필 보기`}
      aria-describedby={`expert-${expert.id}-description`}
    >
      <div className="flex items-center space-x-3 mb-3">
        {/* 아바타 */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {expert.avatar ? (
              <img
                src={expert.avatar}
                alt={`${expert.name}의 프로필 이미지`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                {expert.name[0]}
              </div>
            )}
          </div>
          {showRank && expert.rank <= 10 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
              {expert.rank}
            </div>
          )}
        </div>

        {/* 기본 정보 */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{expert.name}</h3>
          <p className="text-sm text-gray-600">{expert.nickname}</p>
          {expert.primaryBadge && (
            <div
              className="text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center mt-1"
              style={{ 
                backgroundColor: getPrimaryBadgeColor(expert.primaryBadge) + "20", 
                color: getPrimaryBadgeColor(expert.primaryBadge) 
              }}
            >
              <Award className="w-3 h-3 mr-1" />
              {expert.primaryBadge.name}
            </div>
          )}
        </div>

        {/* 포인트 */}
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            {expert.points.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">포인트</div>
        </div>
      </div>

      {/* 통계 정보 */}
      {showStats && (
        <div className="grid grid-cols-3 gap-3 mb-3" role="group" aria-label="전문가 통계">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Star className="w-4 h-4 text-yellow-500" aria-hidden="true" />
              <span className="font-semibold text-gray-900">
                {expert.rating.toFixed(1)}
              </span>
            </div>
            <div className="text-xs text-gray-500">평점</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <MessageCircle className="w-4 h-4 text-blue-500" aria-hidden="true" />
              <span className="font-semibold text-gray-900">
                {expert.totalAnswers}
              </span>
            </div>
            <div className="text-xs text-gray-500">답변수</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" aria-hidden="true" />
              <span className="font-semibold text-gray-900">
                {expert.adoptRate.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-500">채택률</div>
          </div>
        </div>
      )}

      {/* 배지 */}
      {showBadges && expert.badges.length > 0 && (
        <div className="flex flex-wrap gap-1" role="group" aria-label="전문가 배지">
          {expert.badges.slice(0, 3).map(badge => (
            <div
              key={badge.id}
              className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
              aria-label={`${badge.name} 배지`}
            >
              <span aria-hidden="true">{badge.emoji}</span>
              <span className="text-gray-700">{badge.name}</span>
            </div>
          ))}
          {expert.badges.length > 3 && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
              <span className="text-gray-500">
                +{expert.badges.length - 3}개 더
              </span>
            </div>
          )}
        </div>
      )}

      {/* 숨겨진 설명 (스크린 리더용) */}
      <div id={`expert-${expert.id}-description`} className="sr-only">
        {expert.name}은 {expert.totalAnswers}개의 답변을 작성했으며, 
        {expert.adoptRate.toFixed(1)}%의 채택률을 가지고 있습니다. 
        평점은 {expert.rating.toFixed(1)}점이며, 총 {expert.points.toLocaleString()}포인트를 보유하고 있습니다.
        {expert.badges.length > 0 && ` 보유한 배지는 ${expert.badges.map(b => b.name).join(', ')}입니다.`}
      </div>
    </div>
  );
};

/**
 * 접근성 개선된 필터 컴포넌트
 */
interface AccessibleFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  className?: string;
}

export const AccessibleFilter: React.FC<AccessibleFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  categories,
  className = ""
}) => {
  const filterRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={filterRef}
      className={cn("flex flex-wrap gap-2", className)}
      role="tablist"
      aria-label="카테고리 필터"
    >
      {categories.map((category, index) => (
        <button
          key={category}
          role="tab"
          aria-selected={selectedCategory === category}
          aria-controls={`panel-${category}`}
          tabIndex={selectedCategory === category ? 0 : -1}
          className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
            selectedCategory === category
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
          onClick={() => onCategoryChange(category)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              const nextIndex = (index + 1) % categories.length;
              onCategoryChange(categories[nextIndex]);
            } else if (e.key === "ArrowLeft") {
              const prevIndex = (index - 1 + categories.length) % categories.length;
              onCategoryChange(categories[prevIndex]);
            }
          }}
        >
          <Filter className="w-4 h-4" aria-hidden="true" />
          <span>{category}</span>
        </button>
      ))}
    </div>
  );
};

/**
 * 접근성 개선된 정렬 컴포넌트
 */
interface AccessibleSortProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  sortOptions: { value: string; label: string }[];
  className?: string;
}

export const AccessibleSort: React.FC<AccessibleSortProps> = ({
  sortBy,
  onSortChange,
  sortOptions,
  className = ""
}) => {
  return (
    <div className={cn("flex space-x-2", className)} role="group" aria-label="정렬 옵션">
      {sortOptions.map((option) => (
        <AccessibleButton
          key={option.value}
          variant={sortBy === option.value ? "primary" : "secondary"}
          size="sm"
          onClick={() => onSortChange(option.value)}
          ariaLabel={`${option.label}로 정렬`}
        >
          {sortBy === option.value ? (
            <SortDesc className="w-4 h-4 mr-1" aria-hidden="true" />
          ) : (
            <SortAsc className="w-4 h-4 mr-1" aria-hidden="true" />
          )}
          {option.label}
        </AccessibleButton>
      ))}
    </div>
  );
};

/**
 * 접근성 개선된 페이징 컴포넌트
 */
interface AccessiblePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const AccessiblePagination: React.FC<AccessiblePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ""
}) => {
  const paginationRef = useRef<HTMLDivElement>(null);

  const pages = [];
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <nav
      ref={paginationRef}
      className={cn("flex items-center justify-center space-x-2", className)}
      role="navigation"
      aria-label="페이지 네비게이션"
    >
      <AccessibleButton
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        ariaLabel="이전 페이지로 이동"
      >
        <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
        이전
      </AccessibleButton>

      {pages.map(page => (
        <AccessibleButton
          key={page}
          variant={page === currentPage ? "primary" : "secondary"}
          size="sm"
          onClick={() => onPageChange(page)}
          ariaLabel={`${page}페이지로 이동`}
        >
          {page}
        </AccessibleButton>
      ))}

      <AccessibleButton
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        ariaLabel="다음 페이지로 이동"
      >
        다음
        <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
      </AccessibleButton>
    </nav>
  );
};

/**
 * 접근성 개선된 통계 카드
 */
interface AccessibleStatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

export const AccessibleStatsCard: React.FC<AccessibleStatsCardProps> = ({
  title,
  value,
  description,
  icon,
  className = ""
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-6",
        className
      )}
      role="region"
      aria-labelledby={`stats-${title}`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center" aria-hidden="true">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900" aria-describedby={`stats-${title}-desc`}>
            {value}
          </div>
          <div className="text-sm text-gray-500" id={`stats-${title}`}>
            {title}
          </div>
        </div>
      </div>
      <div id={`stats-${title}-desc`} className="sr-only">
        {description}
      </div>
    </div>
  );
};

/**
 * 스크린 리더 전용 텍스트
 */
interface ScreenReaderOnlyProps {
  children: React.ReactNode;
}

export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({ children }) => (
  <span className="sr-only">{children}</span>
);
