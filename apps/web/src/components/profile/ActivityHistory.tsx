"use client";

import React, { useState, useEffect } from "react";
import { Button, TabGroup } from "@jeju-tourlist/ui";
import {
  MessageCircle,
  ThumbsUp,
  Bookmark,
  Clock,
  CheckCircle,
  Star,
} from "lucide-react";

/**
 * 활동 이력 데이터 타입
 */
interface ActivityItem {
  id: string;
  type: "question" | "answer" | "like" | "bookmark";
  title: string;
  content: string;
  createdAt: string;
  questionId?: string;
  answerId?: string;
  isAccepted?: boolean;
  likeCount?: number;
  answerCount?: number;
}

/**
 * ActivityHistory 컴포넌트 Props
 */
interface ActivityHistoryProps {
  userId: string;
  className?: string;
}

/**
 * ActivityHistory 컴포넌트
 *
 * @description
 * - 사용자의 활동 이력을 표시하는 컴포넌트
 * - 질문, 답변, 좋아요, 북마크를 탭으로 구분
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 페이지네이션 및 무한 스크롤 지원
 *
 * @example
 * ```tsx
 * <ActivityHistory userId="123" />
 * ```
 */
export const ActivityHistory: React.FC<ActivityHistoryProps> = ({
  userId,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState("questions");
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  /**
   * 목업 데이터 (실제로는 API에서 가져올 데이터)
   */
  const mockActivities: Record<string, ActivityItem[]> = {
    questions: [
      {
        id: "1",
        type: "question",
        title: "제주도 3박 4일 여행 코스 추천해주세요",
        content:
          "제주도 3박 4일 여행을 계획하고 있는데, 어떤 코스가 좋을까요? 가족 여행이고 아이가 5살입니다.",
        createdAt: "2024-01-15T10:30:00Z",
        questionId: "q1",
        answerCount: 12,
        isAccepted: true,
      },
      {
        id: "2",
        type: "question",
        title: "제주도 렌터카 vs 대중교통 어떤 게 좋을까요?",
        content:
          "제주도 여행에서 렌터카를 빌릴지 대중교통을 이용할지 고민입니다.",
        createdAt: "2024-01-14T08:15:00Z",
        questionId: "q2",
        answerCount: 18,
        isAccepted: true,
      },
      {
        id: "3",
        type: "question",
        title: "제주도 날씨 12월에 어떤가요?",
        content:
          "12월에 제주도 여행을 가려고 하는데, 날씨가 어떤지 궁금합니다.",
        createdAt: "2024-01-13T16:45:00Z",
        questionId: "q3",
        answerCount: 8,
        isAccepted: false,
      },
    ],
    answers: [
      {
        id: "4",
        type: "answer",
        title: "제주도 맛집 추천해주세요!",
        content:
          "제주도에서 꼭 가봐야 할 맛집들을 추천해드릴게요. 해산물과 흑돼지 관련 맛집이 특히 좋습니다...",
        createdAt: "2024-01-15T14:20:00Z",
        questionId: "q4",
        answerId: "a1",
        isAccepted: true,
        likeCount: 25,
      },
      {
        id: "5",
        type: "answer",
        title: "제주도 포토스팟 어디가 좋을까요?",
        content:
          "제주도에서 인스타그램에 올릴 만한 예쁜 포토스팟을 찾고 있습니다. 특히 일몰 명소가 좋아요...",
        createdAt: "2024-01-14T11:30:00Z",
        questionId: "q5",
        answerId: "a2",
        isAccepted: false,
        likeCount: 15,
      },
    ],
    likes: [
      {
        id: "6",
        type: "like",
        title: "제주도 숙박 추천해주세요",
        content:
          "제주도에서 가족이 묵기 좋은 숙박시설을 추천해주세요. 바다가 보이는 곳이면 더 좋겠어요.",
        createdAt: "2024-01-15T09:15:00Z",
        questionId: "q6",
        likeCount: 45,
      },
      {
        id: "7",
        type: "like",
        title: "제주도 교통편 문의",
        content:
          "제주도에서 대중교통으로 이동하기 어려운 곳이 있나요? 렌터카 없이도 다닐 수 있을까요?",
        createdAt: "2024-01-14T13:20:00Z",
        questionId: "q7",
        likeCount: 32,
      },
    ],
    bookmarks: [
      {
        id: "8",
        type: "bookmark",
        title: "제주도 여행 팁 모음",
        content:
          "제주도 여행을 준비하는 분들을 위한 유용한 팁들을 모아봤습니다.",
        createdAt: "2024-01-15T16:30:00Z",
        questionId: "q8",
        answerCount: 23,
      },
      {
        id: "9",
        type: "bookmark",
        title: "제주도 날씨별 옷차림 가이드",
        content: "제주도의 계절별 날씨와 옷차림에 대한 상세한 가이드입니다.",
        createdAt: "2024-01-14T10:45:00Z",
        questionId: "q9",
        answerCount: 18,
      },
    ],
  };

  /**
   * 컴포넌트 마운트 시 활동 데이터 로드
   */
  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      setActivities(mockActivities[activeTab] || []);
      setLoading(false);
    };

    loadActivities();
  }, [activeTab, userId]);

  /**
   * 탭 변경 핸들러
   */
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
    setHasMore(true);
  };

  /**
   * 더보기 핸들러
   */
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
    // TODO: 추가 데이터 로드
    console.log("더보기:", activeTab, page + 1);
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

  /**
   * 활동 아이템 렌더링
   */
  const renderActivityItem = (activity: ActivityItem) => {
    const baseClasses =
      "p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer";

    return (
      <div key={activity.id} className={baseClasses}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            {activity.type === "question" && (
              <MessageCircle className="h-5 w-5 text-indigo-600 mr-2" />
            )}
            {activity.type === "answer" && (
              <ThumbsUp className="h-5 w-5 text-green-600 mr-2" />
            )}
            {activity.type === "like" && (
              <Star className="h-5 w-5 text-yellow-600 mr-2" />
            )}
            {activity.type === "bookmark" && (
              <Bookmark className="h-5 w-5 text-purple-600 mr-2" />
            )}

            <h4 className="font-medium text-gray-900 line-clamp-2">
              {activity.title}
            </h4>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formatTimeAgo(activity.createdAt)}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {activity.content}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {activity.answerCount !== undefined && (
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span>{activity.answerCount}개 답변</span>
              </div>
            )}
            {activity.likeCount !== undefined && (
              <div className="flex items-center">
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span>{activity.likeCount}개 좋아요</span>
              </div>
            )}
          </div>

          {activity.isAccepted && (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>채택됨</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * 탭 옵션
   */
  const tabOptions = [
    {
      id: "questions",
      label: "작성한 질문",
      count: mockActivities.questions.length,
    },
    {
      id: "answers",
      label: "작성한 답변",
      count: mockActivities.answers.length,
    },
    { id: "likes", label: "좋아요한 질문", count: mockActivities.likes.length },
    {
      id: "bookmarks",
      label: "북마크한 질문",
      count: mockActivities.bookmarks.length,
    },
  ];

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
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
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">활동 이력</h3>

        {/* 탭 그룹 */}
        <TabGroup
          tabs={tabOptions}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      {/* 활동 목록 */}
      <div className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {activeTab === "questions" && (
                <MessageCircle className="h-12 w-12 mx-auto" />
              )}
              {activeTab === "answers" && (
                <ThumbsUp className="h-12 w-12 mx-auto" />
              )}
              {activeTab === "likes" && <Star className="h-12 w-12 mx-auto" />}
              {activeTab === "bookmarks" && (
                <Bookmark className="h-12 w-12 mx-auto" />
              )}
            </div>
            <p className="text-gray-500 text-lg mb-2">
              {activeTab === "questions" && "아직 작성한 질문이 없습니다."}
              {activeTab === "answers" && "아직 작성한 답변이 없습니다."}
              {activeTab === "likes" && "아직 좋아요한 질문이 없습니다."}
              {activeTab === "bookmarks" && "아직 북마크한 질문이 없습니다."}
            </p>
            <p className="text-gray-400 text-sm">활동을 시작해보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">{activities.map(renderActivityItem)}</div>
        )}

        {/* 더보기 버튼 */}
        {hasMore && activities.length > 0 && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loading}
            >
              더보기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
