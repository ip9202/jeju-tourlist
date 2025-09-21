/**
 * 성능 최적화 유틸리티 함수들
 *
 * @description
 * - 프론트엔드 성능 최적화를 위한 유틸리티 함수들
 * - 이미지 최적화, 지연 로딩, 메모이제이션 등
 * - SRP: 각 함수는 특정 성능 최적화 작업만 담당
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from "react";

/**
 * 이미지 지연 로딩 훅
 *
 * @param src - 이미지 소스 URL
 * @param options - 로딩 옵션
 * @returns 이미지 로딩 상태와 ref
 *
 * @description
 * - Intersection Observer를 사용한 이미지 지연 로딩
 * - 뷰포트에 들어올 때만 이미지 로드
 * - 메모리 사용량 최적화
 *
 * @example
 * ```typescript
 * const { imgRef, isLoaded, isInView } = useLazyImage("/image.jpg");
 * 
 * return (
 *   <div ref={imgRef}>
 *     {isInView && <img src={isLoaded ? "/image.jpg" : "/placeholder.jpg"} />}
 *   </div>
 * );
 * ```
 */
export function useLazyImage(
  src: string,
  options: {
    rootMargin?: string;
    threshold?: number;
  } = {}
) {
  const imgRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: options.rootMargin || "50px",
        threshold: options.threshold || 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [options.rootMargin, options.threshold]);

  useEffect(() => {
    if (isInView && !isLoaded) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.src = src;
    }
  }, [isInView, isLoaded, src]);

  return { imgRef, isLoaded, isInView };
}

/**
 * 디바운스된 검색 훅
 *
 * @param searchFn - 검색 함수
 * @param delay - 지연 시간 (밀리초)
 * @returns 디바운스된 검색 함수와 로딩 상태
 *
 * @description
 * - 검색 입력 최적화를 위한 디바운스 적용
 * - 불필요한 API 호출 방지
 * - 사용자 경험 향상
 *
 * @example
 * ```typescript
 * const { debouncedSearch, isLoading } = useDebouncedSearch(
 *   (query: string) => searchAPI(query),
 *   300
 * );
 * 
 * const handleInputChange = (e) => {
 *   debouncedSearch(e.target.value);
 * };
 * ```
 */
export function useDebouncedSearch<T extends (...args: any[]) => any>(
  searchFn: T,
  delay: number = 300
) {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedSearch = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setIsLoading(true);
      timeoutRef.current = setTimeout(async () => {
        try {
          await searchFn(...args);
        } finally {
          setIsLoading(false);
        }
      }, delay);
    },
    [searchFn, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { debouncedSearch, isLoading };
}

/**
 * 가상화된 리스트 훅
 *
 * @param items - 리스트 아이템들
 * @param itemHeight - 각 아이템의 높이
 * @param containerHeight - 컨테이너 높이
 * @returns 가상화된 리스트 데이터
 *
 * @description
 * - 대용량 리스트 렌더링 최적화
 * - 화면에 보이는 아이템만 렌더링
 * - 스크롤 성능 향상
 *
 * @example
 * ```typescript
 * const { visibleItems, totalHeight, offsetY } = useVirtualList(
 *   items,
 *   50, // 아이템 높이
 *   400 // 컨테이너 높이
 * );
 * ```
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex: visibleRange.startIndex,
  };
}

/**
 * 메모이제이션된 컴포넌트 래퍼
 *
 * @param Component - 래핑할 컴포넌트
 * @param propsAreEqual - props 비교 함수
 * @returns 메모이제이션된 컴포넌트
 *
 * @description
 * - React.memo의 고급 사용법
 * - 불필요한 리렌더링 방지
 * - 성능 최적화
 *
 * @example
 * ```typescript
 * const MemoizedComponent = withMemo(MyComponent, (prevProps, nextProps) => {
 *   return prevProps.id === nextProps.id && prevProps.name === nextProps.name;
 * });
 * ```
 */
export function withMemo<T extends React.ComponentType<any>>(
  Component: T,
  propsAreEqual?: (prevProps: Readonly<React.ComponentProps<T>>, nextProps: Readonly<React.ComponentProps<T>>) => boolean
) {
  return React.memo(Component, propsAreEqual);
}

/**
 * 이미지 최적화 함수
 *
 * @param src - 원본 이미지 URL
 * @param options - 최적화 옵션
 * @returns 최적화된 이미지 URL
 *
 * @description
 * - Next.js Image 컴포넌트 최적화
 * - WebP 포맷 지원
 * - 반응형 이미지 생성
 *
 * @example
 * ```typescript
 * const optimizedSrc = optimizeImage("/image.jpg", {
 *   width: 800,
 *   height: 600,
 *   quality: 80,
 *   format: "webp"
 * });
 * ```
 */
export function optimizeImage(
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "jpeg" | "png";
  } = {}
) {
  const { width, height, quality = 75, format = "webp" } = options;
  
  // Next.js Image Optimization API 사용
  const params = new URLSearchParams();
  
  if (width) params.set("w", width.toString());
  if (height) params.set("h", height.toString());
  params.set("q", quality.toString());
  params.set("f", format);
  
  return `/api/image?src=${encodeURIComponent(src)}&${params.toString()}`;
}

/**
 * 번들 크기 분석 함수
 *
 * @param componentName - 컴포넌트 이름
 * @returns 번들 크기 정보
 *
 * @description
 * - 컴포넌트별 번들 크기 분석
 * - 성능 모니터링
 * - 최적화 가이드 제공
 *
 * @example
 * ```typescript
 * const bundleSize = analyzeBundleSize("QuestionCard");
 * console.log(`QuestionCard bundle size: ${bundleSize.size} bytes`);
 * ```
 */
export function analyzeBundleSize(componentName: string) {
  if (typeof window === "undefined") {
    return { size: 0, gzippedSize: 0 };
  }

  // Webpack Bundle Analyzer 데이터 사용
  const bundleData = (window as any).__BUNDLE_ANALYZER_DATA__;
  if (!bundleData) {
    return { size: 0, gzippedSize: 0 };
  }

  const componentData = bundleData.find((item: any) => 
    item.name.includes(componentName)
  );

  return {
    size: componentData?.size || 0,
    gzippedSize: componentData?.gzippedSize || 0,
  };
}

/**
 * 성능 메트릭 수집 훅
 *
 * @param componentName - 컴포넌트 이름
 * @returns 성능 메트릭
 *
 * @description
 * - 컴포넌트 렌더링 성능 측정
 * - Core Web Vitals 수집
 * - 성능 모니터링
 *
 * @example
 * ```typescript
 * const { measureRender, measureInteraction } = usePerformanceMetrics("QuestionCard");
 * 
 * const handleClick = () => {
 *   measureInteraction("click");
 *   // 클릭 처리 로직
 * };
 * ```
 */
export function usePerformanceMetrics(componentName: string) {
  const measureRender = useCallback(() => {
    if (typeof window !== "undefined" && "performance" in window) {
      const start = performance.now();
      
      return () => {
        const end = performance.now();
        const duration = end - start;
        
        // 성능 데이터 전송 (예: 분석 서비스)
        if (duration > 16) { // 60fps 기준
          console.warn(`${componentName} render took ${duration.toFixed(2)}ms`);
        }
      };
    }
    return () => {};
  }, [componentName]);

  const measureInteraction = useCallback((interactionName: string) => {
    if (typeof window !== "undefined" && "performance" in window) {
      const start = performance.now();
      
      return () => {
        const end = performance.now();
        const duration = end - start;
        
        // 상호작용 성능 데이터 전송
        console.log(`${componentName} ${interactionName} took ${duration.toFixed(2)}ms`);
      };
    }
    return () => {};
  }, [componentName]);

  return { measureRender, measureInteraction };
}

/**
 * 캐시 관리 훅
 *
 * @param key - 캐시 키
 * @param fetcher - 데이터 페처 함수
 * @param ttl - 캐시 수명 (밀리초)
 * @returns 캐시된 데이터와 관리 함수들
 *
 * @description
 * - 클라이언트 사이드 캐싱
 * - API 호출 최적화
 * - 메모리 사용량 관리
 *
 * @example
 * ```typescript
 * const { data, isLoading, refetch, clearCache } = useCache(
 *   "questions",
 *   () => fetchQuestions(),
 *   300000 // 5분
 * );
 * ```
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300000
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const getCachedData = useCallback(() => {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    return null;
  }, [key, ttl]);

  const setCachedData = useCallback((newData: T) => {
    cacheRef.current.set(key, {
      data: newData,
      timestamp: Date.now(),
    });
  }, [key]);

  const fetchData = useCallback(async () => {
    const cached = getCachedData();
    if (cached) {
      setData(cached);
      return cached;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      setCachedData(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, getCachedData, setCachedData]);

  const refetch = useCallback(() => {
    cacheRef.current.delete(key);
    return fetchData();
  }, [key, fetchData]);

  const clearCache = useCallback(() => {
    cacheRef.current.delete(key);
    setData(null);
  }, [key]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch,
    clearCache,
  };
}
