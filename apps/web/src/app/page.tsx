"use client";

import React from "react";
import { MainLayout } from "@/components/layout";
import {
  HeroSection,
  RealtimeBanner,
  PopularQuestions,
  FeatureCards,
} from "@/components/home";

export default function Home() {
  return (
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
  );
}
