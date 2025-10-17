/**
 * 답변 채택 서비스
 *
 * @description
 * - 답변 채택 로직 및 권한 검증
 * - 전문가 포인트 지급 시스템
 * - 채택률 실시간 업데이트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { PrismaClient } from "@prisma/client";
import { BadgeService } from "./badge.service";

/**
 * 답변 채택 데이터
 */
export interface AnswerAdoptionData {
  questionId: string;
  answerId: string;
  adopterId: string; // 질문 작성자 ID
  answererId: string; // 답변 작성자 ID
}

/**
 * 답변 채택 결과
 */
export interface AnswerAdoptionResult {
  success: boolean;
  message: string;
  adoptedAnswerId: string;
  expertPointsAwarded: number;
  totalPoints: number;
  badgePointsAwarded?: number;
}

/**
 * 답변 채택 서비스
 */
export class AnswerAdoptionService {
  private prisma: PrismaClient;
  private badgeService: BadgeService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.badgeService = new BadgeService(prisma);
  }

  /**
   * 답변 채택 처리
   *
   * @param data - 답변 채택 데이터
   * @returns 채택 결과
   */
  async adoptAnswer(data: AnswerAdoptionData): Promise<AnswerAdoptionResult> {
    console.log(`🔄 답변 채택 처리 시작: 질문 ${data.questionId}, 답변 ${data.answerId}`);

    return await this.prisma.$transaction(async (tx) => {
      // 1. 권한 검증
      await this.validateAdoptionPermission(data, tx);

      // 2. 기존 채택된 답변 확인 및 취소
      await this.cancelExistingAdoption(data.questionId, tx);

      // 3. 답변 채택 처리
      await this.processAnswerAdoption(data, tx);

      // 4. 전문가 포인트 지급
      const expertPointsResult = await this.awardExpertPoints(data.answererId, tx);

      // 5. 사용자 통계 업데이트
      await this.updateUserStats(data.answererId, tx);

      // 6. 배지 자격 검사 (비동기)
      this.checkBadgeEligibility(data.answererId).catch(console.error);

      console.log(`✅ 답변 채택 완료: ${data.answererId}에게 ${expertPointsResult.pointsAwarded}포인트 지급`);

      return {
        success: true,
        message: "답변이 성공적으로 채택되었습니다.",
        adoptedAnswerId: data.answerId,
        expertPointsAwarded: expertPointsResult.pointsAwarded,
        totalPoints: expertPointsResult.totalPoints,
        badgePointsAwarded: expertPointsResult.badgePointsAwarded,
      };
    });
  }

  /**
   * 채택 권한 검증
   *
   * @param data - 답변 채택 데이터
   * @param tx - 트랜잭션
   */
  private async validateAdoptionPermission(data: AnswerAdoptionData, tx: any): Promise<void> {
    // 질문 존재 및 작성자 확인
    const question = await tx.question.findUnique({
      where: { id: data.questionId },
      select: { id: true, authorId: true },
    });

    if (!question) {
      throw new Error("질문을 찾을 수 없습니다.");
    }

    if (question.authorId !== data.adopterId) {
      throw new Error("질문 작성자만 답변을 채택할 수 있습니다.");
    }

    // 답변 존재 및 질문 매칭 확인
    const answer = await tx.answer.findUnique({
      where: { id: data.answerId },
      select: { id: true, questionId: true, authorId: true },
    });

    if (!answer) {
      throw new Error("답변을 찾을 수 없습니다.");
    }

    if (answer.questionId !== data.questionId) {
      throw new Error("해당 질문의 답변이 아닙니다.");
    }

    if (answer.authorId !== data.answererId) {
      throw new Error("답변 작성자 정보가 일치하지 않습니다.");
    }

    // 자기 자신의 답변 채택 방지
    if (data.adopterId === data.answererId) {
      throw new Error("자신의 답변은 채택할 수 없습니다.");
    }
  }

  /**
   * 기존 채택된 답변 취소
   *
   * @param questionId - 질문 ID
   * @param tx - 트랜잭션
   */
  private async cancelExistingAdoption(questionId: string, tx: any): Promise<void> {
    const existingAdoptedAnswer = await tx.question.findUnique({
      where: { id: questionId },
      select: { acceptedAnswerId: true },
    });

    if (existingAdoptedAnswer?.acceptedAnswerId) {
      // 기존 채택된 답변의 채택 상태 해제
      await tx.answer.update({
        where: { id: existingAdoptedAnswer.acceptedAnswerId },
        data: { adoptedAt: null },
      });

      console.log(`🔄 기존 채택 답변 취소: ${existingAdoptedAnswer.acceptedAnswerId}`);
    }
  }

  /**
   * 답변 채택 처리
   *
   * @param data - 답변 채택 데이터
   * @param tx - 트랜잭션
   * @returns 채택된 답변
   */
  private async processAnswerAdoption(data: AnswerAdoptionData, tx: any): Promise<any> {
      // 답변 채택 상태 업데이트
      const answer = await tx.answer.update({
      where: { id: data.answerId },
      data: { adoptedAt: new Date() },
      include: {
        author: {
          select: { id: true, name: true, nickname: true },
        },
      },
    });

    // 질문의 채택된 답변 ID 업데이트
    await tx.question.update({
      where: { id: data.questionId },
      data: { acceptedAnswerId: data.answerId },
    });

    return answer;
  }

  /**
   * 전문가 포인트 지급
   *
   * @param answererId - 답변 작성자 ID
   * @param tx - 트랜잭션
   * @returns 포인트 지급 결과
   */
  private async awardExpertPoints(answererId: string, tx: any): Promise<{
    pointsAwarded: number;
    totalPoints: number;
    badgePointsAwarded: number;
  }> {
    const EXPERT_POINTS = 50; // 기본 전문가 포인트
    const BADGE_BONUS_POINTS = 25; // 배지 보유 시 추가 포인트

    // 사용자 현재 포인트 조회
    const user = await tx.user.findUnique({
      where: { id: answererId },
      select: { points: true },
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    // 배지 보유 여부 확인 (간단한 체크)
    const userBadges = await tx.userBadge.findMany({
      where: { userId: answererId, earnedAt: { not: null } },
      include: { badge: true },
    });

    const hasExpertBadge = userBadges.some((ub: any) => 
      ub.badge.type === "CATEGORY_EXPERT" || ub.badge.type === "ACTIVITY_LEVEL"
    );

    const totalPointsAwarded = EXPERT_POINTS + (hasExpertBadge ? BADGE_BONUS_POINTS : 0);

    // 포인트 업데이트
    await tx.user.update({
      where: { id: answererId },
      data: {
        points: {
          increment: totalPointsAwarded,
        },
      },
    });

    return {
      pointsAwarded: totalPointsAwarded,
      totalPoints: user.points + totalPointsAwarded,
      badgePointsAwarded: hasExpertBadge ? BADGE_BONUS_POINTS : 0,
    };
  }

  /**
   * 사용자 통계 업데이트
   *
   * @param answererId - 답변 작성자 ID
   * @param tx - 트랜잭션
   */
  private async updateUserStats(answererId: string, tx: any): Promise<void> {
    // 채택된 답변 수 업데이트
    const adoptedAnswersCount = await tx.answer.count({
      where: { authorId: answererId, adoptedAt: { not: null } },
    });

    // 전체 답변 수 업데이트
    const totalAnswersCount = await tx.answer.count({
      where: { authorId: answererId },
    });

    // 채택률 계산
    const adoptRate = totalAnswersCount > 0 ? (adoptedAnswersCount / totalAnswersCount) * 100 : 0;

    await tx.user.update({
      where: { id: answererId },
      data: {
        adoptedAnswers: adoptedAnswersCount,
        totalAnswers: totalAnswersCount,
        adoptRate: Math.round(adoptRate * 100) / 100, // 소수점 둘째 자리까지
      },
    });
  }

  /**
   * 배지 자격 검사 (비동기)
   *
   * @param answererId - 답변 작성자 ID
   */
  private async checkBadgeEligibility(answererId: string): Promise<void> {
    try {
      const earnedBadges = await this.badgeService.checkAndAwardBadges(answererId);
      
      if (earnedBadges.length > 0) {
        console.log(`🎉 사용자 ${answererId}가 ${earnedBadges.length}개의 배지를 획득했습니다!`);
        
        // TODO: 알림 생성 로직 추가
        // await this.notificationService.createBadgeEarnedNotification(answererId, earnedBadges);
      }
    } catch (error) {
      console.error(`❌ 배지 자격 검사 중 오류:`, error);
    }
  }

  /**
   * 답변 채택 취소
   *
   * @param questionId - 질문 ID
   * @param userId - 사용자 ID (질문 작성자)
   * @returns 취소 결과
   */
  async cancelAdoption(questionId: string, userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return await this.prisma.$transaction(async (tx) => {
      // 질문 작성자 확인
      const question = await tx.question.findUnique({
        where: { id: questionId },
        select: { authorId: true, acceptedAnswerId: true },
      });

      if (!question) {
        throw new Error("질문을 찾을 수 없습니다.");
      }

      if (question.authorId !== userId) {
        throw new Error("질문 작성자만 채택을 취소할 수 있습니다.");
      }

      if (!question.acceptedAnswerId) {
        throw new Error("채택된 답변이 없습니다.");
      }

      // 답변 채택 상태 해제
      await tx.answer.update({
        where: { id: question.acceptedAnswerId },
        data: { adoptedAt: null },
      });

      // 질문의 채택된 답변 ID 제거
      await tx.question.update({
        where: { id: questionId },
        data: { acceptedAnswerId: null },
      });

      console.log(`🔄 답변 채택 취소: 질문 ${questionId}`);

      return {
        success: true,
        message: "답변 채택이 취소되었습니다.",
      };
    });
  }

  /**
   * 질문의 채택 상태 조회
   *
   * @param questionId - 질문 ID
   * @returns 채택 상태 정보
   */
  async getAdoptionStatus(questionId: string): Promise<{
    isAdopted: boolean;
    adoptedAnswerId?: string;
    adoptedAt?: Date;
    answererName?: string;
  }> {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: {
        acceptedAnswerId: true,
        acceptedAnswer: {
          select: {
            id: true,
            adoptedAt: true,
            author: {
              select: { name: true, nickname: true },
            },
          },
        },
      },
    });

    if (!question) {
      throw new Error("질문을 찾을 수 없습니다.");
    }

    return {
      isAdopted: !!question.acceptedAnswerId,
      adoptedAnswerId: question.acceptedAnswerId || undefined,
      adoptedAt: question.acceptedAnswer?.adoptedAt || undefined,
      answererName: question.acceptedAnswer?.author?.name || question.acceptedAnswer?.author?.nickname || undefined,
    };
  }
}
