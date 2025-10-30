// @TAG-API-SEARCH-SERVICE-001
// SPEC: SPEC-FEATURE-SEARCH-001 - Popular Search Terms Service

import { PrismaClient } from "@prisma/client";

/**
 * Represents a popular search term with ranking and popularity score
 */
export interface SearchTerm {
  rank: number;
  keyword: string;
  popularity: number;
}

/**
 * Cache entry structure with timestamp for TTL validation
 */
interface CacheEntry {
  data: SearchTerm[];
  timestamp: number;
}

/**
 * Custom error class for search service errors
 */
export class SearchServiceError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "SearchServiceError";
  }
}

/**
 * Service for managing popular search terms based on question tags and popularity
 *
 * @description
 * - Calculates keyword popularity using formula: viewCount×1 + likeCount×3 + answerCount×2
 * - Aggregates popularity scores across all questions with the same tag
 * - Implements in-memory caching with configurable TTL (default: 1 hour)
 * - Returns top N keywords ranked by aggregated popularity
 *
 * @example
 * ```typescript
 * const service = new PopularSearchService(prisma);
 * const topKeywords = await service.getPopularSearchTerms(5);
 * console.log(topKeywords); // [{ rank: 1, keyword: "제주도 맛집", popularity: 2845 }, ...]
 * ```
 */
export class PopularSearchService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL: number;
  private readonly CACHE_KEY = "popular-search-terms";

  /**
   * Creates an instance of PopularSearchService
   *
   * @param prisma - Prisma client instance
   * @param cacheTTL - Cache time-to-live in milliseconds (default: 3600000ms = 1 hour)
   */
  constructor(
    private readonly prisma: PrismaClient,
    cacheTTL: number = 3600000
  ) {
    this.CACHE_TTL = cacheTTL;
  }

  /**
   * Retrieves popular search terms ranked by aggregated popularity
   *
   * @param limit - Maximum number of terms to return (default: 5)
   * @returns Array of SearchTerm objects with rank, keyword, and popularity
   * @throws {SearchServiceError} If database query fails
   *
   * @example
   * ```typescript
   * const terms = await service.getPopularSearchTerms(5);
   * // Returns top 5 keywords with their popularity scores
   * ```
   */
  async getPopularSearchTerms(limit: number = 5): Promise<SearchTerm[]> {
    try {
      // Check cache first
      const cachedEntry = this.cache.get(this.CACHE_KEY);
      if (cachedEntry && this.isValidCache(cachedEntry)) {
        // Return cached data with applied limit
        return cachedEntry.data.slice(0, limit).map((term, index) => ({
          ...term,
          rank: index + 1,
        }));
      }

      // Cache miss or expired - fetch from database
      const questions = await this.prisma.question.findMany({
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

      // Aggregate keywords from questions
      const keywordPopularityMap = this.aggregateKeywordsFromQuestions(questions);

      // Sort by popularity (descending) and take top N
      const sortedKeywords = Array.from(keywordPopularityMap.entries())
        .sort(([, popA], [, popB]) => popB - popA)
        .slice(0, limit)
        .map(([keyword, popularity], index) => ({
          rank: index + 1,
          keyword,
          popularity,
        }));

      // Cache the full result (before applying limit)
      const fullResult = Array.from(keywordPopularityMap.entries())
        .sort(([, popA], [, popB]) => popB - popA)
        .map(([keyword, popularity], index) => ({
          rank: index + 1,
          keyword,
          popularity,
        }));

      this.cache.set(this.CACHE_KEY, {
        data: fullResult,
        timestamp: Date.now(),
      });

      return sortedKeywords;
    } catch (error) {
      throw this.createErrorResponse(error);
    }
  }

  /**
   * Aggregates keywords from questions and calculates their popularity scores
   *
   * @param questions - Array of questions with tags and metrics
   * @returns Map of keyword to aggregated popularity score
   * @private
   */
  private aggregateKeywordsFromQuestions(
    questions: Array<{
      tags: string[];
      viewCount: number;
      likeCount: number;
      answerCount: number;
    }>
  ): Map<string, number> {
    const keywordPopularityMap = new Map<string, number>();

    for (const question of questions) {
      const popularity = this.calculatePopularity(question);

      // Add popularity to each tag/keyword
      for (const tag of question.tags) {
        const currentPopularity = keywordPopularityMap.get(tag) || 0;
        keywordPopularityMap.set(tag, currentPopularity + popularity);
      }
    }

    return keywordPopularityMap;
  }

  /**
   * Calculates popularity score for a single question
   *
   * Formula: viewCount × 1 + likeCount × 3 + answerCount × 2
   *
   * @param question - Question object with metrics
   * @returns Calculated popularity score
   * @private
   */
  private calculatePopularity(question: {
    viewCount: number;
    likeCount: number;
    answerCount: number;
  }): number {
    return (
      question.viewCount * 1 +
      question.likeCount * 3 +
      question.answerCount * 2
    );
  }

  /**
   * Validates if cache entry is still valid based on TTL
   *
   * @param entry - Cache entry to validate
   * @returns True if cache is valid, false if expired
   * @private
   */
  private isValidCache(entry: CacheEntry): boolean {
    const now = Date.now();
    return now - entry.timestamp < this.CACHE_TTL;
  }

  /**
   * Creates a SearchServiceError from any error
   *
   * @param error - Original error
   * @returns SearchServiceError instance
   * @private
   */
  private createErrorResponse(error: unknown): SearchServiceError {
    if (error instanceof Error) {
      return new SearchServiceError(
        `Failed to fetch popular search terms: ${error.message}`,
        error
      );
    }
    return new SearchServiceError(
      "Failed to fetch popular search terms: Unknown error",
      error
    );
  }

  /**
   * Clears the cache (useful for testing)
   *
   * @public
   */
  clearCache(): void {
    this.cache.clear();
  }
}
