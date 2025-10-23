"use client";

import { useCallback, useRef, useEffect } from "react";
import {
  AnalyticsEvent,
  AnalyticsEventType,
  ANALYTICS_CONFIG,
  PerformanceMetric,
  getMetricStatus,
} from "@/config/analytics";

/**
 * 분석 이벤트 추적 훅
 *
 * Facebook UI 마이그레이션의 성능, 에러, 사용자 상호작용을 추적합니다.
 *
 * @returns {{
 *   trackEvent: (event: Omit<AnalyticsEvent, 'timestamp'>) => void;
 *   trackPerformance: (metric: Omit<PerformanceMetric, 'timestamp' | 'status'>) => void;
 *   trackError: (error: Error | string, context?: Record<string, any>) => void;
 *   getEvents: () => AnalyticsEvent[];
 * }} 분석 관련 메서드들
 *
 * @example
 * // 답변 제출 이벤트 추적
 * const { trackEvent } = useAnalytics();
 * trackEvent({
 *   type: AnalyticsEventType.ANSWER_SUBMITTED,
 *   answerId: newAnswer.id,
 *   duration: 2500,
 * });
 *
 * @example
 * // 성능 메트릭 추적
 * const { trackPerformance } = useAnalytics();
 * trackPerformance({
 *   name: 'LCP',
 *   value: 1800,
 *   unit: 'ms',
 * });
 *
 * @example
 * // 에러 추적
 * const { trackError } = useAnalytics();
 * trackError(new Error('Failed to submit answer'), {
 *   questionId: question.id,
 * });
 */
export const useAnalytics = () => {
  const eventsRef = useRef<AnalyticsEvent[]>([]);

  /**
   * 분석 이벤트 추적
   */
  const trackEvent = useCallback((event: Omit<AnalyticsEvent, "timestamp">) => {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
    };

    // 메모리에 저장
    eventsRef.current.push(analyticsEvent);

    // 저장소 크기 제한
    if (eventsRef.current.length > ANALYTICS_CONFIG.maxStoredEvents) {
      eventsRef.current = eventsRef.current.slice(
        -ANALYTICS_CONFIG.maxStoredEvents
      );
    }

    // 로컬 스토리지에 저장
    if (ANALYTICS_CONFIG.persistToStorage && typeof window !== "undefined") {
      try {
        localStorage.setItem(
          ANALYTICS_CONFIG.storageKey,
          JSON.stringify(eventsRef.current)
        );
      } catch (error) {
        // 스토리지 할당량 초과 등의 에러 무시
      }
    }

    // 개발 환경에서 콘솔 로깅
    if (ANALYTICS_CONFIG.logToConsole) {
      // eslint-disable-next-line no-console
      console.log("[Analytics Event]", analyticsEvent);
    }
  }, []);

  /**
   * 성능 메트릭 추적
   */
  const trackPerformance = useCallback(
    (metric: Omit<PerformanceMetric, "timestamp" | "status">) => {
      const status = getMetricStatus(metric.name, metric.value);

      trackEvent({
        type: AnalyticsEventType.PERFORMANCE_METRIC,
        metadata: {
          ...metric,
          status,
        },
      });

      // 개발 환경에서 성능 메트릭 로깅
      if (ANALYTICS_CONFIG.logToConsole) {
        // eslint-disable-next-line no-console
        console.log(
          `[Performance] ${metric.name}: ${metric.value}${metric.unit} (${status})`
        );
      }
    },
    [trackEvent]
  );

  /**
   * 에러 추적
   */
  const trackError = useCallback(
    (error: Error | string, context?: Record<string, unknown>) => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      trackEvent({
        type: AnalyticsEventType.ERROR_LOGGED,
        errorMessage,
        metadata: {
          ...context,
          stack: error instanceof Error ? error.stack : undefined,
        },
      });

      // 개발 환경에서 에러 로깅
      if (ANALYTICS_CONFIG.logToConsole) {
        // eslint-disable-next-line no-console
        console.error("[Analytics Error]", errorMessage, context);
      }
    },
    [trackEvent]
  );

  /**
   * 저장된 이벤트 조회
   */
  const getEvents = useCallback(() => {
    return [...eventsRef.current];
  }, []);

  /**
   * 저장된 이벤트 초기화
   */
  const clearEvents = useCallback(() => {
    eventsRef.current = [];
    if (ANALYTICS_CONFIG.persistToStorage && typeof window !== "undefined") {
      try {
        localStorage.removeItem(ANALYTICS_CONFIG.storageKey);
      } catch (error) {
        // 에러 무시
      }
    }
  }, []);

  /**
   * 로드 시 저장된 이벤트 복원
   */
  useEffect(() => {
    if (ANALYTICS_CONFIG.persistToStorage && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(ANALYTICS_CONFIG.storageKey);
        if (stored) {
          eventsRef.current = JSON.parse(stored);
        }
      } catch (error) {
        // 파싱 에러 무시
      }
    }
  }, []);

  return {
    trackEvent,
    trackPerformance,
    trackError,
    getEvents,
    clearEvents,
  };
};
