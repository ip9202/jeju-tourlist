/**
 * Link 컴포넌트
 * 
 * @description
 * - 내부/외부 링크를 지원하는 링크 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <Link href="/about" variant="primary">
 *   내부 링크
 * </Link>
 * <Link href="https://example.com" external>
 *   외부 링크
 * </Link>
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * 링크 컴포넌트 스타일 variants 정의
 */
const linkVariants = cva(
  // 기본 스타일
  'inline-flex items-center gap-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'text-primary hover:text-primary/80 underline-offset-4 hover:underline',
        primary: 'text-primary-500 hover:text-primary-600 underline-offset-4 hover:underline',
        secondary: 'text-secondary-500 hover:text-secondary-600 underline-offset-4 hover:underline',
        muted: 'text-muted-foreground hover:text-foreground underline-offset-4 hover:underline',
        destructive: 'text-destructive hover:text-destructive/80 underline-offset-4 hover:underline',
        success: 'text-success-500 hover:text-success-600 underline-offset-4 hover:underline',
        warning: 'text-warning-500 hover:text-warning-600 underline-offset-4 hover:underline',
        error: 'text-error-500 hover:text-error-600 underline-offset-4 hover:underline',
        info: 'text-info-500 hover:text-info-600 underline-offset-4 hover:underline',
        ghost: 'hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2',
        button: 'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2',
      },
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
      weight: {
        thin: 'font-thin',
        extralight: 'font-extralight',
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
        extrabold: 'font-extrabold',
        black: 'font-black',
      },
      decoration: {
        none: 'no-underline',
        underline: 'underline',
        'line-through': 'line-through',
        overline: 'overline',
      },
      external: {
        true: '',
        false: '',
      },
      disabled: {
        true: 'pointer-events-none opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      weight: 'normal',
      decoration: 'none',
      external: false,
      disabled: false,
    },
  }
);

/**
 * Link 컴포넌트 Props 타입 정의
 */
export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  /**
   * 링크 URL
   */
  href: string;
  
  /**
   * 외부 링크 여부
   * @default false
   */
  external?: boolean;
  
  /**
   * 링크 내용
   */
  children: React.ReactNode;
  
  /**
   * 접근성을 위한 라벨
   */
  'aria-label'?: string;
  
  /**
   * 접근성을 위한 숨김 처리
   * @default false
   */
  'aria-hidden'?: boolean;
  
  /**
   * 새 탭에서 열기 여부 (외부 링크인 경우)
   * @default true
   */
  openInNewTab?: boolean;
  
  /**
   * 링크 비활성화 여부
   * @default false
   */
  disabled?: boolean;
}

/**
 * Link 컴포넌트
 * 
 * @param props - Link 컴포넌트 props
 * @returns JSX.Element
 */
const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      className,
      href,
      variant,
      size,
      weight,
      decoration,
      external = false,
      disabled = false,
      openInNewTab = true,
      children,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden = false,
      ...props
    },
    ref
  ) => {
    // 외부 링크인지 확인
    const isExternal = external || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');
    
    // 외부 링크인 경우 새 탭에서 열기 설정
    const target = isExternal && openInNewTab ? '_blank' : undefined;
    const rel = isExternal && openInNewTab ? 'noopener noreferrer' : undefined;
    
    // 비활성화된 경우 클릭 이벤트 방지
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    return (
      <a
        ref={ref}
        href={disabled ? undefined : href}
        target={target}
        rel={rel}
        className={cn(
          linkVariants({
            variant,
            size,
            weight,
            decoration,
            external: isExternal,
            disabled,
            className,
          })
        )}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden}
        aria-disabled={disabled}
        onClick={handleClick}
        {...props}
      >
        {children}
        
        {/* 외부 링크 아이콘 */}
        {isExternal && (
          <svg
            className="h-3 w-3"
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
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        )}
      </a>
    );
  }
);

Link.displayName = 'Link';

export { Link, linkVariants };
