/**
 * 가상화된 리스트 컴포넌트
 *
 * @description
 * - 대용량 리스트 렌더링 최적화를 위한 가상화 리스트
 * - 화면에 보이는 아이템만 렌더링하여 성능 향상
 * - SRP: 리스트 가상화와 렌더링만 담당
 */

import React, { useMemo, useCallback, useRef, useState } from "react";
import { calculateVirtualScroll } from "@/lib/performance";

interface VirtualListProps<T> {
  /** 리스트 아이템들 */
  items: T[];
  /** 각 아이템의 높이 (픽셀) */
  itemHeight: number;
  /** 컨테이너 높이 (픽셀) */
  containerHeight: number;
  /** 아이템 렌더링 함수 */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** 컨테이너 클래스명 */
  className?: string;
  /** 아이템 컨테이너 클래스명 */
  itemClassName?: string;
  /** 스크롤 이벤트 핸들러 */
  onScroll?: (scrollTop: number) => void;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 로딩 컴포넌트 */
  loadingComponent?: React.ReactNode;
  /** 빈 리스트 컴포넌트 */
  emptyComponent?: React.ReactNode;
  /** 오버스캔 아이템 수 (성능 최적화) */
  overscan?: number;
}

/**
 * 가상화된 리스트 컴포넌트
 *
 * @description
 * - 대용량 리스트를 효율적으로 렌더링
 * - 스크롤 성능 최적화
 * - 메모리 사용량 최적화
 *
 * @example
 * ```tsx
 * <VirtualList
 *   items={questions}
 *   itemHeight={120}
 *   containerHeight={600}
 *   renderItem={(question, index) => (
 *     <QuestionCard key={question.id} question={question} />
 *   )}
 *   isLoading={isLoading}
 *   loadingComponent={<LoadingSpinner />}
 *   emptyComponent={<EmptyState />}
 * />
 * ```
 */
export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = "",
  itemClassName = "",
  onScroll,
  isLoading = false,
  loadingComponent,
  emptyComponent,
  overscan = 5,
}: VirtualListProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // 가상화 계산
  const { start, end, offsetY } = calculateVirtualScroll(scrollTop, {
    itemHeight,
    containerHeight,
    overscan,
  });

  const visibleItems = useMemo(() => {
    return items.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
    }));
  }, [items, start, end]);

  const totalHeight = items.length * itemHeight;

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    },
    [onScroll]
  );

  // 스크롤 위치 복원 - 사용하지 않음
  // const restoreScrollPosition = useCallback((position: number) => {
  //   if (scrollRef.current) {
  //     scrollRef.current.scrollTop = position;
  //   }
  // }, []);

  // 스크롤 위치 저장 - 사용하지 않음
  // const saveScrollPosition = useCallback(() => {
  //   return scrollTop;
  // }, [scrollTop]);

  // 특정 아이템으로 스크롤 - 사용하지 않음
  // const scrollToItem = useCallback(
  //   (index: number) => {
  //     if (scrollRef.current) {
  //       const targetScrollTop = index * itemHeight;
  //       scrollRef.current.scrollTo({
  //         top: targetScrollTop,
  //         behavior: "smooth",
  //       });
  //     }
  //   },
  //   [itemHeight]
  // );

  // 빈 리스트 처리
  if (!isLoading && items.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        {emptyComponent || (
          <div className="text-center text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p>표시할 항목이 없습니다</p>
          </div>
        )}
      </div>
    );
  }

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        {loadingComponent || (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">로딩 중...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* 가상화된 컨테이너 */}
      <div
        style={{
          height: totalHeight,
          position: "relative",
        }}
      >
        {/* 가시 영역 아이템들 */}
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
              key={start + index}
              className={itemClassName}
              style={{
                height: itemHeight,
                minHeight: itemHeight,
              }}
            >
              {renderItem(item.item, start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 가상화된 리스트 훅
 *
 * @description
 * - 가상화 리스트의 상태와 메서드를 제공
 * - 스크롤 위치 관리, 아이템 찾기 등 유틸리티 기능
 *
 * @example
 * ```tsx
 * const {
 *   scrollToItem,
 *   getVisibleRange,
 *   isItemVisible,
 * } = useVirtualListUtils(items, itemHeight, containerHeight);
 * ```
 */
export function useVirtualListUtils<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = React.useState(0);

  // 가시 영역 계산
  const getVisibleRange = useCallback(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  // 특정 아이템이 가시 영역에 있는지 확인
  const isItemVisible = useCallback(
    (index: number) => {
      const { startIndex, endIndex } = getVisibleRange();
      return index >= startIndex && index < endIndex;
    },
    [getVisibleRange]
  );

  // 특정 아이템으로 스크롤
  const scrollToItem = useCallback(
    (index: number, containerRef: React.RefObject<HTMLDivElement>) => {
      if (containerRef.current) {
        const targetScrollTop = index * itemHeight;
        containerRef.current.scrollTo({
          top: targetScrollTop,
          behavior: "smooth",
        });
      }
    },
    [itemHeight]
  );

  // 아이템 찾기 (검색)
  const findItem = useCallback(
    (predicate: (item: T, index: number) => boolean) => {
      return items.findIndex(predicate);
    },
    [items]
  );

  // 스크롤 위치 업데이트
  const updateScrollTop = useCallback((newScrollTop: number) => {
    setScrollTop(newScrollTop);
  }, []);

  return {
    scrollTop,
    getVisibleRange,
    isItemVisible,
    scrollToItem,
    findItem,
    updateScrollTop,
  };
}

export default VirtualList;
