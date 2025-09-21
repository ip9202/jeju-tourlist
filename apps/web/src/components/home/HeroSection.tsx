"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Avatar } from "@jeju-tourlist/ui";
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
  const { user, isAuthenticated } = useAuth();

  return (
    <section className={`text-center py-16 ${className}`}>
      {/* 메인 제목 및 설명 */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          제주 여행, 궁금한 게 있으신가요?
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          제주도 현지인과 여행자들이 함께 만드는
          <br />
          가장 신뢰할 수 있는 여행 정보 커뮤니티
        </p>
      </div>

      {/* 인증된 사용자 섹션 */}
      {isAuthenticated ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row items-center justify-center mb-6">
            <div className="flex items-center mb-4 md:mb-0 md:mr-6">
              <Avatar
                src={user?.profileImage}
                alt={user?.name || "사용자"}
                size="lg"
                className="mr-4"
              />
              <div className="text-left">
                <h2 className="text-2xl font-bold text-gray-900">
                  안녕하세요, {user?.name}님!
                </h2>
                <p className="text-gray-600">제주 여행에 대해 질문해보세요</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/questions/new">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                <MessageCircle className="w-5 h-5 mr-2" />
                질문하기
              </Button>
            </Link>
            <Link href="/questions">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <TrendingUp className="w-5 h-5 mr-2" />
                인기 질문 보기
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* 비인증 사용자 섹션 */
        <div className="space-y-6 mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              지금 시작해보세요!
            </h2>
            <p className="text-gray-600 mb-6">
              로그인하고 제주 여행 정보를 공유하고 받아보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => {
                  window.location.href = "/auth/signin";
                }}
              >
                시작하기
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => {
                  window.location.href = "/questions";
                }}
              >
                <Users className="w-5 h-5 mr-2" />
                둘러보기
              </Button>
            </div>
          </div>
        </div>
      )}

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
