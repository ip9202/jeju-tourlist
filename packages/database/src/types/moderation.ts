import { z } from "zod";

// 신고 생성 스키마
export const CreateReportSchema = z.object({
  reporterId: z.string().cuid(),
  targetType: z.enum(["QUESTION", "ANSWER", "USER"]),
  targetId: z.string().cuid(),
  reason: z.string().min(5).max(200),
  description: z.string().max(1000).optional(),
});

export type CreateReportData = z.infer<typeof CreateReportSchema>;

// 신고 업데이트 스키마
export const UpdateReportSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "RESOLVED"]).optional(),
  adminId: z.string().cuid().optional(),
  adminNote: z.string().max(500).optional(),
});

export type UpdateReportData = z.infer<typeof UpdateReportSchema>;

// 신고 검색 옵션
export interface ReportSearchOptions {
  reporterId?: string;
  targetType?: "QUESTION" | "ANSWER" | "USER";
  targetId?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "RESOLVED";
  adminId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: "createdAt" | "updatedAt" | "status";
  sortOrder?: "asc" | "desc";
  pagination?: {
    page: number;
    limit: number;
  };
}

// 신고 통계
export interface ReportStats {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
  resolvedReports: number;
  averageResolutionTime?: number; // 평균 처리 시간 (분)
  reportsByType: Record<string, number>;
  reportsByReason: Record<string, number>;
}

// 신고 목록 아이템
export interface ReportListItem {
  id: string;
  reporter: {
    id: string;
    name: string;
    nickname: string;
  };
  targetType: "QUESTION" | "ANSWER" | "USER";
  targetId: string;
  targetTitle?: string; // 질문/답변 제목 또는 사용자명
  reason: string;
  description?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "RESOLVED";
  admin?: {
    id: string;
    name: string;
  };
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}
