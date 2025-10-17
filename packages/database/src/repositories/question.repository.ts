import { PrismaClient, Question } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import {
  CreateQuestionData,
  UpdateQuestionData,
  QuestionSearchOptions,
  QuestionStats,
  QuestionListItem,
} from "../types/question";

/**
 * 질문 Repository 인터페이스
 *
 * @description
 * 질문 관련 데이터 접근 인터페이스를 정의합니다.
 * 질문 CRUD, 검색, 통계, 좋아요/북마크 등의 기능을 포함합니다.
 *
 * @interface IQuestionRepository
 * @since 1.0.0
 */
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

/**
 * 질문 Repository 클래스
 *
 * @description
 * 제주도 동네물어봐 서비스의 질문 관련 데이터베이스 작업을 담당합니다.
 *
 * **주요 기능:**
 * - 질문 CRUD (생성, 조회, 수정, 삭제)
 * - 질문 검색 및 필터링 (카테고리, 태그, 지역별)
 * - 조회수, 좋아요 수, 답변 수 관리
 * - 질문 상태 관리 (활성, 해결됨, 삭제됨)
 *
 * **SOLID 원칙 적용:**
 * - SRP: 질문 데이터 접근만 담당
 * - OCP: BaseRepository 확장으로 기능 추가
 * - LSP: IQuestionRepository 완전 구현
 * - ISP: 질문 관련 메서드만 포함
 * - DIP: 인터페이스에 의존
 *
 * @class QuestionRepository
 * @extends BaseRepository
 * @implements IQuestionRepository
 *
 * @example
 * ```typescript
 * const questionRepo = new QuestionRepository(prisma);
 *
 * // 질문 생성
 * const newQuestion = await questionRepo.create({
 *   title: "제주도 맛집 추천해주세요",
 *   content: "제주시 근처 맛집을 찾고 있어요",
 *   authorId: "user123",
 *   categoryId: "food",
 *   tags: ["맛집", "제주시"],
 *   location: "제주시"
 * });
 * ```
 *
 * @since 1.0.0
 */
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
      const { authorId, ...questionData } = data;
      return await this.prisma.question.create({
        data: {
          ...questionData,
          authorId: authorId || "", // authorId가 없으면 빈 문자열로 설정
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
