"use client";
/**
 * Select 컴포넌트
 * 
 * @description
 * - 단일/다중 선택을 지원하는 셀렉트 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <Select
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
 * 셀렉트 컴포넌트 스타일 variants 정의
 */
const selectVariants = cva(
  // 기본 스타일
  'flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input',
        error: 'border-error-500 focus:ring-error-200',
        success: 'border-success-500 focus:ring-success-200',
        warning: 'border-warning-500 focus:ring-warning-200',
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
 * 셀렉트 옵션 타입 정의
 */
export interface SelectOption {
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
   * 옵션 그룹
   */
  group?: string;
}

/**
 * Select 컴포넌트 Props 타입 정의
 */
export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'size'>,
    VariantProps<typeof selectVariants> {
  /**
   * 셀렉트 옵션들
   */
  options: SelectOption[];
  
  /**
   * 선택된 값
   */
  value?: string | number | readonly string[];
  
  /**
   * 값 변경 핸들러
   */
  onChange?: (value: string | number | string[] | number[]) => void;
  
  /**
   * 다중 선택 여부
   * @default false
   */
  multiple?: boolean;
  
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
   * 플레이스홀더 텍스트
   */
  placeholder?: string;
  
  /**
   * 검색 가능 여부
   * @default false
   */
  searchable?: boolean;
  
  /**
   * 검색 플레이스홀더
   */
  searchPlaceholder?: string;
  
  /**
   * 선택 전체 너비 사용 여부
   * @default true
   */
  fullWidth?: boolean;
}

/**
 * Select 컴포넌트
 * 
 * @param props - Select 컴포넌트 props
 * @returns JSX.Element
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      options,
      value,
      onChange,
      multiple = false,
      variant,
      size,
      error,
      success,
      warning,
      helperText,
      label,
      required = false,
      placeholder,
      searchable = false,
      searchPlaceholder = '검색...',
      fullWidth,
      id,
      ...props
    },
    ref
  ) => {
    // 고유 ID 생성 (id가 없을 경우)
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    
    // 상태에 따른 variant 결정
    const selectVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
    
    // 도움말 텍스트 결정
    const messageText = error || success || warning || helperText;
    
    // 값 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (multiple) {
        const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
        onChange?.(selectedValues);
      } else {
        onChange?.(e.target.value);
      }
    };
    
    // 옵션 그룹핑
    const groupedOptions = options.reduce((groups, option) => {
      const group = option.group || 'default';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(option);
      return groups;
    }, {} as Record<string, SelectOption[]>);
    
    return (
      <div className={cn('space-y-1', fullWidth ? 'w-full' : 'w-auto')}>
        {/* 라벨 */}
        {label && (
          <label
            htmlFor={selectId}
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
        
        {/* 셀렉트 컨테이너 */}
        <div className="relative">
          {/* 검색 입력 (검색 가능한 경우) */}
          {searchable && (
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="mb-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          )}
          
          {/* 셀렉트 필드 */}
          <select
            id={selectId}
            multiple={multiple}
            value={value}
            onChange={handleChange}
            className={cn(
              selectVariants({
                variant: selectVariant,
                size,
                fullWidth,
                className,
              })
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={
              messageText ? `${selectId}-message` : undefined
            }
            {...props}
          >
            {/* 플레이스홀더 */}
            {placeholder && !multiple && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            
            {/* 옵션들 */}
            {Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
              <React.Fragment key={groupName}>
                {groupName !== 'default' && (
                  <optgroup label={groupName}>
                    {groupOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                )}
                {groupName === 'default' && (
                  groupOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </option>
                  ))
                )}
              </React.Fragment>
            ))}
          </select>
          
          {/* 드롭다운 아이콘 */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="h-4 w-4 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        
        {/* 메시지 텍스트 */}
        {messageText && (
          <p
            id={`${selectId}-message`}
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

Select.displayName = 'Select';

export { Select, selectVariants };
