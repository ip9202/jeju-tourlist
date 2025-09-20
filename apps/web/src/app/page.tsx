import React from "react";
import { Metadata } from "next";
import { MainLayout } from "@/components/layout";
import {
  HeroSection,
  RealtimeBanner,
  PopularQuestions,
  FeatureCards,
} from "@/components/home";
import { generateMetadata, generateWebsiteStructuredData } from "@/lib/seo";

/**
 * 홈페이지 메타데이터
 * 
 * @description
 * - SEO 최적화된 메타데이터 설정
 * - Open Graph 및 Twitter Card 포함
 * - 구조화된 데이터 포함
 */
export const metadata: Metadata = generateMetadata({
  title: "동네물어봐 - 제주 여행 Q&A 커뮤니티",
  description: "제주 여행에 대한 모든 질문과 답변을 공유하는 커뮤니티입니다. 현지인과 여행자들이 함께 만들어가는 제주 여행 정보 플랫폼.",
  keywords: ["제주여행", "제주관광", "제주맛집", "제주숙소", "제주질문", "제주답변", "제주커뮤니티", "제주여행정보"],
  url: "/",
  type: "website",
});

/**
 * 홈페이지 컴포넌트
 * 
 * @description
 * - 서버 컴포넌트로 렌더링
 * - SEO 최적화된 구조
 * - 구조화된 데이터 포함
 */
export default function Home() {
  // 구조화된 데이터 생성
  const structuredData = generateWebsiteStructuredData();

  return (
    <>
      {/* 구조화된 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 히어로 섹션 */}
          <HeroSection className="py-16" />

          {/* 실시간 질문 배너 */}
          <RealtimeBanner className="mb-16" />

          {/* 기능 소개 카드 */}
          <FeatureCards className="mb-16" />

          {/* 인기 질문 섹션 */}
          <PopularQuestions className="mb-16" />
        </div>
      </MainLayout>
    </>
  );
}
