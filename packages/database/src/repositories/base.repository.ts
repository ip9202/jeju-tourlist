// @ts-expect-error Prisma client type recognition issue in monorepo
import { PrismaClient } from "@prisma/client";
import { PaginationOptions, PaginatedResult } from "../types";

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
