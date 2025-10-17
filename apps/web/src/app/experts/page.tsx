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

import React from "react";
import { Metadata } from "next";
import { ExpertDashboardLayout } from "@/components/expert/ExpertDashboardLayout";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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
          </div>

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
        />

      </main>

      <Footer />
    </div>
  );
}
