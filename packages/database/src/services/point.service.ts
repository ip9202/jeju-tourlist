/**
 * 포인트 시스템 서비스
 * 
 * @description
 * - 포인트 적립/차감 로직 관리
 * - 포인트 이력 추적 및 관리
 * - 포인트 랭킹 시스템
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { PrismaClient, PointTransactionType } from '@prisma/client';
import { BaseService } from './base.service';

/**
 * 포인트 트랜잭션 생성 데이터
 */
export interface CreatePointTransactionData {
  userId: string;
  amount: number;
  type: PointTransactionType;
  description: string;
  relatedType?: string;
  relatedId?: string;
  metadata?: Record<string, any>;
}

/**
 * 포인트 랭킹 정보
 */
export interface PointRanking {
  user: {
    id: string;
    name: string;
    nickname: string;
    avatar?: string;
  };
  points: number;
  rank: number;
  level: number;
}

/**
 * 포인트 시스템 서비스
 * 
 * @description
 * - 포인트 관련 모든 비즈니스 로직 처리
 * - 트랜잭션 안전성 보장
 * - 포인트 정합성 검증
 */
export class PointService extends BaseService {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * 포인트 적립/차감
   * 
   * @description
   * - 원자적 포인트 트랜잭션 처리
   * - 잔액 검증 및 업데이트
   * - 트랜잭션 이력 기록
   * 
   * @param data - 포인트 트랜잭션 데이터
   * @returns 생성된 포인트 트랜잭션
   * @throws {Error} 포인트 부족 시 에러 발생
   */
  async addPoints(data: CreatePointTransactionData) {
    return await this.prisma.$transaction(async (tx) => {
      // 사용자 현재 포인트 조회
      const user = await tx.user.findUnique({
        where: { id: data.userId },
        select: { points: true, name: true }
      });

      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // 잔액 검증 (차감 시)
      if (data.amount < 0 && user.points + data.amount < 0) {
        throw new Error('포인트가 부족합니다.');
      }

      // 새로운 잔액 계산
      const newBalance = user.points + data.amount;

      // 포인트 트랜잭션 생성
      const transaction = await tx.pointTransaction.create({
        data: {
          userId: data.userId,
          amount: data.amount,
          balance: newBalance,
          type: data.type,
          description: data.description,
          relatedType: data.relatedType,
          relatedId: data.relatedId,
          metadata: data.metadata,
        },
      });

      // 사용자 포인트 업데이트
      await tx.user.update({
        where: { id: data.userId },
        data: { 
          points: newBalance,
          level: this.calculateLevel(newBalance),
        },
      });

      return transaction;
    });
  }

  /**
   * 포인트 이력 조회
   * 
   * @description
   * - 사용자별 포인트 트랜잭션 이력 조회
   * - 페이지네이션 지원
   * - 필터링 및 정렬 지원
   * 
   * @param userId - 사용자 ID
   * @param options - 조회 옵션
   * @returns 포인트 트랜잭션 목록
   */
  async getPointHistory(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      type?: PointTransactionType;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    const {
      page = 1,
      limit = 20,
      type,
      startDate,
      endDate,
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

    const [transactions, total] = await Promise.all([
      this.prisma.pointTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.pointTransaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 포인트 랭킹 조회
   * 
   * @description
   * - 전체 사용자 포인트 랭킹 조회
   * - 특정 사용자 순위 포함
   * - 페이지네이션 지원
   * 
   * @param options - 조회 옵션
   * @returns 포인트 랭킹 목록
   */
  async getPointRanking(options: {
    page?: number;
    limit?: number;
    userId?: string;
  } = {}) {
    const { page = 1, limit = 50, userId } = options;

    // 전체 사용자 수 조회
    const totalUsers = await this.prisma.user.count({
      where: { isActive: true },
    });

    // 랭킹 데이터 조회
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        nickname: true,
        avatar: true,
        points: true,
      },
      orderBy: { points: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 랭킹 정보 생성
    const rankings: PointRanking[] = users.map((user, index) => ({
      user: {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        avatar: user.avatar || undefined,
      },
      points: user.points,
      rank: (page - 1) * limit + index + 1,
      level: this.calculateLevel(user.points),
    }));

    // 특정 사용자 순위 조회 (요청된 경우)
    let userRank: PointRanking | null = null;
    if (userId) {
      const userRankCount = await this.prisma.user.count({
        where: {
          isActive: true,
          points: { gt: 0 },
        },
      });

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          nickname: true,
          avatar: true,
          points: true,
        },
      });

      if (user) {
        const higherPointsCount = await this.prisma.user.count({
          where: {
            isActive: true,
            points: { gt: user.points },
          },
        });

        userRank = {
          user: {
            id: user.id,
            name: user.name,
            nickname: user.nickname,
            avatar: user.avatar || undefined,
          },
          points: user.points,
          rank: higherPointsCount + 1,
          level: this.calculateLevel(user.points),
        };
      }
    }

    return {
      rankings,
      userRank,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    };
  }

  /**
   * 사용자 포인트 통계 조회
   * 
   * @description
   * - 사용자별 포인트 상세 통계
   * - 기간별 포인트 변화 추이
   * - 포인트 타입별 분석
   * 
   * @param userId - 사용자 ID
   * @param period - 조회 기간 (일)
   * @returns 포인트 통계 정보
   */
  async getUserPointStats(userId: string, period: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // 기본 사용자 정보
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        points: true,
        level: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 기간별 포인트 변화
    const dailyPoints = await this.prisma.pointTransaction.groupBy({
      by: ['createdAt'],
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
      orderBy: { createdAt: 'asc' },
    });

    // 포인트 타입별 통계
    const typeStats = await this.prisma.pointTransaction.groupBy({
      by: ['type'],
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    // 총 적립/차감 포인트
    const totalEarned = await this.prisma.pointTransaction.aggregate({
      where: {
        userId,
        amount: { gt: 0 },
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
    });

    const totalSpent = await this.prisma.pointTransaction.aggregate({
      where: {
        userId,
        amount: { lt: 0 },
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        currentPoints: user.points,
        level: user.level,
        joinDate: user.createdAt,
      },
      period: {
        days: period,
        startDate,
        endDate: new Date(),
      },
      stats: {
        totalEarned: totalEarned._sum.amount || 0,
        totalSpent: Math.abs(totalSpent._sum.amount || 0),
        netChange: (totalEarned._sum.amount || 0) + (totalSpent._sum.amount || 0),
      },
      dailyPoints: dailyPoints.map(item => ({
        date: item.createdAt,
        points: item._sum.amount || 0,
      })),
      typeStats: typeStats.map(item => ({
        type: item.type,
        amount: item._sum.amount || 0,
        count: item._count.id,
      })),
    };
  }

  /**
   * 포인트 레벨 계산
   * 
   * @description
   * - 포인트 기반 레벨 계산
   * - 지수적 레벨업 시스템
   * 
   * @param points - 현재 포인트
   * @returns 계산된 레벨
   */
  private calculateLevel(points: number): number {
    if (points < 0) return 1;
    
    // 레벨 공식: level = floor(sqrt(points / 100)) + 1
    // 100포인트마다 레벨업
    return Math.floor(Math.sqrt(points / 100)) + 1;
  }

  /**
   * 포인트 정합성 검증
   * 
   * @description
   * - 사용자 포인트와 트랜잭션 이력 일치성 검증
   * - 데이터 무결성 확인
   * 
   * @param userId - 사용자 ID
   * @returns 검증 결과
   */
  async validatePointIntegrity(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 트랜잭션 기반 계산된 포인트
    const calculatedPoints = await this.prisma.pointTransaction.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const expectedPoints = calculatedPoints._sum.amount || 0;
    const actualPoints = user.points;

    return {
      isValid: expectedPoints === actualPoints,
      expectedPoints,
      actualPoints,
      difference: actualPoints - expectedPoints,
    };
  }

  /**
   * 포인트 정합성 복구
   * 
   * @description
   * - 포인트 불일치 시 자동 복구
   * - 트랜잭션 이력 기반으로 정확한 포인트 계산
   * 
   * @param userId - 사용자 ID
   * @returns 복구 결과
   */
  async repairPointIntegrity(userId: string) {
    const validation = await this.validatePointIntegrity(userId);
    
    if (validation.isValid) {
      return { success: true, message: '포인트가 정상입니다.' };
    }

    // 포인트 복구
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        points: validation.expectedPoints,
        level: this.calculateLevel(validation.expectedPoints),
      },
    });

    return {
      success: true,
      message: '포인트가 복구되었습니다.',
      correctedPoints: validation.expectedPoints,
      previousPoints: validation.actualPoints,
    };
  }
}
