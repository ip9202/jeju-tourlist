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

import React, { useState, useEffect } from "react";
import { Trophy, TrendingUp, Users, Award } from "lucide-react";

interface ExpertDashboardLayoutProps {
  variant?: "card" | "list";
  showTopSection?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  initialCategory?: string;
  initialSortBy?: string;
  limit?: number;
}

interface Expert {
  id: string;
  name: string;
  category: string;
  points: number;
  answerCount: number;
  helpfulCount: number;
  rank: number;
}

export function ExpertDashboardLayout({
  variant = "card",
  showTopSection = true,
  showFilters = true,
  showPagination = true,
  initialCategory = "전체",
  initialSortBy = "points",
  limit = 20,
}: ExpertDashboardLayoutProps) {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [page, setPage] = useState(1);

  const categories = [
    "전체",
    "관광지",
    "맛집",
    "숙박",
    "교통",
    "쇼핑",
    "액티비티",
  ];

  // 전문가 데이터 로드
  useEffect(() => {
    const loadExperts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/badges/experts/ranking?sortBy=${sortBy}&page=${page}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error("전문가 데이터를 불러올 수 없습니다");
        }

        const data = await response.json();
        setExperts(data.data?.experts || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다"
        );
      } finally {
        setLoading(false);
      }
    };

    loadExperts();
  }, [selectedCategory, sortBy, page, limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 상단 통계 섹션 */}
      {showTopSection && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">전체 전문가</p>
                <p className="text-2xl font-bold text-gray-900">
                  {experts.length || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">총 답변</p>
                <p className="text-2xl font-bold text-gray-900">
                  {experts.reduce((sum, e) => sum + (e.answerCount || 0), 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">도움이 된 답변</p>
                <p className="text-2xl font-bold text-gray-900">
                  {experts.reduce((sum, e) => sum + (e.helpfulCount || 0), 0)}
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">최고 포인트</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...experts.map(e => e.points || 0), 0)}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      )}

      {/* 필터 섹션 */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                value={selectedCategory}
                onChange={e => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                정렬
              </label>
              <select
                value={sortBy}
                onChange={e => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="points">포인트 높은순</option>
                <option value="answers">답변 많은순</option>
                <option value="helpful">도움이 된순</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 전문가 목록 */}
      <div
        className={
          variant === "card"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }
      >
        {experts.map((expert, _index) => (
          <div
            key={expert.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {expert.rank}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{expert.name}</h3>
                  <p className="text-sm text-gray-500">{expert.category}</p>
                </div>
              </div>
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">포인트</span>
                <span className="font-semibold text-gray-900">
                  {expert.points || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">답변 수</span>
                <span className="font-semibold text-gray-900">
                  {expert.answerCount || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">도움이 된 답변</span>
                <span className="font-semibold text-gray-900">
                  {expert.helpfulCount || 0}
                </span>
              </div>
            </div>

            <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
              프로필 보기
            </button>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {showPagination && experts.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            이전
          </button>
          <span className="text-sm text-gray-600">
            {page} / {Math.ceil(experts.length / limit)}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={experts.length < limit}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            다음
          </button>
        </div>
      )}

      {/* 빈 상태 */}
      {experts.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">전문가가 없습니다</p>
        </div>
      )}
    </div>
  );
}
