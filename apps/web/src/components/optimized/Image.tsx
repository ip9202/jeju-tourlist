/**
 * 최적화된 이미지 컴포넌트
 *
 * @description
 * - Next.js Image 컴포넌트를 래핑한 최적화된 이미지 컴포넌트
 * - 지연 로딩, WebP 지원, 반응형 이미지 등 성능 최적화 기능
 * - SRP: 이미지 렌더링과 최적화만 담당
 */

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useLazyImage, optimizeImage } from "@/lib/performance";

interface OptimizedImageProps {
  /** 이미지 소스 URL */
  src: string;
  /** 대체 텍스트 */
  alt: string;
  /** 이미지 너비 */
  width?: number;
  /** 이미지 높이 */
  height?: number;
  /** 반응형 크기 설정 */
  sizes?: string;
  /** 우선순위 로딩 여부 */
  priority?: boolean;
  /** 지연 로딩 여부 */
  lazy?: boolean;
  /** 플레이스홀더 이미지 */
  placeholder?: string;
  /** 로딩 중 표시할 컴포넌트 */
  loadingComponent?: React.ReactNode;
  /** 에러 발생 시 표시할 컴포넌트 */
  errorComponent?: React.ReactNode;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 스타일 객체 */
  style?: React.CSSProperties;
}

/**
 * 최적화된 이미지 컴포넌트
 *
 * @description
 * - 지연 로딩, WebP 지원, 반응형 이미지 등 성능 최적화 기능
 * - 에러 처리 및 로딩 상태 관리
 * - 접근성 고려
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="/images/hero.jpg"
 *   alt="Hero image"
 *   width={800}
 *   height={600}
 *   sizes="(max-width: 768px) 100vw, 50vw"
 *   lazy={true}
 *   placeholder="/images/placeholder.jpg"
 * />
 * ```
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  lazy = true,
  placeholder,
  loadingComponent,
  errorComponent,
  onClick,
  className,
  style,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 지연 로딩 훅 사용
  const { imgRef, isInView } = useLazyImage(src, {
    rootMargin: "50px",
    threshold: 0.1,
  });

  // 이미지 최적화
  const optimizedSrc = optimizeImage(src, {
    width,
    height,
    quality: 80,
    format: "webp",
  });

  // 이미지 로딩 완료 핸들러
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  // 이미지 로딩 에러 핸들러
  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // 클릭 핸들러
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  // 지연 로딩이 비활성화되었거나 뷰포트에 들어온 경우에만 이미지 렌더링
  const shouldRenderImage = !lazy || isInView;

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className || ""}`}
      style={style}
      onClick={handleClick}
    >
      {/* 로딩 중 표시 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          {loadingComponent || (
            <div className="animate-pulse bg-gray-200 rounded w-full h-full" />
          )}
        </div>
      )}

      {/* 에러 상태 표시 */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          {errorComponent || (
            <div className="text-gray-500 text-center">
              <svg
                className="w-8 h-8 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">이미지를 불러올 수 없습니다</p>
            </div>
          )}
        </div>
      )}

      {/* 이미지 렌더링 */}
      {shouldRenderImage && !hasError && (
        <Image
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
          }}
        />
      )}

      {/* 플레이스홀더 이미지 (지연 로딩 중) */}
      {!shouldRenderImage && placeholder && (
        <Image
          src={placeholder}
          alt=""
          width={width}
          height={height}
          className="opacity-50"
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
          }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
