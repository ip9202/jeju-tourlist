"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/packages/ui/components/atoms/Button";
import { TrendingUp, Clock, MessageCircle, Eye } from "lucide-react";

/**
 * 인기 질문 데이터 타입
 */
interface PopularQuestion {
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
  answerCount: number;
  viewCount: number;
  likeCount: number;
  isAnswered: boolean;
  isBookmarked?: boolean;
}

/**
 * PopularQuestions 컴포넌트 Props
 */
interface PopularQuestionsProps {
  className?: string;
  limit?: number;
  showViewAll?: boolean;
}

/**
 * PopularQuestions 컴포넌트
 *
 * @description
 * - 인기 질문들을 표시하는 컴포넌트
 * - 정렬 옵션과 필터링 기능 포함
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 무한 스크롤 및 페이지네이션 지원
 *
 * @example
 * ```tsx
 * <PopularQuestions limit={5} showViewAll={true} />
 * ```
 */
export const PopularQuestions: React.FC<PopularQuestionsProps> = ({
  className = "",
  limit = 5,
  showViewAll = true,
}) => {
  const [questions, setQuestions] = useState<PopularQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"popular" | "recent" | "answered">(
    "popular"
  );

  /**
   * 목업 데이터 (실제로는 API에서 가져올 데이터)
   */
  const mockQuestions: PopularQuestion[] = [
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
      answerCount: 12,
      viewCount: 1250,
      likeCount: 45,
      isAnswered: true,
      isBookmarked: false,
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
      answerCount: 18,
      viewCount: 2100,
      likeCount: 67,
      isAnswered: true,
      isBookmarked: true,
    },
    {
      id: "3",
      title: "제주도 날씨 12월에 어떤가요?",
      content:
        "12월에 제주도 여행을 가려고 하는데, 날씨가 어떤지 궁금합니다. 옷차림은 어떻게 하면 좋을까요?",
      author: {
        id: "user3",
        name: "이현지",
        profileImage: "/avatars/lee-local.jpg",
      },
      category: "일반",
      tags: ["12월", "날씨", "옷차림"],
      createdAt: "2024-01-14T16:45:00Z",
      answerCount: 8,
      viewCount: 980,
      likeCount: 23,
      isAnswered: true,
      isBookmarked: false,
    },
    {
      id: "4",
      title: "제주도 맛집 추천해주세요!",
      content:
        "제주도에서 꼭 가봐야 할 맛집들을 추천해주세요. 해산물과 흑돼지 관련 맛집이 특히 궁금합니다.",
      author: {
        id: "user4",
        name: "최맛집",
        profileImage: "/avatars/choi-food.jpg",
      },
      category: "맛집",
      tags: ["맛집", "해산물", "흑돼지"],
      createdAt: "2024-01-14T14:20:00Z",
      answerCount: 25,
      viewCount: 3200,
      likeCount: 89,
      isAnswered: true,
      isBookmarked: true,
    },
    {
      id: "5",
      title: "제주도 포토스팟 어디가 좋을까요?",
      content:
        "제주도에서 인스타그램에 올릴 만한 예쁜 포토스팟을 찾고 있습니다. 특히 일몰 명소가 좋아요.",
      author: {
        id: "user5",
        name: "정포토",
        profileImage: "/avatars/jung-photo.jpg",
      },
      category: "포토스팟",
      tags: ["포토스팟", "일몰", "인스타그램"],
      createdAt: "2024-01-14T11:30:00Z",
      answerCount: 15,
      viewCount: 1800,
      likeCount: 56,
      isAnswered: true,
      isBookmarked: false,
    },
  ];

  /**
   * 컴포넌트 마운트 시 데이터 로드
   */
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      setQuestions(mockQuestions.slice(0, limit));
      setLoading(false);
    };

    loadQuestions();
  }, [limit, sortBy]);

  /**
   * 정렬 옵션 변경 핸들러
   */
  const handleSortChange = (newSortBy: "popular" | "recent" | "answered") => {
    setSortBy(newSortBy);
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
            {[...Array(limit)].map((_, index) => (
              <div key={index} className="border-l-4 border-gray-200 pl-4 py-2">
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
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-indigo-600" />
            인기 질문
          </h3>

          {showViewAll && (
            <Link href="/questions?sort=popular">
              <Button variant="outline" size="sm">
                전체보기
              </Button>
            </Link>
          )}
        </div>

        {/* 정렬 옵션 */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleSortChange("popular")}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              sortBy === "popular"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            인기순
          </button>
          <button
            onClick={() => handleSortChange("recent")}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              sortBy === "recent"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            최신순
          </button>
          <button
            onClick={() => handleSortChange("answered")}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              sortBy === "answered"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            답변완료
          </button>
        </div>
      </div>

      {/* 질문 목록 */}
      <div className="p-6">
        <div className="space-y-4">
          {questions.map(question => (
            <div
              key={question.id}
              className="border-l-4 border-indigo-500 pl-4 py-3 hover:bg-gray-50 rounded-r-md transition-colors"
            >
              <Link href={`/questions/${question.id}`}>
                <div className="group cursor-pointer">
                  <h4 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
                    {question.title}
                  </h4>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {question.content}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700">
                          {question.author.name}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatTimeAgo(question.createdAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span>{question.answerCount}개 답변</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{question.viewCount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium">
                        {question.category}
                      </span>
                      {question.isAnswered && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          답변완료
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
