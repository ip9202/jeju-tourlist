// Prisma 클라이언트 및 연결 관리
export * from "./client";

// 타입 정의
export * from "./types";

// Repository 패턴
export * from "./repositories";

// 서비스 레이어
export * from "./services";

// 데이터베이스 서비스 팩토리
import { prisma } from "./client";
import { DatabaseServiceFactory } from "./services";

// Prisma 클라이언트 직접 export
export { prisma };

// 싱글톤 데이터베이스 서비스 인스턴스
export const databaseService = DatabaseServiceFactory.getInstance(prisma);

// 편의 함수들
export const db = {
  // Prisma 클라이언트 직접 접근
  prisma,

  // Repository 접근
  get repositories() {
    return databaseService.repositories;
  },

  // 캐시된 Repository 접근
  get cached() {
    return databaseService.cachedRepositories;
  },

  // 검색 서비스 접근
  get search() {
    return databaseService.search;
  },

  // 캐시 서비스 접근
  get cache() {
    return databaseService.cache;
  },

  // 데이터베이스 상태 확인
  async getStatus() {
    return await databaseService.getDatabaseStatus();
  },

  // 연결 종료
  async disconnect() {
    await databaseService.cleanup();
  },
};

// 기본 내보내기
export default db;
