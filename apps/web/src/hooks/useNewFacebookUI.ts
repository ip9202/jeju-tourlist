"use client";

/**
 * Facebook 스타일 Q&A UI 활성화 여부를 확인하는 훅
 *
 * Phase 7: Facebook UI는 기본적으로 활성화됩니다.
 * 향후 feature flag 설정이 필요한 경우 환경 변수로 제어할 수 있습니다.
 *
 * @returns {{
 *   useFacebookUI: boolean;
 *   rolloutStage: string;
 *   rolloutPercentage: number;
 * }} Facebook UI 활성화 정보
 *
 * @example
 * const { useFacebookUI } = useNewFacebookUI();
 * if (useFacebookUI) {
 *   return <FacebookAnswerThread {...props} />;
 * }
 *
 * @see apps/web/src/components/question/facebook/FacebookAnswerThread.tsx
 */
export const useNewFacebookUI = () => {
  // Facebook UI is enabled by default in Phase 7
  const useFacebookUI = true;
  const rolloutStage = "development";

  return {
    useFacebookUI,
    rolloutStage,
    rolloutPercentage: 100,
  };
};

/**
 * 기본 Feature flag 값
 * @default true
 */
export const DEFAULT_USE_FACEBOOK_UI = true;
