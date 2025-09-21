/**
 * Breadcrumb 컴포넌트
 * 
 * @description
 * - 브레드크럼 네비게이션을 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: '홈', href: '/' },
 *     { label: '카테고리', href: '/category' },
 *     { label: '상품', href: '/product' }
 *   ]}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Link } from '../atoms';

/**
 * 브레드크럼 컴포넌트 스타일 variants 정의
 */
const breadcrumbVariants = cva(
  // 기본 스타일
  'flex items-center space-x-1 text-sm',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
      separator: {
        slash: 'space-x-1',
        chevron: 'space-x-1',
        dot: 'space-x-1',
        arrow: 'space-x-1',
      },
    },
    defaultVariants: {
      size: 'md',
      separator: 'slash',
    },
  }
);

/**
 * 브레드크럼 아이템 타입 정의
 */
export interface BreadcrumbItem {
  /**
   * 아이템 라벨
   */
  label: string;
  
  /**
   * 아이템 링크 URL
   */
  href?: string;
  
  /**
   * 아이템 비활성화 여부
   * @default false
   */
  disabled?: boolean;
  
  /**
   * 아이템 아이콘
   */
  icon?: React.ReactNode;
  
  /**
   * 아이템 클릭 핸들러
   */
  onClick?: () => void;
}

/**
 * Breadcrumb 컴포넌트 Props 타입 정의
 */
export interface BreadcrumbProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof breadcrumbVariants> {
  /**
   * 브레드크럼 아이템들
   */
  items: BreadcrumbItem[];
  
  /**
   * 구분자 타입
   * @default "slash"
   */
  separator?: 'slash' | 'chevron' | 'dot' | 'arrow';
  
  /**
   * 최대 표시 아이템 수 (나머지는 "..."로 표시)
   */
  maxItems?: number;
  
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
 * Breadcrumb 컴포넌트
 * 
 * @param props - Breadcrumb 컴포넌트 props
 * @returns JSX.Element
 */
const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  (
    {
      className,
      items,
      separator = 'slash',
      maxItems,
      size,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden = false,
      ...props
    },
    ref
  ) => {
    // 표시할 아이템들 결정
    const displayItems = React.useMemo(() => {
      if (!maxItems || items.length <= maxItems) return items;
      
      const firstItems = items.slice(0, 1);
      const lastItems = items.slice(-(maxItems - 2));
      const middleItem = { label: '...', disabled: true };
      
      return [...firstItems, middleItem, ...lastItems];
    }, [items, maxItems]);
    
    // 구분자 아이콘
    const SeparatorIcon = () => {
      switch (separator) {
        case 'chevron':
          return (
            <svg
              className="h-3 w-3 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          );
        case 'dot':
          return (
            <span className="text-muted-foreground" aria-hidden="true">
              •
            </span>
          );
        case 'arrow':
          return (
            <svg
              className="h-3 w-3 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          );
        case 'slash':
        default:
          return (
            <span className="text-muted-foreground" aria-hidden="true">
              /
            </span>
          );
      }
    };
    
    return (
      <nav
        ref={ref}
        className={cn(
          breadcrumbVariants({
            size,
            separator,
            className,
          })
        )}
        aria-label={ariaLabel || '브레드크럼 네비게이션'}
        aria-hidden={ariaHidden}
        {...props}
      >
        <ol className="flex items-center space-x-1">
          {displayItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <SeparatorIcon />}
              
              {item.disabled ? (
                <span className="text-muted-foreground cursor-default">
                  {'icon' in item && item.icon && (
                    <span className="mr-1" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </span>
              ) : 'href' in item && item.href ? (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {'icon' in item && item.icon && (
                    <span className="mr-1" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </Link>
              ) : (
                <button
                  onClick={'onClick' in item ? item.onClick : undefined}
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                >
                  {'icon' in item && item.icon && (
                    <span className="mr-1" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';

export { Breadcrumb, breadcrumbVariants };
