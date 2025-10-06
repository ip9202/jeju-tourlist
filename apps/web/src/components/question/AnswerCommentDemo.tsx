"use client";

import React, { useState, useEffect } from "react";
import { EnhancedAnswerCard } from "./EnhancedAnswerCard";

/**
 * 답변 데이터 타입
 */
interface Answer {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  isAccepted?: boolean;
  isLiked?: boolean;
  isDisliked?: boolean;
  isAuthor?: boolean;
  isQuestionAuthor?: boolean;
}

/**
 * AnswerCommentDemo 컴포넌트
 *
 * @description
 * - 답변 댓글 기능을 테스트하기 위한 데모 컴포넌트
 * - 실제 API와 연동하여 댓글 작성, 수정, 삭제, 좋아요 기능 테스트
 */
export const AnswerCommentDemo: React.FC = () => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * 목업 답변 데이터 로드
   */
  useEffect(() => {
    const loadMockAnswers = async () => {
      setLoading(true);

      // 실제로는 API에서 가져올 데이터
      const mockAnswers: Answer[] = [
        {
          id: "answer-1",
          content:
            "제주도 여행 추천드립니다! 3박 4일이라면 다음과 같은 코스를 추천해요:\n\n1일차: 제주시 - 성산일출봉 - 우도\n2일차: 중문 - 천지연폭포 - 한라산\n3일차: 서귀포 - 중문관광단지 - 카지노\n4일차: 제주시 - 공항\n\n특히 성산일출봉에서 보는 일출은 정말 아름다워요!",
          author: {
            id: "user-1",
            name: "김제주",
            avatar: "/avatars/kim-jeju.jpg",
          },
          likeCount: 15,
          dislikeCount: 2,
          commentCount: 3,
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
          isAccepted: true,
          isLiked: false,
          isDisliked: false,
          isAuthor: false,
          isQuestionAuthor: true,
        },
        {
          id: "answer-2",
          content:
            "저도 비슷한 코스로 다녀왔는데, 우도는 정말 추천해요! 자전거 타고 섬 한 바퀴 도는 것도 좋고, 해산물도 맛있어요. 다만 날씨가 좋을 때 가시는 게 좋을 것 같아요.",
          author: {
            id: "user-2",
            name: "박여행",
            avatar: "/avatars/park-travel.jpg",
          },
          likeCount: 8,
          dislikeCount: 0,
          commentCount: 1,
          createdAt: "2024-01-15T14:20:00Z",
          updatedAt: "2024-01-15T14:20:00Z",
          isAccepted: false,
          isLiked: true,
          isDisliked: false,
          isAuthor: false,
          isQuestionAuthor: false,
        },
      ];

      setAnswers(mockAnswers);
      setLoading(false);
    };

    loadMockAnswers();
  }, []);

  /**
   * 답변 좋아요 핸들러
   */
  const handleAnswerLike = async (answerId: string) => {
    try {
      const response = await fetch(`/api/answers/${answerId}/reaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isLike: true,
        }),
      });

      if (!response.ok) {
        throw new Error("좋아요 처리에 실패했습니다");
      }

      // 로컬 상태 업데이트
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
    } catch (error) {
      console.error("답변 좋아요 실패:", error);
    }
  };

  /**
   * 답변 싫어요 핸들러
   */
  const handleAnswerDislike = async (answerId: string) => {
    try {
      const response = await fetch(`/api/answers/${answerId}/reaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isLike: false,
        }),
      });

      if (!response.ok) {
        throw new Error("싫어요 처리에 실패했습니다");
      }

      // 로컬 상태 업데이트
      setAnswers(prev =>
        prev.map(answer =>
          answer.id === answerId
            ? {
                ...answer,
                isDisliked: !answer.isDisliked,
                dislikeCount: answer.isDisliked
                  ? answer.dislikeCount - 1
                  : answer.dislikeCount + 1,
              }
            : answer
        )
      );
    } catch (error) {
      console.error("답변 싫어요 실패:", error);
    }
  };

  /**
   * 답변 채택 핸들러
   */
  const handleAnswerAccept = async (answerId: string) => {
    try {
      const response = await fetch(`/api/answers/${answerId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: "question-1", // 실제로는 질문 ID를 전달
        }),
      });

      if (!response.ok) {
        throw new Error("답변 채택에 실패했습니다");
      }

      // 로컬 상태 업데이트 - 다른 답변들의 채택 해제
      setAnswers(prev =>
        prev.map(answer => ({
          ...answer,
          isAccepted: answer.id === answerId,
        }))
      );
    } catch (error) {
      console.error("답변 채택 실패:", error);
    }
  };

  /**
   * 답변 수정 핸들러
   */
  const handleAnswerEdit = (answerId: string) => {
    console.log("답변 수정:", answerId);
    // 실제로는 수정 모달이나 페이지로 이동
  };

  /**
   * 답변 삭제 핸들러
   */
  const handleAnswerDelete = async (answerId: string) => {
    if (!window.confirm("답변을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/answers/${answerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("답변 삭제에 실패했습니다");
      }

      // 로컬 상태에서 제거
      setAnswers(prev => prev.filter(answer => answer.id !== answerId));
    } catch (error) {
      console.error("답변 삭제 실패:", error);
    }
  };

  /**
   * 북마크 핸들러
   */
  const handleBookmark = async (answerId: string) => {
    console.log("북마크:", answerId);
    // 실제로는 북마크 API 호출
  };

  /**
   * 공유 핸들러
   */
  const handleShare = (answerId: string) => {
    console.log("공유:", answerId);
    // 실제로는 공유 기능 구현
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">답변을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          답변 댓글 기능 데모
        </h1>
        <p className="text-gray-600">
          답변에 대한 댓글 작성, 수정, 삭제, 좋아요 기능을 테스트해보세요.
        </p>
      </div>

      <div className="space-y-6">
        {answers.map(answer => (
          <EnhancedAnswerCard
            key={answer.id}
            answer={answer}
            onLike={handleAnswerLike}
            onDislike={handleAnswerDislike}
            onAccept={handleAnswerAccept}
            onEdit={handleAnswerEdit}
            onDelete={handleAnswerDelete}
            onBookmark={handleBookmark}
            onShare={handleShare}
            showComments={true}
            maxComments={5}
          />
        ))}
      </div>

      {answers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">표시할 답변이 없습니다.</p>
        </div>
      )}
    </div>
  );
};
