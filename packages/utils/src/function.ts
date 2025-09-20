/**
 * 함수 관련 유틸리티 함수들
 *
 * @description
 * - 함수 실행 제어, 최적화, 래핑 등의 기능을 제공
 * - 성능 최적화를 위한 디바운스, 스로틀링 구현
 * - SRP: 각 함수는 특정 함수 제어 작업만 담당
 */

/**
 * 디바운스 함수
 *
 * @param func - 실행할 함수
 * @param delay - 지연 시간 (밀리초)
 * @returns 디바운스된 함수
 *
 * @description
 * - 연속된 호출을 지연시켜 마지막 호출만 실행
 * - 검색 입력, API 호출 최적화에 유용
 * - 메모리 누수 방지를 위한 자동 정리 기능
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   searchAPI(query);
 * }, 300);
 * 
 * // 연속 호출 시 마지막 호출만 실행
 * debouncedSearch("a");
 * debouncedSearch("ab");
 * debouncedSearch("abc"); // 이것만 실행됨
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    // 이전 타이머 취소
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // 새로운 타이머 설정
    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * 스로틀링 함수
 *
 * @param func - 실행할 함수
 * @param limit - 제한 시간 (밀리초)
 * @returns 스로틀링된 함수
 *
 * @description
 * - 지정된 시간 간격으로만 함수 실행 허용
 * - 스크롤 이벤트, 리사이즈 이벤트 최적화에 유용
 * - 마지막 호출이 실행되도록 보장
 *
 * @example
 * ```typescript
 * const throttledScroll = throttle((event: Event) => {
 *   handleScroll(event);
 * }, 100);
 * 
 * window.addEventListener('scroll', throttledScroll);
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    lastArgs = args;

    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
        // 마지막 호출이 있다면 실행
        if (lastArgs) {
          func.apply(this, lastArgs);
          lastArgs = null;
        }
      }, limit);
    }
  };
}

/**
 * 함수 실행 시간 측정
 *
 * @param func - 측정할 함수
 * @param label - 측정 라벨
 * @returns 실행 시간과 결과를 포함한 객체
 *
 * @description
 * - 함수 실행 시간을 측정하고 콘솔에 출력
 * - 성능 프로파일링에 유용
 * - 개발 환경에서만 동작
 *
 * @example
 * ```typescript
 * const result = measureTime(() => {
 *   return expensiveCalculation();
 * }, "Expensive Calculation");
 * 
 * console.log(result.duration); // 실행 시간 (ms)
 * console.log(result.result); // 함수 결과
 * ```
 */
export function measureTime<T>(
  func: () => T,
  label: string = "Function"
): { result: T; duration: number } {
  const start = performance.now();
  const result = func();
  const end = performance.now();
  const duration = end - start;

  if (process.env.NODE_ENV === "development") {
    console.log(`${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * 비동기 함수 실행 시간 측정
 *
 * @param func - 측정할 비동기 함수
 * @param label - 측정 라벨
 * @returns 실행 시간과 결과를 포함한 Promise
 *
 * @example
 * ```typescript
 * const result = await measureTimeAsync(async () => {
 *   return await fetchData();
 * }, "API Call");
 * ```
 */
export async function measureTimeAsync<T>(
  func: () => Promise<T>,
  label: string = "Async Function"
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await func();
  const end = performance.now();
  const duration = end - start;

  if (process.env.NODE_ENV === "development") {
    console.log(`${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * 함수 재시도 로직
 *
 * @param func - 재시도할 함수
 * @param maxAttempts - 최대 시도 횟수
 * @param delay - 재시도 간격 (밀리초)
 * @returns 재시도 로직이 적용된 함수
 *
 * @description
 * - 함수 실행 실패 시 지정된 횟수만큼 재시도
 * - 네트워크 요청, 데이터베이스 연결에 유용
 * - 지수 백오프 지원
 *
 * @example
 * ```typescript
 * const retryableFetch = retry(
 *   () => fetch('/api/data'),
 *   3, // 최대 3번 시도
 *   1000 // 1초 간격
 * );
 * ```
 */
export function retry<T extends (...args: any[]) => Promise<any>>(
  func: T,
  maxAttempts: number = 3,
  delay: number = 1000
): T {
  return (async (...args: Parameters<T>) => {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await func(...args);
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxAttempts) {
          throw lastError;
        }

        // 지수 백오프: 시도할수록 대기 시간 증가
        const backoffDelay = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }

    throw lastError!;
  }) as T;
}

/**
 * 함수 메모이제이션
 *
 * @param func - 메모이제이션할 함수
 * @param keyGenerator - 캐시 키 생성 함수
 * @returns 메모이제이션된 함수
 *
 * @description
 * - 동일한 입력에 대해 결과를 캐시하여 성능 향상
 * - 순수 함수에만 적용 가능
 * - 메모리 사용량 주의 필요
 *
 * @example
 * ```typescript
 * const memoizedExpensiveCalculation = memoize(
 *   (n: number) => {
 *     // 비용이 큰 계산
 *     return fibonacci(n);
 *   },
 *   (n: number) => n.toString()
 * );
 * ```
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator 
      ? keyGenerator(...args)
      : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * 함수 실행 제한 (Rate Limiting)
 *
 * @param func - 제한할 함수
 * @param maxCalls - 최대 호출 횟수
 * @param timeWindow - 시간 윈도우 (밀리초)
 * @returns 제한된 함수
 *
 * @description
 * - 지정된 시간 내에 최대 호출 횟수를 제한
 * - API 호출 제한, 스팸 방지에 유용
 * - 슬라이딩 윈도우 방식 사용
 *
 * @example
 * ```typescript
 * const rateLimitedAPI = rateLimit(
 *   () => apiCall(),
 *   10, // 최대 10번
 *   60000 // 1분 내
 * );
 * ```
 */
export function rateLimit<T extends (...args: any[]) => any>(
  func: T,
  maxCalls: number,
  timeWindow: number
): T {
  const calls: number[] = [];

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    
    // 시간 윈도우 밖의 호출 기록 제거
    while (calls.length > 0 && calls[0] <= now - timeWindow) {
      calls.shift();
    }

    // 호출 횟수 제한 확인
    if (calls.length >= maxCalls) {
      throw new Error(`Rate limit exceeded: ${maxCalls} calls per ${timeWindow}ms`);
    }

    // 호출 기록 추가
    calls.push(now);
    
    return func(...args);
  }) as T;
}

/**
 * 함수 실행 결과 캐싱
 *
 * @param func - 캐싱할 함수
 * @param ttl - 캐시 수명 (밀리초)
 * @returns 캐싱된 함수
 *
 * @description
 * - 함수 실행 결과를 지정된 시간 동안 캐시
 * - TTL(Time To Live) 기반 캐시 무효화
 * - 메모리 사용량 자동 관리
 *
 * @example
 * ```typescript
 * const cachedAPI = cache(
 *   () => fetchData(),
 *   300000 // 5분
 * );
 * ```
 */
export function cache<T extends (...args: any[]) => any>(
  func: T,
  ttl: number = 60000
): T {
  const cache = new Map<string, { result: ReturnType<T>; expiry: number }>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    const now = Date.now();

    // 캐시된 결과 확인
    const cached = cache.get(key);
    if (cached && cached.expiry > now) {
      return cached.result;
    }

    // 함수 실행 및 캐시 저장
    const result = func(...args);
    cache.set(key, {
      result,
      expiry: now + ttl
    });

    // 만료된 캐시 정리
    for (const [k, v] of cache.entries()) {
      if (v.expiry <= now) {
        cache.delete(k);
      }
    }

    return result;
  }) as T;
}
