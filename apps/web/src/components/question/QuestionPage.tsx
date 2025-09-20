"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { QuestionDetail } from "./QuestionDetail";
import { AnswerSection } from "./AnswerSection";
import { Breadcrumb } from "@/packages/ui/components/molecules/Breadcrumb";
import { Button } from "@/packages/ui/components/atoms/Button";
import { ArrowLeft, Share2, Bookmark } from "lucide-react";

/**
 * QuestionPage 컴포넌트 Props
 */
interface QuestionPageProps {
  questionId?: string;
}

/**
 * QuestionPage 컴포넌트
 *
 * @description
 * - 질문 상세 페이지의 전체 레이아웃을 담당
 * - 질문 정보와 답변 섹션을 조합
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 브레드크럼 네비게이션과 액션 버튼 포함
 *
 * @example
 * ```tsx
 * <QuestionPage questionId="123" />
 * ```
 */
export const QuestionPage: React.FC<QuestionPageProps> = ({ questionId }) => {
  const params = useParams();
  const [question, setQuestion] = useState<{
    id: string;
    title: string;
    author: { id: string; name: string };
    category: string;
    isAnswered: boolean;
    answerCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // URL 파라미터에서 questionId 가져오기
  const actualQuestionId = questionId || (params?.id as string);

  /**
   * 컴포넌트 마운트 시 질문 데이터 로드
   */
  useEffect(() => {
    const loadQuestion = async () => {
      setLoading(true);
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 목업 데이터
      const mockQuestion = {
        id: actualQuestionId,
        title: "제주도 3박 4일 여행 코스 추천해주세요",
        author: {
          id: "user1",
          name: "김제주",
        },
        category: "여행",
        isAnswered: true,
        answerCount: 12,
      };

      setQuestion(mockQuestion);
      setLoading(false);
    };

    if (actualQuestionId) {
      loadQuestion();
    }
  }, [actualQuestionId]);

  /**
   * 뒤로가기 핸들러
   */
  const handleGoBack = () => {
    window.history.back();
  };

  /**
   * 공유 핸들러
   */
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: question?.title,
        url: window.location.href,
      });
    } else {
      // 클립보드에 URL 복사
      navigator.clipboard.writeText(window.location.href);
      alert("링크가 클립보드에 복사되었습니다.");
    }
  };

  /**
   * 북마크 핸들러
   */
  const handleBookmark = () => {
    // TODO: 북마크 기능 구현
    console.log("북마크:", actualQuestionId);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!question) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              질문을 찾을 수 없습니다
            </h1>
            <p className="text-gray-600 mb-8">
              요청하신 질문이 존재하지 않거나 삭제되었습니다.
            </p>
            <Button onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 브레드크럼 네비게이션 */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: "홈", href: "/" },
              { label: "질문목록", href: "/questions" },
              {
                label: question.category,
                href: `/questions?category=${question.category}`,
              },
              { label: question.title, href: `/questions/${question.id}` },
            ]}
          />
        </div>

        {/* 질문 상세 정보 */}
        <div className="mb-8">
          <QuestionDetail questionId={actualQuestionId} />
        </div>

        {/* 답변 섹션 */}
        <div className="mb-8">
          <AnswerSection
            questionId={actualQuestionId}
            isQuestionAuthor={false} // 실제로는 질문 작성자인지 확인
          />
        </div>

        {/* 하단 액션 버튼 */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleBookmark}
              className="flex items-center"
            >
              <Bookmark className="h-4 w-4 mr-2" />
              북마크
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center"
            >
              <Share2 className="h-4 w-4 mr-2" />
              공유
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
