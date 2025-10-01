import { Request, Response } from "express";
import { QuestionService } from "../services/question/QuestionService";
import { PrismaClient } from "@prisma/client";
import {
  CreateQuestionSchema,
  UpdateQuestionSchema,
} from "@jeju-tourlist/database/src/types/question";
import { ApiResponse, PaginatedResponse } from "../types";
import { z } from "zod";

/**
 * 질문 컨트롤러 클래스
 *
 * @description
 * - 질문 관련 HTTP 요청을 처리
 * - 요청 검증 및 응답 형식 표준화
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 */
export class QuestionController {
  private readonly questionService: QuestionService;

  constructor(private readonly prisma: PrismaClient) {
    this.questionService = new QuestionService(prisma);
  }

  /**
   * 질문 생성
   * POST /api/questions
   */
  createQuestion = async (req: Request, res: Response) => {
    try {
      // 요청 데이터 검증
      const validatedData = CreateQuestionSchema.parse(req.body);

      // 사용자 ID 추가 (인증 미들웨어에서 설정됨)
      const dataWithUser = {
        ...validatedData,
        authorId: req.user?.id || validatedData.authorId,
      };

      const question = await this.questionService.createQuestion(dataWithUser);

      const response: ApiResponse = {
        success: true,
        data: question,
        message: "질문이 성공적으로 생성되었습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: "입력 데이터가 올바르지 않습니다.",
          message: error.errors?.map(e => e.message).join(", ") || "검증 오류",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "질문 생성 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 질문 목록 조회
   * GET /api/questions
   */
  getQuestions = async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        query,
        categoryId,
        tags,
        location,
        status,
        isResolved,
        isPinned,
        authorId,
        dateFrom,
        dateTo,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // 태그 파싱 (쉼표로 구분된 문자열을 배열로 변환)
      const tagsArray = tags
        ? (tags as string).split(",").map(tag => tag.trim())
        : undefined;

      // 날짜 파싱
      const parsedDateFrom = dateFrom
        ? new Date(dateFrom as string)
        : undefined;
      const parsedDateTo = dateTo ? new Date(dateTo as string) : undefined;

      const options = {
        page: Number(page),
        limit: Number(limit),
        query: query as string,
        categoryId: categoryId as string,
        tags: tagsArray,
        location: location as string,
        status: status as "ACTIVE" | "CLOSED" | "DELETED" | "HIDDEN",
        isResolved: isResolved ? isResolved === "true" : undefined,
        isPinned: isPinned ? isPinned === "true" : undefined,
        authorId: authorId as string,
        dateFrom: parsedDateFrom,
        dateTo: parsedDateTo,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      };

      const result = await this.questionService.getQuestions(options);

      const response: PaginatedResponse<(typeof result.questions)[0]> = {
        success: true,
        data: result.questions,
        pagination: result.pagination,
        message: "질문 목록을 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "질문 목록 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 질문 상세 조회
   * GET /api/questions/:id
   */
  getQuestionById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { incrementView = "true" } = req.query;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: "질문 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const question = await this.questionService.getQuestionById(
        id,
        incrementView === "true"
      );

      const response: ApiResponse = {
        success: true,
        data: question,
        message: "질문을 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message === "질문을 찾을 수 없습니다."
          ? 404
          : 500;

      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "질문 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(statusCode).json(response);
    }
  };

  /**
   * 질문 수정
   * PUT /api/questions/:id
   */
  updateQuestion = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: "질문 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: "인증이 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(401).json(response);
      }

      // 요청 데이터 검증
      const validatedData = UpdateQuestionSchema.parse(req.body);

      const question = await this.questionService.updateQuestion(
        id,
        validatedData,
        userId
      );

      const response: ApiResponse = {
        success: true,
        data: question,
        message: "질문이 성공적으로 수정되었습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: "입력 데이터가 올바르지 않습니다.",
          message: error.errors.map(e => e.message).join(", "),
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const statusCode =
        error instanceof Error &&
        (error.message === "질문을 찾을 수 없습니다." ||
          error.message === "질문을 수정할 권한이 없습니다.")
          ? 404
          : 500;

      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "질문 수정 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(statusCode).json(response);
    }
  };

  /**
   * 질문 삭제
   * DELETE /api/questions/:id
   */
  deleteQuestion = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: "질문 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: "인증이 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(401).json(response);
      }

      const question = await this.questionService.deleteQuestion(id, userId);

      const response: ApiResponse = {
        success: true,
        data: question,
        message: "질문이 성공적으로 삭제되었습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const statusCode =
        error instanceof Error &&
        (error.message === "질문을 찾을 수 없습니다." ||
          error.message === "질문을 수정할 권한이 없습니다.")
          ? 404
          : 500;

      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "질문 삭제 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(statusCode).json(response);
    }
  };

  /**
   * 질문 좋아요 토글
   * POST /api/questions/:id/like
   */
  toggleQuestionLike = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: "질문 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: "인증이 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(401).json(response);
      }

      const result = await this.questionService.toggleQuestionLike(id, userId);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: result.isLiked
          ? "질문에 좋아요를 눌렀습니다."
          : "질문 좋아요를 취소했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "좋아요 처리 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 질문 북마크 토글
   * POST /api/questions/:id/bookmark
   */
  toggleQuestionBookmark = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: "질문 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: "인증이 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(401).json(response);
      }

      const result = await this.questionService.toggleQuestionBookmark(
        id,
        userId
      );

      const response: ApiResponse = {
        success: true,
        data: result,
        message: result.isBookmarked
          ? "질문을 북마크했습니다."
          : "질문 북마크를 취소했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "북마크 처리 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 질문 해결 상태 변경
   * PATCH /api/questions/:id/resolve
   */
  updateQuestionResolvedStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isResolved } = req.body;
      const userId = req.user?.id;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: "질문 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: "인증이 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(401).json(response);
      }

      if (typeof isResolved !== "boolean") {
        const response: ApiResponse = {
          success: false,
          error: "isResolved는 boolean 값이어야 합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const question = await this.questionService.updateQuestionResolvedStatus(
        id,
        isResolved,
        userId
      );

      const response: ApiResponse = {
        success: true,
        data: question,
        message: isResolved
          ? "질문이 해결됨으로 표시되었습니다."
          : "질문 해결 상태가 취소되었습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const statusCode =
        error instanceof Error &&
        (error.message === "질문을 찾을 수 없습니다." ||
          error.message === "질문을 수정할 권한이 없습니다.")
          ? 404
          : 500;

      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "해결 상태 변경 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(statusCode).json(response);
    }
  };

  /**
   * 인기 질문 조회
   * GET /api/questions/popular
   */
  getPopularQuestions = async (req: Request, res: Response) => {
    try {
      const { limit = 10 } = req.query;

      const questions = await this.questionService.getPopularQuestions(
        Number(limit)
      );

      const response: ApiResponse = {
        success: true,
        data: questions,
        message: "인기 질문을 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "인기 질문 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };
}
