/**
 * 디자인 토큰 시스템
 * 
 * @description
 * - 일관된 디자인 시스템을 위한 토큰 정의
 * - CSS Variables와 TypeScript 타입을 동시에 제공
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * 
 * @example
 * ```typescript
 * import { colors, spacing, typography } from '@jeju-tourlist/ui/tokens';
 * 
 * const buttonStyle = {
 *   backgroundColor: colors.primary[500],
 *   padding: spacing.md,
 *   fontSize: typography.body.fontSize,
 * };
 * ```
 */

/**
 * 컬러 토큰 정의
 * 
 * @description
 * - 브랜드 컬러와 시맨틱 컬러를 체계적으로 정의
 * - 다크 모드 지원을 위한 컬러 팔레트
 * - 접근성 기준(WCAG 2.1 AA) 준수
 */
export const colors = {
  // 브랜드 컬러 (제주도 테마)
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // 메인 브랜드 컬러
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  
  // 제주도 자연 컬러 (보조 브랜드)
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // 제주 자연 녹색
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  
  // 중성 컬러 (그레이스케일)
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  
  // 시맨틱 컬러
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
} as const;

/**
 * 타이포그래피 토큰 정의
 * 
 * @description
 * - 일관된 텍스트 스타일을 위한 타이포그래피 시스템
 * - 반응형 폰트 크기 지원
 * - 한국어 최적화된 폰트 스택
 */
export const typography = {
  // 폰트 패밀리
  fontFamily: {
    sans: ['Pretendard', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
  
  // 폰트 크기 (rem 기준)
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  
  // 폰트 두께
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // 줄 높이
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  // 문자 간격
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  // 텍스트 스타일 프리셋
  styles: {
    display: {
      fontSize: '3rem',
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.025em',
    },
    h1: {
      fontSize: '2.25rem',
      fontWeight: '700',
      lineHeight: '1.3',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: '600',
      lineHeight: '1.3',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '0em',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '0em',
    },
    body: {
      fontSize: '1rem',
      fontWeight: '400',
      lineHeight: '1.6',
      letterSpacing: '0em',
    },
    bodySmall: {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0em',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: '400',
      lineHeight: '1.4',
      letterSpacing: '0.025em',
    },
  },
} as const;

/**
 * 스페이싱 토큰 정의
 * 
 * @description
 * - 일관된 간격을 위한 스페이싱 시스템
 * - 4px 기준 그리드 시스템
 * - 반응형 스페이싱 지원
 */
export const spacing = {
  // 기본 스페이싱 (4px 기준)
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem',     // 384px
  
  // 시맨틱 스페이싱
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
  '5xl': '8rem',   // 128px
} as const;

/**
 * 브레이크포인트 토큰 정의
 * 
 * @description
 * - 반응형 디자인을 위한 브레이크포인트 시스템
 * - 모바일 우선 접근법
 * - 컨테이너 최대 너비 정의
 */
export const breakpoints = {
  // 브레이크포인트 (min-width 기준)
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  
  // 컨테이너 최대 너비
  container: {
    xs: '100%',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px',
  },
  
  // 미디어 쿼리 헬퍼
  media: {
    xs: `(min-width: 475px)`,
    sm: `(min-width: 640px)`,
    md: `(min-width: 768px)`,
    lg: `(min-width: 1024px)`,
    xl: `(min-width: 1280px)`,
    '2xl': `(min-width: 1536px)`,
  },
} as const;

/**
 * 그림자 토큰 정의
 * 
 * @description
 * - 일관된 그림자 효과를 위한 토큰
 * - 깊이감과 계층 구조 표현
 */
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

/**
 * 둥근 모서리 토큰 정의
 * 
 * @description
 * - 일관된 둥근 모서리를 위한 토큰
 * - 브랜드 아이덴티티와 접근성 고려
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem',  // 2px
  base: '0.25rem', // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
} as const;

/**
 * 애니메이션 토큰 정의
 * 
 * @description
 * - 일관된 애니메이션을 위한 토큰
 * - 성능과 접근성 고려
 */
export const animations = {
  // 지속 시간 (ms)
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  // 이징 함수
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // 애니메이션 프리셋
  presets: {
    fadeIn: {
      duration: '300ms',
      easing: 'ease-out',
    },
    slideUp: {
      duration: '300ms',
      easing: 'ease-out',
    },
    scale: {
      duration: '200ms',
      easing: 'ease-out',
    },
  },
} as const;

/**
 * Z-Index 토큰 정의
 * 
 * @description
 * - 계층 구조를 위한 Z-Index 시스템
 * - 충돌 방지를 위한 체계적 관리
 */
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

/**
 * 디자인 토큰 타입 정의
 */
export type ColorToken = typeof colors;
export type TypographyToken = typeof typography;
export type SpacingToken = typeof spacing;
export type BreakpointToken = typeof breakpoints;
export type ShadowToken = typeof shadows;
export type BorderRadiusToken = typeof borderRadius;
export type AnimationToken = typeof animations;
export type ZIndexToken = typeof zIndex;

/**
 * 모든 디자인 토큰을 포함하는 통합 타입
 */
export type DesignTokens = {
  colors: ColorToken;
  typography: TypographyToken;
  spacing: SpacingToken;
  breakpoints: BreakpointToken;
  shadows: ShadowToken;
  borderRadius: BorderRadiusToken;
  animations: AnimationToken;
  zIndex: ZIndexToken;
};

/**
 * 디자인 토큰 객체
 */
export const designTokens: DesignTokens = {
  colors,
  typography,
  spacing,
  breakpoints,
  shadows,
  borderRadius,
  animations,
  zIndex,
};
