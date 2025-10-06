import { PrismaClient, Category } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import {
  CreateCategoryData,
  UpdateCategoryData,
  CategorySearchOptions,
  CategoryStats,
  CategoryListItem,
} from "../types/category";

// 카테고리 Repository 인터페이스 (ISP)
export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  findMany(options?: CategorySearchOptions): Promise<Category[]>;
  findManyPaginated(
    options: CategorySearchOptions & {
      pagination: { page: number; limit: number };
    }
  ): Promise<{ data: Category[]; pagination: any }>;
  create(data: CreateCategoryData): Promise<Category>;
  update(id: string, data: UpdateCategoryData): Promise<Category>;
  delete(id: string): Promise<void>;
  count(options?: CategorySearchOptions): Promise<number>;

  // 카테고리 특화 메서드
  findActive(): Promise<Category[]>;
  findOrdered(): Promise<Category[]>;
  getCategoryStats(categoryId: string): Promise<CategoryStats>;
  updateOrder(categoryId: string, order: number): Promise<Category>;
  activateCategory(categoryId: string): Promise<Category>;
  deactivateCategory(categoryId: string): Promise<Category>;
}

// 카테고리 Repository 구현 (SRP)
export class CategoryRepository
  extends BaseRepository<
    Category,
    CreateCategoryData,
    UpdateCategoryData,
    CategorySearchOptions
  >
  implements ICategoryRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma, "Category");
  }

  async findById(id: string): Promise<Category | null> {
    try {
      return await this.prisma.category.findUnique({
        where: { id },
      });
    } catch (error) {
      this.handleError(error, "findById");
    }
  }

  async findByName(name: string): Promise<Category | null> {
    try {
      return await this.prisma.category.findUnique({
        where: { name },
      });
    } catch (error) {
      this.handleError(error, "findByName");
    }
  }

  async findMany(options: CategorySearchOptions = {}): Promise<Category[]> {
    try {
      const where = this.buildWhereClause(options);
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );

      return await this.prisma.category.findMany({
        where,
        orderBy,
        take: options.pagination?.limit,
        skip: options.pagination
          ? (options.pagination.page - 1) * options.pagination.limit
          : undefined,
      });
    } catch (error) {
      this.handleError(error, "findMany");
    }
  }

  async findManyPaginated(
    options: CategorySearchOptions & {
      pagination: { page: number; limit: number };
    }
  ): Promise<{ data: Category[]; pagination: any }> {
    try {
      const where = this.buildWhereClause(options);
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );
      const { page, limit } = options.pagination;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.category.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            _count: {
              select: {
                questions: true,
              },
            },
          },
        }),
        this.prisma.category.count({ where }),
      ]);

      // CategoryListItem 형태로 변환
      const categoryListItems: CategoryListItem[] = data.map(
        (category: any) => ({
          id: category.id,
          name: category.name,
          description: category.description ?? null,
          color: category.color ?? null,
          icon: category.icon ?? null,
          order: category.order,
          isActive: category.isActive,
          questionCount: category._count.questions,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        })
      );

      return this.paginate(categoryListItems, total, { page, limit });
    } catch (error) {
      this.handleError(error, "findManyPaginated");
    }
  }

  async create(data: CreateCategoryData): Promise<Category> {
    try {
      return await this.prisma.category.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error, "create");
    }
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    try {
      return await this.prisma.category.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error, "update");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.withTransaction(async tx => {
        // 카테고리에 속한 질문들의 카테고리를 null로 설정
        await tx.question.updateMany({
          where: { categoryId: id },
          data: { categoryId: null },
        });

        // 카테고리 삭제
        await tx.category.delete({
          where: { id },
        });
      });
    } catch (error) {
      this.handleError(error, "delete");
    }
  }

  async count(options: CategorySearchOptions = {}): Promise<number> {
    try {
      const where = this.buildWhereClause(options);
      return await this.prisma.category.count({ where });
    } catch (error) {
      this.handleError(error, "count");
    }
  }

  // 카테고리 특화 메서드
  async findActive(): Promise<Category[]> {
    try {
      return await this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      });
    } catch (error) {
      this.handleError(error, "findActive");
    }
  }

  async findOrdered(): Promise<Category[]> {
    try {
      return await this.prisma.category.findMany({
        orderBy: { order: "asc" },
      });
    } catch (error) {
      this.handleError(error, "findOrdered");
    }
  }

  async getCategoryStats(categoryId: string): Promise<CategoryStats> {
    try {
      const [
        totalQuestions,
        activeQuestions,
        resolvedQuestions,
        mostActiveUsers,
      ] = await Promise.all([
        this.prisma.question.count({
          where: { categoryId },
        }),
        this.prisma.question.count({
          where: { categoryId, status: "ACTIVE" },
        }),
        this.prisma.question.count({
          where: { categoryId, isResolved: true },
        }),
        this.prisma.question.groupBy({
          by: ["authorId"],
          where: { categoryId },
          _count: {
            authorId: true,
          },
          orderBy: {
            _count: {
              authorId: "desc",
            },
          },
          take: 5,
        }),
      ]);

      // 가장 활발한 사용자 정보 가져오기
      const userIds = mostActiveUsers.map((user: any) => user.authorId);
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          name: true,
        },
      });

      const userMap = new Map(users.map((user: any) => [user.id, user.name]));
      const mostActiveUsersWithNames = mostActiveUsers.map((user: any) => ({
        userId: user.authorId,
        userName: userMap.get(user.authorId) || "Unknown",
        questionCount: user._count.authorId,
      }));

      return {
        totalQuestions,
        activeQuestions,
        resolvedQuestions,
        averageResolutionTime: undefined, // TODO: 평균 해결 시간 계산 로직 추가
        mostActiveUsers: mostActiveUsersWithNames,
      };
    } catch (error) {
      this.handleError(error, "getCategoryStats");
    }
  }

  async updateOrder(categoryId: string, order: number): Promise<Category> {
    try {
      return await this.prisma.category.update({
        where: { id: categoryId },
        data: {
          order,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error, "updateOrder");
    }
  }

  async activateCategory(categoryId: string): Promise<Category> {
    try {
      return await this.prisma.category.update({
        where: { id: categoryId },
        data: {
          isActive: true,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error, "activateCategory");
    }
  }

  async deactivateCategory(categoryId: string): Promise<Category> {
    try {
      return await this.prisma.category.update({
        where: { id: categoryId },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error, "deactivateCategory");
    }
  }

  protected buildWhereClause(options: CategorySearchOptions): any {
    const where: any = {};

    if (options.query) {
      where.OR = [
        { name: { contains: options.query, mode: "insensitive" } },
        { description: { contains: options.query, mode: "insensitive" } },
      ];
    }

    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    return where;
  }
}
