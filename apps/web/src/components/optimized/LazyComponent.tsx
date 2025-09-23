import * as React from "react"
import { cn } from "../../lib/utils"

interface LazyComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

/**
 * 지연 로딩 컴포넌트
 * Intersection Observer를 사용하여 뷰포트에 들어올 때만 렌더링
 * 
 * SOLID 원칙 적용:
 * - Single Responsibility: 지연 로딩 기능만 담당
 * - Open/Closed: 다양한 지연 로딩 전략 추가 가능
 * - Liskov Substitution: 일반 컴포넌트와 호환 가능
 * - Interface Segregation: 필요한 지연 로딩 옵션만 노출
 * - Dependency Inversion: 외부 Intersection Observer와 통합 가능
 */
export function LazyComponent({
  children,
  fallback = <div className="h-32 bg-muted animate-pulse rounded" />,
  className,
  threshold = 0.1,
  rootMargin = "50px",
  triggerOnce = true,
}: LazyComponentProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [hasBeenVisible, setHasBeenVisible] = React.useState(false)
  const elementRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            setHasBeenVisible(true)
            observer.disconnect()
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce])

  const shouldRender = triggerOnce ? hasBeenVisible : isVisible

  return (
    <div ref={elementRef} className={cn("w-full", className)}>
      {shouldRender ? children : fallback}
    </div>
  )
}

/**
 * 동적 import를 사용한 컴포넌트 지연 로딩
 */
interface DynamicComponentProps {
  importFunction: () => Promise<{ default: React.ComponentType<any> }>
  fallback?: React.ReactNode
  className?: string
  props?: Record<string, any>
}

export function DynamicComponent({
  importFunction,
  fallback = <div className="h-32 bg-muted animate-pulse rounded" />,
  className,
  props = {},
}: DynamicComponentProps) {
  const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    let isMounted = true

    const loadComponent = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const module = await importFunction()
        
        if (isMounted) {
          setComponent(() => module.default)
          setIsLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error)
          setIsLoading(false)
        }
      }
    }

    loadComponent()

    return () => {
      isMounted = false
    }
  }, [importFunction])

  if (error) {
    return (
      <div className={cn("p-4 border border-destructive rounded-md", className)}>
        <p className="text-destructive text-sm">
          컴포넌트를 로드하는 중 오류가 발생했습니다: {error.message}
        </p>
      </div>
    )
  }

  if (isLoading || !Component) {
    return <div className={className}>{fallback}</div>
  }

  return <Component {...props} className={className} />
}

/**
 * 가상화된 리스트 컴포넌트
 * 대량의 데이터를 효율적으로 렌더링
 */
interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  overscan?: number
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + overscan,
    items.length
  )
  const visibleItems = items.slice(visibleStart, visibleEnd)

  const totalHeight = items.length * itemHeight
  const offsetY = visibleStart * itemHeight

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleStart + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleStart + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
