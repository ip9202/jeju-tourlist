import { z } from "zod";

// 답변 생성 스키마
export const CreateAnswerSchema = z.object({
  content: z.string().min(10).max(5000),
  authorId: z.string().min(1), // CUID 제약 제거하여 임시 사용자 ID 허용
  questionId: z.string().min(1), // 접두사(q_)가 있거나 없는 CUID 모두 허용
  categoryId: z.string().optional(), // Service에서 자동으로 추가됨
});

export type CreateAnswerData = z.infer<typeof CreateAnswerSchema>;

// 답변 업데이트 스키마
export const UpdateAnswerSchema = z.object({
  content: z.string().min(10).max(5000).optional(),
  status: z.enum(["ACTIVE", "DELETED", "HIDDEN"]).optional(),
  isAccepted: z.boolean().optional(),
});

export type UpdateAnswerData = z.infer<typeof UpdateAnswerSchema>;

// 답변 검색 옵션
export interface AnswerSearchOptions {
  questionId?: string;
  authorId?: string;
  status?: "ACTIVE" | "DELETED" | "HIDDEN";
  isAccepted?: boolean;
  sortBy?: "createdAt" | "likeCount" | "dislikeCount";
  sortOrder?: "asc" | "desc";
  pagination?: {
    page: number;
    limit: number;
  };
}

// 답변 통계
export interface AnswerStats {
  totalLikes: number;
  totalDislikes: number;
  isAccepted: boolean;
  acceptanceTime?: number; // 채택까지 걸린 시간 (분)
}

// 답변 목록 아이템 (요약 정보)
export interface AnswerListItem {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    nickname: string;
    avatar?: string;
  };
  questionId: string;
  status: "ACTIVE" | "DELETED" | "HIDDEN";
  isAccepted: boolean;
  likeCount: number;
  dislikeCount: number;
  createdAt: Date;
  updatedAt: Date;
  acceptedAt?: Date;
}

// 답변 좋아요/싫어요 스키마
export const AnswerReactionSchema = z.object({
  answerId: z.string().cuid(),
  userId: z.string().cuid(),
  isLike: z.boolean(),
});

export type AnswerReactionData = z.infer<typeof AnswerReactionSchema>;
