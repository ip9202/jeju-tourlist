"use client";

import React from "react";
import { SearchBar } from "../search/SearchBar";
import { MessageCircle, TrendingUp, Users } from "lucide-react";

/**
 * HeroSection 컴포넌트 Props
 */
interface HeroSectionProps {
  className?: string;
}

/**
 * HeroSection 컴포넌트
 *
 * @description
 * - 홈페이지의 메인 히어로 섹션을 담당
 * - 서비스 소개, CTA 버튼, 사용자 인사말을 포함
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 인증 상태에 따른 조건부 렌더링
 *
 * @example
 * ```tsx
 * <HeroSection />
 * ```
 */
export const HeroSection: React.FC<HeroSectionProps> = ({ className = "" }) => {
  return (
    <section className={`text-center py-16 ${className}`}>
      {/* 메인 제목 및 설명 */}
      <div className="mb-12 px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-6 break-words">
          제주 여행, 궁금한 게 있으신가요?
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed break-words">
          제주도 현지인과 여행자들이 함께 만드는
          <br />
          가장 신뢰할 수 있는 여행 정보 커뮤니티
        </p>

        {/* 검색 바 */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar
            placeholder="제주 여행에 대해 질문해보세요..."
            className="w-full"
          />
        </div>
      </div>

      {/* 통계 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">1,234</h3>
          <p className="text-gray-600">총 질문 수</p>
        </div>

        <div className="text-center">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">5,678</h3>
          <p className="text-gray-600">활성 사용자</p>
        </div>

        <div className="text-center">
          <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-yellow-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">9,012</h3>
          <p className="text-gray-600">총 답변 수</p>
        </div>
      </div>
    </section>
  );
};
