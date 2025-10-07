// 데이터베이스 모델 타입 정의
export * from "./user";
export * from "./question";
export * from "./answer";
export * from "./answerComment";
export * from "./category";
export * from "./interaction";
export * from "./moderation";
export * from "./notification";
export * from "./badge";
export * from "./auth";

// Prisma 클라이언트 타입 (간단한 타입 정의)
export type User = any;
export type UserProfile = any;
export type Question = any;
export type Answer = any;
export type Category = any;
export type QuestionLike = any;
export type AnswerLike = any;
export type Bookmark = any;
export type Report = any;
export type Notification = any;
export type Badge = any;
export type UserBadge = any;
export type QuestionStatus = any;
export type AnswerStatus = any;
export type ReportTargetType = any;
export type ReportStatus = any;
export type NotificationType = any;

// 공통 타입
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 페이지네이션 타입
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 검색 옵션
export interface SearchOptions {
  query?: string;
  filters?: Record<string, any>;
  pagination?: PaginationOptions;
}

// 데이터베이스 연결 상태
export interface DatabaseStatus {
  isConnected: boolean;
  version?: string;
  uptime?: number;
  lastError?: string;
}
