// @ts-expect-error Prisma client type recognition issue in monorepo
import { PrismaClient } from "@prisma/client";
import { PaginationOptions, PaginatedResult } from "../types";

/**
 * 기본 Repository 인터페이스
 *
 * @description
 * 모든 Repository 클래스가 구현해야 하는 기본 CRUD 인터페이스입니다.
 * Interface Segregation Principle (ISP)를 준수하여
 * 클라이언트가 필요한 메서드만 의존하도록 설계되었습니다.
 *
 * @template T - 엔티티 타입
 * @template CreateData - 생성 데이터 타입
 * @template UpdateData - 수정 데이터 타입
 * @template SearchOptions - 검색 옵션 타입
 *
 * @interface IBaseRepository
 * @since 1.0.0
 */
// 기본 Repository 인터페이스 (ISP - Interface Segregation Principle)
export interface IBaseRepository<T, CreateData, UpdateData, SearchOptions> {
  findById(id: string): Promise<T | null>;
  findMany(options?: SearchOptions): Promise<T[]>;
  findManyPaginated(
    options: SearchOptions & { pagination: PaginationOptions }
  ): Promise<PaginatedResult<T>>;
  create(data: CreateData): Promise<T>;
  update(id: string, data: UpdateData): Promise<T>;
  delete(id: string): Promise<void>;
  count(options?: SearchOptions): Promise<number>;
}

/**
 * 추상 기본 Repository 클래스
 *
 * @description
 * 모든 Repository 클래스의 기본이 되는 추상 클래스입니다.
 * 공통적인 CRUD 기능과 유틸리티 메서드를 제공합니다.
 *
 * **SOLID 원칙 적용:**
 * - SRP: 기본 데이터 접근 로직만 담당
 * - OCP: 확장 가능한 추상 클래스 구조
 * - LSP: 하위 클래스에서 완전 치환 가능
 * - ISP: 기본 인터페이스만 구현
 * - DIP: 추상화에 의존
 *
 * **주요 기능:**
 * - 기본 CRUD 연산 (생성, 조회, 수정, 삭제)
 * - 페이지네이션 지원
 * - 에러 핸들링
 * - 검색 및 정렬 로직
 *
 * @template T - 엔티티 타입
 * @template CreateData - 생성 데이터 타입
 * @template UpdateData - 수정 데이터 타입
 * @template SearchOptions - 검색 옵션 타입
 *
 * @abstract
 * @class BaseRepository
 * @implements IBaseRepository
 *
 * @example
 * ```typescript
 * class UserRepository extends BaseRepository<User, CreateUserData, UpdateUserData, UserSearchOptions> {
 *   constructor(prisma: PrismaClient) {
 *     super(prisma, "user");
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */
// 추상 기본 Repository 클래스 (SRP - Single Responsibility Principle)
export abstract class BaseRepository<T, CreateData, UpdateData, SearchOptions>
  implements IBaseRepository<T, CreateData, UpdateData, SearchOptions>
{
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  // 추상 메서드 - 각 Repository에서 구현해야 함
  abstract findById(id: string): Promise<T | null>;
  abstract findMany(options?: SearchOptions): Promise<T[]>;
  abstract findManyPaginated(
    options: SearchOptions & { pagination: PaginationOptions }
  ): Promise<PaginatedResult<T>>;
  abstract create(data: CreateData): Promise<T>;
  abstract update(id: string, data: UpdateData): Promise<T>;
  abstract delete(id: string): Promise<void>;
  abstract count(options?: SearchOptions): Promise<number>;

  // 공통 유틸리티 메서드
  protected async paginate<TData>(
    data: TData[],
    total: number,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<TData>> {
    const { page, limit } = pagination;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  protected buildWhereClause(_options: SearchOptions): any {
    // 기본 구현 - 각 Repository에서 오버라이드
    return {};
  }

  protected buildOrderByClause(
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): any {
    if (!sortBy) return { createdAt: "desc" };

    return {
      [sortBy]: sortOrder || "desc",
    };
  }

  // 에러 핸들링
  protected handleError(error: unknown, operation: string): never {
    console.error(`Error in ${this.modelName} ${operation}:`, error);

    if (error instanceof Error) {
      throw new Error(
        `${this.modelName} ${operation} failed: ${error.message}`
      );
    }

    throw new Error(`${this.modelName} ${operation} failed: Unknown error`);
  }

  // 트랜잭션 지원
  protected async withTransaction<R>(fn: (tx: any) => Promise<R>): Promise<R> {
    return await this.prisma.$transaction(fn);
  }
}
