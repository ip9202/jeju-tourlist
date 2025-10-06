"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Input, Heading, Text } from "@jeju-tourlist/ui";
import { Search, Filter } from "lucide-react";
import { NetworkError } from "@/components/error/NetworkError";
import {
  useQuestionSearch,
  type Question,
  type SearchFilters,
} from "@/hooks/useQuestionSearch";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { Header } from "@/components/layout/Header";
import Link from "next/link";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const { searchQuestions, loading, error } = useQuestionSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    categoryId: "",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchTerm(query);
      handleSearch(query);
    }
  }, [searchParams]);

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      return;
    }

    try {
      const result = await searchQuestions({
        query: term,
        ...filters,
        page: 1,
        limit: 20,
      });

      setQuestions(result.questions);
    } catch (err) {
      console.error("검색 실패:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      return;
    }
    handleSearch(searchTerm);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // 필터 변경 시 자동으로 검색 실행
    if (searchTerm.trim()) {
      handleSearch(searchTerm);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* 간결한 헤더 */}
      <SubPageHeader
        title="검색 결과"
        showBackButton={true}
        showHomeButton={true}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 검색 폼 */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="검색어를 입력하세요..."
                className="w-full"
                data-testid="search-input"
              />
            </div>
            <Button type="submit" data-testid="search-button">
              <Search className="w-4 h-4 mr-2" />
              검색
            </Button>
          </div>
        </form>

        {/* 필터 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">상태:</span>
            <select
              value={filters.status}
              onChange={e => handleFilterChange("status", e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">전체</option>
              <option value="answered">답변완료</option>
              <option value="unanswered">답변대기</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">정렬:</span>
            <select
              value={filters.sortBy}
              onChange={e => handleFilterChange("sortBy", e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="createdAt">최신순</option>
              <option value="viewCount">조회순</option>
              <option value="likeCount">좋아요순</option>
            </select>
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="space-y-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <Text className="text-gray-600 mt-2">검색 중...</Text>
            </div>
          )}

          {error && (
            <div className="py-8">
              <NetworkError
                message={error}
                onRetry={() => handleSearch(searchTerm)}
              />
            </div>
          )}

          {!loading && !error && questions.length === 0 && (
            <div className="text-center py-8">
              <Text className="text-gray-600">검색 결과가 없습니다.</Text>
            </div>
          )}

          {!loading && !error && questions.length > 0 && (
            <div className="space-y-4">
              <Text className="text-gray-600">
                '{searchTerm}'에 대한 검색 결과 {questions.length}개
              </Text>

              {questions.map(question => (
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
                    {question.category && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 ml-4">
                        {question.category.name}
                      </span>
                    )}
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
                      {question.isResolved && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          해결됨
                        </span>
                      )}
                    </div>
                    <span>
                      {new Date(question.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
