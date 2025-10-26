"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  ChevronDown,
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
  _count?: {
    questions: number;
  };
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
  const searchParams = useSearchParams();
  const selectedIdFromUrl = searchParams.get("selectedId");

  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    selectedIdFromUrl || null
  );
  const [questionsMap, setQuestionsMap] = useState<Record<string, Question[]>>(
    {}
  );
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [sortByMap, setSortByMap] = useState<Record<string, string>>({}); // 각 카테고리별 정렬

  // URL의 selectedId가 변경되면 expandedCategory 업데이트
  useEffect(() => {
    if (selectedIdFromUrl) {
      setExpandedCategory(selectedIdFromUrl);
      loadCategoryQuestions(selectedIdFromUrl);
    }
  }, [selectedIdFromUrl]);

  // 카테고리 로드
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/categories", {
          cache: "no-store",
        });
        const data = await res.json();
        setCategories(data.data || []);
      } catch (error) {
        console.error("카테고리 로드 실패:", error);
      }
    };

    fetchCategories();
  }, []);

  // 특정 카테고리의 질문 로드
  const loadCategoryQuestions = async (
    categoryId: string,
    forceRefresh: boolean = false
  ) => {
    // 이미 로드된 경우 스킵 (forceRefresh가 false일 때만)
    if (!forceRefresh && questionsMap[categoryId]) {
      return;
    }

    const sort = sortByMap[categoryId] || "latest";
    await loadCategoryQuestionsWithSort(categoryId, sort);
  };

  // 카테고리 토글
  const handleCategoryToggle = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      // 이미 열려있으면 닫기
      setExpandedCategory(null);
    } else {
      // 새로운 카테고리 열기
      setExpandedCategory(categoryId);
      // 질문 로드
      loadCategoryQuestions(categoryId);
    }
  };

  // 정렬 변경 핸들러
  const handleSortChange = (categoryId: string, sortValue: string) => {
    // 상태 업데이트 후 콜백으로 질문 로드 (비동기 문제 해결)
    setSortByMap(prev => {
      const newSortByMap = {
        ...prev,
        [categoryId]: sortValue,
      };
      // 새로운 sortBy 값으로 바로 로드하기 위해 직접 호출
      loadCategoryQuestionsWithSort(categoryId, sortValue);
      return newSortByMap;
    });
  };

  // 정렬값과 함께 질문 로드 (상태 업데이트 대기 없음)
  const loadCategoryQuestionsWithSort = async (
    categoryId: string,
    sortValue: string
  ) => {
    setLoadingMap(prev => ({ ...prev, [categoryId]: true }));

    try {
      let url = `http://localhost:4000/api/questions?categoryId=${categoryId}&limit=10`;

      if (sortValue === "popular") {
        url += "&sortBy=answers";
      } else if (sortValue === "views") {
        url += "&sortBy=viewCount";
      }
      // "latest"는 기본값이므로 sortBy 파라미터 추가 안 함

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      setQuestionsMap(prev => ({
        ...prev,
        [categoryId]: data.data || [],
      }));
    } catch (error) {
      console.error("질문 로드 실패:", error);
      setQuestionsMap(prev => ({
        ...prev,
        [categoryId]: [],
      }));
    } finally {
      setLoadingMap(prev => ({ ...prev, [categoryId]: false }));
    }
  };

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
          <p className="text-sm sm:text-base text-gray-600">
            제주도 여행에 필요한 정보를 카테고리별로 찾아보세요
          </p>
        </div>

        {/* 카테고리 아코디언 */}
        <div className="space-y-2">
          {categories.map(category => (
            <div
              key={category.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* 카테고리 헤더 (토글 버튼) */}
              <button
                onClick={() => handleCategoryToggle(category.id)}
                className={`w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  expandedCategory === category.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center gap-3 flex-grow text-left">
                  {/* 아이콘 */}
                  <div className="text-blue-500 flex-shrink-0">
                    {categoryIcons[category.name] || (
                      <MoreHorizontal className="w-6 h-6" />
                    )}
                  </div>

                  {/* 카테고리 정보 */}
                  <div className="flex-grow">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                      {category.name}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      {category._count?.questions || 0}개 질문 ·{" "}
                      {categoryDescriptions[category.name]}
                    </p>
                  </div>
                </div>

                {/* 토글 아이콘 */}
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                    expandedCategory === category.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* 확장된 콘텐츠 */}
              {expandedCategory === category.id && (
                <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
                  {/* 정렬 필터 및 전체 질문 보기 */}
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    {/* 정렬 필터 */}
                    <div className="flex gap-1.5 sm:gap-2">
                      <button
                        onClick={() => handleSortChange(category.id, "latest")}
                        className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-all ${
                          (sortByMap[category.id] || "latest") === "latest"
                            ? "bg-blue-500 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:border-blue-500"
                        }`}
                      >
                        최신순
                      </button>
                      <button
                        onClick={() => handleSortChange(category.id, "popular")}
                        className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-all ${
                          (sortByMap[category.id] || "latest") === "popular"
                            ? "bg-blue-500 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:border-blue-500"
                        }`}
                      >
                        인기순
                      </button>
                      <button
                        onClick={() => handleSortChange(category.id, "views")}
                        className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-all ${
                          (sortByMap[category.id] || "latest") === "views"
                            ? "bg-blue-500 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:border-blue-500"
                        }`}
                      >
                        조회순
                      </button>
                    </div>

                    {/* 전체 질문 보기 링크 */}
                    <Link
                      href={`/questions?categoryId=${category.id}`}
                      className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      전체 질문 보기
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Link>
                  </div>

                  {/* 질문 리스트 */}
                  {loadingMap[category.id] ? (
                    <div className="space-y-3">
                      {[...Array(2)].map((_, i) => (
                        <div
                          key={i}
                          className="p-3 bg-white rounded-lg animate-pulse"
                        >
                          <div className="h-5 bg-gray-300 rounded mb-2 w-3/4"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : questionsMap[category.id]?.length > 0 ? (
                    <div className="space-y-3">
                      {questionsMap[category.id].map(question => (
                        <Link
                          key={question.id}
                          href={`/questions/${question.id}`}
                          className="block p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                        >
                          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                            {question.title}
                          </h4>

                          <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {question.answerCount}개 답변
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {question.viewCount} 조회
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(question.createdAt)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      등록된 질문이 없습니다.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
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
