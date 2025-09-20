/**
 * ReportButton 컴포넌트
 * 
 * @description
 * - 신고 버튼을 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <ReportButton
 *   onReport={handleReport}
 *   reportTypes={['spam', 'inappropriate', 'harassment']}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
// import { Button } from '../atoms';

/**
 * 신고 버튼 컴포넌트 스타일 variants 정의
 */
const reportButtonVariants = cva(
  // 기본 스타일
  'inline-flex items-center gap-1 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground hover:text-error-500',
        error: 'text-error-500 hover:text-error-600',
        outline: 'border border-input hover:border-error-500 hover:text-error-500',
        ghost: 'hover:bg-error-50 hover:text-error-500',
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
 * 신고 타입 정의
 */
export type ReportType = 
  | 'spam'           // 스팸
  | 'inappropriate'  // 부적절한 내용
  | 'harassment'     // 괴롭힘
  | 'violence'       // 폭력
  | 'hate'           // 혐오
  | 'false'          // 거짓 정보
  | 'copyright'      // 저작권 침해
  | 'other';         // 기타

/**
 * 신고 옵션 타입 정의
 */
export interface ReportOption {
  /**
   * 신고 타입
   */
  type: ReportType;
  
  /**
   * 신고 타입 라벨
   */
  label: string;
  
  /**
   * 신고 타입 설명
   */
  description?: string;
  
  /**
   * 신고 타입 비활성화 여부
   * @default false
   */
  disabled?: boolean;
}

/**
 * ReportButton 컴포넌트 Props 타입 정의
 */
export interface ReportButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof reportButtonVariants> {
  /**
   * 신고 핸들러
   */
  onReport?: (reportType: ReportType, reason?: string) => void;
  
  /**
   * 신고 타입 옵션들
   */
  reportTypes?: ReportOption[];
  
  /**
   * 신고 버튼 텍스트
   * @default "신고"
   */
  reportText?: string;
  
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
 * ReportButton 컴포넌트
 * 
 * @param props - ReportButton 컴포넌트 props
 * @returns JSX.Element
 */
const ReportButton = React.forwardRef<HTMLButtonElement, ReportButtonProps>(
  (
    {
      className,
      onReport,
      reportTypes = [
        { type: 'spam', label: '스팸' },
        { type: 'inappropriate', label: '부적절한 내용' },
        { type: 'harassment', label: '괴롭힘' },
        { type: 'violence', label: '폭력' },
        { type: 'hate', label: '혐오' },
        { type: 'false', label: '거짓 정보' },
        { type: 'copyright', label: '저작권 침해' },
        { type: 'other', label: '기타' },
      ],
      reportText = '신고',
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
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedType, setSelectedType] = React.useState<ReportType | null>(null);
    const [reason, setReason] = React.useState('');
    
    // 신고 타입 선택 핸들러
    const handleReportTypeSelect = (type: ReportType) => {
      setSelectedType(type);
      if (type !== 'other') {
        handleReport(type);
      }
    };
    
    // 신고 실행 핸들러
    const handleReport = (type: ReportType, customReason?: string) => {
      if (disabled || loading) return;
      
      onReport?.(type, customReason || reason);
      setIsOpen(false);
      setSelectedType(null);
      setReason('');
    };
    
    // 신고 취소 핸들러
    const handleCancel = () => {
      setIsOpen(false);
      setSelectedType(null);
      setReason('');
    };
    
    // 신고 아이콘
    const ReportIcon = () => (
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
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    );
    
    return (
      <div className="relative">
        <button
          ref={ref}
          className={cn(
            reportButtonVariants({
              variant,
              size,
              fullWidth,
              className,
            }),
            disabled && 'opacity-50 cursor-not-allowed',
            loading && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled || loading}
          aria-label={ariaLabel || '신고'}
          aria-hidden={ariaHidden}
          {...props}
        >
          {loading ? (
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
            <ReportIcon />
          )}
          
          <span>{reportText}</span>
        </button>
        
        {/* 신고 타입 선택 드롭다운 */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
            <div className="p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">
                신고 사유를 선택해주세요
              </h3>
              
              <div className="space-y-2">
                {reportTypes.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => handleReportTypeSelect(option.type)}
                    disabled={option.disabled}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                      'hover:bg-muted focus:bg-muted focus:outline-none',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* 기타 신고 사유 입력 */}
              {selectedType === 'other' && (
                <div className="mt-4 space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    신고 사유를 입력해주세요
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="신고 사유를 자세히 입력해주세요"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    rows={3}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleReport('other', reason)}
                      disabled={!reason.trim()}
                      className="px-3 py-1 text-sm bg-error-500 text-white rounded hover:bg-error-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      신고
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

ReportButton.displayName = 'ReportButton';

export { ReportButton, reportButtonVariants };
