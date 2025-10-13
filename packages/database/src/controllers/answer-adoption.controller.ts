/**
 * 답변 채택 API 컨트롤러
 *
 * @description
 * - 답변 채택 관련 HTTP 요청 처리
 * - 권한 검증 및 입력 데이터 검증
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AnswerAdoptionService } from "../services/answer-adoption.service";
import { z } from "zod";

/**
 * 답변 채택 요청 스키마
 */
const AdoptAnswerSchema = z.object({
  questionId: z.string().min(1, "질문 ID는 필수입니다."),
  answerId: z.string().min(1, "답변 ID는 필수입니다."),
});

/**
 * 답변 채택 컨트롤러
 */
export class AnswerAdoptionController {
  private adoptionService: AnswerAdoptionService;

  constructor(prisma: PrismaClient) {
    this.adoptionService = new AnswerAdoptionService(prisma);
  }

  /**
   * 답변 채택 처리
   *
   * @param req - Express Request
   * @param res - Express Response
   */
  adoptAnswer = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("🔄 답변 채택 요청:", req.body);

      // 입력 데이터 검증
      const validatedData = AdoptAnswerSchema.parse(req.body);
      const { questionId, answerId } = validatedData;

      // 사용자 ID 추출 (인증 미들웨어에서 설정됨)
      const adopterId = (req as any).user?.id;
      if (!adopterId) {
        res.status(401).json({
          success: false,
          message: "인증이 필요합니다.",
        });
        return;
      }

      // 답변 작성자 ID 조회
      const answer = await this.adoptionService["prisma"].answer.findUnique({
        where: { id: answerId },
        select: { authorId: true },
      });

      if (!answer) {
        res.status(404).json({
          success: false,
          message: "답변을 찾을 수 없습니다.",
        });
        return;
      }

      // 답변 채택 처리
      const result = await this.adoptionService.adoptAnswer({
        questionId,
        answerId,
        adopterId,
        answererId: answer.authorId,
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          adoptedAnswerId: result.adoptedAnswerId,
          expertPointsAwarded: result.expertPointsAwarded,
          totalPoints: result.totalPoints,
          badgePointsAwarded: result.badgePointsAwarded,
        },
      });

      console.log("✅ 답변 채택 성공:", result);
    } catch (error) {
      console.error("❌ 답변 채택 실패:", error);

      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "입력 데이터가 올바르지 않습니다.",
          errors: error.errors,
        });
        return;
      }

      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      
      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  };

  /**
   * 답변 채택 취소
   *
   * @param req - Express Request
   * @param res - Express Response
   */
  cancelAdoption = async (req: Request, res: Response): Promise<void> => {
    try {
      const { questionId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "인증이 필요합니다.",
        });
        return;
      }

      if (!questionId) {
        res.status(400).json({
          success: false,
          message: "질문 ID는 필수입니다.",
        });
        return;
      }

      const result = await this.adoptionService.cancelAdoption(questionId, userId);

      res.status(200).json({
        success: true,
        message: result.message,
      });

      console.log("✅ 답변 채택 취소 성공:", questionId);
    } catch (error) {
      console.error("❌ 답변 채택 취소 실패:", error);

      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      
      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  };

  /**
   * 질문의 채택 상태 조회
   *
   * @param req - Express Request
   * @param res - Express Response
   */
  getAdoptionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { questionId } = req.params;

      if (!questionId) {
        res.status(400).json({
          success: false,
          message: "질문 ID는 필수입니다.",
        });
        return;
      }

      const status = await this.adoptionService.getAdoptionStatus(questionId);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error("❌ 채택 상태 조회 실패:", error);

      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      
      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  };

  /**
   * 사용자별 채택 통계 조회
   *
   * @param req - Express Request
   * @param res - Express Response
   */
  getUserAdoptionStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const currentUserId = (req as any).user?.id;

      // 본인 또는 관리자만 조회 가능
      if (!currentUserId || (currentUserId !== userId && !(req as any).user?.isAdmin)) {
        res.status(403).json({
          success: false,
          message: "권한이 없습니다.",
        });
        return;
      }

      const user = await this.adoptionService["prisma"].user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          nickname: true,
          totalAnswers: true,
          adoptedAnswers: true,
          adoptRate: true,
          points: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "사용자를 찾을 수 없습니다.",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          userId: user.id,
          name: user.name,
          nickname: user.nickname,
          totalAnswers: user.totalAnswers || 0,
          adoptedAnswers: user.adoptedAnswers || 0,
          adoptRate: user.adoptRate || 0,
          totalPoints: user.points || 0,
        },
      });
    } catch (error) {
      console.error("❌ 사용자 채택 통계 조회 실패:", error);

      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      
      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  };
}
