/**
 * 성능 최적화 컴포넌트들
 * 
 * @description
 * - 전문가 대시보드의 성능 최적화를 위한 컴포넌트들
 * - 이미지 최적화, 코드 스플리팅, 메모이제이션 적용
 * - 로딩 상태 및 스켈레톤 UI 구현
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

"use client";

import React, { memo, Suspense, lazy } from "react";
import Image from "next/image";
import { Expert } from "@/types/expert";
import { BadgeInfo } from "@/types/badge";
import { 
  Star, 
  MessageCircle, 
  TrendingUp, 
  Award,
  Loader2,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 최적화된 아바타 컴포넌트
 */
interface OptimizedAvatarProps {
  expert: Expert;
  size?: "sm" | "md" | "lg" | "xl";
  showRank?: boolean;
  className?: string;
}

export const OptimizedAvatar = memo<OptimizedAvatarProps>(({ 
  expert, 
  size = "md", 
  showRank = false,
  className = "" 
}) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: "w-8 h-8",
      md: "w-12 h-12",
      lg: "w-16 h-16",
      xl: "w-20 h-20",
    };
    return sizes[size];
  };

  const getRankBadgeClasses = () => {
    if (expert.rank <= 3) return "bg-yellow-500";
    if (expert.rank <= 10) return "bg-blue-500";
    return "bg-gray-500";
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        getSizeClasses(),
        "rounded-full bg-gray-100 flex items-center justify-center overflow-hidden"
      )}>
        {expert.avatar ? (
          <Image
            src={expert.avatar}
            alt={`${expert.name}의 프로필 이미지`}
            width={size === "sm" ? 32 : size === "md" ? 48 : size === "lg" ? 64 : 80}
            height={size === "sm" ? 32 : size === "md" ? 48 : size === "lg" ? 64 : 80}
            className="w-full h-full object-cover"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
            <User className="w-1/2 h-1/2" />
          </div>
        )}
      </div>
      {showRank && expert.rank <= 10 && (
        <div className={cn(
          "absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
          getRankBadgeClasses()
        )}>
          {expert.rank}
        </div>
      )}
    </div>
  );
});

OptimizedAvatar.displayName = "OptimizedAvatar";

/**
 * 스켈레톤 로딩 컴포넌트
 */
interface SkeletonProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular";
  width?: string | number;
  height?: string | number;
}

export const Skeleton = memo<SkeletonProps>(({ 
  className = "", 
  variant = "rectangular",
  width,
  height 
}) => {
  const baseClasses = "animate-pulse bg-gray-200";
  
  const variantClasses = {
    text: "h-4 rounded",
    rectangular: "rounded",
    circular: "rounded-full",
  };

  const style = {
    ...(width && { width: typeof width === "number" ? `${width}px` : width }),
    ...(height && { height: typeof height === "number" ? `${height}px` : height }),
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
});

Skeleton.displayName = "Skeleton";

/**
 * 전문가 카드 스켈레톤
 */
export const ExpertCardSkeleton = memo(() => (
  <div className="bg-white rounded-lg border border-gray-200 p-5">
    <div className="flex items-center space-x-3 mb-3">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <Skeleton width="60%" height={20} className="mb-2" />
        <Skeleton width="40%" height={16} />
      </div>
    </div>
    
    <div className="grid grid-cols-3 gap-3 mb-3">
      <div className="text-center">
        <Skeleton width="100%" height={16} className="mb-1" />
        <Skeleton width="60%" height={12} />
      </div>
      <div className="text-center">
        <Skeleton width="100%" height={16} className="mb-1" />
        <Skeleton width="60%" height={12} />
      </div>
      <div className="text-center">
        <Skeleton width="100%" height={16} className="mb-1" />
        <Skeleton width="60%" height={12} />
      </div>
    </div>
    
    <div className="flex space-x-2">
      <Skeleton width={60} height={24} className="rounded-full" />
      <Skeleton width={80} height={24} className="rounded-full" />
      <Skeleton width={70} height={24} className="rounded-full" />
    </div>
  </div>
));

ExpertCardSkeleton.displayName = "ExpertCardSkeleton";

/**
 * 전문가 리스트 아이템 스켈레톤
 */
export const ExpertListItemSkeleton = memo(() => (
  <div className="flex items-center space-x-4 p-4 border-b border-gray-100 last:border-b-0">
    <Skeleton variant="circular" width={48} height={48} />
    <div className="flex-1">
      <Skeleton width="40%" height={18} className="mb-2" />
      <Skeleton width="60%" height={14} className="mb-2" />
      <div className="flex space-x-4">
        <Skeleton width={40} height={14} />
        <Skeleton width={40} height={14} />
        <Skeleton width={40} height={14} />
      </div>
    </div>
    <div className="text-right">
      <Skeleton width={60} height={18} className="mb-1" />
      <Skeleton width={40} height={12} />
    </div>
  </div>
));

ExpertListItemSkeleton.displayName = "ExpertListItemSkeleton";

/**
 * 로딩 스피너 컴포넌트
 */
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const LoadingSpinner = memo<LoadingSpinnerProps>(({ 
  size = "md", 
  text = "로딩 중...",
  className = "" 
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <Loader2 className={cn("animate-spin text-blue-600", sizeClasses[size])} />
      {text && <span className="text-gray-600">{text}</span>}
    </div>
  );
});

LoadingSpinner.displayName = "LoadingSpinner";

/**
 * 가상화된 리스트 컴포넌트 (대용량 데이터용)
 */
interface VirtualizedListProps {
  items: Expert[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (expert: Expert, index: number) => React.ReactNode;
  className?: string;
}

export const VirtualizedList = memo<VirtualizedListProps>(({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = ""
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => 
            renderItem(item, visibleStart + index)
          )}
        </div>
      </div>
    </div>
  );
});

VirtualizedList.displayName = "VirtualizedList";

/**
 * 지연 로딩 컴포넌트
 */
interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export const LazyLoad = memo<LazyLoadProps>(({
  children,
  fallback = <LoadingSpinner />,
  threshold = 0.1,
  rootMargin = "50px"
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
});

LazyLoad.displayName = "LazyLoad";

/**
 * 메모이제이션된 전문가 카드
 */
interface MemoizedExpertCardProps {
  expert: Expert;
  onClick?: (expert: Expert) => void;
  variant?: "default" | "compact" | "detailed";
  showRank?: boolean;
  showBadges?: boolean;
  showStats?: boolean;
  className?: string;
}

export const MemoizedExpertCard = memo<MemoizedExpertCardProps>(({
  expert,
  onClick,
  variant = "default",
  showRank = true,
  showBadges = true,
  showStats = true,
  className = ""
}) => {
  const handleClick = React.useCallback(() => {
    onClick?.(expert);
  }, [expert, onClick]);

  // 기본 카드 렌더링 로직 (기존 ExpertCard와 동일)
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3 mb-3">
        <OptimizedAvatar expert={expert} size="md" showRank={showRank} />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{expert.name}</h3>
          <p className="text-sm text-gray-600">{expert.nickname}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            {expert.points.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">포인트</div>
        </div>
      </div>

      {showStats && (
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold text-gray-900">
                {expert.rating.toFixed(1)}
              </span>
            </div>
            <div className="text-xs text-gray-500">평점</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-gray-900">
                {expert.totalAnswers}
              </span>
            </div>
            <div className="text-xs text-gray-500">답변수</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-gray-900">
                {expert.adoptRate.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-500">채택률</div>
          </div>
        </div>
      )}

      {showBadges && expert.badges.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {expert.badges.slice(0, 3).map(badge => (
            <div
              key={badge.id}
              className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
            >
              <span>{badge.emoji}</span>
              <span className="text-gray-700">{badge.name}</span>
            </div>
          ))}
          {expert.badges.length > 3 && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
              <span className="text-gray-500">
                +{expert.badges.length - 3}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

MemoizedExpertCard.displayName = "MemoizedExpertCard";
