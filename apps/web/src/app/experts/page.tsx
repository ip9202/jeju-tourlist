/**
 * 전문가 대시보드 페이지
 *
 * @description
 * - 전문가 랭킹 및 통계를 표시하는 메인 페이지
 * - 모든 전문가 컴포넌트를 통합
 * - 반응형 디자인 적용
 * - SEO 최적화
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

"use client";

import React from "react";
import { Metadata } from "next";
import { ExpertDashboardLayout } from "@/components/expert/ExpertDashboardLayout";
import { useExpertStats } from "@/hooks/useExperts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Trophy,
  Users,
  TrendingUp,
  Award,
  BarChart3,
  RefreshCw,
} from "lucide-react";

// 메타데이터 (서버 컴포넌트에서 사용)
export const metadata: Metadata = {
  title: "전문가 대시보드 | 동네물어봐",
  description:
    "제주도 여행 전문가들의 랭킹과 통계를 확인하세요. 맛집, 관광지, 숙박 등 카테고리별 전문가를 찾아보세요.",
  keywords: ["제주도", "전문가", "랭킹", "여행", "맛집", "관광지", "숙박"],
  openGraph: {
    title: "전문가 대시보드 | 동네물어봐",
    description: "제주도 여행 전문가들의 랭킹과 통계를 확인하세요.",
    type: "website",
  },
};

interface ExpertDashboardPageProps {
  searchParams?: {
    category?: string;
    sortBy?: string;
    page?: string;
  };
}

export default function ExpertDashboardPage({
  searchParams,
}: ExpertDashboardPageProps) {
  // 전문가 통계 데이터
  const { stats } = useExpertStats();

  const handleExpertClick = (expert: any) => {
    // 전문가 상세 페이지로 이동 (추후 구현)
    console.log("전문가 클릭:", expert);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                전문가 대시보드
              </h1>
              <p className="text-lg text-gray-600">
                제주도 여행 전문가들의 랭킹과 통계를 확인하세요
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">새로고침</span>
              </button>
            </div>
          </div>

          {/* 통계 카드 */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.totalExperts.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">총 전문가</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.averageRating.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500">평균 평점</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.topCategory}
                    </div>
                    <div className="text-sm text-gray-500">인기 카테고리</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Object.keys(stats.categoryDistribution).length - 1}
                    </div>
                    <div className="text-sm text-gray-500">활성 카테고리</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 전문가 랭킹 */}
        <ExpertDashboardLayout
          variant="card"
          showTopSection={true}
          showFilters={true}
          showPagination={true}
          initialCategory={searchParams?.category || "전체"}
          initialSortBy={searchParams?.sortBy || "points"}
          limit={20}
          onExpertClick={handleExpertClick}
        />

        {/* 카테고리별 분포 차트 (추후 구현) */}
        {stats && (
          <div className="mt-12">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                카테고리별 전문가 분포
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(stats.categoryDistribution)
                  .filter(([key]) => key !== "전체")
                  .map(([category, count]) => (
                    <div key={category} className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Award className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {count}
                      </div>
                      <div className="text-xs text-gray-500">{category}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
