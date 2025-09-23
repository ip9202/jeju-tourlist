import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 테스트 설정
 *
 * @description
 * - 제주도 여행 Q&A 커뮤니티 플랫폼 E2E 테스트 설정
 * - 크로스 브라우저 테스트 지원 (Chrome, Firefox, Safari)
 * - 모바일 디바이스 테스트 지원
 * - 병렬 테스트 실행 최적화
 */

export default defineConfig({
  testDir: './apps/web/src/__tests__/e2e',

  /* 병렬 테스트 실행 설정 */
  fullyParallel: true,

  /* CI 환경에서 테스트 실패 시 재시도 금지 */
  forbidOnly: !!process.env.CI,

  /* CI 환경에서 재시도 설정 */
  retries: process.env.CI ? 2 : 0,

  /* 병렬 워커 수 설정 */
  workers: process.env.CI ? 1 : undefined,

  /* 테스트 리포터 설정 */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],

  /* 전역 테스트 설정 */
  use: {
    /* 액션 전 대기 시간 */
    actionTimeout: 10000,

    /* 네비게이션 타임아웃 */
    navigationTimeout: 30000,

    /* 베이스 URL 설정 */
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',

    /* 실패 시 스크린샷 캡처 */
    screenshot: 'only-on-failure',

    /* 실패 시 비디오 녹화 */
    video: 'retain-on-failure',

    /* 추적 정보 수집 */
    trace: 'on-first-retry',

    /* 콘솔 로그 수집 */
    contextOptions: {
      recordVideo: {
        mode: 'retain-on-failure',
        size: { width: 1280, height: 720 }
      }
    }
  },

  /* 프로젝트별 테스트 설정 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* 모바일 테스트 */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* 태블릿 테스트 */
    {
      name: 'Mobile Safari iPad',
      use: { ...devices['iPad Pro'] },
    },
  ],

  /* 로컬 개발 서버 설정 - 수동 시작 */
  // webServer: {
  //   command: 'pnpm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  //   env: {
  //     NODE_ENV: 'test',
  //     DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/jeju_tourlist_test',
  //   }
  // },

  /* 테스트 결과 출력 디렉토리 */
  outputDir: 'test-results/',

  /* 테스트 타임아웃 설정 (30초) */
  timeout: 30000,

  /* 글로벌 셋업/티어다운 - 데이터베이스 없이 테스트 */
  // globalSetup: require.resolve('./apps/web/src/__tests__/global-setup.ts'),
  // globalTeardown: require.resolve('./apps/web/src/__tests__/global-teardown.ts'),

  /* 테스트 매칭 패턴 */
  testMatch: [
    '**/*.e2e.test.ts',
    '**/*.e2e.spec.ts'
  ],

  /* 무시할 파일 패턴 */
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**'
  ],

  /* 환경변수 설정 */
  expect: {
    /* 어설션 타임아웃 */
    timeout: 5000,

    /* 스크린샷 비교 임계값 */
    toHaveScreenshot: { threshold: 0.2 },
    toMatchSnapshot: { threshold: 0.2 }
  }
});