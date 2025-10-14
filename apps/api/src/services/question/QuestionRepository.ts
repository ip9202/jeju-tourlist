import { PrismaClient, Question, QuestionStatus, Prisma } from "@prisma/client";
import {
  CreateQuestionData,
  UpdateQuestionData,
  QuestionSearchOptions,
  QuestionListItem,
} from "@jeju-tourlist/database/src/types/question";
import { PaginationParams } from "../../types";

/**
 * 질문 Repository 클래스
 *
 * @description
 * - 질문 관련 데이터베이스 작업을 담당
 * - Repository 패턴을 통해 데이터 접근 로직을 캡슐화
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 *
 * @example
 * ```typescript
 * const questionRepo = new QuestionRepository(prisma);
 * const questions = await questionRepo.findMany({ page: 1, limit: 10 });
 * ```
 */
export class QuestionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * 질문 생성
   *
   * @param data - 질문 생성 데이터
   * @returns 생성된 질문 정보
   * @throws {Error} 데이터 검증 실패 시 에러 발생
   */
  async create(data: CreateQuestionData): Promise<Question> {
    try {
      return await this.prisma.question.create({
        data: {
          title: data.title,
          content: data.content,
          authorId: data.authorId,
          categoryId: data.categoryId,
          tags: data.tags,
          attachments: data.attachments || [],
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          status: "ACTIVE",
          isResolved: false,
          isPinned: false,
        },
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
    } catch (error) {
      throw new Error(
        `질문 생성 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 질문 ID로 조회
   *
   * @param id - 질문 ID
   * @returns 질문 정보 또는 null
   */
  async findById(id: string): Promise<Question | null> {
    try {
      return await this.prisma.question.findUnique({
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
          answers: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  nickname: true,
                  avatar: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });
    } catch (error) {
      throw new Error(
        `질문 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 질문 목록 조회 (페이지네이션)
   *
   * @param options - 검색 옵션
   * @returns 질문 목록과 페이지네이션 정보
   */
  async findMany(options: QuestionSearchOptions & PaginationParams): Promise<{
    questions: QuestionListItem[];
    total: number;
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        query,
        categoryId,
        tags,
        location,
        status,
        isResolved,
        isPinned,
        authorId,
        dateFrom,
        dateTo,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      // 검색 조건 구성
      const where: Prisma.QuestionWhereInput = {
        status: status || "ACTIVE",
        ...(isResolved !== undefined && { isResolved }),
        ...(isPinned !== undefined && { isPinned }),
        ...(authorId && { authorId }),
        ...(categoryId && { categoryId }),
        ...(location && { location: { contains: location } }),
        ...(tags && tags.length > 0 && { tags: { hasSome: tags } }),
        ...(dateFrom && { createdAt: { gte: dateFrom } }),
        ...(dateTo && { createdAt: { lte: dateTo } }),
        ...(query && {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
            { tags: { hasSome: [query] } },
          ],
        }),
      };

      // 정렬 조건 구성
      const orderBy: Prisma.QuestionOrderByWithRelationInput = {
        [sortBy]: sortOrder,
      };

      // 페이지네이션 계산
      const skip = (page - 1) * limit;

      // 병렬 실행으로 성능 최적화
      const [questions, total] = await Promise.all([
        this.prisma.question.findMany({
          where,
          orderBy,
          skip,
          take: limit,
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
            _count: {
              select: {
                answers: true,
                likes: true,
                bookmarks: true,
              },
            },
          },
        }),
        this.prisma.question.count({ where }),
      ]);

      // QuestionListItem 형태로 변환
      const questionListItems: QuestionListItem[] = questions.map(question => ({
        id: question.id,
        title: question.title,
        content: question.content,
        author: {
          id: question.author.id,
          name: question.author.name,
          nickname: question.author.nickname,
          avatar: question.author.avatar,
        },
        category: question.category
          ? {
              id: question.category.id,
              name: question.category.name,
              color: question.category.color,
            }
          : undefined,
        tags: question.tags,
        location: question.location,
        status: question.status as "ACTIVE" | "CLOSED" | "DELETED" | "HIDDEN",
        isResolved: question.isResolved,
        isPinned: question.isPinned,
        viewCount: question.viewCount,
        likeCount: question.likeCount,
        answerCount: question._count.answers,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
        resolvedAt: question.resolvedAt,
      }));

      const totalPages = Math.ceil(total / limit);

      return {
        questions: questionListItems,
        total,
        pagination: {
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(
        `질문 목록 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 질문 수정
   *
   * @param id - 질문 ID
   * @param data - 수정할 데이터
   * @returns 수정된 질문 정보
   * @throws {Error} 질문을 찾을 수 없거나 권한이 없을 때 에러 발생
   */
  async update(id: string, data: UpdateQuestionData): Promise<Question> {
    try {
      return await this.prisma.question.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.content && { content: data.content }),
          ...(data.categoryId && { categoryId: data.categoryId }),
          ...(data.tags && { tags: data.tags }),
          ...(data.location && { location: data.location }),
          ...(data.latitude && { latitude: data.latitude }),
          ...(data.longitude && { longitude: data.longitude }),
          ...(data.status && { status: data.status as QuestionStatus }),
          ...(data.isResolved !== undefined && { isResolved: data.isResolved }),
          ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
          updatedAt: new Date(),
        },
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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error("질문을 찾을 수 없습니다.");
      }
      throw new Error(
        `질문 수정 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 질문 삭제 (소프트 삭제)
   *
   * @param id - 질문 ID
   * @returns 삭제된 질문 정보
   * @throws {Error} 질문을 찾을 수 없을 때 에러 발생
   */
  async delete(id: string): Promise<Question> {
    try {
      return await this.prisma.question.update({
        where: { id },
        data: {
          status: "DELETED",
          updatedAt: new Date(),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              nickname: true,
              avatar: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error("질문을 찾을 수 없습니다.");
      }
      throw new Error(
        `질문 삭제 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 질문 조회수 증가
   *
   * @param id - 질문 ID
   * @returns 업데이트된 조회수
   */
  async incrementViewCount(id: string): Promise<number> {
    try {
      const result = await this.prisma.question.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
        select: {
          viewCount: true,
        },
      });
      return result.viewCount;
    } catch (error) {
      throw new Error(
        `조회수 증가 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 질문 좋아요 수 증가
   *
   * @param id - 질문 ID
   * @returns 업데이트된 좋아요 수
   */
  async incrementLikeCount(id: string): Promise<number> {
    try {
      const result = await this.prisma.question.update({
        where: { id },
        data: {
          likeCount: {
            increment: 1,
          },
        },
        select: {
          likeCount: true,
        },
      });
      return result.likeCount;
    } catch (error) {
      throw new Error(
        `좋아요 수 증가 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 질문 좋아요 수 감소
   *
   * @param id - 질문 ID
   * @returns 업데이트된 좋아요 수
   */
  async decrementLikeCount(id: string): Promise<number> {
    try {
      const result = await this.prisma.question.update({
        where: { id },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
        select: {
          likeCount: true,
        },
      });
      return result.likeCount;
    } catch (error) {
      throw new Error(
        `좋아요 수 감소 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 질문 해결 상태 변경
   *
   * @param id - 질문 ID
   * @param isResolved - 해결 상태
   * @returns 업데이트된 질문 정보
   */
  async updateResolvedStatus(
    id: string,
    isResolved: boolean
  ): Promise<Question> {
    try {
      return await this.prisma.question.update({
        where: { id },
        data: {
          isResolved,
          resolvedAt: isResolved ? new Date() : null,
          updatedAt: new Date(),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              nickname: true,
              avatar: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error("질문을 찾을 수 없습니다.");
      }
      throw new Error(
        `해결 상태 변경 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 인기 질문 조회 (조회수 기준)
   *
   * @param limit - 조회할 개수
   * @returns 인기 질문 목록
   */
  async findPopular(limit: number = 10): Promise<QuestionListItem[]> {
    try {
      const questions = await this.prisma.question.findMany({
        where: {
          status: "ACTIVE",
        },
        orderBy: [
          { viewCount: "desc" },
          { likeCount: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
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
          _count: {
            select: {
              answers: true,
              likes: true,
              bookmarks: true,
            },
          },
        },
      });

      return questions.map(question => ({
        id: question.id,
        title: question.title,
        content: question.content,
        author: {
          id: question.author.id,
          name: question.author.name,
          nickname: question.author.nickname,
          avatar: question.author.avatar,
        },
        category: question.category
          ? {
              id: question.category.id,
              name: question.category.name,
              color: question.category.color,
            }
          : undefined,
        tags: question.tags,
        location: question.location,
        status: question.status as "ACTIVE" | "CLOSED" | "DELETED" | "HIDDEN",
        isResolved: question.isResolved,
        isPinned: question.isPinned,
        viewCount: question.viewCount,
        likeCount: question.likeCount,
        answerCount: question._count.answers,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
        resolvedAt: question.resolvedAt,
      }));
    } catch (error) {
      throw new Error(
        `인기 질문 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }
}
