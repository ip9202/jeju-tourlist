/**
 * TimestampDisplay 컴포넌트
 * 
 * @description
 * - 시간을 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <TimestampDisplay
 *   timestamp="2024-01-01T12:00:00Z"
 *   format="relative"
 *   showIcon
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Text } from '../atoms';

/**
 * 타임스탬프 표시 컴포넌트 스타일 variants 정의
 */
const timestampDisplayVariants = cva(
  // 기본 스타일
  'inline-flex items-center gap-1',
  {
    variants: {
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
      color: {
        default: 'text-muted-foreground',
        muted: 'text-muted-foreground',
        primary: 'text-primary-500',
        secondary: 'text-secondary-500',
        success: 'text-success-500',
        warning: 'text-warning-500',
        error: 'text-error-500',
        info: 'text-info-500',
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
    },
    defaultVariants: {
      size: 'sm',
      color: 'default',
      weight: 'normal',
    },
  }
);

/**
 * 타임스탬프 포맷 타입 정의
 */
export type TimestampFormat = 
  | 'relative'      // 상대적 시간 (예: "2시간 전")
  | 'absolute'      // 절대적 시간 (예: "2024-01-01 12:00")
  | 'time'          // 시간만 (예: "12:00")
  | 'date'          // 날짜만 (예: "2024-01-01")
  | 'datetime'      // 날짜와 시간 (예: "2024-01-01 12:00")
  | 'iso'           // ISO 형식 (예: "2024-01-01T12:00:00Z")
  | 'custom';       // 커스텀 형식

/**
 * TimestampDisplay 컴포넌트 Props 타입 정의
 */
export interface TimestampDisplayProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof timestampDisplayVariants> {
  /**
   * 타임스탬프 (Date 객체, 문자열, 또는 숫자)
   */
  timestamp: Date | string | number;
  
  /**
   * 표시 형식
   * @default "relative"
   */
  format?: TimestampFormat;
  
  /**
   * 커스텀 형식 문자열 (format이 'custom'인 경우)
   */
  customFormat?: string;
  
  /**
   * 아이콘 표시 여부
   * @default false
   */
  showIcon?: boolean;
  
  /**
   * 툴팁 표시 여부
   * @default true
   */
  showTooltip?: boolean;
  
  /**
   * 툴팁 내용
   */
  tooltipContent?: string;
  
  /**
   * 업데이트 간격 (밀리초, relative 형식인 경우)
   * @default 60000 (1분)
   */
  updateInterval?: number;
  
  /**
   * 로케일 설정
   * @default "ko-KR"
   */
  locale?: string;
  
  /**
   * 시간대 설정
   * @default "Asia/Seoul"
   */
  timeZone?: string;
  
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
 * TimestampDisplay 컴포넌트
 * 
 * @param props - TimestampDisplay 컴포넌트 props
 * @returns JSX.Element
 */
const TimestampDisplay = React.forwardRef<HTMLDivElement, TimestampDisplayProps>(
  (
    {
      className,
      timestamp,
      format = 'relative',
      customFormat,
      showIcon = false,
      showTooltip = true,
      tooltipContent,
      updateInterval = 60000,
      locale = 'ko-KR',
      timeZone = 'Asia/Seoul',
      size,
      color,
      weight,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden = false,
      ...props
    },
    ref
  ) => {
    const [displayTime, setDisplayTime] = React.useState('');
    const [tooltip, setTooltip] = React.useState('');
    
    // Date 객체로 변환
    const date = React.useMemo(() => {
      if (timestamp instanceof Date) return timestamp;
      if (typeof timestamp === 'string') return new Date(timestamp);
      if (typeof timestamp === 'number') return new Date(timestamp);
      return new Date();
    }, [timestamp]);
    
    // 시간 포맷팅 함수
    const formatTime = React.useCallback((date: Date, format: TimestampFormat) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      switch (format) {
        case 'relative':
          return getRelativeTime(diff);
        case 'absolute':
          return date.toLocaleString(locale, { timeZone });
        case 'time':
          return date.toLocaleTimeString(locale, { timeZone });
        case 'date':
          return date.toLocaleDateString(locale, { timeZone });
        case 'datetime':
          return date.toLocaleString(locale, { timeZone });
        case 'iso':
          return date.toISOString();
        case 'custom':
          return customFormat ? date.toLocaleString(locale, { timeZone, ...JSON.parse(customFormat) }) : date.toLocaleString(locale, { timeZone });
        default:
          return getRelativeTime(diff);
      }
    }, [locale, timeZone, customFormat]);
    
    // 상대적 시간 계산
    const getRelativeTime = (diff: number) => {
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const weeks = Math.floor(days / 7);
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);
      
      if (seconds < 60) return '방금 전';
      if (minutes < 60) return `${minutes}분 전`;
      if (hours < 24) return `${hours}시간 전`;
      if (days < 7) return `${days}일 전`;
      if (weeks < 4) return `${weeks}주 전`;
      if (months < 12) return `${months}개월 전`;
      return `${years}년 전`;
    };
    
    // 시간 업데이트
    const updateTime = React.useCallback(() => {
      const formatted = formatTime(date, format);
      setDisplayTime(formatted);
      
      if (showTooltip) {
        const tooltipText = tooltipContent || date.toLocaleString(locale, { timeZone });
        setTooltip(tooltipText);
      }
    }, [date, format, formatTime, showTooltip, tooltipContent, locale, timeZone]);
    
    // 초기 시간 설정
    React.useEffect(() => {
      updateTime();
    }, [updateTime]);
    
    // 상대적 시간인 경우 주기적 업데이트
    React.useEffect(() => {
      if (format === 'relative') {
        const interval = setInterval(updateTime, updateInterval);
        return () => clearInterval(interval);
      }
    }, [format, updateTime, updateInterval]);
    
    // 아이콘 컴포넌트
    const TimeIcon = () => (
      <svg
        className="h-3 w-3"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    );
    
    return (
      <div
        ref={ref}
        className={cn(
          timestampDisplayVariants({
            size,
            color,
            weight,
            className,
          })
        )}
        title={showTooltip ? tooltip : undefined}
        aria-label={ariaLabel || `시간: ${displayTime}`}
        aria-hidden={ariaHidden}
        {...props}
      >
        {showIcon && <TimeIcon />}
        <Text
          size={size}
          color={color}
          weight={weight}
          className="select-none"
        >
          {displayTime}
        </Text>
      </div>
    );
  }
);

TimestampDisplay.displayName = 'TimestampDisplay';

export { TimestampDisplay, timestampDisplayVariants };
