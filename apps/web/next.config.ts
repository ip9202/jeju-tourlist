import type { NextConfig } from "next";

/**
 * Next.js 설정 - SEO 최적화 및 성능 향상
 * 
 * @description
 * - 이미지 최적화 설정
 * - 압축 및 캐싱 최적화
 * - 보안 헤더 설정
 * - 성능 모니터링 설정
 */
const nextConfig: NextConfig = {
  // 이미지 최적화 설정
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 압축 설정
  compress: true,

  // 실험적 기능
  experimental: {
    // 서버 컴포넌트 최적화
    serverComponentsExternalPackages: ['@prisma/client'],
    // 메모리 사용량 최적화
    memoryBasedWorkersCount: true,
    // 번들 분석기 활성화 (개발 환경)
    bundlePagesRouterDependencies: true,
  },

  // 웹팩 설정
  webpack: (config, { dev, isServer }) => {
    // 프로덕션 환경에서 번들 크기 최적화
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  // 헤더 설정 (보안 및 성능)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // 보안 헤더
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // 성능 헤더
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // 리라이트 설정 (API 프록시)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_BASE_URL || 'http://localhost:4000'}/api/:path*`,
      },
    ];
  },

  // 환경변수 설정
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 출력 설정
  output: 'standalone',

  // 타입스크립트 설정
  typescript: {
    // 빌드 시 타입 체크 (CI/CD에서만)
    ignoreBuildErrors: process.env.NODE_ENV === 'production' && process.env.CI === 'true',
  },

  // ESLint 설정
  eslint: {
    // 빌드 시 ESLint 체크 (CI/CD에서만)
    ignoreDuringBuilds: process.env.NODE_ENV === 'production' && process.env.CI === 'true',
  },

  // 개발 서버 설정
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },

  // 로그 레벨 설정
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

export default nextConfig;
