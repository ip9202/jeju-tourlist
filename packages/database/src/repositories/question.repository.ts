// @ts-expect-error Prisma client type recognition issue in monorepo
import { PrismaClient, Question } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import {
  CreateQuestionData,
  UpdateQuestionData,
  QuestionSearchOptions,
  QuestionStats,
  QuestionListItem,
} from "../types/question";

// 질문 Repository 인터페이스 (ISP)
export interface IQuestionRepository {
  findById(id: string): Promise<Question | null>;
  findByIdWithDetails(id: string): Promise<QuestionListItem | null>;
  findMany(options?: QuestionSearchOptions): Promise<Question[]>;
  findManyPaginated(
    options: QuestionSearchOptions & {
      pagination: { page: number; limit: number };
    }
  ): Promise<{ data: Question[]; pagination: any }>;
  create(data: CreateQuestionData): Promise<Question>;
  update(id: string, data: UpdateQuestionData): Promise<Question>;
  delete(id: string): Promise<void>;
  count(options?: QuestionSearchOptions): Promise<number>;

  // 질문 특화 메서드
  findByAuthor(
    authorId: string,
    options?: QuestionSearchOptions
  ): Promise<Question[]>;
  findByCategory(
    categoryId: string,
    options?: QuestionSearchOptions
  ): Promise<Question[]>;
  findByTags(
    tags: string[],
    options?: QuestionSearchOptions
  ): Promise<Question[]>;
  searchByText(
    query: string,
    options?: QuestionSearchOptions
  ): Promise<Question[]>;
  findPopular(options?: QuestionSearchOptions): Promise<Question[]>;
  findRecent(options?: QuestionSearchOptions): Promise<Question[]>;
  findUnresolved(options?: QuestionSearchOptions): Promise<Question[]>;

  // 통계 및 상호작용
  getQuestionStats(questionId: string): Promise<QuestionStats>;
  incrementViewCount(questionId: string): Promise<Question>;
  updateLikeCount(questionId: string): Promise<Question>;
  updateAnswerCount(questionId: string): Promise<Question>;
  markAsResolved(questionId: string): Promise<Question>;
  markAsUnresolved(questionId: string): Promise<Question>;
  pinQuestion(questionId: string): Promise<Question>;
  unpinQuestion(questionId: string): Promise<Question>;
}

// 질문 Repository 구현 (SRP)
export class QuestionRepository
  extends BaseRepository<
    Question,
    CreateQuestionData,
    UpdateQuestionData,
    QuestionSearchOptions
  >
  implements IQuestionRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma, "Question");
  }

  async findById(id: string): Promise<Question | null> {
    try {
      return await this.prisma.question.findUnique({
        where: { id },
      });
    } catch (error) {
      this.handleError(error, "findById");
    }
  }

  async findByIdWithDetails(id: string): Promise<QuestionListItem | null> {
    try {
      const question = await this.prisma.question.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              nickname: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      if (!question) return null;

      return {
        id: question.id,
        title: question.title,
        content: question.content,
        author: {
          ...question.author,
          avatar: question.author.avatar || undefined,
        },
        category: question.category
          ? {
              ...question.category,
              color: question.category.color || undefined,
            }
          : undefined,
        tags: question.tags,
        location: question.location || undefined,
        status: question.status,
        isResolved: question.isResolved,
        isPinned: question.isPinned,
        viewCount: question.viewCount,
        likeCount: question.likeCount,
        answerCount: question.answerCount,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
        resolvedAt: question.resolvedAt || undefined,
      };
    } catch (error) {
      this.handleError(error, "findByIdWithDetails");
    }
  }

  async findMany(options: QuestionSearchOptions = {}): Promise<Question[]> {
    try {
      const where = this.buildWhereClause(options);
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );

      return await this.prisma.question.findMany({
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
    options: QuestionSearchOptions & {
      pagination: { page: number; limit: number };
    }
  ): Promise<{ data: Question[]; pagination: any }> {
    try {
      const where = this.buildWhereClause(options);
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );
      const { page, limit } = options.pagination;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.question.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.question.count({ where }),
      ]);

      return this.paginate(data, total, { page, limit });
    } catch (error) {
      this.handleError(error, "findManyPaginated");
    }
  }

  async create(data: CreateQuestionData): Promise<Question> {
    try {
      return await this.prisma.question.create({
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

  async update(id: string, data: UpdateQuestionData): Promise<Question> {
    try {
      return await this.prisma.question.update({
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
      await this.prisma.question.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError(error, "delete");
    }
  }

  async count(options: QuestionSearchOptions = {}): Promise<number> {
    try {
      const where = this.buildWhereClause(options);
      return await this.prisma.question.count({ where });
    } catch (error) {
      this.handleError(error, "count");
    }
  }

  // 질문 특화 메서드
  async findByAuthor(
    authorId: string,
    options: QuestionSearchOptions = {}
  ): Promise<Question[]> {
    try {
      const where = {
        ...this.buildWhereClause(options),
        authorId,
      };
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );

      return await this.prisma.question.findMany({
        where,
        orderBy,
        take: options.pagination?.limit,
        skip: options.pagination
          ? (options.pagination.page - 1) * options.pagination.limit
          : undefined,
      });
    } catch (error) {
      this.handleError(error, "findByAuthor");
    }
  }

  async findByCategory(
    categoryId: string,
    options: QuestionSearchOptions = {}
  ): Promise<Question[]> {
    try {
      const where = {
        ...this.buildWhereClause(options),
        categoryId,
      };
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );

      return await this.prisma.question.findMany({
        where,
        orderBy,
        take: options.pagination?.limit,
        skip: options.pagination
          ? (options.pagination.page - 1) * options.pagination.limit
          : undefined,
      });
    } catch (error) {
      this.handleError(error, "findByCategory");
    }
  }

  async findByTags(
    tags: string[],
    options: QuestionSearchOptions = {}
  ): Promise<Question[]> {
    try {
      const where = {
        ...this.buildWhereClause(options),
        tags: {
          hasSome: tags,
        },
      };
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );

      return await this.prisma.question.findMany({
        where,
        orderBy,
        take: options.pagination?.limit,
        skip: options.pagination
          ? (options.pagination.page - 1) * options.pagination.limit
          : undefined,
      });
    } catch (error) {
      this.handleError(error, "findByTags");
    }
  }

  async searchByText(
    query: string,
    options: QuestionSearchOptions = {}
  ): Promise<Question[]> {
    try {
      const where = {
        ...this.buildWhereClause(options),
        OR: [{ title: { search: query } }, { content: { search: query } }],
      };
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );

      return await this.prisma.question.findMany({
        where,
        orderBy,
        take: options.pagination?.limit,
        skip: options.pagination
          ? (options.pagination.page - 1) * options.pagination.limit
          : undefined,
      });
    } catch (error) {
      this.handleError(error, "searchByText");
    }
  }

  async findPopular(options: QuestionSearchOptions = {}): Promise<Question[]> {
    try {
      const where = this.buildWhereClause(options);
      const orderBy = { likeCount: "desc" as const };

      return await this.prisma.question.findMany({
        where,
        orderBy,
        take: options.pagination?.limit,
        skip: options.pagination
          ? (options.pagination.page - 1) * options.pagination.limit
          : undefined,
      });
    } catch (error) {
      this.handleError(error, "findPopular");
    }
  }

  async findRecent(options: QuestionSearchOptions = {}): Promise<Question[]> {
    try {
      const where = this.buildWhereClause(options);
      const orderBy = { createdAt: "desc" as const };

      return await this.prisma.question.findMany({
        where,
        orderBy,
        take: options.pagination?.limit,
        skip: options.pagination
          ? (options.pagination.page - 1) * options.pagination.limit
          : undefined,
      });
    } catch (error) {
      this.handleError(error, "findRecent");
    }
  }

  async findUnresolved(
    options: QuestionSearchOptions = {}
  ): Promise<Question[]> {
    try {
      const where = {
        ...this.buildWhereClause(options),
        isResolved: false,
      };
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );

      return await this.prisma.question.findMany({
        where,
        orderBy,
        take: options.pagination?.limit,
        skip: options.pagination
          ? (options.pagination.page - 1) * options.pagination.limit
          : undefined,
      });
    } catch (error) {
      this.handleError(error, "findUnresolved");
    }
  }

  // 통계 및 상호작용 메서드
  async getQuestionStats(questionId: string): Promise<QuestionStats> {
    try {
      const question = await this.prisma.question.findUnique({
        where: { id: questionId },
        select: {
          viewCount: true,
          likeCount: true,
          answerCount: true,
          isResolved: true,
          resolvedAt: true,
          createdAt: true,
        },
      });

      if (!question) {
        throw new Error("Question not found");
      }

      return {
        totalViews: question.viewCount,
        totalLikes: question.likeCount,
        totalAnswers: question.answerCount,
        totalBookmarks: 0, // TODO: 북마크 통계 추가
        isResolved: question.isResolved,
        resolutionTime:
          question.resolvedAt && question.isResolved
            ? Math.floor(
                (question.resolvedAt.getTime() - question.createdAt.getTime()) /
                  (1000 * 60)
              )
            : undefined,
        averageAnswerTime: undefined, // TODO: 평균 답변 시간 계산 로직 추가
      };
    } catch (error) {
      this.handleError(error, "getQuestionStats");
    }
  }

  async incrementViewCount(questionId: string): Promise<Question> {
    try {
      return await this.prisma.question.update({
        where: { id: questionId },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      this.handleError(error, "incrementViewCount");
    }
  }

  async updateLikeCount(questionId: string): Promise<Question> {
    try {
      const likeCount = await this.prisma.questionLike.count({
        where: { questionId },
      });

      return await this.prisma.question.update({
        where: { id: questionId },
        data: { likeCount },
      });
    } catch (error) {
      this.handleError(error, "updateLikeCount");
    }
  }

  async updateAnswerCount(questionId: string): Promise<Question> {
    try {
      const answerCount = await this.prisma.answer.count({
        where: { questionId },
      });

      return await this.prisma.question.update({
        where: { id: questionId },
        data: { answerCount },
      });
    } catch (error) {
      this.handleError(error, "updateAnswerCount");
    }
  }

  async markAsResolved(questionId: string): Promise<Question> {
    try {
      return await this.prisma.question.update({
        where: { id: questionId },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error, "markAsResolved");
    }
  }

  async markAsUnresolved(questionId: string): Promise<Question> {
    try {
      return await this.prisma.question.update({
        where: { id: questionId },
        data: {
          isResolved: false,
          resolvedAt: null,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error, "markAsUnresolved");
    }
  }

  async pinQuestion(questionId: string): Promise<Question> {
    try {
      return await this.prisma.question.update({
        where: { id: questionId },
        data: {
          isPinned: true,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error, "pinQuestion");
    }
  }

  async unpinQuestion(questionId: string): Promise<Question> {
    try {
      return await this.prisma.question.update({
        where: { id: questionId },
        data: {
          isPinned: false,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error, "unpinQuestion");
    }
  }

  protected buildWhereClause(options: QuestionSearchOptions): any {
    const where: any = {};

    if (options.query) {
      where.OR = [
        { title: { contains: options.query, mode: "insensitive" } },
        { content: { contains: options.query, mode: "insensitive" } },
      ];
    }

    if (options.categoryId) {
      where.categoryId = options.categoryId;
    }

    if (options.tags && options.tags.length > 0) {
      where.tags = {
        hasSome: options.tags,
      };
    }

    if (options.location) {
      where.location = { contains: options.location, mode: "insensitive" };
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.isResolved !== undefined) {
      where.isResolved = options.isResolved;
    }

    if (options.isPinned !== undefined) {
      where.isPinned = options.isPinned;
    }

    if (options.authorId) {
      where.authorId = options.authorId;
    }

    if (options.dateFrom) {
      where.createdAt = {
        ...where.createdAt,
        gte: options.dateFrom,
      };
    }

    if (options.dateTo) {
      where.createdAt = {
        ...where.createdAt,
        lte: options.dateTo,
      };
    }

    return where;
  }
}
