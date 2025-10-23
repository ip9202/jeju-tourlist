"use client";

import { useEffect, useState } from "react";
import {
  shouldUseFacebookUI,
  getCurrentRolloutStage,
} from "@/config/featureFlags";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Facebook 스타일 Q&A UI 활성화 여부를 확인하는 훅
 *
 * Step 1-3: 환경 변수 `NEXT_PUBLIC_USE_FACEBOOK_UI` 기반
 * Step 3: Gradual rollout을 통한 단계적 마이그레이션 지원
 *   - development: 100% (모든 사용자)
 *   - stage-1: 5% (프로덕션 배포 1차)
 *   - stage-2: 25% (프로덕션 배포 2차)
 *   - stage-3: 100% (완전 배포)
 *
 * @returns {{
 *   useFacebookUI: boolean;
 *   rolloutStage: string;
 *   rolloutPercentage: number;
 * }} Facebook UI 활성화 정보
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
 * @see docs/PHASE_9_TEST_FLOW.md
 * @see apps/web/src/config/featureFlags.ts
 */
export const useNewFacebookUI = () => {
  const { user } = useAuth();
  const [useFacebookUI, setUseFacebookUI] = useState(false);
  const [rolloutStage, setRolloutStage] = useState("development");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Step 1-3: 환경 변수 기반 (명시적 설정)
      const envFlag = process.env.NEXT_PUBLIC_USE_FACEBOOK_UI;
      if (envFlag !== undefined) {
        setUseFacebookUI(envFlag === "true");
      } else {
        // Step 3: Gradual rollout 기반 (사용자 ID 해시)
        const stage = getCurrentRolloutStage();
        setRolloutStage(stage);

        // 동적으로 사용자 할당 결정
        if (user?.id) {
          const shouldUse = shouldUseFacebookUI(user.id);
          setUseFacebookUI(shouldUse);
        } else {
          // 미로그인 사용자는 비활성화
          setUseFacebookUI(false);
        }
      }
    }
  }, [user?.id]);

  return {
    useFacebookUI,
    rolloutStage,
    rolloutPercentage:
      process.env.NEXT_PUBLIC_ROLLOUT_STAGE === "stage-1"
        ? 5
        : process.env.NEXT_PUBLIC_ROLLOUT_STAGE === "stage-2"
          ? 25
          : 100,
  };
};

/**
 * 기본 Feature flag 값
 * 명시성을 위해 상수로 정의
 * @default true
 */
export const DEFAULT_USE_FACEBOOK_UI = true;
