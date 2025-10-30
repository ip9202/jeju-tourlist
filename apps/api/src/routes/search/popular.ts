// @TAG-API-SEARCH-ROUTE-001
// SPEC: SPEC-FEATURE-SEARCH-001 - Popular Search Terms Route Handler

import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import { PopularSearchService } from "../../services/search/PopularSearchService";
import { ResponseHelper } from "../../utils/response";

/**
 * Creates the popular search terms router
 *
 * @param prisma - Prisma client instance
 * @returns Express router with popular search endpoint
 */
export function createPopularSearchRouter(prisma: PrismaClient): Router {
  const router = Router();
  const popularSearchService = new PopularSearchService(prisma);

  /**
   * @route GET /api/search/popular
   * @desc Get popular search keywords based on question tags and popularity
   * @access Public
   * @query { limit?: number } - Maximum number of keywords to return (default: 5)
   *
   * @example
   * GET /api/search/popular?limit=5
   * Response:
   * {
   *   "success": true,
   *   "data": [
   *     { "rank": 1, "keyword": "제주도 맛집", "popularity": 2845 },
   *     { "rank": 2, "keyword": "한라산 등반", "popularity": 2156 }
   *   ],
   *   "timestamp": "2024-10-29T15:30:45.123Z"
   * }
   */
  router.get("/popular", async (req: Request, res: Response) => {
    try {
      // Parse limit parameter (default: 5)
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : 5;

      // Validate limit parameter
      const validLimit = !isNaN(limit) && limit > 0 ? limit : 5;

      // Fetch popular search terms
      const terms = await popularSearchService.getPopularSearchTerms(validLimit);

      // Return success response
      ResponseHelper.success(res, terms, undefined, 200);
    } catch (error) {
      // Log error for debugging
      console.error("Popular search error:", error);

      // Return error response
      ResponseHelper.error(
        res,
        "Internal Server Error",
        "Failed to fetch popular search terms",
        500,
        process.env.NODE_ENV === "development" ? error : undefined
      );
    }
  });

  return router;
}
