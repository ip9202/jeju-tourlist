/**
 * 분석 및 모니터링 설정
 *
 * Facebook UI 마이그레이션의 성능 메트릭, 에러 추적, 분석 이벤트를 관리합니다.
 */

/**
 * 성능 메트릭 수집을 위한 Web Vitals 목표값
 */
export const PERFORMANCE_TARGETS = {
  // Largest Contentful Paint (LCP)
  // 권장: 2.5초 이하
  LCP: 2500,

  // First Input Delay (FID)
  // 권장: 100ms 이하 (현재 INP로 대체됨)
  FID: 100,

  // Cumulative Layout Shift (CLS)
  // 권장: 0.1 이하
  CLS: 0.1,

  // Time to Interactive (TTI)
  // 권장: 3.8초 이하
  TTI: 3800,

  // First Contentful Paint (FCP)
  // 권장: 1.8초 이하
  FCP: 1800,
} as const;

/**
 * 에러율 모니터링 임계값
 */
export const ERROR_THRESHOLDS = {
  // 5분 내 에러율 5% 초과 시 알림
  errorRateThreshold: 5,
  checkInterval: 300000, // 5분 (ms)

  // 치명적 에러: 즉시 알림
  criticalErrorTypes: [
    "ReferenceError",
    "TypeError",
    "SyntaxError",
    "RangeError",
  ],
} as const;

/**
 * 분석 이벤트 타입 정의
 */
export enum AnalyticsEventType {
  // 답변 관련 이벤트
  ANSWER_SUBMITTED = "answer_submitted",
  ANSWER_LIKED = "answer_liked",
  ANSWER_DISLIKED = "answer_disliked",
  ANSWER_DELETED = "answer_deleted",

  // 댓글 관련 이벤트
  REPLY_SUBMITTED = "reply_submitted",
  REPLY_LIKED = "reply_liked",
  REPLY_DELETED = "reply_deleted",

  // UI 상호작용 이벤트
  UI_RENDERED = "ui_rendered",
  UI_ERROR = "ui_error",

  // Feature flag 관련 이벤트
  FEATURE_FLAG_EVALUATED = "feature_flag_evaluated",
  FEATURE_FLAG_CHANGED = "feature_flag_changed",

  // 성능 이벤트
  PERFORMANCE_METRIC = "performance_metric",
  ERROR_LOGGED = "error_logged",
}

/**
 * 분석 이벤트 데이터 구조
 */
export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: number;
  userId?: string;
  questionId?: string;
  answerId?: string;
  replyId?: string;
  metadata?: Record<string, unknown>;
  duration?: number; // 작업 소요 시간 (ms)
  errorMessage?: string;
}

/**
 * 성능 메트릭 데이터 구조
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  status: "good" | "needs-improvement" | "poor";
}

/**
 * Feature flag 성능 비교 데이터
 */
export interface FeatureFlagMetrics {
  facebookUIEnabled: boolean;
  averageLoadTime: number;
  averageLCP: number;
  averageCLS: number;
  errorCount: number;
  errorRate: number;
  sampleSize: number;
}

/**
 * 성능 메트릭이 목표값을 충족하는지 확인
 */
export const isPerformanceGood = (metric: PerformanceMetric): boolean => {
  const target =
    PERFORMANCE_TARGETS[metric.name as keyof typeof PERFORMANCE_TARGETS];
  if (!target) return true;

  // CLS는 낮을수록 좋음
  if (metric.name === "CLS") {
    return metric.value <= target;
  }

  // 나머지는 시간 기반 (낮을수록 좋음)
  return metric.value <= target;
};

/**
 * 메트릭 상태 판단
 */
export const getMetricStatus = (
  name: string,
  value: number
): "good" | "needs-improvement" | "poor" => {
  const targets = PERFORMANCE_TARGETS;
  const target = targets[name as keyof typeof targets];

  if (!target) return "good";

  if (name === "CLS") {
    // CLS: 0.1 이하 = good, 0.1~0.25 = needs-improvement, > 0.25 = poor
    if (value <= 0.1) return "good";
    if (value <= 0.25) return "needs-improvement";
    return "poor";
  }

  // 시간 기반 메트릭
  if (value <= target) return "good";
  if (value <= target * 1.5) return "needs-improvement";
  return "poor";
};

/**
 * 디버깅용 분석 설정
 */
export const ANALYTICS_CONFIG = {
  // 분석 데이터 로컬 스토리지에 저장 여부
  persistToStorage: true,
  storageKey: "facebook-ui-analytics",

  // 최대 저장 이벤트 수
  maxStoredEvents: 100,

  // 콘솔에 이벤트 로깅 여부 (개발 환경)
  logToConsole: process.env.NODE_ENV === "development",

  // 외부 분석 서비스 연동 (향후 구현)
  externalServices: {
    sentry: {
      enabled: false, // 수동 활성화 필요
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    },
    datadog: {
      enabled: false, // 수동 활성화 필요
      apiKey: process.env.NEXT_PUBLIC_DATADOG_API_KEY,
    },
  },
} as const;
