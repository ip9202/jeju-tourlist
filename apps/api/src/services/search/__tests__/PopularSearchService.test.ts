// @TAG-API-SEARCH-TEST-001
// SPEC: SPEC-FEATURE-SEARCH-001 - Popular Search Terms Backend API Tests

import { PrismaClient } from "@prisma/client";
import { PopularSearchService } from "../PopularSearchService";

// Mock Prisma Client
const mockPrismaClient = {
  question: {
    findMany: jest.fn(),
  },
  $disconnect: jest.fn(),
} as unknown as PrismaClient;

// Sample test data matching Phase 1 seed data structure
const mockQuestions = [
  {
    tags: ["제주도 맛집", "맛집 추천"],
    viewCount: 150,
    likeCount: 25,
    answerCount: 10,
  },
  {
    tags: ["제주도 맛집", "흑돼지"],
    viewCount: 200,
    likeCount: 30,
    answerCount: 15,
  },
  {
    tags: ["한라산 등반", "등산"],
    viewCount: 180,
    likeCount: 28,
    answerCount: 12,
  },
  {
    tags: ["한라산 등반", "트레킹"],
    viewCount: 160,
    likeCount: 22,
    answerCount: 10,
  },
  {
    tags: ["섭지코지", "일출"],
    viewCount: 140,
    likeCount: 20,
    answerCount: 8,
  },
  {
    tags: ["우도 여행", "자전거"],
    viewCount: 130,
    likeCount: 18,
    answerCount: 7,
  },
  {
    tags: ["제주 카페", "카페 추천"],
    viewCount: 120,
    likeCount: 15,
    answerCount: 6,
  },
];

describe("PopularSearchService", () => {
  let service: PopularSearchService;

  beforeEach(() => {
    service = new PopularSearchService(mockPrismaClient);

    // Reset mock implementation before each test
    (mockPrismaClient.question.findMany as jest.Mock).mockResolvedValue(
      mockQuestions
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    service.clearCache();
  });

  describe("getPopularSearchTerms", () => {
    // [T-API-01] Returns array of SearchTerm objects
    it("should return array of SearchTerm objects", async () => {
      const result = await service.getPopularSearchTerms();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(5);
    });

    // [T-API-02] Each SearchTerm has required properties
    it("should return SearchTerm objects with rank, keyword, and popularity", async () => {
      const result = await service.getPopularSearchTerms();

      result.forEach((term) => {
        expect(term).toHaveProperty("rank");
        expect(term).toHaveProperty("keyword");
        expect(term).toHaveProperty("popularity");
        expect(typeof term.rank).toBe("number");
        expect(typeof term.keyword).toBe("string");
        expect(typeof term.popularity).toBe("number");
      });
    });

    // [T-API-03] Popularity calculated correctly
    it("should calculate popularity using formula: viewCount×1 + likeCount×3 + answerCount×2", async () => {
      const result = await service.getPopularSearchTerms();

      result.forEach((term) => {
        expect(term.popularity).toBeGreaterThan(0);
        expect(Number.isInteger(term.popularity)).toBe(true);
      });

      // Verify calculation manually for "제주도 맛집"
      // Question 1: 150 + (25*3) + (10*2) = 150 + 75 + 20 = 245
      // Question 2: 200 + (30*3) + (15*2) = 200 + 90 + 30 = 320
      // Total: 245 + 320 = 565
      const jejuFood = result.find((term) => term.keyword === "제주도 맛집");
      expect(jejuFood).toBeDefined();
      expect(jejuFood?.popularity).toBe(565);
    });

    // [T-API-04] Returns top 5 keywords by popularity (descending order)
    it("should return top 5 keywords sorted by popularity in descending order", async () => {
      const result = await service.getPopularSearchTerms();

      expect(result.length).toBeLessThanOrEqual(5);

      // Verify descending order
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].popularity).toBeGreaterThanOrEqual(
          result[i + 1].popularity
        );
      }

      // Verify ranks are sequential
      result.forEach((term, index) => {
        expect(term.rank).toBe(index + 1);
      });
    });

    // [T-API-05] In-memory cache stores results for 1 hour
    it("should cache results in memory", async () => {
      const firstCall = await service.getPopularSearchTerms();
      const secondCall = await service.getPopularSearchTerms();

      // Should return the same data (cached)
      expect(firstCall).toEqual(secondCall);

      // Prisma should only be called once
      expect(mockPrismaClient.question.findMany).toHaveBeenCalledTimes(1);
    });

    // [T-API-06] Cache invalidation after TTL expiration
    it("should invalidate cache after TTL expiration", async () => {
      // Set a short TTL for testing
      const testService = new PopularSearchService(mockPrismaClient, 100); // 100ms TTL

      await testService.getPopularSearchTerms();

      // First call should hit database
      expect(mockPrismaClient.question.findMany).toHaveBeenCalledTimes(1);

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      await testService.getPopularSearchTerms();

      // Second call should hit database again (cache expired)
      expect(mockPrismaClient.question.findMany).toHaveBeenCalledTimes(2);
    });

    // [T-API-07] Handles database errors gracefully
    it("should throw SearchServiceError on database errors", async () => {
      // Mock a database error
      (mockPrismaClient.question.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      await expect(service.getPopularSearchTerms()).rejects.toThrow(
        "Failed to fetch popular search terms"
      );
    });

    // [T-API-08] Respects custom limit parameter
    it("should respect custom limit parameter", async () => {
      const limit = 3;
      const result = await service.getPopularSearchTerms(limit);

      expect(result.length).toBeLessThanOrEqual(limit);
      expect(result.length).toBe(3);

      // Verify ranks match the limit
      result.forEach((term, index) => {
        expect(term.rank).toBe(index + 1);
      });
    });

    it("should handle empty database gracefully", async () => {
      // Mock empty database
      (mockPrismaClient.question.findMany as jest.Mock).mockResolvedValueOnce(
        []
      );

      const result = await service.getPopularSearchTerms();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should aggregate keywords across multiple questions", async () => {
      const result = await service.getPopularSearchTerms();

      // Verify that we have aggregated data
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(5);

      // Check for expected popular keywords from seed data
      const keywords = result.map((term) => term.keyword);

      // These top keywords should appear based on mock data (most popular ones)
      const topExpectedKeywords = [
        "제주도 맛집",
        "한라산 등반",
      ];

      // The top 2 keywords should definitely be in the results
      topExpectedKeywords.forEach((keyword) => {
        expect(keywords).toContain(keyword);
      });

      // Verify that keywords are sorted properly
      expect(result[0].keyword).toBe("제주도 맛집");
      expect(result[1].keyword).toBe("한라산 등반");
    });

    it("should query only ACTIVE questions", async () => {
      await service.getPopularSearchTerms();

      expect(mockPrismaClient.question.findMany).toHaveBeenCalledWith({
        where: {
          status: "ACTIVE",
        },
        select: {
          tags: true,
          viewCount: true,
          likeCount: true,
          answerCount: true,
        },
      });
    });

    it("should handle different limits correctly", async () => {
      const limits = [1, 3, 5, 10];

      for (const limit of limits) {
        service.clearCache(); // Clear cache between tests
        const result = await service.getPopularSearchTerms(limit);

        // Result should not exceed limit, but might be less if fewer keywords exist
        expect(result.length).toBeLessThanOrEqual(limit);
      }
    });
  });

  describe("Cache Management", () => {
    it("should have clearCache method for testing", () => {
      expect(typeof service.clearCache).toBe("function");
    });

    it("should clear cache when clearCache is called", async () => {
      await service.getPopularSearchTerms();

      // First call should hit database
      expect(mockPrismaClient.question.findMany).toHaveBeenCalledTimes(1);

      service.clearCache();

      // After clearing cache, next call should fetch from database again
      await service.getPopularSearchTerms();
      expect(mockPrismaClient.question.findMany).toHaveBeenCalledTimes(2);
    });

    it("should cache with correct TTL", async () => {
      const customTTL = 500; // 500ms
      const testService = new PopularSearchService(mockPrismaClient, customTTL);

      await testService.getPopularSearchTerms();

      // Immediate second call should use cache
      await testService.getPopularSearchTerms();
      expect(mockPrismaClient.question.findMany).toHaveBeenCalledTimes(1);

      // Call before TTL expires should still use cache
      await new Promise((resolve) => setTimeout(resolve, 300));
      await testService.getPopularSearchTerms();
      expect(mockPrismaClient.question.findMany).toHaveBeenCalledTimes(1);

      // Call after TTL expires should fetch fresh data
      await new Promise((resolve) => setTimeout(resolve, 300));
      await testService.getPopularSearchTerms();
      expect(mockPrismaClient.question.findMany).toHaveBeenCalledTimes(2);
    });
  });

  describe("Popularity Calculation", () => {
    it("should calculate popularity correctly for individual questions", async () => {
      const result = await service.getPopularSearchTerms();

      // "한라산 등반" appears in 2 questions
      // Question 3: 180 + (28*3) + (12*2) = 180 + 84 + 24 = 288
      // Question 4: 160 + (22*3) + (10*2) = 160 + 66 + 20 = 246
      // Total: 288 + 246 = 534
      const hallasan = result.find((term) => term.keyword === "한라산 등반");
      expect(hallasan).toBeDefined();
      expect(hallasan?.popularity).toBe(534);
    });

    it("should rank keywords by aggregated popularity", async () => {
      const result = await service.getPopularSearchTerms();

      // Expected order based on mock data:
      // 1. "제주도 맛집": 565
      // 2. "한라산 등반": 534
      // 3. "섭지코지": 244
      // 4. "우도 여행": 223
      // 5. "제주 카페": 192

      expect(result[0].keyword).toBe("제주도 맛집");
      expect(result[0].rank).toBe(1);
      expect(result[0].popularity).toBe(565);

      expect(result[1].keyword).toBe("한라산 등반");
      expect(result[1].rank).toBe(2);
      expect(result[1].popularity).toBe(534);
    });
  });
});
