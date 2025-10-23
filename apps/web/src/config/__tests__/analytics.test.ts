/**
 * Analytics 설정 단위 테스트
 *
 * 테스트 대상:
 * - PERFORMANCE_TARGETS
 * - isPerformanceGood()
 * - getMetricStatus()
 * - AnalyticsEventType enum
 */

import {
  PERFORMANCE_TARGETS,
  isPerformanceGood,
  getMetricStatus,
  AnalyticsEventType,
  ANALYTICS_CONFIG,
  type PerformanceMetric,
} from "../analytics";

describe("analytics config", () => {
  describe("PERFORMANCE_TARGETS", () => {
    it("모든 메트릭 목표값이 정의되어야 함", () => {
      expect(PERFORMANCE_TARGETS).toHaveProperty("LCP");
      expect(PERFORMANCE_TARGETS).toHaveProperty("FCP");
      expect(PERFORMANCE_TARGETS).toHaveProperty("CLS");
      expect(PERFORMANCE_TARGETS).toHaveProperty("FID");
      expect(PERFORMANCE_TARGETS).toHaveProperty("TTI");
    });

    it("모든 목표값이 양수여야 함", () => {
      Object.values(PERFORMANCE_TARGETS).forEach(target => {
        expect(target).toBeGreaterThan(0);
      });
    });

    it("LCP 목표값이 2500ms 이하여야 함", () => {
      expect(PERFORMANCE_TARGETS.LCP).toBeLessThanOrEqual(2500);
    });

    it("FCP 목표값이 1800ms 이하여야 함", () => {
      expect(PERFORMANCE_TARGETS.FCP).toBeLessThanOrEqual(1800);
    });

    it("CLS 목표값이 0.1 이하여야 함", () => {
      expect(PERFORMANCE_TARGETS.CLS).toBeLessThanOrEqual(0.1);
    });
  });

  describe("isPerformanceGood", () => {
    it("LCP가 목표값 이하이면 true를 반환해야 함", () => {
      const metric: PerformanceMetric = {
        name: "LCP",
        value: 2000,
        unit: "ms",
        timestamp: Date.now(),
        status: "good",
      };
      expect(isPerformanceGood(metric)).toBe(true);
    });

    it("LCP가 목표값을 초과하면 false를 반환해야 함", () => {
      const metric: PerformanceMetric = {
        name: "LCP",
        value: 3000,
        unit: "ms",
        timestamp: Date.now(),
        status: "poor",
      };
      expect(isPerformanceGood(metric)).toBe(false);
    });

    it("CLS가 목표값 이하이면 true를 반환해야 함", () => {
      const metric: PerformanceMetric = {
        name: "CLS",
        value: 0.05,
        unit: "",
        timestamp: Date.now(),
        status: "good",
      };
      expect(isPerformanceGood(metric)).toBe(true);
    });

    it("CLS가 목표값을 초과하면 false를 반환해야 함", () => {
      const metric: PerformanceMetric = {
        name: "CLS",
        value: 0.15,
        unit: "",
        timestamp: Date.now(),
        status: "poor",
      };
      expect(isPerformanceGood(metric)).toBe(false);
    });

    it("정의되지 않은 메트릭은 true를 반환해야 함", () => {
      const metric: PerformanceMetric = {
        name: "UNKNOWN_METRIC",
        value: 999,
        unit: "ms",
        timestamp: Date.now(),
        status: "good",
      };
      expect(isPerformanceGood(metric)).toBe(true);
    });
  });

  describe("getMetricStatus", () => {
    describe("LCP (시간 기반)", () => {
      it('LCP <= 2500ms이면 "good"을 반환', () => {
        expect(getMetricStatus("LCP", 2000)).toBe("good");
        expect(getMetricStatus("LCP", 2500)).toBe("good");
      });

      it('2500 < LCP <= 3750ms이면 "needs-improvement"을 반환', () => {
        expect(getMetricStatus("LCP", 3000)).toBe("needs-improvement");
        expect(getMetricStatus("LCP", 3750)).toBe("needs-improvement");
      });

      it('LCP > 3750ms이면 "poor"을 반환', () => {
        expect(getMetricStatus("LCP", 4000)).toBe("poor");
      });
    });

    describe("CLS (누적값)", () => {
      it('CLS <= 0.1이면 "good"을 반환', () => {
        expect(getMetricStatus("CLS", 0.05)).toBe("good");
        expect(getMetricStatus("CLS", 0.1)).toBe("good");
      });

      it('0.1 < CLS <= 0.25이면 "needs-improvement"을 반환', () => {
        expect(getMetricStatus("CLS", 0.15)).toBe("needs-improvement");
        expect(getMetricStatus("CLS", 0.25)).toBe("needs-improvement");
      });

      it('CLS > 0.25이면 "poor"을 반환', () => {
        expect(getMetricStatus("CLS", 0.3)).toBe("poor");
      });
    });

    describe("FCP (시간 기반)", () => {
      it('FCP <= 1800ms이면 "good"을 반환', () => {
        expect(getMetricStatus("FCP", 1500)).toBe("good");
        expect(getMetricStatus("FCP", 1800)).toBe("good");
      });

      it('1800 < FCP <= 2700ms이면 "needs-improvement"을 반환', () => {
        expect(getMetricStatus("FCP", 2000)).toBe("needs-improvement");
        expect(getMetricStatus("FCP", 2700)).toBe("needs-improvement");
      });

      it('FCP > 2700ms이면 "poor"을 반환', () => {
        expect(getMetricStatus("FCP", 3000)).toBe("poor");
      });
    });

    it('정의되지 않은 메트릭은 "good"을 반환', () => {
      expect(getMetricStatus("UNKNOWN", 999)).toBe("good");
    });
  });

  describe("AnalyticsEventType enum", () => {
    it("모든 이벤트 타입이 정의되어야 함", () => {
      // 답변 관련
      expect(AnalyticsEventType.ANSWER_SUBMITTED).toBeDefined();
      expect(AnalyticsEventType.ANSWER_LIKED).toBeDefined();
      expect(AnalyticsEventType.ANSWER_DISLIKED).toBeDefined();
      expect(AnalyticsEventType.ANSWER_DELETED).toBeDefined();

      // 댓글 관련
      expect(AnalyticsEventType.REPLY_SUBMITTED).toBeDefined();
      expect(AnalyticsEventType.REPLY_LIKED).toBeDefined();
      expect(AnalyticsEventType.REPLY_DELETED).toBeDefined();

      // UI 상호작용
      expect(AnalyticsEventType.UI_RENDERED).toBeDefined();
      expect(AnalyticsEventType.UI_ERROR).toBeDefined();

      // Feature flag
      expect(AnalyticsEventType.FEATURE_FLAG_EVALUATED).toBeDefined();
      expect(AnalyticsEventType.FEATURE_FLAG_CHANGED).toBeDefined();

      // 성능 & 에러
      expect(AnalyticsEventType.PERFORMANCE_METRIC).toBeDefined();
      expect(AnalyticsEventType.ERROR_LOGGED).toBeDefined();
    });

    it("이벤트 타입이 문자열이어야 함", () => {
      Object.values(AnalyticsEventType).forEach(eventType => {
        expect(typeof eventType).toBe("string");
      });
    });
  });

  describe("ANALYTICS_CONFIG", () => {
    it("모든 설정 옵션이 정의되어야 함", () => {
      expect(ANALYTICS_CONFIG).toHaveProperty("persistToStorage");
      expect(ANALYTICS_CONFIG).toHaveProperty("storageKey");
      expect(ANALYTICS_CONFIG).toHaveProperty("maxStoredEvents");
      expect(ANALYTICS_CONFIG).toHaveProperty("logToConsole");
      expect(ANALYTICS_CONFIG).toHaveProperty("externalServices");
    });

    it("persistToStorage가 boolean이어야 함", () => {
      expect(typeof ANALYTICS_CONFIG.persistToStorage).toBe("boolean");
    });

    it("storageKey가 문자열이어야 함", () => {
      expect(typeof ANALYTICS_CONFIG.storageKey).toBe("string");
      expect(ANALYTICS_CONFIG.storageKey.length).toBeGreaterThan(0);
    });

    it("maxStoredEvents가 양수여야 함", () => {
      expect(ANALYTICS_CONFIG.maxStoredEvents).toBeGreaterThan(0);
    });

    it("externalServices가 설정되어야 함", () => {
      expect(ANALYTICS_CONFIG.externalServices).toHaveProperty("sentry");
      expect(ANALYTICS_CONFIG.externalServices).toHaveProperty("datadog");
    });
  });
});
