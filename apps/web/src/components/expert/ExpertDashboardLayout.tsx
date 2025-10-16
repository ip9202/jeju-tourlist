/**
 * 전문가 컴포넌트 통합 및 레이아웃 구성
 *
 * @description
 * - 모든 전문가 관련 컴포넌트를 통합
 * - 일관된 레이아웃 및 스타일링
 * - 반응형 디자인 적용
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

"use client";

import React from "react";
import { Expert } from "@/types/expert";
import { ExpertCard } from "./ExpertCard";
import { ExpertListItem } from "./ExpertListItem";
import {
  CategoryFilterComponent,
  SortFilter,
  FilterStatus,
} from "./CategoryFilter";
import { useExpertRanking, useExpertFilter } from "@/hooks/useExperts";
import {
  Trophy,
  Medal,
  Award,
  Users,
  RefreshCw,
  AlertCircle,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getResponsiveGridClasses } from "./responsive-utils";

interface ExpertDashboardLayoutProps {
  variant?: "card" | "list";
  showTopSection?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  initialCategory?: string;
  initialSortBy?: string;
  limit?: number;
  className?: string;
  onExpertClick?: (expert: Expert) => void;
}

export const ExpertDashboardLayout: React.FC<ExpertDashboardLayoutProps> = ({
  variant = "card",
  showTopSection = true,
  showFilters = true,
  showPagination = true,
  initialCategory = "전체",
  initialSortBy = "points",
  limit = 20,
  className = "",
  onExpertClick,
}) => {
  const [viewMode, setViewMode] = React.useState<"card" | "list">(variant);

  // 필터 상태 관리
  const {
    selectedCategory,
    sortBy,
    currentPage,
    updateCategory,
    updateSortBy,
    updatePage,
  } = useExpertFilter(initialCategory as any, initialSortBy as any);

  // 전문가 데이터 조회
  const { experts, pagination, isLoading, error, refetch, updateFilter } =
    useExpertRanking({
      category: selectedCategory,
      sortBy,
      page: currentPage,
      limit,
    });

  // 필터 변경 시 데이터 업데이트
  React.useEffect(() => {
    updateFilter({
      category: selectedCategory,
      sortBy,
      page: currentPage,
      limit,
    });
  }, [selectedCategory, sortBy, currentPage, limit, updateFilter]);

  const handleCategoryChange = (category: any) => {
    updateCategory(category);
  };

  const handleSortChange = (sort: any) => {
    updateSortBy(sort);
  };

  const handlePageChange = (page: number) => {
    updatePage(page);
  };

  const handleRefresh = () => {
    refetch();
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-500" />;
    return <span className="text-lg font-bold text-gray-500">{rank}</span>;
  };

  const renderTopSection = () => {
    if (!showTopSection || experts.length === 0) return null;

    const topExperts = experts.slice(0, 3);

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              TOP 전문가
            </h2>
            <p className="text-gray-600">
              가장 인기 있는 전문가들을 만나보세요
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">새로고침</span>
          </button>
        </div>

        <div
          className={cn(
            "grid",
            getResponsiveGridClasses("card").replace(
              "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
              "grid-cols-1 md:grid-cols-3"
            ),
            "gap-4 sm:gap-6"
          )}
        >
          {topExperts.map(expert => (
            <div
              key={expert.id}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onExpertClick?.(expert)}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-shrink-0">{getRankIcon(expert.rank)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {expert.name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {expert.nickname}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-600">
                    {expert.points.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">포인트</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">
                    {expert.totalAnswers}
                  </div>
                  <div className="text-xs text-gray-500">답변수</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">
                    {expert.adoptRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">채택률</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">필터 및 정렬</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("card")}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                viewMode === "card"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
              <span>카드</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <List className="w-4 h-4" />
              <span>리스트</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryFilterComponent
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            variant="pills"
            showIcons={true}
          />
          <SortFilter sortBy={sortBy} onSortChange={handleSortChange} />
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">전문가 정보를 불러오는 중...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              오류가 발생했습니다
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      );
    }

    if (experts.length === 0) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              전문가가 없습니다
            </h3>
            <p className="text-gray-600">
              {selectedCategory === "전체"
                ? "아직 등록된 전문가가 없습니다."
                : `${selectedCategory} 카테고리에 전문가가 없습니다.`}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <FilterStatus
          selectedCategory={selectedCategory}
          sortBy={sortBy}
          totalCount={pagination.totalCount}
        />

        {viewMode === "card" ? (
          <div
            className={cn(
              "grid",
              getResponsiveGridClasses("card"),
              "gap-4 sm:gap-6"
            )}
          >
            {experts.map(expert => (
              <ExpertCard
                key={expert.id}
                expert={expert}
                showRank={true}
                showBadges={true}
                showStats={true}
                onClick={onExpertClick}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {experts.map(expert => (
              <ExpertListItem
                key={expert.id}
                expert={expert}
                rank={expert.rank}
                showRank={true}
                showBadges={true}
                showStats={true}
                variant="default"
                onClick={onExpertClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderPagination = () => {
    if (!showPagination || pagination.totalPages <= 1) return null;

    const pages = [];
    const startPage = Math.max(1, pagination.currentPage - 2);
    const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrev}
          className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            pagination.hasPrev
              ? "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>이전</span>
        </button>

        {pages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              page === pagination.currentPage
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            )}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNext}
          className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            pagination.hasNext
              ? "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          <span>다음</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className={cn("space-y-8", className)}>
      {renderTopSection()}
      {renderFilters()}
      {renderContent()}
      {renderPagination()}
    </div>
  );
};
