"use client";

import React, { useState, useEffect } from "react";
import { Button, Badge } from "@jeju-tourlist/ui";
import { type SearchFilters } from "./SearchForm";
import {
  Search,
  SortAsc,
  SortDesc,
  MessageCircle,
  Eye,
  ThumbsUp,
  Clock,
  CheckCircle,
} from "lucide-react";

/**
 * 검색 결과 데이터 타입
 */
interface SearchResult {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    profileImage?: string;
  };
  category: string;
  tags: string[];
  createdAt: string;
  viewCount: number;
  likeCount: number;
  answerCount: number;
  isAnswered: boolean;
  isBookmarked: boolean;
  relevanceScore?: number;
  highlights?: {
    title: string;
    content: string;
  };
}

/**
 * SearchResults 컴포넌트 Props
 */
interface SearchResultsProps {
  query: string;
  filters: SearchFilters;
  className?: string;
}

/**
 * SearchResults 컴포넌트
 *
 * @description
 * - 검색 결과를 표시하는 컴포넌트
 * - 결과 목록, 정렬, 필터링, 페이지네이션 포함
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 검색 하이라이팅 및 통계 표시
 *
 * @example
 * ```tsx
 * <SearchResults
 *   query="제주도 여행"
 *   filters={searchFilters}
 * />
 * ```
 */
export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  filters,
  className = "",
}) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  /**
   * 목업 데이터 (실제로는 API에서 가져올 데이터)
   */
  const mockResults: SearchResult[] = [
    {
      id: "1",
      title: "제주도 3박 4일 여행 코스 추천해주세요",
      content:
        "제주도 3박 4일 여행을 계획하고 있는데, 어떤 코스가 좋을까요? 가족 여행이고 아이가 5살입니다.",
      author: {
        id: "user1",
        name: "김제주",
        profileImage: "/avatars/kim-jeju.jpg",
      },
      category: "여행",
      tags: ["3박4일", "가족여행", "코스추천"],
      createdAt: "2024-01-15T10:30:00Z",
      viewCount: 1250,
      likeCount: 45,
      answerCount: 12,
      isAnswered: true,
      isBookmarked: false,
      relevanceScore: 0.95,
      highlights: {
        title: "제주도 3박 4일 <mark>여행</mark> 코스 추천해주세요",
        content:
          "제주도 3박 4일 <mark>여행</mark>을 계획하고 있는데, 어떤 코스가 좋을까요?",
      },
    },
    {
      id: "2",
      title: "제주도 렌터카 vs 대중교통 어떤 게 좋을까요?",
      content:
        "제주도 여행에서 렌터카를 빌릴지 대중교통을 이용할지 고민입니다. 비용과 편의성을 고려해서 추천해주세요.",
      author: {
        id: "user2",
        name: "박여행",
        profileImage: "/avatars/park-travel.jpg",
      },
      category: "교통",
      tags: ["렌터카", "대중교통", "비용"],
      createdAt: "2024-01-15T08:15:00Z",
      viewCount: 2100,
      likeCount: 67,
      answerCount: 18,
      isAnswered: true,
      isBookmarked: true,
      relevanceScore: 0.87,
      highlights: {
        title: "제주도 렌터카 vs 대중교통 어떤 게 좋을까요?",
        content:
          "제주도 <mark>여행</mark>에서 렌터카를 빌릴지 대중교통을 이용할지 고민입니다.",
      },
    },
    {
      id: "3",
      title: "제주도 맛집 추천해주세요!",
      content:
        "제주도에서 꼭 가봐야 할 맛집들을 추천해주세요. 해산물과 흑돼지 관련 맛집이 특히 궁금합니다.",
      author: {
        id: "user3",
        name: "최맛집",
        profileImage: "/avatars/choi-food.jpg",
      },
      category: "맛집",
      tags: ["맛집", "해산물", "흑돼지"],
      createdAt: "2024-01-14T14:20:00Z",
      viewCount: 3200,
      likeCount: 89,
      answerCount: 25,
      isAnswered: true,
      isBookmarked: false,
      relevanceScore: 0.82,
      highlights: {
        title: "제주도 맛집 추천해주세요!",
        content: "제주도에서 꼭 가봐야 할 맛집들을 추천해주세요.",
      },
    },
  ];

  /**
   * 컴포넌트 마운트 시 검색 결과 로드
   */
  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResults(mockResults);
      setTotalCount(mockResults.length);
      setLoading(false);
    };

    loadResults();
  }, [query, filters]);

  /**
   * 정렬 핸들러
   */
  const handleSort = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  /**
   * 시간 포맷팅 함수
   */
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "방금 전";
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}일 전`;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-md ${className}`}>
      {/* 검색 결과 헤더 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">검색 결과</h2>
            <p className="text-gray-600">
              &quot;{query}&quot;에 대한 검색 결과{" "}
              <span className="font-semibold text-indigo-600">
                {totalCount}
              </span>
              개
            </p>
          </div>

          {/* 정렬 옵션 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">정렬:</span>
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => handleSort("relevance")}
                className={`px-3 py-1 text-sm ${
                  sortBy === "relevance"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                관련도
              </button>
              <button
                onClick={() => handleSort("createdAt")}
                className={`px-3 py-1 text-sm border-l border-gray-300 ${
                  sortBy === "createdAt"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                날짜
                {sortBy === "createdAt" &&
                  (sortOrder === "desc" ? (
                    <SortDesc className="h-3 w-3 ml-1 inline" />
                  ) : (
                    <SortAsc className="h-3 w-3 ml-1 inline" />
                  ))}
              </button>
              <button
                onClick={() => handleSort("likeCount")}
                className={`px-3 py-1 text-sm border-l border-gray-300 ${
                  sortBy === "likeCount"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                인기
                {sortBy === "likeCount" &&
                  (sortOrder === "desc" ? (
                    <SortDesc className="h-3 w-3 ml-1 inline" />
                  ) : (
                    <SortAsc className="h-3 w-3 ml-1 inline" />
                  ))}
              </button>
            </div>
          </div>
        </div>

        {/* 검색 통계 */}
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <MessageCircle className="h-4 w-4 mr-1" />
            <span>총 {totalCount}개 질문</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>답변완료 {results.filter(r => r.isAnswered).length}개</span>
          </div>
        </div>
      </div>

      {/* 검색 결과 목록 */}
      <div className="divide-y divide-gray-200">
        {results.length === 0 ? (
          <div className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-500 mb-4">
              다른 검색어로 시도해보시거나 필터를 조정해보세요.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              이전 페이지로
            </Button>
          </div>
        ) : (
          results.map(result => (
            <div
              key={result.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    <a
                      href={`/questions/${result.id}`}
                      className="hover:text-indigo-600 transition-colors"
                      dangerouslySetInnerHTML={{
                        __html: result.highlights?.title || result.title,
                      }}
                    />
                  </h3>

                  <p
                    className="text-gray-600 text-sm mb-3 line-clamp-2"
                    dangerouslySetInnerHTML={{
                      __html: result.highlights?.content || result.content,
                    }}
                  />

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700">
                        {result.author.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatTimeAgo(result.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{result.viewCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span>{result.answerCount}개 답변</span>
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      <span>{result.likeCount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Badge variant="secondary">{result.category}</Badge>
                  {result.isAnswered && (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>답변완료</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 태그 */}
              {result.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {results.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {currentPage}페이지 (총 {Math.ceil(totalCount / 10)}페이지)
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="hover:bg-gray-50 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </Button>
              
              {/* 페이지 번호 표시 */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, Math.ceil(totalCount / 10)) }, (_, i) => {
                  const page = i + 1;
                  const isCurrentPage = page === currentPage;
                  return (
                    <Button
                      key={page}
                      variant={isCurrentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[32px] ${
                        isCurrentPage 
                          ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 font-semibold shadow-md" 
                          : "hover:bg-gray-50 border-gray-300"
                      }`}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= Math.ceil(totalCount / 10)}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="hover:bg-gray-50 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
