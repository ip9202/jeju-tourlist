// @ts-expect-error Prisma client type recognition issue in monorepo
import { PrismaClient } from "@prisma/client";
import { QuestionSearchOptions, AnswerSearchOptions } from "../types";

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
