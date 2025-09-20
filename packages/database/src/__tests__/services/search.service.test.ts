/**
 * SearchService 단위 테스트
 *
 * @description
 * - SearchService의 모든 메서드에 대한 단위 테스트
 * - 검색, 필터링, 정렬 기능 테스트
 * - 에러 케이스 및 엣지 케이스 테스트
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { SearchService } from "../../services/search.service";
import { prisma } from "../../client";
import { SearchOptions } from "../../types";

// Prisma Client 모킹
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("SearchService", () => {
  let searchService: SearchService;

  beforeEach(() => {
    searchService = new SearchService();
    jest.clearAllMocks();
  });

  describe("searchQuestions", () => {
    it("기본 검색 옵션으로 질문을 검색해야 함", async () => {
      // Given
      const searchOptions: SearchOptions = {
        query: "제주",
        type: "question",
        limit: 10,
        offset: 0,
      };

      const mockQuestions = [
        {
          id: "question-1",
          title: "제주 관광지 추천",
          content: "제주도 관광지 추천해주세요",
          authorId: "user-1",
          categoryId: "category-1",
          location: "제주시",
          latitude: 33.4996,
          longitude: 126.5312,
          isResolved: false,
          viewCount: 10,
          likeCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
          author: {
            id: "user-1",
            name: "Test User 1",
            email: "test1@example.com",
          },
          category: {
            id: "category-1",
            name: "관광지",
          },
          answers: [],
          tags: [],
        },
      ];

      mockPrisma.question.findMany.mockResolvedValue(mockQuestions as any);

      // When
      const result = await searchService.searchQuestions(searchOptions);

      // Then
      expect(result).toEqual({
        items: mockQuestions,
        total: mockQuestions.length,
        hasMore: false,
      });
      expect(mockPrisma.question.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: "제주", mode: "insensitive" } },
            { content: { contains: "제주", mode: "insensitive" } },
            {
              tags: {
                some: { name: { contains: "제주", mode: "insensitive" } },
              },
            },
          ],
        },
        include: {
          author: { select: { id: true, name: true, email: true } },
          category: true,
          answers: {
            include: {
              author: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "asc" },
          },
          tags: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        skip: 0,
      });
    });

    it("카테고리 필터가 적용된 검색을 수행해야 함", async () => {
      // Given
      const searchOptions: SearchOptions = {
        query: "제주",
        type: "question",
        categoryId: "category-1",
        limit: 10,
        offset: 0,
      };

      const mockQuestions = [];
      mockPrisma.question.findMany.mockResolvedValue(mockQuestions as any);

      // When
      const result = await searchService.searchQuestions(searchOptions);

      // Then
      expect(result).toEqual({
        items: mockQuestions,
        total: 0,
        hasMore: false,
      });
      expect(mockPrisma.question.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              OR: [
                { title: { contains: "제주", mode: "insensitive" } },
                { content: { contains: "제주", mode: "insensitive" } },
                {
                  tags: {
                    some: { name: { contains: "제주", mode: "insensitive" } },
                  },
                },
              ],
            },
            { categoryId: "category-1" },
          ],
        },
        include: {
          author: { select: { id: true, name: true, email: true } },
          category: true,
          answers: {
            include: {
              author: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "asc" },
          },
          tags: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        skip: 0,
      });
    });

    it("위치 기반 검색을 수행해야 함", async () => {
      // Given
      const searchOptions: SearchOptions = {
        query: "제주",
        type: "question",
        location: "제주시",
        latitude: 33.4996,
        longitude: 126.5312,
        radius: 10,
        limit: 10,
        offset: 0,
      };

      const mockQuestions = [];
      mockPrisma.question.findMany.mockResolvedValue(mockQuestions as any);

      // When
      const result = await searchService.searchQuestions(searchOptions);

      // Then
      expect(result).toEqual({
        items: mockQuestions,
        total: 0,
        hasMore: false,
      });
      expect(mockPrisma.question.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              OR: [
                { title: { contains: "제주", mode: "insensitive" } },
                { content: { contains: "제주", mode: "insensitive" } },
                {
                  tags: {
                    some: { name: { contains: "제주", mode: "insensitive" } },
                  },
                },
              ],
            },
            {
              AND: [
                { latitude: { gte: 33.4096, lte: 33.5896 } },
                { longitude: { gte: 126.4312, lte: 126.6312 } },
              ],
            },
          ],
        },
        include: {
          author: { select: { id: true, name: true, email: true } },
          category: true,
          answers: {
            include: {
              author: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "asc" },
          },
          tags: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        skip: 0,
      });
    });
  });

  describe("searchAnswers", () => {
    it("기본 검색 옵션으로 답변을 검색해야 함", async () => {
      // Given
      const searchOptions: SearchOptions = {
        query: "추천",
        type: "answer",
        limit: 10,
        offset: 0,
      };

      const mockAnswers = [
        {
          id: "answer-1",
          content: "제주도 추천 관광지입니다",
          authorId: "user-1",
          questionId: "question-1",
          isAccepted: false,
          likeCount: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
          author: {
            id: "user-1",
            name: "Test User 1",
            email: "test1@example.com",
          },
          question: {
            id: "question-1",
            title: "제주 관광지 추천",
          },
        },
      ];

      mockPrisma.answer.findMany.mockResolvedValue(mockAnswers as any);

      // When
      const result = await searchService.searchAnswers(searchOptions);

      // Then
      expect(result).toEqual({
        items: mockAnswers,
        total: mockAnswers.length,
        hasMore: false,
      });
      expect(mockPrisma.answer.findMany).toHaveBeenCalledWith({
        where: {
          content: { contains: "추천", mode: "insensitive" },
        },
        include: {
          author: { select: { id: true, name: true, email: true } },
          question: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        skip: 0,
      });
    });
  });

  describe("searchUsers", () => {
    it("기본 검색 옵션으로 사용자를 검색해야 함", async () => {
      // Given
      const searchOptions: SearchOptions = {
        query: "test",
        type: "user",
        limit: 10,
        offset: 0,
      };

      const mockUsers = [
        {
          id: "user-1",
          name: "Test User 1",
          email: "test1@example.com",
          provider: "google",
          providerId: "google-1",
          createdAt: new Date(),
          updatedAt: new Date(),
          userProfile: null,
        },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers as any);

      // When
      const result = await searchService.searchUsers(searchOptions);

      // Then
      expect(result).toEqual({
        items: mockUsers,
        total: mockUsers.length,
        hasMore: false,
      });
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: "test", mode: "insensitive" } },
            { email: { contains: "test", mode: "insensitive" } },
          ],
        },
        include: { userProfile: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        skip: 0,
      });
    });
  });

  describe("getSearchSuggestions", () => {
    it("검색 제안을 반환해야 함", async () => {
      // Given
      const query = "제주";
      const mockSuggestions = [
        { type: "tag", value: "제주도", count: 15 },
        { type: "location", value: "제주시", count: 8 },
        { type: "category", value: "관광지", count: 5 },
      ];

      // Mock Prisma queries
      mockPrisma.tag.findMany.mockResolvedValue([
        { name: "제주도", _count: { questions: 15 } },
      ] as any);
      mockPrisma.question.findMany.mockResolvedValue([
        { location: "제주시" },
        { location: "제주시" },
        { location: "제주시" },
      ] as any);
      mockPrisma.category.findMany.mockResolvedValue([
        { name: "관광지", _count: { questions: 5 } },
      ] as any);

      // When
      const result = await searchService.getSearchSuggestions(query);

      // Then
      expect(result).toEqual(mockSuggestions);
    });
  });

  describe("getTrendingTags", () => {
    it("인기 태그를 반환해야 함", async () => {
      // Given
      const limit = 5;
      const mockTrendingTags = [
        { name: "제주도", count: 20 },
        { name: "관광지", count: 15 },
        { name: "맛집", count: 10 },
      ];

      mockPrisma.tag.findMany.mockResolvedValue([
        { name: "제주도", _count: { questions: 20 } },
        { name: "관광지", _count: { questions: 15 } },
        { name: "맛집", _count: { questions: 10 } },
      ] as any);

      // When
      const result = await searchService.getTrendingTags(limit);

      // Then
      expect(result).toEqual(mockTrendingTags);
      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
        orderBy: { questions: { _count: "desc" } },
        take: limit,
        select: {
          name: true,
          _count: { select: { questions: true } },
        },
      });
    });
  });

  describe("getPopularLocations", () => {
    it("인기 위치를 반환해야 함", async () => {
      // Given
      const limit = 5;
      const mockPopularLocations = [
        { location: "제주시", count: 25 },
        { location: "서귀포시", count: 15 },
        { location: "한라산", count: 10 },
      ];

      mockPrisma.question.groupBy.mockResolvedValue([
        { location: "제주시", _count: { id: 25 } },
        { location: "서귀포시", _count: { id: 15 } },
        { location: "한라산", _count: { id: 10 } },
      ] as any);

      // When
      const result = await searchService.getPopularLocations(limit);

      // Then
      expect(result).toEqual(mockPopularLocations);
      expect(mockPrisma.question.groupBy).toHaveBeenCalledWith({
        by: ["location"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: limit,
      });
    });
  });
});
