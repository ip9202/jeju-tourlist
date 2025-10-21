"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Heading, Text, ImageLightbox } from "@jeju-tourlist/ui";
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Heart,
  MessageCircle,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { FacebookAnswerThread } from "@/components/question/facebook";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { Header } from "@/components/layout/Header";
import { api } from "@/lib/apiClient";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleApiError,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isValidApiResponse,
} from "@/lib/facebook-qa-converter";

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
  dislikeCount: number;
  commentCount: number;
  isAccepted: boolean;
  isLiked?: boolean;
  isDisliked?: boolean;
  isAuthor?: boolean;
  isQuestionAuthor?: boolean;
  parentId?: string | null;
  replyCount?: number;
}

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const handleAnswerSubmit = async (content: string, parentId?: string) => {
    // 로그인 체크
    if (!user?.id) {
      setAnswerError("로그인이 필요합니다.");
      setTimeout(() => {
        router.push("/auth/signin");
      }, 1500);
      return;
    }

    // 답변 검증
    if (!content.trim()) {
      setAnswerError("답변을 입력해주세요");
      return;
    }

    if (content.trim().length < 10) {
      setAnswerError("답변을 10자 이상 입력해주세요");
      return;
    }

    setIsSubmitting(true);
    setAnswerError("");

    try {
      // API 호출 (api 클라이언트 사용 - 자동으로 Authorization 헤더 포함)
      const response = await api.post("/api/answers", {
        content: content.trim(),
        questionId: params.id,
        authorId: user.id,
        parentId: parentId,
      });

      if (!response.success) {
        throw new Error(response.error || "답변 작성에 실패했습니다.");
      }

      // 새 답변을 목록에 추가 (API 응답에 author 정보가 포함됨)
      if (response.data.author) {
        if (parentId) {
          // 대댓글인 경우 - 부모 답변의 replyCount 증가
          setAnswers(prev =>
            prev.map(answer =>
              answer.id === parentId
                ? {
                    ...answer,
                    replyCount: (answer.replyCount || 0) + 1,
                  }
                : answer
            ).concat(response.data)
          );
        } else {
          // 메인 답변인 경우
          setAnswers(prev => [response.data, ...prev]);
        }
      }

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
      <Header />
      {/* 간결한 헤더 */}
      <SubPageHeader
        title={question?.title || "질문 상세"}
        showBackButton={true}
        showHomeButton={true}
        actions={
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {}}
              className="text-gray-600 hover:text-gray-900"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {}}
              className="text-gray-600 hover:text-gray-900"
            >
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        }
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 질문 상세 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
              <span>조회 {question.viewCount}</span>
              <span>좋아요 {question.likeCount}</span>
              <span>답변 {question.answerCount}</span>
              <span>
                {new Date(question.createdAt).toLocaleString("ko-KR")}
              </span>
            </div>
            {question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {question.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {/* 작성자만 표시 - 임시로 모든 사용자에게 표시 */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteQuestion}
                className="text-red-600 hover:bg-red-50 text-xs px-2 py-1"
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

        {/* 답변 섹션 - FacebookAnswerThread 사용 */}
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

          {/* Facebook 스타일 답변 스레드 */}
          {user && question ? (
            <FacebookAnswerThread
              question={{
                id: question.id,
                title: question.title,
                content: question.content,
                author: {
                  id: question.author.id,
                  name: question.author.name,
                  avatar: question.author.avatar || undefined,
                },
                createdAt: question.createdAt,
                likeCount: question.likeCount,
                answerCount: question.answerCount,
                viewCount: question.viewCount,
                tags: question.tags,
              }}
              answers={answers.map(answer => ({
                id: answer.id,
                content: answer.content,
                author: {
                  id: answer.author.id,
                  name: answer.author.name,
                  avatar: answer.author.avatar || undefined,
                },
                createdAt: answer.createdAt,
                likeCount: answer.likeCount,
                dislikeCount: answer.dislikeCount || 0,
                isLiked: answer.isLiked || false,
                isDisliked: answer.isDisliked || false,
                isAccepted: answer.isAccepted,
                parentId: answer.parentId || undefined,
                replyCount: answer.replyCount || 0,
              }))}
              currentUser={{
                id: user.id,
                name: user.name || user.email,
              }}
              onSubmitAnswer={handleAnswerSubmit}
              onLike={handleAnswerLike}
              onDislike={handleAnswerDislike}
              onReply={() => {}}
              isLoading={isSubmitting}
              maxDepth={2}
            />
          ) : (
            <div className="text-center py-8">
              <Text className="text-gray-600 mb-4">
                답변을 작성하려면 로그인이 필요합니다.
              </Text>
              <Button onClick={() => router.push("/auth/signin")}>
                로그인하기
              </Button>
            </div>
          )}

          {answerError && (
            <div
              className="text-red-600 text-sm mt-4"
              data-testid="answer-error"
            >
              {answerError}
            </div>
          )}
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
