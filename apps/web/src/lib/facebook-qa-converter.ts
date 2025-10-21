/**
 * Facebook Q&A 데이터 변환 함수
 *
 * API 응답 데이터를 Facebook 컴포넌트 형식으로 변환하는 유틸리티
 * SOLID 원칙 준수: Single Responsibility (데이터 변환만 담당)
 */

import {
  Answer as FacebookAnswer,
  User as FacebookUser,
  Question as FacebookQuestion,
  BadgeType,
} from "@/components/question/facebook/types";

/**
 * API 답변 데이터 인터페이스
 */
export interface ApiAnswer {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    nickname?: string;
    avatar?: string | null;
  };
  createdAt: string;
  updatedAt?: string;
  likeCount: number;
  dislikeCount: number;
  commentCount?: number;
  isAccepted: boolean;
  isLiked?: boolean;
  isDisliked?: boolean;
  isAuthor?: boolean;
  isQuestionAuthor?: boolean;
  // 배지 결정용 추가 필드
  acceptedAt?: string | null;
  author_stats?: {
    answerCount?: number;
    acceptanceRate?: number;
  };
}

/**
 * API 질문 데이터 인터페이스
 */
export interface ApiQuestion {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    nickname?: string;
    avatar?: string | null;
  };
  createdAt: string;
  updatedAt?: string;
  category?: {
    id: string;
    name: string;
    color?: string;
  } | null;
  tags: string[];
  attachments: string[];
  isResolved: boolean;
  answerCount: number;
  viewCount: number;
  likeCount: number;
}

/**
 * Facebook 사용자 데이터로 변환
 *
 * @param author - API 답변/질문 작성자 데이터
 * @returns Facebook 형식의 사용자 데이터
 */
export const convertToFacebookUser = (author: {
  id: string;
  name: string;
  nickname?: string;
  avatar?: string | null;
}): FacebookUser => {
  return {
    id: author.id,
    name: author.name,
    avatar: author.avatar || undefined,
    email: undefined, // API에서 제공하지 않음
  };
};

/**
 * 사용자 배지 결정 로직
 *
 * @param answer - API 답변 데이터
 * @param isQuestionAuthor - 질문 작성자 여부
 * @returns 배지 타입
 */
export const determineBadge = (
  answer: ApiAnswer,
  isQuestionAuthor: boolean
): BadgeType | undefined => {
  // 채택된 답변 -> 'accepted' 배지
  if (answer.isAccepted) {
    return "accepted";
  }

  // 질문 작성자 -> 'expert' 배지
  if (isQuestionAuthor) {
    return "expert";
  }

  // 신규 사용자 판정: 답변 5개 이하
  const answerCount = answer.author_stats?.answerCount || 0;
  if (answerCount <= 5) {
    return "newbie";
  }

  return undefined;
};

/**
 * API 답변을 Facebook 답변으로 변환
 *
 * @param apiAnswer - API 응답 답변 데이터
 * @param questionAuthorId - 질문 작성자 ID (배지 판정용)
 * @returns Facebook 형식의 답변 데이터
 */
export const convertToFacebookAnswer = (
  apiAnswer: ApiAnswer,
  questionAuthorId: string
): FacebookAnswer => {
  const isQuestionAuthor = apiAnswer.author.id === questionAuthorId;

  return {
    id: apiAnswer.id,
    content: apiAnswer.content,
    author: convertToFacebookUser(apiAnswer.author),
    createdAt: apiAnswer.createdAt,
    updatedAt: apiAnswer.updatedAt,
    likeCount: apiAnswer.likeCount,
    dislikeCount: apiAnswer.dislikeCount,
    isLiked: apiAnswer.isLiked,
    isDisliked: apiAnswer.isDisliked,
    badge: determineBadge(apiAnswer, isQuestionAuthor),
    replyCount: apiAnswer.commentCount || 0,
    isAccepted: apiAnswer.isAccepted,
  };
};

/**
 * API 답변 배열을 Facebook 답변 배열로 변환
 *
 * @param apiAnswers - API 응답 답변 배열
 * @param questionAuthorId - 질문 작성자 ID
 * @returns Facebook 형식의 답변 배열
 */
export const convertToFacebookAnswers = (
  apiAnswers: ApiAnswer[],
  questionAuthorId: string
): FacebookAnswer[] => {
  return apiAnswers.map(answer =>
    convertToFacebookAnswer(answer, questionAuthorId)
  );
};

/**
 * API 질문을 Facebook 질문으로 변환
 *
 * @param apiQuestion - API 응답 질문 데이터
 * @returns Facebook 형식의 질문 데이터
 */
export const convertToFacebookQuestion = (
  apiQuestion: ApiQuestion
): FacebookQuestion => {
  return {
    id: apiQuestion.id,
    title: apiQuestion.title,
    content: apiQuestion.content,
    author: convertToFacebookUser(apiQuestion.author),
    createdAt: apiQuestion.createdAt,
    updatedAt: apiQuestion.updatedAt,
    category: apiQuestion.category?.name,
    images: apiQuestion.attachments,
    likeCount: apiQuestion.likeCount,
    answerCount: apiQuestion.answerCount,
    viewCount: apiQuestion.viewCount,
    tags: apiQuestion.tags,
  };
};

/**
 * 사용자 데이터 변환 (현재 로그인 사용자용)
 *
 * @param user - AuthContext의 사용자 데이터
 * @returns Facebook 형식의 사용자 데이터
 */
export const convertCurrentUser = (user: {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
}): FacebookUser | undefined => {
  if (!user?.id) return undefined;

  return {
    id: user.id,
    name: user.name || user.email || "익명 사용자",
    avatar: user.avatar,
  };
};

/**
 * 에러 응답 처리
 *
 * @param error - API 에러 객체
 * @returns 사용자 친화적 에러 메시지
 */
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  const errorObj = error as Record<string, unknown>;
  const responseData = errorObj?.response as
    | Record<string, unknown>
    | undefined;

  if (responseData?.data) {
    const data = responseData.data as Record<string, unknown>;
    if (data.error) {
      return String(data.error);
    }
    if (data.message) {
      return String(data.message);
    }
  }

  return "알 수 없는 오류가 발생했습니다. 다시 시도해주세요.";
};

/**
 * API 응답 유효성 검사
 *
 * @param response - API 응답 데이터
 * @returns 유효 여부
 */
export const isValidApiResponse = (response: unknown): boolean => {
  return (
    response &&
    typeof response === "object" &&
    (response as Record<string, unknown>).success === true &&
    (response as Record<string, unknown>).data !== undefined
  );
};

/**
 * 데이터 변환 결과 타입 가드
 */
export type DataConversionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * 안전한 데이터 변환 (try-catch 래퍼)
 *
 * @param converter - 변환 함수
 * @param data - 변환할 데이터
 * @returns 변환 결과 또는 에러
 */
export const safeConvert = <T>(
  converter: (data: unknown) => T,
  data: unknown
): DataConversionResult<T> => {
  try {
    const result = converter(data);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error),
    };
  }
};
