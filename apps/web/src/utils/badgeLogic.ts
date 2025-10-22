/**
 * 배지 시스템 유틸 함수
 *
 * @description
 * - 배지 결정 로직
 * - 배지 자격 검증
 * - 배지 스타일 및 아이콘 관리
 */

export type BadgeType =
  | "admin"
  | "verified"
  | "expert"
  | "helpful"
  | "top-rated"
  | "active";

export interface UserStats {
  userId: string;
  answerCount: number;
  correctAnswerCount: number;
  helpfulVoteCount: number;
  totalViewCount: number;
  questionCount: number;
  averageRating: number;
  isVerified: boolean;
  isAdmin: boolean;
  registrationDate: Date;
  lastActivityDate: Date;
}

/**
 * 사용자 통계를 기반으로 배지를 결정합니다.
 * 우선순위: Admin > Verified > Expert > Helpful > TopRated > Active
 */
export const determineBadge = (user: UserStats): BadgeType | null => {
  // 우선순위 1: Admin
  if (user.isAdmin) return "admin";

  // 우선순위 2: Verified
  if (user.isVerified) return "verified";

  // 우선순위 3: Expert (50개 이상 답변 + 4.5 이상 평점)
  if (isBadgeQualified(user, "expert")) return "expert";

  // 우선순위 4: Helpful (20개 이상 답변 + 80% 이상 유용도)
  if (isBadgeQualified(user, "helpful")) return "helpful";

  // 우선순위 5: TopRated (4.8 이상 평점)
  if (isBadgeQualified(user, "top-rated")) return "top-rated";

  // 우선순위 6: Active (최근 7일 내 활동)
  if (isBadgeQualified(user, "active")) return "active";

  return null;
};

/**
 * 특정 배지에 대한 사용자의 자격을 검증합니다.
 */
export const isBadgeQualified = (
  user: UserStats,
  badge: BadgeType
): boolean => {
  switch (badge) {
    case "admin":
      return user.isAdmin;

    case "verified":
      return user.isVerified;

    case "expert":
      return user.answerCount >= 50 && user.averageRating >= 4.5;

    case "helpful":
      return user.answerCount >= 20 && calculateHelpfulnessRatio(user) >= 0.8;

    case "top-rated":
      return user.averageRating >= 4.8;

    case "active": {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return user.lastActivityDate >= sevenDaysAgo;
    }

    default:
      return false;
  }
};

/**
 * 배지에 대한 색상을 반환합니다.
 */
export const getBadgeColor = (badge: BadgeType | null | undefined): string => {
  switch (badge) {
    case "admin":
      return "bg-red-500";
    case "verified":
      return "bg-blue-500";
    case "expert":
      return "bg-purple-500";
    case "helpful":
      return "bg-green-500";
    case "top-rated":
      return "bg-yellow-500";
    case "active":
      return "bg-cyan-500";
    default:
      return "bg-gray-500";
  }
};

/**
 * 배지에 대한 아이콘을 반환합니다.
 */
export const getBadgeIcon = (
  badge: BadgeType | null | undefined
): React.ReactNode => {
  switch (badge) {
    case "admin":
      return "👑";
    case "verified":
      return "✅";
    case "expert":
      return "⭐";
    case "helpful":
      return "👍";
    case "top-rated":
      return "🏆";
    case "active":
      return "🔥";
    default:
      return null;
  }
};

/**
 * 배지에 대한 라벨을 반환합니다.
 */
export const getBadgeLabel = (badge: BadgeType | null | undefined): string => {
  switch (badge) {
    case "admin":
      return "관리자";
    case "verified":
      return "인증됨";
    case "expert":
      return "전문가";
    case "helpful":
      return "유용함";
    case "top-rated":
      return "높은 평점";
    case "active":
      return "활동중";
    default:
      return "";
  }
};

/**
 * 전문가 레벨을 계산합니다 (0~5).
 */
export const calculateExpertLevel = (stats: {
  answerCount: number;
  averageRating: number;
}): number => {
  let level = 0;

  // 기본 레벨: 답변 개수 기반
  if (stats.answerCount >= 10) level = 1;
  if (stats.answerCount >= 50) level = 2;
  if (stats.answerCount >= 100) level = 3;
  if (stats.answerCount >= 200) level = 4;
  if (stats.answerCount >= 500) level = 5;

  // 평점 보너스 (0.1 ~ 0.5 추가)
  const ratingBonus = Math.max(0, (stats.averageRating - 4.0) / 2); // 0 ~ 0.5
  level = Math.min(5, level + ratingBonus);

  return Math.floor(level);
};

/**
 * 유용도 비율을 계산합니다 (0~1).
 */
const calculateHelpfulnessRatio = (user: UserStats): number => {
  if (user.answerCount === 0) return 0;
  return user.helpfulVoteCount / user.answerCount;
};
