/**
 * Switch 컴포넌트
 * 
 * @description
 * - 토글 스위치 입력을 지원하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <Switch
 *   checked={checked}
 *   onCheckedChange={handleChange}
 *   label="알림 받기"
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Switch 컴포넌트 스타일 variants 정의
 */
const switchVariants = cva(
  // 기본 스타일
  'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        primary: 'data-[state=checked]:bg-primary-500 data-[state=unchecked]:bg-gray-200',
        success: 'data-[state=checked]:bg-success-500 data-[state=unchecked]:bg-gray-200',
        warning: 'data-[state=checked]:bg-warning-500 data-[state=unchecked]:bg-gray-200',
        error: 'data-[state=checked]:bg-error-500 data-[state=unchecked]:bg-gray-200',
      },
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

/**
 * Switch 컴포넌트 Props 타입 정의
 */
export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'size'>,
    VariantProps<typeof switchVariants> {
  /**
   * 스위치 라벨
   */
  label?: string;
  
  /**
   * 체크 상태
   */
  checked?: boolean;
  
  /**
   * 체크 상태 변경 핸들러
   */
  onCheckedChange?: (checked: boolean) => void;
  
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
   * 스위치 전체 너비 사용 여부
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
 * Switch 컴포넌트
 * 
 * @param props - Switch 컴포넌트 props
 * @returns JSX.Element
 */
const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      label,
      checked = false,
      onCheckedChange,
      variant,
      size,
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
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;
    
    // 상태에 따른 variant 결정
    const switchVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
    
    // 도움말 텍스트 결정
    const messageText = error || success || warning || helperText;
    
    // 체크 상태 변경 핸들러
    const handleClick = () => {
      onCheckedChange?.(!checked);
    };
    
    return (
      <div className={cn(
        'flex items-center gap-3',
        labelPosition === 'left' && 'flex-row-reverse',
        fullWidth && 'w-full'
      )}>
        {/* 라벨 */}
        {label && (
          <label
            htmlFor={switchId}
            className={cn(
              'text-sm font-medium leading-none cursor-pointer select-none',
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
        
        {/* 스위치 버튼 */}
        <button
          id={switchId}
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={handleClick}
          className={cn(
            switchVariants({
              variant: switchVariant,
              size,
              className,
            })
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={
            messageText ? `${switchId}-message` : undefined
          }
          {...props}
        >
          {/* 스위치 썸 */}
          <span
            className={cn(
              'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
              checked ? 'translate-x-5' : 'translate-x-0',
              size === 'sm' && 'h-4 w-4',
              size === 'lg' && 'h-6 w-6'
            )}
          />
        </button>
        
        {/* 메시지 텍스트 */}
        {messageText && (
          <p
            id={`${switchId}-message`}
            className={cn(
              'text-xs mt-1',
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

Switch.displayName = 'Switch';

export { Switch, switchVariants };
export type { SwitchProps };
