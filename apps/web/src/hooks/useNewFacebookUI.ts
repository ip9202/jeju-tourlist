"use client";

/**
 * Facebook 스타일 Q&A UI 활성화 여부를 확인하는 훅
 *
 * 환경 변수 `NEXT_PUBLIC_USE_FACEBOOK_UI`를 기반으로 Facebook 스타일 UI 사용 여부를 판단합니다.
 * 이는 점진적 마이그레이션을 위한 Feature flag로 작동합니다.
 *
 * @returns {{ useFacebookUI: boolean }} Facebook UI 사용 여부
 *   - `true`: Facebook 스타일 UI 사용 (FacebookAnswerThread 등)
 *   - `false`: 기존 UI 사용 또는 폴백 컴포넌트 사용
 *
 * @example
 * // 컴포넌트에서 사용
 * const { useFacebookUI } = useNewFacebookUI();
 *
 * if (useFacebookUI) {
 *   return <FacebookAnswerThread {...props} />;
 * } else {
 *   return <LegacyAnswerComponent {...props} />;
 * }
 *
 * @see docs/PHASE_9_DETAILED_MIGRATION_PLAN.md
 */
export const useNewFacebookUI = () => {
  // 환경 변수에서 읽기 (빌드 타임에 결정됨)
  // NEXT_PUBLIC_* 접두사로 브라우저에서 접근 가능
  const useFacebookUI =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_USE_FACEBOOK_UI === "true"
      : false;

  return {
    useFacebookUI,
    // 향후 추가 기능을 위한 확장성을 위해 반환값을 객체로 구성
    // 예: isTransitioning, featureFlagVersion 등
  };
};

/**
 * 기본 Feature flag 값
 * 명시성을 위해 상수로 정의
 * @default true
 */
export const DEFAULT_USE_FACEBOOK_UI = true;
