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
  ERROR_THRESHOLDS,
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

/**
 * getMetricStatus 함수의 엣지 케이스 및 경계값 테스트
 */
describe("getMetricStatus - 경계값 및 엣지 케이스", () => {
  it("TTI 메트릭을 처리해야 함", () => {
    expect(getMetricStatus("TTI", 3800)).toBe("good");
    expect(getMetricStatus("TTI", 4500)).toBe("needs-improvement");
    expect(getMetricStatus("TTI", 6000)).toBe("poor");
  });

  it("FID 메트릭을 처리해야 함", () => {
    expect(getMetricStatus("FID", 100)).toBe("good");
    expect(getMetricStatus("FID", 150)).toBe("needs-improvement");
    expect(getMetricStatus("FID", 200)).toBe("poor");
  });

  it("CLS 메트릭의 정확한 경계값 처리", () => {
    expect(getMetricStatus("CLS", 0.1)).toBe("good");
    expect(getMetricStatus("CLS", 0.10001)).toBe("needs-improvement");
    expect(getMetricStatus("CLS", 0.25)).toBe("needs-improvement");
    expect(getMetricStatus("CLS", 0.25001)).toBe("poor");
  });

  it("시간 기반 메트릭의 정확한 경계값 처리", () => {
    expect(getMetricStatus("LCP", 2500)).toBe("good");
    expect(getMetricStatus("LCP", 2500.1)).toBe("needs-improvement");
    expect(getMetricStatus("LCP", 3750)).toBe("needs-improvement");
    expect(getMetricStatus("LCP", 3750.1)).toBe("poor");
  });

  it("FCP의 모든 상태 구간 테스트", () => {
    expect(getMetricStatus("FCP", 1000)).toBe("good");
    expect(getMetricStatus("FCP", 1800)).toBe("good");
    expect(getMetricStatus("FCP", 1801)).toBe("needs-improvement");
    expect(getMetricStatus("FCP", 2700)).toBe("needs-improvement");
    expect(getMetricStatus("FCP", 2701)).toBe("poor");
  });

  it("0 값 처리", () => {
    expect(getMetricStatus("LCP", 0)).toBe("good");
    expect(getMetricStatus("CLS", 0)).toBe("good");
  });

  it("매우 큰 값 처리", () => {
    expect(getMetricStatus("LCP", 99999)).toBe("poor");
    expect(getMetricStatus("CLS", 10)).toBe("poor");
  });
});

/**
 * isPerformanceGood 함수의 추가 테스트
 */
describe("isPerformanceGood - 확장 테스트", () => {
  it("모든 성능 메트릭 타입에 대해 동작해야 함", () => {
    const metrics = [
      { name: "LCP", value: 2000, unit: "ms" },
      { name: "FCP", value: 1500, unit: "ms" },
      { name: "CLS", value: 0.05, unit: "" },
      { name: "FID", value: 80, unit: "ms" },
      { name: "TTI", value: 3000, unit: "ms" },
    ];

    metrics.forEach(metric => {
      const performanceMetric: PerformanceMetric = {
        ...metric,
        timestamp: Date.now(),
        status: "good",
      };
      expect(isPerformanceGood(performanceMetric)).toBe(true);
    });
  });

  it("정의되지 않은 메트릭은 항상 true 반환", () => {
    const unknownMetrics = ["CUSTOM_METRIC", "CUSTOM_VAL", "UNKNOWN"];
    unknownMetrics.forEach(metricName => {
      const metric: PerformanceMetric = {
        name: metricName,
        value: 99999,
        unit: "ms",
        timestamp: Date.now(),
        status: "poor",
      };
      expect(isPerformanceGood(metric)).toBe(true);
    });
  });

  it("음수 값 처리", () => {
    const metric: PerformanceMetric = {
      name: "LCP",
      value: -100,
      unit: "ms",
      timestamp: Date.now(),
      status: "good",
    };
    expect(isPerformanceGood(metric)).toBe(true);
  });

  it("정확히 목표값과 같을 때", () => {
    const metric: PerformanceMetric = {
      name: "LCP",
      value: 2500,
      unit: "ms",
      timestamp: Date.now(),
      status: "good",
    };
    expect(isPerformanceGood(metric)).toBe(true);
  });
});

/**
 * ANALYTICS_CONFIG 상세 테스트
 */
describe("ANALYTICS_CONFIG - 상세 검증", () => {
  it("persistToStorage 값 확인", () => {
    expect(typeof ANALYTICS_CONFIG.persistToStorage).toBe("boolean");
    expect(ANALYTICS_CONFIG.persistToStorage).toBe(true);
  });

  it("storageKey가 유효한 문자열 키여야 함", () => {
    expect(ANALYTICS_CONFIG.storageKey).toBe("facebook-ui-analytics");
    expect(ANALYTICS_CONFIG.storageKey.length).toBeGreaterThan(0);
  });

  it("maxStoredEvents가 합리적인 값이어야 함", () => {
    expect(ANALYTICS_CONFIG.maxStoredEvents).toBe(100);
    expect(ANALYTICS_CONFIG.maxStoredEvents).toBeGreaterThan(0);
    expect(ANALYTICS_CONFIG.maxStoredEvents).toBeLessThanOrEqual(1000);
  });

  it("logToConsole은 boolean 타입이어야 함", () => {
    expect(typeof ANALYTICS_CONFIG.logToConsole).toBe("boolean");
  });

  it("externalServices 설정이 올바른 구조를 가져야 함", () => {
    const { externalServices } = ANALYTICS_CONFIG;

    expect(externalServices.sentry).toBeDefined();
    expect(externalServices.sentry.enabled).toBe(false);

    expect(externalServices.datadog).toBeDefined();
    expect(externalServices.datadog.enabled).toBe(false);
  });
});

/**
 * ERROR_THRESHOLDS 검증
 */
describe("ERROR_THRESHOLDS", () => {
  it("에러율 임계값이 합리적이어야 함", () => {
    expect(ERROR_THRESHOLDS.errorRateThreshold).toBeGreaterThan(0);
    expect(ERROR_THRESHOLDS.errorRateThreshold).toBeLessThanOrEqual(100);
  });

  it("체크 간격이 타당해야 함", () => {
    expect(ERROR_THRESHOLDS.checkInterval).toBe(300000);
    expect(ERROR_THRESHOLDS.checkInterval).toBeGreaterThan(0);
  });

  it("치명적 에러 타입들이 모두 정의되어야 함", () => {
    const expectedErrors = [
      "ReferenceError",
      "TypeError",
      "SyntaxError",
      "RangeError",
    ];
    expectedErrors.forEach(errorType => {
      expect(ERROR_THRESHOLDS.criticalErrorTypes).toContain(errorType);
    });
  });

  it("critical 에러 타입이 모두 string이어야 함", () => {
    ERROR_THRESHOLDS.criticalErrorTypes.forEach(errorType => {
      expect(typeof errorType).toBe("string");
      expect(errorType.length).toBeGreaterThan(0);
    });
  });
});

/**
 * PERFORMANCE_TARGETS의 모든 값 검증
 */
describe("PERFORMANCE_TARGETS - 상세 검증", () => {
  it("모든 메트릭 목표값이 양수여야 함", () => {
    Object.entries(PERFORMANCE_TARGETS).forEach(([_key, value]) => {
      expect(value).toBeGreaterThan(0);
    });
  });

  it("메트릭 목표값이 합리적인 범위여야 함", () => {
    expect(PERFORMANCE_TARGETS.LCP).toBeGreaterThan(0);
    expect(PERFORMANCE_TARGETS.LCP).toBeLessThanOrEqual(5000);

    expect(PERFORMANCE_TARGETS.FCP).toBeGreaterThan(0);
    expect(PERFORMANCE_TARGETS.FCP).toBeLessThanOrEqual(3000);

    expect(PERFORMANCE_TARGETS.CLS).toBeGreaterThan(0);
    expect(PERFORMANCE_TARGETS.CLS).toBeLessThanOrEqual(1);

    expect(PERFORMANCE_TARGETS.FID).toBeGreaterThan(0);
    expect(PERFORMANCE_TARGETS.FID).toBeLessThanOrEqual(500);

    expect(PERFORMANCE_TARGETS.TTI).toBeGreaterThan(0);
    expect(PERFORMANCE_TARGETS.TTI).toBeLessThanOrEqual(10000);
  });

  it("각 메트릭 목표값이 Web Vitals 권장사항을 따를 것", () => {
    expect(PERFORMANCE_TARGETS.LCP).toBeLessThanOrEqual(2500);
    expect(PERFORMANCE_TARGETS.FCP).toBeLessThanOrEqual(1800);
    expect(PERFORMANCE_TARGETS.CLS).toBeLessThanOrEqual(0.1);
    expect(PERFORMANCE_TARGETS.FID).toBeLessThanOrEqual(100);
  });
});
