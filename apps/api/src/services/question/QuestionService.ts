import { QuestionRepository } from "./QuestionRepository";
import { AuditLogService } from "../auditLog/AuditLogService";
import { AnswerService } from "../answer/AnswerService";
import {
  CreateQuestionData,
  UpdateQuestionData,
  QuestionSearchOptions,
} from "@jeju-tourlist/database/src/types/question";
import { PaginationParams } from "../../types";
import { PrismaClient } from "@prisma/client";

/**
 * 질문 서비스 클래스
 *
 * @description
 * - 질문 관련 비즈니스 로직을 담당
 * - Repository 패턴을 통해 데이터 접근 계층과 분리
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 *
 * @example
 * ```typescript
 * const questionService = new QuestionService(prisma);
 * const questions = await questionService.getQuestions({ page: 1, limit: 10 });
 * ```
 */
export class QuestionService {
  private readonly questionRepository: QuestionRepository;
  private readonly auditLogService: AuditLogService;

  constructor(
    private readonly prisma: PrismaClient,
    private answerService?: AnswerService
  ) {
    this.questionRepository = new QuestionRepository(prisma);
    this.auditLogService = new AuditLogService(prisma);
  }

  /**
   * 질문 생성
   *
   * @param data - 질문 생성 데이터
   * @returns 생성된 질문 정보
   * @throws {Error} 데이터 검증 실패 시 에러 발생
   */
  async createQuestion(data: CreateQuestionData) {
    // 해시태그 자동 파싱 및 정리
    const processedData = {
      ...data,
      tags: this.processTags(data.tags),
    };

    // 질문 생성
    const question = await this.questionRepository.create(processedData);

    // 통계 업데이트 (비동기, 에러가 발생해도 질문 생성은 성공)
    this.updateQuestionStats(question.id).catch(console.error);

    return question;
  }

  /**
   * 질문 상세 조회
   *
   * @param id - 질문 ID
   * @param incrementView - 조회수 증가 여부
   * @returns 질문 정보
   * @throws {Error} 질문을 찾을 수 없을 때 에러 발생
   */
  async getQuestionById(id: string, incrementView: boolean = true) {
    const question = await this.questionRepository.findById(id);

    if (!question) {
      throw new Error("질문을 찾을 수 없습니다.");
    }

    // 조회수 증가 (비동기)
    if (incrementView) {
      this.questionRepository.incrementViewCount(id).catch(console.error);
    }

    return question;
  }

  /**
   * 질문 목록 조회
   *
   * @param options - 검색 옵션
   * @returns 질문 목록과 페이지네이션 정보
   */
  async getQuestions(options: QuestionSearchOptions & PaginationParams) {
    return await this.questionRepository.findMany(options);
  }

  /**
   * 질문 수정
   *
   * @param id - 질문 ID
   * @param data - 수정할 데이터
   * @param userId - 수정 요청자 ID
   * @returns 수정된 질문 정보
   * @throws {Error} 권한이 없거나 질문을 찾을 수 없을 때 에러 발생
   */
  async updateQuestion(id: string, data: UpdateQuestionData, userId: string) {
    // 권한 확인
    await this.checkQuestionOwnership(id, userId);

    // 해시태그 처리
    const processedData = {
      ...data,
      tags: data.tags ? this.processTags(data.tags) : undefined,
    };

    return await this.questionRepository.update(id, processedData);
  }

  /**
   * 질문 삭제
   *
   * @param id - 질문 ID
   * @param userId - 삭제 요청자 ID
   * @returns 삭제된 질문 정보
   * @throws {Error} 권한이 없거나 질문을 찾을 수 없을 때 에러 발생
   */
  async deleteQuestion(id: string, userId: string) {
    // 1. 권한 확인
    await this.checkQuestionOwnership(id, userId);

    // 2. 모든 답변 삭제 (AnswerService에 위임)
    if (this.answerService) {
      const answers = await this.prisma.answer.findMany({
        where: { questionId: id },
        select: { id: true },
      });

      for (const answer of answers) {
        await this.answerService.deleteAnswer(answer.id, userId);
      }
    }

    // 3. 자신의 질문만 삭제
    const question = await this.prisma.question.update({
      where: { id },
      data: {
        status: "DELETED",
        acceptedAnswerId: null, // 참조 무결성: acceptedAnswerId 초기화
        updatedAt: new Date(),
      },
    });

    // 4. 감시 로그
    await this.auditLogService
      .logDelete({
        targetType: "QUESTION",
        targetId: id,
        userId,
        reason: "User requested deletion",
        details: {
          timestamp: new Date().toISOString(),
          action: "SOFT_DELETE",
        },
      })
      .catch(error => {
        console.error("Failed to log audit: ", error);
      });

    return question;
  }

  /**
   * 질문 좋아요 토글
   *
   * @param questionId - 질문 ID
   * @param userId - 사용자 ID
   * @returns 좋아요 상태와 업데이트된 좋아요 수
   */
  async toggleQuestionLike(questionId: string, userId: string) {
    // 기존 좋아요 확인
    const existingLike = await this.prisma.questionLike.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });

    if (existingLike) {
      // 좋아요 취소
      await this.prisma.questionLike.delete({
        where: {
          userId_questionId: {
            userId,
            questionId,
          },
        },
      });

      const newLikeCount =
        await this.questionRepository.decrementLikeCount(questionId);
      return { isLiked: false, likeCount: newLikeCount };
    } else {
      // 좋아요 추가
      await this.prisma.questionLike.create({
        data: {
          userId,
          questionId,
        },
      });

      const newLikeCount =
        await this.questionRepository.incrementLikeCount(questionId);
      return { isLiked: true, likeCount: newLikeCount };
    }
  }

  /**
   * 질문 북마크 토글
   *
   * @param questionId - 질문 ID
   * @param userId - 사용자 ID
   * @returns 북마크 상태
   */
  async toggleQuestionBookmark(questionId: string, userId: string) {
    // 기존 북마크 확인
    const existingBookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });

    if (existingBookmark) {
      // 북마크 취소
      await this.prisma.bookmark.delete({
        where: {
          userId_questionId: {
            userId,
            questionId,
          },
        },
      });
      return { isBookmarked: false };
    } else {
      // 북마크 추가
      await this.prisma.bookmark.create({
        data: {
          userId,
          questionId,
        },
      });
      return { isBookmarked: true };
    }
  }

  /**
   * 질문 해결 상태 변경
   *
   * @param id - 질문 ID
   * @param isResolved - 해결 상태
   * @param userId - 요청자 ID
   * @returns 업데이트된 질문 정보
   * @throws {Error} 권한이 없거나 질문을 찾을 수 없을 때 에러 발생
   */
  async updateQuestionResolvedStatus(
    id: string,
    isResolved: boolean,
    userId: string
  ) {
    // 권한 확인
    await this.checkQuestionOwnership(id, userId);

    return await this.questionRepository.updateResolvedStatus(id, isResolved);
  }

  /**
   * 인기 질문 조회
   *
   * @param limit - 조회할 개수
   * @returns 인기 질문 목록
   */
  async getPopularQuestions(limit: number = 10) {
    return await this.questionRepository.findPopular(limit);
  }

  /**
   * 질문 통계 업데이트
   *
   * @param questionId - 질문 ID
   * @private
   */
  private async updateQuestionStats(questionId: string) {
    try {
      // 답변 수 계산
      const answerCount = await this.prisma.answer.count({
        where: {
          questionId,
          status: "ACTIVE",
        },
      });

      // 좋아요 수 계산
      const likeCount = await this.prisma.questionLike.count({
        where: {
          questionId,
        },
      });

      // 북마크 수 계산 (사용하지 않지만 향후 확장을 위해 유지)
      // const bookmarkCount = await this.prisma.bookmark.count({
      //   where: {
      //     questionId,
      //   },
      // });

      // 통계 업데이트
      await this.prisma.question.update({
        where: { id: questionId },
        data: {
          answerCount,
          likeCount,
        },
      });
    } catch (error) {
      console.error("질문 통계 업데이트 실패:", error);
    }
  }

  /**
   * 질문 소유권 확인
   *
   * @param questionId - 질문 ID
   * @param userId - 사용자 ID
   * @private
   * @throws {Error} 권한이 없을 때 에러 발생
   */
  private async checkQuestionOwnership(questionId: string, userId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: { authorId: true },
    });

    if (!question) {
      throw new Error("질문을 찾을 수 없습니다.");
    }

    if (question.authorId !== userId) {
      throw new Error("질문을 수정할 권한이 없습니다.");
    }
  }

  /**
   * 해시태그 처리 및 정리
   *
   * @param tags - 원본 태그 배열
   * @returns 처리된 태그 배열
   * @private
   */
  private processTags(tags: string[]): string[] {
    return tags
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .filter((tag, index, array) => array.indexOf(tag) === index) // 중복 제거
      .slice(0, 10); // 최대 10개로 제한
  }
}
