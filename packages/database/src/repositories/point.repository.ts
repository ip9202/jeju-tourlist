/**
 * 포인트 리포지토리 인터페이스
 *
 * @description
 * - 포인트 데이터 접근 계층 추상화
 * - SOLID 원칙 중 DIP(의존성 역전 원칙) 준수
 * - 테스트 용이성 및 확장성 제공
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { PointTransactionType } from "@prisma/client";

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
  metadata?: any;
}

/**
 * 포인트 트랜잭션 조회 옵션
 */
export interface PointTransactionQueryOptions {
  userId: string;
  type?: PointTransactionType;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * 포인트 랭킹 조회 옵션
 */
export interface PointRankingQueryOptions {
  page?: number;
  limit?: number;
  userId?: string; // 특정 사용자 순위 포함
}

/**
 * 포인트 통계 정보
 */
export interface PointStats {
  totalEarned: number;
  totalSpent: number;
  netChange: number;
  currentBalance: number;
  transactionCount: number;
  dailyPoints: Array<{
    date: Date;
    amount: number;
  }>;
  typeStats: Record<string, number>;
}

/**
 * 포인트 정합성 검증 결과
 */
export interface PointIntegrityResult {
  isValid: boolean;
  actualPoints: number;
  expectedPoints: number;
  discrepancy: number;
  transactionCount: number;
}

/**
 * 포인트 리포지토리 인터페이스
 */
export interface IPointRepository {
  // 포인트 트랜잭션 관리
  createTransaction(data: CreatePointTransactionData): Promise<any>;
  getTransactions(options: PointTransactionQueryOptions): Promise<any[]>;
  getTransactionById(id: string): Promise<any | null>;

  // 포인트 잔액 관리
  getUserBalance(userId: string): Promise<number>;
  updateUserBalance(userId: string, newBalance: number): Promise<void>;
  incrementUserBalance(userId: string, amount: number): Promise<void>;
  decrementUserBalance(userId: string, amount: number): Promise<void>;

  // 포인트 랭킹
  getPointRanking(options: PointRankingQueryOptions): Promise<{
    users: Array<{
      id: string;
      name: string;
      nickname: string;
      points: number;
      rank: number;
    }>;
    totalCount: number;
    userRank?: number;
  }>;

  // 포인트 통계
  getUserPointStats(userId: string, period: number): Promise<PointStats>;
  getSystemPointStats(period: number): Promise<{
    totalUsers: number;
    totalPoints: number;
    averagePoints: number;
    topEarners: Array<{
      userId: string;
      name: string;
      points: number;
    }>;
  }>;

  // 포인트 정합성 검증
  validatePointIntegrity(userId: string): Promise<PointIntegrityResult>;
  repairPointIntegrity(userId: string): Promise<{
    success: boolean;
    message: string;
    correctedPoints: number;
    previousPoints: number;
  }>;

  // 배치 처리
  bulkUpdateUserBalances(updates: Array<{ userId: string; amount: number }>): Promise<void>;
  cleanupOldTransactions(daysToKeep: number): Promise<number>;
}
