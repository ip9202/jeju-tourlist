import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ApiResponse } from "../types";

/**
 * 통계 컨트롤러 클래스
 *
 * @description
 * - 전체 시스템 통계 데이터를 제공
 * - 메인 페이지용 통계 정보 조회
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 */
export class StatsController {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * 전체 시스템 통계 조회
   * GET /api/stats
   */
  getSystemStats = async (req: Request, res: Response) => {
    try {
      // 병렬로 통계 데이터 조회
      const [
        totalQuestions,
        totalAnswers,
        totalUsers,
        activeUsers,
        questionsToday,
        answersToday,
        resolvedQuestions,
      ] = await Promise.all([
        // 총 질문 수
        this.prisma.question.count(),

        // 총 답변 수
        this.prisma.answer.count(),

        // 총 사용자 수
        this.prisma.user.count(),

        // 활성 사용자 수 (최근 7일 내 활동)
        this.prisma.user.count({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
            },
          },
        }),

        // 오늘 질문 수
        this.prisma.question.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)), // 오늘 00:00:00
            },
          },
        }),

        // 오늘 답변 수
        this.prisma.answer.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)), // 오늘 00:00:00
            },
          },
        }),

        // 해결된 질문 수
        this.prisma.question.count({
          where: {
            isResolved: true,
          },
        }),
      ]);

      // 인기 카테고리 조회 (질문 수 기준)
      const popularCategories = await this.prisma.question.groupBy({
        by: ["categoryId"],
        _count: {
          categoryId: true,
        },
        orderBy: {
          _count: {
            categoryId: "desc",
          },
        },
        take: 5,
      });

      // 카테고리 이름과 함께 조회
      const categoriesWithNames = await Promise.all(
        popularCategories.map(async category => {
          const categoryInfo = await this.prisma.category.findUnique({
            where: { id: category.categoryId },
            select: { name: true },
          });
          return {
            name: categoryInfo?.name || "알 수 없음",
            count: category._count.categoryId,
          };
        })
      );

      // 인기 해시태그 조회 (최근 30일)
      const popularHashtags = await this.prisma.question.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30일 전
          },
        },
        select: {
          tags: true,
        },
      });

      // 해시태그 카운트
      const hashtagCounts: { [key: string]: number } = {};
      popularHashtags.forEach(question => {
        if (question.tags && Array.isArray(question.tags)) {
          question.tags.forEach(tag => {
            hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
          });
        }
      });

      // 상위 5개 해시태그
      const topHashtags = Object.entries(hashtagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }));

      const stats = {
        totalQuestions,
        totalAnswers,
        totalUsers,
        activeUsers,
        questionsToday,
        answersToday,
        resolvedQuestions,
        resolutionRate:
          totalQuestions > 0
            ? Math.round((resolvedQuestions / totalQuestions) * 100)
            : 0,
        averageAnswersPerQuestion:
          totalQuestions > 0
            ? Math.round((totalAnswers / totalQuestions) * 10) / 10
            : 0,
        topCategories: categoriesWithNames,
        topHashtags,
        lastUpdated: new Date().toISOString(),
      };

      const response: ApiResponse = {
        success: true,
        data: stats,
        message: "시스템 통계를 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      console.error("시스템 통계 조회 오류:", error);

      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "시스템 통계 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  /**
   * 실시간 질문 조회
   * GET /api/stats/realtime-questions
   */
  getRealtimeQuestions = async (req: Request, res: Response) => {
    try {
      const { limit = 5 } = req.query;
      const limitNum = parseInt(limit as string) || 5;

      // 최근 질문들을 조회 (최신순)
      const questions = await this.prisma.question.findMany({
        take: limitNum,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          answerCount: true,
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      // 시간 포맷팅 함수
      const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor(
          (now.getTime() - date.getTime()) / 1000
        );

        if (diffInSeconds < 60) {
          return `${diffInSeconds}초 전`;
        } else if (diffInSeconds < 3600) {
          return `${Math.floor(diffInSeconds / 60)}분 전`;
        } else if (diffInSeconds < 86400) {
          return `${Math.floor(diffInSeconds / 3600)}시간 전`;
        } else {
          return `${Math.floor(diffInSeconds / 86400)}일 전`;
        }
      };

      // 데이터 변환
      const formattedQuestions = questions.map(question => ({
        id: question.id,
        title: question.title,
        author: question.author.name,
        authorAvatar: question.author.avatar,
        createdAt: formatTimeAgo(question.createdAt),
        category: question.category?.name || "일반",
        answerCount: question.answerCount,
      }));

      const response: ApiResponse = {
        success: true,
        data: formattedQuestions,
        message: "실시간 질문을 성공적으로 조회했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      console.error("실시간 질문 조회 오류:", error);

      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "실시간 질문 조회 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };
}
