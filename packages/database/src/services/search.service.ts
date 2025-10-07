import { PrismaClient } from "@prisma/client";
import { QuestionSearchOptions, AnswerSearchOptions } from "../types";

/**
 * 검색 서비스 인터페이스
 *
 * @description
 * 질문, 답변, 사용자 등의 검색 기능을 정의하는 인터페이스입니다.
 * 전문 검색, 태그 검색, 지역 검색 등 다양한 검색 방식을 지원합니다.
 *
 * @interface ISearchService
 * @since 1.0.0
 */
// 검색 서비스 인터페이스 (ISP)
export interface ISearchService {
  searchQuestions(options: QuestionSearchOptions): Promise<any[]>;
  searchAnswers(options: AnswerSearchOptions): Promise<any[]>;
  searchByFullText(query: string, options?: any): Promise<any[]>;
  searchByTags(tags: string[], options?: any): Promise<any[]>;
  searchByLocation(location: string, options?: any): Promise<any[]>;
  getSearchSuggestions(query: string, limit?: number): Promise<string[]>;
  getPopularTags(
    limit?: number
  ): Promise<Array<{ tag: string; count: number }>>;
  getPopularLocations(
    limit?: number
  ): Promise<Array<{ location: string; count: number }>>;
}

// 검색 서비스 구현 (SRP)

/**
 * 검색 서비스 클래스
 *
 * @description
 * 제주도 동네물어봐 서비스의 통합 검색 기능을 제공합니다.
 * 다양한 검색 알고리즘과 필터링 옵션을 통해 사용자가 원하는 정보를 빠르게 찾을 수 있도록 합니다.
 *
 * **주요 검색 기능:**
 * - 전문 검색 (Full-text Search): 제목, 내용에서 키워드 검색
 * - 태그 검색: 해시태그 기반 질문 검색
 * - 지역 검색: 제주도 지역별 질문 필터링
 * - 자동 완성: 검색어 추천 기능
 * - 인기 검색어: 자주 검색되는 태그와 지역 제공
 *
 * **검색 알고리즘:**
 * - 관련성 점수 기반 정렬
 * - 시간 가중치 적용 (최신 게시물 우선)
 * - 사용자 활동 기반 개인화
 *
 * **SOLID 원칙 적용:**
 * - SRP: 검색 로직만 담당
 * - OCP: 새로운 검색 알고리즘 추가 가능
 * - LSP: ISearchService 완전 구현
 * - ISP: 검색 관련 메서드만 포함
 * - DIP: Repository 인터페이스에 의존
 *
 * @class SearchService
 * @implements ISearchService
 *
 * @example
 * ```typescript
 * const searchService = new SearchService(prisma);
 *
 * // 키워드 검색
 * const questions = await searchService.searchQuestions({
 *   query: "제주도 맛집",
 *   location: "제주시",
 *   pagination: { page: 1, limit: 10 }
 * });
 *
 * // 태그 검색
 * const taggedQuestions = await searchService.searchByTags(["맛집", "카페"]);
 *
 * // 인기 태그 조회
 * const popularTags = await searchService.getPopularTags(10);
 * ```
 *
 * @since 1.0.0
 */
export class SearchService implements ISearchService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async searchQuestions(options: QuestionSearchOptions): Promise<any[]> {
    try {
      const where = this.buildQuestionSearchWhere(options);
      const orderBy = this.buildOrderBy(options.sortBy, options.sortOrder);

      return await this.prisma.question.findMany({
        where,
        orderBy,
        take: options.pagination?.limit,
        skip: options.pagination
          ? (options.pagination.page - 1) * options.pagination.limit
          : undefined,
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
            },
          },
        },
      });
    } catch (error) {
      console.error("Error searching questions:", error);
      throw new Error("Failed to search questions");
    }
  }

  async searchAnswers(options: AnswerSearchOptions): Promise<any[]> {
    try {
      const where = this.buildAnswerSearchWhere(options);
      const orderBy = this.buildOrderBy(options.sortBy, options.sortOrder);

      return await this.prisma.answer.findMany({
        where,
        orderBy,
        take: options.pagination?.limit,
        skip: options.pagination
          ? (options.pagination.page - 1) * options.pagination.limit
          : undefined,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              nickname: true,
              avatar: true,
            },
          },
          question: {
            select: {
              id: true,
              title: true,
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
      });
    } catch (error) {
      console.error("Error searching answers:", error);
      throw new Error("Failed to search answers");
    }
  }

  async searchByFullText(query: string, options: any = {}): Promise<any[]> {
    try {
      // PostgreSQL Full-Text Search 사용
      const searchTerms = query.split(" ").join(" & ");

      return await this.prisma.question.findMany({
        where: {
          OR: [
            {
              title: {
                search: searchTerms,
              },
            },
            {
              content: {
                search: searchTerms,
              },
            },
          ],
          ...options.filters,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: options.limit || 20,
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
      console.error("Error in full-text search:", error);
      throw new Error("Failed to perform full-text search");
    }
  }

  async searchByTags(tags: string[], options: any = {}): Promise<any[]> {
    try {
      return await this.prisma.question.findMany({
        where: {
          tags: {
            hasSome: tags,
          },
          ...options.filters,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: options.limit || 20,
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
      console.error("Error searching by tags:", error);
      throw new Error("Failed to search by tags");
    }
  }

  async searchByLocation(location: string, options: any = {}): Promise<any[]> {
    try {
      return await this.prisma.question.findMany({
        where: {
          location: {
            contains: location,
            mode: "insensitive",
          },
          ...options.filters,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: options.limit || 20,
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
      console.error("Error searching by location:", error);
      throw new Error("Failed to search by location");
    }
  }

  async getSearchSuggestions(
    query: string,
    limit: number = 10
  ): Promise<string[]> {
    try {
      // 질문 제목에서 자동완성 제안 생성
      const suggestions = await this.prisma.question.findMany({
        where: {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        select: {
          title: true,
        },
        take: limit,
        orderBy: {
          viewCount: "desc",
        },
      });

      return suggestions.map((s: any) => s.title);
    } catch (error) {
      console.error("Error getting search suggestions:", error);
      return [];
    }
  }

  async getPopularTags(
    limit: number = 20
  ): Promise<Array<{ tag: string; count: number }>> {
    try {
      // 모든 질문의 태그를 수집하고 인기순으로 정렬
      const questions = await this.prisma.question.findMany({
        select: {
          tags: true,
        },
        where: {
          status: "ACTIVE",
        },
      });

      const tagCounts = new Map<string, number>();

      questions.forEach((question: any) => {
        question.tags.forEach((tag: string) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      });

      return Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting popular tags:", error);
      return [];
    }
  }

  async getPopularLocations(
    limit: number = 20
  ): Promise<Array<{ location: string; count: number }>> {
    try {
      const locations = await this.prisma.question.groupBy({
        by: ["location"],
        where: {
          location: {
            not: null,
          },
          status: "ACTIVE",
        },
        _count: {
          location: true,
        },
        orderBy: {
          _count: {
            location: "desc",
          },
        },
        take: limit,
      });

      return locations
        .filter((loc: any) => loc.location)
        .map((loc: any) => ({
          location: loc.location!,
          count: loc._count.location,
        }));
    } catch (error) {
      console.error("Error getting popular locations:", error);
      return [];
    }
  }

  private buildQuestionSearchWhere(options: QuestionSearchOptions): any {
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
      where.location = {
        contains: options.location,
        mode: "insensitive",
      };
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

  private buildAnswerSearchWhere(options: AnswerSearchOptions): any {
    const where: any = {};

    if (options.questionId) {
      where.questionId = options.questionId;
    }

    if (options.authorId) {
      where.authorId = options.authorId;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.isAccepted !== undefined) {
      where.isAccepted = options.isAccepted;
    }

    return where;
  }

  private buildOrderBy(sortBy?: string, sortOrder?: "asc" | "desc"): any {
    if (!sortBy) return { createdAt: "desc" };

    return {
      [sortBy]: sortOrder || "desc",
    };
  }
}
