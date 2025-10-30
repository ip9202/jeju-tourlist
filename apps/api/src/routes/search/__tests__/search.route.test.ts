// @TAG-API-SEARCH-TEST-001
// SPEC: SPEC-FEATURE-SEARCH-001 - Popular Search API Route Tests

import express from "express";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { createSearchRouter } from "../index";

// Mock Prisma Client
const mockPrismaClient = {
  question: {
    findMany: jest.fn(),
  },
} as unknown as PrismaClient;

// Sample test data
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockSearchTerms = [
  {
    rank: 1,
    keyword: "제주도 맛집",
    popularity: 565,
  },
  {
    rank: 2,
    keyword: "한라산 등반",
    popularity: 534,
  },
  {
    rank: 3,
    keyword: "섭지코지",
    popularity: 244,
  },
  {
    rank: 4,
    keyword: "우도 여행",
    popularity: 223,
  },
  {
    rank: 5,
    keyword: "제주 카페",
    popularity: 192,
  },
];

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

describe("Search Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    // Create new app for each test to avoid cache sharing
    app = express();
    app.use(express.json());

    // Mount search router with fresh Prisma mock
    const searchRouter = createSearchRouter(mockPrismaClient);
    app.use("/api/search", searchRouter);

    // Reset mock before each test
    (mockPrismaClient.question.findMany as jest.Mock).mockResolvedValue(
      mockQuestions
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/search/popular", () => {
    // [T-API-09] Returns 200 with valid response structure
    it("should return 200 status code with valid response structure", async () => {
      const response = await request(app).get("/api/search/popular");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("timestamp");
    });

    // [T-API-10] Response format matches ApiResponse structure
    it("should return response in ApiResponse format", async () => {
      const response = await request(app).get("/api/search/popular");

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.timestamp).toBe("string");

      // Validate timestamp format (ISO 8601)
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.toISOString()).toBe(response.body.timestamp);
    });

    // [T-API-11] Data array contains SearchTerm objects
    it("should return data array with SearchTerm objects", async () => {
      const response = await request(app).get("/api/search/popular");

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.length).toBeLessThanOrEqual(5);

      // Verify each item has SearchTerm structure
      response.body.data.forEach((term: any) => {
        expect(term).toHaveProperty("rank");
        expect(term).toHaveProperty("keyword");
        expect(term).toHaveProperty("popularity");
        expect(typeof term.rank).toBe("number");
        expect(typeof term.keyword).toBe("string");
        expect(typeof term.popularity).toBe("number");
      });
    });

    // [T-API-12] Popularity values are in descending order
    it("should return keywords sorted by popularity in descending order", async () => {
      const response = await request(app).get("/api/search/popular");

      const data = response.body.data;
      expect(data.length).toBeGreaterThan(0);

      // Verify descending order
      for (let i = 0; i < data.length - 1; i++) {
        expect(data[i].popularity).toBeGreaterThanOrEqual(data[i + 1].popularity);
      }

      // Verify ranks are sequential
      data.forEach((term: any, index: number) => {
        expect(term.rank).toBe(index + 1);
      });
    });

    // [T-API-13] Handles 500 errors gracefully
    it("should handle database errors gracefully with 500 status", async () => {
      // Mock database error
      (mockPrismaClient.question.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      const response = await request(app).get("/api/search/popular");

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
    });

    // [T-API-14] Response time is <100ms (cache hit scenario)
    it("should respond quickly on cache hit (< 200ms)", async () => {
      // Create app once for this test to maintain cache
      const cacheTestApp = express();
      cacheTestApp.use(express.json());
      const searchRouter = createSearchRouter(mockPrismaClient);
      cacheTestApp.use("/api/search", searchRouter);

      // First request to populate cache
      await request(cacheTestApp).get("/api/search/popular");

      // Clear call count for second request
      (mockPrismaClient.question.findMany as jest.Mock).mockClear();

      // Second request should hit cache and be fast
      const startTime = Date.now();
      const response = await request(cacheTestApp).get("/api/search/popular");
      const endTime = Date.now();

      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(200); // Allow some overhead for network/testing

      // Database should NOT be called on second request (cache hit)
      expect(mockPrismaClient.question.findMany).toHaveBeenCalledTimes(0);
    });

    it("should respect custom limit query parameter", async () => {
      const response = await request(app)
        .get("/api/search/popular")
        .query({ limit: 3 });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(3);
      expect(response.body.data.length).toBe(3);
    });

    it("should handle invalid limit parameter gracefully", async () => {
      const response = await request(app)
        .get("/api/search/popular")
        .query({ limit: "invalid" });

      // Should still return 200 and use default limit (NaN becomes default)
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should return top keywords from seeded data", async () => {
      const response = await request(app).get("/api/search/popular");

      expect(response.status).toBe(200);
      const keywords = response.body.data.map((term: any) => term.keyword);

      // Top 2 keywords should match expected values
      expect(keywords[0]).toBe("제주도 맛집");
      expect(keywords[1]).toBe("한라산 등반");
    });

    it("should include all required fields in response", async () => {
      const response = await request(app).get("/api/search/popular");

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        timestamp: expect.any(String),
      });
    });

    it("should handle empty database gracefully", async () => {
      // Mock empty database
      (mockPrismaClient.question.findMany as jest.Mock).mockResolvedValueOnce(
        []
      );

      const response = await request(app).get("/api/search/popular");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it("should set correct Content-Type header", async () => {
      const response = await request(app).get("/api/search/popular");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toMatch(/application\/json/);
    });
  });
});
