// @ts-expect-error Prisma client type recognition issue in monorepo
import { PrismaClient, AnswerComment } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import {
  CreateAnswerCommentData,
  UpdateAnswerCommentData,
  AnswerCommentSearchOptions,
  AnswerCommentListItem,
  AnswerCommentReactionData,
} from "../types/answerComment";

// 답변 댓글 Repository 인터페이스 (ISP)
export interface IAnswerCommentRepository {
  findById(id: string): Promise<AnswerComment | null>;
  findByIdWithDetails(id: string): Promise<AnswerCommentListItem | null>;
  findMany(options?: AnswerCommentSearchOptions): Promise<AnswerComment[]>;
  findManyPaginated(
    options: AnswerCommentSearchOptions & {
      pagination: { page: number; limit: number };
    }
  ): Promise<{ data: AnswerComment[]; pagination: any }>;
  create(data: CreateAnswerCommentData): Promise<AnswerComment>;
  update(id: string, data: UpdateAnswerCommentData): Promise<AnswerComment>;
  delete(id: string): Promise<void>;
  count(options?: AnswerCommentSearchOptions): Promise<number>;

  // 답변 댓글 특화 메서드
  findByAnswer(
    answerId: string,
    options?: AnswerCommentSearchOptions
  ): Promise<AnswerComment[]>;
  findByAuthor(
    authorId: string,
    options?: AnswerCommentSearchOptions
  ): Promise<AnswerComment[]>;

  // 통계 및 상호작용
  updateLikeCount(commentId: string): Promise<AnswerComment>;
  updateDislikeCount(commentId: string): Promise<AnswerComment>;

  // 좋아요/싫어요 관리
  addReaction(data: AnswerCommentReactionData): Promise<void>;
  removeReaction(userId: string, commentId: string): Promise<void>;
  updateReaction(data: AnswerCommentReactionData): Promise<void>;
  getUserReaction(
    userId: string,
    commentId: string
  ): Promise<{ isLike: boolean } | null>;
}

// 답변 댓글 Repository 구현 (SRP)
export class AnswerCommentRepository
  extends BaseRepository<
    AnswerComment,
    CreateAnswerCommentData,
    UpdateAnswerCommentData,
    AnswerCommentSearchOptions
  >
  implements IAnswerCommentRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma, "AnswerComment");
  }

  async findById(id: string): Promise<AnswerComment | null> {
    try {
      return await this.prisma.answerComment.findUnique({
        where: { id },
      });
    } catch (error) {
      this.handleError(error, "findById");
    }
  }

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

      if (!comment) return null;

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
      this.handleError(error, "findByIdWithDetails");
    }
  }

  async findMany(options: AnswerCommentSearchOptions = {}): Promise<AnswerComment[]> {
    try {
      const where = this.buildWhereClause(options);
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );

      return await this.prisma.answerComment.findMany({
        where,
        orderBy,
        take: options.pagination?.limit,
        skip: options.pagination
          ? (options.pagination.page - 1) * options.pagination.limit
          : undefined,
      });
    } catch (error) {
      this.handleError(error, "findMany");
    }
  }

  async findManyPaginated(
    options: AnswerCommentSearchOptions & {
      pagination: { page: number; limit: number };
    }
  ): Promise<{ data: AnswerComment[]; pagination: any }> {
    try {
      const where = this.buildWhereClause(options);
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );
      const { page, limit } = options.pagination;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.answerComment.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.answerComment.count({ where }),
      ]);

      return this.paginate(data, total, { page, limit });
    } catch (error) {
      this.handleError(error, "findManyPaginated");
    }
  }

  async create(data: CreateAnswerCommentData): Promise<AnswerComment> {
    try {
      return await this.withTransaction(async tx => {
        const comment = await tx.answerComment.create({
          data: {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // 답변의 댓글 수 증가
        await tx.answer.update({
          where: { id: data.answerId },
          data: {
            commentCount: {
              increment: 1,
            },
          },
        });

        return comment;
      });
    } catch (error) {
      this.handleError(error, "create");
    }
  }

  async update(id: string, data: UpdateAnswerCommentData): Promise<AnswerComment> {
    try {
      return await this.prisma.answerComment.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error, "update");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.withTransaction(async tx => {
        const comment = await tx.answerComment.findUnique({
          where: { id },
          select: { answerId: true },
        });

        if (!comment) {
          throw new Error("AnswerComment not found");
        }

        await tx.answerComment.delete({
          where: { id },
        });

        // 답변의 댓글 수 감소
        await tx.answer.update({
          where: { id: comment.answerId },
          data: {
            commentCount: {
              decrement: 1,
            },
          },
        });
      });
    } catch (error) {
      this.handleError(error, "delete");
    }
  }

  async count(options: AnswerCommentSearchOptions = {}): Promise<number> {
    try {
      const where = this.buildWhereClause(options);
      return await this.prisma.answerComment.count({ where });
    } catch (error) {
      this.handleError(error, "count");
    }
  }

  // 답변 댓글 특화 메서드
  async findByAnswer(
    answerId: string,
    options: AnswerCommentSearchOptions = {}
  ): Promise<AnswerComment[]> {
    try {
      const where = {
        ...this.buildWhereClause(options),
        answerId,
      };
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );

      return await this.prisma.answerComment.findMany({
        where,
        orderBy,
        take: options.pagination?.limit,
        skip: options.pagination
          ? (options.pagination.page - 1) * options.pagination.limit
          : undefined,
      });
    } catch (error) {
      this.handleError(error, "findByAnswer");
    }
  }

  async findByAuthor(
    authorId: string,
    options: AnswerCommentSearchOptions = {}
  ): Promise<AnswerComment[]> {
    try {
      const where = {
        ...this.buildWhereClause(options),
        authorId,
      };
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );

      return await this.prisma.answerComment.findMany({
        where,
        orderBy,
        take: options.pagination?.limit,
        skip: options.pagination
          ? (options.pagination.page - 1) * options.pagination.limit
          : undefined,
      });
    } catch (error) {
      this.handleError(error, "findByAuthor");
    }
  }

  // 통계 및 상호작용 메서드
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
      this.handleError(error, "updateLikeCount");
    }
  }

  async updateDislikeCount(commentId: string): Promise<AnswerComment> {
    try {
      const dislikeCount = await this.prisma.answerCommentLike.count({
        where: { commentId, isLike: false },
      });

      return await this.prisma.answerComment.update({
        where: { id: commentId },
        data: { likeCount: dislikeCount }, // Prisma 스키마에 dislikeCount 필드가 없으므로 likeCount로 대체
      });
    } catch (error) {
      this.handleError(error, "updateDislikeCount");
    }
  }

  // 좋아요/싫어요 관리
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
      this.handleError(error, "addReaction");
    }
  }

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
        throw new Error("Reaction not found");
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
      this.handleError(error, "removeReaction");
    }
  }

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
      this.handleError(error, "updateReaction");
    }
  }

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
      this.handleError(error, "getUserReaction");
    }
  }

  protected buildWhereClause(options: AnswerCommentSearchOptions): any {
    const where: any = {};

    if (options.answerId) {
      where.answerId = options.answerId;
    }

    if (options.authorId) {
      where.authorId = options.authorId;
    }

    if (options.status) {
      where.status = options.status;
    }

    return where;
  }
}
