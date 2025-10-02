"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Heading, Text } from "@jeju-tourlist/ui";
import { Search, Plus, Filter } from "lucide-react";
import Link from "next/link";

interface Question {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  category: string;
  answerCount: number;
  createdAt: string;
  views: number;
  likes: number;
  isAnswered: boolean;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    categoryId: "",
    status: "all",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // 하드코딩된 카테고리 (API에서 가져온 데이터 기반)
  const categories = [
    { id: "cmg79rb3800008pm77904hv8e", name: "일반", icon: "💬" },
    { id: "cmg79rb3f00018pm7mzuwl77u", name: "숙박", icon: "🏨" },
    { id: "cmg79rb3g00028pm7hb1uu2gg", name: "맛집", icon: "🍽️" },
    { id: "cmg79rb3h00038pm7g9l18mtz", name: "교통", icon: "🚗" },
    { id: "cmg79rb3i00048pm76tr09hlp", name: "관광지", icon: "🗺️" },
    { id: "cmg79rb3j00058pm79m7yek42", name: "쇼핑", icon: "🛍️" },
    { id: "cmg79rb3k00068pm7f2r2d0l4", name: "액티비티", icon: "🏄" },
    { id: "cmg79rb3l00078pm7wwd77xqx", name: "날씨", icon: "🌤️" },
  ];

  useEffect(() => {
    loadQuestions();
  }, [filters, pagination.page]);

  const loadQuestions = async () => {
    setLoading(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

      // 쿼리 파라미터 구성
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.categoryId) {
        params.append("categoryId", filters.categoryId);
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`${API_URL}/questions?${params.toString()}`);

      if (!response.ok) {
        throw new Error("질문 목록을 불러오는데 실패했습니다.");
      }

      const data = await response.json();

      // API 응답 데이터를 Question 인터페이스에 맞게 변환
      const transformedQuestions: Question[] = data.data.map(
        (q: {
          id: string;
          title: string;
          content: string;
          author: { id: string; name: string };
          category?: { name: string };
          answerCount?: number;
          createdAt: string;
          viewCount?: number;
          likeCount?: number;
          isResolved?: boolean;
        }) => ({
          id: q.id,
          title: q.title,
          content: q.content,
          author: {
            id: q.author.id,
            name: q.author.name,
          },
          category: q.category?.name || "일반",
          answerCount: q.answerCount || 0,
          createdAt: q.createdAt,
          views: q.viewCount || 0,
          likes: q.likeCount || 0,
          isAnswered: q.isResolved || (q.answerCount || 0) > 0,
        })
      );

      setQuestions(transformedQuestions);

      // 페이지네이션 정보 업데이트
      if (data.pagination) {
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total || transformedQuestions.length,
          totalPages: data.pagination.totalPages,
        }));
      }
    } catch (error) {
      console.error("질문 목록 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadQuestions();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredQuestions =
    filters.status === "all"
      ? questions
      : questions.filter(question => {
          if (filters.status === "answered" && !question.isAnswered)
            return false;
          if (filters.status === "unanswered" && question.isAnswered)
            return false;
          return true;
        });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Heading level={1} className="text-3xl font-bold text-gray-900">
              질문 목록
            </Heading>
            <Link href="/questions/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                질문하기
              </Button>
            </Link>
          </div>

          {/* 검색 및 필터 */}
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex space-x-4">
              <div className="flex-1">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="질문을 검색하세요..."
                  className="w-full"
                />
              </div>
              <Button type="submit">
                <Search className="w-4 h-4 mr-2" />
                검색
              </Button>
            </form>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">카테고리:</span>
                <select
                  value={filters.categoryId}
                  onChange={e =>
                    handleFilterChange("categoryId", e.target.value)
                  }
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">전체</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
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
            </div>
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

          {!loading && filteredQuestions.length === 0 && (
            <div className="text-center py-8">
              <Text className="text-gray-600">질문이 없습니다.</Text>
            </div>
          )}

          {!loading &&
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
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                      {question.category}
                    </span>
                    {question.isAnswered ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        답변완료
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
                    <span>조회 {question.views}</span>
                    <span>좋아요 {question.likes}</span>
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
    </div>
  );
}
