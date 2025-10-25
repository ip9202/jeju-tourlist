import { PrismaClient, Answer, AnswerStatus, Prisma } from "@prisma/client";
import {
  CreateAnswerData,
  UpdateAnswerData,
  AnswerSearchOptions,
  AnswerListItem,
} from "@jeju-tourlist/database/src/types/answer";
import { PaginationParams } from "../../types";

/**
 * 답변 Repository 클래스
 *
 * @description
 * - 답변 관련 데이터베이스 작업을 담당
 * - Repository 패턴을 통해 데이터 접근 로직을 캡슐화
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 *
 * @example
 * ```typescript
 * const answerRepo = new AnswerRepository(prisma);
 * const answers = await answerRepo.findByQuestionId("question123");
 * ```
 */
export class AnswerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * 답변 생성
   *
   * @param data - 답변 생성 데이터
   * @returns 생성된 답변 정보
   * @throws {Error} 데이터 검증 실패 시 에러 발생
   */
  async create(data: CreateAnswerData): Promise<Answer> {
    try {
      return await this.prisma.answer.create({
        data: {
          content: data.content,
          authorId: data.authorId,
          questionId: data.questionId,
          status: "ACTIVE",
          isAccepted: false,
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
          question: {
            select: {
              id: true,
              title: true,
              authorId: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(
        `답변 생성 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 답변 ID로 조회
   *
   * @param id - 답변 ID
   * @returns 답변 정보 또는 null
   */
  async findById(id: string): Promise<Answer | null> {
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
          question: {
            select: {
              id: true,
              title: true,
              authorId: true,
            },
          },
          likes: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  nickname: true,
                },
              },
            },
          },
        },
      });

      // Phase 1: 삭제된 데이터 자동 필터링
      // DELETED 상태인 답변은 조회 불가능하도록 처리
      if (answer && answer.status === "DELETED") {
        return null;
      }

      return answer;
    } catch (error) {
      throw new Error(
        `답변 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 질문 ID로 답변 목록 조회
   *
   * @param questionId - 질문 ID
   * @param options - 검색 옵션
   * @returns 답변 목록과 페이지네이션 정보
   */
  async findByQuestionId(
    questionId: string,
    options: AnswerSearchOptions & PaginationParams = {}
  ): Promise<{
    answers: AnswerListItem[];
    total: number;
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        status = "ACTIVE",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      // 검색 조건 구성
      const where: Prisma.AnswerWhereInput = {
        questionId,
        status: status as AnswerStatus,
      };

      // 정렬 조건 구성
      const orderBy: Prisma.AnswerOrderByWithRelationInput = {
        [sortBy]: sortOrder,
      };

      // 페이지네이션 계산
      const skip = (page - 1) * limit;

      // 병렬 실행으로 성능 최적화
      const [answers, total] = await Promise.all([
        this.prisma.answer.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                nickname: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
          },
        }),
        this.prisma.answer.count({ where }),
      ]);

      // AnswerListItem 형태로 변환
      const answerListItems: AnswerListItem[] = answers.map(answer => ({
        id: answer.id,
        content: answer.content,
        author: {
          id: answer.author.id,
          name: answer.author.name,
          nickname: answer.author.nickname,
          avatar: answer.author.avatar,
        },
        questionId: answer.questionId,
        status: answer.status as "ACTIVE" | "DELETED" | "HIDDEN",
        isAccepted: answer.isAccepted,
        likeCount: answer.likeCount,
        dislikeCount: answer.dislikeCount,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt,
        acceptedAt: answer.acceptedAt,
      }));

      const totalPages = Math.ceil(total / limit);

      return {
        answers: answerListItems,
        total,
        pagination: {
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(
        `답변 목록 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 답변 수정
   *
   * @param id - 답변 ID
   * @param data - 수정할 데이터
   * @returns 수정된 답변 정보
   * @throws {Error} 답변을 찾을 수 없거나 권한이 없을 때 에러 발생
   */
  async update(id: string, data: UpdateAnswerData): Promise<Answer> {
    try {
      return await this.prisma.answer.update({
        where: { id },
        data: {
          ...(data.content && { content: data.content }),
          ...(data.status && { status: data.status as AnswerStatus }),
          ...(data.isAccepted !== undefined && { isAccepted: data.isAccepted }),
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
          question: {
            select: {
              id: true,
              title: true,
              authorId: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error("답변을 찾을 수 없습니다.");
      }
      throw new Error(
        `답변 수정 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 답변 삭제 (소프트 삭제)
   *
   * @param id - 답변 ID
   * @returns 삭제된 답변 정보
   * @throws {Error} 답변을 찾을 수 없을 때 에러 발생
   */
  async delete(id: string): Promise<Answer> {
    try {
      return await this.prisma.answer.update({
        where: { id },
        data: {
          status: "DELETED",
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
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error("답변을 찾을 수 없습니다.");
      }
      throw new Error(
        `답변 삭제 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 답변 좋아요 수 증가
   *
   * @param id - 답변 ID
   * @returns 업데이트된 좋아요 수
   */
  async incrementLikeCount(id: string): Promise<number> {
    try {
      const result = await this.prisma.answer.update({
        where: { id },
        data: {
          likeCount: {
            increment: 1,
          },
        },
        select: {
          likeCount: true,
        },
      });
      return result.likeCount;
    } catch (error) {
      throw new Error(
        `좋아요 수 증가 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 답변 좋아요 수 감소
   *
   * @param id - 답변 ID
   * @returns 업데이트된 좋아요 수
   */
  async decrementLikeCount(id: string): Promise<number> {
    try {
      const result = await this.prisma.answer.update({
        where: { id },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
        select: {
          likeCount: true,
        },
      });
      return result.likeCount;
    } catch (error) {
      throw new Error(
        `좋아요 수 감소 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 답변 싫어요 수 증가
   *
   * @param id - 답변 ID
   * @returns 업데이트된 싫어요 수
   */
  async incrementDislikeCount(id: string): Promise<number> {
    try {
      const result = await this.prisma.answer.update({
        where: { id },
        data: {
          dislikeCount: {
            increment: 1,
          },
        },
        select: {
          dislikeCount: true,
        },
      });
      return result.dislikeCount;
    } catch (error) {
      throw new Error(
        `싫어요 수 증가 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 답변 싫어요 수 감소
   *
   * @param id - 답변 ID
   * @returns 업데이트된 싫어요 수
   */
  async decrementDislikeCount(id: string): Promise<number> {
    try {
      const result = await this.prisma.answer.update({
        where: { id },
        data: {
          dislikeCount: {
            decrement: 1,
          },
        },
        select: {
          dislikeCount: true,
        },
      });
      return result.dislikeCount;
    } catch (error) {
      throw new Error(
        `싫어요 수 감소 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 답변 채택 상태 변경
   *
   * @param id - 답변 ID
   * @param isAccepted - 채택 상태
   * @returns 업데이트된 답변 정보
   */
  async updateAcceptedStatus(id: string, isAccepted: boolean): Promise<Answer> {
    try {
      return await this.prisma.answer.update({
        where: { id },
        data: {
          isAccepted,
          acceptedAt: isAccepted ? new Date() : null,
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
          question: {
            select: {
              id: true,
              title: true,
              authorId: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error("답변을 찾을 수 없습니다.");
      }
      throw new Error(
        `채택 상태 변경 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 질문의 다른 답변들 채택 해제
   *
   * @param questionId - 질문 ID
   * @param excludeAnswerId - 제외할 답변 ID
   * @returns 업데이트된 답변 수
   */
  async unacceptOtherAnswers(
    questionId: string,
    excludeAnswerId: string
  ): Promise<number> {
    try {
      const result = await this.prisma.answer.updateMany({
        where: {
          questionId,
          id: {
            not: excludeAnswerId,
          },
          isAccepted: true,
        },
        data: {
          isAccepted: false,
          acceptedAt: null,
          updatedAt: new Date(),
        },
      });
      return result.count;
    } catch (error) {
      throw new Error(
        `다른 답변 채택 해제 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 사용자별 답변 목록 조회
   *
   * @param authorId - 작성자 ID
   * @param options - 검색 옵션
   * @returns 답변 목록과 페이지네이션 정보
   */
  async findByAuthorId(
    authorId: string,
    options: AnswerSearchOptions & PaginationParams = {}
  ): Promise<{
    answers: AnswerListItem[];
    total: number;
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        status = "ACTIVE",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      // 검색 조건 구성
      const where: Prisma.AnswerWhereInput = {
        authorId,
        status: status as AnswerStatus,
      };

      // 정렬 조건 구성
      const orderBy: Prisma.AnswerOrderByWithRelationInput = {
        [sortBy]: sortOrder,
      };

      // 페이지네이션 계산
      const skip = (page - 1) * limit;

      // 병렬 실행으로 성능 최적화
      const [answers, total] = await Promise.all([
        this.prisma.answer.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                nickname: true,
                avatar: true,
              },
            },
            question: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        }),
        this.prisma.answer.count({ where }),
      ]);

      // AnswerListItem 형태로 변환
      const answerListItems: AnswerListItem[] = answers.map(answer => ({
        id: answer.id,
        content: answer.content,
        author: {
          id: answer.author.id,
          name: answer.author.name,
          nickname: answer.author.nickname,
          avatar: answer.author.avatar,
        },
        questionId: answer.questionId,
        status: answer.status as "ACTIVE" | "DELETED" | "HIDDEN",
        isAccepted: answer.isAccepted,
        likeCount: answer.likeCount,
        dislikeCount: answer.dislikeCount,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt,
        acceptedAt: answer.acceptedAt,
      }));

      const totalPages = Math.ceil(total / limit);

      return {
        answers: answerListItems,
        total,
        pagination: {
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(
        `사용자 답변 목록 조회 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }
}
