/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['Pretendard Variable', 'Pretendard', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Noto Sans KR', 'Helvetica Neue', 'Arial', 'sans-serif'],
  			mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
  		},
  		// 8pt 그리드 시스템
  		spacing: {
  			'0.5': '0.125rem', // 2px
  			'1': '0.25rem',    // 4px
  			'1.5': '0.375rem', // 6px
  			'2': '0.5rem',     // 8px
  			'2.5': '0.625rem', // 10px
  			'3': '0.75rem',    // 12px
  			'3.5': '0.875rem', // 14px
  			'4': '1rem',       // 16px
  			'5': '1.25rem',    // 20px
  			'6': '1.5rem',     // 24px
  			'7': '1.75rem',    // 28px
  			'8': '2rem',       // 32px
  			'9': '2.25rem',    // 36px
  			'10': '2.5rem',    // 40px
  			'11': '2.75rem',   // 44px (터치 타겟 최소 크기)
  			'12': '3rem',      // 48px
  			'14': '3.5rem',    // 56px
  			'16': '4rem',      // 64px
  			'20': '5rem',      // 80px
  			'24': '6rem',      // 96px
  			'28': '7rem',      // 112px
  			'32': '8rem',      // 128px
  		},
  		// 모바일 우선 브레이크포인트
  		screens: {
  			'xs': '475px',   // 작은 모바일
  			'sm': '640px',   // 모바일
  			'md': '768px',   // 태블릿
  			'lg': '1024px',  // 작은 데스크톱
  			'xl': '1280px',  // 데스크톱
  			'2xl': '1536px', // 큰 데스크톱
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}