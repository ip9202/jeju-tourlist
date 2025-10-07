import { z } from "zod";

// 사용자 생성 스키마 (이메일 로그인 + OAuth 모두 지원)
export const CreateUserSchema = z.object({
  email: z.string().email().optional(), // 이메일 로그인용 (nullable)
  name: z.string().min(1).max(100),
  nickname: z.string().min(2).max(50),
  avatar: z.string().url().optional(),
  password: z.string().min(8).optional(), // 이메일 로그인용 해시된 비밀번호
  provider: z.enum(["kakao", "naver", "google", "email"]).optional(), // 'email' 추가, nullable
  providerId: z.string().min(1).optional(), // OAuth용, nullable
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
});

export type CreateUserData = z.infer<typeof CreateUserSchema>;

// 사용자 업데이트 스키마
export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nickname: z.string().min(2).max(50).optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
});

export type UpdateUserData = z.infer<typeof UpdateUserSchema>;

// 사용자 프로필 생성 스키마
export const CreateUserProfileSchema = z.object({
  userId: z.string().cuid(),
  displayName: z.string().max(100).optional(), // 표시 이름
  bio: z.string().max(500).optional(), // 자기소개
  birthDate: z.date().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  phone: z.string().optional(),
  isJejuResident: z.boolean().default(false),
  isLocalExpert: z.boolean().default(false), // 현지인 전문가 여부
  jejuDistrict: z.string().optional(),
  interests: z.array(z.string()).default([]),
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

export type CreateUserProfileData = z.infer<typeof CreateUserProfileSchema>;

// 사용자 프로필 업데이트 스키마
export const UpdateUserProfileSchema = CreateUserProfileSchema.partial().omit({
  userId: true,
});

export type UpdateUserProfileData = z.infer<typeof UpdateUserProfileSchema>;

// 사용자 검색 옵션
export interface UserSearchOptions {
  query?: string;
  location?: string;
  isJejuResident?: boolean;
  interests?: string[];
  hasProfile?: boolean;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pagination?: {
    page: number;
    limit: number;
  };
}

// 사용자 통계
export interface UserStats {
  totalQuestions: number;
  totalAnswers: number;
  totalLikes: number;
  totalBookmarks: number;
  points: number;
  level: number;
  badges: number;
  joinDate: Date;
  lastActivity: Date;
}
