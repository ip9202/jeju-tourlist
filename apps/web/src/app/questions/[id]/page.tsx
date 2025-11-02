// @CODE:ANSWER-INTERACTION-001-ERROR-HANDLING
// @SPEC:SPEC-ANSWER-INTERACTION-001-PHASE7
// Error handling with countdown timer for answer interactions

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
// import { useNewFacebookUI } from "@/hooks/useNewFacebookUI"; // TODO: Will be used for feature flag switching
import { Button, Heading, Text, ImageLightbox } from "@jeju-tourlist/ui";
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Heart,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { FacebookAnswerThread } from "@/components/question/facebook";

import { Header } from "@/components/layout/Header";
import { api } from "@/lib/apiClient";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleApiError,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isValidApiResponse,
} from "@/lib/facebook-qa-converter";
import {
  validateAnswerData,
  filterTopLevelAnswers,
} from "@/lib/validators/answerValidator";

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
  createdAt: string | Date;
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

const ANSWER_ERROR_TIMEOUT_MS = 4000;

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  // const { useFacebookUI } = useNewFacebookUI(); // TODO: Will be used for feature flag switching
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answerError, setAnswerError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const answerErrorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (answerErrorTimeoutRef.current) {
        clearTimeout(answerErrorTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadQuestion = async () => {
      setLoading(true);
      setError(null);

      try {
        // API 호출
        const result = await api.get(`/api/questions/${params.id}`);

        if (!result.success) {
          throw new Error(
            result.error || result.message || "질문을 불러올 수 없습니다"
          );
        }

        setQuestion(result.data);

        // @CODE:ANSWER-VALIDATOR-INTEGRATION-001
        // Validate and filter answers
        const rawAnswers = result.data.answers || [];
        try {
          // Validate each answer
          const validatedAnswers = rawAnswers.map((answer: any) =>
            validateAnswerData(answer)
          );

          // Filter top-level answers only (exclude comments with parentId)
          const topLevelAnswers = filterTopLevelAnswers(validatedAnswers);

          setAnswers(topLevelAnswers);
        } catch (validationError) {
          // Fallback: use raw answers if validation fails
          setAnswers(rawAnswers);
        }
      } catch (err) {
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
      // 타이머 정리
      if (answerErrorTimeoutRef.current)
        clearTimeout(answerErrorTimeoutRef.current);
      // 1.5초 후 자동 닫기 및 리다이렉트
      answerErrorTimeoutRef.current = setTimeout(() => {
        router.push("/auth/signin");
      }, 1500);
      return;
    }

    // 답변 검증
    if (!content.trim()) {
      setAnswerErrorWithTimer("답변을 입력해주세요");
      return;
    }

    if (content.trim().length < 10) {
      setAnswerErrorWithTimer("답변을 10자 이상 입력해주세요");
      return;
    }

    setIsSubmitting(true);
    setAnswerError("");

    try {
      let response;

      if (parentId) {
        // 중첩 댓글: POST /api/answers/:answerId/comments
        response = await api.post(`/api/answers/${parentId}/comments`, {
          content: content.trim(),
          authorId: user.id,
        });
      } else {
        // 메인 답변: POST /api/answers
        response = await api.post("/api/answers", {
          content: content.trim(),
          questionId: params.id,
          authorId: user.id,
        });
      }

      if (!response.success) {
        throw new Error(response.message || "작성에 실패했습니다.");
      }

      // 새 답변/댓글을 목록에 추가 (API 응답에 author 정보가 포함됨)
      if (response.data.author) {
        if (parentId) {
          // 대댓글인 경우 - 부모 답변의 replyCount 증가 + parentId 명시적 설정
          const newReply = {
            ...response.data,
            parentId: parentId, // 명시적으로 parentId 설정
          };

          setAnswers(
            prev =>
              prev.map(answer =>
                answer.id === parentId
                  ? {
                      ...answer,
                      replyCount: (answer.replyCount || 0) + 1,
                    }
                  : answer
              )
            // 댓글은 답변 목록이 아닌 별도 관리 (이후 FacebookAnswerThread에서 필터링)
          );

          // 댓글도 answers 배열에 추가하되 parentId 포함
          setAnswers(prev => [...prev, newReply]);
        } else {
          // 메인 답변인 경우
          setAnswers(prev => [response.data, ...prev]);
        }
      }

      // 메인 답변인 경우 답변 개수 업데이트 (대댓글은 업데이트하지 않음)
      if (question && !parentId) {
        setQuestion({
          ...question,
          answerCount: question.answerCount + 1,
        });
      }
    } catch (error) {
      console.error("작성 실패:", error);
      const errorMsg =
        error instanceof Error ? error.message : "작성 중 오류가 발생했습니다.";
      setAnswerErrorWithTimer(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async () => {
    // 소유자 확인
    if (question?.author.id !== user?.id) {
      alert("자신의 질문만 삭제할 수 있습니다.");
      return;
    }

    if (!window.confirm("정말 이 질문을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await api.delete(`/api/questions/${params.id}`);

      if (!response.success) {
        throw new Error(response.error || "질문 삭제에 실패했습니다.");
      }

      // alert 제거, router.replace() 사용으로 빠른 페이지 이동
      // window.location.href 대신 Next.js router 사용 (SPA 방식)
      router.replace("/questions");
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
  const handleAnswerLike = async (answerId: string, _isLike?: boolean) => {
    try {
      const response = await api.post(`/api/answers/${answerId}/reaction`, {
        isLike: true,
      });

      if (!response.success) {
        throw new Error(response.message || "좋아요 처리에 실패했습니다");
      }

      // 로컬 상태 업데이트 - 싫어요 자동 해제
      setAnswers(prev =>
        prev.map(answer =>
          answer.id === answerId
            ? {
                ...answer,
                isLiked: !answer.isLiked,
                isDisliked: false, // 좋아요 체크 시 싫어요 해제
                likeCount: answer.isLiked
                  ? answer.likeCount - 1
                  : answer.likeCount + 1,
                dislikeCount: answer.isDisliked
                  ? answer.dislikeCount - 1
                  : answer.dislikeCount,
              }
            : answer
        )
      );
    } catch (error) {
      console.error("답변 좋아요 실패:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "좋아요 처리 중 오류가 발생했습니다";
      setAnswerErrorWithTimer(errorMsg);
    }
  };

  /**
   * 답변 싫어요 핸들러
   * 싫어요 클릭 시 좋아요 자동 해제 (상호 배제)
   */
  const handleAnswerDislike = async (
    answerId: string,
    _isDislike?: boolean
  ) => {
    try {
      const response = await api.post(`/api/answers/${answerId}/reaction`, {
        isLike: false,
      });

      if (!response.success) {
        throw new Error(response.message || "싫어요 처리에 실패했습니다");
      }

      // 로컬 상태 업데이트 - 좋아요 자동 해제
      setAnswers(prev =>
        prev.map(answer =>
          answer.id === answerId
            ? {
                ...answer,
                isDisliked: !answer.isDisliked,
                isLiked: false, // 싫어요 체크 시 좋아요 해제
                dislikeCount: answer.isDisliked
                  ? answer.dislikeCount - 1
                  : answer.dislikeCount + 1,
                likeCount: answer.isLiked
                  ? answer.likeCount - 1
                  : answer.likeCount,
              }
            : answer
        )
      );
    } catch (error) {
      console.error("답변 싫어요 실패:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "싫어요 처리 중 오류가 발생했습니다";
      setAnswerErrorWithTimer(errorMsg);
    }
  };

  /**
   * 답변 채택 핸들러
   */
  const handleAnswerAdopt = async (answerId: string) => {
    try {
      const response = await api.post(`/api/answers/${answerId}/adopt`, {
        questionId: params.id,
      });

      if (!response.success) {
        throw new Error(response.message || "채택 처리에 실패했습니다");
      }

      // 로컬 상태 업데이트
      setAnswers(prev =>
        prev.map(answer =>
          answer.id === answerId
            ? {
                ...answer,
                isAccepted: true,
              }
            : answer
        )
      );
    } catch (error) {
      console.error("답변 채택 실패:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "채택 처리 중 오류가 발생했습니다";
      setAnswerErrorWithTimer(errorMsg);
    }
  };

  /**
   * 답변 채택 취소 핸들러
   */
  const handleAnswerUnadopt = async (answerId: string) => {
    try {
      const response = await api.delete(`/api/answers/${answerId}/adopt`);

      if (!response.success) {
        throw new Error(response.message || "채택 취소 처리에 실패했습니다");
      }

      // 로컬 상태 업데이트
      setAnswers(prev =>
        prev.map(answer =>
          answer.id === answerId
            ? {
                ...answer,
                isAccepted: false,
              }
            : answer
        )
      );
    } catch (error) {
      console.error("답변 채택 취소 실패:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "채택 취소 처리 중 오류가 발생했습니다";
      setAnswerErrorWithTimer(errorMsg);
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

  // 에러 메시지를 4초 타이머와 함께 설정
  const setAnswerErrorWithTimer = (message: string) => {
    setAnswerError(message);
    setCountdown(ANSWER_ERROR_TIMEOUT_MS / 1000); // 4로 설정

    // 이전 interval 정리
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // 카운트다운 시작 - 처음부터 4로 표시하고 1초마다 감소
    let remainingSeconds = ANSWER_ERROR_TIMEOUT_MS / 1000;
    countdownIntervalRef.current = setInterval(() => {
      remainingSeconds--;
      setCountdown(remainingSeconds);
      if (remainingSeconds <= 0) {
        setAnswerError("");
        clearInterval(countdownIntervalRef.current!);
      }
    }, 1000);
  };

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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 질문 상세 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          {/* 질문 제목 및 액션 버튼 */}
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex-grow pr-4">
              {question.title}
            </h1>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* 공개 액션: 모든 사용자에게 표시 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {}}
                className="text-gray-600 hover:text-gray-900"
                title="공유"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {}}
                className="text-gray-600 hover:text-gray-900"
                title="북마크"
              >
                <Bookmark className="w-4 h-4" />
              </Button>

              {/* 소유자 전용 액션: 자신의 질문일 때만 표시 */}
              {question.author.id === user?.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteQuestion}
                  className="text-gray-600 hover:text-red-600"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
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

          {/* 에러 메시지 배너 */}
          {answerError && (
            <div
              className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start gap-3"
              data-testid="answer-error"
              role="alert"
            >
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-red-800 font-medium">{answerError}</p>
                <p className="text-red-700 text-xs mt-1">
                  {countdown}초 후 자동으로 닫힙니다.
                </p>
              </div>
              <button
                onClick={() => {
                  setAnswerError("");
                  setCountdown(0);
                  if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                  }
                }}
                className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                aria-label="에러 메시지 닫기"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Facebook 스타일 답변 스레드 */}
          {question && (
            <>
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
                  createdAt:
                    typeof answer.createdAt === "string"
                      ? answer.createdAt
                      : answer.createdAt.toISOString(),
                  likeCount: answer.likeCount,
                  dislikeCount: answer.dislikeCount || 0,
                  isLiked: answer.isLiked || false,
                  isDisliked: answer.isDisliked || false,
                  isAccepted: answer.isAccepted,
                  parentId: answer.parentId || undefined,
                  replyCount: answer.replyCount || 0,
                }))}
                currentUser={
                  user
                    ? {
                        id: user.id,
                        name: user.name || user.email,
                      }
                    : undefined
                }
                onSubmitAnswer={handleAnswerSubmit}
                onLike={handleAnswerLike}
                onDislike={handleAnswerDislike}
                onAdopt={handleAnswerAdopt}
                onUnadopt={handleAnswerUnadopt}
                onReply={() => {}}
                isLoading={isSubmitting}
                maxDepth={2}
              />
            </>
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
