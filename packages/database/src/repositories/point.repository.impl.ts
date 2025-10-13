/**
 * 포인트 리포지토리 구현체
 *
 * @description
 * - Prisma 기반 포인트 데이터 접근 계층
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 데이터베이스 쿼리 최적화 및 트랜잭션 관리
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { PrismaClient } from "@prisma/client";
import {
  IPointRepository,
  CreatePointTransactionData,
  PointTransactionQueryOptions,
  PointRankingQueryOptions,
  PointStats,
  PointIntegrityResult,
} from "./point.repository";

/**
 * 포인트 리포지토리 구현체
 */
export class PointRepository implements IPointRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * 포인트 트랜잭션 생성
   */
  async createTransaction(data: CreatePointTransactionData): Promise<any> {
    return await this.prisma.pointTransaction.create({
      data: {
        ...data,
        balance: 0, // 실제 잔액은 별도 계산
      },
    });
  }

  /**
   * 포인트 트랜잭션 목록 조회
   */
  async getTransactions(options: PointTransactionQueryOptions): Promise<any[]> {
    const {
      userId,
      type,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = options;

    const where: any = { userId };

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    return await this.prisma.pointTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  /**
   * 포인트 트랜잭션 ID로 조회
   */
  async getTransactionById(id: string): Promise<any | null> {
    return await this.prisma.pointTransaction.findUnique({
      where: { id },
    });
  }

  /**
   * 사용자 포인트 잔액 조회
   */
  async getUserBalance(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    return user?.points || 0;
  }

  /**
   * 사용자 포인트 잔액 업데이트
   */
  async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { points: newBalance },
    });
  }

  /**
   * 사용자 포인트 증가
   */
  async incrementUserBalance(userId: string, amount: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: amount,
        },
      },
    });
  }

  /**
   * 사용자 포인트 감소
   */
  async decrementUserBalance(userId: string, amount: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          decrement: amount,
        },
      },
    });
  }

  /**
   * 포인트 랭킹 조회
   */
  async getPointRanking(options: PointRankingQueryOptions): Promise<{
    users: Array<{
      id: string;
      name: string;
      nickname: string;
      points: number;
      rank: number;
    }>;
    totalCount: number;
    userRank?: number;
  }> {
    const { page = 1, limit = 50, userId } = options;

    // 전체 사용자 수 조회
    const totalCount = await this.prisma.user.count({
      where: { isActive: true },
    });

    // 랭킹 조회
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        nickname: true,
        points: true,
      },
      orderBy: { points: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 사용자 순위 계산
    let userRank: number | undefined;
    if (userId) {
      const userRankResult = await this.prisma.user.findFirst({
        where: { id: userId },
        select: { points: true },
      });

      if (userRankResult) {
        const usersAboveCount = await this.prisma.user.count({
          where: {
            isActive: true,
            points: { gt: userRankResult.points },
          },
        });
        userRank = usersAboveCount + 1;
      }
    }

    return {
      users: users.map((user, index) => ({
        ...user,
        rank: (page - 1) * limit + index + 1,
      })),
      totalCount,
      userRank,
    };
  }

  /**
   * 사용자 포인트 통계 조회
   */
  async getUserPointStats(userId: string, period: number): Promise<PointStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const [
      user,
      transactions,
      totalEarned,
      totalSpent,
      dailyPoints,
      typeStats,
    ] = await Promise.all([
      // 사용자 현재 포인트
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
      }),

      // 기간 내 트랜잭션
      this.prisma.pointTransaction.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: "asc" },
      }),

      // 총 적립 포인트
      this.prisma.pointTransaction.aggregate({
        where: {
          userId,
          createdAt: { gte: startDate },
          amount: { gt: 0 },
        },
        _sum: { amount: true },
      }),

      // 총 사용 포인트
      this.prisma.pointTransaction.aggregate({
        where: {
          userId,
          createdAt: { gte: startDate },
          amount: { lt: 0 },
        },
        _sum: { amount: true },
      }),

      // 일별 포인트 변화
      this.prisma.pointTransaction.groupBy({
        by: ["createdAt"],
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
        orderBy: { createdAt: "asc" },
      }),

      // 타입별 통계
      this.prisma.pointTransaction.groupBy({
        by: ["type"],
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const earned = totalEarned._sum.amount || 0;
    const spent = Math.abs(totalSpent._sum.amount || 0);

    return {
      totalEarned: earned,
      totalSpent: spent,
      netChange: earned - spent,
      currentBalance: user?.points || 0,
      transactionCount: transactions.length,
      dailyPoints: dailyPoints.map(item => ({
        date: item.createdAt,
        amount: item._sum.amount || 0,
      })),
      typeStats: typeStats.reduce((acc, item) => {
        acc[item.type] = item._sum.amount || 0;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * 시스템 포인트 통계 조회
   */
  async getSystemPointStats(period: number): Promise<{
    totalUsers: number;
    totalPoints: number;
    averagePoints: number;
    topEarners: Array<{
      userId: string;
      name: string;
      points: number;
    }>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const [
      totalUsers,
      totalPoints,
      topEarners,
    ] = await Promise.all([
      // 전체 활성 사용자 수
      this.prisma.user.count({
        where: { isActive: true },
      }),

      // 전체 포인트 합계
      this.prisma.user.aggregate({
        where: { isActive: true },
        _sum: { points: true },
      }),

      // 상위 포인트 보유자
      this.prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          points: true,
        },
        orderBy: { points: "desc" },
        take: 10,
      }),
    ]);

    const totalPointsSum = totalPoints._sum.points || 0;
    const averagePoints = totalUsers > 0 ? totalPointsSum / totalUsers : 0;

    return {
      totalUsers,
      totalPoints: totalPointsSum,
      averagePoints: Math.round(averagePoints * 100) / 100,
      topEarners: topEarners.map(user => ({
        userId: user.id,
        name: user.name,
        points: user.points,
      })),
    };
  }

  /**
   * 포인트 정합성 검증
   */
  async validatePointIntegrity(userId: string): Promise<PointIntegrityResult> {
    const [user, transactions] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
      }),
      this.prisma.pointTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    // 트랜잭션 기반 예상 포인트 계산
    const expectedPoints = transactions.reduce((sum, transaction) => {
      return sum + transaction.amount;
    }, 0);

    const actualPoints = user.points;
    const discrepancy = actualPoints - expectedPoints;

    return {
      isValid: discrepancy === 0,
      actualPoints,
      expectedPoints,
      discrepancy,
      transactionCount: transactions.length,
    };
  }

  /**
   * 포인트 정합성 복구
   */
  async repairPointIntegrity(userId: string): Promise<{
    success: boolean;
    message: string;
    correctedPoints: number;
    previousPoints: number;
  }> {
    const validation = await this.validatePointIntegrity(userId);

    if (validation.isValid) {
      return {
        success: true,
        message: "포인트가 정상입니다.",
        correctedPoints: validation.actualPoints,
        previousPoints: validation.actualPoints,
      };
    }

    // 포인트 복구
    await this.updateUserBalance(userId, validation.expectedPoints);

    return {
      success: true,
      message: "포인트가 복구되었습니다.",
      correctedPoints: validation.expectedPoints,
      previousPoints: validation.actualPoints,
    };
  }

  /**
   * 일괄 사용자 잔액 업데이트
   */
  async bulkUpdateUserBalances(updates: Array<{ userId: string; amount: number }>): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const update of updates) {
        await tx.user.update({
          where: { id: update.userId },
          data: {
            points: {
              increment: update.amount,
            },
          },
        });
      }
    });
  }

  /**
   * 오래된 트랜잭션 정리
   */
  async cleanupOldTransactions(daysToKeep: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.pointTransaction.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    return result.count;
  }
}
