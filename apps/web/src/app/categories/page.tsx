"use client";

import React, { useState, useEffect } from "react";
import {
  Landmark,
  Utensils,
  Bed,
  Car,
  ShoppingBag,
  Waves,
  Cloud,
  Shield,
  MoreHorizontal,
  ArrowRight,
  MessageSquare,
  Eye,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";

// 카테고리 정보
const categoryIcons: Record<string, React.ReactNode> = {
  관광지: <Landmark className="w-7 h-7" />,
  맛집: <Utensils className="w-7 h-7" />,
  숙박: <Bed className="w-7 h-7" />,
  교통: <Car className="w-7 h-7" />,
  쇼핑: <ShoppingBag className="w-7 h-7" />,
  액티비티: <Waves className="w-7 h-7" />,
  날씨: <Cloud className="w-7 h-7" />,
  안전: <Shield className="w-7 h-7" />,
  기타: <MoreHorizontal className="w-7 h-7" />,
};

// 카테고리별 설명
const categoryDescriptions: Record<string, string> = {
  관광지: "제주도의 주요 관광지, 숨은 명소, 트래킹 코스 등",
  맛집: "제주 로컬 식당, 해산물, 특산 음식 추천",
  숙박: "호텔, 펜션, 게스트하우스, 에어비앤비 정보",
  교통: "공항 교통, 렌터카, 대중교통, 이동 팁",
  쇼핑: "면세점, 기념품, 로컬 상점 정보",
  액티비티: "스노클링, 서핑, 트래킹, 수상 스포츠",
  날씨: "계절별 날씨, 복장 정보, 우천 대비",
  안전: "여행 안전 정보, 보험, 응급 상황",
  기타: "위 카테고리에 해당하지 않는 질문들",
};

// 시간 포매팅
function formatTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return past.toLocaleDateString("ko-KR");
}

interface Category {
  id: string;
  name: string;
}

interface Question {
  id: string;
  title: string;
  categoryId: string;
  answerCount: number;
  viewCount: number;
  createdAt: string;
  author: {
    nickname: string;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("cat_002"); // 맛집 기본값
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sortBy, setSortBy] = useState<string>("latest");
  const [loading, setLoading] = useState(true);

  // 카테고리 로드
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/categories", {
          cache: "no-store",
        });
        const data = await res.json();
        setCategories(data.data || []);
        setLoading(false);
      } catch (error) {
        console.error("카테고리 로드 실패:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 선택된 카테고리의 질문 로드
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        let url = `http://localhost:4000/api/questions?categoryId=${selectedCategory}&limit=10`;

        if (sortBy === "popular") {
          url += "&sort=answerCount";
        } else if (sortBy === "views") {
          url += "&sort=viewCount";
        }

        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        setQuestions(data.data || []);
      } catch (error) {
        console.error("질문 로드 실패:", error);
        setQuestions([]);
      }
    };

    fetchQuestions();
  }, [selectedCategory, sortBy]);

  const selectedCategoryName =
    categories.find(c => c.id === selectedCategory)?.name || "카테고리";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header />

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 카테고리 헤더 */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            카테고리
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            제주도 여행에 필요한 정보를 카테고리별로 찾아보세요
          </p>

          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            <button
              onClick={() => setSortBy("latest")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                sortBy === "latest"
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:border-blue-500"
              }`}
            >
              최신순
            </button>
            <button
              onClick={() => setSortBy("popular")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                sortBy === "popular"
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:border-blue-500"
              }`}
            >
              인기순
            </button>
            <button
              onClick={() => setSortBy("views")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                sortBy === "views"
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:border-blue-500"
              }`}
            >
              조회순
            </button>
          </div>
        </div>

        {/* 카테고리 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-12 p-1">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`bg-white rounded-lg sm:rounded-xl border border-gray-200 p-2 sm:p-3 md:p-4 text-left hover:shadow-lg transition-shadow cursor-pointer flex flex-row gap-2 sm:gap-3 md:gap-4 items-start h-full ${
                selectedCategory === category.id ? "ring-2 ring-blue-500" : ""
              }`}
            >
              {/* 아이콘 - 좌측 고정 */}
              <div className="text-2xl sm:text-3xl md:text-4xl text-blue-500 flex-shrink-0 pt-0.5">
                {categoryIcons[category.name] || (
                  <MoreHorizontal className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                )}
              </div>

              {/* 우측 텍스트 영역 */}
              <div className="flex flex-col flex-grow min-w-0">
                {/* 카테고리명 */}
                <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg mb-0.5 line-clamp-1">
                  {category.name}
                </h3>

                {/* 질문 개수 */}
                <p className="text-gray-500 text-xs sm:text-sm mb-1">
                  {questions.length}개 질문
                </p>

                {/* 설명 */}
                <p className="text-gray-600 text-xs flex-grow mb-1.5 sm:mb-2 line-clamp-1 sm:line-clamp-2">
                  {categoryDescriptions[category.name] || ""}
                </p>

                {/* 질문 보기 링크 */}
                <div className="text-blue-600 text-xs sm:text-sm font-medium flex items-center gap-0.5 flex-shrink-0">
                  <span className="hidden sm:inline">질문 보기</span>
                  <span className="sm:hidden">보기</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 선택된 카테고리의 질문 섹션 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500">
              {categoryIcons[selectedCategoryName] || (
                <MoreHorizontal className="w-6 h-6" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {selectedCategoryName}의 질문
            </h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 bg-gray-100 rounded-lg animate-pulse"
                >
                  <div className="h-6 bg-gray-300 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map(question => (
                <Link
                  key={question.id}
                  href={`/questions/${question.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {selectedCategoryName}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2">
                    {question.title}
                  </h3>

                  <div className="flex items-center gap-4 mb-3 flex-wrap text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {question.answerCount}개 답변
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {question.viewCount} 조회
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTimeAgo(question.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {question.author.nickname.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {question.author.nickname}
                      </span>
                    </div>
                    <button className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                      답변 보기
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>등록된 질문이 없습니다.</p>
              <Link
                href="/questions/new"
                className="text-blue-500 hover:text-blue-700 mt-2 inline-block font-medium"
              >
                첫 번째 질문을 올려보세요 →
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>
            &copy; 2025 동네물어봐. 제주도 여행 정보를 전문가와 함께 공유하세요.
          </p>
        </div>
      </footer>
    </div>
  );
}
