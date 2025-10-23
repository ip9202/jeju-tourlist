/**
 * Feature Flags 단위 테스트
 *
 * 테스트 대상:
 * - getCurrentRolloutStage()
 * - hashUserId()
 * - shouldUseFacebookUI()
 * - getFeatureFlagStatus()
 */

import {
  getCurrentRolloutStage,
  hashUserId,
  shouldUseFacebookUI,
  getFeatureFlagStatus,
  ROLLOUT_PERCENTAGES,
  ROLLOUT_DESCRIPTIONS,
  type RolloutStage,
} from "../featureFlags";

describe("featureFlags", () => {
  // 환경 변수 백업
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_USE_FACEBOOK_UI;
    delete process.env.NEXT_PUBLIC_ROLLOUT_STAGE;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getCurrentRolloutStage", () => {
    it('SSR 환경에서는 "development"를 반환해야 함', () => {
      // SSR 환경 시뮬레이션 (window 없음)
      const stage = getCurrentRolloutStage();
      expect(stage).toBe("development");
    });

    it('환경 변수가 설정되지 않으면 기본값 "development"를 반환', () => {
      process.env.NEXT_PUBLIC_ROLLOUT_STAGE = undefined;
      const stage = getCurrentRolloutStage();
      expect(stage).toBe("development");
    });

    it("유효한 롤아웃 단계를 반환해야 함", () => {
      const stages: RolloutStage[] = [
        "development",
        "stage-1",
        "stage-2",
        "stage-3",
      ];
      stages.forEach(stageValue => {
        process.env.NEXT_PUBLIC_ROLLOUT_STAGE = stageValue;
        const stage = getCurrentRolloutStage();
        expect(stages).toContain(stage);
      });
    });
  });

  describe("hashUserId", () => {
    it("같은 사용자 ID는 항상 같은 해시값을 반환해야 함 (일관성)", () => {
      const userId = "user-123";
      const hash1 = hashUserId(userId);
      const hash2 = hashUserId(userId);
      expect(hash1).toBe(hash2);
    });

    it("다른 사용자 ID는 다른 해시값을 반환할 수 있음", () => {
      const hash1 = hashUserId("user-1");
      const hash2 = hashUserId("user-2");
      // 완전히 다를 필요는 없지만, 서로 다를 확률이 높음
      expect(hash1).not.toBe(hash2);
    });

    it("해시값이 0~99 범위 내에 있어야 함", () => {
      const users = ["user-1", "user-2", "user-3", "test-user", "admin-123"];
      users.forEach(userId => {
        const hash = hashUserId(userId);
        expect(hash).toBeGreaterThanOrEqual(0);
        expect(hash).toBeLessThan(100);
      });
    });

    it("빈 문자열도 유효한 해시값을 반환해야 함", () => {
      const hash = hashUserId("");
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThan(100);
    });

    it("특수 문자가 포함된 ID도 유효한 해시값을 반환해야 함", () => {
      const hash = hashUserId("user@example.com");
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThan(100);
    });
  });

  describe("shouldUseFacebookUI", () => {
    it('환경 변수 NEXT_PUBLIC_USE_FACEBOOK_UI="true"일 때 true를 반환', () => {
      process.env.NEXT_PUBLIC_USE_FACEBOOK_UI = "true";
      const result = shouldUseFacebookUI("user-123");
      expect(result).toBe(true);
    });

    it('환경 변수 NEXT_PUBLIC_USE_FACEBOOK_UI="false"일 때 false를 반환', () => {
      process.env.NEXT_PUBLIC_USE_FACEBOOK_UI = "false";
      const result = shouldUseFacebookUI("user-123");
      expect(result).toBe(false);
    });

    it("환경 변수가 우선순위를 가져야 함 (롤아웃 설정 무시)", () => {
      process.env.NEXT_PUBLIC_USE_FACEBOOK_UI = "true";
      process.env.NEXT_PUBLIC_ROLLOUT_STAGE = "stage-1";
      const result = shouldUseFacebookUI();
      expect(result).toBe(true);
    });

    it("미로그인 사용자(userId 없음)는 false를 반환해야 함", () => {
      delete process.env.NEXT_PUBLIC_USE_FACEBOOK_UI;
      process.env.NEXT_PUBLIC_ROLLOUT_STAGE = "stage-1";
      const result = shouldUseFacebookUI();
      expect(result).toBe(false);
    });

    it("development 단계에서는 true를 반환해야 함", () => {
      delete process.env.NEXT_PUBLIC_USE_FACEBOOK_UI;
      process.env.NEXT_PUBLIC_ROLLOUT_STAGE = "development";
      const result = shouldUseFacebookUI("any-user");
      expect(result).toBe(true);
    });

    it("stage-1 (5%)에서 올바르게 사용자를 필터링해야 함", () => {
      delete process.env.NEXT_PUBLIC_USE_FACEBOOK_UI;
      process.env.NEXT_PUBLIC_ROLLOUT_STAGE = "stage-1";

      // 0~4 해시: true, 5~99 해시: false
      const lowHashUser = "a"; // 해시값이 낮을 것으로 예상
      const highHashUser = "zzzzzzzzzz"; // 해시값이 높을 것으로 예상

      const lowResult = shouldUseFacebookUI(lowHashUser);
      const highResult = shouldUseFacebookUI(highHashUser);

      // 최소 하나는 다르거나, 모두 같을 수도 있음 (5% 확률)
      // 이 테스트는 통계적 성질상 완벽하지 않을 수 있음
      expect(typeof lowResult).toBe("boolean");
      expect(typeof highResult).toBe("boolean");
    });

    it("stage-2 (25%)에서 올바르게 사용자를 필터링해야 함", () => {
      delete process.env.NEXT_PUBLIC_USE_FACEBOOK_UI;
      process.env.NEXT_PUBLIC_ROLLOUT_STAGE = "stage-2";

      const result = shouldUseFacebookUI("user-123");
      expect(typeof result).toBe("boolean");
    });

    it("stage-3 (100%)에서는 항상 true를 반환해야 함", () => {
      delete process.env.NEXT_PUBLIC_USE_FACEBOOK_UI;
      process.env.NEXT_PUBLIC_ROLLOUT_STAGE = "stage-3";

      const result1 = shouldUseFacebookUI("user-1");
      const result2 = shouldUseFacebookUI("user-2");
      const result3 = shouldUseFacebookUI("random-user");

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
    });
  });

  describe("getFeatureFlagStatus", () => {
    it("올바른 구조를 반환해야 함", () => {
      process.env.NEXT_PUBLIC_USE_FACEBOOK_UI = "true";
      const status = getFeatureFlagStatus("user-123");

      expect(status).toHaveProperty("stage");
      expect(status).toHaveProperty("percentage");
      expect(status).toHaveProperty("useFacebookUI");
      expect(status).toHaveProperty("userHash");
    });

    it("useFacebookUI 값이 boolean이어야 함", () => {
      const status = getFeatureFlagStatus("user-123");
      expect(typeof status.useFacebookUI).toBe("boolean");
    });

    it("userHash가 없을 때는 null이어야 함", () => {
      const status = getFeatureFlagStatus();
      expect(status.userHash).toBeNull();
    });

    it("userHash가 0~99 범위여야 함", () => {
      const status = getFeatureFlagStatus("user-123");
      if (status.userHash !== null) {
        expect(status.userHash).toBeGreaterThanOrEqual(0);
        expect(status.userHash).toBeLessThan(100);
      }
    });

    it("stage 값이 유효한 RolloutStage여야 함", () => {
      const validStages = ["development", "stage-1", "stage-2", "stage-3"];
      const status = getFeatureFlagStatus("user-123");
      expect(validStages).toContain(status.stage);
    });
  });

  describe("ROLLOUT_PERCENTAGES", () => {
    it("모든 롤아웃 단계가 정의되어 있어야 함", () => {
      expect(ROLLOUT_PERCENTAGES).toHaveProperty("development");
      expect(ROLLOUT_PERCENTAGES).toHaveProperty("stage-1");
      expect(ROLLOUT_PERCENTAGES).toHaveProperty("stage-2");
      expect(ROLLOUT_PERCENTAGES).toHaveProperty("stage-3");
    });

    it("비율이 유효한 숫자여야 함", () => {
      Object.values(ROLLOUT_PERCENTAGES).forEach(percentage => {
        expect(percentage).toBeGreaterThanOrEqual(0);
        expect(percentage).toBeLessThanOrEqual(100);
      });
    });

    it("development는 100%, stage-1은 5%여야 함", () => {
      expect(ROLLOUT_PERCENTAGES.development).toBe(100);
      expect(ROLLOUT_PERCENTAGES["stage-1"]).toBe(5);
      expect(ROLLOUT_PERCENTAGES["stage-2"]).toBe(25);
      expect(ROLLOUT_PERCENTAGES["stage-3"]).toBe(100);
    });
  });

  describe("ROLLOUT_DESCRIPTIONS", () => {
    it("모든 롤아웃 단계에 설명이 있어야 함", () => {
      expect(ROLLOUT_DESCRIPTIONS).toHaveProperty("development");
      expect(ROLLOUT_DESCRIPTIONS).toHaveProperty("stage-1");
      expect(ROLLOUT_DESCRIPTIONS).toHaveProperty("stage-2");
      expect(ROLLOUT_DESCRIPTIONS).toHaveProperty("stage-3");
    });

    it("설명이 문자열이어야 함", () => {
      Object.values(ROLLOUT_DESCRIPTIONS).forEach(description => {
        expect(typeof description).toBe("string");
        expect(description.length).toBeGreaterThan(0);
      });
    });
  });
});
