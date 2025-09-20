/**
 * Textarea 컴포넌트
 * 
 * @description
 * - 재사용 가능한 텍스트 영역 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <Textarea
 *   placeholder="내용을 입력하세요"
 *   rows={4}
 *   value={value}
 *   onChange={handleChange}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Textarea 컴포넌트 스타일 variants 정의
 */
const textareaVariants = cva(
  // 기본 스타일
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input',
        error: 'border-error-500 focus-visible:ring-error-500',
        success: 'border-success-500 focus-visible:ring-success-500',
        warning: 'border-warning-500 focus-visible:ring-warning-500',
      },
      size: {
        sm: 'min-h-[60px] px-2 py-1 text-xs',
        md: 'min-h-[80px] px-3 py-2 text-sm',
        lg: 'min-h-[100px] px-4 py-3 text-base',
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
 * Textarea 컴포넌트 Props 타입 정의
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  /**
   * 에러 상태
   * @default false
   */
  error?: boolean;
  
  /**
   * 성공 상태
   * @default false
   */
  success?: boolean;
  
  /**
   * 경고 상태
   * @default false
   */
  warning?: boolean;
  
  /**
   * 도움말 텍스트
   */
  helperText?: string;
  
  /**
   * 에러 메시지
   */
  errorMessage?: string;
  
  /**
   * 성공 메시지
   */
  successMessage?: string;
  
  /**
   * 경고 메시지
   */
  warningMessage?: string;
  
  /**
   * 라벨
   */
  label?: string;
  
  /**
   * 필수 여부
   * @default false
   */
  required?: boolean;
  
  /**
   * 비활성화 여부
   * @default false
   */
  disabled?: boolean;
  
  /**
   * 읽기 전용 여부
   * @default false
   */
  readOnly?: boolean;
  
  /**
   * 자동 포커스 여부
   * @default false
   */
  autoFocus?: boolean;
  
  /**
   * 자동 완성 여부
   * @default true
   */
  autoComplete?: boolean;
  
  /**
   * 자동 수정 여부
   * @default true
   */
  autoCorrect?: boolean;
  
  /**
   * 자동 대문자 변환 여부
   * @default false
   */
  autoCapitalize?: boolean;
  
  /**
   * 맞춤법 검사 여부
   * @default true
   */
  spellCheck?: boolean;
  
  /**
   * 탭 인덱스
   */
  tabIndex?: number;
  
  /**
   * 접근성 라벨
   */
  'aria-label'?: string;
  
  /**
   * 접근성 설명
   */
  'aria-describedby'?: string;
  
  /**
   * 접근성 오류
   */
  'aria-invalid'?: boolean;
  
  /**
   * 접근성 필수
   */
  'aria-required'?: boolean;
  
  /**
   * 접근성 읽기 전용
   */
  'aria-readonly'?: boolean;
  
  /**
   * 접근성 비활성화
   */
  'aria-disabled'?: boolean;
}

/**
 * Textarea 컴포넌트
 * 
 * @param props - Textarea 컴포넌트 props
 * @returns JSX.Element
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      error,
      success,
      warning,
      helperText,
      errorMessage,
      successMessage,
      warningMessage,
      label,
      required,
      disabled,
      readOnly,
      autoFocus,
      autoComplete,
      autoCorrect,
      autoCapitalize,
      spellCheck,
      tabIndex,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,
      'aria-invalid': ariaInvalid,
      'aria-required': ariaRequired,
      'aria-readonly': ariaReadonly,
      'aria-disabled': ariaDisabled,
      ...props
    },
    ref
  ) => {
    // 상태에 따른 variant 결정
    const finalVariant = React.useMemo(() => {
      if (error || errorMessage) return 'error';
      if (success || successMessage) return 'success';
      if (warning || warningMessage) return 'warning';
      return variant || 'default';
    }, [error, success, warning, errorMessage, successMessage, warningMessage, variant]);
    
    // 도움말 텍스트 결정
    const finalHelperText = React.useMemo(() => {
      if (errorMessage) return errorMessage;
      if (successMessage) return successMessage;
      if (warningMessage) return warningMessage;
      return helperText;
    }, [errorMessage, successMessage, warningMessage, helperText]);
    
    // 접근성 속성들
    const accessibilityProps = React.useMemo(() => ({
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,
      'aria-invalid': ariaInvalid ?? (error || !!errorMessage),
      'aria-required': ariaRequired ?? required,
      'aria-readonly': ariaReadonly ?? readOnly,
      'aria-disabled': ariaDisabled ?? disabled,
    }), [
      ariaLabel,
      ariaDescribedby,
      ariaInvalid,
      error,
      errorMessage,
      ariaRequired,
      required,
      ariaReadonly,
      readOnly,
      ariaDisabled,
      disabled,
    ]);
    
    return (
      <div className={cn('w-full', !fullWidth && 'w-auto')}>
        {/* 라벨 */}
        {label && (
          <label className="mb-2 block text-sm font-medium text-foreground">
            {label}
            {required && <span className="ml-1 text-error-500">*</span>}
          </label>
        )}
        
        {/* Textarea */}
        <textarea
          ref={ref}
          className={cn(
            textareaVariants({
              variant: finalVariant,
              size,
              fullWidth,
              className,
            })
          )}
          disabled={disabled}
          readOnly={readOnly}
          autoFocus={autoFocus}
          autoComplete={autoComplete ? 'on' : 'off'}
          autoCorrect={autoCorrect ? 'on' : 'off'}
          autoCapitalize={autoCapitalize ? 'on' : 'off'}
          spellCheck={spellCheck}
          tabIndex={tabIndex}
          {...accessibilityProps}
          {...props}
        />
        
        {/* 도움말 텍스트 */}
        {finalHelperText && (
          <p
            className={cn(
              'mt-1 text-xs',
              {
                'text-error-500': error || errorMessage,
                'text-success-500': success || successMessage,
                'text-warning-500': warning || warningMessage,
                'text-muted-foreground': !error && !success && !warning && !errorMessage && !successMessage && !warningMessage,
              }
            )}
          >
            {finalHelperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
