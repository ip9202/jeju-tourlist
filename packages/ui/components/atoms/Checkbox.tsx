/**
 * Checkbox 컴포넌트
 * 
 * @description
 * - 체크박스 입력을 지원하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <Checkbox
 *   checked={checked}
 *   onChange={handleChange}
 *   label="동의합니다"
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * 체크박스 컴포넌트 스타일 variants 정의
 */
const checkboxVariants = cva(
  // 기본 스타일
  'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-primary',
        error: 'border-error-500 focus:ring-error-200',
        success: 'border-success-500 focus:ring-success-200',
        warning: 'border-warning-500 focus:ring-warning-200',
      },
      size: {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
      color: {
        default: 'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        primary: 'data-[state=checked]:bg-primary-500 data-[state=checked]:text-white',
        secondary: 'data-[state=checked]:bg-secondary-500 data-[state=checked]:text-white',
        success: 'data-[state=checked]:bg-success-500 data-[state=checked]:text-white',
        warning: 'data-[state=checked]:bg-warning-500 data-[state=checked]:text-white',
        error: 'data-[state=checked]:bg-error-500 data-[state=checked]:text-white',
        info: 'data-[state=checked]:bg-info-500 data-[state=checked]:text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      color: 'default',
    },
  }
);

/**
 * Checkbox 컴포넌트 Props 타입 정의
 */
export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'color'>,
    VariantProps<typeof checkboxVariants> {
  /**
   * 체크박스 라벨
   */
  label?: string;
  
  /**
   * 체크 상태
   */
  checked?: boolean;
  
  /**
   * 체크 상태 변경 핸들러
   */
  onChange?: (checked: boolean) => void;
  
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
   * 필수 입력 여부
   * @default false
   */
  required?: boolean;
  
  /**
   * 체크박스 전체 너비 사용 여부
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * 라벨 위치
   * @default "right"
   */
  labelPosition?: 'left' | 'right';
}

/**
 * Checkbox 컴포넌트
 * 
 * @param props - Checkbox 컴포넌트 props
 * @returns JSX.Element
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      checked,
      onChange,
      variant,
      size,
      color,
      error,
      success,
      warning,
      helperText,
      required = false,
      fullWidth = false,
      labelPosition = 'right',
      id,
      ...props
    },
    ref
  ) => {
    // 고유 ID 생성 (id가 없을 경우)
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    
    // 상태에 따른 variant 결정
    const checkboxVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
    
    // 도움말 텍스트 결정
    const messageText = error || success || warning || helperText;
    
    // 체크 상태 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };
    
    return (
      <div className={cn('space-y-1', fullWidth ? 'w-full' : 'w-auto')}>
        {/* 체크박스 컨테이너 */}
        <div className={cn(
          'flex items-center gap-2',
          labelPosition === 'left' && 'flex-row-reverse',
          fullWidth && 'w-full'
        )}>
          {/* 체크박스 입력 */}
          <input
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            className={cn(
              checkboxVariants({
                variant: checkboxVariant,
                size,
                color,
                className,
              })
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={
              messageText ? `${checkboxId}-message` : undefined
            }
            {...props}
          />
          
          {/* 라벨 */}
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                error && 'text-error-500',
                success && 'text-success-500',
                warning && 'text-warning-500',
                !error && !success && !warning && 'text-foreground'
              )}
            >
              {label}
              {required && (
                <span className="ml-1 text-error-500" aria-label="필수 입력">
                  *
                </span>
              )}
            </label>
          )}
        </div>
        
        {/* 메시지 텍스트 */}
        {messageText && (
          <p
            id={`${checkboxId}-message`}
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

Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxVariants };
