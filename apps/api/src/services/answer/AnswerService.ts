import { AnswerRepository } from "./AnswerRepository";
import {
  CreateAnswerData,
  UpdateAnswerData,
  AnswerSearchOptions,
} from "@jeju-tourlist/database/types/answer";
import { PaginationParams } from "../../types";
import { PrismaClient } from "@prisma/client";

/**
 * 답변 서비스 클래스
 *
 * @description
 * - 답변 관련 비즈니스 로직을 담당
 * - Repository 패턴을 통해 데이터 접근 계층과 분리
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 *
 * @example
 * ```typescript
 * const answerService = new AnswerService(prisma);
 * const answers = await answerService.getAnswersByQuestionId("question123");
 * ```
 */
export class AnswerService {
  private readonly answerRepository: AnswerRepository;

  constructor(private readonly prisma: PrismaClient) {
    this.answerRepository = new AnswerRepository(prisma);
  }

  /**
   * 답변 생성
   *
   * @param data - 답변 생성 데이터
   * @returns 생성된 답변 정보
   * @throws {Error} 데이터 검증 실패 시 에러 발생
   */
  async createAnswer(data: CreateAnswerData) {
    // 질문 존재 여부 확인
    const question = await this.prisma.question.findUnique({
      where: { id: data.questionId },
      select: { id: true, authorId: true, isResolved: true },
    });

    if (!question) {
      throw new Error("질문을 찾을 수 없습니다.");
    }

    if (question.isResolved) {
      throw new Error("이미 해결된 질문입니다.");
    }

    // 임시 사용자 ID인 경우 사용자 생성 또는 확인
    if (data.authorId === "temp-user-id") {
      await this.ensureTempUserExists();
    }

    // 답변 생성
    const answer = await this.answerRepository.create(data);

    // 질문의 답변 수 증가 (비동기)
    this.updateQuestionAnswerCount(data.questionId).catch(console.error);

    // 질문 작성자에게 알림 발송 (비동기)
    this.sendAnswerNotification(question.authorId, answer.id).catch(
      console.error
    );

    // 답변과 함께 author 정보 반환
    const answerWithAuthor = await this.prisma.answer.findUnique({
      where: { id: answer.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    });
    
    return answerWithAuthor || answer;
  }

  /**
   * 임시 사용자 존재 확인 및 생성
   */
  private async ensureTempUserExists() {
    const tempUser = await this.prisma.user.findUnique({
      where: { id: "temp-user-id" },
    });

    if (!tempUser) {
      await this.prisma.user.create({
        data: {
          id: "temp-user-id",
          email: "temp@example.com",
          name: "임시사용자",
          nickname: "임시사용자",
          avatar: null,
          isVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }

  /**
   * 답변 상세 조회
   *
   * @param id - 답변 ID
   * @returns 답변 정보
   * @throws {Error} 답변을 찾을 수 없을 때 에러 발생
   */
  async getAnswerById(id: string) {
    const answer = await this.answerRepository.findById(id);

    if (!answer) {
      throw new Error("답변을 찾을 수 없습니다.");
    }

    return answer;
  }

  /**
   * 질문별 답변 목록 조회
   *
   * @param questionId - 질문 ID
   * @param options - 검색 옵션
   * @returns 답변 목록과 페이지네이션 정보
   */
  async getAnswersByQuestionId(
    questionId: string,
    options: AnswerSearchOptions & PaginationParams = {}
  ) {
    return await this.answerRepository.findByQuestionId(questionId, options);
  }

  /**
   * 사용자별 답변 목록 조회
   *
   * @param authorId - 작성자 ID
   * @param options - 검색 옵션
   * @returns 답변 목록과 페이지네이션 정보
   */
  async getAnswersByAuthorId(
    authorId: string,
    options: AnswerSearchOptions & PaginationParams = {}
  ) {
    return await this.answerRepository.findByAuthorId(authorId, options);
  }

  /**
   * 답변 수정
   *
   * @param id - 답변 ID
   * @param data - 수정할 데이터
   * @param userId - 수정 요청자 ID
   * @returns 수정된 답변 정보
   * @throws {Error} 권한이 없거나 답변을 찾을 수 없을 때 에러 발생
   */
  async updateAnswer(id: string, data: UpdateAnswerData, userId: string) {
    // 권한 확인
    await this.checkAnswerOwnership(id, userId);

    return await this.answerRepository.update(id, data);
  }

  /**
   * 답변 삭제
   *
   * @param id - 답변 ID
   * @param userId - 삭제 요청자 ID
   * @returns 삭제된 답변 정보
   * @throws {Error} 권한이 없거나 답변을 찾을 수 없을 때 에러 발생
   */
  async deleteAnswer(id: string, userId: string) {
    // 권한 확인
    await this.checkAnswerOwnership(id, userId);

    const answer = await this.answerRepository.delete(id);

    // 질문의 답변 수 감소 (비동기)
    this.updateQuestionAnswerCount(answer.questionId).catch(console.error);

    return answer;
  }

  /**
   * 답변 좋아요/싫어요 토글
   *
   * @param answerId - 답변 ID
   * @param userId - 사용자 ID
   * @param isLike - 좋아요(true) 또는 싫어요(false)
   * @returns 반응 상태와 업데이트된 카운트
   */
  async toggleAnswerReaction(
    answerId: string,
    userId: string,
    isLike: boolean
  ) {
    // 기존 반응 확인
    const existingReaction = await this.prisma.answerLike.findUnique({
      where: {
        userId_answerId: {
          userId,
          answerId,
        },
      },
    });

    if (existingReaction) {
      if (existingReaction.isLike === isLike) {
        // 같은 반응이면 취소
        await this.prisma.answerLike.delete({
          where: {
            userId_answerId: {
              userId,
              answerId,
            },
          },
        });

        const newLikeCount = isLike
          ? await this.answerRepository.decrementLikeCount(answerId)
          : await this.answerRepository.decrementDislikeCount(answerId);

        return {
          isReacted: false,
          isLike,
          likeCount: newLikeCount,
          dislikeCount: 0, // TODO: 실제 싫어요 수 조회
        };
      } else {
        // 다른 반응이면 변경
        await this.prisma.answerLike.update({
          where: {
            userId_answerId: {
              userId,
              answerId,
            },
          },
          data: { isLike },
        });

        // 기존 반응 카운트 감소, 새로운 반응 카운트 증가
        if (isLike) {
          await this.answerRepository.decrementDislikeCount(answerId);
          const newLikeCount =
            await this.answerRepository.incrementLikeCount(answerId);
          return {
            isReacted: true,
            isLike,
            likeCount: newLikeCount,
            dislikeCount: 0, // TODO: 실제 싫어요 수 조회
          };
        } else {
          await this.answerRepository.decrementLikeCount(answerId);
          const newDislikeCount =
            await this.answerRepository.incrementDislikeCount(answerId);
          return {
            isReacted: true,
            isLike,
            likeCount: 0, // TODO: 실제 좋아요 수 조회
            dislikeCount: newDislikeCount,
          };
        }
      }
    } else {
      // 새로운 반응 추가
      await this.prisma.answerLike.create({
        data: {
          userId,
          answerId,
          isLike,
        },
      });

      const newLikeCount = isLike
        ? await this.answerRepository.incrementLikeCount(answerId)
        : 0;
      const newDislikeCount = !isLike
        ? await this.answerRepository.incrementDislikeCount(answerId)
        : 0;

      return {
        isReacted: true,
        isLike,
        likeCount: newLikeCount,
        dislikeCount: newDislikeCount,
      };
    }
  }

  /**
   * 답변 채택
   *
   * @param answerId - 답변 ID
   * @param questionId - 질문 ID
   * @param userId - 요청자 ID (질문 작성자)
   * @returns 채택된 답변 정보
   * @throws {Error} 권한이 없거나 답변을 찾을 수 없을 때 에러 발생
   */
  async acceptAnswer(answerId: string, questionId: string, userId: string) {
    // 질문 작성자 확인
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: { authorId: true, isResolved: true },
    });

    if (!question) {
      throw new Error("질문을 찾을 수 없습니다.");
    }

    if (question.authorId !== userId) {
      throw new Error("질문 작성자만 답변을 채택할 수 있습니다.");
    }

    // 답변 존재 확인
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
      select: { id: true, questionId: true },
    });

    if (!answer) {
      throw new Error("답변을 찾을 수 없습니다.");
    }

    if (answer.questionId !== questionId) {
      throw new Error("해당 질문의 답변이 아닙니다.");
    }

    // 다른 답변들 채택 해제
    await this.answerRepository.unacceptOtherAnswers(questionId, answerId);

    // 답변 채택
    const acceptedAnswer = await this.answerRepository.updateAcceptedStatus(
      answerId,
      true
    );

    // 질문 해결 상태 변경 (비동기)
    this.updateQuestionResolvedStatus(questionId, true).catch(console.error);

    // 답변 작성자에게 알림 발송 (비동기)
    this.sendAnswerAcceptedNotification(answer.authorId, answerId).catch(
      console.error
    );

    return acceptedAnswer;
  }

  /**
   * 답변 채택 해제
   *
   * @param answerId - 답변 ID
   * @param questionId - 질문 ID
   * @param userId - 요청자 ID (질문 작성자)
   * @returns 채택 해제된 답변 정보
   * @throws {Error} 권한이 없거나 답변을 찾을 수 없을 때 에러 발생
   */
  async unacceptAnswer(answerId: string, questionId: string, userId: string) {
    // 질문 작성자 확인
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: { authorId: true },
    });

    if (!question) {
      throw new Error("질문을 찾을 수 없습니다.");
    }

    if (question.authorId !== userId) {
      throw new Error("질문 작성자만 답변 채택을 해제할 수 있습니다.");
    }

    // 답변 채택 해제
    const unacceptedAnswer = await this.answerRepository.updateAcceptedStatus(
      answerId,
      false
    );

    // 질문 해결 상태 변경 (비동기)
    this.updateQuestionResolvedStatus(questionId, false).catch(console.error);

    return unacceptedAnswer;
  }

  /**
   * 답변 통계 조회
   *
   * @param answerId - 답변 ID
   * @returns 답변 통계 정보
   */
  async getAnswerStats(answerId: string) {
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
      select: {
        likeCount: true,
        dislikeCount: true,
        isAccepted: true,
        acceptedAt: true,
        createdAt: true,
      },
    });

    if (!answer) {
      throw new Error("답변을 찾을 수 없습니다.");
    }

    const acceptanceTime =
      answer.isAccepted && answer.acceptedAt
        ? Math.floor(
            (answer.acceptedAt.getTime() - answer.createdAt.getTime()) /
              (1000 * 60)
          ) // 분 단위
        : undefined;

    return {
      totalLikes: answer.likeCount,
      totalDislikes: answer.dislikeCount,
      isAccepted: answer.isAccepted,
      acceptanceTime,
    };
  }

  /**
   * 답변 소유권 확인
   *
   * @param answerId - 답변 ID
   * @param userId - 사용자 ID
   * @private
   * @throws {Error} 권한이 없을 때 에러 발생
   */
  private async checkAnswerOwnership(answerId: string, userId: string) {
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
      select: { authorId: true },
    });

    if (!answer) {
      throw new Error("답변을 찾을 수 없습니다.");
    }

    if (answer.authorId !== userId) {
      throw new Error("답변을 수정할 권한이 없습니다.");
    }
  }

  /**
   * 질문 답변 수 업데이트
   *
   * @param questionId - 질문 ID
   * @private
   */
  private async updateQuestionAnswerCount(questionId: string) {
    try {
      const answerCount = await this.prisma.answer.count({
        where: {
          questionId,
          status: "ACTIVE",
        },
      });

      await this.prisma.question.update({
        where: { id: questionId },
        data: { answerCount },
      });
    } catch (error) {
      console.error("질문 답변 수 업데이트 실패:", error);
    }
  }

  /**
   * 질문 해결 상태 업데이트
   *
   * @param questionId - 질문 ID
   * @param isResolved - 해결 상태
   * @private
   */
  private async updateQuestionResolvedStatus(
    questionId: string,
    isResolved: boolean
  ) {
    try {
      await this.prisma.question.update({
        where: { id: questionId },
        data: {
          isResolved,
          resolvedAt: isResolved ? new Date() : null,
        },
      });
    } catch (error) {
      console.error("질문 해결 상태 업데이트 실패:", error);
    }
  }

  /**
   * 답변 알림 발송
   *
   * @param questionAuthorId - 질문 작성자 ID
   * @param answerId - 답변 ID
   * @private
   */
  private async sendAnswerNotification(
    questionAuthorId: string,
    answerId: string
  ) {
    try {
      // TODO: 실제 알림 시스템 구현
      console.log(
        `답변 알림 발송: 질문 작성자 ${questionAuthorId}, 답변 ${answerId}`
      );
    } catch (error) {
      console.error("답변 알림 발송 실패:", error);
    }
  }

  /**
   * 답변 채택 알림 발송
   *
   * @param answerAuthorId - 답변 작성자 ID
   * @param answerId - 답변 ID
   * @private
   */
  private async sendAnswerAcceptedNotification(
    answerAuthorId: string,
    answerId: string
  ) {
    try {
      // TODO: 실제 알림 시스템 구현
      console.log(
        `답변 채택 알림 발송: 답변 작성자 ${answerAuthorId}, 답변 ${answerId}`
      );
    } catch (error) {
      console.error("답변 채택 알림 발송 실패:", error);
    }
  }
}
