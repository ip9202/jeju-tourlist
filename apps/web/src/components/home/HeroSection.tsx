"use client";

import React, { useState, useEffect } from "react";
import { SearchBar } from "../search/SearchBar";
import { MessageCircle, TrendingUp, Users } from "lucide-react";

/**
 * 통계 데이터 타입
 */
interface StatsData {
  totalQuestions: number;
  totalAnswers: number;
  totalUsers: number;
  activeUsers: number;
  questionsToday: number;
  answersToday: number;
  resolvedQuestions: number;
  resolutionRate: number;
  averageAnswersPerQuestion: number;
  topCategories: Array<{ name: string; count: number }>;
  topHashtags: Array<{ tag: string; count: number }>;
  lastUpdated: string;
}

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
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 통계 데이터 로드
   */
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:4000/api/stats");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          setStats(data.data);
        } else {
          throw new Error(data.error || "통계 데이터를 불러올 수 없습니다.");
        }
      } catch (error) {
        console.error("통계 데이터 로드 실패:", error);
        setError(
          error instanceof Error
            ? error.message
            : "통계 데이터를 불러오는데 실패했습니다."
        );

        // 에러 발생 시 기본값 설정
        setStats({
          totalQuestions: 0,
          totalAnswers: 0,
          totalUsers: 0,
          activeUsers: 0,
          questionsToday: 0,
          answersToday: 0,
          resolvedQuestions: 0,
          resolutionRate: 0,
          averageAnswersPerQuestion: 0,
          topCategories: [],
          topHashtags: [],
          lastUpdated: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  /**
   * 숫자 포맷팅 함수
   */
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

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

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md max-w-2xl mx-auto">
            <p className="text-sm text-red-600">
              ⚠️ {error} (기본값을 표시합니다)
            </p>
          </div>
        )}
      </div>

      {/* 통계 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-indigo-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-20 mx-auto"></div>
            </div>
          ) : (
            <>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats ? formatNumber(stats.totalQuestions) : "0"}
              </h3>
              <p className="text-gray-600">총 질문 수</p>
            </>
          )}
        </div>

        <div className="text-center">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-green-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-20 mx-auto"></div>
            </div>
          ) : (
            <>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats ? formatNumber(stats.activeUsers) : "0"}
              </h3>
              <p className="text-gray-600">활성 사용자</p>
            </>
          )}
        </div>

        <div className="text-center">
          <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-yellow-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-20 mx-auto"></div>
            </div>
          ) : (
            <>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats ? formatNumber(stats.totalAnswers) : "0"}
              </h3>
              <p className="text-gray-600">총 답변 수</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
