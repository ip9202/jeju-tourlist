/**
 * JSON 처리 유틸리티 함수들
 *
 * @description
 * - JSON 파싱, 직렬화, 검증 등의 기능을 제공
 * - 안전한 JSON 처리를 위한 에러 핸들링
 * - SRP: 각 함수는 특정 JSON 작업만 담당
 */

/**
 * 안전한 JSON 파싱
 *
 * @param jsonString - 파싱할 JSON 문자열
 * @param defaultValue - 파싱 실패 시 반환할 기본값
 * @returns 파싱된 객체 또는 기본값
 *
 * @description
 * - JSON.parse의 예외를 안전하게 처리
 * - 파싱 실패 시 기본값 반환
 * - null, undefined 입력에 대한 안전한 처리
 *
 * @example
 * ```typescript
 * parseJsonSafely('{"name": "test"}'); // { name: "test" }
 * parseJsonSafely('invalid json', {}); // {}
 * parseJsonSafely(null, []); // []
 * ```
 */
export function parseJsonSafely<T = any>(
  jsonString: string | null | undefined,
  defaultValue: T = null as T
): T {
  if (!jsonString || typeof jsonString !== "string") {
    return defaultValue;
  }

  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
}

/**
 * 안전한 JSON 직렬화
 *
 * @param value - 직렬화할 값
 * @param defaultValue - 직렬화 실패 시 반환할 기본값
 * @returns JSON 문자열 또는 기본값
 *
 * @description
 * - JSON.stringify의 예외를 안전하게 처리
 * - 순환 참조 등으로 인한 직렬화 실패 방지
 * - null, undefined 입력에 대한 안전한 처리
 *
 * @example
 * ```typescript
 * stringifySafely({ name: "test" }); // '{"name":"test"}'
 * stringifySafely(circularObject, "{}"); // "{}"
 * ```
 */
export function stringifySafely(
  value: any,
  defaultValue: string = "{}"
): string {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return defaultValue;
  }
}

/**
 * JSON 문자열 유효성 검증
 *
 * @param jsonString - 검증할 JSON 문자열
 * @returns 유효한 JSON인지 여부
 *
 * @example
 * ```typescript
 * isValidJson('{"name": "test"}'); // true
 * isValidJson('invalid json'); // false
 * ```
 */
export function isValidJson(jsonString: string | null | undefined): boolean {
  if (!jsonString || typeof jsonString !== "string") {
    return false;
  }

  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * JSON 객체 깊은 복사
 *
 * @param obj - 복사할 객체
 * @returns 깊은 복사된 객체
 *
 * @description
 * - JSON을 통한 깊은 복사
 * - 함수, undefined, Symbol 등은 제외됨
 * - 순환 참조가 있는 객체는 처리 불가
 *
 * @example
 * ```typescript
 * const original = { a: { b: 1 } };
 * const copied = deepClone(original);
 * copied.a.b = 2;
 * console.log(original.a.b); // 1 (원본 변경되지 않음)
 * ```
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    // 순환 참조 등으로 인한 실패 시 원본 반환
    return obj;
  }
}

/**
 * JSON 객체 병합
 *
 * @param target - 대상 객체
 * @param source - 소스 객체
 * @returns 병합된 객체
 *
 * @description
 * - 깊은 병합을 수행
 * - 배열은 교체, 객체는 재귀적으로 병합
 * - 원본 객체는 변경되지 않음
 *
 * @example
 * ```typescript
 * const merged = mergeJson(
 *   { a: { b: 1, c: 2 }, d: [1, 2] },
 *   { a: { b: 3 }, d: [3, 4] }
 * );
 * // { a: { b: 3, c: 2 }, d: [3, 4] }
 * ```
 */
export function mergeJson<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  if (!target || typeof target !== "object") {
    return source as T;
  }

  if (!source || typeof source !== "object") {
    return target;
  }

  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        // 객체인 경우 재귀적으로 병합
        result[key] = mergeJson(targetValue, sourceValue);
      } else {
        // 배열이거나 원시값인 경우 교체
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * JSON 객체에서 특정 경로의 값 추출
 *
 * @param obj - 대상 객체
 * @param path - 경로 (점 표기법)
 * @param defaultValue - 값이 없을 때 반환할 기본값
 * @returns 추출된 값 또는 기본값
 *
 * @example
 * ```typescript
 * const obj = { user: { profile: { name: "test" } } };
 * getJsonValue(obj, "user.profile.name"); // "test"
 * getJsonValue(obj, "user.age", 0); // 0
 * ```
 */
export function getJsonValue<T = any>(
  obj: any,
  path: string,
  defaultValue: T = undefined as T
): T {
  if (!obj || typeof obj !== "object" || !path) {
    return defaultValue;
  }

  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") {
      return defaultValue;
    }
    current = current[key];
  }

  return current !== undefined ? current : defaultValue;
}

/**
 * JSON 객체에서 특정 경로에 값 설정
 *
 * @param obj - 대상 객체
 * @param path - 경로 (점 표기법)
 * @param value - 설정할 값
 * @returns 수정된 객체
 *
 * @description
 * - 중간 경로가 없으면 객체를 생성
 * - 원본 객체는 변경되지 않음
 *
 * @example
 * ```typescript
 * const obj = {};
 * setJsonValue(obj, "user.profile.name", "test");
 * // { user: { profile: { name: "test" } } }
 * ```
 */
export function setJsonValue(
  obj: any,
  path: string,
  value: any
): any {
  if (!obj || typeof obj !== "object" || !path) {
    return obj;
  }

  const keys = path.split(".");
  const result = deepClone(obj);
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    
    if (!(key in current) || typeof current[key] !== "object" || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return result;
}

/**
 * JSON 객체에서 특정 경로의 값 제거
 *
 * @param obj - 대상 객체
 * @param path - 경로 (점 표기법)
 * @returns 수정된 객체
 *
 * @example
 * ```typescript
 * const obj = { user: { profile: { name: "test", age: 25 } } };
 * removeJsonValue(obj, "user.profile.age");
 * // { user: { profile: { name: "test" } } }
 * ```
 */
export function removeJsonValue(obj: any, path: string): any {
  if (!obj || typeof obj !== "object" || !path) {
    return obj;
  }

  const keys = path.split(".");
  const result = deepClone(obj);
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    
    if (!(key in current) || typeof current[key] !== "object" || current[key] === null) {
      return result; // 경로가 존재하지 않음
    }
    current = current[key];
  }

  delete current[keys[keys.length - 1]];
  return result;
}

/**
 * JSON 객체 비교
 *
 * @param obj1 - 첫 번째 객체
 * @param obj2 - 두 번째 객체
 * @returns 객체가 같은지 여부
 *
 * @description
 * - 깊은 비교를 수행
 * - 순서가 다른 배열은 다른 것으로 판단
 * - 함수, undefined, Symbol은 비교하지 않음
 *
 * @example
 * ```typescript
 * const obj1 = { a: { b: 1 } };
 * const obj2 = { a: { b: 1 } };
 * isEqualJson(obj1, obj2); // true
 * ```
 */
export function isEqualJson(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (obj1 === null || obj2 === null) {
    return obj1 === obj2;
  }

  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  if (typeof obj1 !== "object") {
    return obj1 === obj2;
  }

  if (Array.isArray(obj1) !== Array.isArray(obj2)) {
    return false;
  }

  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    for (let i = 0; i < obj1.length; i++) {
      if (!isEqualJson(obj1[i], obj2[i])) {
        return false;
      }
    }
    return true;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }
    if (!isEqualJson(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

/**
 * JSON 객체 크기 계산 (바이트)
 *
 * @param obj - 크기를 계산할 객체
 * @returns JSON 문자열의 바이트 크기
 *
 * @example
 * ```typescript
 * const size = getJsonSize({ name: "test", age: 25 });
 * console.log(size); // 25 (대략적인 바이트 수)
 * ```
 */
export function getJsonSize(obj: any): number {
  try {
    const jsonString = JSON.stringify(obj);
    return new Blob([jsonString]).size;
  } catch {
    return 0;
  }
}
