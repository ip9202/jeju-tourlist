/**
 * 유틸리티 함수 라이브러리
 *
 * @description
 * - 공통으로 사용되는 유틸리티 함수들을 모아놓은 라이브러리
 * - SRP: 각 함수는 단일 책임을 가짐
 * - OCP: 새로운 유틸리티 함수 추가 시 기존 코드 수정 없이 확장
 * - 재사용성과 테스트 가능성을 고려한 설계
 */

// Validation utilities
export { validateEmail, validatePassword } from "./validation";

// String utilities
export { sanitizeHtml, slugify } from "./string";

// Date utilities
export { formatDate } from "./date";

// Function utilities
export { debounce, throttle } from "./function";

// ID utilities
export { generateId } from "./id";

// URL utilities
export { isValidUrl } from "./url";

// JSON utilities
export { parseJsonSafely } from "./json";

// Type definitions
export * from "./types";
