/**
 * 관리자 서비스
 * 
 * @description
 * - 관리자 대시보드 데이터 제공
 * - 시스템 통계 및 분석
 * - 사용자 관리 기능
 * - 콘텐츠 관리 기능
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { PrismaClient } from '@prisma/client';
import { BaseService } from "./base.service";

/**
 * 대시보드 통계 데이터
 */
export interface DashboardStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalQuestions: number;
    totalAnswers: number;
    totalReports: number;
    pendingReports: number;
  };
  growth: {
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    questionsToday: number;
    answersToday: number;
  };
  engagement: {
    avgQuestionsPerUser: number;
    avgAnswersPerUser: number;
    avgAnswersPerQuestion: number;
    topContributors: Array<{
      user: {
        id: string;
        name: string;
        nickname: string;
        avatar?: string;
      };
      questionsCount: number;
      answersCount: number;
      points: number;
    }>;
  };
  recentActivity: Array<{
    type: 'question' | 'answer' | 'report' | 'user';
    id: string;
    title: string;
    author?: string;
    createdAt: Date;
  }>;
}

/**
 * 사용자 관리 데이터
 */
export interface UserManagementData {
  users: Array<{
    id: string;
    name: string;
    nickname: string;
    email: string | null;
    avatar?: string;
    isActive: boolean;
    points: number;
    level: number;
    questionsCount: number;
    answersCount: number;
    createdAt: Date;
    lastLoginAt?: Date;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 콘텐츠 관리 데이터
 */
export interface ContentManagementData {
  questions: Array<{
    id: string;
    title: string;
    content: string;
    author: {
      id: string;
      name: string;
      nickname: string;
    };
    status: string;
    viewCount: number;
    likeCount: number;
    answerCount: number;
    createdAt: Date;
  }>;
  answers: Array<{
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
      nickname: string;
    };
    question: {
      id: string;
      title: string;
    };
    status: string;
    likeCount: number;
    isAccepted: boolean;
    createdAt: Date;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 관리자 서비스
 * 
 * @description
 * - 관리자 대시보드 관련 모든 비즈니스 로직 처리
 * - 시스템 통계 및 분석 데이터 제공
 * - 사용자 및 콘텐츠 관리 기능
 */
export class AdminService extends BaseService {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * 대시보드 통계 조회
   * 
   * @description
   * - 관리자 대시보드용 종합 통계
   * - 사용자, 콘텐츠, 신고 현황
   * - 성장 지표 및 참여도 분석
   * 
   * @returns 대시보드 통계 데이터
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 기본 통계
    const [
      totalUsers,
      activeUsers,
      totalQuestions,
      totalAnswers,
      totalReports,
      pendingReports,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.question.count(),
      this.prisma.answer.count(),
      this.prisma.report.count(),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

    // 성장 지표
    const [
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      questionsToday,
      answersToday,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: monthAgo } },
      }),
      this.prisma.question.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.answer.count({
        where: { createdAt: { gte: today } },
      }),
    ]);

    // 참여도 분석
    const avgQuestionsPerUser = totalUsers > 0 ? totalQuestions / totalUsers : 0;
    const avgAnswersPerUser = totalUsers > 0 ? totalAnswers / totalUsers : 0;
    const avgAnswersPerQuestion = totalQuestions > 0 ? totalAnswers / totalQuestions : 0;

    // 상위 기여자
    const topContributors = await this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        nickname: true,
        avatar: true,
        points: true,
        _count: {
          select: {
            questions: true,
            answers: true,
          },
        },
      },
      orderBy: { points: 'desc' },
      take: 10,
    });

    // 최근 활동
    const recentActivity = await this.getRecentActivity();

    return {
      overview: {
        totalUsers,
        activeUsers,
        totalQuestions,
        totalAnswers,
        totalReports,
        pendingReports,
      },
      growth: {
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        questionsToday,
        answersToday,
      },
      engagement: {
        avgQuestionsPerUser: Math.round(avgQuestionsPerUser * 100) / 100,
        avgAnswersPerUser: Math.round(avgAnswersPerUser * 100) / 100,
        avgAnswersPerQuestion: Math.round(avgAnswersPerQuestion * 100) / 100,
        topContributors: topContributors.map(user => ({
          user: {
            id: user.id,
            name: user.name,
            nickname: user.nickname,
            avatar: user.avatar || undefined,
          },
          questionsCount: user._count.questions,
          answersCount: user._count.answers,
          points: user.points,
        })),
      },
      recentActivity,
    };
  }

  /**
   * 최근 활동 조회
   * 
   * @description
   * - 최근 질문, 답변, 신고, 사용자 활동
   * - 시간순 정렬된 통합 활동 피드
   * 
   * @returns 최근 활동 목록
   */
  private async getRecentActivity() {
    const limit = 20;

    // 최근 질문
    const recentQuestions = await this.prisma.question.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            nickname: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // 최근 답변
    const recentAnswers = await this.prisma.answer.findMany({
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            nickname: true,
          },
        },
        question: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // 최근 신고
    const recentReports = await this.prisma.report.findMany({
      select: {
        id: true,
        reason: true,
        createdAt: true,
        reporter: {
          select: {
            id: true,
            name: true,
            nickname: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // 최근 사용자
    const recentUsers = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        nickname: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // 모든 활동을 시간순으로 정렬
    const allActivities = [
      ...recentQuestions.map(q => ({
        type: 'question' as const,
        id: q.id,
        title: q.title,
        author: q.author.name,
        createdAt: q.createdAt,
      })),
      ...recentAnswers.map(a => ({
        type: 'answer' as const,
        id: a.id,
        title: a.question.title,
        author: a.author.name,
        createdAt: a.createdAt,
      })),
      ...recentReports.map(r => ({
        type: 'report' as const,
        id: r.id,
        title: r.reason,
        author: r.reporter.name,
        createdAt: r.createdAt,
      })),
      ...recentUsers.map(u => ({
        type: 'user' as const,
        id: u.id,
        title: `${u.name}님이 가입했습니다`,
        author: u.name,
        createdAt: u.createdAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return allActivities.slice(0, limit);
  }

  /**
   * 사용자 관리 데이터 조회
   * 
   * @description
   * - 관리자용 사용자 목록 조회
   * - 사용자 상세 정보 및 통계
   * - 페이지네이션 및 필터링 지원
   * 
   * @param options - 조회 옵션
   * @returns 사용자 관리 데이터
   */
  async getUserManagementData(options: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: 'createdAt' | 'points' | 'name';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<UserManagementData> {
    const {
      page = 1,
      limit = 20,
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nickname: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          nickname: true,
          email: true,
          avatar: true,
          isActive: true,
          points: true,
          level: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              questions: true,
              answers: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar || undefined,
        isActive: user.isActive,
        points: user.points,
        level: user.level,
        questionsCount: user._count.questions,
        answersCount: user._count.answers,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt || undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 콘텐츠 관리 데이터 조회
   * 
   * @description
   * - 관리자용 질문/답변 목록 조회
   * - 콘텐츠 상세 정보 및 통계
   * - 페이지네이션 및 필터링 지원
   * 
   * @param options - 조회 옵션
   * @returns 콘텐츠 관리 데이터
   */
  async getContentManagementData(options: {
    page?: number;
    limit?: number;
    type?: 'question' | 'answer';
    status?: string;
    search?: string;
  } = {}): Promise<ContentManagementData> {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      search,
    } = options;

    const questionWhere: any = {};
    const answerWhere: any = {};

    if (status) {
      questionWhere.status = status;
      answerWhere.status = status;
    }

    if (search) {
      questionWhere.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
      answerWhere.content = { contains: search };
    }

    const [questions, answers, questionTotal, answerTotal] = await Promise.all([
      type !== 'answer' ? this.prisma.question.findMany({
        where: questionWhere,
        select: {
          id: true,
          title: true,
          content: true,
          status: true,
          viewCount: true,
          likeCount: true,
          answerCount: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              nickname: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }) : [],
      
      type !== 'question' ? this.prisma.answer.findMany({
        where: answerWhere,
        select: {
          id: true,
          content: true,
          status: true,
          likeCount: true,
          isAccepted: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              nickname: true,
            },
          },
          question: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }) : [],
      
      type !== 'answer' ? this.prisma.question.count({ where: questionWhere }) : 0,
      type !== 'question' ? this.prisma.answer.count({ where: answerWhere }) : 0,
    ]);

    const total = questionTotal + answerTotal;

    return {
      questions: questions.map(q => ({
        id: q.id,
        title: q.title,
        content: q.content,
        author: q.author,
        status: q.status,
        viewCount: q.viewCount,
        likeCount: q.likeCount,
        answerCount: q.answerCount,
        createdAt: q.createdAt,
      })),
      answers: answers.map(a => ({
        id: a.id,
        content: a.content,
        author: a.author,
        question: a.question,
        status: a.status,
        likeCount: a.likeCount,
        isAccepted: a.isAccepted,
        createdAt: a.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 사용자 상태 변경
   * 
   * @description
   * - 사용자 활성화/비활성화
   * - 관리자 전용 기능
   * 
   * @param userId - 사용자 ID
   * @param isActive - 활성화 상태
   * @returns 업데이트된 사용자
   */
  async updateUserStatus(userId: string, isActive: boolean) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  }

  /**
   * 콘텐츠 상태 변경
   * 
   * @description
   * - 질문/답변 상태 변경
   * - 숨김/삭제/복구 처리
   * - 관리자 전용 기능
   * 
   * @param type - 콘텐츠 타입
   * @param id - 콘텐츠 ID
   * @param status - 새로운 상태
   * @returns 업데이트된 콘텐츠
   */
  async updateContentStatus(
    type: 'question' | 'answer',
    id: string,
    status: string
  ) {
    if (type === 'question') {
      return await this.prisma.question.update({
        where: { id },
        data: { status: status as any },
      });
    } else {
      return await this.prisma.answer.update({
        where: { id },
        data: { status: status as any },
      });
    }
  }

  /**
   * 시스템 설정 조회
   * 
   * @description
   * - 시스템 전반의 설정 정보
   * - 관리자용 설정 관리
   * 
   * @returns 시스템 설정
   */
  async getSystemSettings() {
    // 실제 구현에서는 별도 설정 테이블 사용
    return {
      maintenance: false,
      registrationEnabled: true,
      maxQuestionsPerDay: 10,
      maxAnswersPerDay: 50,
      autoModeration: true,
      reportThreshold: 3,
    };
  }

  /**
   * 시스템 설정 업데이트
   * 
   * @description
   * - 시스템 설정 변경
   * - 관리자 전용 기능
   * 
   * @param settings - 새로운 설정
   * @returns 업데이트된 설정
   */
  async updateSystemSettings(settings: Record<string, any>) {
    // 실제 구현에서는 별도 설정 테이블 사용
    console.log('시스템 설정 업데이트:', settings);
    return settings;
  }
}
