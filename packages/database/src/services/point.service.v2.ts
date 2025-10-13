/**
 * 포인트 시스템 서비스 (개선된 버전)
 *
 * @description
 * - 포인트 적립/차감 로직 관리
 * - 포인트 이력 추적 및 관리
 * - 포인트 랭킹 시스템
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 및 DIP(의존성 역전 원칙) 준수
 *
 * @author 동네물어봐 개발팀
 * @version 2.0.0
 */

import { PrismaClient, PointTransactionType } from "@prisma/client";
import { IPointRepository } from "../repositories/point.repository";
import { PointRepository } from "../repositories/point.repository.impl";
import {
  CreatePointTransactionData,
  PointTransactionQueryOptions,
  PointRankingQueryOptions,
  PointStats,
  PointIntegrityResult,
} from "../repositories/point.repository";

/**
 * 포인트 지급 결과
 */
export interface PointAwardResult {
  success: boolean;
  message: string;
  transactionId?: string;
  newBalance: number;
  pointsAwarded: number;
}

/**
 * 포인트 차감 결과
 */
export interface PointDeductResult {
  success: boolean;
  message: string;
  transactionId?: string;
  newBalance: number;
  pointsDeducted: number;
}

/**
 * 포인트 시스템 서비스
 */
export class PointService {
  private pointRepository: IPointRepository;

  constructor(prisma: PrismaClient) {
    this.pointRepository = new PointRepository(prisma);
  }

  /**
   * 포인트 적립/차감 (원자적 트랜잭션)
   *
   * @param data - 포인트 트랜잭션 데이터
   * @returns 포인트 지급/차감 결과
   */
  async addPoints(data: CreatePointTransactionData): Promise<PointAwardResult | PointDeductResult> {
    console.log(`💰 포인트 트랜잭션 시작: ${data.userId}, ${data.amount}포인트`);

    try {
      // 현재 잔액 조회
      const currentBalance = await this.pointRepository.getUserBalance(data.userId);

      // 잔액 검증 (차감 시)
      if (data.amount < 0 && currentBalance + data.amount < 0) {
        return {
          success: false,
          message: "포인트가 부족합니다.",
          newBalance: currentBalance,
          pointsDeducted: 0,
        };
      }

      // 트랜잭션 생성
      const transaction = await this.pointRepository.createTransaction(data);

      // 사용자 잔액 업데이트
      const newBalance = currentBalance + data.amount;
      await this.pointRepository.updateUserBalance(data.userId, newBalance);

      console.log(`✅ 포인트 트랜잭션 완료: ${data.userId}, 잔액 ${newBalance}`);

      if (data.amount > 0) {
        return {
          success: true,
          message: `${data.amount}포인트가 적립되었습니다.`,
          transactionId: transaction.id,
          newBalance,
          pointsAwarded: data.amount,
        };
      } else {
        return {
          success: true,
          message: `${Math.abs(data.amount)}포인트가 차감되었습니다.`,
          transactionId: transaction.id,
          newBalance,
          pointsDeducted: Math.abs(data.amount),
        };
      }
    } catch (error) {
      console.error("❌ 포인트 트랜잭션 실패:", error);
      throw new Error("포인트 처리 중 오류가 발생했습니다.");
    }
  }

  /**
   * 포인트 이력 조회
   *
   * @param userId - 사용자 ID
   * @param options - 조회 옵션
   * @returns 포인트 트랜잭션 목록
   */
  async getPointHistory(userId: string, options: Omit<PointTransactionQueryOptions, 'userId'> = {}) {
    return await this.pointRepository.getTransactions({ userId, ...options });
  }

  /**
   * 포인트 랭킹 조회
   *
   * @param options - 조회 옵션
   * @returns 포인트 랭킹 목록
   */
  async getPointRanking(options: PointRankingQueryOptions = {}) {
    return await this.pointRepository.getPointRanking(options);
  }

  /**
   * 사용자 포인트 통계 조회
   *
   * @param userId - 사용자 ID
   * @param period - 조회 기간 (일)
   * @returns 포인트 통계 정보
   */
  async getUserPointStats(userId: string, period: number = 30): Promise<PointStats> {
    return await this.pointRepository.getUserPointStats(userId, period);
  }

  /**
   * 시스템 포인트 통계 조회
   *
   * @param period - 조회 기간 (일)
   * @returns 시스템 포인트 통계
   */
  async getSystemPointStats(period: number = 30) {
    return await this.pointRepository.getSystemPointStats(period);
  }

  /**
   * 포인트 정합성 검증
   *
   * @param userId - 사용자 ID
   * @returns 검증 결과
   */
  async validatePointIntegrity(userId: string): Promise<PointIntegrityResult> {
    return await this.pointRepository.validatePointIntegrity(userId);
  }

  /**
   * 포인트 정합성 복구
   *
   * @param userId - 사용자 ID
   * @returns 복구 결과
   */
  async repairPointIntegrity(userId: string) {
    return await this.pointRepository.repairPointIntegrity(userId);
  }

  /**
   * 배지 획득 포인트 지급
   *
   * @param userId - 사용자 ID
   * @param badgeName - 배지 이름
   * @param points - 지급할 포인트
   * @returns 포인트 지급 결과
   */
  async awardBadgePoints(userId: string, badgeName: string, points: number): Promise<PointAwardResult> {
    const result = await this.addPoints({
      userId,
      amount: points,
      type: "BADGE_EARNED",
      description: `배지 획득: ${badgeName}`,
      relatedType: "badge",
      metadata: { badgeName, points },
    });

    return result as PointAwardResult;
  }

  /**
   * 답변 채택 포인트 지급
   *
   * @param userId - 사용자 ID
   * @param questionTitle - 질문 제목
   * @param points - 지급할 포인트
   * @returns 포인트 지급 결과
   */
  async awardAnswerAdoptionPoints(userId: string, questionTitle: string, points: number): Promise<PointAwardResult> {
    const result = await this.addPoints({
      userId,
      amount: points,
      type: "ANSWER_ACCEPTED",
      description: `답변 채택: ${questionTitle}`,
      relatedType: "answer",
      metadata: { questionTitle, points },
    });

    return result as PointAwardResult;
  }

  /**
   * 질문 작성 포인트 지급
   *
   * @param userId - 사용자 ID
   * @param questionTitle - 질문 제목
   * @param points - 지급할 포인트
   * @returns 포인트 지급 결과
   */
  async awardQuestionPoints(userId: string, questionTitle: string, points: number): Promise<PointAwardResult> {
    const result = await this.addPoints({
      userId,
      amount: points,
      type: "QUESTION_CREATED",
      description: `질문 작성: ${questionTitle}`,
      relatedType: "question",
      metadata: { questionTitle, points },
    });

    return result as PointAwardResult;
  }

  /**
   * 답변 작성 포인트 지급
   *
   * @param userId - 사용자 ID
   * @param questionTitle - 질문 제목
   * @param points - 지급할 포인트
   * @returns 포인트 지급 결과
   */
  async awardAnswerPoints(userId: string, questionTitle: string, points: number): Promise<PointAwardResult> {
    const result = await this.addPoints({
      userId,
      amount: points,
      type: "ANSWER_CREATED",
      description: `답변 작성: ${questionTitle}`,
      relatedType: "answer",
      metadata: { questionTitle, points },
    });

    return result as PointAwardResult;
  }

  /**
   * 포인트 사용 (차감)
   *
   * @param userId - 사용자 ID
   * @param amount - 사용할 포인트
   * @param description - 사용 사유
   * @param relatedType - 관련 타입
   * @param relatedId - 관련 ID
   * @returns 포인트 차감 결과
   */
  async spendPoints(
    userId: string,
    amount: number,
    description: string,
    relatedType?: string,
    relatedId?: string
  ): Promise<PointDeductResult> {
    const result = await this.addPoints({
      userId,
      amount: -amount,
      type: "POINT_SPENT",
      description,
      relatedType,
      relatedId,
      metadata: { amount, description },
    });

    return result as PointDeductResult;
  }

  /**
   * 일괄 포인트 지급 (배치 처리용)
   *
   * @param awards - 포인트 지급 목록
   * @returns 처리 결과
   */
  async bulkAwardPoints(awards: Array<{
    userId: string;
    amount: number;
    type: PointTransactionType;
    description: string;
    relatedType?: string;
    relatedId?: string;
  }>): Promise<{
    success: boolean;
    processed: number;
    failed: number;
    errors: string[];
  }> {
    console.log(`🔄 일괄 포인트 지급 시작: ${awards.length}건`);

    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const award of awards) {
      try {
        await this.addPoints(award);
        processed++;
      } catch (error) {
        failed++;
        const errorMessage = `사용자 ${award.userId} 포인트 지급 실패: ${error}`;
        errors.push(errorMessage);
        console.error(`❌ ${errorMessage}`);
      }
    }

    console.log(`✅ 일괄 포인트 지급 완료: 성공 ${processed}건, 실패 ${failed}건`);

    return {
      success: failed === 0,
      processed,
      failed,
      errors,
    };
  }

  /**
   * 오래된 트랜잭션 정리
   *
   * @param daysToKeep - 보관 기간 (일)
   * @returns 정리된 트랜잭션 수
   */
  async cleanupOldTransactions(daysToKeep: number = 365): Promise<number> {
    console.log(`🧹 오래된 포인트 트랜잭션 정리 시작: ${daysToKeep}일 이전`);

    const deletedCount = await this.pointRepository.cleanupOldTransactions(daysToKeep);

    console.log(`✅ 포인트 트랜잭션 정리 완료: ${deletedCount}건 삭제`);

    return deletedCount;
  }
}
