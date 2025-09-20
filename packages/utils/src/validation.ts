/**
 * 입력값 검증 유틸리티 함수들
 *
 * @description
 * - 사용자 입력값의 유효성을 검증하는 함수들
 * - 보안과 데이터 무결성을 보장하기 위한 검증 로직
 * - SRP: 각 함수는 특정 타입의 검증만 담당
 */

/**
 * 이메일 형식 검증
 *
 * @param email - 검증할 이메일 주소
 * @returns 이메일이 유효한 형식인지 여부
 *
 * @example
 * ```typescript
 * validateEmail("test@example.com"); // true
 * validateEmail("invalid-email"); // false
 * ```
 */
export function validateEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  // RFC 5322 호환 이메일 정규식
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email);
}

/**
 * 비밀번호 강도 검증
 *
 * @param password - 검증할 비밀번호
 * @returns 비밀번호가 강력한지 여부
 *
 * @description
 * - 최소 8자 이상
 * - 대문자, 소문자, 숫자, 특수문자 각각 1개 이상 포함
 *
 * @example
 * ```typescript
 * validatePassword("Password123!"); // true
 * validatePassword("weak"); // false
 * ```
 */
export function validatePassword(password: string | null | undefined): boolean {
  if (!password || typeof password !== "string") {
    return false;
  }

  // 최소 길이 검증
  if (password.length < 8) {
    return false;
  }

  // 대문자 검증
  const hasUpperCase = /[A-Z]/.test(password);
  if (!hasUpperCase) {
    return false;
  }

  // 소문자 검증
  const hasLowerCase = /[a-z]/.test(password);
  if (!hasLowerCase) {
    return false;
  }

  // 숫자 검증
  const hasNumber = /\d/.test(password);
  if (!hasNumber) {
    return false;
  }

  // 특수문자 검증
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (!hasSpecialChar) {
    return false;
  }

  return true;
}

/**
 * 사용자명 검증
 *
 * @param username - 검증할 사용자명
 * @returns 사용자명이 유효한지 여부
 *
 * @description
 * - 3-20자 길이
 * - 영문, 숫자, 언더스코어, 하이픈만 허용
 * - 영문으로 시작해야 함
 *
 * @example
 * ```typescript
 * validateUsername("user123"); // true
 * validateUsername("123user"); // false
 * ```
 */
export function validateUsername(username: string | null | undefined): boolean {
  if (!username || typeof username !== "string") {
    return false;
  }

  // 길이 검증
  if (username.length < 3 || username.length > 20) {
    return false;
  }

  // 형식 검증 (영문으로 시작, 영문/숫자/언더스코어/하이픈만 허용)
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
  return usernameRegex.test(username);
}

/**
 * 전화번호 검증 (한국 형식)
 *
 * @param phoneNumber - 검증할 전화번호
 * @returns 전화번호가 유효한지 여부
 *
 * @example
 * ```typescript
 * validatePhoneNumber("010-1234-5678"); // true
 * validatePhoneNumber("01012345678"); // true
 * validatePhoneNumber("123-456-789"); // false
 * ```
 */
export function validatePhoneNumber(phoneNumber: string | null | undefined): boolean {
  if (!phoneNumber || typeof phoneNumber !== "string") {
    return false;
  }

  // 하이픈 제거 후 숫자만 추출
  const cleanNumber = phoneNumber.replace(/[-\s]/g, "");
  
  // 한국 휴대폰 번호 형식 검증 (010, 011, 016, 017, 018, 019)
  const phoneRegex = /^01[0-9][0-9]{7,8}$/;
  return phoneRegex.test(cleanNumber);
}

/**
 * URL 검증
 *
 * @param url - 검증할 URL
 * @returns URL이 유효한지 여부
 *
 * @example
 * ```typescript
 * validateUrl("https://example.com"); // true
 * validateUrl("invalid-url"); // false
 * ```
 */
export function validateUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 숫자 범위 검증
 *
 * @param value - 검증할 값
 * @param min - 최소값
 * @param max - 최대값
 * @returns 값이 범위 내에 있는지 여부
 *
 * @example
 * ```typescript
 * validateRange(5, 1, 10); // true
 * validateRange(15, 1, 10); // false
 * ```
 */
export function validateRange(
  value: number | null | undefined,
  min: number,
  max: number
): boolean {
  if (typeof value !== "number" || isNaN(value)) {
    return false;
  }

  return value >= min && value <= max;
}

/**
 * 필수 필드 검증
 *
 * @param value - 검증할 값
 * @returns 값이 존재하는지 여부
 *
 * @example
 * ```typescript
 * validateRequired("test"); // true
 * validateRequired(""); // false
 * validateRequired(null); // false
 * ```
 */
export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length > 0;
  }

  return true;
}
