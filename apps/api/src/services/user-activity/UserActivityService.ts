import { PrismaClient } from "@prisma/client";
import { UserStats } from "@jeju-tourlist/database/types/user";
import { PaginationParams } from "../../types";

/**
 * 사용자 활동 서비스 클래스
 *
 * @description
 * - 사용자 활동 관련 비즈니스 로직을 담당
 * - 통계, 랭킹, 알림 등 사용자 활동 관리
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 *
 * @example
 * ```typescript
 * const userActivityService = new UserActivityService(prisma);
 * const stats = await userActivityService.getUserStats("user123");
 * ```
 */
export class UserActivityService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * 사용자 통계 조회
   *
   * @param userId - 사용자 ID
   * @returns 사용자 통계 정보
   * @throws {Error} 사용자를 찾을 수 없을 때 에러 발생
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // 사용자 존재 확인
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          points: true,
          level: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });

      if (!user) {
        throw new Error("사용자를 찾을 수 없습니다.");
      }

      // 병렬로 통계 데이터 조회
      const [
        questionCount,
        answerCount,
        likeCount,
        bookmarkCount,
        badgeCount,
        lastActivity,
      ] = await Promise.all([
        this.prisma.question.count({
          where: { authorId: userId, status: "ACTIVE" },
        }),
        this.prisma.answer.count({
          where: { authorId: userId, status: "ACTIVE" },
        }),
        this.getUserTotalLikes(userId),
        this.prisma.bookmark.count({
          where: { userId },
        }),
        this.prisma.userBadge.count({
          where: { userId },
        }),
        this.getUserLastActivity(userId),
      ]);

      return {
        totalQuestions: questionCount,
        totalAnswers: answerCount,
        totalLikes: likeCount,
        totalBookmarks: bookmarkCount,
        points: user.points,
        level: user.level,
        badges: badgeCount,
        joinDate: user.createdAt,
        lastActivity: lastActivity || user.lastLoginAt || user.createdAt,
      };
    } catch (error) {
      throw new Error(
        `사용자 통계 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 사용자 랭킹 조회
   *
   * @param limit - 조회할 개수
   * @param sortBy - 정렬 기준 (points, questions, answers, likes)
   * @returns 사용자 랭킹 목록
   */
  async getUserRanking(
    limit: number = 10,
    sortBy: "points" | "questions" | "answers" | "likes" = "points"
  ) {
    try {
      let orderBy: Record<string, string> = {};

      switch (sortBy) {
        case "points":
          orderBy = { points: "desc" };
          break;
        case "questions":
          orderBy = { questions: { _count: "desc" } };
          break;
        case "answers":
          orderBy = { answers: { _count: "desc" } };
          break;
        case "likes":
          // 복잡한 정렬을 위해 별도 쿼리 필요
          return await this.getUserRankingByLikes(limit);
      }

      const users = await this.prisma.user.findMany({
        where: { isActive: true },
        orderBy,
        take: limit,
        select: {
          id: true,
          name: true,
          nickname: true,
          avatar: true,
          points: true,
          level: true,
          createdAt: true,
          _count: {
            select: {
              questions: {
                where: { status: "ACTIVE" },
              },
              answers: {
                where: { status: "ACTIVE" },
              },
            },
          },
        },
      });

      return users.map((user, index) => ({
        rank: index + 1,
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        avatar: user.avatar,
        points: user.points,
        level: user.level,
        questionCount: user._count.questions,
        answerCount: user._count.answers,
        joinDate: user.createdAt,
      }));
    } catch (error) {
      throw new Error(
        `사용자 랭킹 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 사용자 활동 이력 조회
   *
   * @param userId - 사용자 ID
   * @param options - 페이지네이션 옵션
   * @returns 사용자 활동 이력
   */
  async getUserActivityHistory(userId: string, options: PaginationParams = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      // 질문과 답변을 시간순으로 정렬하여 조회
      const [questions, answers] = await Promise.all([
        this.prisma.question.findMany({
          where: { authorId: userId, status: "ACTIVE" },
          select: {
            id: true,
            title: true,
            createdAt: true,
            viewCount: true,
            likeCount: true,
            answerCount: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.answer.findMany({
          where: { authorId: userId, status: "ACTIVE" },
          select: {
            id: true,
            content: true,
            createdAt: true,
            likeCount: true,
            isAccepted: true,
            question: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      // 활동 타입별로 통합
      const activities = [
        ...questions.map(q => ({
          type: "question" as const,
          id: q.id,
          title: q.title,
          content: q.title,
          createdAt: q.createdAt,
          stats: {
            viewCount: q.viewCount,
            likeCount: q.likeCount,
            answerCount: q.answerCount,
          },
        })),
        ...answers.map(a => ({
          type: "answer" as const,
          id: a.id,
          title: a.question.title,
          content: a.content,
          createdAt: a.createdAt,
          stats: {
            likeCount: a.likeCount,
            isAccepted: a.isAccepted,
          },
        })),
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // 페이지네이션 적용
      const paginatedActivities = activities.slice(skip, skip + limit);
      const total = activities.length;
      const totalPages = Math.ceil(total / limit);

      return {
        activities: paginatedActivities,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(
        `사용자 활동 이력 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 사용자 포인트 업데이트
   *
   * @param userId - 사용자 ID
   * @param points - 추가/차감할 포인트
   * @param reason - 포인트 변경 사유
   * @returns 업데이트된 포인트
   */
  async updateUserPoints(
    userId: string,
    points: number,
    reason: string
  ): Promise<number> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });

      if (!user) {
        throw new Error("사용자를 찾을 수 없습니다.");
      }

      const newPoints = Math.max(0, user.points + points);

      await this.prisma.user.update({
        where: { id: userId },
        data: { points: newPoints },
      });

      // 포인트 이력 기록 (비동기)
      this.recordPointHistory(userId, points, reason, newPoints).catch(
        console.error
      );

      return newPoints;
    } catch (error) {
      throw new Error(
        `포인트 업데이트 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 사용자 레벨 업데이트
   *
   * @param userId - 사용자 ID
   * @returns 업데이트된 레벨
   */
  async updateUserLevel(userId: string): Promise<number> {
    try {
      const stats = await this.getUserStats(userId);

      // 레벨 계산 로직 (예: 1000포인트당 1레벨)
      const newLevel = Math.floor(stats.points / 1000) + 1;

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      });

      if (!user) {
        throw new Error("사용자를 찾을 수 없습니다.");
      }

      if (newLevel > user.level) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { level: newLevel },
        });

        // 레벨업 알림 발송 (비동기)
        this.sendLevelUpNotification(userId, newLevel).catch(console.error);
      }

      return newLevel;
    } catch (error) {
      throw new Error(
        `레벨 업데이트 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 알림 생성
   *
   * @param userId - 사용자 ID
   * @param type - 알림 타입
   * @param title - 알림 제목
   * @param message - 알림 내용
   * @param data - 추가 데이터
   */
  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: Record<string, unknown>
  ) {
    try {
      return await this.prisma.notification.create({
        data: {
          userId,
          type: type as
            | "QUESTION_ANSWERED"
            | "ANSWER_ACCEPTED"
            | "LEVEL_UP"
            | "SYSTEM",
          title,
          message,
          data: data ? JSON.stringify(data) : null,
        },
      });
    } catch (error) {
      console.error("알림 생성 실패:", error);
    }
  }

  /**
   * 사용자 알림 목록 조회
   *
   * @param userId - 사용자 ID
   * @param options - 페이지네이션 옵션
   * @returns 알림 목록
   */
  async getUserNotifications(userId: string, options: PaginationParams = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        this.prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        this.prisma.notification.count({
          where: { userId },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(
        `알림 목록 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 알림 읽음 처리
   *
   * @param notificationId - 알림 ID
   * @param userId - 사용자 ID
   */
  async markNotificationAsRead(notificationId: string, userId: string) {
    try {
      await this.prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } catch (error) {
      throw new Error(
        `알림 읽음 처리 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 모든 알림 읽음 처리
   *
   * @param userId - 사용자 ID
   */
  async markAllNotificationsAsRead(userId: string) {
    try {
      await this.prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } catch (error) {
      throw new Error(
        `모든 알림 읽음 처리 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 사용자 총 좋아요 수 조회
   *
   * @param userId - 사용자 ID
   * @private
   */
  private async getUserTotalLikes(userId: string): Promise<number> {
    const [questionLikes, answerLikes] = await Promise.all([
      this.prisma.questionLike.count({
        where: {
          question: { authorId: userId },
        },
      }),
      this.prisma.answerLike.count({
        where: {
          answer: { authorId: userId },
          isLike: true,
        },
      }),
    ]);

    return questionLikes + answerLikes;
  }

  /**
   * 사용자 마지막 활동 시간 조회
   *
   * @param userId - 사용자 ID
   * @private
   */
  private async getUserLastActivity(userId: string): Promise<Date | null> {
    const [lastQuestion, lastAnswer] = await Promise.all([
      this.prisma.question.findFirst({
        where: { authorId: userId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      this.prisma.answer.findFirst({
        where: { authorId: userId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    const dates = [lastQuestion?.createdAt, lastAnswer?.createdAt].filter(
      Boolean
    ) as Date[];

    return dates.length > 0
      ? new Date(Math.max(...dates.map(d => d.getTime())))
      : null;
  }

  /**
   * 좋아요 기준 사용자 랭킹 조회
   *
   * @param limit - 조회할 개수
   * @private
   */
  private async getUserRankingByLikes(limit: number) {
    // 복잡한 쿼리로 좋아요 수 기준 랭킹 조회
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        nickname: true,
        avatar: true,
        points: true,
        level: true,
        createdAt: true,
        questions: {
          select: {
            _count: {
              select: { likes: true },
            },
          },
        },
        answers: {
          select: {
            _count: {
              select: { likes: true },
            },
          },
        },
      },
    });

    // 좋아요 수 계산 및 정렬
    const usersWithLikes = users
      .map(user => {
        const questionLikes = user.questions.reduce(
          (sum, q) => sum + q._count.likes,
          0
        );
        const answerLikes = user.answers.reduce(
          (sum, a) => sum + a._count.likes,
          0
        );
        const totalLikes = questionLikes + answerLikes;

        return {
          rank: 0, // 정렬 후 설정
          id: user.id,
          name: user.name,
          nickname: user.nickname,
          avatar: user.avatar,
          points: user.points,
          level: user.level,
          questionCount: user.questions.length,
          answerCount: user.answers.length,
          totalLikes,
          joinDate: user.createdAt,
        };
      })
      .sort((a, b) => b.totalLikes - a.totalLikes);

    // 랭킹 설정
    usersWithLikes.forEach((user, index) => {
      user.rank = index + 1;
    });

    return usersWithLikes.slice(0, limit);
  }

  /**
   * 포인트 이력 기록
   *
   * @param userId - 사용자 ID
   * @param points - 포인트 변화량
   * @param reason - 사유
   * @param newTotal - 새로운 총 포인트
   * @private
   */
  private async recordPointHistory(
    userId: string,
    points: number,
    reason: string,
    newTotal: number
  ) {
    // TODO: 포인트 이력 테이블이 있다면 기록
    console.log(
      `포인트 이력: 사용자 ${userId}, ${points > 0 ? "+" : ""}${points}포인트, 사유: ${reason}, 총 포인트: ${newTotal}`
    );
  }

  /**
   * 레벨업 알림 발송
   *
   * @param userId - 사용자 ID
   * @param newLevel - 새로운 레벨
   * @private
   */
  private async sendLevelUpNotification(userId: string, newLevel: number) {
    await this.createNotification(
      userId,
      "LEVEL_UP",
      "레벨업 축하합니다!",
      `축하합니다! ${newLevel}레벨에 도달했습니다.`,
      { newLevel }
    );
  }
}
