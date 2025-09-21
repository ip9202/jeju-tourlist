/**
 * Text 컴포넌트
 * 
 * @description
 * - 다양한 텍스트 스타일을 지원하는 텍스트 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <Text variant="body" size="md" color="primary">
 *   텍스트 내용
 * </Text>
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * 텍스트 컴포넌트 스타일 variants 정의
 */
const textVariants = cva(
  // 기본 스타일
  'text-foreground',
  {
    variants: {
      variant: {
        // 텍스트 스타일 프리셋
        display: 'text-3xl font-bold leading-tight tracking-tight',
        h1: 'text-2xl font-bold leading-tight tracking-tight',
        h2: 'text-xl font-semibold leading-tight tracking-tight',
        h3: 'text-lg font-semibold leading-snug tracking-tight',
        h4: 'text-base font-semibold leading-snug',
        h5: 'text-sm font-semibold leading-snug',
        h6: 'text-xs font-semibold leading-snug',
        body: 'text-base font-normal leading-relaxed',
        bodySmall: 'text-sm font-normal leading-normal',
        caption: 'text-xs font-normal leading-snug tracking-wide',
        code: 'font-mono text-sm bg-muted px-1.5 py-0.5 rounded',
        lead: 'text-lg font-normal leading-relaxed',
        large: 'text-lg font-semibold leading-snug',
        small: 'text-sm font-medium leading-normal',
        muted: 'text-muted-foreground',
      },
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
        '5xl': 'text-5xl',
        '6xl': 'text-6xl',
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
        white: 'text-white',
        black: 'text-black',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify',
      },
      transform: {
        none: 'normal-case',
        uppercase: 'uppercase',
        lowercase: 'lowercase',
        capitalize: 'capitalize',
      },
      decoration: {
        none: 'no-underline',
        underline: 'underline',
        'line-through': 'line-through',
        overline: 'overline',
      },
      truncate: {
        true: 'truncate',
        false: '',
      },
      select: {
        none: 'select-none',
        text: 'select-text',
        all: 'select-all',
        auto: 'select-auto',
      },
    },
    defaultVariants: {
      variant: 'body',
      size: 'md',
      weight: 'normal',
      color: 'default',
      align: 'left',
      transform: 'none',
      decoration: 'none',
      truncate: false,
      select: 'auto',
    },
  }
);

/**
 * Text 컴포넌트 Props 타입 정의
 */
export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
    VariantProps<typeof textVariants> {
  /**
   * HTML 태그 타입
   * @default "span"
   */
  as?: 'span' | 'p' | 'div' | 'strong' | 'em' | 'mark' | 'del' | 'ins' | 'sub' | 'sup';
  
  /**
   * 텍스트 내용
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
 * Text 컴포넌트
 * 
 * @param props - Text 컴포넌트 props
 * @returns JSX.Element
 */
const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  (
    {
      className,
      as: Component = 'span',
      variant,
      size,
      weight,
      color,
      align,
      transform,
      decoration,
      truncate,
      select,
      children,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden = false,
      ...props
    },
    ref
  ) => {
        return (
          <Component
            ref={ref as any}
            className={cn(
              textVariants({
                variant,
                size,
                weight,
                color,
                align,
                transform,
                decoration,
                truncate,
                select,
                className,
              })
            )}
            aria-label={ariaLabel}
            aria-hidden={ariaHidden}
            {...props}
          >
            {children}
          </Component>
        );
  }
);

Text.displayName = 'Text';

export { Text, textVariants };
