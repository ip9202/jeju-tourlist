"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { type Question, type SearchFilters } from "@/hooks/useQuestionSearch";
import { Header } from "@/components/layout/Header";
import { safeFormatSimpleDate } from "@/lib/dateUtils";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  icon?: string;
}

function QuestionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    categoryId: "",
    status: "",
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

  // URL 파라미터에서 검색어와 필터 초기화
  useEffect(() => {
    const query = searchParams.get("query");
    const categoryId = searchParams.get("categoryId");

    if (query) {
      setSearchTerm(decodeURIComponent(query));
    }
    if (categoryId) {
      setFilters(prev => ({ ...prev, categoryId }));
    }
  }, [searchParams]);

  useEffect(() => {
    loadCategories();
  }, []);

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
      const response = await fetch("http://localhost:4000/categories");
      if (response.ok) {
        const data = await response.json();
        console.log("📦 카테고리 데이터:", data);
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("카테고리 로드 실패:", error);
    }
  };

  const searchQuestions = async () => {
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

      // 검색어 추가 (헤더에서 받은 query 파라미터 포함)
      if (searchTerm && searchTerm.trim()) {
        params.append("query", searchTerm.trim());
        console.log("🔍 검색어 적용:", searchTerm);
      }
      if (filters.categoryId) {
        params.append("categoryId", filters.categoryId);
      }
      if (filters.status) {
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

  // 검색 초기화 함수
  const handleResetSearch = () => {
    setSearchTerm("");
    setFilters({
      categoryId: "",
      status: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    router.push("/questions");
  };

  // 검색어가 있을 때 검색 실행
  useEffect(() => {
    if (searchTerm.trim()) {
      setPagination(prev => ({ ...prev, page: 1 }));
      searchQuestions();
    }
  }, [searchTerm]);

  const filteredQuestions = questions;
  const hasActiveSearch = searchTerm.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 공통 헤더 */}
      <Header />

      {/* 페이지 헤더 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 제목 및 설명 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                질문 목록
              </h1>
              <p className="text-lg text-gray-600">
                {hasActiveSearch
                  ? `'${searchTerm}' 검색 결과`
                  : "제주 여행에 대한 모든 궁금증을 해결해보세요"}
              </p>
            </div>
            {hasActiveSearch && (
              <button
                onClick={handleResetSearch}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                검색 초기화
              </button>
            )}
          </div>
        </div>

        {/* 메인 콘텐츠 - main 태그는 위에서 열었음 */}
        {/* 태블릿 필터 버튼 (md ~ lg 미만에서만 표시) */}
        <div className="hidden md:block lg:hidden mb-6">
          <div className="flex gap-2 overflow-x-auto pb-4">
            <button
              onClick={() => handleFilterChange("categoryId", "")}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                !filters.categoryId
                  ? "bg-blue-100 border border-blue-300 text-blue-600"
                  : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              전체
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleFilterChange("categoryId", category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filters.categoryId === category.id
                    ? "bg-blue-100 border border-blue-300 text-blue-600"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                {category.name}
              </button>
            ))}
            <button
              onClick={() => {
                console.log("⚙️ 상세필터 클릭!");
                setIsFilterOpen(!isFilterOpen);
              }}
              className="flex-shrink-0 px-4 py-2 bg-blue-100 border border-blue-300 rounded-full text-sm font-medium text-blue-600 whitespace-nowrap hover:bg-blue-200 transition-colors"
            >
              ⚙️ 상세필터
            </button>
          </div>

          {/* 태블릿 상세 필터 드로워 */}
          {isFilterOpen && (
            <div className="hidden md:block lg:hidden mt-4 bg-white rounded-lg border border-gray-200 p-4 space-y-4">
              {/* 상태 필터 */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 mb-2 uppercase">
                  상태
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="tablet-status"
                      checked={filters.status === ""}
                      onChange={() => handleFilterChange("status", "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">전체</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="tablet-status"
                      checked={filters.status === "ACTIVE"}
                      onChange={() => handleFilterChange("status", "ACTIVE")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">활성</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="tablet-status"
                      checked={filters.status === "CLOSED"}
                      onChange={() => handleFilterChange("status", "CLOSED")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">종료</span>
                  </label>
                </div>
              </div>

              {/* 정렬 필터 */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs font-bold text-gray-900 mb-2 uppercase">
                  정렬
                </h3>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={e => {
                    const [sortBy, sortOrder] = e.target.value.split("-");
                    setFilters(prev => ({
                      ...prev,
                      sortBy: (sortBy || "createdAt") as
                        | "createdAt"
                        | "viewCount"
                        | "likeCount",
                      sortOrder: (sortOrder || "desc") as "asc" | "desc",
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="createdAt-desc">최신순</option>
                  <option value="createdAt-asc">오래된순</option>
                  <option value="answerCount-desc">답변 많은순</option>
                  <option value="answerCount-asc">답변 적은순</option>
                  <option value="viewCount-desc">조회수 높은순</option>
                  <option value="viewCount-asc">조회수 낮은순</option>
                  <option value="likeCount-desc">좋아요 많은순</option>
                  <option value="likeCount-asc">좋아요 적은순</option>
                </select>
              </div>

              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                필터 적용 완료
              </button>
            </div>
          )}
        </div>

        {/* 그리드 레이아웃 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {/* 좌측 필터 사이드바 (lg 이상에서만 표시) */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky-sidebar bg-white rounded-lg border border-gray-200 p-5 space-y-4">
              {/* 카테고리 필터 */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 mb-2 uppercase">
                  카테고리
                </h3>
                <div className="space-y-1">
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={!filters.categoryId}
                      onChange={() => handleFilterChange("categoryId", "")}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">전체</span>
                  </label>
                  {categories.map(category => (
                    <label
                      key={category.id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={filters.categoryId === category.id}
                        onChange={() =>
                          handleFilterChange("categoryId", category.id)
                        }
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 상태 필터 */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs font-bold text-gray-900 mb-2 uppercase">
                  상태
                </h3>
                <div className="space-y-1">
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="radio"
                      name="desktop-status"
                      checked={filters.status === ""}
                      onChange={() => handleFilterChange("status", "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">전체</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="radio"
                      name="desktop-status"
                      checked={filters.status === "ACTIVE"}
                      onChange={() => handleFilterChange("status", "ACTIVE")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">활성</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="radio"
                      name="desktop-status"
                      checked={filters.status === "CLOSED"}
                      onChange={() => handleFilterChange("status", "CLOSED")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">종료</span>
                  </label>
                </div>
              </div>

              {/* 정렬 필터 */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs font-bold text-gray-900 mb-2 uppercase">
                  정렬
                </h3>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={e => {
                    const [sortBy, sortOrder] = e.target.value.split("-");
                    setFilters(prev => ({
                      ...prev,
                      sortBy: (sortBy || "createdAt") as
                        | "createdAt"
                        | "viewCount"
                        | "likeCount",
                      sortOrder: (sortOrder || "desc") as "asc" | "desc",
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="createdAt-desc">최신순</option>
                  <option value="createdAt-asc">오래된순</option>
                  <option value="viewCount-desc">조회수 높은순</option>
                  <option value="viewCount-asc">조회수 낮은순</option>
                  <option value="likeCount-desc">좋아요 많은순</option>
                  <option value="likeCount-asc">좋아요 적은순</option>
                </select>
              </div>
            </div>
          </aside>

          {/* 우측 질문 목록 */}
          <section className="col-span-full lg:col-span-3">
            {/* 질문 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">
                    질문을 불러오는 중...
                  </p>
                  {hasActiveSearch && (
                    <p className="text-sm text-gray-500 mt-2">
                      '{searchTerm}' 검색 중
                    </p>
                  )}
                </div>
              ) : error ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-red-500 text-lg font-medium mb-2">
                    오류가 발생했습니다
                  </div>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={() => searchQuestions()}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    다시 시도
                  </button>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 text-lg font-medium mb-2">
                    질문이 없습니다
                  </div>
                  <p className="text-gray-400 mb-4">
                    {hasActiveSearch
                      ? "다른 검색어를 시도해보세요"
                      : "다른 검색어나 필터를 시도해보세요"}
                  </p>
                  {hasActiveSearch && (
                    <button
                      onClick={handleResetSearch}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      검색 초기화
                    </button>
                  )}
                </div>
              ) : (
                filteredQuestions.map(question => (
                  <Link
                    key={question.id}
                    href={`/questions/${question.id}`}
                    className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
                  >
                    {/* 카테고리 & 상태 배지 */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {question.category?.name || "일반"}
                        </span>
                        {question.isResolved && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            해결됨
                          </span>
                        )}
                      </div>
                      <button className="text-gray-400 hover:text-red-500">
                        ❤️
                      </button>
                    </div>

                    {/* 제목 */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base">
                      {question.title}
                    </h3>

                    {/* 메타 정보 */}
                    <div className="flex items-center gap-3 mb-2 flex-wrap text-xs sm:text-sm text-gray-500">
                      <span>💬 {question.answerCount || 0}개 답변</span>
                      <span>👁️ {question.viewCount || 0} 조회</span>
                      <span>⏰ {safeFormatSimpleDate(question.createdAt)}</span>
                    </div>

                    {/* 작성자 및 보기 버튼 */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {question.author?.name?.charAt(0) || "U"}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          {question.author?.name || "익명"}
                        </span>
                      </div>
                      <span className="text-blue-600 text-xs sm:text-sm font-medium">
                        보기 →
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  이전
                </button>
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          pageNum === pagination.page
                            ? "bg-gray-700 text-white"
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  다음
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; 2024 동네물어봐. All rights reserved.</p>
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
