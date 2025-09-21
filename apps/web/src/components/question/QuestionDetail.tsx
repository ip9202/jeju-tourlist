"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, LikeButton, BookmarkButton, ShareButton, HashtagList, TimestampDisplay } from "@jeju-tourlist/ui";
import {
  MessageCircle,
  Eye,
  Flag,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
} from "lucide-react";

/**
 * 질문 데이터 타입
 */
interface Question {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    profileImage?: string;
    isVerified?: boolean;
  };
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isAnswered: boolean;
  answerCount: number;
  isAuthor: boolean;
}

/**
 * QuestionDetail 컴포넌트 Props
 */
interface QuestionDetailProps {
  questionId: string;
  className?: string;
}

/**
 * QuestionDetail 컴포넌트
 *
 * @description
 * - 질문 상세 정보를 표시하는 컴포넌트
 * - 질문 내용, 작성자 정보, 상호작용 기능 포함
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 권한에 따른 조건부 렌더링
 *
 * @example
 * ```tsx
 * <QuestionDetail questionId="123" />
 * ```
 */
export const QuestionDetail: React.FC<QuestionDetailProps> = ({
  questionId,
  className = "",
}) => {
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  /**
   * 목업 데이터 (실제로는 API에서 가져올 데이터)
   */
  const mockQuestion: Question = {
    id: questionId,
    title: "제주도 3박 4일 여행 코스 추천해주세요",
    content: `제주도 3박 4일 여행을 계획하고 있는데, 어떤 코스가 좋을까요? 

가족 여행이고 아이가 5살입니다. 아이가 좋아할 만한 장소들과 가족 모두가 즐길 수 있는 활동들을 중심으로 추천해주시면 감사하겠습니다.

특히 궁금한 점들:
- 아이가 좋아할 만한 테마파크나 체험장
- 가족 단위로 이용하기 좋은 숙박시설
- 이동이 편한 교통수단
- 비가 와도 즐길 수 있는 실내 관광지

예산은 총 200만원 정도로 생각하고 있습니다.`,
    author: {
      id: "user1",
      name: "김제주",
      profileImage: "/avatars/kim-jeju.jpg",
      isVerified: true,
    },
    category: "여행",
    tags: ["3박4일", "가족여행", "코스추천", "아이동반"],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    viewCount: 1250,
    likeCount: 45,
    isLiked: false,
    isBookmarked: false,
    isAnswered: true,
    answerCount: 12,
    isAuthor: user?.id === "user1",
  };

  /**
   * 컴포넌트 마운트 시 질문 데이터 로드
   */
  useEffect(() => {
    const loadQuestion = async () => {
      setLoading(true);
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      setQuestion(mockQuestion);
      setLoading(false);
    };

    loadQuestion();
  }, [questionId]);

  /**
   * 좋아요 토글 핸들러
   */
  const handleLikeToggle = async () => {
    if (!question) return;

    setQuestion(prev =>
      prev
        ? {
            ...prev,
            isLiked: !prev.isLiked,
            likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
          }
        : null
    );

    // TODO: API 호출
    console.log("좋아요 토글:", question.id);
  };

  /**
   * 북마크 토글 핸들러
   */
  const handleBookmarkToggle = async () => {
    if (!question) return;

    setQuestion(prev =>
      prev
        ? {
            ...prev,
            isBookmarked: !prev.isBookmarked,
          }
        : null
    );

    // TODO: API 호출
    console.log("북마크 토글:", question.id);
  };

  /**
   * 공유 핸들러
   */
  const handleShare = () => {
    // TODO: 공유 기능 구현
    console.log("공유:", question?.id);
  };

  /**
   * 신고 핸들러
   */
  const handleReport = () => {
    // TODO: 신고 기능 구현
    console.log("신고:", question?.id);
  };

  /**
   * 질문 수정 핸들러
   */
  const handleEdit = () => {
    // TODO: 질문 수정 페이지로 이동
    console.log("질문 수정:", question?.id);
  };

  /**
   * 질문 삭제 핸들러
   */
  const handleDelete = () => {
    if (confirm("정말로 이 질문을 삭제하시겠습니까?")) {
      // TODO: 질문 삭제 API 호출
      console.log("질문 삭제:", question?.id);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div
        className={`bg-white rounded-xl shadow-md p-6 text-center ${className}`}
      >
        <p className="text-gray-500">질문을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <article className={`bg-white rounded-xl shadow-md ${className}`}>
      {/* 질문 헤더 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {question.title}
            </h1>

            {/* 작성자 정보 */}
            <div className="flex items-center space-x-3 mb-4">
              <Avatar
                src={question.author.profileImage}
                alt={question.author.name}
                size="sm"
              />
              <div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">
                    {question.author.name}
                  </span>
                  {question.author.isVerified && (
                    <CheckCircle className="h-4 w-4 text-blue-500 ml-1" />
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <TimestampDisplay timestamp={question.createdAt} />
                  {question.updatedAt !== question.createdAt && (
                    <>
                      <span className="mx-2">•</span>
                      <span>수정됨</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 카테고리 및 태그 */}
            <div className="flex items-center space-x-4 mb-4">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                {question.category}
              </span>
              <HashtagList hashtags={question.tags.map(tag => ({ id: tag, name: tag, text: tag }))} />
            </div>
          </div>

          {/* 더보기 메뉴 */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                {question.isAuthor && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      수정
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </button>
                  </>
                )}
                <button
                  onClick={handleReport}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  신고
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 질문 통계 */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span>{question.viewCount.toLocaleString()} 조회</span>
            </div>
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-1" />
              <span>{question.answerCount}개 답변</span>
            </div>
            {question.isAnswered && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>답변완료</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 질문 내용 */}
      <div className="p-6">
        <div className="prose max-w-none">
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">
            {question.content}
          </p>
        </div>
      </div>

      {/* 질문 액션 버튼 */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <LikeButton
              liked={question.isLiked}
              count={question.likeCount}
              onLike={handleLikeToggle}
            />
            <BookmarkButton
              bookmarked={question.isBookmarked}
              onToggle={handleBookmarkToggle}
            />
            <ShareButton 
              onShare={handleShare} 
              shareOptions={{
                url: window.location.href,
                title: question.title
              }}
            />
          </div>

          <div className="text-sm text-gray-500">
            마지막 업데이트: <TimestampDisplay timestamp={question.updatedAt} />
          </div>
        </div>
      </div>
    </article>
  );
};
