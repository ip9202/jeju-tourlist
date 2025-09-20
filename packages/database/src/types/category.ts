import { z } from "zod";

// 카테고리 생성 스키마
export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  icon: z.string().max(50).optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CreateCategoryData = z.infer<typeof CreateCategorySchema>;

// 카테고리 업데이트 스키마
export const UpdateCategorySchema = CreateCategorySchema.partial().omit({
  name: true,
});

export type UpdateCategoryData = z.infer<typeof UpdateCategorySchema>;

// 카테고리 검색 옵션
export interface CategorySearchOptions {
  query?: string;
  isActive?: boolean;
  sortBy?: "name" | "order" | "createdAt";
  sortOrder?: "asc" | "desc";
  pagination?: {
    page: number;
    limit: number;
  };
}

// 카테고리 통계
export interface CategoryStats {
  totalQuestions: number;
  activeQuestions: number;
  resolvedQuestions: number;
  averageResolutionTime?: number; // 평균 해결 시간 (분)
  mostActiveUsers: Array<{
    userId: string;
    userName: string;
    questionCount: number;
  }>;
}

// 카테고리 목록 아이템
export interface CategoryListItem {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  questionCount: number;
  createdAt: Date;
  updatedAt: Date;
}
