/**
 * Heading 컴포넌트
 * 
 * @description
 * - 다양한 제목 스타일을 지원하는 제목 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <Heading level={1} size="xl" color="primary">
 *   제목
 * </Heading>
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * 제목 컴포넌트 스타일 variants 정의
 */
const headingVariants = cva(
  // 기본 스타일
  'font-semibold text-foreground leading-tight tracking-tight',
  {
    variants: {
      level: {
        1: 'text-4xl font-bold',
        2: 'text-3xl font-bold',
        3: 'text-2xl font-semibold',
        4: 'text-xl font-semibold',
        5: 'text-lg font-semibold',
        6: 'text-base font-semibold',
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
    },
    defaultVariants: {
      level: 1,
      size: 'md',
      weight: 'normal',
      color: 'default',
      align: 'left',
      transform: 'none',
      decoration: 'none',
      truncate: false,
    },
  }
);

/**
 * Heading 컴포넌트 Props 타입 정의
 */
export interface HeadingProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'>,
    VariantProps<typeof headingVariants> {
  /**
   * 제목 레벨 (1-6)
   * @default 1
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  
  /**
   * 제목 내용
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
 * Heading 컴포넌트
 * 
 * @param props - Heading 컴포넌트 props
 * @returns JSX.Element
 */
const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      className,
      level = 1,
      size,
      weight,
      color,
      align,
      transform,
      decoration,
      truncate,
      children,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden = false,
      ...props
    },
    ref
  ) => {
    // 제목 레벨에 따른 HTML 태그 결정
    const Component = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    
    // 제목 레벨에 따른 기본 크기 설정
    const defaultSize = size || (level === 1 ? '4xl' : level === 2 ? '3xl' : level === 3 ? '2xl' : level === 4 ? 'xl' : level === 5 ? 'lg' : 'md');
    
        return (
          <Component
            ref={ref}
            className={cn(
              headingVariants({
                level,
                size: defaultSize,
                weight,
                color,
                align,
                transform,
                decoration,
                truncate,
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

Heading.displayName = 'Heading';

export { Heading, headingVariants };
