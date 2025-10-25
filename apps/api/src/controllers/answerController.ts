import { Request, Response } from "express";
import { AnswerService } from "../services/answer/AnswerService";
import { AnswerCommentService } from "../services/answerComment/AnswerCommentService";
import { PrismaClient } from "@prisma/client";
import {
  CreateAnswerSchema,
  UpdateAnswerSchema,
} from "@jeju-tourlist/database/src/types/answer";
import { ApiResponse, PaginatedResponse } from "../types";
import { z } from "zod";

/**
 * 답변 컨트롤러 클래스
 *
 * @description
 * - 답변 관련 HTTP 요청을 처리
 * - 요청 검증 및 응답 형식 표준화
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 */
export class AnswerController {
  private readonly answerService: AnswerService;

  constructor(private readonly prisma: PrismaClient) {
    const answerCommentService = new AnswerCommentService(prisma);
    this.answerService = new AnswerService(prisma, answerCommentService);
  }

  /**
   * 답변 생성
   * POST /api/answers
   */
  createAnswer = async (req: Request, res: Response) => {
    try {
      // 요청 데이터 검증
      const validatedData = CreateAnswerSchema.parse(req.body);

      // 사용자 ID 추가 (인증 미들웨어에서 설정됨 또는 임시 사용자 ID)
      const dataWithUser = {
        ...validatedData,
        authorId: req.user?.id || validatedData.authorId || "temp-user-id",
      };

      const answer = await this.answerService.createAnswer(dataWithUser);

      const response: ApiResponse = {
        success: true,
        data: answer,
        message: "답변이 성공적으로 생성되었습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod validation error:", JSON.stringify(error, null, 2));
        const errorMessages = error.issues
          ?.map(e => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        const response: ApiResponse = {
          success: false,
          error: "입력 데이터가 올바르지 않습니다.",
          message: errorMessages || "검증 오류가 발생했습니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "답변 생성 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 답변 상세 조회
   * GET /api/answers/:id
   */
  getAnswerById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: "답변 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const answer = await this.answerService.getAnswerById(id);

      const response: ApiResponse = {
        success: true,
        data: answer,
        message: "답변을 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message === "답변을 찾을 수 없습니다."
          ? 404
          : 500;

      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "답변 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(statusCode).json(response);
    }
  };

  /**
   * 질문별 답변 목록 조회
   * GET /api/questions/:questionId/answers
   */
  getAnswersByQuestionId = async (req: Request, res: Response) => {
    try {
      const { questionId } = req.params;
      const {
        page = 1,
        limit = 10,
        status = "ACTIVE",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      if (!questionId) {
        const response: ApiResponse = {
          success: false,
          error: "질문 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const options = {
        page: Number(page),
        limit: Number(limit),
        status: status as "ACTIVE" | "DELETED" | "HIDDEN",
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      };

      const result = await this.answerService.getAnswersByQuestionId(
        questionId,
        options
      );

      const response: PaginatedResponse<(typeof result.answers)[0]> = {
        success: true,
        data: result.answers,
        pagination: result.pagination,
        message: "답변 목록을 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "답변 목록 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 사용자별 답변 목록 조회
   * GET /api/users/:userId/answers
   */
  getAnswersByAuthorId = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const {
        page = 1,
        limit = 10,
        status = "ACTIVE",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: "사용자 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const options = {
        page: Number(page),
        limit: Number(limit),
        status: status as "ACTIVE" | "DELETED" | "HIDDEN",
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      };

      const result = await this.answerService.getAnswersByAuthorId(
        userId,
        options
      );

      const response: PaginatedResponse<(typeof result.answers)[0]> = {
        success: true,
        data: result.answers,
        pagination: result.pagination,
        message: "사용자 답변 목록을 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "사용자 답변 목록 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 답변 수정
   * PUT /api/answers/:id
   */
  updateAnswer = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: "답변 ID가 필요합니다.",
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
      const validatedData = UpdateAnswerSchema.parse(req.body);

      const answer = await this.answerService.updateAnswer(
        id,
        validatedData,
        userId
      );

      const response: ApiResponse = {
        success: true,
        data: answer,
        message: "답변이 성공적으로 수정되었습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: "입력 데이터가 올바르지 않습니다.",
          message: error.issues.map(e => e.message).join(", "),
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const statusCode =
        error instanceof Error &&
        (error.message === "답변을 찾을 수 없습니다." ||
          error.message === "답변을 수정할 권한이 없습니다.")
          ? 404
          : 500;

      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "답변 수정 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(statusCode).json(response);
    }
  };

  /**
   * 답변 삭제
   * DELETE /api/answers/:id
   */
  deleteAnswer = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: "답변 ID가 필요합니다.",
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

      const answer = await this.answerService.deleteAnswer(id, userId);

      const response: ApiResponse = {
        success: true,
        data: answer,
        message: "답변이 성공적으로 삭제되었습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const statusCode =
        error instanceof Error &&
        (error.message === "답변을 찾을 수 없습니다." ||
          error.message === "답변을 수정할 권한이 없습니다.")
          ? 404
          : 500;

      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "답변 삭제 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(statusCode).json(response);
    }
  };

  /**
   * 답변 좋아요/싫어요 토글
   * POST /api/answers/:id/reaction
   */
  toggleAnswerReaction = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isLike } = req.body;
      const userId = req.user?.id;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: "답변 ID가 필요합니다.",
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

      if (typeof isLike !== "boolean") {
        const response: ApiResponse = {
          success: false,
          error: "isLike는 boolean 값이어야 합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const result = await this.answerService.toggleAnswerReaction(
        id,
        userId,
        isLike
      );

      const response: ApiResponse = {
        success: true,
        data: result,
        message: result.isReacted
          ? isLike
            ? "답변에 좋아요를 눌렀습니다."
            : "답변에 싫어요를 눌렀습니다."
          : isLike
            ? "답변 좋아요를 취소했습니다."
            : "답변 싫어요를 취소했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "답변 반응 처리 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 답변 채택
   * POST /api/answers/:id/accept
   */
  acceptAnswer = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { questionId } = req.body;
      const userId = req.user?.id;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: "답변 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      if (!questionId) {
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

      const answer = await this.answerService.acceptAnswer(
        id,
        questionId,
        userId
      );

      const response: ApiResponse = {
        success: true,
        data: answer,
        message: "답변이 성공적으로 채택되었습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const statusCode =
        error instanceof Error &&
        (error.message === "질문을 찾을 수 없습니다." ||
          error.message === "답변을 찾을 수 없습니다." ||
          error.message === "질문 작성자만 답변을 채택할 수 있습니다." ||
          error.message === "해당 질문의 답변이 아닙니다.")
          ? 404
          : 500;

      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "답변 채택 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(statusCode).json(response);
    }
  };

  /**
   * 답변 채택 해제
   * DELETE /api/answers/:id/accept
   */
  unacceptAnswer = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { questionId } = req.body;
      const userId = req.user?.id;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: "답변 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      if (!questionId) {
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

      const answer = await this.answerService.unacceptAnswer(
        id,
        questionId,
        userId
      );

      const response: ApiResponse = {
        success: true,
        data: answer,
        message: "답변 채택이 해제되었습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const statusCode =
        error instanceof Error &&
        (error.message === "질문을 찾을 수 없습니다." ||
          error.message === "답변을 찾을 수 없습니다." ||
          error.message === "질문 작성자만 답변 채택을 해제할 수 있습니다.")
          ? 404
          : 500;

      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "답변 채택 해제 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(statusCode).json(response);
    }
  };

  /**
   * 답변 통계 조회
   * GET /api/answers/:id/stats
   */
  getAnswerStats = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: "답변 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const stats = await this.answerService.getAnswerStats(id);

      const response: ApiResponse = {
        success: true,
        data: stats,
        message: "답변 통계를 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message === "답변을 찾을 수 없습니다."
          ? 404
          : 500;

      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "답변 통계 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(statusCode).json(response);
    }
  };
}
