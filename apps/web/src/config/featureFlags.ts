/**
 * Feature Flag 설정 및 Gradual Rollout 정책
 *
 * Facebook UI 마이그레이션의 단계적 활성화를 관리합니다.
 */

/**
 * Feature flag 롤아웃 단계
 */
export type RolloutStage = "development" | "stage-1" | "stage-2" | "stage-3";

/**
 * 각 롤아웃 단계별 활성화 비율 (%)
 */
export const ROLLOUT_PERCENTAGES: Record<RolloutStage, number> = {
  development: 100, // 개발 환경: 100% (모든 사용자)
  "stage-1": 5, // 1차: 5% 사용자만 활성화
  "stage-2": 25, // 2차: 25% 사용자만 활성화
  "stage-3": 100, // 3차: 100% 사용자에게 활성화
};

/**
 * 롤아웃 단계별 설명
 */
export const ROLLOUT_DESCRIPTIONS: Record<RolloutStage, string> = {
  development: "개발 환경에서만 활성화 (100% - 모든 테스트 사용자)",
  "stage-1": "프로덕션 배포 1차: 5% 사용자에게 활성화",
  "stage-2": "프로덕션 배포 2차: 25% 사용자에게 활성화",
  "stage-3": "프로덕션 배포 3차: 100% 사용자에게 활성화 (완전 배포)",
};

/**
 * 현재 롤아웃 단계
 * 환경 변수로 제어: NEXT_PUBLIC_ROLLOUT_STAGE
 * 기본값: development
 */
export const getCurrentRolloutStage = (): RolloutStage => {
  if (typeof window === "undefined") {
    return "development"; // SSR 환경에서는 development로 기본값 설정
  }

  const stage = process.env.NEXT_PUBLIC_ROLLOUT_STAGE as RolloutStage;
  return stage || "development";
};

/**
 * 사용자 ID 기반 해시 생성
 * 일관성 있는 사용자 배치 (같은 사용자는 항상 같은 그룹에 할당)
 *
 * @param userId - 사용자 ID
 * @returns 0~99 범위의 해시값
 */
export const hashUserId = (userId: string): number => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 32비트 정수로 변환
  }
  return Math.abs(hash) % 100;
};

/**
 * 사용자가 Facebook UI를 활성화받을지 결정
 *
 * @param userId - 사용자 ID (선택사항)
 * @returns Facebook UI 활성화 여부
 */
export const shouldUseFacebookUI = (userId?: string): boolean => {
  // 환경 변수가 명시적으로 설정된 경우 (Step 1-3)
  const envFlag = process.env.NEXT_PUBLIC_USE_FACEBOOK_UI;
  if (envFlag !== undefined) {
    return envFlag === "true";
  }

  // 롤아웃 기반 결정 (9-3, 9-4에서 사용)
  const stage = getCurrentRolloutStage();
  const percentage = ROLLOUT_PERCENTAGES[stage];

  // 개발 환경이면 100% 활성화
  if (stage === "development") {
    return true;
  }

  // 로그인한 사용자면 ID 기반으로 결정
  if (userId) {
    const userHash = hashUserId(userId);
    return userHash < percentage;
  }

  // 미로그인 사용자면 비활성화
  return false;
};

/**
 * Feature flag 상태 정보 (디버깅용)
 */
export const getFeatureFlagStatus = (userId?: string) => {
  return {
    stage: getCurrentRolloutStage(),
    percentage: ROLLOUT_PERCENTAGES[getCurrentRolloutStage()],
    useFacebookUI: shouldUseFacebookUI(userId),
    userHash: userId ? hashUserId(userId) : null,
  };
};
