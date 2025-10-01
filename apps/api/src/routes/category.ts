import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { ApiResponse } from "../types";

/**
 * 카테고리 라우터 생성 함수
 *
 * @param prisma - Prisma 클라이언트 인스턴스
 * @returns Express Router
 */
export function createCategoryRouter(prisma: PrismaClient): Router {
  const router = Router();

  /**
   * 카테고리 목록 조회
   * GET /api/categories
   */
  router.get("/", async (req, res) => {
    try {
      const { includeInactive = "false" } = req.query;

      // 카테고리 조회 (기본적으로 활성 카테고리만)
      const categories = await prisma.category.findMany({
        where: includeInactive === "true" ? {} : { isActive: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          icon: true,
          order: true,
          isActive: true,
        },
      });

      const response: ApiResponse = {
        success: true,
        data: categories,
        message: "카테고리 목록을 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "카테고리 목록 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  });

  /**
   * 카테고리 상세 조회
   * GET /api/categories/:id
   */
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: { questions: true },
          },
        },
      });

      if (!category) {
        const response: ApiResponse = {
          success: false,
          error: "카테고리를 찾을 수 없습니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: category,
        message: "카테고리를 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "카테고리 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  });

  return router;
}
