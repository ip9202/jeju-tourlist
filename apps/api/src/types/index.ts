// API 응답 표준 형식
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// 에러 응답 형식
export interface ApiError {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  details?: any;
}

// 페이지네이션 형식
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 기본 엔티티 타입
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 사용자 타입
export interface User extends BaseEntity {
  email: string;
  name: string;
  avatar?: string;
  role: "user" | "admin" | "moderator";
  isActive: boolean;
}

// 질문 타입
export interface Question extends BaseEntity {
  title: string;
  content: string;
  authorId: string;
  author: User;
  tags: string[];
  isResolved: boolean;
  viewCount: number;
  likeCount: number;
}

// 답변 타입
export interface Answer extends BaseEntity {
  content: string;
  questionId: string;
  authorId: string;
  author: User;
  isAccepted: boolean;
  likeCount: number;
}
