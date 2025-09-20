/**
 * 유틸리티 함수들의 타입 정의
 *
 * @description
 * - 공통으로 사용되는 타입들을 정의
 * - 타입 안전성을 보장하기 위한 인터페이스
 */

/**
 * 날짜 포맷팅 옵션
 */
export interface DateFormatOptions {
  /** 상대적 시간 표시 여부 */
  relative?: boolean;
  /** 사용자 정의 포맷 문자열 */
  format?: string;
  /** 시간대 */
  timezone?: string;
}

/**
 * 함수 실행 결과와 시간
 */
export interface ExecutionResult<T> {
  /** 함수 실행 결과 */
  result: T;
  /** 실행 시간 (밀리초) */
  duration: number;
}

/**
 * ID 생성 옵션
 */
export interface IdGenerationOptions {
  /** ID 길이 */
  length?: number;
  /** 사용할 문자셋 */
  charset?: string;
  /** 접두사 */
  prefix?: string;
  /** 접미사 */
  suffix?: string;
}

/**
 * URL 파싱 결과
 */
export interface ParsedUrl {
  /** 프로토콜 */
  protocol: string;
  /** 호스트명 */
  hostname: string;
  /** 포트 */
  port: string;
  /** 경로 */
  pathname: string;
  /** 쿼리 스트링 */
  search: string;
  /** 해시 */
  hash: string;
}

/**
 * JSON 병합 옵션
 */
export interface MergeOptions {
  /** 배열 병합 방식 */
  arrayMerge?: "replace" | "concat" | "merge";
  /** 깊이 제한 */
  maxDepth?: number;
  /** 커스텀 병합 함수 */
  customMerge?: (key: string, target: any, source: any) => any;
}
