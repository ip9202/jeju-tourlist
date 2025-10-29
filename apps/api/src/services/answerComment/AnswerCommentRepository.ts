import { PrismaClient, AnswerComment, Prisma } from "@prisma/client";
import {
  CreateAnswerCommentData,
  UpdateAnswerCommentData,
  AnswerCommentSearchOptions,
  AnswerCommentListItem,
  AnswerCommentReactionData,
} from "@jeju-tourlist/database/src/types/answerComment";

// 직접 PrismaClient 생성
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        "postgresql://test:test@localhost:5433/asklocal_dev",
    },
  },
});

/**
 * 답변 댓글 Repository 클래스
 *
 * @description
 * - 답변 댓글 관련 데이터베이스 작업을 담당
 * - Repository 패턴을 통해 데이터 접근 로직을 캡슐화
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 *
 * @example
 * ```typescript
 * const answerCommentRepo = new AnswerCommentRepository(prisma);
 * const comments = await answerCommentRepo.findByAnswerId("answer123");
 * ```
 */
export class AnswerCommentRepository {
  constructor(private readonly _prisma?: PrismaClient) {}

  private get prisma(): PrismaClient {
    return this._prisma || prisma;
  }

  /**
   * 답변 댓글 생성
   *
   * @param data - 답변 댓글 생성 데이터
   * @returns 생성된 답변 댓글 정보
   * @throws {Error} 데이터 검증 실패 시 에러 발생
   */
  async create(data: CreateAnswerCommentData): Promise<AnswerComment> {
    try {
      return await this.prisma.answerComment.create({
        data: {
          content: data.content,
          authorId: data.authorId,
          answerId: data.answerId,
          parentId: data.parentId || null,
          depth: data.depth || 0,
          status: "ACTIVE",
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              nickname: true,
              avatar: true,
            },
          },
          answer: {
            select: {
              id: true,
              content: true,
              authorId: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(
        `답변 댓글 생성 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 답변 댓글 ID로 조회
   *
   * @param id - 답변 댓글 ID
   * @returns 답변 댓글 정보 또는 null
   */
  async findById(id: string): Promise<AnswerComment | null> {
    try {
      const comment = await this.prisma.answerComment.findUnique({
        where: { id },
      });

      // Phase 1: 삭제된 데이터 자동 필터링
      // DELETED 상태인 댓글은 조회 불가능하도록 처리
      if (comment && comment.status === "DELETED") {
        return null;
      }

      return comment;
    } catch (error) {
      throw new Error(
        `답변 댓글 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 답변 댓글 상세 조회 (작성자 정보 포함)
   *
   * @param id - 답변 댓글 ID
   * @returns 답변 댓글 상세 정보 또는 null
   */
  async findByIdWithDetails(id: string): Promise<AnswerCommentListItem | null> {
    try {
      const comment = await this.prisma.answerComment.findUnique({
        where: { id },
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

      // Phase 1: 삭제된 데이터 자동 필터링
      // DELETED 상태인 댓글은 조회 불가능하도록 처리
      if (!comment || comment.status === "DELETED") return null;

      return {
        id: comment.id,
        content: comment.content,
        author: {
          ...comment.author,
          avatar: comment.author.avatar || undefined,
        },
        answerId: comment.answerId,
        status: comment.status,
        likeCount: comment.likeCount,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      };
    } catch (error) {
      throw new Error(
        `답변 댓글 상세 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 답변별 댓글 목록 조회
   *
   * @param answerId - 답변 ID
   * @param options - 검색 옵션
   * @returns 답변 댓글 목록
   */
  async findByAnswer(
    answerId: string,
    options: AnswerCommentSearchOptions = {}
  ): Promise<AnswerComment[]> {
    try {
      const where: Prisma.AnswerCommentWhereInput = {
        answerId,
        status: options.status || "ACTIVE",
      };

      if (options.authorId) {
        where.authorId = options.authorId;
      }

      const orderBy: Prisma.AnswerCommentOrderByWithRelationInput = {};
      if (options.sortBy === "likeCount") {
        orderBy.likeCount = options.sortOrder || "desc";
      } else {
        orderBy.createdAt = options.sortOrder || "asc";
      }

      return await prisma.answerComment.findMany({
        where,
        orderBy,
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
        take: options.pagination?.limit,
        skip: options.pagination
          ? (options.pagination.page - 1) * options.pagination.limit
          : undefined,
      });
    } catch (error) {
      throw new Error(
        `답변별 댓글 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 작성자별 댓글 목록 조회
   *
   * @param authorId - 작성자 ID
   * @param options - 검색 옵션
   * @returns 답변 댓글 목록
   */
  async findByAuthor(
    authorId: string,
    options: AnswerCommentSearchOptions = {}
  ): Promise<AnswerComment[]> {
    try {
      const where: Prisma.AnswerCommentWhereInput = {
        authorId,
        status: options.status || "ACTIVE",
      };

      if (options.answerId) {
        where.answerId = options.answerId;
      }

      const orderBy: Prisma.AnswerCommentOrderByWithRelationInput = {};
      if (options.sortBy === "likeCount") {
        orderBy.likeCount = options.sortOrder || "desc";
      } else {
        orderBy.createdAt = options.sortOrder || "desc";
      }

      return await this.prisma.answerComment.findMany({
        where,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              nickname: true,
              avatar: true,
            },
          },
          answer: {
            select: {
              id: true,
              content: true,
              questionId: true,
            },
          },
        },
        take: options.pagination?.limit,
        skip: options.pagination
          ? (options.pagination.page - 1) * options.pagination.limit
          : undefined,
      });
    } catch (error) {
      throw new Error(
        `작성자별 댓글 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 답변 댓글 수정
   *
   * @param id - 답변 댓글 ID
   * @param data - 수정 데이터
   * @returns 수정된 답변 댓글 정보
   */
  async update(
    id: string,
    data: UpdateAnswerCommentData
  ): Promise<AnswerComment> {
    try {
      return await this.prisma.answerComment.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
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
    } catch (error) {
      throw new Error(
        `답변 댓글 수정 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 답변 댓글 삭제
   *
   * @param id - 답변 댓글 ID
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.answerComment.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(
        `답변 댓글 삭제 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 답변 댓글 개수 조회
   *
   * @param options - 검색 옵션
   * @returns 댓글 개수
   */
  async count(options: AnswerCommentSearchOptions = {}): Promise<number> {
    try {
      const where: Prisma.AnswerCommentWhereInput = {
        status: options.status || "ACTIVE",
      };

      if (options.answerId) {
        where.answerId = options.answerId;
      }

      if (options.authorId) {
        where.authorId = options.authorId;
      }

      return await prisma.answerComment.count({ where });
    } catch (error) {
      throw new Error(
        `답변 댓글 개수 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 좋아요 수 업데이트
   *
   * @param commentId - 답변 댓글 ID
   * @returns 업데이트된 답변 댓글 정보
   */
  async updateLikeCount(commentId: string): Promise<AnswerComment> {
    try {
      const likeCount = await this.prisma.answerCommentLike.count({
        where: { commentId, isLike: true },
      });

      return await this.prisma.answerComment.update({
        where: { id: commentId },
        data: { likeCount },
      });
    } catch (error) {
      throw new Error(
        `좋아요 수 업데이트 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 싫어요 수 업데이트
   *
   * @param commentId - 답변 댓글 ID
   * @returns 업데이트된 답변 댓글 정보
   */
  async updateDislikeCount(commentId: string): Promise<AnswerComment> {
    try {
      // dislikeCount는 AnswerComment 모델에 없으므로 업데이트하지 않음
      // 좋아요/싫어요는 AnswerCommentLike 테이블에서 관리됨
      const comment = await this.prisma.answerComment.findUnique({
        where: { id: commentId },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
              userRole: true,
            },
          },
        },
      });
      return comment as AnswerComment;
    } catch (error) {
      throw new Error(
        `싫어요 수 업데이트 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 사용자 반응 추가
   *
   * @param data - 반응 데이터
   */
  async addReaction(data: AnswerCommentReactionData): Promise<void> {
    try {
      await this.prisma.answerCommentLike.create({
        data: {
          ...data,
          createdAt: new Date(),
        },
      });

      // 댓글의 좋아요/싫어요 수 업데이트
      if (data.isLike) {
        await this.updateLikeCount(data.commentId);
      } else {
        await this.updateDislikeCount(data.commentId);
      }
    } catch (error) {
      throw new Error(
        `반응 추가 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 사용자 반응 제거
   *
   * @param userId - 사용자 ID
   * @param commentId - 답변 댓글 ID
   */
  async removeReaction(userId: string, commentId: string): Promise<void> {
    try {
      const reaction = await this.prisma.answerCommentLike.findUnique({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      });

      if (!reaction) {
        throw new Error("반응을 찾을 수 없습니다");
      }

      await this.prisma.answerCommentLike.delete({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      });

      // 댓글의 좋아요/싫어요 수 업데이트
      if (reaction.isLike) {
        await this.updateLikeCount(commentId);
      } else {
        await this.updateDislikeCount(commentId);
      }
    } catch (error) {
      throw new Error(
        `반응 제거 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 사용자 반응 업데이트
   *
   * @param data - 반응 데이터
   */
  async updateReaction(data: AnswerCommentReactionData): Promise<void> {
    try {
      await this.prisma.answerCommentLike.upsert({
        where: {
          userId_commentId: {
            userId: data.userId,
            commentId: data.commentId,
          },
        },
        update: {
          isLike: data.isLike,
        },
        create: {
          ...data,
          createdAt: new Date(),
        },
      });

      // 댓글의 좋아요/싫어요 수 업데이트
      await this.updateLikeCount(data.commentId);
      await this.updateDislikeCount(data.commentId);
    } catch (error) {
      throw new Error(
        `반응 업데이트 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 사용자 반응 조회
   *
   * @param userId - 사용자 ID
   * @param commentId - 답변 댓글 ID
   * @returns 사용자 반응 정보 또는 null
   */
  async getUserReaction(
    userId: string,
    commentId: string
  ): Promise<{ isLike: boolean } | null> {
    try {
      const reaction = await this.prisma.answerCommentLike.findUnique({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
        select: {
          isLike: true,
        },
      });

      return reaction;
    } catch (error) {
      throw new Error(
        `사용자 반응 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }
}
