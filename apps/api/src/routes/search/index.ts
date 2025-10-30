// @TAG-API-SEARCH-ROUTE-001
// SPEC: SPEC-FEATURE-SEARCH-001 - Search Routes Index

import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { createPopularSearchRouter } from "./popular";

/**
 * Creates the main search router
 *
 * @description
 * - Mounts all search-related routes
 * - Handles popular search terms endpoint
 * - Provides public API access for search functionality
 *
 * @param prisma - Prisma client instance
 * @returns Express router with all search endpoints
 *
 * @example
 * ```typescript
 * const searchRouter = createSearchRouter(prisma);
 * app.use('/api/search', searchRouter);
 * ```
 */
export function createSearchRouter(prisma: PrismaClient): Router {
  const router = Router();

  // Mount popular search router
  const popularRouter = createPopularSearchRouter(prisma);
  router.use("/", popularRouter);

  return router;
}
