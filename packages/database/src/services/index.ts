// 서비스 인터페이스 및 구현 내보내기
export * from "./base.service";
export * from "./search.service";
export * from "./cache.service";
export * from "./cached.repository.service";
export * from "./point.service";
export * from "./badge.service";
export * from "./notification.service";
export * from "./admin.service";
export * from "./moderation.service";

// 데이터베이스 서비스 팩토리
import { PrismaClient } from "../../node_modules/.prisma/client";
import { RepositoryFactory } from "../repositories";
import { RedisCacheService, ICacheService } from "./cache.service";
import { SearchService, ISearchService } from "./search.service";
import { CachedRepositoryService } from "./cached.repository.service";

export class DatabaseServiceFactory {
  private static instance: DatabaseServiceFactory;
  private prisma: PrismaClient;
  private cacheService: ICacheService;
  private repositoryFactory: RepositoryFactory;
  private searchService: ISearchService;
  private cachedRepositoryService: CachedRepositoryService;

  private constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.cacheService = new RedisCacheService();
    this.repositoryFactory = RepositoryFactory.getInstance(prisma as any);
    this.searchService = new SearchService(prisma);
    this.cachedRepositoryService = new CachedRepositoryService(
      prisma,
      this.cacheService,
      {
        user: this.repositoryFactory.userRepository,
        question: this.repositoryFactory.questionRepository,
        answer: this.repositoryFactory.answerRepository,
        category: this.repositoryFactory.categoryRepository,
      }
    );
  }

  public static getInstance(prisma: PrismaClient): DatabaseServiceFactory {
    if (!DatabaseServiceFactory.instance) {
      DatabaseServiceFactory.instance = new DatabaseServiceFactory(prisma);
    }
    return DatabaseServiceFactory.instance;
  }

  // 서비스 게터들
  public get repositories() {
    return this.repositoryFactory;
  }

  public get cachedRepositories() {
    return this.cachedRepositoryService;
  }

  public get search() {
    return this.searchService;
  }

  public get cache() {
    return this.cacheService;
  }

  // 데이터베이스 상태 확인
  public async getDatabaseStatus() {
    return {
      isConnected: true, // 실제로는 prisma 연결 상태 확인
      cache: {
        isConnected: true, // 실제로는 Redis 연결 상태 확인
      },
      repositories: {
        user: true,
        question: true,
        answer: true,
        category: true,
      },
    };
  }

  // 서비스 정리
  public async cleanup() {
    await this.prisma.$disconnect();
    this.repositoryFactory.cleanup();
  }
}
