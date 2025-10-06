"use client";

import React from "react";
import { EnhancedAnswerCard } from "@/components/question/EnhancedAnswerCard";

/**
 * 계층구조 댓글 시스템 테스트 페이지
 */
export default function HierarchicalCommentTestPage() {
  // 목업 답변 데이터 (계층구조 댓글 포함)
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
    commentCount: 5,
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
  };

  /**
   * 답변 싫어요 핸들러
   */
  const handleAnswerDislike = async (answerId: string) => {
    console.log("답변 싫어요:", answerId);
  };

  /**
   * 답변 채택 핸들러
   */
  const handleAnswerAccept = async (answerId: string) => {
    console.log("답변 채택:", answerId);
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
            계층구조 댓글 시스템 테스트
          </h1>
          <p className="text-gray-600 mb-4">
            SNS 스타일의 계층구조 댓글 시스템입니다. 답변 카드에서 "댓글" 버튼을
            클릭하면 댓글 섹션이 나타납니다.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">🎯 테스트 기능</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>댓글 작성</strong>: 최상위 댓글 작성
              </li>
              <li>
                • <strong>답글 달기</strong>: 댓글에 답글 달기 (계층구조)
              </li>
              <li>
                • <strong>답글의 답글</strong>: 답글에 다시 답글 달기 (최대
                3단계)
              </li>
              <li>
                • <strong>들여쓰기</strong>: 계층에 따른 시각적 구분
              </li>
              <li>
                • <strong>펼치기/접기</strong>: 답글 목록 펼치기/접기
              </li>
              <li>
                • <strong>좋아요</strong>: 댓글 및 답글 좋아요
              </li>
              <li>
                • <strong>수정/삭제</strong>: 작성자 권한 확인
              </li>
            </ul>
          </div>
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

        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📋 사용법 가이드
          </h2>

          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900">1. 댓글 작성</h3>
              <p>
                답변 카드 하단의 "댓글" 버튼을 클릭하면 댓글 섹션이 펼쳐집니다.
                댓글 작성 폼에서 내용을 입력하고 "댓글 등록"을 클릭하세요.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">2. 답글 달기</h3>
              <p>
                댓글 하단의 "답글" 버튼을 클릭하면 답글 작성 폼이 나타납니다.
                답글은 들여쓰기되어 계층구조로 표시됩니다.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">3. 답글의 답글</h3>
              <p>
                답글에도 다시 답글을 달 수 있습니다. 최대 3단계까지 계층구조가
                지원됩니다.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">4. 펼치기/접기</h3>
              <p>
                답글이 많은 댓글은 "답글 N개 보기" 버튼으로 펼치고 접을 수
                있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
