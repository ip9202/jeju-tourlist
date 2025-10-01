"use client";

/**
 * Button 컴포넌트
 *
 * @description
 * - 다양한 variant, size, state를 지원하는 버튼 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   클릭하세요
 * </Button>
 * ```
 */

import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

/**
 * 버튼 스타일 variants 정의
 *
 * @description
 * - CVA(Class Variance Authority)를 사용한 타입 안전한 스타일링
 * - 다양한 버튼 스타일을 체계적으로 관리
 */
const buttonVariants = cva(
  // 기본 스타일
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // 기본 버튼 스타일
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",

        // 브랜드별 버튼 스타일
        primary:
          "bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-200",
        success:
          "bg-success-500 text-white hover:bg-success-600 focus:ring-success-200",
        warning:
          "bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-200",
        error:
          "bg-error-500 text-white hover:bg-error-600 focus:ring-error-200",
        info: "bg-info-500 text-white hover:bg-info-600 focus:ring-info-200",
      },
      size: {
        // 버튼 크기 variants
        xs: "h-7 px-2 text-xs",
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 py-2 text-sm",
        lg: "h-10 px-6 text-base",
        xl: "h-12 px-8 text-lg",
        icon: "h-9 w-9",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
      loading: {
        true: "cursor-not-allowed",
        false: "cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
      loading: false,
    },
  }
);

/**
 * 버튼 컴포넌트 Props 타입 정의
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * 버튼을 Slot으로 렌더링할지 여부
   * @default false
   */
  asChild?: boolean;

  /**
   * 로딩 상태 여부
   * @default false
   */
  loading?: boolean;

  /**
   * 로딩 중 표시할 텍스트
   * @default "로딩 중..."
   */
  loadingText?: string;

  /**
   * 버튼 왼쪽에 표시할 아이콘
   */
  leftIcon?: React.ReactNode;

  /**
   * 버튼 오른쪽에 표시할 아이콘
   */
  rightIcon?: React.ReactNode;

  /**
   * 버튼 전체 너비 사용 여부
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * Button 컴포넌트
 *
 * @param props - Button 컴포넌트 props
 * @returns JSX.Element
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText = "로딩 중...",
      leftIcon,
      rightIcon,
      fullWidth,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    // 로딩 상태일 때는 비활성화
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(
          buttonVariants({
            variant,
            size,
            fullWidth,
            loading,
            className,
          })
        )}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        type={type}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {!loading && leftIcon && (
          <span className="mr-1" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        <span>{loading ? loadingText : children}</span>

        {!loading && rightIcon && (
          <span className="ml-1" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
