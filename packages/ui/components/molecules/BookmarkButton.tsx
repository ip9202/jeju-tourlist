/**
 * BookmarkButton 컴포넌트
 * 
 * @description
 * - 북마크 버튼을 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <BookmarkButton
 *   bookmarked={false}
 *   onBookmark={handleBookmark}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
// // import { Button } from '../atoms';

/**
 * 북마크 버튼 컴포넌트 스타일 variants 정의
 */
const bookmarkButtonVariants = cva(
  // 기본 스타일
  'inline-flex items-center gap-1 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground hover:text-warning-500',
        bookmarked: 'text-warning-500',
        outline: 'border border-input hover:border-warning-500 hover:text-warning-500',
        ghost: 'hover:bg-warning-50 hover:text-warning-500',
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
 * BookmarkButton 컴포넌트 Props 타입 정의
 */
export interface BookmarkButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof bookmarkButtonVariants> {
  /**
   * 북마크 상태
   * @default false
   */
  bookmarked?: boolean;
  
  /**
   * 북마크 토글 핸들러
   */
  onBookmark?: (bookmarked: boolean) => void;
  
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
 * BookmarkButton 컴포넌트
 * 
 * @param props - BookmarkButton 컴포넌트 props
 * @returns JSX.Element
 */
const BookmarkButton = React.forwardRef<HTMLButtonElement, BookmarkButtonProps>(
  (
    {
      className,
      bookmarked = false,
      onBookmark,
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
    
    // 북마크 토글 핸들러
    const handleBookmark = () => {
      if (disabled || loading) return;
      
      // 애니메이션 효과
      if (animated) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
      
      onBookmark?.(!bookmarked);
    };
    
    // 북마크 아이콘
    const BookmarkIcon = () => (
      <svg
        className={cn(
          'h-4 w-4 transition-transform duration-200',
          isAnimating && 'scale-125',
          bookmarked && 'fill-current'
        )}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        fill={bookmarked ? 'currentColor' : 'none'}
        aria-hidden="true"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </svg>
    );
    
    return (
      <button
        ref={ref}
        className={cn(
          bookmarkButtonVariants({
            variant: bookmarked ? 'bookmarked' : variant,
            size,
            fullWidth,
            className,
          }),
          disabled && 'opacity-50 cursor-not-allowed',
          loading && 'opacity-50 cursor-not-allowed'
        )}
        onClick={handleBookmark}
        disabled={disabled || loading}
        aria-label={ariaLabel || (bookmarked ? '북마크 취소' : '북마크')}
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
          <BookmarkIcon />
        )}
      </button>
    );
  }
);

BookmarkButton.displayName = 'BookmarkButton';

export { BookmarkButton, bookmarkButtonVariants };
