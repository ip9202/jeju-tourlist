/**
 * Tailwind CSS 설정
 * 
 * @description
 * - 디자인 토큰을 기반으로 한 Tailwind CSS 커스터마이징
 * - 다크 모드 지원 및 접근성 고려
 * - SOLID 원칙 중 OCP(개방/폐쇄 원칙) 준수
 */

const { colors, typography, spacing, breakpoints, shadows, borderRadius, animations, zIndex } = require('./lib/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './stories/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // 클래스 기반 다크 모드
  theme: {
    extend: {
      // 컬러 팔레트 확장
      colors: {
        // 브랜드 컬러
        primary: colors.primary,
        secondary: colors.secondary,
        
        // 중성 컬러
        neutral: colors.neutral,
        
        // 시맨틱 컬러
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        info: colors.info,
        
        // 다크 모드 지원을 위한 시맨틱 컬러
        background: {
          DEFAULT: 'hsl(var(--background))',
          secondary: 'hsl(var(--background-secondary))',
        },
        foreground: {
          DEFAULT: 'hsl(var(--foreground))',
          secondary: 'hsl(var(--foreground-secondary))',
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
          secondary: 'hsl(var(--border-secondary))',
        },
        input: {
          DEFAULT: 'hsl(var(--input))',
        },
        ring: {
          DEFAULT: 'hsl(var(--ring))',
        },
      },
      
      // 폰트 패밀리 확장
      fontFamily: {
        sans: typography.fontFamily.sans,
        mono: typography.fontFamily.mono,
      },
      
      // 폰트 크기 확장
      fontSize: {
        ...typography.fontSize,
        // 반응형 폰트 크기
        'responsive-xs': ['0.75rem', { lineHeight: '1.4' }],
        'responsive-sm': ['0.875rem', { lineHeight: '1.5' }],
        'responsive-base': ['1rem', { lineHeight: '1.6' }],
        'responsive-lg': ['1.125rem', { lineHeight: '1.6' }],
        'responsive-xl': ['1.25rem', { lineHeight: '1.5' }],
        'responsive-2xl': ['1.5rem', { lineHeight: '1.4' }],
        'responsive-3xl': ['1.875rem', { lineHeight: '1.3' }],
        'responsive-4xl': ['2.25rem', { lineHeight: '1.2' }],
        'responsive-5xl': ['3rem', { lineHeight: '1.1' }],
      },
      
      // 폰트 두께 확장
      fontWeight: typography.fontWeight,
      
      // 줄 높이 확장
      lineHeight: typography.lineHeight,
      
      // 문자 간격 확장
      letterSpacing: typography.letterSpacing,
      
      // 스페이싱 확장
      spacing: {
        ...spacing,
        // 시맨틱 스페이싱
        xs: spacing.xs,
        sm: spacing.sm,
        md: spacing.md,
        lg: spacing.lg,
        xl: spacing.xl,
        '2xl': spacing['2xl'],
        '3xl': spacing['3xl'],
        '4xl': spacing['4xl'],
        '5xl': spacing['5xl'],
      },
      
      // 브레이크포인트 확장
      screens: {
        xs: breakpoints.xs,
        sm: breakpoints.sm,
        md: breakpoints.md,
        lg: breakpoints.lg,
        xl: breakpoints.xl,
        '2xl': breakpoints['2xl'],
      },
      
      // 컨테이너 설정
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1400px',
        },
      },
      
      // 그림자 확장
      boxShadow: {
        ...shadows,
        // 컴포넌트별 그림자
        'button': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'modal': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'toast': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },
      
      // 둥근 모서리 확장
      borderRadius: {
        ...borderRadius,
        // 컴포넌트별 둥근 모서리
        'button': borderRadius.md,
        'card': borderRadius.lg,
        'input': borderRadius.md,
        'modal': borderRadius.xl,
      },
      
      // 애니메이션 확장
      animation: {
        // 페이드 애니메이션
        'fade-in': 'fadeIn 300ms ease-out',
        'fade-out': 'fadeOut 300ms ease-in',
        
        // 슬라이드 애니메이션
        'slide-up': 'slideUp 300ms ease-out',
        'slide-down': 'slideDown 300ms ease-out',
        'slide-left': 'slideLeft 300ms ease-out',
        'slide-right': 'slideRight 300ms ease-out',
        
        // 스케일 애니메이션
        'scale-in': 'scaleIn 200ms ease-out',
        'scale-out': 'scaleOut 200ms ease-in',
        
        // 바운스 애니메이션
        'bounce-in': 'bounceIn 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        
        // 스핀 애니메이션
        'spin-slow': 'spin 3s linear infinite',
        
        // 펄스 애니메이션
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        
        // 핑 애니메이션
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      
      // 키프레임 정의
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      // Z-Index 확장
      zIndex: zIndex,
      
      // 그리드 템플릿 컬럼 확장
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fill': 'repeat(auto-fill, minmax(250px, 1fr))',
        'sidebar': '250px 1fr',
        'sidebar-collapsed': '60px 1fr',
      },
      
      // 플렉스 그리드 확장
      flex: {
        '2': '2 2 0%',
        '3': '3 3 0%',
        '4': '4 4 0%',
      },
      
      // 백드롭 필터 확장
      backdropBlur: {
        xs: '2px',
      },
      
      // 그라데이션 확장
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
        'gradient-secondary': 'linear-gradient(135deg, var(--secondary-500) 0%, var(--secondary-600) 100%)',
      },
    },
  },
  plugins: [
    // 접근성 플러그인
    require('@tailwindcss/forms')({
      strategy: 'class', // 클래스 기반 스타일링
    }),
    
    // 타이포그래피 플러그인
    require('@tailwindcss/typography'),
    
    // 애니메이션 플러그인
    require('tailwindcss-animate'),
    
    // 커스텀 유틸리티 클래스
    function({ addUtilities, theme }) {
      const newUtilities = {
        // 텍스트 스타일 프리셋
        '.text-display': {
          fontSize: theme('fontSize.3xl'),
          fontWeight: theme('fontWeight.bold'),
          lineHeight: theme('lineHeight.tight'),
          letterSpacing: theme('letterSpacing.tight'),
        },
        '.text-h1': {
          fontSize: theme('fontSize.2xl'),
          fontWeight: theme('fontWeight.bold'),
          lineHeight: theme('lineHeight.tight'),
          letterSpacing: theme('letterSpacing.tight'),
        },
        '.text-h2': {
          fontSize: theme('fontSize.xl'),
          fontWeight: theme('fontWeight.semibold'),
          lineHeight: theme('lineHeight.snug'),
          letterSpacing: theme('letterSpacing.tight'),
        },
        '.text-h3': {
          fontSize: theme('fontSize.lg'),
          fontWeight: theme('fontWeight.semibold'),
          lineHeight: theme('lineHeight.snug'),
          letterSpacing: theme('letterSpacing.tight'),
        },
        '.text-body': {
          fontSize: theme('fontSize.base'),
          fontWeight: theme('fontWeight.normal'),
          lineHeight: theme('lineHeight.relaxed'),
          letterSpacing: theme('letterSpacing.normal'),
        },
        '.text-caption': {
          fontSize: theme('fontSize.sm'),
          fontWeight: theme('fontWeight.normal'),
          lineHeight: theme('lineHeight.snug'),
          letterSpacing: theme('letterSpacing.wide'),
        },
        
        // 컴포넌트 스타일 프리셋
        '.btn-primary': {
          backgroundColor: theme('colors.primary.500'),
          color: theme('colors.white'),
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.button'),
          fontSize: theme('fontSize.sm'),
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 150ms ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.primary.600'),
            transform: 'translateY(-1px)',
            boxShadow: theme('boxShadow.button'),
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
            transform: 'none',
          },
        },
        
        '.btn-secondary': {
          backgroundColor: theme('colors.neutral.100'),
          color: theme('colors.neutral.900'),
          border: `1px solid ${theme('colors.neutral.300')}`,
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.button'),
          fontSize: theme('fontSize.sm'),
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 150ms ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.neutral.200'),
            borderColor: theme('colors.neutral.400'),
          },
        },
        
        '.card': {
          backgroundColor: theme('colors.white'),
          borderRadius: theme('borderRadius.card'),
          boxShadow: theme('boxShadow.card'),
          padding: theme('spacing.6'),
          border: `1px solid ${theme('colors.neutral.200')}`,
        },
        
        '.input': {
          width: '100%',
          padding: `${theme('spacing.2')} ${theme('spacing.3')}`,
          borderRadius: theme('borderRadius.input'),
          border: `1px solid ${theme('colors.neutral.300')}`,
          fontSize: theme('fontSize.sm'),
          transition: 'all 150ms ease-in-out',
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.primary.500'),
            boxShadow: `0 0 0 3px ${theme('colors.primary.100')}`,
          },
          '&:disabled': {
            backgroundColor: theme('colors.neutral.100'),
            cursor: 'not-allowed',
          },
        },
        
        // 반응형 유틸리티
        '.container-responsive': {
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          '@screen sm': {
            paddingLeft: theme('spacing.6'),
            paddingRight: theme('spacing.6'),
          },
          '@screen lg': {
            paddingLeft: theme('spacing.8'),
            paddingRight: theme('spacing.8'),
          },
        },
        
        // 접근성 유틸리티
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        },
        
        '.focus-visible': {
          '&:focus-visible': {
            outline: `2px solid ${theme('colors.primary.500')}`,
            outlineOffset: '2px',
          },
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
};
