import { z } from "zod";

// 사용자 생성 스키마
export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  nickname: z.string().min(2).max(50),
  avatar: z.string().url().optional(),
  provider: z.enum(["kakao", "naver", "google"]),
  providerId: z.string().min(1),
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
  birthDate: z.date().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  phone: z.string().optional(),
  isJejuResident: z.boolean().default(false),
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
