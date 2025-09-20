/**
 * LikeButton 컴포넌트
 * 
 * @description
 * - 좋아요 버튼을 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <LikeButton
 *   liked={false}
 *   count={42}
 *   onLike={handleLike}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
// // import { Button } from '../atoms';

/**
 * 좋아요 버튼 컴포넌트 스타일 variants 정의
 */
const likeButtonVariants = cva(
  // 기본 스타일
  'inline-flex items-center gap-1 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground hover:text-error-500',
        liked: 'text-error-500',
        outline: 'border border-input hover:border-error-500 hover:text-error-500',
        ghost: 'hover:bg-error-50 hover:text-error-500',
      },
      size: {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2',
      },
      fullWidth: {
        true: 'w-full justify-center',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      fullWidth: false,
    },
  }
);

/**
 * LikeButton 컴포넌트 Props 타입 정의
 */
export interface LikeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof likeButtonVariants> {
  /**
   * 좋아요 상태
   * @default false
   */
  liked?: boolean;
  
  /**
   * 좋아요 개수
   * @default 0
   */
  count?: number;
  
  /**
   * 좋아요 토글 핸들러
   */
  onLike?: (liked: boolean) => void;
  
  /**
   * 애니메이션 효과 여부
   * @default true
   */
  animated?: boolean;
  
  /**
   * 비활성화 여부
   * @default false
   */
  disabled?: boolean;
  
  /**
   * 로딩 상태
   * @default false
   */
  loading?: boolean;
  
  /**
   * 접근성을 위한 라벨
   */
  'aria-label'?: string;
  
  /**
   * 접근성을 위한 숨김 처리
   * @default false
   */
  'aria-hidden'?: boolean;
}

/**
 * LikeButton 컴포넌트
 * 
 * @param props - LikeButton 컴포넌트 props
 * @returns JSX.Element
 */
const LikeButton = React.forwardRef<HTMLButtonElement, LikeButtonProps>(
  (
    {
      className,
      liked = false,
      count = 0,
      onLike,
      animated = true,
      disabled = false,
      loading = false,
      variant,
      size,
      fullWidth,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden = false,
      ...props
    },
    ref
  ) => {
    const [isAnimating, setIsAnimating] = React.useState(false);
    
    // 좋아요 토글 핸들러
    const handleLike = () => {
      if (disabled || loading) return;
      
      // 애니메이션 효과
      if (animated) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
      
      onLike?.(!liked);
    };
    
    // 좋아요 아이콘
    const LikeIcon = () => (
      <svg
        className={cn(
          'h-4 w-4 transition-transform duration-200',
          isAnimating && 'scale-125',
          liked && 'fill-current'
        )}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        fill={liked ? 'currentColor' : 'none'}
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
    
    return (
      <button
        ref={ref}
        className={cn(
          likeButtonVariants({
            variant: liked ? 'liked' : variant,
            size,
            fullWidth,
            className,
          }),
          disabled && 'opacity-50 cursor-not-allowed',
          loading && 'opacity-50 cursor-not-allowed'
        )}
        onClick={handleLike}
        disabled={disabled || loading}
        aria-label={ariaLabel || (liked ? '좋아요 취소' : '좋아요')}
        aria-hidden={ariaHidden}
        {...props}
      >
        {loading ? (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
        ) : (
          <LikeIcon />
        )}
        
        {count > 0 && (
          <span className="ml-1 font-medium">
            {count.toLocaleString()}
          </span>
        )}
      </button>
    );
  }
);

LikeButton.displayName = 'LikeButton';

export { LikeButton, likeButtonVariants };
