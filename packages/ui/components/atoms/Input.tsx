/**
 * Input 컴포넌트
 * 
 * @description
 * - 다양한 타입과 상태를 지원하는 입력 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <Input
 *   type="text"
 *   placeholder="이름을 입력하세요"
 *   value={value}
 *   onChange={handleChange}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * 입력 컴포넌트 스타일 variants 정의
 */
const inputVariants = cva(
  // 기본 스타일
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input',
        error: 'border-error-500 focus-visible:ring-error-200',
        success: 'border-success-500 focus-visible:ring-success-200',
        warning: 'border-warning-500 focus-visible:ring-warning-200',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-9 px-3 text-sm',
        lg: 'h-10 px-4 text-base',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      fullWidth: true,
    },
  }
);

/**
 * Input 컴포넌트 Props 타입 정의
 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * 에러 메시지
   */
  error?: string;
  
  /**
   * 성공 메시지
   */
  success?: string;
  
  /**
   * 경고 메시지
   */
  warning?: string;
  
  /**
   * 도움말 텍스트
   */
  helperText?: string;
  
  /**
   * 라벨 텍스트
   */
  label?: string;
  
  /**
   * 필수 입력 여부
   * @default false
   */
  required?: boolean;
  
  /**
   * 왼쪽에 표시할 아이콘
   */
  leftIcon?: React.ReactNode;
  
  /**
   * 오른쪽에 표시할 아이콘
   */
  rightIcon?: React.ReactNode;
  
  /**
   * 입력 전체 너비 사용 여부
   * @default true
   */
  fullWidth?: boolean;
}

/**
 * Input 컴포넌트
 * 
 * @param props - Input 컴포넌트 props
 * @returns JSX.Element
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      variant,
      size,
      error,
      success,
      warning,
      helperText,
      label,
      required = false,
      leftIcon,
      rightIcon,
      fullWidth,
      id,
      ...props
    },
    ref
  ) => {
    // 고유 ID 생성 (id가 없을 경우)
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    // 상태에 따른 variant 결정
    const inputVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
    
    // 도움말 텍스트 결정
    const messageText = error || success || warning || helperText;
    
    return (
      <div className={cn('space-y-1', fullWidth ? 'w-full' : 'w-auto')}>
        {/* 라벨 */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
            {required && (
              <span className="ml-1 text-error-500" aria-label="필수 입력">
                *
              </span>
            )}
          </label>
        )}
        
        {/* 입력 컨테이너 */}
        <div className="relative">
          {/* 왼쪽 아이콘 */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          {/* 입력 필드 */}
          <input
            id={inputId}
            type={type}
            className={cn(
              inputVariants({
                variant: inputVariant,
                size,
                fullWidth,
                className,
              }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10'
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={
              messageText ? `${inputId}-message` : undefined
            }
            {...props}
          />
          
          {/* 오른쪽 아이콘 */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        
        {/* 메시지 텍스트 */}
        {messageText && (
          <p
            id={`${inputId}-message`}
            className={cn(
              'text-xs',
              error && 'text-error-500',
              success && 'text-success-500',
              warning && 'text-warning-500',
              !error && !success && !warning && 'text-muted-foreground'
            )}
          >
            {messageText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
