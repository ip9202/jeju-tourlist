/**
 * HashtagList 컴포넌트
 * 
 * @description
 * - 해시태그 목록을 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <HashtagList
 *   hashtags={['제주도', '여행', '맛집']}
 *   onHashtagClick={handleHashtagClick}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
// import { Link } from '../atoms';

/**
 * 해시태그 리스트 컴포넌트 스타일 variants 정의
 */
const hashtagListVariants = cva(
  // 기본 스타일
  'flex flex-wrap gap-2',
  {
    variants: {
      size: {
        sm: 'gap-1',
        md: 'gap-2',
        lg: 'gap-3',
      },
      orientation: {
        horizontal: 'flex-row flex-wrap',
        vertical: 'flex-col',
      },
      align: {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end',
      },
    },
    defaultVariants: {
      size: 'md',
      orientation: 'horizontal',
      align: 'left',
    },
  }
);

/**
 * 해시태그 아이템 스타일 variants 정의
 */
const hashtagItemVariants = cva(
  // 기본 스타일
  'inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-muted text-muted-foreground hover:bg-muted/80',
        primary: 'bg-primary-100 text-primary-700 hover:bg-primary-200',
        secondary: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200',
        success: 'bg-success-100 text-success-700 hover:bg-success-200',
        warning: 'bg-warning-100 text-warning-700 hover:bg-warning-200',
        error: 'bg-error-100 text-error-700 hover:bg-error-200',
        info: 'bg-info-100 text-info-700 hover:bg-info-200',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'text-xs px-1.5 py-0.5',
        md: 'text-sm px-2 py-1',
        lg: 'text-base px-3 py-1.5',
      },
      clickable: {
        true: 'cursor-pointer hover:scale-105 transform transition-transform',
        false: 'cursor-default',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      clickable: false,
    },
  }
);

/**
 * 해시태그 타입 정의
 */
export interface Hashtag {
  /**
   * 해시태그 텍스트 (해시 기호 제외)
   */
  text: string;
  
  /**
   * 해시태그 링크 URL
   */
  href?: string;
  
  /**
   * 해시태그 비활성화 여부
   * @default false
   */
  disabled?: boolean;
  
  /**
   * 해시태그 개수 (인기도 표시용)
   */
  count?: number;
  
  /**
   * 해시태그 색상
   */
  color?: string;
}

/**
 * HashtagList 컴포넌트 Props 타입 정의
 */
export interface HashtagListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof hashtagListVariants> {
  /**
   * 해시태그 목록
   */
  hashtags: Hashtag[];
  
  /**
   * 해시태그 클릭 핸들러
   */
  onHashtagClick?: (hashtag: Hashtag) => void;
  
  /**
   * 해시태그 아이템 variant
   */
  hashtagVariant?: VariantProps<typeof hashtagItemVariants>['variant'];
  
  /**
   * 해시태그 아이템 크기
   */
  hashtagSize?: VariantProps<typeof hashtagItemVariants>['size'];
  
  /**
   * 해시태그 클릭 가능 여부
   * @default true
   */
  clickable?: boolean;
  
  /**
   * 최대 표시 개수 (나머지는 "더보기"로 표시)
   */
  maxItems?: number;
  
  /**
   * "더보기" 텍스트
   * @default "더보기"
   */
  moreText?: string;
  
  /**
   * 해시태그 전체 너비 사용 여부
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * 해시태그 정렬 기준
   */
  sortBy?: 'text' | 'count' | 'none';
  
  /**
   * 해시태그 정렬 순서
   * @default "asc"
   */
  sortOrder?: 'asc' | 'desc';
}

/**
 * HashtagList 컴포넌트
 * 
 * @param props - HashtagList 컴포넌트 props
 * @returns JSX.Element
 */
const HashtagList = React.forwardRef<HTMLDivElement, HashtagListProps>(
  (
    {
      className,
      hashtags,
      onHashtagClick,
      hashtagVariant,
      hashtagSize,
      clickable = true,
      maxItems,
      moreText = '더보기',
      fullWidth = false,
      sortBy = 'none',
      sortOrder = 'asc',
      size,
      orientation,
      align,
      ...props
    },
    ref
  ) => {
    // 해시태그 정렬
    const sortedHashtags = React.useMemo(() => {
      if (sortBy === 'none') return hashtags;
      
      return [...hashtags].sort((a, b) => {
        let comparison = 0;
        
        if (sortBy === 'text') {
          comparison = a.text.localeCompare(b.text);
        } else if (sortBy === 'count') {
          comparison = (a.count || 0) - (b.count || 0);
        }
        
        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }, [hashtags, sortBy, sortOrder]);
    
    // 표시할 해시태그와 숨겨진 해시태그 분리
    const visibleHashtags = maxItems 
      ? sortedHashtags.slice(0, maxItems)
      : sortedHashtags;
    const hiddenHashtags = maxItems 
      ? sortedHashtags.slice(maxItems)
      : [];
    
    // 해시태그 클릭 핸들러
    const handleHashtagClick = (hashtag: Hashtag) => {
      if (hashtag.disabled || !clickable) return;
      onHashtagClick?.(hashtag);
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          hashtagListVariants({
            size,
            orientation,
            align,
            className,
          }),
          fullWidth && 'w-full'
        )}
        {...props}
      >
        {/* 표시할 해시태그들 */}
        {visibleHashtags.map((hashtag, index) => (
          <div
            key={`${hashtag.text}-${index}`}
            className={cn(
              hashtagItemVariants({
                variant: hashtagVariant,
                size: hashtagSize,
                clickable: clickable && !hashtag.disabled,
              }),
              hashtag.disabled && 'opacity-50 cursor-not-allowed',
              hashtag.color && `bg-[${hashtag.color}]`
            )}
            onClick={() => handleHashtagClick(hashtag)}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable && !hashtag.disabled ? 0 : undefined}
            aria-label={`해시태그: ${hashtag.text}`}
          >
            <span className="text-muted-foreground">#</span>
            <span>{hashtag.text}</span>
            {hashtag.count && (
              <span className="text-xs opacity-75">
                ({hashtag.count})
              </span>
            )}
          </div>
        ))}
        
        {/* 숨겨진 해시태그가 있는 경우 "더보기" 표시 */}
        {hiddenHashtags.length > 0 && (
          <div
            className={cn(
              hashtagItemVariants({
                variant: hashtagVariant,
                size: hashtagSize,
                clickable: true,
              }),
              'bg-muted/50 text-muted-foreground'
            )}
            onClick={() => {
              // 더보기 클릭 시 숨겨진 해시태그들을 표시하는 로직
              // 실제 구현에서는 상태 관리가 필요할 수 있음
            }}
            role="button"
            tabIndex={0}
            aria-label={`${hiddenHashtags.length}개 더보기`}
          >
            <span>{moreText}</span>
            <span className="text-xs">({hiddenHashtags.length})</span>
          </div>
        )}
      </div>
    );
  }
);

HashtagList.displayName = 'HashtagList';

export { HashtagList, hashtagListVariants, hashtagItemVariants };
