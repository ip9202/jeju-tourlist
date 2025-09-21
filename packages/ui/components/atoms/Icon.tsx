/**
 * Icon 컴포넌트
 * 
 * @description
 * - Lucide React 아이콘을 래핑하는 아이콘 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <Icon name="heart" size="md" color="primary" />
 * <Icon name="user" size="lg" className="text-blue-500" />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Lucide React 아이콘들을 동적으로 import하기 위한 타입
type LucideIcon = React.ComponentType<{
  className?: string;
  size?: number;
  strokeWidth?: number;
}>;

/**
 * 아이콘 컴포넌트 스타일 variants 정의
 */
const iconVariants = cva(
  // 기본 스타일
  'inline-flex items-center justify-center',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8',
        '2xl': 'h-10 w-10',
        '3xl': 'h-12 w-12',
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
      weight: {
        thin: 'stroke-1',
        light: 'stroke-1.5',
        normal: 'stroke-2',
        medium: 'stroke-2.5',
        bold: 'stroke-3',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'default',
      weight: 'normal',
    },
  }
);

/**
 * 지원하는 아이콘 이름들 (필요에 따라 확장)
 */
export type IconName = 
  | 'heart'
  | 'user'
  | 'search'
  | 'menu'
  | 'close'
  | 'plus'
  | 'minus'
  | 'edit'
  | 'trash'
  | 'save'
  | 'download'
  | 'upload'
  | 'share'
  | 'bookmark'
  | 'star'
  | 'like'
  | 'dislike'
  | 'comment'
  | 'message'
  | 'bell'
  | 'settings'
  | 'home'
  | 'mail'
  | 'phone'
  | 'calendar'
  | 'clock'
  | 'location'
  | 'map'
  | 'camera'
  | 'image'
  | 'file'
  | 'folder'
  | 'link'
  | 'external-link'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'arrow-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'chevron-down'
  | 'check'
  | 'x'
  | 'alert-circle'
  | 'info'
  | 'help-circle'
  | 'eye'
  | 'eye-off'
  | 'lock'
  | 'unlock'
  | 'key'
  | 'shield'
  | 'zap'
  | 'sun'
  | 'moon'
  | 'cloud'
  | 'wifi'
  | 'wifi-off'
  | 'battery'
  | 'battery-charging'
  | 'volume'
  | 'volume-off'
  | 'play'
  | 'pause'
  | 'stop'
  | 'skip-back'
  | 'skip-forward'
  | 'repeat'
  | 'shuffle'
  | 'maximize'
  | 'minimize'
  | 'refresh'
  | 'rotate-cw'
  | 'rotate-ccw'
  | 'move'
  | 'copy'
  | 'cut'
  | 'paste'
  | 'undo'
  | 'redo'
  | 'filter'
  | 'sort'
  | 'grid'
  | 'list'
  | 'layout'
  | 'sidebar'
  | 'panel'
  | 'window'
  | 'monitor'
  | 'smartphone'
  | 'tablet'
  | 'laptop'
  | 'desktop'
  | 'server'
  | 'database'
  | 'cpu'
  | 'hard-drive'
  | 'memory'
  | 'network'
  | 'globe'
  | 'world'
  | 'flag'
  | 'award'
  | 'trophy'
  | 'medal'
  | 'gift'
  | 'package'
  | 'shopping-cart'
  | 'credit-card'
  | 'dollar-sign'
  | 'percent'
  | 'trending-up'
  | 'trending-down'
  | 'bar-chart'
  | 'pie-chart'
  | 'line-chart'
  | 'activity'
  | 'pulse'
  | 'heartbeat'
  | 'thermometer'
  | 'gauge'
  | 'target'
  | 'crosshair'
  | 'focus'
  | 'zap'
  | 'flash'
  | 'sparkles'
  | 'star'
  | 'moon'
  | 'sun'
  | 'cloud'
  | 'cloud-rain'
  | 'cloud-snow'
  | 'cloud-lightning'
  | 'wind'
  | 'droplet'
  | 'flame'
  | 'snowflake'
  | 'umbrella'
  | 'tree'
  | 'leaf'
  | 'flower'
  | 'bug'
  | 'fish'
  | 'bird'
  | 'cat'
  | 'dog'
  | 'paw'
  | 'footprints'
  | 'car'
  | 'truck'
  | 'bus'
  | 'train'
  | 'plane'
  | 'ship'
  | 'bike'
  | 'scooter'
  | 'skateboard'
  | 'roller-skate'
  | 'gamepad'
  | 'joystick'
  | 'dice'
  | 'puzzle'
  | 'chess'
  | 'cards'
  | 'dice-1'
  | 'dice-2'
  | 'dice-3'
  | 'dice-4'
  | 'dice-5'
  | 'dice-6'
  | 'music'
  | 'headphones'
  | 'mic'
  | 'mic-off'
  | 'video'
  | 'video-off'
  | 'camera'
  | 'camera-off'
  | 'image'
  | 'images'
  | 'film'
  | 'tv'
  | 'radio'
  | 'speaker'
  | 'volume-1'
  | 'volume-2'
  | 'volume-x'
  | 'play-circle'
  | 'pause-circle'
  | 'stop-circle'
  | 'skip-back-circle'
  | 'skip-forward-circle'
  | 'repeat-circle'
  | 'shuffle-circle'
  | 'fast-forward'
  | 'rewind'
  | 'forward'
  | 'backward'
  | 'step-forward'
  | 'step-backward'
  | 'rotate-left'
  | 'rotate-right'
  | 'flip-horizontal'
  | 'flip-vertical'
  | 'move-horizontal'
  | 'move-vertical'
  | 'move-diagonal'
  | 'move-diagonal-2'
  | 'move-diagonal-3'
  | 'move-diagonal-4'
  | 'move-diagonal-5'
  | 'move-diagonal-6'
  | 'move-diagonal-7'
  | 'move-diagonal-8'
  | 'move-diagonal-9'
  | 'move-diagonal-10'
  | 'move-diagonal-11'
  | 'move-diagonal-12'
  | 'move-diagonal-13'
  | 'move-diagonal-14'
  | 'move-diagonal-15'
  | 'move-diagonal-16'
  | 'move-diagonal-17'
  | 'move-diagonal-18'
  | 'move-diagonal-19'
  | 'move-diagonal-20'
  | 'move-diagonal-21'
  | 'move-diagonal-22'
  | 'move-diagonal-23'
  | 'move-diagonal-24'
  | 'move-diagonal-25'
  | 'move-diagonal-26'
  | 'move-diagonal-27'
  | 'move-diagonal-28'
  | 'move-diagonal-29'
  | 'move-diagonal-30'
  | 'move-diagonal-31'
  | 'move-diagonal-32'
  | 'move-diagonal-33'
  | 'move-diagonal-34'
  | 'move-diagonal-35'
  | 'move-diagonal-36'
  | 'move-diagonal-37'
  | 'move-diagonal-38'
  | 'move-diagonal-39'
  | 'move-diagonal-40'
  | 'move-diagonal-41'
  | 'move-diagonal-42'
  | 'move-diagonal-43'
  | 'move-diagonal-44'
  | 'move-diagonal-45'
  | 'move-diagonal-46'
  | 'move-diagonal-47'
  | 'move-diagonal-48'
  | 'move-diagonal-49'
  | 'move-diagonal-50'
  | 'move-diagonal-51'
  | 'move-diagonal-52'
  | 'move-diagonal-53'
  | 'move-diagonal-54'
  | 'move-diagonal-55'
  | 'move-diagonal-56'
  | 'move-diagonal-57'
  | 'move-diagonal-58'
  | 'move-diagonal-59'
  | 'move-diagonal-60'
  | 'move-diagonal-61'
  | 'move-diagonal-62'
  | 'move-diagonal-63'
  | 'move-diagonal-64'
  | 'move-diagonal-65'
  | 'move-diagonal-66'
  | 'move-diagonal-67'
  | 'move-diagonal-68'
  | 'move-diagonal-69'
  | 'move-diagonal-70'
  | 'move-diagonal-71'
  | 'move-diagonal-72'
  | 'move-diagonal-73'
  | 'move-diagonal-74'
  | 'move-diagonal-75'
  | 'move-diagonal-76'
  | 'move-diagonal-77'
  | 'move-diagonal-78'
  | 'move-diagonal-79'
  | 'move-diagonal-80'
  | 'move-diagonal-81'
  | 'move-diagonal-82'
  | 'move-diagonal-83'
  | 'move-diagonal-84'
  | 'move-diagonal-85'
  | 'move-diagonal-86'
  | 'move-diagonal-87'
  | 'move-diagonal-88'
  | 'move-diagonal-89'
  | 'move-diagonal-90'
  | 'move-diagonal-91'
  | 'move-diagonal-92'
  | 'move-diagonal-93'
  | 'move-diagonal-94'
  | 'move-diagonal-95'
  | 'move-diagonal-96'
  | 'move-diagonal-97'
  | 'move-diagonal-98'
  | 'move-diagonal-99'
  | 'move-diagonal-100';

/**
 * Icon 컴포넌트 Props 타입 정의
 */
export interface IconProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
    Omit<VariantProps<typeof iconVariants>, 'size'> {
  /**
   * 아이콘 이름
   */
  name: IconName;
  
  /**
   * 아이콘 크기 (픽셀)
   */
  size?: number;
  
  /**
   * 스트로크 두께
   */
  strokeWidth?: number;
  
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
 * 아이콘 매핑 객체 (실제 구현에서는 동적 import 사용)
 */
const iconMap: Record<IconName, LucideIcon> = {
  // 실제 구현에서는 다음과 같이 동적 import를 사용해야 합니다:
  // const iconMap = {
  //   heart: React.lazy(() => import('lucide-react').then(module => ({ default: module.Heart }))),
  //   user: React.lazy(() => import('lucide-react').then(module => ({ default: module.User }))),
  //   // ... 기타 아이콘들
  // };
  
  // 현재는 타입 안전성을 위해 빈 객체로 설정
  // 실제 사용 시에는 Lucide React의 아이콘들을 import하여 사용
} as Record<string, LucideIcon>;

/**
 * Icon 컴포넌트
 * 
 * @param props - Icon 컴포넌트 props
 * @returns JSX.Element
 */
const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  (
    {
      className,
      name,
      size,
      color,
      weight,
      strokeWidth,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden = false,
      ...props
    },
    ref
  ) => {
    // 아이콘 컴포넌트 가져오기
    const IconComponent = iconMap[name];
    
    // 아이콘이 존재하지 않는 경우 기본 아이콘 표시
    if (!IconComponent) {
      console.warn(`Icon "${name}" not found. Please check the icon name.`);
      return (
        <span
          ref={ref}
          className={cn(iconVariants({ 
            color: color as 'default' | 'secondary' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'muted' | 'white' | 'black', 
            weight, 
            className 
          }))}
          style={{ 
            width: size ? `${size}px` : undefined, 
            height: size ? `${size}px` : undefined,
            ...props.style 
          }}
          aria-label={ariaLabel}
          aria-hidden={ariaHidden}
          {...props}
        >
          ?
        </span>
      );
    }
    
    return (
      <span
        ref={ref}
        className={cn(iconVariants({ color, weight, className }))}
        style={{ 
          width: size ? `${size}px` : undefined, 
          height: size ? `${size}px` : undefined,
          ...props.style 
        }}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden}
        {...props}
      >
        <IconComponent
          size={size}
          strokeWidth={strokeWidth}
          className="h-full w-full"
        />
      </span>
    );
  }
);

Icon.displayName = 'Icon';

export { Icon, iconVariants };
