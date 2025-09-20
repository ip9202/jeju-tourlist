/**
 * Avatar 컴포넌트
 * 
 * @description
 * - 사용자 프로필 이미지와 이니셜을 표시하는 아바타 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <Avatar
 *   src="/user-avatar.jpg"
 *   alt="사용자 이름"
 *   fallback="김"
 *   size="md"
 * />
 * ```
 */

import React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * 아바타 컴포넌트 스타일 variants 정의
 */
const avatarVariants = cva(
  // 기본 스타일
  'relative flex shrink-0 overflow-hidden rounded-full bg-muted',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
        '3xl': 'h-24 w-24 text-3xl',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-lg',
      },
      status: {
        online: 'ring-2 ring-success-500',
        offline: 'ring-2 ring-muted-foreground',
        away: 'ring-2 ring-warning-500',
        busy: 'ring-2 ring-error-500',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  }
);

/**
 * 아바타 배지 스타일 variants 정의
 */
const avatarBadgeVariants = cva(
  'absolute bottom-0 right-0 rounded-full border-2 border-background',
  {
    variants: {
      size: {
        xs: 'h-2 w-2',
        sm: 'h-2.5 w-2.5',
        md: 'h-3 w-3',
        lg: 'h-4 w-4',
        xl: 'h-5 w-5',
        '2xl': 'h-6 w-6',
        '3xl': 'h-8 w-8',
      },
      color: {
        success: 'bg-success-500',
        warning: 'bg-warning-500',
        error: 'bg-error-500',
        info: 'bg-info-500',
        muted: 'bg-muted-foreground',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'success',
    },
  }
);

/**
 * Avatar 컴포넌트 Props 타입 정의
 */
export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  /**
   * 아바타 이미지 URL
   */
  src?: string;
  
  /**
   * 이미지 대체 텍스트
   */
  alt?: string;
  
  /**
   * 이미지 로드 실패 시 표시할 텍스트
   */
  fallback?: string;
  
  /**
   * 사용자 이름 (접근성용)
   */
  name?: string;
  
  /**
   * 배지 표시 여부
   * @default false
   */
  showBadge?: boolean;
  
  /**
   * 배지 색상
   */
  badgeColor?: VariantProps<typeof avatarBadgeVariants>['color'];
  
  /**
   * 상태 표시 여부
   */
  status?: VariantProps<typeof avatarVariants>['status'];
  
  /**
   * 클릭 가능 여부
   * @default false
   */
  clickable?: boolean;
  
  /**
   * 로딩 상태
   * @default false
   */
  loading?: boolean;
}

/**
 * Avatar 컴포넌트
 * 
 * @param props - Avatar 컴포넌트 props
 * @returns JSX.Element
 */
const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt,
      fallback,
      name,
      size,
      shape,
      status,
      showBadge = false,
      badgeColor,
      clickable = false,
      loading = false,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);
    const [, setImageLoading] = React.useState(!!src);
    
    // 이미지 로드 핸들러
    const handleImageLoad = () => {
      setImageLoading(false);
      setImageError(false);
    };
    
    // 이미지 에러 핸들러
    const handleImageError = () => {
      setImageLoading(false);
      setImageError(true);
    };
    
    // 이니셜 생성 함수
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };
    
    // 표시할 내용 결정
    const shouldShowImage = src && !imageError && !loading;
    const shouldShowFallback = !shouldShowImage && (fallback || name);
    
    return (
      <div
        ref={ref}
        className={cn(
          avatarVariants({
            size,
            shape,
            status,
            className,
          }),
          clickable && 'cursor-pointer hover:opacity-80 transition-opacity',
          loading && 'animate-pulse'
        )}
        role={clickable ? 'button' : 'img'}
        aria-label={name ? `${name}의 아바타` : '아바타'}
        tabIndex={clickable ? 0 : undefined}
        {...props}
      >
        {/* 이미지 */}
        {shouldShowImage && (
          <img
            src={src}
            alt={alt || name || '아바타'}
            className="h-full w-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}
        
        {/* 로딩 스피너 */}
        {loading && (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-1/2 w-1/2 animate-spin text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
        
        {/* 폴백 텍스트 */}
        {shouldShowFallback && (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            <span className="font-medium">
              {fallback || (name ? getInitials(name) : '?')}
            </span>
          </div>
        )}
        
        {/* 상태 배지 */}
        {status && (
          <div
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-background',
              status === 'online' && 'h-3 w-3 bg-success-500',
              status === 'offline' && 'h-3 w-3 bg-muted-foreground',
              status === 'away' && 'h-3 w-3 bg-warning-500',
              status === 'busy' && 'h-3 w-3 bg-error-500'
            )}
            aria-label={`상태: ${status}`}
          />
        )}
        
        {/* 커스텀 배지 */}
        {showBadge && !status && (
          <div
            className={cn(
              avatarBadgeVariants({
                size,
                color: badgeColor,
              })
            )}
            aria-label="배지"
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// AvatarImage 컴포넌트
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

// AvatarFallback 컴포넌트
const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback, avatarVariants, avatarBadgeVariants };
