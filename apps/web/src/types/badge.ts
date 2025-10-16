// 배지 시스템 관련 타입 정의
export interface BadgeInfo {
  id: string;
  code: string;
  name: string;
  emoji: string;
  description: string;
  type: BadgeType;
  category?: string;
  requiredAnswers: number;
  requiredAdoptRate?: number;
  bonusPoints: number;
  adoptBonusPoints?: number;
  requiresGpsAuth?: boolean;
  requiresSocialAuth?: boolean;
  requiresDocAuth?: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // 전문가 시스템 관련 필드 추가
  expertLevel?: number; // 전문가 레벨 (1-5)
  expertPoints?: number; // 전문가 포인트
  isExpertBadge?: boolean; // 전문가 배지 여부
}

export interface UserBadgeInfo {
  id: string;
  userId: string;
  badgeId: string;
  badge: BadgeInfo;
  earnedAt: Date;
  notified: boolean;
  // 전문가 시스템 관련 필드 추가
  expertRank?: number; // 전문가 랭킹
  expertCategory?: string; // 전문가 카테고리
}

export interface BadgeProgress {
  badgeId: string;
  badge: BadgeInfo;
  currentProgress: number;
  requiredProgress: number;
  progressPercentage: number;
  isEarned: boolean;
  earnedAt?: Date;
}

export type BadgeType =
  | "CATEGORY_EXPERT" // 카테고리 전문가
  | "ACTIVITY_LEVEL" // 활동 레벨
  | "ACHIEVEMENT" // 업적
  | "SPECIAL" // 특별 배지
  | "SOCIAL" // 소셜 배지
  | "VERIFICATION"; // 인증 배지

export type BadgeRarity =
  | "COMMON" // 일반
  | "RARE" // 희귀
  | "EPIC" // 영웅
  | "LEGENDARY"; // 전설

// 배지 컴포넌트 Props 타입들
export interface BadgeIconProps {
  badge: BadgeInfo;
  size?: "sm" | "md" | "lg" | "xl";
  showTooltip?: boolean;
  className?: string;
}

export interface BadgeCardProps {
  badge: BadgeInfo;
  progress?: BadgeProgress;
  showProgress?: boolean;
  showDescription?: boolean;
  className?: string;
}

export interface BadgeProgressProps {
  progress: BadgeProgress;
  showPercentage?: boolean;
  showRequired?: boolean;
  className?: string;
}

export interface BadgeCollectionProps {
  badges: BadgeInfo[];
  userBadges?: UserBadgeInfo[];
  showProgress?: boolean;
  columns?: number;
  className?: string;
}

export interface BadgeTooltipProps {
  badge: BadgeInfo;
  children: React.ReactNode;
  delayDuration?: number;
}
