/**
 * Jest 테스트 설정 파일
 *
 * @description
 * - 테스트 환경 초기화
 * - 전역 설정 및 모킹 설정
 * - 데이터베이스 연결 설정
 */

import { jest } from "@jest/globals";

// 전역 타임아웃 설정
jest.setTimeout(10000);

// 환경 변수 설정
process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  "postgresql://test:test@localhost:5432/jeju_tourlist_test";

// Prisma Client 모킹
jest.mock("../client", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    question: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    answer: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    userProfile: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
  },
}));

// Redis 모킹 (조건부)
try {
  jest.mock("ioredis", () => {
    return jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      expire: jest.fn(),
      flushall: jest.fn(),
      quit: jest.fn(),
    }));
  });
} catch (error) {
  // ioredis가 설치되지 않은 경우 무시
  console.warn("ioredis 모킹을 건너뜁니다:", error.message);
}

// 각 테스트 전후 정리
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

// 테스트 완료 후 정리
afterAll(async () => {
  // 필요시 데이터베이스 연결 정리
});
