"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuestionCard, QuestionData } from "@/components/feed";
import { TrendingUp } from "lucide-react";

/**
 * API 응답 데이터 타입
 */
interface ApiQuestionData {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  category?: {
    name: string;
  };
  tags: string[];
  createdAt: string;
  answerCount: number;
  viewCount: number;
  likeCount: number;
  isResolved: boolean;
}

/**
 * 인기 질문 데이터 타입 (QuestionData와 호환)
 */
interface PopularQuestion extends Omit<QuestionData, "isAuthor" | "updatedAt"> {
  // QuestionData와 동일한 구조를 유지하되 일부 필드는 선택적으로
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
  const [error, setError] = useState<string | null>(null);
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
        isVerified: true,
      },
      category: "여행",
      tags: ["3박4일", "가족여행", "코스추천"],
      createdAt: "2024-01-15T10:30:00Z",
      answerCount: 12,
      viewCount: 1250,
      likeCount: 45,
      isAnswered: true,
      isBookmarked: false,
      isLiked: false,
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
        isVerified: false,
      },
      category: "교통",
      tags: ["렌터카", "대중교통", "비용"],
      createdAt: "2024-01-15T08:15:00Z",
      answerCount: 18,
      viewCount: 2100,
      likeCount: 67,
      isAnswered: true,
      isBookmarked: true,
      isLiked: true,
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
        isVerified: true,
      },
      category: "일반",
      tags: ["12월", "날씨", "옷차림"],
      createdAt: "2024-01-14T16:45:00Z",
      answerCount: 8,
      viewCount: 980,
      likeCount: 23,
      isAnswered: true,
      isBookmarked: false,
      isLiked: false,
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
        isVerified: true,
      },
      category: "맛집",
      tags: ["맛집", "해산물", "흑돼지"],
      createdAt: "2024-01-14T14:20:00Z",
      answerCount: 25,
      viewCount: 3200,
      likeCount: 89,
      isAnswered: true,
      isBookmarked: true,
      isLiked: true,
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
        isVerified: false,
      },
      category: "포토스팟",
      tags: ["포토스팟", "일몰", "인스타그램"],
      createdAt: "2024-01-14T11:30:00Z",
      answerCount: 15,
      viewCount: 1800,
      likeCount: 56,
      isAnswered: true,
      isBookmarked: false,
      isLiked: false,
    },
  ];

  /**
   * 컴포넌트 마운트 시 데이터 로드
   */
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        // 실제 API 호출
        const response = await fetch(
          `http://localhost:4000/api/questions/popular?limit=${limit}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          // API 응답 데이터를 PopularQuestion 타입으로 변환
          const mappedQuestions: PopularQuestion[] = data.data.map(
            (question: ApiQuestionData) => ({
              id: question.id,
              title: question.title,
              content: question.content,
              author: {
                id: question.author.id,
                name: question.author.name,
                profileImage: question.author.avatar,
                isVerified: false, // 현재 데이터에 없음
              },
              category: question.category?.name || "일반",
              tags: question.tags || [],
              createdAt: question.createdAt,
              answerCount: question.answerCount,
              viewCount: question.viewCount,
              likeCount: question.likeCount,
              isAnswered: question.isResolved,
              isBookmarked: false,
              isLiked: false,
            })
          );

          setQuestions(mappedQuestions);
        } else {
          throw new Error(data.error || "API 응답 오류");
        }
      } catch (error) {
        console.error("인기 질문 조회 실패:", error);
        setError(
          error instanceof Error
            ? error.message
            : "질문을 불러오는데 실패했습니다."
        );
        // 에러 발생 시 목업 데이터 사용
        setQuestions(mockQuestions.slice(0, limit));
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [limit, sortBy]);

  /**
   * 정렬 옵션 변경 핸들러
   */
  const handleSortChange = async (
    newSortBy: "popular" | "recent" | "answered"
  ) => {
    setSortBy(newSortBy);

    // 정렬 변경 시 새로운 데이터 로드
    setLoading(true);
    setError(null);
    try {
      let apiUrl = `http://localhost:4000/api/questions/popular?limit=${limit}`;

      // 정렬 옵션에 따라 다른 API 엔드포인트 사용
      if (newSortBy === "recent") {
        apiUrl = `http://localhost:4000/api/questions?limit=${limit}&sortBy=createdAt&sortOrder=desc`;
      } else if (newSortBy === "answered") {
        apiUrl = `http://localhost:4000/api/questions?limit=${limit}&isResolved=true&sortBy=createdAt&sortOrder=desc`;
      }

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        const mappedQuestions: PopularQuestion[] = data.data.map(
          (question: ApiQuestionData) => ({
            id: question.id,
            title: question.title,
            content: question.content,
            author: {
              id: question.author.id,
              name: question.author.name,
              profileImage: question.author.avatar,
              isVerified: false,
            },
            category: question.category?.name || "일반",
            tags: question.tags || [],
            createdAt: question.createdAt,
            answerCount: question.answerCount,
            viewCount: question.viewCount,
            likeCount: question.likeCount,
            isAnswered: question.isResolved,
            isBookmarked: false,
            isLiked: false,
          })
        );

        setQuestions(mappedQuestions);
      } else {
        throw new Error(data.error || "API 응답 오류");
      }
    } catch (error) {
      console.error("정렬된 질문 조회 실패:", error);
      setError(
        error instanceof Error
          ? error.message
          : "질문을 불러오는데 실패했습니다."
      );
      // 에러 발생 시 목업 데이터 사용
      setQuestions(mockQuestions.slice(0, limit));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 좋아요 핸들러
   */
  const handleLike = (questionId: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? {
              ...q,
              isLiked: !q.isLiked,
              likeCount: q.isLiked ? q.likeCount - 1 : q.likeCount + 1,
            }
          : q
      )
    );
  };

  /**
   * 북마크 핸들러
   */
  const handleBookmark = (questionId: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, isBookmarked: !q.isBookmarked } : q
      )
    );
  };

  /**
   * 공유 핸들러
   */
  const handleShare = (questionId: string) => {
    console.log("공유:", questionId);
  };

  if (loading) {
    return (
      <div className={`bg-card rounded-2xl shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(limit)].map((_, index) => (
              <div key={index} className="border-l-4 border-muted pl-4 py-2">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-mobile shadow-mobile border ${className}`}>
      {/* 헤더 */}
      <div className="p-mobile border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-mobile-xl font-bold text-foreground flex items-center">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary" />
            인기 질문
          </h3>

          {showViewAll && (
            <Link href="/questions?sort=popular">
              <Button variant="outline" size="sm" className="touch-target">
                전체보기
              </Button>
            </Link>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              ⚠️ {error} (목업 데이터를 표시합니다)
            </p>
          </div>
        )}

        {/* 정렬 옵션 - 모바일에서는 스크롤 가능 */}
        <div className="flex space-x-2 overflow-x-auto scrollbar-thin pb-2">
          <button
            onClick={() => handleSortChange("popular")}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors touch-target whitespace-nowrap ${
              sortBy === "popular"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            }`}
          >
            인기순
          </button>
          <button
            onClick={() => handleSortChange("recent")}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors touch-target whitespace-nowrap ${
              sortBy === "recent"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            }`}
          >
            최신순
          </button>
          <button
            onClick={() => handleSortChange("answered")}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors touch-target whitespace-nowrap ${
              sortBy === "answered"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            }`}
          >
            답변완료
          </button>
        </div>
      </div>

      {/* 질문 목록 - 새로운 Card 기반 */}
      <div className="p-mobile">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {questions.map(question => (
            <QuestionCard
              key={question.id}
              question={{
                ...question,
                isAuthor: false, // 인기 질문에서는 작성자 여부를 false로 설정
                updatedAt: question.createdAt, // updatedAt이 없으므로 createdAt 사용
              }}
              variant="default"
              showActions={true}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onShare={handleShare}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
