import { z } from "zod";

// 배지 생성 스키마
export const CreateBadgeSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(200),
  icon: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  category: z.string().min(1).max(30),
  points: z.number().int().min(0).default(0),
  condition: z.record(z.string(), z.any()),
  isActive: z.boolean().default(true),
});

export type CreateBadgeData = z.infer<typeof CreateBadgeSchema>;

// 배지 업데이트 스키마
export const UpdateBadgeSchema = CreateBadgeSchema.partial().omit({
  name: true,
});

export type UpdateBadgeData = z.infer<typeof UpdateBadgeSchema>;

// 사용자 배지 부여 스키마
export const AwardBadgeSchema = z.object({
  userId: z.string().cuid(),
  badgeId: z.string().cuid(),
});

export type AwardBadgeData = z.infer<typeof AwardBadgeSchema>;

// 배지 검색 옵션
export interface BadgeSearchOptions {
  query?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: "name" | "points" | "createdAt";
  sortOrder?: "asc" | "desc";
  pagination?: {
    page: number;
    limit: number;
  };
}

// 사용자 배지 검색 옵션
export interface UserBadgeSearchOptions {
  userId?: string;
  badgeId?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: "createdAt" | "points";
  sortOrder?: "asc" | "desc";
  pagination?: {
    page: number;
    limit: number;
  };
}

// 배지 통계
export interface BadgeStats {
  totalBadges: number;
  activeBadges: number;
  totalAwards: number;
  badgesByCategory: Record<string, number>;
  mostPopularBadges: Array<{
    badgeId: string;
    badgeName: string;
    awardCount: number;
  }>;
}

// 사용자 배지 통계
export interface UserBadgeStats {
  totalBadges: number;
  totalPoints: number;
  badgesByCategory: Record<string, number>;
  recentBadges: Array<{
    badgeId: string;
    badgeName: string;
    earnedAt: Date;
  }>;
}

// 배지 목록 아이템
export interface BadgeListItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  points: number;
  isActive: boolean;
  awardCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// 사용자 배지 목록 아이템
export interface UserBadgeListItem {
  id: string;
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    category: string;
    points: number;
  };
  userId: string;
  createdAt: Date;
}
