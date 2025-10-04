import { z } from "zod";

// 답변 댓글 생성 스키마
export const CreateAnswerCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  authorId: z.string().min(1), // CUID 제약 제거하여 임시 사용자 ID 허용
  answerId: z.string().cuid(),
});

export type CreateAnswerCommentData = z.infer<typeof CreateAnswerCommentSchema>;

// 답변 댓글 업데이트 스키마
export const UpdateAnswerCommentSchema = z.object({
  content: z.string().min(1).max(1000).optional(),
  status: z.enum(["ACTIVE", "DELETED", "HIDDEN"]).optional(),
});

export type UpdateAnswerCommentData = z.infer<typeof UpdateAnswerCommentSchema>;

// 답변 댓글 검색 옵션
export interface AnswerCommentSearchOptions {
  answerId?: string;
  authorId?: string;
  status?: "ACTIVE" | "DELETED" | "HIDDEN";
  sortBy?: "createdAt" | "likeCount";
  sortOrder?: "asc" | "desc";
  pagination?: {
    page: number;
    limit: number;
  };
}

// 답변 댓글 목록 아이템 (요약 정보)
export interface AnswerCommentListItem {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    nickname: string;
    avatar?: string;
  };
  answerId: string;
  status: "ACTIVE" | "DELETED" | "HIDDEN";
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// 답변 댓글 좋아요/싫어요 스키마
export const AnswerCommentReactionSchema = z.object({
  commentId: z.string().cuid(),
  userId: z.string().cuid(),
  isLike: z.boolean(),
});

export type AnswerCommentReactionData = z.infer<typeof AnswerCommentReactionSchema>;
