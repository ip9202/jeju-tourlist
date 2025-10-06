import { PrismaClient, Answer } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import {
  CreateAnswerData,
  UpdateAnswerData,
  AnswerSearchOptions,
  AnswerStats,
  AnswerListItem,
  AnswerReactionData,
} from "../types/answer";

// 답변 Repository 인터페이스 (ISP)
export interface IAnswerRepository {
  findById(id: string): Promise<Answer | null>;
  findByIdWithDetails(id: string): Promise<AnswerListItem | null>;
  findMany(options?: AnswerSearchOptions): Promise<Answer[]>;
  findManyPaginated(
    options: AnswerSearchOptions & {
      pagination: { page: number; limit: number };
    }
  ): Promise<{ data: Answer[]; pagination: any }>;
  create(data: CreateAnswerData): Promise<Answer>;
  update(id: string, data: UpdateAnswerData): Promise<Answer>;
  delete(id: string): Promise<void>;
  count(options?: AnswerSearchOptions): Promise<number>;

  // 답변 특화 메서드
  findByQuestion(
    questionId: string,
    options?: AnswerSearchOptions
  ): Promise<Answer[]>;
  findByAuthor(
    authorId: string,
    options?: AnswerSearchOptions
  ): Promise<Answer[]>;
  findAcceptedAnswers(questionId: string): Promise<Answer[]>;
  findAcceptedAnswer(questionId: string): Promise<Answer | null>;

  // 통계 및 상호작용
  getAnswerStats(answerId: string): Promise<AnswerStats>;
  updateLikeCount(answerId: string): Promise<Answer>;
  updateDislikeCount(answerId: string): Promise<Answer>;
  acceptAnswer(answerId: string): Promise<Answer>;
  unacceptAnswer(answerId: string): Promise<Answer>;

  // 좋아요/싫어요 관리
  addReaction(data: AnswerReactionData): Promise<void>;
  removeReaction(userId: string, answerId: string): Promise<void>;
  updateReaction(data: AnswerReactionData): Promise<void>;
  getUserReaction(
    userId: string,
    answerId: string
  ): Promise<{ isLike: boolean } | null>;
}

// 답변 Repository 구현 (SRP)
export class AnswerRepository
  extends BaseRepository<
    Answer,
    CreateAnswerData,
    UpdateAnswerData,
    AnswerSearchOptions
  >
  implements IAnswerRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma, "Answer");
  }

  async findById(id: string): Promise<Answer | null> {
    try {
      return await this.prisma.answer.findUnique({
        where: { id },
      });
    } catch (error) {
      this.handleError(error, "findById");
    }
  }

  async findByIdWithDetails(id: string): Promise<AnswerListItem | null> {
    try {
      const answer = await this.prisma.answer.findUnique({
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

      if (!answer) return null;

      return {
        id: answer.id,
        content: answer.content,
        author: {
          ...answer.author,
          avatar: answer.author.avatar || undefined,
        },
        questionId: answer.questionId,
        status: answer.status,
        isAccepted: answer.isAccepted,
        likeCount: answer.likeCount,
        dislikeCount: answer.dislikeCount,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt,
        acceptedAt: answer.acceptedAt || undefined,
      };
    } catch (error) {
      this.handleError(error, "findByIdWithDetails");
    }
  }

  async findMany(options: AnswerSearchOptions = {}): Promise<Answer[]> {
    try {
      const where = this.buildWhereClause(options);
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );

      return await this.prisma.answer.findMany({
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
    options: AnswerSearchOptions & {
      pagination: { page: number; limit: number };
    }
  ): Promise<{ data: Answer[]; pagination: any }> {
    try {
      const where = this.buildWhereClause(options);
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );
      const { page, limit } = options.pagination;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.answer.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.answer.count({ where }),
      ]);

      return this.paginate(data, total, { page, limit });
    } catch (error) {
      this.handleError(error, "findManyPaginated");
    }
  }

  async create(data: CreateAnswerData): Promise<Answer> {
    try {
      return await this.withTransaction(async tx => {
        const answer = await tx.answer.create({
          data: {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // 질문의 답변 수 증가
        await tx.question.update({
          where: { id: data.questionId },
          data: {
            answerCount: {
              increment: 1,
            },
          },
        });

        return answer;
      });
    } catch (error) {
      this.handleError(error, "create");
    }
  }

  async update(id: string, data: UpdateAnswerData): Promise<Answer> {
    try {
      return await this.prisma.answer.update({
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
        const answer = await tx.answer.findUnique({
          where: { id },
          select: { questionId: true },
        });

        if (!answer) {
          throw new Error("Answer not found");
        }

        await tx.answer.delete({
          where: { id },
        });

        // 질문의 답변 수 감소
        await tx.question.update({
          where: { id: answer.questionId },
          data: {
            answerCount: {
              decrement: 1,
            },
          },
        });
      });
    } catch (error) {
      this.handleError(error, "delete");
    }
  }

  async count(options: AnswerSearchOptions = {}): Promise<number> {
    try {
      const where = this.buildWhereClause(options);
      return await this.prisma.answer.count({ where });
    } catch (error) {
      this.handleError(error, "count");
    }
  }

  // 답변 특화 메서드
  async findByQuestion(
    questionId: string,
    options: AnswerSearchOptions = {}
  ): Promise<Answer[]> {
    try {
      const where = {
        ...this.buildWhereClause(options),
        questionId,
      };
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );

      return await this.prisma.answer.findMany({
        where,
        orderBy,
        take: options.pagination?.limit,
        skip: options.pagination
          ? (options.pagination.page - 1) * options.pagination.limit
          : undefined,
      });
    } catch (error) {
      this.handleError(error, "findByQuestion");
    }
  }

  async findByAuthor(
    authorId: string,
    options: AnswerSearchOptions = {}
  ): Promise<Answer[]> {
    try {
      const where = {
        ...this.buildWhereClause(options),
        authorId,
      };
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );

      return await this.prisma.answer.findMany({
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

  async findAcceptedAnswers(questionId: string): Promise<Answer[]> {
    try {
      return await this.prisma.answer.findMany({
        where: {
          questionId,
          isAccepted: true,
        },
        orderBy: {
          acceptedAt: "desc",
        },
      });
    } catch (error) {
      this.handleError(error, "findAcceptedAnswers");
    }
  }

  async findAcceptedAnswer(questionId: string): Promise<Answer | null> {
    try {
      return await this.prisma.answer.findFirst({
        where: {
          questionId,
          isAccepted: true,
        },
        orderBy: {
          acceptedAt: "desc",
        },
      });
    } catch (error) {
      this.handleError(error, "findAcceptedAnswer");
    }
  }

  // 통계 및 상호작용 메서드
  async getAnswerStats(answerId: string): Promise<AnswerStats> {
    try {
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
        throw new Error("Answer not found");
      }

      return {
        totalLikes: answer.likeCount,
        totalDislikes: answer.dislikeCount,
        isAccepted: answer.isAccepted,
        acceptanceTime:
          answer.acceptedAt && answer.isAccepted
            ? Math.floor(
                (answer.acceptedAt.getTime() - answer.createdAt.getTime()) /
                  (1000 * 60)
              )
            : undefined,
      };
    } catch (error) {
      this.handleError(error, "getAnswerStats");
    }
  }

  async updateLikeCount(answerId: string): Promise<Answer> {
    try {
      const likeCount = await this.prisma.answerLike.count({
        where: { answerId, isLike: true },
      });

      return await this.prisma.answer.update({
        where: { id: answerId },
        data: { likeCount },
      });
    } catch (error) {
      this.handleError(error, "updateLikeCount");
    }
  }

  async updateDislikeCount(answerId: string): Promise<Answer> {
    try {
      const dislikeCount = await this.prisma.answerLike.count({
        where: { answerId, isLike: false },
      });

      return await this.prisma.answer.update({
        where: { id: answerId },
        data: { dislikeCount },
      });
    } catch (error) {
      this.handleError(error, "updateDislikeCount");
    }
  }

  async acceptAnswer(answerId: string): Promise<Answer> {
    try {
      return await this.withTransaction(async tx => {
        // 기존에 채택된 답변이 있다면 해제
        const answer = await tx.answer.findUnique({
          where: { id: answerId },
          select: { questionId: true },
        });

        if (!answer) {
          throw new Error("Answer not found");
        }

        await tx.answer.updateMany({
          where: {
            questionId: answer.questionId,
            isAccepted: true,
          },
          data: {
            isAccepted: false,
            acceptedAt: null,
          },
        });

        // 새 답변 채택
        const acceptedAnswer = await tx.answer.update({
          where: { id: answerId },
          data: {
            isAccepted: true,
            acceptedAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // 질문을 해결됨으로 표시
        await tx.question.update({
          where: { id: answer.questionId },
          data: {
            isResolved: true,
            resolvedAt: new Date(),
            updatedAt: new Date(),
          },
        });

        return acceptedAnswer;
      });
    } catch (error) {
      this.handleError(error, "acceptAnswer");
    }
  }

  async unacceptAnswer(answerId: string): Promise<Answer> {
    try {
      return await this.withTransaction(async tx => {
        const answer = await tx.answer.findUnique({
          where: { id: answerId },
          select: { questionId: true },
        });

        if (!answer) {
          throw new Error("Answer not found");
        }

        const updatedAnswer = await tx.answer.update({
          where: { id: answerId },
          data: {
            isAccepted: false,
            acceptedAt: null,
            updatedAt: new Date(),
          },
        });

        // 질문을 미해결로 표시
        await tx.question.update({
          where: { id: answer.questionId },
          data: {
            isResolved: false,
            resolvedAt: null,
            updatedAt: new Date(),
          },
        });

        return updatedAnswer;
      });
    } catch (error) {
      this.handleError(error, "unacceptAnswer");
    }
  }

  // 좋아요/싫어요 관리
  async addReaction(data: AnswerReactionData): Promise<void> {
    try {
      await this.prisma.answerLike.create({
        data: {
          ...data,
          createdAt: new Date(),
        },
      });

      // 답변의 좋아요/싫어요 수 업데이트
      if (data.isLike) {
        await this.updateLikeCount(data.answerId);
      } else {
        await this.updateDislikeCount(data.answerId);
      }
    } catch (error) {
      this.handleError(error, "addReaction");
    }
  }

  async removeReaction(userId: string, answerId: string): Promise<void> {
    try {
      const reaction = await this.prisma.answerLike.findUnique({
        where: {
          userId_answerId: {
            userId,
            answerId,
          },
        },
      });

      if (!reaction) {
        throw new Error("Reaction not found");
      }

      await this.prisma.answerLike.delete({
        where: {
          userId_answerId: {
            userId,
            answerId,
          },
        },
      });

      // 답변의 좋아요/싫어요 수 업데이트
      if (reaction.isLike) {
        await this.updateLikeCount(answerId);
      } else {
        await this.updateDislikeCount(answerId);
      }
    } catch (error) {
      this.handleError(error, "removeReaction");
    }
  }

  async updateReaction(data: AnswerReactionData): Promise<void> {
    try {
      await this.prisma.answerLike.upsert({
        where: {
          userId_answerId: {
            userId: data.userId,
            answerId: data.answerId,
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

      // 답변의 좋아요/싫어요 수 업데이트
      await this.updateLikeCount(data.answerId);
      await this.updateDislikeCount(data.answerId);
    } catch (error) {
      this.handleError(error, "updateReaction");
    }
  }

  async getUserReaction(
    userId: string,
    answerId: string
  ): Promise<{ isLike: boolean } | null> {
    try {
      const reaction = await this.prisma.answerLike.findUnique({
        where: {
          userId_answerId: {
            userId,
            answerId,
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

  protected buildWhereClause(options: AnswerSearchOptions): any {
    const where: any = {};

    if (options.questionId) {
      where.questionId = options.questionId;
    }

    if (options.authorId) {
      where.authorId = options.authorId;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.isAccepted !== undefined) {
      where.isAccepted = options.isAccepted;
    }

    return where;
  }
}
