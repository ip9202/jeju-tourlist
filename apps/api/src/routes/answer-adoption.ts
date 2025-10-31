/**
 * 답변 채택 API 라우터 (API 서버용)
 *
 * @description
 * - 답변 채택 관련 API 엔드포인트 정의
 * - 인증 미들웨어 적용
 * - 라우트별 권한 검증
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { AnswerAdoptionService } from "@jeju-tourlist/database";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

/**
 * 답변 채택 요청 스키마
 */
const AdoptAnswerSchema = z.object({
  questionId: z.string().min(1, "질문 ID는 필수입니다."),
});

/**
 * 답변 채택 라우터 생성
 *
 * @param prisma - Prisma 클라이언트
 * @returns Express 라우터
 */
export function createAnswerAdoptionRouter(prisma: PrismaClient): Router {
  const router = Router();
  const adoptionService = new AnswerAdoptionService(prisma);

  /**
   * 답변 채택 처리
   *
   * @route POST /api/answers/:answerId/adopt
   * @desc 답변 채택
   * @access Private
   * @body { questionId: string }
   */
  router.post(
    "/:answerId/adopt",
    authMiddleware,
    async (req: any, res: any) => {
      try {
        console.log("🔄 답변 채택 요청:", req.body);

        // URL 파라미터에서 answerId 추출
        const { answerId } = req.params;

        // 입력 데이터 검증
        const validatedData = AdoptAnswerSchema.parse(req.body);
        const { questionId } = validatedData;

        // 사용자 ID 추출
        const adopterId = req.user?.id;
        if (!adopterId) {
          res.status(401).json({
            success: false,
            message: "인증이 필요합니다.",
          });
          return;
        }

        // 답변 작성자 ID 조회
        const answer = await prisma.answer.findUnique({
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
        const result = await adoptionService.adoptAnswer({
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
            errors: error.issues,
          });
          return;
        }

        const errorMessage =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";

        res.status(400).json({
          success: false,
          message: errorMessage,
        });
      }
    }
  );

  /**
   * 답변 채택 취소
   *
   * @route DELETE /api/answers/:answerId/adopt
   * @desc 답변 채택 취소
   * @access Private (질문 작성자만)
   */
  router.delete(
    "/:answerId/adopt",
    authMiddleware,
    async (req: any, res: any) => {
      try {
        const { answerId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
          res.status(401).json({
            success: false,
            message: "인증이 필요합니다.",
          });
          return;
        }

        if (!answerId) {
          res.status(400).json({
            success: false,
            message: "답변 ID는 필수입니다.",
          });
          return;
        }

        // 답변으로부터 질문 ID 조회
        const answer = await prisma.answer.findUnique({
          where: { id: answerId },
          select: { questionId: true },
        });

        if (!answer) {
          res.status(404).json({
            success: false,
            message: "답변을 찾을 수 없습니다.",
          });
          return;
        }

        const result = await adoptionService.cancelAdoption(
          answer.questionId,
          userId
        );

        res.status(200).json({
          success: true,
          message: result.message,
        });

        console.log("✅ 답변 채택 취소 성공:", answerId);
      } catch (error) {
        console.error("❌ 답변 채택 취소 실패:", error);

        const errorMessage =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";

        res.status(400).json({
          success: false,
          message: errorMessage,
        });
      }
    }
  );

  /**
   * 질문의 채택 상태 조회
   *
   * @route GET /api/answer-adoption/:questionId/status
   * @desc 질문의 채택 상태 조회
   * @access Public
   */
  router.get("/:questionId/status", async (req: any, res: any) => {
    try {
      const { questionId } = req.params;

      if (!questionId) {
        res.status(400).json({
          success: false,
          message: "질문 ID는 필수입니다.",
        });
        return;
      }

      const status = await adoptionService.getAdoptionStatus(questionId);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error("❌ 채택 상태 조회 실패:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";

      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  });

  /**
   * 사용자별 채택 통계 조회
   *
   * @route GET /api/answer-adoption/user/:userId/stats
   * @desc 사용자별 채택 통계 조회
   * @access Private (본인 또는 관리자)
   */
  router.get(
    "/user/:userId/stats",
    authMiddleware,
    async (req: any, res: any) => {
      try {
        const { userId } = req.params;
        const currentUserId = req.user?.id;

        // 본인 또는 관리자만 조회 가능
        if (
          !currentUserId ||
          (currentUserId !== userId && !req.user?.isAdmin)
        ) {
          res.status(403).json({
            success: false,
            message: "권한이 없습니다.",
          });
          return;
        }

        const user = await prisma.user.findUnique({
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

        const errorMessage =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";

        res.status(400).json({
          success: false,
          message: errorMessage,
        });
      }
    }
  );

  return router;
}
