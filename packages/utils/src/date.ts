/**
 * 날짜 처리 유틸리티 함수들
 *
 * @description
 * - 날짜 포맷팅, 변환, 계산 등의 기능을 제공
 * - 한국 시간대를 기본으로 사용
 * - SRP: 각 함수는 특정 날짜 작업만 담당
 */

/**
 * 날짜 포맷팅 옵션
 */
export interface DateFormatOptions {
  /** 상대적 시간 표시 여부 (예: "1시간 전") */
  relative?: boolean;
  /** 사용자 정의 포맷 문자열 */
  format?: string;
  /** 시간대 (기본값: "Asia/Seoul") */
  timezone?: string;
}

/**
 * 날짜를 지정된 형식으로 포맷팅
 *
 * @param date - 포맷팅할 날짜
 * @param options - 포맷팅 옵션
 * @returns 포맷팅된 날짜 문자열
 *
 * @description
 * - 기본적으로 한국 시간대(UTC+9)를 사용
 * - 상대적 시간 표시 지원
 * - 사용자 정의 포맷 지원
 *
 * @example
 * ```typescript
 * formatDate(new Date()); // "2024-01-15 19:30:00"
 * formatDate(new Date(), { relative: true }); // "1시간 전"
 * formatDate(new Date(), { format: "YYYY년 MM월 DD일" }); // "2024년 01월 15일"
 * ```
 */
export function formatDate(
  date: Date | string | number,
  options: DateFormatOptions = {}
): string {
  if (!date) {
    return "";
  }

  const {
    relative = false,
    format = "YYYY-MM-DD HH:mm:ss",
    timezone = "Asia/Seoul",
  } = options;

  const targetDate = new Date(date);
  
  if (isNaN(targetDate.getTime())) {
    return "";
  }

  // 상대적 시간 표시
  if (relative) {
    return formatRelativeTime(targetDate, timezone);
  }

  // 사용자 정의 포맷 적용
  return formatCustomDate(targetDate, format, timezone);
}

/**
 * 상대적 시간 포맷팅
 *
 * @param date - 기준 날짜
 * @param timezone - 시간대
 * @returns 상대적 시간 문자열
 */
function formatRelativeTime(date: Date, timezone: string): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "방금 전";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}주 전`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}개월 전`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}년 전`;
}

/**
 * 사용자 정의 날짜 포맷팅
 *
 * @param date - 포맷팅할 날짜
 * @param format - 포맷 문자열
 * @param timezone - 시간대
 * @returns 포맷팅된 날짜 문자열
 */
function formatCustomDate(
  date: Date,
  format: string,
  timezone: string
): string {
  // 한국 시간대로 변환
  const koreanDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));

  const year = koreanDate.getFullYear();
  const month = String(koreanDate.getMonth() + 1).padStart(2, "0");
  const day = String(koreanDate.getDate()).padStart(2, "0");
  const hours = String(koreanDate.getHours()).padStart(2, "0");
  const minutes = String(koreanDate.getMinutes()).padStart(2, "0");
  const seconds = String(koreanDate.getSeconds()).padStart(2, "0");

  return format
    .replace(/YYYY/g, String(year))
    .replace(/MM/g, month)
    .replace(/DD/g, day)
    .replace(/HH/g, hours)
    .replace(/mm/g, minutes)
    .replace(/ss/g, seconds);
}

/**
 * 두 날짜 간의 차이를 계산
 *
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 * @returns 날짜 차이 정보
 *
 * @example
 * ```typescript
 * const diff = getDateDiff(new Date("2024-01-01"), new Date("2024-01-15"));
 * // { days: 14, hours: 0, minutes: 0, seconds: 0 }
 * ```
 */
export function getDateDiff(
  startDate: Date | string | number,
  endDate: Date | string | number
): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const diffInMs = Math.abs(end.getTime() - start.getTime());
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

/**
 * 날짜가 오늘인지 확인
 *
 * @param date - 확인할 날짜
 * @returns 오늘인지 여부
 *
 * @example
 * ```typescript
 * isToday(new Date()); // true
 * isToday(new Date("2024-01-01")); // false
 * ```
 */
export function isToday(date: Date | string | number): boolean {
  const targetDate = new Date(date);
  const today = new Date();

  if (isNaN(targetDate.getTime())) {
    return false;
  }

  return (
    targetDate.getDate() === today.getDate() &&
    targetDate.getMonth() === today.getMonth() &&
    targetDate.getFullYear() === today.getFullYear()
  );
}

/**
 * 날짜가 주말인지 확인
 *
 * @param date - 확인할 날짜
 * @returns 주말인지 여부
 *
 * @example
 * ```typescript
 * isWeekend(new Date("2024-01-13")); // true (토요일)
 * isWeekend(new Date("2024-01-15")); // false (월요일)
 * ```
 */
export function isWeekend(date: Date | string | number): boolean {
  const targetDate = new Date(date);

  if (isNaN(targetDate.getTime())) {
    return false;
  }

  const dayOfWeek = targetDate.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 일요일(0) 또는 토요일(6)
}

/**
 * 날짜에 지정된 일수를 추가
 *
 * @param date - 기준 날짜
 * @param days - 추가할 일수
 * @returns 새로운 날짜
 *
 * @example
 * ```typescript
 * addDays(new Date("2024-01-01"), 7);
 * // 2024-01-08
 * ```
 */
export function addDays(date: Date | string | number, days: number): Date {
  const targetDate = new Date(date);

  if (isNaN(targetDate.getTime())) {
    return new Date();
  }

  const result = new Date(targetDate);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 날짜에 지정된 월수를 추가
 *
 * @param date - 기준 날짜
 * @param months - 추가할 월수
 * @returns 새로운 날짜
 *
 * @example
 * ```typescript
 * addMonths(new Date("2024-01-01"), 1);
 * // 2024-02-01
 * ```
 */
export function addMonths(date: Date | string | number, months: number): Date {
  const targetDate = new Date(date);

  if (isNaN(targetDate.getTime())) {
    return new Date();
  }

  const result = new Date(targetDate);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * 날짜에 지정된 년수를 추가
 *
 * @param date - 기준 날짜
 * @param years - 추가할 년수
 * @returns 새로운 날짜
 *
 * @example
 * ```typescript
 * addYears(new Date("2024-01-01"), 1);
 * // 2025-01-01
 * ```
 */
export function addYears(date: Date | string | number, years: number): Date {
  const targetDate = new Date(date);

  if (isNaN(targetDate.getTime())) {
    return new Date();
  }

  const result = new Date(targetDate);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * 날짜의 시작 시간 (00:00:00)을 반환
 *
 * @param date - 기준 날짜
 * @returns 시작 시간의 날짜
 *
 * @example
 * ```typescript
 * startOfDay(new Date("2024-01-15 14:30:00"));
 * // 2024-01-15 00:00:00
 * ```
 */
export function startOfDay(date: Date | string | number): Date {
  const targetDate = new Date(date);

  if (isNaN(targetDate.getTime())) {
    return new Date();
  }

  const result = new Date(targetDate);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * 날짜의 끝 시간 (23:59:59)을 반환
 *
 * @param date - 기준 날짜
 * @returns 끝 시간의 날짜
 *
 * @example
 * ```typescript
 * endOfDay(new Date("2024-01-15 14:30:00"));
 * // 2024-01-15 23:59:59
 * ```
 */
export function endOfDay(date: Date | string | number): Date {
  const targetDate = new Date(date);

  if (isNaN(targetDate.getTime())) {
    return new Date();
  }

  const result = new Date(targetDate);
  result.setHours(23, 59, 59, 999);
  return result;
}
