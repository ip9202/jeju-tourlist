import { PrismaClient } from "@prisma/client";
import { QuestionService } from "../question/QuestionService";
import { AuditLogService } from "../auditLog/AuditLogService";

/**
 * 사용자 삭제 서비스 클래스
 *
 * @description
 * - 사용자 탈퇴 및 개인정보 삭제를 담당
 * - 30일 유예 기간을 통한 안전한 삭제
 * - GDPR/PIPA 준수
 * - SRP(단일 책임 원칙) 준수
 */
export class UserDeletionService {
  private readonly auditLogService: AuditLogService;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly questionService: QuestionService,
    auditLogService?: AuditLogService
  ) {
    this.auditLogService = auditLogService || new AuditLogService(prisma);
  }

  /**
   * 사용자 삭제 요청
   */
  async requestDeletion(
    userId: string,
    reason?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ willBeDeletedAt: Date }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    const existingRequest = await this.prisma.deletionRequest.findUnique({
      where: { userId },
    });

    if (existingRequest && existingRequest.status === "PENDING") {
      throw new Error("이미 삭제 요청이 진행 중입니다.");
    }

    const willBeDeletedAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    );

    const request = await this.prisma.deletionRequest.create({
      data: {
        userId,
        reason,
        status: "PENDING",
        willBeDeletedAt,
        requestIp: ipAddress,
        requestUserAgent: userAgent,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        isDeletionRequested: true,
        deletionRequestedAt: new Date(),
        willBeDeletedAt,
      },
    });

    await this.auditLogService
      .logDelete({
        targetType: "USER",
        targetId: userId,
        userId,
        reason: `User requested account deletion: ${reason || "No reason provided"}`,
        details: {
          requestIp: ipAddress,
          willBeDeletedAt: willBeDeletedAt.toISOString(),
          action: "DELETION_REQUEST",
        },
      })
      .catch(error => {
        console.error("Failed to log deletion request:", error);
      });

    return { willBeDeletedAt };
  }

  /**
   * 사용자 삭제 요청 취소
   */
  async cancelDeletion(userId: string): Promise<void> {
    const request = await this.prisma.deletionRequest.findUnique({
      where: { userId },
    });

    if (!request || request.status !== "PENDING") {
      throw new Error("취소할 수 있는 삭제 요청이 없습니다.");
    }

    await this.prisma.deletionRequest.update({
      where: { userId },
      data: { status: "CANCELLED" },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
        isDeletionRequested: false,
        deletionRequestedAt: null,
        willBeDeletedAt: null,
      },
    });

    await this.auditLogService
      .logDelete({
        targetType: "USER",
        targetId: userId,
        userId,
        reason: "User cancelled deletion request",
        details: {
          action: "DELETION_CANCELLED",
        },
      })
      .catch(error => {
        console.error("Failed to log deletion cancellation:", error);
      });
  }

  /**
   * 사용자 완전 삭제
   */
  async completeDeletion(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        questions: { select: { id: true } },
        answers: { select: { id: true } },
        deletionRequest: true,
      },
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    await this.prisma.$transaction(async tx => {
      for (const question of user.questions) {
        try {
          await this.questionService.deleteQuestion(question.id, userId);
        } catch (error) {
          console.error(`Failed to delete question ${question.id}:`, error);
        }
      }

      await tx.answerComment.updateMany({
        where: { authorId: userId },
        data: { status: "DELETED" },
      });

      await tx.questionLike.deleteMany({ where: { userId } });
      await tx.answerLike.deleteMany({ where: { userId } });
      await tx.answerCommentLike.deleteMany({ where: { userId } });
      await tx.bookmark.deleteMany({ where: { userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.userBadge.deleteMany({ where: { userId } });
      await tx.pointTransaction.deleteMany({ where: { userId } });
      await tx.report.deleteMany({ where: { reporterId: userId } });

      await tx.userProfile?.deleteMany?.({ where: { userId } }).catch(() => {});

      await tx.user.delete({ where: { id: userId } });

      if (user.deletionRequest) {
        await tx.deletionRequest.update({
          where: { id: user.deletionRequest.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            completedBy: "system",
          },
        });
      }
    });

    await this.auditLogService
      .logDelete({
        targetType: "USER",
        targetId: userId,
        userId,
        reason: "User account permanently deleted",
        details: {
          action: "PERMANENT_DELETION",
          completedAt: new Date().toISOString(),
        },
      })
      .catch(error => {
        console.error("Failed to log permanent deletion:", error);
      });
  }

  /**
   * 삭제 예정인 사용자 조회
   */
  async findExpiredDeletionRequests() {
    return await this.prisma.deletionRequest.findMany({
      where: {
        status: "PENDING",
        willBeDeletedAt: { lte: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nickname: true,
          },
        },
      },
    });
  }

  /**
   * 사용자의 삭제 요청 상태 조회
   */
  async getDeletionRequestStatus(userId: string) {
    return await this.prisma.deletionRequest.findUnique({
      where: { userId },
    });
  }
}
