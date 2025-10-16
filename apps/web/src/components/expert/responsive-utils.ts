/**
 * 반응형 디자인 최적화 유틸리티
 *
 * @description
 * - 전문가 대시보드의 반응형 디자인을 위한 유틸리티
 * - 다양한 화면 크기에 대한 최적화
 * - 모바일, 태블릿, 데스크톱 대응
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { cn } from "@/lib/utils";

/**
 * 반응형 그리드 클래스 생성
 */
export const getResponsiveGridClasses = (variant: "card" | "list") => {
  if (variant === "card") {
    return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6";
  }
  return "space-y-2 sm:space-y-4";
};

/**
 * 반응형 패딩 클래스 생성
 */
export const getResponsivePaddingClasses = (size: "sm" | "md" | "lg") => {
  const sizes = {
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  };
  return sizes[size];
};

/**
 * 반응형 텍스트 크기 클래스 생성
 */
export const getResponsiveTextClasses = (size: "sm" | "md" | "lg" | "xl") => {
  const sizes = {
    sm: "text-xs sm:text-sm",
    md: "text-sm sm:text-base",
    lg: "text-base sm:text-lg",
    xl: "text-lg sm:text-xl",
  };
  return sizes[size];
};

/**
 * 반응형 아이콘 크기 클래스 생성
 */
export const getResponsiveIconClasses = (size: "sm" | "md" | "lg") => {
  const sizes = {
    sm: "w-3 h-3 sm:w-4 sm:h-4",
    md: "w-4 h-4 sm:w-5 sm:h-5",
    lg: "w-5 h-5 sm:w-6 sm:h-6",
  };
  return sizes[size];
};

/**
 * 반응형 아바타 크기 클래스 생성
 */
export const getResponsiveAvatarClasses = (size: "sm" | "md" | "lg" | "xl") => {
  const sizes = {
    sm: "w-8 h-8 sm:w-10 sm:h-10",
    md: "w-10 h-10 sm:w-12 sm:h-12",
    lg: "w-12 h-12 sm:w-14 sm:h-14",
    xl: "w-14 h-14 sm:w-16 sm:h-16",
  };
  return sizes[size];
};

/**
 * 반응형 버튼 클래스 생성
 */
export const getResponsiveButtonClasses = (
  variant: "primary" | "secondary" | "ghost"
) => {
  const baseClasses =
    "px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium rounded-lg transition-colors";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    ghost: "text-gray-700 hover:bg-gray-100",
  };

  return cn(baseClasses, variants[variant]);
};

/**
 * 반응형 카드 클래스 생성
 */
export const getResponsiveCardClasses = (
  variant: "default" | "compact" | "detailed"
) => {
  const baseClasses =
    "bg-white rounded-lg border border-gray-200 transition-shadow";

  const variants = {
    default: "p-4 sm:p-6 hover:shadow-md",
    compact: "p-3 sm:p-4 hover:shadow-sm",
    detailed: "p-6 sm:p-8 hover:shadow-lg",
  };

  return cn(baseClasses, variants[variant]);
};

/**
 * 반응형 컨테이너 클래스 생성
 */
export const getResponsiveContainerClasses = (
  maxWidth: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl"
) => {
  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "7xl": "max-w-7xl",
  };

  return cn("mx-auto px-4 sm:px-6 lg:px-8", maxWidths[maxWidth]);
};

/**
 * 반응형 스페이싱 클래스 생성
 */
export const getResponsiveSpacingClasses = (
  direction: "x" | "y",
  size: "sm" | "md" | "lg"
) => {
  const directions = {
    x: {
      sm: "space-x-2 sm:space-x-3",
      md: "space-x-3 sm:space-x-4",
      lg: "space-x-4 sm:space-x-6",
    },
    y: {
      sm: "space-y-2 sm:space-y-3",
      md: "space-y-3 sm:space-y-4",
      lg: "space-y-4 sm:space-y-6",
    },
  };

  return directions[direction][size];
};

/**
 * 반응형 숨김/표시 클래스 생성
 */
export const getResponsiveVisibilityClasses = (
  breakpoint: "sm" | "md" | "lg" | "xl",
  action: "hide" | "show"
) => {
  const actions = {
    hide: {
      sm: "hidden sm:block",
      md: "hidden md:block",
      lg: "hidden lg:block",
      xl: "hidden xl:block",
    },
    show: {
      sm: "block sm:hidden",
      md: "block md:hidden",
      lg: "block lg:hidden",
      xl: "block xl:hidden",
    },
  };

  return actions[action][breakpoint];
};

/**
 * 반응형 그리드 컬럼 수 조정
 */
export const getResponsiveGridCols = (cols: {
  default?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}) => {
  const { default: defaultCols = 1, sm, md, lg, xl } = cols;

  let classes = `grid-cols-${defaultCols}`;

  if (sm) classes += ` sm:grid-cols-${sm}`;
  if (md) classes += ` md:grid-cols-${md}`;
  if (lg) classes += ` lg:grid-cols-${lg}`;
  if (xl) classes += ` xl:grid-cols-${xl}`;

  return classes;
};

/**
 * 반응형 폰트 크기 조정
 */
export const getResponsiveFontSize = (sizes: {
  default?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
}) => {
  const { default: defaultSize = "text-base", sm, md, lg, xl } = sizes;

  let classes = defaultSize;

  if (sm) classes += ` sm:${sm}`;
  if (md) classes += ` md:${md}`;
  if (lg) classes += ` lg:${lg}`;
  if (xl) classes += ` xl:${xl}`;

  return classes;
};

/**
 * 반응형 간격 조정
 */
export const getResponsiveGap = (gaps: {
  default?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
}) => {
  const { default: defaultGap = "gap-4", sm, md, lg, xl } = gaps;

  let classes = defaultGap;

  if (sm) classes += ` sm:${sm}`;
  if (md) classes += ` md:${md}`;
  if (lg) classes += ` lg:${lg}`;
  if (xl) classes += ` xl:${xl}`;

  return classes;
};

/**
 * 모바일 최적화 클래스
 */
export const getMobileOptimizedClasses = () => {
  return cn(
    "touch-manipulation", // 터치 최적화
    "select-none", // 텍스트 선택 방지
    "overscroll-none", // 오버스크롤 방지
    "scroll-smooth" // 부드러운 스크롤
  );
};

/**
 * 터치 디바이스 최적화 클래스
 */
export const getTouchOptimizedClasses = () => {
  return cn(
    "min-h-[44px]", // 최소 터치 영역
    "min-w-[44px]", // 최소 터치 영역
    "active:scale-95", // 터치 피드백
    "transition-transform" // 부드러운 애니메이션
  );
};
