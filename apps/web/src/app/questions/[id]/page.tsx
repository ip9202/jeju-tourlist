"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button, Heading, Text, ImageLightbox } from "@jeju-tourlist/ui";
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Heart,
  MessageCircle,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface Question {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    nickname: string;
    avatar?: string | null;
  };
  category: {
    id: string;
    name: string;
    color?: string;
  } | null;
  tags: string[];
  attachments: string[];
  isResolved: boolean;
  answerCount: number;
  createdAt: string;
  viewCount: number;
  likeCount: number;
}

interface Answer {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    nickname: string;
    avatar?: string | null;
  };
  createdAt: string;
  likeCount: number;
  isAccepted: boolean;
}

export default function QuestionDetailPage() {
  const params = useParams();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAnswer, setNewAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answerError, setAnswerError] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadQuestion = async () => {
      setLoading(true);
      setError(null);

      try {
        // API 호출
        const response = await fetch(`/api/questions/${params.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("질문을 찾을 수 없습니다");
          }
          throw new Error("질문을 불러오는 중 오류가 발생했습니다");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "질문을 불러올 수 없습니다");
        }

        setQuestion(result.data);
        setAnswers(result.data.answers || []);
      } catch (err) {
        console.error("[DEBUG] 질문 로드 실패:", err);
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadQuestion();
    }
  }, [params.id]);

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 답변 검증
    if (!newAnswer.trim()) {
      setAnswerError("답변을 입력해주세요");
      return;
    }

    if (newAnswer.trim().length < 10) {
      setAnswerError("답변을 10자 이상 입력해주세요");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    setAnswerError("");

    try {
      // API 호출 (Next.js rewrites를 통해 프록시됨)
      const response = await fetch(`/api/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newAnswer.trim(),
          questionId: params.id,
          authorId: "temp-user-id", // 임시 사용자 ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "답변 작성에 실패했습니다.");
      }

      const result = await response.json();
      console.log("답변 작성 성공:", result);

      // 새 답변을 목록에 추가 (API 응답에 author 정보가 포함됨)
      if (result.data.author) {
        setAnswers(prev => [result.data, ...prev]);
      }
      setNewAnswer("");

      // 답변 개수 업데이트
      if (question) {
        setQuestion({
          ...question,
          answerCount: question.answerCount + 1,
        });
      }
    } catch (error) {
      console.error("답변 작성 실패:", error);
      setAnswerError(
        error instanceof Error
          ? error.message
          : "답변 작성 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm("정말 이 질문을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/questions/${params.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "질문 삭제에 실패했습니다.");
      }

      alert("질문이 삭제되었습니다.");
      window.location.href = "/questions";
    } catch (error) {
      console.error("질문 삭제 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "질문 삭제 중 오류가 발생했습니다."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div
            className="flex flex-col items-center justify-center py-12"
            data-testid="loading-spinner"
          >
            <LoadingSpinner size="lg" className="mb-4" />
            <Text className="text-gray-600">질문을 불러오는 중...</Text>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center" data-testid="question-not-found">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
            <p className="text-gray-600 mb-8">
              요청하신 질문이 존재하지 않거나 삭제되었습니다.
            </p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              이전 페이지로
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              질문을 찾을 수 없습니다
            </h1>
            <p className="text-gray-600 mb-8">
              요청하신 질문이 존재하지 않거나 삭제되었습니다.
            </p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              이전 페이지로
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
        </div>

        {/* 질문 상세 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <Heading
                level={1}
                className="text-2xl font-bold text-gray-900 mb-4"
              >
                {question.title}
              </Heading>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span>조회 {question.viewCount}</span>
                <span>좋아요 {question.likeCount}</span>
                <span>답변 {question.answerCount}</span>
                <span>
                  {new Date(question.createdAt).toLocaleString("ko-KR")}
                </span>
              </div>
              {question.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                공유
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 mr-2" />
                북마크
              </Button>
              {/* 작성자만 표시 - 임시로 모든 사용자에게 표시 */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteQuestion}
                className="text-red-600 hover:bg-red-50"
                data-testid="delete-question-button"
              >
                삭제
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <Text className="text-gray-700 leading-relaxed whitespace-pre-line">
              {question.content}
            </Text>
          </div>

          {/* 첨부 파일 이미지 표시 */}
          {question.attachments && question.attachments.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                {question.attachments.map((attachment, index) => (
                  <div key={index} className="relative cursor-pointer group">
                    <img
                      src={attachment}
                      alt={`첨부 이미지 ${index + 1}`}
                      className="w-full h-auto rounded-lg border border-gray-200 transition-all group-hover:shadow-lg group-hover:scale-[1.02]"
                      onClick={() => {
                        setCurrentImageIndex(index);
                        setLightboxOpen(true);
                      }}
                      onError={e => {
                        const target = e.currentTarget;
                        // 무한 루프 방지
                        if (!target.dataset.errorHandled) {
                          target.dataset.errorHandled = "true";
                          console.error("이미지 로드 실패:", attachment);
                          // 에러 시 숨김 처리
                          target.style.display = "none";
                        }
                      }}
                    />
                    {/* 호버 시 확대 아이콘 표시 */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg">
                      <svg
                        className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {question.author.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {question.author.name}
                </div>
                <div className="text-sm text-gray-500">
                  {question.category ? question.category.name : "미분류"}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4 mr-2" />
              좋아요
            </Button>
          </div>
        </div>

        {/* 답변 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <Heading
              level={2}
              className="text-xl font-bold text-gray-900 flex items-center"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              답변 {answers.length}개
            </Heading>
          </div>

          {/* 답변 목록 */}
          <div className="space-y-6" data-testid="answer-list">
            {answers.map(answer => (
              <div
                key={answer.id}
                className="border-b border-gray-200 pb-6 last:border-b-0"
                data-testid="answer-item"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="flex items-center space-x-3"
                    data-testid="answer-author"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {answer.author.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {answer.author.name}
                        <span className="ml-2 text-sm text-gray-500">
                          @{answer.author.nickname}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {new Date(answer.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                    {answer.isAccepted && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        채택됨
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-gray-700 leading-relaxed whitespace-pre-line mb-4">
                  {answer.content}
                </div>

                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4 mr-2" />
                    좋아요 {answer.likeCount}
                  </Button>
                  <Button variant="outline" size="sm">
                    답변하기
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 답변 작성 폼 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <Heading level={3} className="text-lg font-bold text-gray-900 mb-4">
            답변 작성
          </Heading>
          <form onSubmit={handleAnswerSubmit} className="space-y-4">
            <div>
              <textarea
                value={newAnswer}
                onChange={e => setNewAnswer(e.target.value)}
                placeholder="답변을 작성해주세요..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                data-testid="answer-content"
                disabled={isSubmitting}
              />
            </div>
            {answerError && (
              <div
                className="text-red-600 text-sm mt-2"
                data-testid="answer-error"
              >
                {answerError}
              </div>
            )}
            <div className="flex justify-end">
              <Button
                type="submit"
                data-testid="submit-answer"
                disabled={isSubmitting}
              >
                {isSubmitting ? "작성 중..." : "답변 작성"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* 이미지 라이트박스 */}
      {lightboxOpen && question.attachments && (
        <ImageLightbox
          images={question.attachments}
          currentIndex={currentImageIndex}
          onClose={() => setLightboxOpen(false)}
          onPrevious={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
          onNext={() =>
            setCurrentImageIndex(prev =>
              Math.min(question.attachments.length - 1, prev + 1)
            )
          }
        />
      )}
    </div>
  );
}
