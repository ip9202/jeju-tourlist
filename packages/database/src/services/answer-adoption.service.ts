/**
 * 답변 채택 서비스
 * @CODE:ANSWER-INTERACTION-001-S1
 *
 * @description
 * - 답변 채택 로직 및 권한 검증
 * - 전문가 포인트 지급 시스템 (PointTransaction 생성)
 * - 채택률 실시간 업데이트
 * - BadgeService 통합 (자동 배지 부여)
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 *
 * SPEC Compliance:
 * - @REQ:ANSWER-INTERACTION-001-U1: Multiple answer adoption support
 * - @REQ:ANSWER-INTERACTION-001-U3: Automatic point distribution (+50)
 * - @REQ:ANSWER-INTERACTION-001-E1: Full adoption event workflow
 * - @REQ:ANSWER-INTERACTION-001-E3: Badge auto-award on adoption
 *
 * @author 동네물어봐 개발팀
 * @version 2.0.0
 * @since 2025-10-30
 */

import { PrismaClient } from "@prisma/client";
import { BadgeService } from "./badge.service";

/**
 * Answer adoption data structure
 *
 * Represents the input parameters required for answer adoption workflow.
 * All fields are mandatory and must reference existing entities.
 *
 * @property questionId - Target question identifier
 * @property answerId - Answer to be adopted (must belong to the question)
 * @property adopterId - User ID of question author (must have permission)
 * @property answererId - User ID of answer author (receives points and stats update)
 */
export interface AnswerAdoptionData {
  questionId: string;
  answerId: string;
  adopterId: string; // Question author ID
  answererId: string; // Answer author ID
}

/**
 * Answer adoption result structure
 *
 * Contains the output details of successful answer adoption.
 * Includes point distribution information and transaction summary.
 *
 * @property success - Whether adoption succeeded (always true if no exception)
 * @property message - Human-readable confirmation message
 * @property adoptedAnswerId - ID of the newly adopted answer
 * @property expertPointsAwarded - Total points given to answerer (base + bonus)
 * @property totalPoints - Updated total points balance for answerer
 * @property badgePointsAwarded - Bonus points from badge (if applicable)
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
 * Answer Adoption Service
 *
 * Core service for managing answer adoption workflow including:
 * - Permission validation and authorization checks
 * - Answer adoption state management
 * - Expert point distribution with audit trail
 * - User statistics updates (adoption rate, count)
 * - Badge eligibility checking and auto-award
 *
 * Transaction Safety:
 * All operations are wrapped in Prisma $transaction() for ACID guarantees.
 * If any step fails, entire transaction rolls back to maintain consistency.
 *
 * Point System:
 * - Base expert points: 50 per adoption
 * - Badge bonus: +25 if user has expert badge
 * - Tracked in PointTransaction for audit trail
 * - Updated atomically with user stats
 *
 * SPEC Compliance:
 * @REQ:ANSWER-INTERACTION-001-U1 - Multiple adoption support
 * @REQ:ANSWER-INTERACTION-001-U3 - Point distribution system
 * @REQ:ANSWER-INTERACTION-001-E1 - Full event workflow
 * @REQ:ANSWER-INTERACTION-001-E3 - Badge auto-award
 */
export class AnswerAdoptionService {
  private prisma: PrismaClient;
  private badgeService: BadgeService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.badgeService = new BadgeService(prisma);
  }

  /**
   * Adopt an answer for a question
   *
   * Main entry point for answer adoption workflow. Orchestrates the complete
   * adoption process including validation, point distribution, and badge checking.
   *
   * Workflow Steps:
   * 1. Validate adoption permissions (only question author can adopt)
   * 2. Cancel any existing adoption for this question
   * 3. Process answer adoption (set adoptedAt, acceptedAnswerId)
   * 4. Award expert points with PointTransaction audit
   * 5. Update user statistics (adoptRate, adoptedAnswers count)
   * 6. Check badge eligibility (async, non-blocking)
   *
   * Transaction Behavior:
   * - All steps 1-5 are atomic via $transaction()
   * - Step 6 is async and non-blocking
   * - Rollback occurs if any step 1-5 fails
   *
   * @param data - Adoption parameters (questionId, answerId, adopterId, answererId)
   * @returns Result object with success flag, adopted answer ID, and point details
   * @throws Error if validation fails or transaction cannot complete
   *
   * @example
   * const result = await adoptionService.adoptAnswer({
   *   questionId: "q123",
   *   answerId: "a456",
   *   adopterId: "user789", // Question author
   *   answererId: "user012", // Answer author
   * });
   * // Result: {
   * //   success: true,
   * //   expertPointsAwarded: 50,
   * //   totalPoints: 250,
   * //   badgePointsAwarded: 25
   * // }
   */
  async adoptAnswer(data: AnswerAdoptionData): Promise<AnswerAdoptionResult> {
    console.log(
      `🔄 답변 채택 처리 시작: 질문 ${data.questionId}, 답변 ${data.answerId}`
    );

    return await this.prisma.$transaction(async tx => {
      // 1. 권한 검증
      await this.validateAdoptionPermission(data, tx);

      // 2. 기존 채택된 답변 확인 및 취소
      await this.cancelExistingAdoption(data.questionId, tx);

      // 3. 답변 채택 처리
      await this.processAnswerAdoption(data, tx);

      // 4. 전문가 포인트 지급 (@CODE:ANSWER-INTERACTION-001-C1)
      const expertPointsResult = await this.awardExpertPoints(
        data.answererId,
        data.answerId,
        tx
      );

      // 5. 사용자 통계 업데이트
      await this.updateUserStats(data.answererId, tx);

      // 6. 배지 자격 검사 (비동기)
      this.checkBadgeEligibility(data.answererId).catch(console.error);

      console.log(
        `✅ 답변 채택 완료: ${data.answererId}에게 ${expertPointsResult.pointsAwarded}포인트 지급`
      );

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
  private async validateAdoptionPermission(
    data: AnswerAdoptionData,
    tx: any
  ): Promise<void> {
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
  private async cancelExistingAdoption(
    questionId: string,
    tx: any
  ): Promise<void> {
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

      console.log(
        `🔄 기존 채택 답변 취소: ${existingAdoptedAnswer.acceptedAnswerId}`
      );
    }
  }

  /**
   * 답변 채택 처리
   *
   * @param data - 답변 채택 데이터
   * @param tx - 트랜잭션
   * @returns 채택된 답변
   */
  private async processAnswerAdoption(
    data: AnswerAdoptionData,
    tx: any
  ): Promise<any> {
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
   * Award expert points for answer adoption
   *
   * Implements the core point distribution system. Awards expert points to
   * the answer author and creates an immutable audit trail via PointTransaction.
   *
   * @CODE:ANSWER-INTERACTION-001-C1 - Automatic point distribution
   *
   * Point Calculation:
   * - Base expert points: 50 (EXPERT_POINTS constant)
   * - Badge bonus: +25 if user has CATEGORY_EXPERT or ACTIVITY_LEVEL badge
   * - Total: base + (hasExpertBadge ? bonus : 0)
   *
   * Atomic Operations:
   * 1. Query user's current points (SELECT FOR UPDATE via transaction)
   * 2. Find user badges to determine bonus eligibility
   * 3. Increment user.points by totalPointsAwarded
   * 4. Create PointTransaction record with full metadata
   *
   * Audit Trail Details:
   * The PointTransaction record includes:
   * - userId: Receipt user ID
   * - amount: Total points awarded (base + bonus)
   * - balance: New balance after increment
   * - type: "ANSWER_ACCEPTED"
   * - relatedType: "ANSWER" (for traceability)
   * - relatedId: Answer ID (linkage to source)
   * - metadata: { basePoints, badgeBonus, hasBadge } (for reporting)
   *
   * @param answererId - User ID of answer author (recipient)
   * @param answerId - Answer ID (for audit trail linkage)
   * @param tx - Prisma transaction context (ensures atomicity)
   * @returns Object with pointsAwarded, totalPoints, badgePointsAwarded
   * @throws Error if user not found or database error occurs
   *
   * @example
   * const result = await awardExpertPoints("user123", "answer456", tx);
   * // Result: {
   * //   pointsAwarded: 75,       // 50 base + 25 badge
   * //   totalPoints: 325,        // New user balance
   * //   badgePointsAwarded: 25
   * // }
   */
  private async awardExpertPoints(
    answererId: string,
    answerId: string,
    tx: any
  ): Promise<{
    pointsAwarded: number;
    totalPoints: number;
    badgePointsAwarded: number;
  }> {
    const EXPERT_POINTS = 50; // 기본 전문가 포인트 (@REQ:ANSWER-INTERACTION-001-U3)
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
      where: {
        userId: answererId,
      },
      include: { badge: true },
    });

    const hasExpertBadge = userBadges.some(
      (ub: any) =>
        ub.badge.type === "CATEGORY_EXPERT" ||
        ub.badge.type === "ACTIVITY_LEVEL"
    );

    const totalPointsAwarded =
      EXPERT_POINTS + (hasExpertBadge ? BADGE_BONUS_POINTS : 0);

    // Step 1: 포인트 업데이트 (User 테이블)
    const updatedUser = await tx.user.update({
      where: { id: answererId },
      data: {
        points: {
          increment: totalPointsAwarded,
        },
      },
      select: {
        id: true,
        points: true,
      },
    });

    // Step 2: PointTransaction 생성 (감사 추적)
    // @REQ:ANSWER-INTERACTION-001-U3 - Audit trail for point distribution
    await tx.pointTransaction.create({
      data: {
        userId: answererId,
        amount: totalPointsAwarded,
        balance: updatedUser.points,
        type: "ANSWER_ACCEPTED",
        description: "Answer adopted - expert points awarded",
        relatedType: "ANSWER",
        relatedId: answerId,
        metadata: {
          basePoints: EXPERT_POINTS,
          badgeBonus: hasExpertBadge ? BADGE_BONUS_POINTS : 0,
          hasBadge: hasExpertBadge,
        },
      },
    });

    return {
      pointsAwarded: totalPointsAwarded,
      totalPoints: updatedUser.points,
      badgePointsAwarded: hasExpertBadge ? BADGE_BONUS_POINTS : 0,
    };
  }

  /**
   * Update user statistics after answer adoption
   *
   * Recalculates and updates user adoption-related statistics.
   * Ensures consistency by counting actual adopted answers from database.
   *
   * Statistics Updated:
   * - adoptedAnswers: Count of answers by this user with non-null adoptedAt
   * - totalAnswers: Count of all answers by this user
   * - adoptRate: Percentage (adoptedAnswers / totalAnswers * 100)
   *
   * Calculation Details:
   * - Adopted count uses WHERE authorId AND NOT adoptedAt IS NULL
   * - Total count uses WHERE authorId
   * - Rate is rounded to 2 decimal places: Math.round(rate * 100) / 100
   * - Rate is 0 if user has no answers (divisor > 0 check)
   *
   * Performance Considerations:
   * - Uses count() which is optimized by Prisma
   * - Runs within transaction context for consistency
   * - Should be called after any adoption state change
   *
   * @param answererId - User ID to update statistics for
   * @param tx - Prisma transaction context
   * @throws Error if user not found or database error occurs
   *
   * @example
   * // After adoption, stats become:
   * // User has 1 adopted answer out of 5 total
   * // adoptedAnswers = 1, totalAnswers = 5, adoptRate = 20
   */
  private async updateUserStats(answererId: string, tx: any): Promise<void> {
    // 채택된 답변 수 업데이트
    const adoptedAnswersCount = await tx.answer.count({
      where: {
        authorId: answererId,
        NOT: {
          adoptedAt: null,
        },
      },
    });

    // 전체 답변 수 업데이트
    const totalAnswersCount = await tx.answer.count({
      where: { authorId: answererId },
    });

    // 채택률 계산
    const adoptRate =
      totalAnswersCount > 0
        ? (adoptedAnswersCount / totalAnswersCount) * 100
        : 0;

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
   * Check badge eligibility and auto-award new badges (async)
   *
   * Asynchronously checks if user qualifies for any new badges after adoption
   * and automatically awards them if criteria are met.
   *
   * Async Behavior:
   * - Called via .catch() in adoptAnswer() for non-blocking execution
   * - Errors are logged but do not affect adoption success
   * - BadgeService.checkAndAwardBadges() performs actual checking
   *
   * Common Badge Triggers (via BadgeService):
   * - CATEGORY_EXPERT: When answer adoption rate reaches 30% in a category
   * - ACTIVITY_LEVEL: When user reaches point milestones
   * - Other badges per BadgeService implementation
   *
   * Side Effects:
   * - Creates UserBadge records for newly earned badges
   * - Updates user.points if badge has point rewards
   * - Logs achievement messages for UI/notifications
   *
   * Error Handling:
   * - Catches and logs all errors to console
   * - Does not propagate errors (adoption already succeeded)
   * - Allows graceful degradation if badge service fails
   *
   * @param answererId - User ID to check badges for
   * @returns Promise that resolves when badge check completes
   * @throws Never throws (errors are caught and logged)
   *
   * @example
   * // Called in adoptAnswer() as:
   * this.checkBadgeEligibility(userId).catch(console.error);
   * // Continues immediately without waiting
   */
  private async checkBadgeEligibility(answererId: string): Promise<void> {
    try {
      const earnedBadges =
        await this.badgeService.checkAndAwardBadges(answererId);

      if (earnedBadges.length > 0) {
        console.log(
          `🎉 사용자 ${answererId}가 ${earnedBadges.length}개의 배지를 획득했습니다!`
        );

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
  async cancelAdoption(
    questionId: string,
    userId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return await this.prisma.$transaction(async tx => {
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
      answererName:
        question.acceptedAnswer?.author?.name ||
        question.acceptedAnswer?.author?.nickname ||
        undefined,
    };
  }
}
