// Jest 설정 파일
import 'dotenv-flow/config';

// 테스트 환경 변수 설정
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/jeju_test';
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only';
process.env.API_BASE_URL = 'http://localhost:4000';
process.env.LOG_LEVEL = 'error';

// 테스트 타임아웃 설정
jest.setTimeout(10000);

// 콘솔 로그 억제 (테스트 중)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
