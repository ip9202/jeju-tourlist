/**
 * Label 컴포넌트
 * 
 * @description
 * - 폼 요소와 연결되는 라벨 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <Label htmlFor="email" required>
 *   이메일
 * </Label>
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * 라벨 컴포넌트 스타일 variants 정의
 */
const labelVariants = cva(
  // 기본 스타일
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
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
      required: {
        true: '',
        false: '',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      size: 'sm',
      weight: 'medium',
      color: 'default',
      required: false,
      disabled: false,
    },
  }
);

/**
 * Label 컴포넌트 Props 타입 정의
 */
export interface LabelProps
  extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'color'>,
    VariantProps<typeof labelVariants> {
  /**
   * 연결할 폼 요소의 ID
   */
  htmlFor?: string;
  
  /**
   * 필수 입력 여부
   * @default false
   */
  required?: boolean;
  
  /**
   * 라벨 내용
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
}

/**
 * Label 컴포넌트
 * 
 * @param props - Label 컴포넌트 props
 * @returns JSX.Element
 */
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      className,
      htmlFor,
      size,
      weight,
      color,
      required = false,
      disabled = false,
      children,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden = false,
      ...props
    },
    ref
  ) => {
        return (
          <label
            ref={ref}
            htmlFor={htmlFor}
            className={cn(
              labelVariants({
                size,
                weight,
                color,
                required,
                disabled,
                className,
              })
            )}
            aria-label={ariaLabel}
            aria-hidden={ariaHidden}
            {...props}
          >
            {children}
            {required && (
              <span className="ml-1 text-error-500" aria-label="필수 입력">
                *
              </span>
            )}
          </label>
        );
  }
);

Label.displayName = 'Label';

export { Label, labelVariants };
