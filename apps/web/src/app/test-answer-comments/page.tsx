"use client";

import React from "react";
import { EnhancedAnswerCard } from "@/components/question/EnhancedAnswerCard";

/**
 * 답변 댓글 기능 테스트 페이지
 */
export default function AnswerCommentTestPage() {
  // 목업 답변 데이터
  const mockAnswer = {
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
  };

  /**
   * 답변 좋아요 핸들러
   */
  const handleAnswerLike = async (answerId: string) => {
    console.log("답변 좋아요:", answerId);
    // 실제로는 API 호출
  };

  /**
   * 답변 싫어요 핸들러
   */
  const handleAnswerDislike = async (answerId: string) => {
    console.log("답변 싫어요:", answerId);
    // 실제로는 API 호출
  };

  /**
   * 답변 채택 핸들러
   */
  const handleAnswerAccept = async (answerId: string) => {
    console.log("답변 채택:", answerId);
    // 실제로는 API 호출
  };

  /**
   * 답변 수정 핸들러
   */
  const handleAnswerEdit = (answerId: string) => {
    console.log("답변 수정:", answerId);
  };

  /**
   * 답변 삭제 핸들러
   */
  const handleAnswerDelete = async (answerId: string) => {
    console.log("답변 삭제:", answerId);
  };

  /**
   * 북마크 핸들러
   */
  const handleBookmark = async (answerId: string) => {
    console.log("북마크:", answerId);
  };

  /**
   * 공유 핸들러
   */
  const handleShare = (answerId: string) => {
    console.log("공유:", answerId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            답변 댓글 기능 테스트
          </h1>
          <p className="text-gray-600">
            답변 카드에서 "댓글" 버튼을 클릭하면 댓글 섹션이 나타납니다.
          </p>
        </div>

        <EnhancedAnswerCard
          answer={mockAnswer}
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
      </div>
    </div>
  );
}
