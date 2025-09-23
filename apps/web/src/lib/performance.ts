import { useCallback, useEffect, useRef, useState } from "react"

/**
 * 성능 최적화를 위한 유틸리티 함수들
 * 
 * SOLID 원칙 적용:
 * - Single Responsibility: 각 함수는 특정 성능 최적화 기능만 담당
 * - Open/Closed: 새로운 최적화 전략 추가 가능
 * - Liskov Substitution: 다양한 최적화 방법과 호환 가능
 * - Interface Segregation: 필요한 최적화 기능만 노출
 * - Dependency Inversion: 외부 성능 모니터링 도구와 통합 가능
 */

/**
 * 디바운스 함수
 * 연속된 호출을 제한하여 성능을 최적화
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 쓰로틀 함수
 * 일정 시간 간격으로만 함수 실행을 허용
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * 지연 로딩을 위한 Intersection Observer 훅
 */
interface UseLazyImageOptions {
  rootMargin?: string
  threshold?: number
}

export function useLazyImage(
  src: string,
  options: UseLazyImageOptions = {}
) {
  const [isInView, setIsInView] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = imgRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: options.rootMargin || "50px",
        threshold: options.threshold || 0.1,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [src, options.rootMargin, options.threshold])

  return {
    imgRef,
    isInView,
    isLoaded,
    setIsLoaded,
  }
}

/**
 * 이미지 최적화 함수
 */
interface OptimizeImageOptions {
  width?: number
  height?: number
  quality?: number
  format?: "webp" | "avif" | "jpeg" | "png"
}

export function optimizeImage(
  src: string,
  options: OptimizeImageOptions = {}
): string {
  // Next.js Image Optimization을 사용하는 경우
  if (src.startsWith("/") || src.includes(process.env.NEXT_PUBLIC_BASE_URL || "")) {
    const params = new URLSearchParams()
    
    if (options.width) params.set("w", options.width.toString())
    if (options.height) params.set("h", options.height.toString())
    if (options.quality) params.set("q", options.quality.toString())
    if (options.format) params.set("f", options.format)
    
    const queryString = params.toString()
    return queryString ? `${src}?${queryString}` : src
  }

  // 외부 이미지의 경우 원본 반환
  return src
}

/**
 * 메모이제이션을 위한 커스텀 훅
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps)
}

/**
 * 가상 스크롤링을 위한 계산 함수
 */
export interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function calculateVirtualScroll(
  scrollTop: number,
  options: VirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options
  
  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + overscan,
    Math.ceil(scrollTop / itemHeight) + Math.ceil(containerHeight / itemHeight) + overscan
  )
  
  return {
    start: Math.max(0, visibleStart - overscan),
    end: visibleEnd,
    offsetY: visibleStart * itemHeight,
  }
}

/**
 * 번들 크기 분석을 위한 함수
 */
export function analyzeBundleSize() {
  if (typeof window === "undefined") return null

  const performance = window.performance
  if (!performance || !performance.getEntriesByType) return null

  const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[]
  const scripts = resources.filter(resource => 
    resource.name.includes(".js") && 
    !resource.name.includes("node_modules")
  )

  const totalSize = scripts.reduce((total, script) => {
    return total + (script.transferSize || 0)
  }, 0)

  return {
    totalSize,
    scriptCount: scripts.length,
    scripts: scripts.map(script => ({
      name: script.name,
      size: script.transferSize || 0,
      loadTime: script.duration,
    })),
  }
}

/**
 * 성능 메트릭 수집
 */
export function collectPerformanceMetrics() {
  if (typeof window === "undefined") return null

  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
  const paint = performance.getEntriesByType("paint")

  const fcp = paint.find(entry => entry.name === "first-contentful-paint")
  const lcp = paint.find(entry => entry.name === "largest-contentful-paint")

  return {
    // 로딩 시간
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    
    // 페인트 메트릭
    firstContentfulPaint: fcp ? fcp.startTime : null,
    largestContentfulPaint: lcp ? lcp.startTime : null,
    
    // 네트워크 메트릭
    dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcpConnection: navigation.connectEnd - navigation.connectStart,
    request: navigation.responseEnd - navigation.requestStart,
    response: navigation.responseEnd - navigation.responseStart,
  }
}

/**
 * 메모리 사용량 모니터링
 */
export function getMemoryUsage() {
  if (typeof window === "undefined" || !(window as any).performance?.memory) {
    return null
  }

  const memory = (window as any).performance.memory
  
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
  }
}

/**
 * 이미지 프리로딩
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/**
 * 리소스 프리로딩
 */
export function preloadResource(
  href: string,
  as: "script" | "style" | "image" | "font" | "fetch"
): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.href = href
    link.as = as
    
    link.onload = () => resolve()
    link.onerror = reject
    
    document.head.appendChild(link)
  })
}

/**
 * 성능 최적화를 위한 컴포넌트 래퍼
 */
export function withPerformanceOptimization<T extends object>(
  Component: React.ComponentType<T>
) {
  return React.memo(Component)
}