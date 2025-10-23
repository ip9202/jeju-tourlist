"use client";

import { useEffect } from "react";
import { useAnalytics } from "./useAnalytics";

/**
 * Web Vitals 성능 메트릭 자동 수집 훅
 *
 * 다음 메트릭을 자동으로 수집합니다:
 * - LCP (Largest Contentful Paint): 가장 큰 콘텐츠 렌더링 시간
 * - FCP (First Contentful Paint): 첫 콘텐츠 렌더링 시간
 * - CLS (Cumulative Layout Shift): 누적 레이아웃 시프트
 * - INP (Interaction to Next Paint): 상호작용 응답성 (FID 대체)
 *
 * @see https://web.dev/vitals/
 * @see https://web.dev/performance-monitoring/
 *
 * @example
 * export default function Page() {
 *   useWebVitals(); // 자동으로 성능 메트릭 수집
 *   return <div>...</div>;
 * }
 */
export const useWebVitals = () => {
  const { trackPerformance } = useAnalytics();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // PerformanceObserver를 지원하는 경우만 실행
    if (!("PerformanceObserver" in window)) {
      // eslint-disable-next-line no-console
      console.warn("[WebVitals] PerformanceObserver not supported");
      return;
    }

    /**
     * LCP (Largest Contentful Paint) 수집
     * 페이지에서 가장 큰 콘텐츠가 화면에 렌더링되는 시간
     */
    try {
      const lcpObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          duration?: number;
        };

        trackPerformance({
          name: "LCP",
          value: Math.round(lastEntry.startTime + (lastEntry.duration ?? 0)),
          unit: "ms",
        });
      });

      lcpObserver.observe({
        entryTypes: ["largest-contentful-paint"],
        buffered: true,
      });

      // 페이지 언로드 시 옵저버 정리
      return () => lcpObserver.disconnect();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[WebVitals] LCP observer failed:", error);
    }
  }, [trackPerformance]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    /**
     * FCP (First Contentful Paint) 수집
     * 페이지에서 첫 번째 콘텐츠가 렌더링되는 시간
     */
    try {
      const fcpObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (entry.name === "first-contentful-paint") {
            trackPerformance({
              name: "FCP",
              value: Math.round(entry.startTime),
              unit: "ms",
            });
          }
        });
      });

      fcpObserver.observe({
        entryTypes: ["paint"],
        buffered: true,
      });

      return () => fcpObserver.disconnect();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[WebVitals] FCP observer failed:", error);
    }
  }, [trackPerformance]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    /**
     * CLS (Cumulative Layout Shift) 수집
     * 페이지 로드 중 발생하는 의도하지 않은 레이아웃 변화의 누적값
     * 낮을수록 좋음 (목표: 0.1 이하)
     */
    try {
      let clsValue = 0;

      const clsObserver = new PerformanceObserver(entryList => {
        for (const entry of entryList.getEntries()) {
          // 사용자 입력으로 인한 변화는 제외
          const layoutShiftEntry = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          };
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value ?? 0;
          }
        }

        trackPerformance({
          name: "CLS",
          value: parseFloat(clsValue.toFixed(3)),
          unit: "",
        });
      });

      clsObserver.observe({
        type: "layout-shift",
        buffered: true,
      });

      return () => clsObserver.disconnect();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[WebVitals] CLS observer failed:", error);
    }
  }, [trackPerformance]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    /**
     * INP (Interaction to Next Paint) 수집
     * 사용자 상호작용(클릭, 터치 등)에서 시각적 피드백까지의 시간
     * FID (First Input Delay)의 후속 메트릭
     *
     * 참고: 모든 브라우저에서 지원하지 않음
     */
    try {
      let maxINP = 0;

      const inpObserver = new PerformanceObserver(entryList => {
        for (const entry of entryList.getEntries()) {
          const interactionEntry = entry as PerformanceEntry & {
            duration?: number;
          };
          maxINP = Math.max(maxINP, interactionEntry.duration ?? 0);
        }

        if (maxINP > 0) {
          trackPerformance({
            name: "FID", // INP를 FID 슬롯으로 저장 (호환성)
            value: Math.round(maxINP),
            unit: "ms",
          });
        }
      });

      inpObserver.observe({
        type: "interaction",
        buffered: true,
      } as PerformanceObserverInit);

      return () => inpObserver.disconnect();
    } catch (error) {
      // INP를 지원하지 않는 브라우저는 조용히 실패
      // eslint-disable-next-line no-console
      console.debug("[WebVitals] INP observer not supported");
    }
  }, [trackPerformance]);

  // 훅 자체로는 반환값이 필요 없음 (부작용 전용)
  // 하지만 타입 안전성을 위해 void 반환
  return;
};
