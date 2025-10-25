import { PrismaClient, AuditLog } from "@prisma/client";

/**
 * 감시 로그 서비스 클래스
 *
 * @description
 * - 개인정보 삭제 정책 개선: Phase 1 감시 로깅
 * - 모든 삭제/복구 작업을 기록하여 법적 요구사항 충족
 * - GDPR/개인정보보호법 대응을 위한 감시 증거 유지
 *
 * @example
 * ```typescript
 * const auditLogService = new AuditLogService(prisma);
 * await auditLogService.logDelete({
 *   targetType: "QUESTION",
 *   targetId: "question_id",
 *   userId: "user_id",
 *   reason: "User requested deletion",
 * });
 * ```
 */
export class AuditLogService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * 삭제 작업 기록
   *
   * @param data - 삭제 로그 데이터
   * @returns 생성된 감시 로그
   */
  async logDelete(data: {
    targetType: "QUESTION" | "ANSWER" | "COMMENT";
    targetId: string;
    userId: string;
    reason?: string;
    details?: Record<string, any>;
  }): Promise<AuditLog> {
    try {
      return await this.prisma.auditLog.create({
        data: {
          action: "DELETE",
          targetType: data.targetType,
          targetId: data.targetId,
          userId: data.userId,
          reason: data.reason,
          status: "DELETED",
          details: data.details || {},
        },
      });
    } catch (error) {
      console.error("감시 로그 기록 실패:", error);
      throw new Error(
        `감시 로그 기록 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 복구 작업 기록
   *
   * @param data - 복구 로그 데이터
   * @returns 생성된 감시 로그
   */
  async logRestore(data: {
    targetType: "QUESTION" | "ANSWER" | "COMMENT";
    targetId: string;
    userId: string;
    reason?: string;
    details?: Record<string, any>;
  }): Promise<AuditLog> {
    try {
      return await this.prisma.auditLog.create({
        data: {
          action: "RESTORE",
          targetType: data.targetType,
          targetId: data.targetId,
          userId: data.userId,
          reason: data.reason || "Admin restored deleted content",
          status: "RESTORED",
          details: data.details || {},
        },
      });
    } catch (error) {
      console.error("감시 로그 기록 실패:", error);
      throw new Error(
        `감시 로그 기록 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 영구 삭제 작업 기록
   *
   * @param data - 영구 삭제 로그 데이터
   * @returns 생성된 감시 로그
   */
  async logPermanentlyDelete(data: {
    targetType: "QUESTION" | "ANSWER" | "COMMENT";
    targetId: string;
    userId?: string;
    reason?: string;
    details?: Record<string, any>;
  }): Promise<AuditLog> {
    try {
      return await this.prisma.auditLog.create({
        data: {
          action: "PERMANENTLY_DELETE",
          targetType: data.targetType,
          targetId: data.targetId,
          userId: data.userId || "system",
          reason:
            data.reason || "Automatic cleanup after 30 days (GDPR compliance)",
          status: "PERMANENTLY_DELETED",
          details: data.details || {},
        },
      });
    } catch (error) {
      console.error("감시 로그 기록 실패:", error);
      throw new Error(
        `감시 로그 기록 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 특정 대상의 감시 로그 조회
   *
   * @param targetType - 대상 타입
   * @param targetId - 대상 ID
   * @returns 감시 로그 목록
   */
  async getAuditLogs(
    targetType: "QUESTION" | "ANSWER" | "COMMENT",
    targetId: string
  ): Promise<AuditLog[]> {
    try {
      return await this.prisma.auditLog.findMany({
        where: {
          targetType,
          targetId,
        },
        orderBy: {
          createdAt: "desc",
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
    } catch (error) {
      console.error("감시 로그 조회 실패:", error);
      throw new Error(
        `감시 로그 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 사용자의 모든 감시 로그 조회
   *
   * @param userId - 사용자 ID
   * @param limit - 조회 개수 제한
   * @returns 감시 로그 목록
   */
  async getAuditLogsByUser(
    userId: string,
    limit: number = 100
  ): Promise<AuditLog[]> {
    try {
      return await this.prisma.auditLog.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      });
    } catch (error) {
      console.error("사용자 감시 로그 조회 실패:", error);
      throw new Error(
        `사용자 감시 로그 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 특정 기간의 감시 로그 조회
   *
   * @param startDate - 시작 날짜
   * @param endDate - 종료 날짜
   * @returns 감시 로그 목록
   */
  async getAuditLogsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<AuditLog[]> {
    try {
      return await this.prisma.auditLog.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: "desc",
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
    } catch (error) {
      console.error("감시 로그 조회 실패:", error);
      throw new Error(
        `감시 로그 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 30일 이상 경과한 DELETED 데이터 확인
   * (Phase 3에서 물리 삭제 전 호출)
   *
   * @returns 영구 삭제 대상 감시 로그 목록
   */
  async getOldDeletedDataAuditLogs(): Promise<AuditLog[]> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      return await this.prisma.auditLog.findMany({
        where: {
          action: "DELETE",
          status: "DELETED",
          createdAt: {
            lte: thirtyDaysAgo,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    } catch (error) {
      console.error("감시 로그 조회 실패:", error);
      throw new Error(
        `감시 로그 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }
}
