import { AnswerCommentRepository } from "./AnswerCommentRepository";
import {
  CreateAnswerCommentData,
  UpdateAnswerCommentData,
  AnswerCommentSearchOptions,
} from "@jeju-tourlist/database/src/types/answerComment";
// import { PaginationParams } from "../../types";
import { PrismaClient } from "@prisma/client";

/**
 * 답변 댓글 서비스 클래스
 *
 * @description
 * - 답변 댓글 관련 비즈니스 로직을 담당
 * - Repository 패턴을 통해 데이터 접근 계층과 분리
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 *
 * @example
 * ```typescript
 * const answerCommentService = new AnswerCommentService(prisma);
 * const comments = await answerCommentService.getCommentsByAnswerId("answer123");
 * ```
 */
import { AuditLogService } from "../auditLog/AuditLogService";

export class AnswerCommentService {
  private readonly answerCommentRepository: AnswerCommentRepository;
  private readonly auditLogService: AuditLogService;

  constructor(private readonly prisma: PrismaClient) {
    this.answerCommentRepository = new AnswerCommentRepository(prisma);
    this.auditLogService = new AuditLogService(prisma);
  }

  /**
   * 답변 댓글 생성
   *
   * @param data - 답변 댓글 생성 데이터
   * @returns 생성된 답변 댓글 정보
   * @throws {Error} 데이터 검증 실패 시 에러 발생
   */
  async createComment(data: CreateAnswerCommentData) {
    // 답변 존재 여부 확인
    const answer = await this.prisma.answer.findUnique({
      where: { id: data.answerId },
      select: { id: true, authorId: true, status: true },
    });

    if (!answer) {
      throw new Error("답변을 찾을 수 없습니다.");
    }

    if (answer.status !== "ACTIVE") {
      throw new Error("비활성화된 답변에는 댓글을 달 수 없습니다.");
    }

    // 임시 사용자 ID인 경우 사용자 생성 또는 확인
    if (data.authorId === "temp-user-id") {
      await this.ensureTempUserExists();
    }

    // 댓글 생성
    const comment = await this.answerCommentRepository.create(data);

    // 답변 작성자에게 알림 발송 (비동기)
    this.sendCommentNotification(answer.authorId, comment.id).catch(
      console.error
    );

    // 댓글과 함께 author 정보 반환
    const commentWithAuthor = await this.prisma.answerComment.findUnique({
      where: { id: comment.id },
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

    return commentWithAuthor || comment;
  }

  /**
   * 답변 댓글 상세 조회
   *
   * @param id - 답변 댓글 ID
   * @returns 답변 댓글 정보
   * @throws {Error} 답변 댓글을 찾을 수 없을 때 에러 발생
   */
  async getCommentById(id: string) {
    const comment = await this.answerCommentRepository.findByIdWithDetails(id);

    if (!comment) {
      throw new Error("답변 댓글을 찾을 수 없습니다.");
    }

    return comment;
  }

  /**
   * 답변별 댓글 목록 조회
   *
   * @param answerId - 답변 ID
   * @param options - 검색 옵션
   * @returns 답변 댓글 목록
   */
  async getCommentsByAnswerId(
    answerId: string,
    options: AnswerCommentSearchOptions = {}
  ) {
    return await this.answerCommentRepository.findByAnswer(answerId, {
      ...options,
      status: "ACTIVE", // 활성 댓글만 조회
    });
  }

  /**
   * 사용자별 댓글 목록 조회
   *
   * @param authorId - 작성자 ID
   * @param options - 검색 옵션
   * @returns 답변 댓글 목록
   */
  async getCommentsByAuthorId(
    authorId: string,
    options: AnswerCommentSearchOptions = {}
  ) {
    return await this.answerCommentRepository.findByAuthor(authorId, options);
  }

  /**
   * 답변 댓글 수정
   *
   * @param id - 답변 댓글 ID
   * @param data - 수정 데이터
   * @param userId - 요청 사용자 ID
   * @returns 수정된 답변 댓글 정보
   * @throws {Error} 권한 없음 또는 댓글을 찾을 수 없을 때 에러 발생
   */
  async updateComment(
    id: string,
    data: UpdateAnswerCommentData,
    userId: string
  ) {
    const comment = await this.answerCommentRepository.findById(id);

    if (!comment) {
      throw new Error("답변 댓글을 찾을 수 없습니다.");
    }

    if (comment.authorId !== userId) {
      throw new Error("댓글을 수정할 권한이 없습니다.");
    }

    return await this.answerCommentRepository.update(id, data);
  }

  /**
   * 답변 댓글 삭제 (소프트 삭제)
   *
   * @param id - 답변 댓글 ID
   * @param userId - 요청 사용자 ID
   * @throws {Error} 권한 없음 또는 댓글을 찾을 수 없을 때 에러 발생
   */
  async deleteComment(id: string, userId: string) {
    // 1. 권한 확인
    const comment = await this.answerCommentRepository.findById(id);

    if (!comment) {
      throw new Error("답변 댓글을 찾을 수 없습니다");
    }

    if (comment.authorId !== userId) {
      throw new Error("댓글을 삭제할 권한이 없습니다");
    }

    // 2. 모든 대댓글 삭제 (재귀)
    const replies = await this.prisma.answerComment.findMany({
      where: { parentId: id },
      select: { id: true },
    });

    for (const reply of replies) {
      await this.deleteComment(reply.id, userId);
    }

    // 3. 자신의 댓글만 삭제
    await this.prisma.answerComment.update({
      where: { id },
      data: { status: "DELETED", updatedAt: new Date() },
    });

    // 4. 감시 로그
    await this.auditLogService
      .logDelete({
        targetType: "COMMENT",
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
  }

  /**
   * 답변 댓글 좋아요/싫어요
   *
   * @param commentId - 답변 댓글 ID
   * @param userId - 사용자 ID
   * @param isLike - 좋아요 여부
   * @throws {Error} 댓글을 찾을 수 없을 때 에러 발생
   */
  async toggleReaction(commentId: string, userId: string, isLike: boolean) {
    const comment = await this.answerCommentRepository.findById(commentId);

    if (!comment) {
      throw new Error("답변 댓글을 찾을 수 없습니다.");
    }

    if (comment.status !== "ACTIVE") {
      throw new Error("비활성화된 댓글에는 반응할 수 없습니다.");
    }

    // 기존 반응 확인
    const existingReaction = await this.answerCommentRepository.getUserReaction(
      userId,
      commentId
    );

    if (existingReaction) {
      if (existingReaction.isLike === isLike) {
        // 같은 반응이면 제거
        await this.answerCommentRepository.removeReaction(userId, commentId);
      } else {
        // 다른 반응이면 업데이트
        await this.answerCommentRepository.updateReaction({
          commentId,
          userId,
          isLike,
        });
      }
    } else {
      // 새로운 반응 추가
      await this.answerCommentRepository.addReaction({
        commentId,
        userId,
        isLike,
      });
    }

    return await this.answerCommentRepository.findById(commentId);
  }

  /**
   * 답변 댓글 통계 조회
   *
   * @param answerId - 답변 ID
   * @returns 댓글 통계
   */
  async getCommentStats(answerId: string) {
    const totalComments = await this.answerCommentRepository.count({
      answerId,
      status: "ACTIVE",
    });

    return {
      totalComments,
    };
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
          provider: "credentials",
          providerId: "temp-user-id",
          avatar: null,
          isVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }

  /**
   * 댓글 알림 발송
   *
   * @param answerAuthorId - 답변 작성자 ID
   * @param commentId - 댓글 ID
   */
  private async sendCommentNotification(
    answerAuthorId: string,
    commentId: string
  ) {
    try {
      // 답변 작성자에게 댓글 알림 발송
      await this.prisma.notification.create({
        data: {
          userId: answerAuthorId,
          type: "ANSWER_LIKED", // 기존 타입 재사용
          title: "답변에 댓글이 달렸습니다",
          message: "작성하신 답변에 새로운 댓글이 달렸습니다.",
          data: {
            commentId,
            type: "comment",
          },
        },
      });

      console.log(
        `댓글 알림 발송: 답변 작성자 ${answerAuthorId}, 댓글 ${commentId}`
      );
    } catch (error) {
      console.error("댓글 알림 발송 실패:", error);
    }
  }
}
