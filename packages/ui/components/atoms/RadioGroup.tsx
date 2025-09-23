"use client";
/**
 * RadioGroup 컴포넌트
 * 
 * @description
 * - 라디오 버튼 그룹을 지원하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <RadioGroup
 *   options={[
 *     { value: 'option1', label: '옵션 1' },
 *     { value: 'option2', label: '옵션 2' }
 *   ]}
 *   value={value}
 *   onChange={handleChange}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * 라디오 그룹 컴포넌트 스타일 variants 정의
 */
const radioGroupVariants = cva(
  // 기본 스타일
  'space-y-2',
  {
    variants: {
      orientation: {
        vertical: 'space-y-2',
        horizontal: 'flex flex-row space-x-4 space-y-0',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      orientation: 'vertical',
      size: 'md',
      fullWidth: false,
    },
  }
);

/**
 * 라디오 버튼 스타일 variants 정의
 */
const radioVariants = cva(
  // 기본 스타일
  'peer h-4 w-4 shrink-0 rounded-full border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
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
 * 라디오 옵션 타입 정의
 */
export interface RadioOption {
  /**
   * 옵션 값
   */
  value: string | number;
  
  /**
   * 옵션 라벨
   */
  label: string;
  
  /**
   * 옵션 비활성화 여부
   * @default false
   */
  disabled?: boolean;
  
  /**
   * 옵션 설명
   */
  description?: string;
}

/**
 * RadioGroup 컴포넌트 Props 타입 정의
 */
export interface RadioGroupProps
  extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange'>,
    VariantProps<typeof radioGroupVariants> {
  /**
   * 라디오 옵션들
   */
  options: RadioOption[];
  
  /**
   * 선택된 값
   */
  value?: string | number;
  
  /**
   * 값 변경 핸들러
   */
  onChange?: (value: string | number) => void;
  
  /**
   * 그룹 이름
   */
  name: string;
  
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
   * 라디오 그룹 전체 너비 사용 여부
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * RadioGroup 컴포넌트
 * 
 * @param props - RadioGroup 컴포넌트 props
 * @returns JSX.Element
 */
const RadioGroup = React.forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  (
    {
      className,
      options,
      value,
      onChange,
      name,
      orientation,
      size,
      error,
      success,
      warning,
      helperText,
      label,
      required = false,
      fullWidth,
      ...props
    },
    ref
  ) => {
    // 상태에 따른 variant 결정
    const radioVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : 'default';
    
    // 도움말 텍스트 결정
    const messageText = error || success || warning || helperText;
    
    // 값 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };
    
    return (
      <fieldset
        ref={ref}
        className={cn(
          radioGroupVariants({
            orientation,
            size,
            fullWidth,
            className,
          })
        )}
        {...props}
      >
        {/* 그룹 라벨 */}
        {label && (
          <legend className="text-sm font-medium text-foreground mb-2">
            {label}
            {required && (
              <span className="ml-1 text-error-500" aria-label="필수 입력">
                *
              </span>
            )}
          </legend>
        )}
        
        {/* 라디오 옵션들 */}
        {options.map((option) => (
          <div
            key={option.value}
            className={cn(
              'flex items-start space-x-2',
              option.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="radio"
              id={`${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={handleChange}
              disabled={option.disabled}
              className={cn(
                radioVariants({
                  variant: radioVariant,
                  size,
                })
              )}
              aria-invalid={!!error}
              aria-describedby={
                messageText ? `${name}-message` : undefined
              }
            />
            
            <div className="flex-1">
              <label
                htmlFor={`${name}-${option.value}`}
                className={cn(
                  'text-sm font-medium leading-none cursor-pointer',
                  option.disabled && 'cursor-not-allowed',
                  error && 'text-error-500',
                  success && 'text-success-500',
                  warning && 'text-warning-500',
                  !error && !success && !warning && 'text-foreground'
                )}
              >
                {option.label}
              </label>
              
              {option.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {/* 메시지 텍스트 */}
        {messageText && (
          <p
            id={`${name}-message`}
            className={cn(
              'text-xs mt-2',
              error && 'text-error-500',
              success && 'text-success-500',
              warning && 'text-warning-500',
              !error && !success && !warning && 'text-muted-foreground'
            )}
          >
            {messageText}
          </p>
        )}
      </fieldset>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export { RadioGroup, radioGroupVariants, radioVariants };
