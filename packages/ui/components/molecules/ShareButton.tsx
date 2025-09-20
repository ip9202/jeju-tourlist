/**
 * ShareButton 컴포넌트
 * 
 * @description
 * - 공유 버튼을 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <ShareButton
 *   url="https://example.com"
 *   title="제목"
 *   onShare={handleShare}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
// import { Button } from '../atoms';

/**
 * 공유 버튼 컴포넌트 스타일 variants 정의
 */
const shareButtonVariants = cva(
  // 기본 스타일
  'inline-flex items-center gap-1 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground hover:text-primary-500',
        primary: 'text-primary-500 hover:text-primary-600',
        outline: 'border border-input hover:border-primary-500 hover:text-primary-500',
        ghost: 'hover:bg-primary-50 hover:text-primary-500',
      },
      size: {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2',
      },
      fullWidth: {
        true: 'w-full justify-center',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      fullWidth: false,
    },
  }
);

/**
 * 공유 옵션 타입 정의
 */
export interface ShareOptions {
  /**
   * 공유할 URL
   */
  url: string;
  
  /**
   * 공유할 제목
   */
  title?: string;
  
  /**
   * 공유할 설명
   */
  description?: string;
  
  /**
   * 공유할 이미지 URL
   */
  image?: string;
  
  /**
   * 공유할 해시태그들
   */
  hashtags?: string[];
}

/**
 * ShareButton 컴포넌트 Props 타입 정의
 */
export interface ShareButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof shareButtonVariants> {
  /**
   * 공유 옵션
   */
  shareOptions: ShareOptions;
  
  /**
   * 공유 성공 핸들러
   */
  onShare?: (platform: string) => void;
  
  /**
   * 공유 실패 핸들러
   */
  onShareError?: (error: Error) => void;
  
  /**
   * 지원하는 공유 플랫폼들
   * @default ["twitter", "facebook", "linkedin", "copy"]
   */
  platforms?: ('twitter' | 'facebook' | 'linkedin' | 'copy')[];
  
  /**
   * 공유 버튼 텍스트
   * @default "공유"
   */
  shareText?: string;
  
  /**
   * 공유 개수 표시 여부
   * @default false
   */
  showCount?: boolean;
  
  /**
   * 공유 개수
   * @default 0
   */
  count?: number;
  
  /**
   * 비활성화 여부
   * @default false
   */
  disabled?: boolean;
  
  /**
   * 로딩 상태
   * @default false
   */
  loading?: boolean;
  
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
 * ShareButton 컴포넌트
 * 
 * @param props - ShareButton 컴포넌트 props
 * @returns JSX.Element
 */
const ShareButton = React.forwardRef<HTMLButtonElement, ShareButtonProps>(
  (
    {
      className,
      shareOptions,
      onShare,
      onShareError,
      platforms = ['twitter', 'facebook', 'linkedin', 'copy'],
      shareText = '공유',
      showCount = false,
      count = 0,
      disabled = false,
      loading = false,
      variant,
      size,
      fullWidth,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden = false,
      ...props
    },
    ref
  ) => {
    const [isSharing, setIsSharing] = React.useState(false);
    
    // 공유 URL 생성
    const generateShareUrl = (platform: string) => {
      const { url, title, description, hashtags } = shareOptions;
      const encodedUrl = encodeURIComponent(url);
      const encodedTitle = encodeURIComponent(title || '');
      const _encodedDescription = encodeURIComponent(description || '');
      const encodedHashtags = encodeURIComponent(hashtags?.join(',') || '');
      
      switch (platform) {
        case 'twitter':
          return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${encodedHashtags}`;
        case 'facebook':
          return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        case 'linkedin':
          return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        default:
          return url;
      }
    };
    
    // 공유 실행
    const handleShare = async (platform: string) => {
      if (disabled || loading || isSharing) return;
      
      try {
        setIsSharing(true);
        
        if (platform === 'copy') {
          // 클립보드에 복사
          await navigator.clipboard.writeText(shareOptions.url);
          onShare?.(platform);
        } else {
          // 새 창에서 공유 URL 열기
          const shareUrl = generateShareUrl(platform);
          window.open(shareUrl, '_blank', 'width=600,height=400');
          onShare?.(platform);
        }
      } catch (error) {
        onShareError?.(error as Error);
      } finally {
        setIsSharing(false);
      }
    };
    
    // 공유 아이콘
    const ShareIcon = () => (
      <svg
        className="h-4 w-4"
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
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
        />
      </svg>
    );
    
    return (
      <button
        ref={ref}
        className={cn(
          shareButtonVariants({
            variant,
            size,
            fullWidth,
            className,
          }),
          disabled && 'opacity-50 cursor-not-allowed',
          loading && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => handleShare('copy')}
        disabled={disabled || loading || isSharing}
        aria-label={ariaLabel || '공유'}
        aria-hidden={ariaHidden}
        {...props}
      >
        {loading || isSharing ? (
          <svg
            className="h-4 w-4 animate-spin"
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
        ) : (
          <ShareIcon />
        )}
        
        <span>{shareText}</span>
        
        {showCount && count > 0 && (
          <span className="ml-1 font-medium">
            {count.toLocaleString()}
          </span>
        )}
      </button>
    );
  }
);

ShareButton.displayName = 'ShareButton';

export { ShareButton, shareButtonVariants };
