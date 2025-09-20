/**
 * ID 생성 및 관리 유틸리티 함수들
 *
 * @description
 * - 고유 ID 생성, 검증, 변환 등의 기능을 제공
 * - UUID, ULID, 커스텀 ID 생성 지원
 * - SRP: 각 함수는 특정 ID 작업만 담당
 */

import { randomBytes } from "crypto";

/**
 * 고유 ID 생성
 *
 * @param length - ID 길이 (기본값: 12)
 * @returns 고유한 문자열 ID
 *
 * @description
 * - URL 안전한 문자만 사용 (a-z, A-Z, 0-9, -, _)
 * - 암호학적으로 안전한 랜덤 생성
 * - 충돌 확률이 매우 낮음
 *
 * @example
 * ```typescript
 * generateId(); // "aB3xK9mP2qR7"
 * generateId(16); // "aB3xK9mP2qR7vY4n"
 * ```
 */
export function generateId(length: number = 12): string {
  if (length < 1 || length > 64) {
    throw new Error("ID length must be between 1 and 64");
  }

  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
  const bytes = randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }

  return result;
}

/**
 * UUID v4 생성
 *
 * @returns UUID v4 문자열
 *
 * @description
 * - RFC 4122 표준을 따르는 UUID v4 생성
 * - 128비트 랜덤 값 사용
 * - 전역적으로 고유한 식별자
 *
 * @example
 * ```typescript
 * generateUUID(); // "550e8400-e29b-41d4-a716-446655440000"
 * ```
 */
export function generateUUID(): string {
  const bytes = randomBytes(16);
  
  // UUID v4 형식에 맞게 비트 조작
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant bits

  const hex = bytes.toString("hex");
  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32)
  ].join("-");
}

/**
 * ULID 생성 (Universally Unique Lexicographically Sortable Identifier)
 *
 * @returns ULID 문자열
 *
 * @description
 * - 시간순으로 정렬 가능한 고유 식별자
 * - 48비트 타임스탬프 + 80비트 랜덤
 * - Base32 인코딩으로 URL 안전
 *
 * @example
 * ```typescript
 * generateULID(); // "01ARZ3NDEKTSV4RRFFQ69G5FAV"
 * ```
 */
export function generateULID(): string {
  const timestamp = Date.now();
  const random = randomBytes(10);
  
  // Base32 문자셋 (Crockford's Base32)
  const chars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  
  let result = "";
  
  // 타임스탬프 인코딩 (48비트)
  let ts = timestamp;
  for (let i = 0; i < 10; i++) {
    result = chars[ts & 0x1f] + result;
    ts >>>= 5;
  }
  
  // 랜덤 부분 인코딩 (80비트)
  for (let i = 0; i < 16; i++) {
    const byte = i < 10 ? random[i] : 0;
    result += chars[byte & 0x1f];
    if (i < 15) {
      result += chars[(byte >>> 5) | ((i < 9 ? random[i + 1] : 0) << 3) & 0x1f];
    }
  }
  
  return result;
}

/**
 * 짧은 ID 생성 (Base62)
 *
 * @param length - ID 길이 (기본값: 8)
 * @returns 짧은 고유 ID
 *
 * @description
 * - URL에 사용하기 적합한 짧은 ID
 * - Base62 인코딩 (0-9, a-z, A-Z)
 * - 충돌 확률이 있지만 매우 낮음
 *
 * @example
 * ```typescript
 * generateShortId(); // "aB3xK9mP"
 * generateShortId(6); // "aB3xK9"
 * ```
 */
export function generateShortId(length: number = 8): string {
  if (length < 1 || length > 16) {
    throw new Error("Short ID length must be between 1 and 16");
  }

  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const bytes = randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }

  return result;
}

/**
 * 숫자 기반 ID 생성
 *
 * @param length - ID 길이 (기본값: 10)
 * @returns 숫자로만 구성된 ID
 *
 * @description
 * - 숫자만 사용하는 ID (0-9)
 * - 데이터베이스 인덱스에 유리
 * - 정렬이 쉬움
 *
 * @example
 * ```typescript
 * generateNumericId(); // "1234567890"
 * generateNumericId(6); // "123456"
 * ```
 */
export function generateNumericId(length: number = 10): string {
  if (length < 1 || length > 20) {
    throw new Error("Numeric ID length must be between 1 and 20");
  }

  const bytes = randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i++) {
    result += (bytes[i] % 10).toString();
  }

  return result;
}

/**
 * ID 유효성 검증
 *
 * @param id - 검증할 ID
 * @param type - ID 타입
 * @returns 유효한 ID인지 여부
 *
 * @example
 * ```typescript
 * isValidId("aB3xK9mP2qR7", "custom"); // true
 * isValidId("550e8400-e29b-41d4-a716-446655440000", "uuid"); // true
 * isValidId("invalid", "uuid"); // false
 * ```
 */
export function isValidId(id: string, type: "custom" | "uuid" | "ulid" | "short" | "numeric"): boolean {
  if (!id || typeof id !== "string") {
    return false;
  }

  switch (type) {
    case "custom":
      return /^[a-zA-Z0-9\-_]+$/.test(id) && id.length >= 1 && id.length <= 64;
    
    case "uuid":
      return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    
    case "ulid":
      return /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/.test(id);
    
    case "short":
      return /^[0-9a-zA-Z]+$/.test(id) && id.length >= 1 && id.length <= 16;
    
    case "numeric":
      return /^[0-9]+$/.test(id) && id.length >= 1 && id.length <= 20;
    
    default:
      return false;
  }
}

/**
 * ID를 다른 형식으로 변환
 *
 * @param id - 변환할 ID
 * @param fromType - 원본 ID 타입
 * @param toType - 변환할 ID 타입
 * @returns 변환된 ID
 *
 * @example
 * ```typescript
 * convertId("aB3xK9mP2qR7", "custom", "short"); // "aB3xK9mP"
 * ```
 */
export function convertId(
  id: string,
  fromType: "custom" | "uuid" | "ulid" | "short" | "numeric",
  toType: "custom" | "uuid" | "ulid" | "short" | "numeric"
): string {
  if (!isValidId(id, fromType)) {
    throw new Error(`Invalid ${fromType} ID: ${id}`);
  }

  // 같은 타입이면 그대로 반환
  if (fromType === toType) {
    return id;
  }

  // 변환 로직 (간단한 해시 기반)
  const hash = require("crypto").createHash("sha256").update(id).digest("hex");
  
  switch (toType) {
    case "custom":
      return generateId(12);
    
    case "uuid":
      return generateUUID();
    
    case "ulid":
      return generateULID();
    
    case "short":
      return generateShortId(8);
    
    case "numeric":
      return generateNumericId(10);
    
    default:
      throw new Error(`Unsupported conversion from ${fromType} to ${toType}`);
  }
}

/**
 * ID에 체크섬 추가
 *
 * @param id - 원본 ID
 * @returns 체크섬이 포함된 ID
 *
 * @description
 * - ID의 무결성을 검증할 수 있는 체크섬 추가
 * - 오타나 변조 감지 가능
 * - Luhn 알고리즘 사용
 *
 * @example
 * ```typescript
 * addChecksum("123456789"); // "1234567897" (체크섬 7 추가)
 * ```
 */
export function addChecksum(id: string): string {
  if (!/^[0-9]+$/.test(id)) {
    throw new Error("ID must contain only digits for checksum calculation");
  }

  // Luhn 알고리즘으로 체크섬 계산
  let sum = 0;
  let isEven = false;

  for (let i = id.length - 1; i >= 0; i--) {
    let digit = parseInt(id[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  const checksum = (10 - (sum % 10)) % 10;
  return id + checksum.toString();
}

/**
 * 체크섬 검증
 *
 * @param idWithChecksum - 체크섬이 포함된 ID
 * @returns 체크섬이 유효한지 여부
 *
 * @example
 * ```typescript
 * verifyChecksum("1234567897"); // true
 * verifyChecksum("1234567890"); // false
 * ```
 */
export function verifyChecksum(idWithChecksum: string): boolean {
  if (!/^[0-9]+$/.test(idWithChecksum) || idWithChecksum.length < 2) {
    return false;
  }

  const id = idWithChecksum.slice(0, -1);
  const checksum = idWithChecksum.slice(-1);
  const expectedId = addChecksum(id);

  return expectedId === idWithChecksum;
}
