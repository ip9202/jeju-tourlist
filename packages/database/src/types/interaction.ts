import { z } from "zod";

// 질문 좋아요 스키마
export const QuestionLikeSchema = z.object({
  userId: z.string().cuid(),
  questionId: z.string().cuid(),
});

export type QuestionLikeData = z.infer<typeof QuestionLikeSchema>;

// 답변 좋아요/싫어요 스키마
export const AnswerLikeSchema = z.object({
  userId: z.string().cuid(),
  answerId: z.string().cuid(),
  isLike: z.boolean(),
});

export type AnswerLikeData = z.infer<typeof AnswerLikeSchema>;

// 북마크 스키마
export const BookmarkSchema = z.object({
  userId: z.string().cuid(),
  questionId: z.string().cuid(),
});

export type BookmarkData = z.infer<typeof BookmarkSchema>;

// 상호작용 통계
export interface InteractionStats {
  totalLikes: number;
  totalDislikes: number;
  totalBookmarks: number;
  likeRatio: number; // 좋아요 비율
  bookmarkRatio: number; // 북마크 비율
}

// 사용자별 상호작용 통계
export interface UserInteractionStats {
  questionsLiked: number;
  answersLiked: number;
  answersDisliked: number;
  questionsBookmarked: number;
  totalInteractions: number;
}

// 상호작용 검색 옵션
export interface InteractionSearchOptions {
  userId?: string;
  questionId?: string;
  answerId?: string;
  type?: "like" | "dislike" | "bookmark";
  dateFrom?: Date;
  dateTo?: Date;
  pagination?: {
    page: number;
    limit: number;
  };
}
