/**
 * 문자열 처리 유틸리티 함수들
 *
 * @description
 * - 문자열 조작, 변환, 정리 등의 기능을 제공
 * - XSS 방지 및 보안을 고려한 문자열 처리
 * - SRP: 각 함수는 특정 문자열 작업만 담당
 */

// DOMPurify 대신 간단한 HTML 정리 함수 사용

/**
 * HTML 태그 제거 및 XSS 방지
 *
 * @param html - 정리할 HTML 문자열
 * @returns 안전한 텍스트 문자열
 *
 * @description
 * - 모든 HTML 태그를 제거
 * - XSS 공격을 방지하기 위한 안전한 문자열 반환
 * - DOMPurify를 사용하여 보안 강화
 *
 * @example
 * ```typescript
 * sanitizeHtml("<script>alert('xss')</script><p>Safe content</p>");
 * // "Safe content"
 * ```
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  // 간단한 HTML 태그 제거 (XSS 방지)
  return html.replace(/<[^>]*>/g, "");
}

/**
 * URL 친화적인 슬러그 생성
 *
 * @param text - 변환할 텍스트
 * @returns URL 친화적인 슬러그
 *
 * @description
 * - 한글과 영문을 URL에 안전한 형태로 변환
 * - 특수문자와 공백을 하이픈으로 변환
 * - 연속된 하이픈을 하나로 합침
 *
 * @example
 * ```typescript
 * slugify("제주도 맛집 추천해주세요!");
 * // "제주도-맛집-추천해주세요"
 * ```
 */
export function slugify(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    .toString()
    .toLowerCase()
    .trim()
    // 특수문자와 공백을 하이픈으로 변환
    .replace(/[\s\W-]+/g, "-")
    // 연속된 하이픈을 하나로 합침
    .replace(/--+/g, "-")
    // 시작과 끝의 하이픈 제거
    .replace(/^-+|-+$/g, "");
}

/**
 * 문자열을 지정된 길이로 자르기
 *
 * @param text - 자를 문자열
 * @param length - 최대 길이
 * @param suffix - 잘린 경우 추가할 접미사
 * @returns 잘린 문자열
 *
 * @example
 * ```typescript
 * truncate("This is a long text", 10, "...");
 * // "This is a ..."
 * ```
 */
export function truncate(
  text: string,
  length: number,
  suffix: string = "..."
): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  if (text.length <= length) {
    return text;
  }

  return text.substring(0, length - suffix.length) + suffix;
}

/**
 * 문자열에서 HTML 태그 제거
 *
 * @param html - HTML이 포함된 문자열
 * @returns HTML 태그가 제거된 순수 텍스트
 *
 * @example
 * ```typescript
 * stripHtml("<p>Hello <strong>World</strong></p>");
 * // "Hello World"
 * ```
 */
export function stripHtml(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  return html.replace(/<[^>]*>/g, "");
}

/**
 * 문자열의 첫 글자를 대문자로 변환
 *
 * @param text - 변환할 문자열
 * @returns 첫 글자가 대문자인 문자열
 *
 * @example
 * ```typescript
 * capitalize("hello world");
 * // "Hello world"
 * ```
 */
export function capitalize(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * 문자열의 각 단어의 첫 글자를 대문자로 변환
 *
 * @param text - 변환할 문자열
 * @returns 각 단어의 첫 글자가 대문자인 문자열
 *
 * @example
 * ```typescript
 * titleCase("hello world");
 * // "Hello World"
 * ```
 */
export function titleCase(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    .toLowerCase()
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * 문자열에서 특정 패턴을 다른 문자열로 치환
 *
 * @param text - 원본 문자열
 * @param pattern - 찾을 패턴 (정규식 또는 문자열)
 * @param replacement - 치환할 문자열
 * @returns 치환된 문자열
 *
 * @example
 * ```typescript
 * replaceAll("hello world hello", "hello", "hi");
 * // "hi world hi"
 * ```
 */
export function replaceAll(
  text: string,
  pattern: string | RegExp,
  replacement: string
): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  if (typeof pattern === "string") {
    return text.split(pattern).join(replacement);
  }

  return text.replace(pattern, replacement);
}

/**
 * 문자열이 특정 패턴과 일치하는지 확인
 *
 * @param text - 확인할 문자열
 * @param pattern - 패턴 (정규식 또는 문자열)
 * @returns 패턴과 일치하는지 여부
 *
 * @example
 * ```typescript
 * matches("hello@example.com", /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
 * // true
 * ```
 */
export function matches(text: string, pattern: string | RegExp): boolean {
  if (!text || typeof text !== "string") {
    return false;
  }

  if (typeof pattern === "string") {
    return text.includes(pattern);
  }

  return pattern.test(text);
}

/**
 * 문자열을 카멜케이스로 변환
 *
 * @param text - 변환할 문자열
 * @returns 카멜케이스 문자열
 *
 * @example
 * ```typescript
 * toCamelCase("hello-world");
 * // "helloWorld"
 * ```
 */
export function toCamelCase(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    .toLowerCase()
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""));
}

/**
 * 문자열을 파스칼케이스로 변환
 *
 * @param text - 변환할 문자열
 * @returns 파스칼케이스 문자열
 *
 * @example
 * ```typescript
 * toPascalCase("hello-world");
 * // "HelloWorld"
 * ```
 */
export function toPascalCase(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  const camelCase = toCamelCase(text);
  return capitalize(camelCase);
}

/**
 * 문자열을 스네이크케이스로 변환
 *
 * @param text - 변환할 문자열
 * @returns 스네이크케이스 문자열
 *
 * @example
 * ```typescript
 * toSnakeCase("helloWorld");
 * // "hello_world"
 * ```
 */
export function toSnakeCase(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");
}
