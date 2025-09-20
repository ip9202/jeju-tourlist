/**
 * URL 처리 유틸리티 함수들
 *
 * @description
 * - URL 생성, 검증, 조작 등의 기능을 제공
 * - 보안을 고려한 URL 처리
 * - SRP: 각 함수는 특정 URL 작업만 담당
 */

/**
 * URL 유효성 검증
 *
 * @param url - 검증할 URL
 * @returns URL이 유효한지 여부
 *
 * @description
 * - HTTP/HTTPS 프로토콜만 허용
 * - 보안을 위해 javascript:, data: 등 위험한 프로토콜 차단
 * - 상대 URL은 유효하지 않음으로 처리
 *
 * @example
 * ```typescript
 * isValidUrl("https://example.com"); // true
 * isValidUrl("http://localhost:3000"); // true
 * isValidUrl("javascript:alert('xss')"); // false
 * isValidUrl("invalid-url"); // false
 * ```
 */
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    const urlObj = new URL(url);
    
    // 허용된 프로토콜만 사용
    const allowedProtocols = ["http:", "https:"];
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return false;
    }

    // 위험한 프로토콜 차단
    const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:"];
    if (dangerousProtocols.some(protocol => url.toLowerCase().startsWith(protocol))) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * URL에서 쿼리 파라미터 추출
 *
 * @param url - 파싱할 URL
 * @returns 쿼리 파라미터 객체
 *
 * @example
 * ```typescript
 * getQueryParams("https://example.com?name=test&age=25");
 * // { name: "test", age: "25" }
 * ```
 */
export function getQueryParams(url: string): Record<string, string> {
  if (!url || typeof url !== "string") {
    return {};
  }

  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  } catch {
    return {};
  }
}

/**
 * 쿼리 파라미터를 URL에 추가
 *
 * @param baseUrl - 기본 URL
 * @param params - 추가할 쿼리 파라미터
 * @returns 쿼리 파라미터가 추가된 URL
 *
 * @example
 * ```typescript
 * addQueryParams("https://example.com", { name: "test", age: "25" });
 * // "https://example.com?name=test&age=25"
 * ```
 */
export function addQueryParams(
  baseUrl: string,
  params: Record<string, string | number | boolean>
): string {
  if (!baseUrl || typeof baseUrl !== "string") {
    return "";
  }

  try {
    const urlObj = new URL(baseUrl);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        urlObj.searchParams.set(key, String(value));
      }
    });

    return urlObj.toString();
  } catch {
    return baseUrl;
  }
}

/**
 * URL에서 특정 쿼리 파라미터 제거
 *
 * @param url - 원본 URL
 * @param paramNames - 제거할 파라미터 이름들
 * @returns 파라미터가 제거된 URL
 *
 * @example
 * ```typescript
 * removeQueryParams("https://example.com?name=test&age=25&city=seoul", ["age"]);
 * // "https://example.com?name=test&city=seoul"
 * ```
 */
export function removeQueryParams(
  url: string,
  paramNames: string[]
): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  try {
    const urlObj = new URL(url);

    paramNames.forEach(paramName => {
      urlObj.searchParams.delete(paramName);
    });

    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * URL 경로에서 세그먼트 추출
 *
 * @param url - 파싱할 URL
 * @returns 경로 세그먼트 배열
 *
 * @example
 * ```typescript
 * getPathSegments("https://example.com/api/users/123");
 * // ["api", "users", "123"]
 * ```
 */
export function getPathSegments(url: string): string[] {
  if (!url || typeof url !== "string") {
    return [];
  }

  try {
    const urlObj = new URL(url);
    return urlObj.pathname
      .split("/")
      .filter(segment => segment.length > 0);
  } catch {
    return [];
  }
}

/**
 * URL 경로에 세그먼트 추가
 *
 * @param baseUrl - 기본 URL
 * @param segments - 추가할 경로 세그먼트들
 * @returns 경로가 추가된 URL
 *
 * @example
 * ```typescript
 * addPathSegments("https://example.com", ["api", "users"]);
 * // "https://example.com/api/users"
 * ```
 */
export function addPathSegments(
  baseUrl: string,
  segments: string[]
): string {
  if (!baseUrl || typeof baseUrl !== "string") {
    return "";
  }

  try {
    const urlObj = new URL(baseUrl);
    
    // 기존 경로에 새 세그먼트 추가
    const currentPath = urlObj.pathname.endsWith("/") 
      ? urlObj.pathname.slice(0, -1) 
      : urlObj.pathname;
    
    const newPath = currentPath + "/" + segments.join("/");
    urlObj.pathname = newPath;

    return urlObj.toString();
  } catch {
    return baseUrl;
  }
}

/**
 * URL에서 도메인 추출
 *
 * @param url - 파싱할 URL
 * @returns 도메인 문자열
 *
 * @example
 * ```typescript
 * getDomain("https://api.example.com:8080/path");
 * // "api.example.com"
 * ```
 */
export function getDomain(url: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return "";
  }
}

/**
 * URL에서 프로토콜 추출
 *
 * @param url - 파싱할 URL
 * @returns 프로토콜 문자열 (콜론 제외)
 *
 * @example
 * ```typescript
 * getProtocol("https://example.com");
 * // "https"
 * ```
 */
export function getProtocol(url: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  try {
    const urlObj = new URL(url);
    return urlObj.protocol.slice(0, -1); // 콜론 제거
  } catch {
    return "";
  }
}

/**
 * URL에서 포트 번호 추출
 *
 * @param url - 파싱할 URL
 * @returns 포트 번호 (기본 포트는 빈 문자열)
 *
 * @example
 * ```typescript
 * getPort("https://example.com:8080");
 * // "8080"
 * getPort("https://example.com");
 * // ""
 * ```
 */
export function getPort(url: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  try {
    const urlObj = new URL(url);
    return urlObj.port;
  } catch {
    return "";
  }
}

/**
 * 상대 URL을 절대 URL로 변환
 *
 * @param relativeUrl - 상대 URL
 * @param baseUrl - 기준 URL
 * @returns 절대 URL
 *
 * @example
 * ```typescript
 * resolveUrl("/api/users", "https://example.com");
 * // "https://example.com/api/users"
 * ```
 */
export function resolveUrl(relativeUrl: string, baseUrl: string): string {
  if (!relativeUrl || !baseUrl) {
    return "";
  }

  try {
    return new URL(relativeUrl, baseUrl).toString();
  } catch {
    return "";
  }
}

/**
 * URL에서 해시(#) 부분 제거
 *
 * @param url - 원본 URL
 * @returns 해시가 제거된 URL
 *
 * @example
 * ```typescript
 * removeHash("https://example.com/page#section");
 * // "https://example.com/page"
 * ```
 */
export function removeHash(url: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  const hashIndex = url.indexOf("#");
  return hashIndex !== -1 ? url.substring(0, hashIndex) : url;
}

/**
 * URL에서 쿼리 스트링 제거
 *
 * @param url - 원본 URL
 * @returns 쿼리 스트링이 제거된 URL
 *
 * @example
 * ```typescript
 * removeQueryString("https://example.com/page?param=value");
 * // "https://example.com/page"
 * ```
 */
export function removeQueryString(url: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  const queryIndex = url.indexOf("?");
  return queryIndex !== -1 ? url.substring(0, queryIndex) : url;
}

/**
 * URL 정규화 (슬래시 정리, 인코딩 등)
 *
 * @param url - 정규화할 URL
 * @returns 정규화된 URL
 *
 * @example
 * ```typescript
 * normalizeUrl("https://example.com//path//to//resource");
 * // "https://example.com/path/to/resource"
 * ```
 */
export function normalizeUrl(url: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  try {
    const urlObj = new URL(url);
    
    // 경로에서 연속된 슬래시 제거
    urlObj.pathname = urlObj.pathname.replace(/\/+/g, "/");
    
    // 마지막 슬래시 제거 (루트 경로 제외)
    if (urlObj.pathname.length > 1 && urlObj.pathname.endsWith("/")) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }

    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * URL이 같은 도메인인지 확인
 *
 * @param url1 - 첫 번째 URL
 * @param url2 - 두 번째 URL
 * @returns 같은 도메인인지 여부
 *
 * @example
 * ```typescript
 * isSameDomain("https://example.com/page1", "https://example.com/page2");
 * // true
 * ```
 */
export function isSameDomain(url1: string, url2: string): boolean {
  if (!url1 || !url2) {
    return false;
  }

  try {
    const domain1 = getDomain(url1);
    const domain2 = getDomain(url2);
    return domain1 === domain2 && domain1 !== "";
  } catch {
    return false;
  }
}

/**
 * URL에서 파일 확장자 추출
 *
 * @param url - 파싱할 URL
 * @returns 파일 확장자 (점 제외)
 *
 * @example
 * ```typescript
 * getFileExtension("https://example.com/image.jpg");
 * // "jpg"
 * ```
 */
export function getFileExtension(url: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const lastDotIndex = pathname.lastIndexOf(".");
    
    if (lastDotIndex === -1 || lastDotIndex === pathname.length - 1) {
      return "";
    }

    return pathname.substring(lastDotIndex + 1).toLowerCase();
  } catch {
    return "";
  }
}
