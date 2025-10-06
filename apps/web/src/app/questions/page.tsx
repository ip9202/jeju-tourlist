"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Heading, Text } from "@jeju-tourlist/ui";
import { Filter } from "lucide-react";
import { type Question, type SearchFilters } from "@/hooks/useQuestionSearch";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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

  // URL 파라미터에서 검색어 읽어오기
  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam) {
      setSearchTerm(searchParam);
    } else {
      setSearchTerm(""); // URL에 검색 파라미터가 없으면 검색어 초기화
    }
    setIsInitialized(true);
  }, [searchParams]);

  // 질문 로드 (검색어, 필터, 페이지 변경 시)
  useEffect(() => {
    // 초기화가 완료된 후에만 실행
    if (isInitialized) {
      loadQuestions();
    }
  }, [searchTerm, filters, pagination.page, isInitialized]);

  const loadCategories = async () => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const response = await fetch(`${API_URL}/categories`);

      if (!response.ok) {
        throw new Error("카테고리 목록을 불러오는데 실패했습니다.");
      }

      const data = await response.json();

      // 카테고리에 아이콘 매핑
      const iconMap: Record<string, string> = {
        관광지: "🗺️",
        맛집: "🍽️",
        숙박: "🏨",
        교통: "🚗",
        쇼핑: "🛍️",
        기타: "💬",
        액티비티: "🏄",
        날씨: "🌤️",
      };

      const categoriesWithIcons = data.data.map((cat: Category) => ({
        ...cat,
        icon: iconMap[cat.name] || "💬",
      }));

      setCategories(categoriesWithIcons);
    } catch (error) {
      console.error("카테고리 로드 실패:", error);
    }
  };

  const loadQuestions = async () => {
    // 이미 로딩 중이면 중복 호출 방지
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

      // 쿼리 파라미터 구성
      const params = new URLSearchParams();

      if (searchTerm) {
        params.append("query", searchTerm);
      }

      if (filters.categoryId) {
        params.append("categoryId", filters.categoryId);
      }

      if (filters.status === "answered") {
        params.append("isResolved", "true");
      } else if (filters.status === "unanswered") {
        params.append("isResolved", "false");
      }

      if (filters.sortBy) {
        params.append("sortBy", filters.sortBy);
      }

      if (filters.sortOrder) {
        params.append("sortOrder", filters.sortOrder);
      }

      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      const url = `${API_URL}/questions?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // API 응답 데이터를 Question 인터페이스에 맞게 변환
      const transformedQuestions: Question[] = data.data.map((q: any) => ({
        id: q.id,
        title: q.title,
        content: q.content,
        author: {
          id: q.author.id,
          name: q.author.name,
          nickname: q.author.nickname,
          avatar: q.author.avatar,
        },
        category: q.category
          ? {
              id: q.category.id,
              name: q.category.name,
              color: q.category.color,
            }
          : null,
        tags: q.tags || [],
        location: q.location,
        status: q.status,
        isResolved: q.isResolved,
        isPinned: q.isPinned,
        viewCount: q.viewCount,
        likeCount: q.likeCount,
        answerCount: q.answerCount,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
        resolvedAt: q.resolvedAt,
      }));

      setQuestions(transformedQuestions);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || transformedQuestions.length,
        totalPages: data.pagination?.totalPages || 1,
      }));
    } catch (error) {
      console.error("질문 목록 로드 실패:", error);
      setError("질문 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // API에서 이미 필터링된 데이터를 받으므로 추가 필터링 불필요
  const filteredQuestions = questions;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메인 헤더 */}
      <div className="sticky top-0 z-50">
        <Header />
      </div>

      {/* SubPageHeader */}
      <SubPageHeader
        title="질문 목록"
        showBackButton={true}
        showHomeButton={true}
      />

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* 필터만 표시 */}
        <div className="mb-6 mt-2" data-testid="filters-block">
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1">
              <Filter className="w-3 h-3 text-gray-500" />
              <select
                value={filters.categoryId}
                onChange={e => handleFilterChange("categoryId", e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-xs"
              >
                <option value="">전체</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={filters.status}
              onChange={e => handleFilterChange("status", e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-xs"
            >
              <option value="all">전체</option>
              <option value="answered">답변완료</option>
              <option value="unanswered">답변대기</option>
            </select>
          </div>
        </div>

        {/* 질문 목록 */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <Text className="text-gray-600 mt-2">질문을 불러오는 중...</Text>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <Text className="text-red-600">{error}</Text>
            </div>
          )}

          {!loading && !error && filteredQuestions.length === 0 && (
            <div className="text-center py-8">
              <Text className="text-gray-600">질문이 없습니다.</Text>
            </div>
          )}

          {!loading &&
            !error &&
            filteredQuestions.map(question => (
              <div
                key={question.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <Link href={`/questions/${question.id}`} className="flex-1">
                    <Heading
                      level={3}
                      className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                    >
                      {question.title}
                    </Heading>
                  </Link>
                  <div className="flex items-center space-x-2 ml-4">
                    {question.category && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                        {question.category.name}
                      </span>
                    )}
                    {question.isResolved ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        해결됨
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        답변대기
                      </span>
                    )}
                  </div>
                </div>

                <Text className="text-gray-600 mb-4 line-clamp-2">
                  {question.content}
                </Text>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>작성자: {question.author.name}</span>
                    <span>답변 {question.answerCount}개</span>
                    <span>조회 {question.viewCount}</span>
                    <span>좋아요 {question.likeCount}</span>
                  </div>
                  <span>
                    {new Date(question.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              </div>
            ))}
        </div>

        {/* 페이지네이션 */}
        {!loading && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2"
            >
              이전
            </Button>

            <div className="flex space-x-1">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map(page => {
                // 현재 페이지 주변 5개 페이지만 표시
                if (
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= pagination.page - 2 && page <= pagination.page + 2)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={page === pagination.page ? "primary" : "outline"}
                      onClick={() => handlePageChange(page)}
                      className="px-4 py-2"
                    >
                      {page}
                    </Button>
                  );
                } else if (
                  page === pagination.page - 3 ||
                  page === pagination.page + 3
                ) {
                  return (
                    <span key={page} className="px-2 py-2">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2"
            >
              다음
            </Button>
          </div>
        )}

        {/* 결과 정보 */}
        {!loading && questions.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            전체 {pagination.total}개 중{" "}
            {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)}개
            표시
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <QuestionsPageContent />
    </Suspense>
  );
}
