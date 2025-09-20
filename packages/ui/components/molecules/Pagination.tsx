/**
 * Pagination 컴포넌트
 * 
 * @description
 * - 페이지네이션을 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={handlePageChange}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
// import { Button } from '../atoms';

/**
 * 페이지네이션 컴포넌트 스타일 variants 정의
 */
const paginationVariants = cva(
  // 기본 스타일
  'flex items-center justify-center space-x-1',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
      variant: {
        default: 'space-x-1',
        compact: 'space-x-0.5',
        spaced: 'space-x-2',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

/**
 * 페이지네이션 버튼 스타일 variants 정의
 */
const paginationButtonVariants = cva(
  // 기본 스타일
  'inline-flex items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-9 w-9 text-sm',
        lg: 'h-10 w-10 text-base',
      },
      variant: {
        default: 'border-input',
        active: 'bg-primary text-primary-foreground hover:bg-primary/90',
        disabled: 'opacity-50 cursor-not-allowed',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

/**
 * Pagination 컴포넌트 Props 타입 정의
 */
export interface PaginationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof paginationVariants> {
  /**
   * 현재 페이지
   */
  currentPage: number;
  
  /**
   * 전체 페이지 수
   */
  totalPages: number;
  
  /**
   * 페이지 변경 핸들러
   */
  onPageChange: (page: number) => void;
  
  /**
   * 표시할 페이지 수 (현재 페이지 기준)
   * @default 5
   */
  visiblePages?: number;
  
  /**
   * 이전/다음 버튼 표시 여부
   * @default true
   */
  showPrevNext?: boolean;
  
  /**
   * 첫 페이지/마지막 페이지 버튼 표시 여부
   * @default false
   */
  showFirstLast?: boolean;
  
  /**
   * 페이지 번호 표시 여부
   * @default true
   */
  showPageNumbers?: boolean;
  
  /**
   * 이전 버튼 텍스트
   * @default "이전"
   */
  prevText?: string;
  
  /**
   * 다음 버튼 텍스트
   * @default "다음"
   */
  nextText?: string;
  
  /**
   * 첫 페이지 버튼 텍스트
   * @default "첫 페이지"
   */
  firstText?: string;
  
  /**
   * 마지막 페이지 버튼 텍스트
   * @default "마지막 페이지"
   */
  lastText?: string;
  
  /**
   * 비활성화 여부
   * @default false
   */
  disabled?: boolean;
  
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
 * Pagination 컴포넌트
 * 
 * @param props - Pagination 컴포넌트 props
 * @returns JSX.Element
 */
const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      className,
      currentPage,
      totalPages,
      onPageChange,
      visiblePages = 5,
      showPrevNext = true,
      showFirstLast = false,
      showPageNumbers = true,
      prevText = '이전',
      nextText = '다음',
      firstText = '첫 페이지',
      lastText = '마지막 페이지',
      disabled = false,
      size,
      variant,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden = false,
      ...props
    },
    ref
  ) => {
    // 표시할 페이지 번호들 계산
    const visiblePageNumbers = React.useMemo(() => {
      if (!showPageNumbers) return [];
      
      const pages: number[] = [];
      const halfVisible = Math.floor(visiblePages / 2);
      
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, currentPage + halfVisible);
      
      // 시작 페이지가 1에 가까우면 끝 페이지를 조정
      if (startPage <= halfVisible) {
        endPage = Math.min(totalPages, visiblePages);
      }
      
      // 끝 페이지가 마지막 페이지에 가까우면 시작 페이지를 조정
      if (endPage >= totalPages - halfVisible) {
        startPage = Math.max(1, totalPages - visiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      return pages;
    }, [currentPage, totalPages, visiblePages, showPageNumbers]);
    
    // 이전 페이지로 이동
    const handlePrev = () => {
      if (disabled || currentPage <= 1) return;
      onPageChange(currentPage - 1);
    };
    
    // 다음 페이지로 이동
    const handleNext = () => {
      if (disabled || currentPage >= totalPages) return;
      onPageChange(currentPage + 1);
    };
    
    // 첫 페이지로 이동
    const handleFirst = () => {
      if (disabled || currentPage <= 1) return;
      onPageChange(1);
    };
    
    // 마지막 페이지로 이동
    const handleLast = () => {
      if (disabled || currentPage >= totalPages) return;
      onPageChange(totalPages);
    };
    
    // 특정 페이지로 이동
    const handlePage = (page: number) => {
      if (disabled || page === currentPage) return;
      onPageChange(page);
    };
    
    // 이전 아이콘
    const PrevIcon = () => (
      <svg
        className="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    );
    
    // 다음 아이콘
    const NextIcon = () => (
      <svg
        className="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5l7 7-7 7"
        />
      </svg>
    );
    
    // 첫 페이지 아이콘
    const FirstIcon = () => (
      <svg
        className="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
        />
      </svg>
    );
    
    // 마지막 페이지 아이콘
    const LastIcon = () => (
      <svg
        className="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 5l7 7-7 7M5 5l7 7-7 7"
        />
      </svg>
    );
    
    if (totalPages <= 1) return null;
    
    return (
      <nav
        ref={ref}
        className={cn(
          paginationVariants({
            size,
            variant,
            className,
          })
        )}
        aria-label={ariaLabel || '페이지네이션'}
        aria-hidden={ariaHidden}
        {...props}
      >
        {/* 첫 페이지 버튼 */}
        {showFirstLast && (
          <button
            onClick={handleFirst}
            disabled={disabled || currentPage <= 1}
            className={cn(
              paginationButtonVariants({
                size,
                variant: disabled || currentPage <= 1 ? 'disabled' : 'default',
              })
            )}
            aria-label={firstText}
          >
            <FirstIcon />
          </button>
        )}
        
        {/* 이전 버튼 */}
        {showPrevNext && (
          <button
            onClick={handlePrev}
            disabled={disabled || currentPage <= 1}
            className={cn(
              paginationButtonVariants({
                size,
                variant: disabled || currentPage <= 1 ? 'disabled' : 'default',
              })
            )}
            aria-label={prevText}
          >
            <PrevIcon />
          </button>
        )}
        
        {/* 페이지 번호들 */}
        {showPageNumbers && (
          <>
            {visiblePageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => handlePage(page)}
                disabled={disabled}
                className={cn(
                  paginationButtonVariants({
                    size,
                    variant: page === currentPage ? 'active' : 'default',
                  })
                )}
                aria-label={`페이지 ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
          </>
        )}
        
        {/* 다음 버튼 */}
        {showPrevNext && (
          <button
            onClick={handleNext}
            disabled={disabled || currentPage >= totalPages}
            className={cn(
              paginationButtonVariants({
                size,
                variant: disabled || currentPage >= totalPages ? 'disabled' : 'default',
              })
            )}
            aria-label={nextText}
          >
            <NextIcon />
          </button>
        )}
        
        {/* 마지막 페이지 버튼 */}
        {showFirstLast && (
          <button
            onClick={handleLast}
            disabled={disabled || currentPage >= totalPages}
            className={cn(
              paginationButtonVariants({
                size,
                variant: disabled || currentPage >= totalPages ? 'disabled' : 'default',
              })
            )}
            aria-label={lastText}
          >
            <LastIcon />
          </button>
        )}
      </nav>
    );
  }
);

Pagination.displayName = 'Pagination';

export { Pagination, paginationVariants, paginationButtonVariants };
