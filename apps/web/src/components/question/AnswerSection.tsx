"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AnswerCard, AnswerForm, Button, type AnswerData } from "@jeju-tourlist/ui";
import { MessageCircle, SortAsc } from "lucide-react";

/**
 * 답변 데이터 타입
 */
interface Answer {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    profileImage?: string;
    isVerified?: boolean;
  };
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  isLiked: boolean;
  isAccepted: boolean;
  isAuthor: boolean;
  isQuestionAuthor: boolean;
}

/**
 * Answer를 AnswerData로 변환하는 함수
 */
const convertAnswerToAnswerData = (answer: Answer): AnswerData => ({
  id: answer.id,
  content: answer.content,
  author: {
    id: answer.author.id,
    name: answer.author.name,
    avatar: answer.author.profileImage,
    level: 1,
    points: 100,
  },
  likes: answer.likeCount,
  dislikes: 0,
  createdAt: answer.createdAt,
  updatedAt: answer.updatedAt,
  isAccepted: answer.isAccepted,
});

/**
 * AnswerSection 컴포넌트 Props
 */
interface AnswerSectionProps {
  questionId: string;
  isQuestionAuthor: boolean;
  className?: string;
}

/**
 * 정렬 옵션 타입
 */
type SortOption = "latest" | "oldest" | "popular" | "accepted";

/**
 * AnswerSection 컴포넌트
 *
 * @description
 * - 질문에 대한 답변들을 표시하고 관리하는 컴포넌트
 * - 답변 목록, 정렬, 필터링, 답변 작성 기능 포함
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 답변 채택 및 상호작용 기능
 *
 * @example
 * ```tsx
 * <AnswerSection
 *   questionId="123"
 *   isQuestionAuthor={true}
 * />
 * ```
 */
export const AnswerSection: React.FC<AnswerSectionProps> = ({
  questionId,
  isQuestionAuthor,
  className = "",
}) => {
  const { user, isAuthenticated } = useAuth();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [filterAccepted, setFilterAccepted] = useState(false);

  /**
   * 목업 데이터 (실제로는 API에서 가져올 데이터)
   */
  const mockAnswers: Answer[] = [
    {
      id: "1",
      content: `3박 4일 가족 여행이라면 다음과 같은 코스를 추천드립니다:

**1일차: 제주시 중심**
- 오전: 제주공항 도착 → 렌터카 픽업 → 제주시내 숙소 체크인
- 오후: 제주도립미술관 (아이들이 좋아할 만한 전시)
- 저녁: 동문시장에서 저녁식사

**2일차: 서귀포 지역**
- 오전: 중문관광단지 (테디베어뮤지엄, 아일랜드)
- 오후: 천지연폭포 → 정방폭포
- 저녁: 서귀포시내에서 식사

**3일차: 동부 지역**
- 오전: 성산일출봉 (아이와 함께 등반 가능)
- 오후: 섭지코지 → 카멜리아힐
- 저녁: 성산포구에서 신선한 해산물

**4일차: 제주시 마무리**
- 오전: 제주민속촌 (전통문화 체험)
- 오후: 제주공항으로 이동

**추천 숙박**: 가족 단위로 이용하기 좋은 펜션이나 리조트를 추천합니다.`,
      author: {
        id: "user2",
        name: "제주현지인",
        profileImage: "/avatars/jeju-local.jpg",
        isVerified: true,
      },
      createdAt: "2024-01-15T11:00:00Z",
      updatedAt: "2024-01-15T11:00:00Z",
      likeCount: 23,
      isLiked: false,
      isAccepted: true,
      isAuthor: user?.id === "user2",
      isQuestionAuthor: isQuestionAuthor,
    },
    {
      id: "2",
      content: `아이 동반 여행이라면 다음 장소들을 꼭 추천드려요:

**아이가 좋아할 만한 장소들:**
1. **테디베어뮤지엄** - 아이들이 정말 좋아해요
2. **에코랜드** - 기차 타고 돌아다니는 재미
3. **제주도립미술관** - 아이 전용 체험관이 있어요
4. **한라수목원** - 자연 속에서 뛰어놀 수 있어요

**비가 와도 즐길 수 있는 실내 장소:**
- 제주아쿠아플라넷
- 제주도립미술관
- 제주민속촌
- 제주테디베어뮤지엄

**교통수단 추천:**
렌터카가 가장 편해요. 아이가 있으면 대중교통으로는 이동이 어려울 수 있어요.`,
      author: {
        id: "user3",
        name: "맘블로거",
        profileImage: "/avatars/mom-blogger.jpg",
        isVerified: false,
      },
      createdAt: "2024-01-15T12:30:00Z",
      updatedAt: "2024-01-15T12:30:00Z",
      likeCount: 15,
      isLiked: true,
      isAccepted: false,
      isAuthor: user?.id === "user3",
      isQuestionAuthor: isQuestionAuthor,
    },
    {
      id: "3",
      content: `예산 200만원으로는 충분히 좋은 여행을 할 수 있어요!

**예산 배분 추천:**
- 숙박비: 80만원 (3박, 가족용 펜션)
- 렌터카: 15만원 (3일)
- 식비: 60만원 (4일간)
- 입장료/체험: 30만원
- 기타: 15만원

**가성비 좋은 숙박지:**
- 제주시: 제주오션뷰펜션
- 서귀포: 중문관광단지 내 리조트
- 성산: 성산일출봉 근처 펜션

**절약 팁:**
- 렌터카는 미리 예약하면 할인
- 식당은 현지인 추천 맛집이 더 저렴
- 입장료는 온라인 예약 시 할인`,
      author: {
        id: "user4",
        name: "제주여행가이드",
        profileImage: "/avatars/jeju-guide.jpg",
        isVerified: true,
      },
      createdAt: "2024-01-15T14:15:00Z",
      updatedAt: "2024-01-15T14:15:00Z",
      likeCount: 8,
      isLiked: false,
      isAccepted: false,
      isAuthor: user?.id === "user4",
      isQuestionAuthor: isQuestionAuthor,
    },
  ];

  /**
   * 컴포넌트 마운트 시 답변 데이터 로드
   */
  useEffect(() => {
    const loadAnswers = async () => {
      setLoading(true);
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnswers(mockAnswers);
      setLoading(false);
    };

    loadAnswers();
  }, [questionId, sortBy, filterAccepted]);

  /**
   * 답변 정렬 함수
   */
  const sortAnswers = (answers: Answer[], sortBy: SortOption) => {
    const sorted = [...answers];

    switch (sortBy) {
      case "latest":
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "popular":
        return sorted.sort((a, b) => b.likeCount - a.likeCount);
      case "accepted":
        return sorted.sort((a, b) => {
          if (a.isAccepted && !b.isAccepted) return -1;
          if (!a.isAccepted && b.isAccepted) return 1;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      default:
        return sorted;
    }
  };

  /**
   * 답변 필터링 함수
   */
  const filterAnswers = (answers: Answer[]) => {
    if (filterAccepted) {
      return answers.filter(answer => answer.isAccepted);
    }
    return answers;
  };

  /**
   * 답변 채택 핸들러
   */
  const handleAcceptAnswer = async (answerId: string) => {
    setAnswers(prev =>
      prev.map(answer => ({
        ...answer,
        isAccepted: answer.id === answerId,
      }))
    );

    // TODO: API 호출
    console.log("답변 채택:", answerId);
  };

  /**
   * 답변 좋아요 토글 핸들러
   */
  const handleAnswerLike = async (answerId: string) => {
    setAnswers(prev =>
      prev.map(answer =>
        answer.id === answerId
          ? {
              ...answer,
              isLiked: !answer.isLiked,
              likeCount: answer.isLiked
                ? answer.likeCount - 1
                : answer.likeCount + 1,
            }
          : answer
      )
    );

    // TODO: API 호출
    console.log("답변 좋아요:", answerId);
  };

  /**
   * 답변 작성 완료 핸들러
   */
  // 답변 폼 데이터 상태
  const [answerFormData, setAnswerFormData] = useState({
    content: "",
    category: "general",
    priority: "normal" as const,
    isPublic: true,
    enableNotifications: true,
    allowComments: true,
    isAnonymous: false,
  });

  const handleAnswerSubmit = async (data: { content: string; category: string }) => {
    const newAnswer: Answer = {
      id: Date.now().toString(),
      content: data.content,
      author: {
        id: user?.id || "anonymous",
        name: user?.name || "익명",
        profileImage: user?.profileImage,
        isVerified: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likeCount: 0,
      isLiked: false,
      isAccepted: false,
      isAuthor: true,
      isQuestionAuthor: isQuestionAuthor,
    };

    setAnswers(prev => [newAnswer, ...prev]);
    setShowAnswerForm(false);

    // TODO: API 호출
    console.log("답변 작성:", data.content);
  };

  const handleAnswerFormChange = (data: Partial<{ content: string; category: string }>) => {
    setAnswerFormData(prev => ({ ...prev, ...data }));
  };

  /**
   * 필터링된 정렬된 답변들
   */
  const filteredAndSortedAnswers = sortAnswers(filterAnswers(answers), sortBy);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-md ${className}`}>
      {/* 답변 헤더 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <MessageCircle className="h-6 w-6 mr-2 text-indigo-600" />
            답변 {answers.length}개
          </h3>

          {isAuthenticated && (
            <Button
              variant="primary"
              onClick={() => setShowAnswerForm(!showAnswerForm)}
            >
              답변 작성
            </Button>
          )}
        </div>

        {/* 정렬 및 필터 옵션 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <SortAsc className="h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="popular">인기순</option>
              <option value="accepted">채택순</option>
            </select>
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filterAccepted}
              onChange={e => setFilterAccepted(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">채택된 답변만</span>
          </label>
        </div>
      </div>

      {/* 답변 작성 폼 */}
      {showAnswerForm && (
        <div className="p-6 border-b border-gray-200">
          <AnswerForm
            data={answerFormData}
            onChange={handleAnswerFormChange}
            onSubmit={handleAnswerSubmit}
            onCancel={() => setShowAnswerForm(false)}
          />
        </div>
      )}

      {/* 답변 목록 */}
      <div className="divide-y divide-gray-200">
        {filteredAndSortedAnswers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>아직 답변이 없습니다.</p>
            <p className="text-sm">첫 번째 답변을 작성해보세요!</p>
          </div>
        ) : (
          filteredAndSortedAnswers.map(answer => (
            <div key={answer.id} className="p-6">
              <AnswerCard
                answer={convertAnswerToAnswerData(answer)}
                onLike={() => handleAnswerLike(answer.id)}
                onAccept={
                  isQuestionAuthor
                    ? () => handleAcceptAnswer(answer.id)
                    : undefined
                }
                showAcceptButton={isQuestionAuthor && !answer.isAccepted}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
