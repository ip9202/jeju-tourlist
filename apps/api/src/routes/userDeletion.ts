import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createAuthMiddleware } from "../middleware/auth";
import { JWTService } from "../services/auth/JWTService";
import { UserDeletionService } from "../services/userDeletion/UserDeletionService";
import { QuestionService } from "../services/question/QuestionService";
import { AuditLogService } from "../services/auditLog/AuditLogService";
import { AnswerService } from "../services/answer/AnswerService";
import { createResponse } from "../utils/response";

/**
 * 사용자 삭제 라우터
 */
export function createUserDeletionRouter(prisma: PrismaClient): Router {
  const router = Router();

  const jwtService = new JWTService();
  const authMiddleware = createAuthMiddleware(jwtService);
  const auditLogService = new AuditLogService(prisma);
  const answerService = new AnswerService(prisma);
  const questionService = new QuestionService(prisma, answerService);
  const userDeletionService = new UserDeletionService(
    prisma,
    questionService,
    auditLogService
  );

  /**
   * POST /api/users/me/deletion-request
   */
  router.post(
    "/me/deletion-request",
    authMiddleware.authenticate,
    async (req: Request & { user?: any }, res: Response) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json(
            createResponse(false, "사용자 인증 정보가 없습니다", null)
          );
        }

        const { reason } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.get("user-agent");

        const result = await userDeletionService.requestDeletion(
          userId,
          reason,
          ipAddress,
          userAgent
        );

        res.status(200).json(
          createResponse(true, "개인정보 삭제가 요청되었습니다", {
            willBeDeletedAt: result.willBeDeletedAt,
            message: "30일 후 자동으로 삭제되며, 취소는 언제든 가능합니다.",
          })
        );
      } catch (error) {
        console.error("Failed to request deletion:", error);
        res.status(400).json(
          createResponse(false, (error as Error).message, null)
        );
      }
    }
  );

  /**
   * POST /api/users/me/deletion-request/cancel
   */
  router.post(
    "/me/deletion-request/cancel",
    authMiddleware.authenticate,
    async (req: Request & { user?: any }, res: Response) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json(
            createResponse(false, "사용자 인증 정보가 없습니다", null)
          );
        }

        await userDeletionService.cancelDeletion(userId);

        res.status(200).json(
          createResponse(true, "개인정보 삭제 요청이 취소되었습니다", null)
        );
      } catch (error) {
        console.error("Failed to cancel deletion:", error);
        res.status(400).json(
          createResponse(false, (error as Error).message, null)
        );
      }
    }
  );

  /**
   * GET /api/users/me/deletion-request
   */
  router.get(
    "/me/deletion-request",
    authMiddleware.authenticate,
    async (req: Request & { user?: any }, res: Response) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json(
            createResponse(false, "사용자 인증 정보가 없습니다", null)
          );
        }

        const deletionRequest =
          await userDeletionService.getDeletionRequestStatus(userId);

        if (!deletionRequest) {
          return res.status(200).json(
            createResponse(true, "삭제 요청 정보가 없습니다", null)
          );
        }

        res.status(200).json(
          createResponse(true, "삭제 요청 상태 조회 완료", {
            status: deletionRequest.status,
            requestedAt: deletionRequest.requestedAt,
            willBeDeletedAt: deletionRequest.willBeDeletedAt,
            reason: deletionRequest.reason,
            daysRemaining: Math.max(
              0,
              Math.ceil(
                (deletionRequest.willBeDeletedAt.getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )
            ),
          })
        );
      } catch (error) {
        console.error("Failed to get deletion request status:", error);
        res.status(500).json(
          createResponse(false, (error as Error).message, null)
        );
      }
    }
  );

  return router;
}
