import { Request, Response } from "express";
import { AnswerCommentService } from "../services/answerComment/AnswerCommentService";
import { PrismaClient } from "@prisma/client";
import {
  CreateAnswerCommentSchema,
  UpdateAnswerCommentSchema,
} from "@jeju-tourlist/database/src/types/answerComment";
import { ApiResponse, PaginatedResponse } from "../types";
import { z } from "zod";

/**
 * 답변 댓글 컨트롤러 클래스
 *
 * @description
 * - 답변 댓글 관련 HTTP 요청을 처리
 * - 요청 검증 및 응답 형식 표준화
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 */
export class AnswerCommentController {
  private readonly answerCommentService: AnswerCommentService;

  constructor(private readonly prisma: PrismaClient) {
    this.answerCommentService = new AnswerCommentService(prisma);
  }

  /**
   * 답변 댓글 생성
   * POST /api/answer-comments
   */
  createComment = async (req: Request, res: Response) => {
    try {
      // 요청 데이터 검증
      const validatedData = CreateAnswerCommentSchema.parse(req.body);

      // 사용자 ID 추가 (인증 미들웨어에서 설정됨 또는 임시 사용자 ID)
      const dataWithUser = {
        ...validatedData,
        authorId: req.user?.id || validatedData.authorId || "temp-user-id",
      };

      const comment =
        await this.answerCommentService.createComment(dataWithUser);

      const response: ApiResponse = {
        success: true,
        data: comment,
        message: "답변 댓글이 성공적으로 생성되었습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: "입력 데이터가 올바르지 않습니다.",
          message:
            error.issues?.map(e => e.message).join(", ") ||
            "검증 오류가 발생했습니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "답변 댓글 생성 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 답변 댓글 상세 조회
   * GET /api/answer-comments/:id
   */
  getCommentById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: "답변 댓글 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const comment = await this.answerCommentService.getCommentById(id);

      const response: ApiResponse = {
        success: true,
        data: comment,
        message: "답변 댓글을 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "답변 댓글 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 답변별 댓글 목록 조회
   * GET /api/answers/:answerId/comments
   */
  getCommentsByAnswerId = async (req: Request, res: Response) => {
    try {
      const { answerId } = req.params;
      const {
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = "asc",
        status = "ACTIVE",
      } = req.query;

      if (!answerId) {
        const response: ApiResponse = {
          success: false,
          error: "답변 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const comments = await this.answerCommentService.getCommentsByAnswerId(
        answerId,
        {
          status: status as "ACTIVE" | "DELETED" | "HIDDEN",
          sortBy: sortBy as "createdAt" | "likeCount",
          sortOrder: sortOrder as "asc" | "desc",
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
          },
        }
      );

      const totalCount =
        await this.answerCommentService.getCommentStats(answerId);

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const response: PaginatedResponse<any> = {
        success: true,
        data: comments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount.totalComments,
          totalPages: Math.ceil(totalCount.totalComments / limitNum),
          hasNext: pageNum * limitNum < totalCount.totalComments,
          hasPrev: pageNum > 1,
        },
        message: "답변 댓글 목록을 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "답변 댓글 목록 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 사용자별 댓글 목록 조회
   * GET /api/users/:userId/answer-comments
   */
  getCommentsByAuthorId = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const {
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = "desc",
        status = "ACTIVE",
      } = req.query;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: "사용자 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const comments = await this.answerCommentService.getCommentsByAuthorId(
        userId,
        {
          status: status as "ACTIVE" | "DELETED" | "HIDDEN",
          sortBy: sortBy as "createdAt" | "likeCount",
          sortOrder: sortOrder as "asc" | "desc",
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
          },
        }
      );

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const response: PaginatedResponse<any> = {
        success: true,
        data: comments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: comments.length,
          totalPages: Math.ceil(comments.length / limitNum),
          hasNext: pageNum * limitNum < comments.length,
          hasPrev: pageNum > 1,
        },
        message: "사용자 댓글 목록을 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "사용자 댓글 목록 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 답변 댓글 수정
   * PUT /api/answer-comments/:id
   */
  updateComment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = UpdateAnswerCommentSchema.parse(req.body);

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: "답변 댓글 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const userId = req.user?.id || "temp-user-id";
      const comment = await this.answerCommentService.updateComment(
        id,
        validatedData,
        userId
      );

      const response: ApiResponse = {
        success: true,
        data: comment,
        message: "답변 댓글이 성공적으로 수정되었습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: "입력 데이터가 올바르지 않습니다.",
          message:
            error.issues?.map(e => e.message).join(", ") ||
            "검증 오류가 발생했습니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "답변 댓글 수정 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 답변 댓글 삭제
   * DELETE /api/answer-comments/:id
   */
  deleteComment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: "답변 댓글 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const userId = req.user?.id || "temp-user-id";
      await this.answerCommentService.deleteComment(id, userId);

      const response: ApiResponse = {
        success: true,
        data: null,
        message: "답변 댓글이 성공적으로 삭제되었습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "답변 댓글 삭제 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 답변 댓글 좋아요/싫어요
   * POST /api/answer-comments/:id/reaction
   */
  toggleReaction = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isLike } = req.body;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: "답변 댓글 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      if (typeof isLike !== "boolean") {
        const response: ApiResponse = {
          success: false,
          error: "isLike 값이 올바르지 않습니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const userId = req.user?.id || "temp-user-id";
      const comment = await this.answerCommentService.toggleReaction(
        id,
        userId,
        isLike
      );

      const response: ApiResponse = {
        success: true,
        data: comment,
        message: "반응이 성공적으로 처리되었습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "반응 처리 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 답변 댓글 통계 조회
   * GET /api/answers/:answerId/comments/stats
   */
  getCommentStats = async (req: Request, res: Response) => {
    try {
      const { answerId } = req.params;

      if (!answerId) {
        const response: ApiResponse = {
          success: false,
          error: "답변 ID가 필요합니다.",
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const stats = await this.answerCommentService.getCommentStats(answerId);

      const response: ApiResponse = {
        success: true,
        data: stats,
        message: "답변 댓글 통계를 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "답변 댓글 통계 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };
}
