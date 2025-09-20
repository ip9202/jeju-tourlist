/**
 * QuestionRepository 단위 테스트
 *
 * @description
 * - QuestionRepository의 모든 메서드에 대한 단위 테스트
 * - 질문 CRUD, 검색, 필터링, 통계 기능 테스트
 * - 에러 케이스 및 엣지 케이스 테스트
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { QuestionRepository } from "../../repositories/question.repository";
import { prisma } from "../../client";
import {
  CreateQuestionData,
  UpdateQuestionData,
  QuestionSearchOptions,
} from "../../types";

// Prisma Client 모킹
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("QuestionRepository", () => {
  let questionRepository: QuestionRepository;

  beforeEach(() => {
    questionRepository = new QuestionRepository();
    jest.clearAllMocks();
  });

  describe("findById", () => {
    it("존재하는 질문 ID로 조회 시 질문 정보를 반환해야 함", async () => {
      // Given
      const questionId = "question-123";
      const mockQuestion = {
        id: questionId,
        title: "Test Question",
        content: "This is a test question",
        authorId: "user-123",
        categoryId: "category-1",
        location: "제주시",
        latitude: 33.4996,
        longitude: 126.5312,
        isResolved: false,
        viewCount: 0,
        likeCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
        },
        category: {
          id: "category-1",
          name: "관광지",
        },
        answers: [],
        tags: [],
      };

      mockPrisma.question.findUnique.mockResolvedValue(mockQuestion as any);

      // When
      const result = await questionRepository.findById(questionId);

      // Then
      expect(result).toEqual(mockQuestion);
      expect(mockPrisma.question.findUnique).toHaveBeenCalledWith({
        where: { id: questionId },
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
      });
    });

    it("존재하지 않는 질문 ID로 조회 시 null을 반환해야 함", async () => {
      // Given
      const questionId = "non-existent-question";
      mockPrisma.question.findUnique.mockResolvedValue(null);

      // When
      const result = await questionRepository.findById(questionId);

      // Then
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("유효한 질문 데이터로 생성 시 질문을 생성해야 함", async () => {
      // Given
      const questionData: CreateQuestionData = {
        title: "New Question",
        content: "This is a new question",
        authorId: "user-123",
        categoryId: "category-1",
        location: "제주시",
        latitude: 33.4996,
        longitude: 126.5312,
        tags: ["제주", "관광"],
      };

      const mockCreatedQuestion = {
        id: "question-456",
        ...questionData,
        isResolved: false,
        viewCount: 0,
        likeCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
        },
        category: {
          id: "category-1",
          name: "관광지",
        },
        answers: [],
        tags: [],
      };

      mockPrisma.question.create.mockResolvedValue(mockCreatedQuestion as any);

      // When
      const result = await questionRepository.create(questionData);

      // Then
      expect(result).toEqual(mockCreatedQuestion);
      expect(mockPrisma.question.create).toHaveBeenCalledWith({
        data: {
          ...questionData,
          tags: {
            connectOrCreate: questionData.tags?.map(tag => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
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
      });
    });
  });

  describe("update", () => {
    it("유효한 질문 ID와 데이터로 업데이트 시 질문을 업데이트해야 함", async () => {
      // Given
      const questionId = "question-123";
      const updateData: UpdateQuestionData = {
        title: "Updated Question",
        content: "This is an updated question",
      };

      const mockUpdatedQuestion = {
        id: questionId,
        title: "Updated Question",
        content: "This is an updated question",
        authorId: "user-123",
        categoryId: "category-1",
        location: "제주시",
        latitude: 33.4996,
        longitude: 126.5312,
        isResolved: false,
        viewCount: 0,
        likeCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
        },
        category: {
          id: "category-1",
          name: "관광지",
        },
        answers: [],
        tags: [],
      };

      mockPrisma.question.update.mockResolvedValue(mockUpdatedQuestion as any);

      // When
      const result = await questionRepository.update(questionId, updateData);

      // Then
      expect(result).toEqual(mockUpdatedQuestion);
      expect(mockPrisma.question.update).toHaveBeenCalledWith({
        where: { id: questionId },
        data: updateData,
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
      });
    });
  });

  describe("delete", () => {
    it("존재하는 질문 ID로 삭제 시 질문을 삭제해야 함", async () => {
      // Given
      const questionId = "question-123";
      const mockDeletedQuestion = {
        id: questionId,
        title: "Test Question",
        content: "This is a test question",
        authorId: "user-123",
        categoryId: "category-1",
        location: "제주시",
        latitude: 33.4996,
        longitude: 126.5312,
        isResolved: false,
        viewCount: 0,
        likeCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
        },
        category: {
          id: "category-1",
          name: "관광지",
        },
        answers: [],
        tags: [],
      };

      mockPrisma.question.delete.mockResolvedValue(mockDeletedQuestion as any);

      // When
      const result = await questionRepository.delete(questionId);

      // Then
      expect(result).toEqual(mockDeletedQuestion);
      expect(mockPrisma.question.delete).toHaveBeenCalledWith({
        where: { id: questionId },
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
      });
    });
  });

  describe("search", () => {
    it("검색 옵션에 따라 질문을 검색해야 함", async () => {
      // Given
      const searchOptions: QuestionSearchOptions = {
        query: "제주",
        categoryId: "category-1",
        location: "제주시",
        isResolved: false,
        limit: 10,
        offset: 0,
        sortBy: "createdAt",
        sortOrder: "desc",
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
      const result = await questionRepository.search(searchOptions);

      // Then
      expect(result).toEqual(mockQuestions);
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
            { location: { contains: "제주시", mode: "insensitive" } },
            { isResolved: false },
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

  describe("incrementViewCount", () => {
    it("질문 조회수를 증가시켜야 함", async () => {
      // Given
      const questionId = "question-123";
      const mockUpdatedQuestion = {
        id: questionId,
        viewCount: 1,
      };

      mockPrisma.question.update.mockResolvedValue(mockUpdatedQuestion as any);

      // When
      const result = await questionRepository.incrementViewCount(questionId);

      // Then
      expect(result).toEqual(mockUpdatedQuestion);
      expect(mockPrisma.question.update).toHaveBeenCalledWith({
        where: { id: questionId },
        data: { viewCount: { increment: 1 } },
        select: { id: true, viewCount: true },
      });
    });
  });

  describe("getPopularQuestions", () => {
    it("인기 질문 목록을 반환해야 함", async () => {
      // Given
      const limit = 5;
      const mockPopularQuestions = [
        {
          id: "question-1",
          title: "Popular Question 1",
          viewCount: 100,
          likeCount: 20,
        },
        {
          id: "question-2",
          title: "Popular Question 2",
          viewCount: 80,
          likeCount: 15,
        },
      ];

      mockPrisma.question.findMany.mockResolvedValue(
        mockPopularQuestions as any
      );

      // When
      const result = await questionRepository.getPopularQuestions(limit);

      // Then
      expect(result).toEqual(mockPopularQuestions);
      expect(mockPrisma.question.findMany).toHaveBeenCalledWith({
        where: { isResolved: false },
        orderBy: [{ likeCount: "desc" }, { viewCount: "desc" }],
        take: limit,
        select: {
          id: true,
          title: true,
          viewCount: true,
          likeCount: true,
        },
      });
    });
  });
});
