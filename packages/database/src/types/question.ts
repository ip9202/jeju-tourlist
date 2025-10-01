import { z } from "zod";

// 질문 생성 스키마
export const CreateQuestionSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10).max(5000),
  authorId: z.string().min(1), // 개발 환경 고려하여 완화
  categoryId: z.string().cuid().nullable().optional(),
  tags: z.array(z.string().min(1).max(30)).max(10).default([]),
  attachments: z.array(z.string().min(1)).max(5).default([]), // 최대 5개 파일 (상대/절대 경로 모두 허용)
  location: z.string().max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export type CreateQuestionData = z.infer<typeof CreateQuestionSchema>;

// 질문 업데이트 스키마
export const UpdateQuestionSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  content: z.string().min(10).max(5000).optional(),
  categoryId: z.string().cuid().optional(),
  tags: z.array(z.string().min(1).max(30)).max(10).optional(),
  location: z.string().max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  status: z.enum(["ACTIVE", "CLOSED", "DELETED", "HIDDEN"]).optional(),
  isResolved: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

export type UpdateQuestionData = z.infer<typeof UpdateQuestionSchema>;

// 질문 검색 옵션
export interface QuestionSearchOptions {
  query?: string;
  categoryId?: string;
  tags?: string[];
  location?: string;
  status?: "ACTIVE" | "CLOSED" | "DELETED" | "HIDDEN";
  isResolved?: boolean;
  isPinned?: boolean;
  authorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "viewCount"
    | "likeCount"
    | "answerCount";
  sortOrder?: "asc" | "desc";
  pagination?: {
    page: number;
    limit: number;
  };
}

// 질문 통계
export interface QuestionStats {
  totalViews: number;
  totalLikes: number;
  totalAnswers: number;
  totalBookmarks: number;
  isResolved: boolean;
  resolutionTime?: number; // 해결까지 걸린 시간 (분)
  averageAnswerTime?: number; // 평균 답변 시간 (분)
}

// 질문 목록 아이템 (요약 정보)
export interface QuestionListItem {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    nickname: string;
    avatar?: string;
  };
  category?: {
    id: string;
    name: string;
    color?: string;
  };
  tags: string[];
  location?: string;
  status: "ACTIVE" | "CLOSED" | "DELETED" | "HIDDEN";
  isResolved: boolean;
  isPinned: boolean;
  viewCount: number;
  likeCount: number;
  answerCount: number;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}
