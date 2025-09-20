/**
 * Code 컴포넌트
 * 
 * @description
 * - 인라인/블록 코드를 표시하는 코드 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <Code variant="inline">const name = 'John';</Code>
 * <Code variant="block" language="javascript">
 *   function greet(name) {
 *     return `Hello, ${name}!`;
 *   }
 * </Code>
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * 코드 컴포넌트 스타일 variants 정의
 */
const codeVariants = cva(
  // 기본 스타일
  'font-mono text-sm',
  {
    variants: {
      variant: {
        inline: 'bg-muted px-1.5 py-0.5 rounded text-sm',
        block: 'block w-full p-4 rounded-lg text-sm overflow-x-auto',
      },
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
      color: {
        default: 'text-foreground',
        muted: 'text-muted-foreground',
        primary: 'text-primary-500',
        secondary: 'text-secondary-500',
        success: 'text-success-500',
        warning: 'text-warning-500',
        error: 'text-error-500',
        info: 'text-info-500',
      },
      background: {
        default: 'bg-muted',
        primary: 'bg-primary-50 text-primary-700',
        secondary: 'bg-secondary-50 text-secondary-700',
        success: 'bg-success-50 text-success-700',
        warning: 'bg-warning-50 text-warning-700',
        error: 'bg-error-50 text-error-700',
        info: 'bg-info-50 text-info-700',
      },
      border: {
        none: 'border-0',
        default: 'border border-border',
        primary: 'border border-primary-200',
        secondary: 'border border-secondary-200',
        success: 'border border-success-200',
        warning: 'border border-warning-200',
        error: 'border border-error-200',
        info: 'border border-info-200',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
      },
      shadow: {
        none: 'shadow-none',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
      },
    },
    defaultVariants: {
      variant: 'inline',
      size: 'sm',
      color: 'default',
      background: 'default',
      border: 'none',
      rounded: 'md',
      shadow: 'none',
    },
  }
);

/**
 * Code 컴포넌트 Props 타입 정의
 */
export interface CodeProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof codeVariants> {
  /**
   * 코드 내용
   */
  children: React.ReactNode;
  
  /**
   * 프로그래밍 언어 (블록 코드인 경우)
   */
  language?: string;
  
  /**
   * 코드 복사 가능 여부
   * @default false
   */
  copyable?: boolean;
  
  /**
   * 복사 성공 시 표시할 메시지
   * @default "코드가 복사되었습니다"
   */
  copyMessage?: string;
  
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
 * Code 컴포넌트
 * 
 * @param props - Code 컴포넌트 props
 * @returns JSX.Element
 */
const Code = React.forwardRef<HTMLElement, CodeProps>(
  (
    {
      className,
      variant,
      size,
      color,
      background,
      border,
      rounded,
      shadow,
      language,
      copyable = false,
      copyMessage = '코드가 복사되었습니다',
      children,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden = false,
      ...props
    },
    ref
  ) => {
    const [copied, setCopied] = React.useState(false);
    
    // 코드 복사 함수
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(children?.toString() || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('코드 복사 실패:', error);
      }
    };
    
    // 인라인 코드인 경우
    if (variant === 'inline') {
      return (
        <code
          ref={ref}
          className={cn(
            codeVariants({
              variant,
              size,
              color: color as 'default' | 'secondary' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'muted',
              background,
              border,
              rounded,
              shadow,
              className,
            })
          )}
          aria-label={ariaLabel}
          aria-hidden={ariaHidden}
          {...props}
        >
          {children}
        </code>
      );
    }
    
    // 블록 코드인 경우
    return (
      <div className="relative group">
        <pre
          ref={ref as React.Ref<HTMLElement>}
          className={cn(
            codeVariants({
              variant,
              size,
              color: color as 'default' | 'secondary' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'muted',
              background,
              border,
              rounded,
              shadow,
              className,
            })
          )}
          aria-label={ariaLabel}
          aria-hidden={ariaHidden}
          {...props}
        >
          <code className={language ? `language-${language}` : ''}>
            {children}
          </code>
        </pre>
        
        {/* 복사 버튼 */}
        {copyable && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
            aria-label="코드 복사"
            title={copied ? copyMessage : '코드 복사'}
          >
            {copied ? (
              <svg
                className="h-4 w-4 text-success-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>
        )}
        
        {/* 언어 표시 */}
        {language && (
          <div className="absolute top-2 left-2 px-2 py-1 text-xs text-muted-foreground bg-muted rounded">
            {language}
          </div>
        )}
      </div>
    );
  }
);

Code.displayName = 'Code';

export { Code, codeVariants };
