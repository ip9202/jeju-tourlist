/**
 * useAnalytics 훅 단위 테스트
 *
 * 테스트 대상:
 * - trackEvent()
 * - trackPerformance()
 * - trackError()
 * - getEvents()
 * - clearEvents()
 */

import { renderHook, act } from "@testing-library/react";
import { useAnalytics } from "../useAnalytics";
import { AnalyticsEventType } from "@/config/analytics";

describe("useAnalytics hook", () => {
  beforeEach(() => {
    // 각 테스트 전에 localStorage 정리
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("trackEvent", () => {
    it("이벤트를 추적하고 저장해야 함", () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackEvent({
          type: AnalyticsEventType.ANSWER_SUBMITTED,
          answerId: "answer-123",
        });
      });

      const events = result.current.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe(AnalyticsEventType.ANSWER_SUBMITTED);
      expect(events[0].answerId).toBe("answer-123");
      expect(events[0].timestamp).toBeDefined();
    });

    it("여러 이벤트를 추적할 수 있어야 함", () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackEvent({
          type: AnalyticsEventType.ANSWER_SUBMITTED,
        });
        result.current.trackEvent({
          type: AnalyticsEventType.ANSWER_LIKED,
        });
        result.current.trackEvent({
          type: AnalyticsEventType.REPLY_SUBMITTED,
        });
      });

      const events = result.current.getEvents();
      expect(events).toHaveLength(3);
    });

    it("메타데이터를 포함할 수 있어야 함", () => {
      const { result } = renderHook(() => useAnalytics());

      const metadata = { questionId: "q-123", userId: "u-456" };

      act(() => {
        result.current.trackEvent({
          type: AnalyticsEventType.ANSWER_SUBMITTED,
          metadata,
        });
      });

      const events = result.current.getEvents();
      expect(events[0].metadata).toEqual(metadata);
    });

    it("최대 저장 이벤트 수를 초과하면 오래된 것을 제거해야 함", () => {
      const { result } = renderHook(() => useAnalytics());

      // 최대 저장 수보다 많은 이벤트 추적
      act(() => {
        for (let i = 0; i < 150; i++) {
          result.current.trackEvent({
            type: AnalyticsEventType.UI_RENDERED,
          });
        }
      });

      const events = result.current.getEvents();
      // maxStoredEvents가 100이므로 100개만 저장되어야 함
      expect(events.length).toBeLessThanOrEqual(100);
    });
  });

  describe("trackPerformance", () => {
    it("성능 메트릭을 추적해야 함", () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackPerformance({
          name: "LCP",
          value: 1800,
          unit: "ms",
        });
      });

      const events = result.current.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe(AnalyticsEventType.PERFORMANCE_METRIC);
    });

    it("성능 메트릭 상태를 포함해야 함", () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackPerformance({
          name: "LCP",
          value: 2000, // good
          unit: "ms",
        });
      });

      const events = result.current.getEvents();
      expect(events[0].metadata).toBeDefined();
      expect(events[0].metadata?.status).toBeDefined();
    });

    it("여러 성능 메트릭을 추적할 수 있어야 함", () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackPerformance({
          name: "LCP",
          value: 1800,
          unit: "ms",
        });
        result.current.trackPerformance({
          name: "FCP",
          value: 1200,
          unit: "ms",
        });
        result.current.trackPerformance({
          name: "CLS",
          value: 0.05,
          unit: "",
        });
      });

      const events = result.current.getEvents();
      expect(events).toHaveLength(3);
    });
  });

  describe("trackError", () => {
    it("Error 객체를 추적해야 함", () => {
      const { result } = renderHook(() => useAnalytics());

      const error = new Error("Test error message");

      act(() => {
        result.current.trackError(error);
      });

      const events = result.current.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe(AnalyticsEventType.ERROR_LOGGED);
      expect(events[0].errorMessage).toBe("Test error message");
    });

    it("문자열 에러를 추적해야 함", () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackError("String error message");
      });

      const events = result.current.getEvents();
      expect(events[0].errorMessage).toBe("String error message");
    });

    it("에러 컨텍스트를 포함할 수 있어야 함", () => {
      const { result } = renderHook(() => useAnalytics());

      const error = new Error("Test error");
      const context = { userId: "user-123", questionId: "q-456" };

      act(() => {
        result.current.trackError(error, context);
      });

      const events = result.current.getEvents();
      expect(events[0].metadata?.userId).toBe("user-123");
      expect(events[0].metadata?.questionId).toBe("q-456");
    });

    it("에러의 stack trace를 포함해야 함", () => {
      const { result } = renderHook(() => useAnalytics());

      const error = new Error("Test error with stack");

      act(() => {
        result.current.trackError(error);
      });

      const events = result.current.getEvents();
      expect(events[0].metadata?.stack).toBeDefined();
    });
  });

  describe("getEvents", () => {
    it("추적된 모든 이벤트를 반환해야 함", () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackEvent({
          type: AnalyticsEventType.ANSWER_SUBMITTED,
        });
        result.current.trackEvent({
          type: AnalyticsEventType.ANSWER_LIKED,
        });
      });

      const events = result.current.getEvents();
      expect(events).toHaveLength(2);
      expect(events[0].type).toBe(AnalyticsEventType.ANSWER_SUBMITTED);
      expect(events[1].type).toBe(AnalyticsEventType.ANSWER_LIKED);
    });

    it("빈 이벤트 배열을 반환할 수 있어야 함", () => {
      const { result } = renderHook(() => useAnalytics());

      const events = result.current.getEvents();
      expect(Array.isArray(events)).toBe(true);
      expect(events).toHaveLength(0);
    });

    it("새로운 배열을 반환해야 함 (불변성)", () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackEvent({
          type: AnalyticsEventType.UI_RENDERED,
        });
      });

      const events1 = result.current.getEvents();
      const events2 = result.current.getEvents();

      expect(events1).not.toBe(events2);
      expect(events1).toEqual(events2);
    });
  });

  describe("clearEvents", () => {
    it("모든 이벤트를 제거해야 함", () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackEvent({
          type: AnalyticsEventType.ANSWER_SUBMITTED,
        });
        result.current.trackEvent({
          type: AnalyticsEventType.ANSWER_LIKED,
        });
      });

      expect(result.current.getEvents()).toHaveLength(2);

      act(() => {
        result.current.clearEvents();
      });

      expect(result.current.getEvents()).toHaveLength(0);
    });

    it("localStorage에서도 데이터를 제거해야 함", () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackEvent({
          type: AnalyticsEventType.UI_RENDERED,
        });
      });

      expect(localStorage.getItem("facebook-ui-analytics")).not.toBeNull();

      act(() => {
        result.current.clearEvents();
      });

      expect(localStorage.getItem("facebook-ui-analytics")).toBeNull();
    });
  });

  describe("localStorage 통합", () => {
    it("이벤트를 localStorage에 저장해야 함", () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackEvent({
          type: AnalyticsEventType.ANSWER_SUBMITTED,
          answerId: "answer-123",
        });
      });

      const stored = localStorage.getItem("facebook-ui-analytics");
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored as string);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].type).toBe(AnalyticsEventType.ANSWER_SUBMITTED);
    });

    it("저장된 이벤트를 복원해야 함", () => {
      // 첫 번째 훅으로 이벤트 저장
      const { result: result1 } = renderHook(() => useAnalytics());

      act(() => {
        result1.current.trackEvent({
          type: AnalyticsEventType.ANSWER_SUBMITTED,
        });
      });

      // 두 번째 훅으로 복원 확인
      const { result: result2 } = renderHook(() => useAnalytics());

      const events = result2.current.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe(AnalyticsEventType.ANSWER_SUBMITTED);
    });
  });
});
