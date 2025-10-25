import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { UserDeletionService } from "../services/userDeletion/UserDeletionService";
import { QuestionService } from "../services/question/QuestionService";
import { AnswerService } from "../services/answer/AnswerService";
import { AuditLogService } from "../services/auditLog/AuditLogService";

const prisma = new PrismaClient();

/**
 * 사용자 삭제 배치 작업 스케줄러
 */
export function scheduleUserDeletionJob() {
  // 매일 오전 3시 (KST) 실행
  const job = cron.schedule("0 3 * * *", async () => {
    const startTime = Date.now();
    console.log(
      `[UserDeletionJob] Starting user deletion batch at ${new Date().toISOString()}`
    );

    try {
      const auditLogService = new AuditLogService(prisma);
      const answerService = new AnswerService(prisma);
      const questionService = new QuestionService(prisma, answerService);
      const userDeletionService = new UserDeletionService(
        prisma,
        questionService,
        auditLogService
      );

      const expiredRequests =
        await userDeletionService.findExpiredDeletionRequests();

      if (expiredRequests.length === 0) {
        console.log("[UserDeletionJob] ✅ No users to delete");
        return;
      }

      console.log(
        `[UserDeletionJob] Found ${expiredRequests.length} users to delete`
      );

      let successCount = 0;
      let failureCount = 0;

      for (const request of expiredRequests) {
        try {
          console.log(
            `[UserDeletionJob] Deleting user: ${request.user.nickname} (${request.user.email})`
          );

          await userDeletionService.completeDeletion(request.userId);

          successCount++;
          console.log(
            `[UserDeletionJob] ✅ User ${request.user.nickname} deleted successfully`
          );
        } catch (error) {
          failureCount++;
          console.error(
            `[UserDeletionJob] ❌ Failed to delete user ${request.userId}:`,
            error
          );
        }
      }

      const duration = Date.now() - startTime;
      console.log(
        `[UserDeletionJob] ✅ Batch completed at ${new Date().toISOString()}`
      );
      console.log(
        `[UserDeletionJob] Results: ${successCount} success, ${failureCount} failures, ${duration}ms`
      );
    } catch (error) {
      console.error("[UserDeletionJob] ❌ Failed:", error);
    }
  });

  console.log("[UserDeletionJob] ✅ Scheduled for daily deletion at 03:00 KST");

  return job;
}
