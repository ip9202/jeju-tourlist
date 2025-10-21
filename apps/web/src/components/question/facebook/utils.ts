/**
 * Facebook 스타일 Q&A 컴포넌트 유틸리티 함수
 */

import type { Answer, BadgeType, User } from "./types";

/**
 * 답변에 대한 배지 타입 결정
 * 우선순위: accepted > expert > newbie > undefined
 *
 * @param answer - 답변 객체
 * @param currentUserId - 현재 사용자 ID (질문 작성자 ID)
 * @returns 배지 타입 또는 undefined
 */
export const getBadgeType = (answer: Answer): BadgeType | undefined => {
  // 1. 채택됨 배지가 최우선
  if (answer.isAccepted) {
    return "accepted";
  }

  // 2. 전문가 배지
  if (answer.author?.badge === "expert") {
    return "expert";
  }

  // 3. 신입 배지
  if (isNewbie(answer.author)) {
    return "newbie";
  }

  return undefined;
};

/**
 * 사용자가 신입인지 판별
 * 신입 기준: 계정 생성 후 7일 이내
 *
 * @param user - 사용자 객체
 * @returns 신입 여부
 */
export const isNewbie = (user?: User): boolean => {
  if (!user?.createdAt) {
    return false;
  }

  try {
    const createdDate = new Date(user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 7;
  } catch {
    return false;
  }
};

/**
 * 배지 우선순위에 따라 정렬
 * accepted > expert > newbie
 *
 * @param answers - 답변 배열
 * @returns 우선순위로 정렬된 답변 배열
 */
export const sortByBadgePriority = (answers: Answer[]): Answer[] => {
  const badgePriority = { accepted: 0, expert: 1, newbie: 2, undefined: 3 };

  return [...answers].sort((a, b) => {
    const aBadge = getBadgeType(a) || "undefined";
    const bBadge = getBadgeType(b) || "undefined";

    return (
      (badgePriority[aBadge as keyof typeof badgePriority] || 3) -
      (badgePriority[bBadge as keyof typeof badgePriority] || 3)
    );
  });
};
