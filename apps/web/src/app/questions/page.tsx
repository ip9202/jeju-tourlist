"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
// import { Button, Heading, Text } from "@jeju-tourlist/ui";
import { Filter, Search, Clock, Users, Eye, Heart } from "lucide-react";
import { type Question, type SearchFilters } from "@/hooks/useQuestionSearch";
import { Header } from "@/components/layout/Header";
// import { Footer } from "@/components/layout/Footer";
import { safeFormatSimpleDate } from "@/lib/dateUtils";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  icon?: string;
}

function QuestionsPageContent() {
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    categoryId: "",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const isLoadingRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  // URL 파라미터에서 검색어 읽어오기 (query 또는 search 파라미터 지원)
  useEffect(() => {
    const queryParam = searchParams.get("query");
    const searchParam = searchParams.get("search");
    const searchTerm = queryParam || searchParam;

    if (searchTerm) {
      setSearchTerm(searchTerm);
    }
  }, [searchParams]);

  // 필터나 페이지가 변경될 때만 자동 검색
  useEffect(() => {
    if (isInitialized) {
      searchQuestions();
    }
  }, [filters, pagination.page]);

  // 초기 로드
  useEffect(() => {
    if (!isLoadingRef.current) {
      searchQuestions();
      setIsInitialized(true);
    }
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        console.log("📦 카테고리 데이터:", data);
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("카테고리 로드 실패:", error);
    }
  };

  const searchQuestions = async (searchTerm?: string) => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      // searchTerm 파라미터가 전달된 경우에만 검색어 추가
      if (searchTerm && searchTerm.trim()) {
        params.append("query", searchTerm.trim());
      }
      if (filters.categoryId) {
        params.append("categoryId", filters.categoryId);
      }
      if (filters.status && filters.status !== "all") {
        params.append("status", filters.status);
      }

      const url = `/api/questions?${params}`;
      console.log("🔍 검색 요청:", url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("질문을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      console.log("📥 검색 응답:", data);

      if (data.success) {
        setQuestions(data.data || []);
        console.log("✅ 질문 개수:", data.data?.length || 0);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.totalPages * data.pagination?.limit || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      } else {
        throw new Error(data.message || "질문을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("❌ 검색 실패:", error);
      setError(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // 필터 변경 시 첫 페이지로
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = () => {
    console.log("🔍 검색 버튼 클릭 - 검색어:", searchTerm);
    setPagination(prev => ({ ...prev, page: 1 })); // 검색 시 첫 페이지로
    searchQuestions(searchTerm); // 검색어 전달
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("⌨️ Enter 키 입력 - 검색어:", searchTerm);
      handleSearch();
    }
  };

  // API에서 이미 필터링된 데이터를 받으므로 추가 필터링 불필요
  const filteredQuestions = questions;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 공통 헤더 */}
      <Header />

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 검색 섹션 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              제주 여행 질문 모음
            </h2>
            <p className="text-gray-600">
              제주 여행에 대한 모든 궁금증을 해결해보세요
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="궁금한 제주 여행 정보를 검색해보세요"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                검색
              </button>
            </div>
          </div>
        </div>

        {/* 필터 섹션 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">필터</span>
              </div>

              <select
                value={filters.categoryId}
                onChange={e => handleFilterChange("categoryId", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">전체 카테고리</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={e => handleFilterChange("status", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 상태</option>
                <option value="unresolved">미해결</option>
                <option value="resolved">해결됨</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={e => {
                  const [sortBy, sortOrder] = e.target.value.split("-");
                  setFilters(prev => ({
                    ...prev,
                    sortBy: sortBy as any,
                    sortOrder: sortOrder as any,
                  }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt-desc">최신순</option>
                <option value="createdAt-asc">오래된순</option>
                <option value="views-desc">조회수 높은순</option>
                <option value="views-asc">조회수 낮은순</option>
                <option value="answers-desc">답변 많은순</option>
                <option value="answers-asc">답변 적은순</option>
              </select>
            </div>
          </div>
        </div>

        {/* 질문 목록 */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">질문을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-lg font-medium mb-2">
                오류가 발생했습니다
              </div>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={searchQuestions}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                다시 시도
              </button>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg font-medium mb-2">
                질문이 없습니다
              </div>
              <p className="text-gray-400">다른 검색어나 필터를 시도해보세요</p>
            </div>
          ) : (
            filteredQuestions.map(question => (
              <div
                key={question.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {question.category?.name || "일반"}
                    </span>
                    {question.isResolved && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        해결됨
                      </span>
                    )}
                  </div>
                  <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                  <Link
                    href={`/questions/${question.id}`}
                    className="hover:text-blue-600"
                  >
                    {question.title}
                  </Link>
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {question.content}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {question.answerCount || 0}개 답변
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {question.viewCount || 0} 조회
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {safeFormatSimpleDate(question.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {question.author?.name?.charAt(0) || "U"}
                    </div>
                    <span className="text-sm text-gray-600">
                      {question.author?.name || "익명"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {/* Tags removed as not in Question type */}
                  </div>
                  <Link
                    href={`/questions/${question.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    답변보기 →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-700">
              총 {pagination.total}개 중{" "}
              {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)}개
              표시
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>

              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const pageNum = i + 1;
                  const isCurrentPage = pageNum === pagination.page;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        isCurrentPage
                          ? "bg-gray-700 text-white shadow-md"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">동네물어봐</h4>
              <p className="text-gray-400 text-sm">
                제주도 여행자와 현지 주민을 연결하는 실시간 Q&A 커뮤니티
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">서비스</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    질문하기
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    답변하기
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    전문가
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    커뮤니티
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">지원</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    고객센터
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    이용가이드
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    자주묻는질문
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    문의하기
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">회사</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    회사소개
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    채용정보
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    이용약관
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    개인정보처리방침
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 동네물어봐. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <QuestionsPageContent />
    </Suspense>
  );
}
