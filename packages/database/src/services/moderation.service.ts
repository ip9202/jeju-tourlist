/**
 * 콘텐츠 관리 서비스
 * 
 * @description
 * - 신고 및 조정 시스템 관리
 * - 자동 필터링 시스템 (욕설, 스팸)
 * - 관리자 검토 워크플로우
 * - 사용자 제재 시스템
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { PrismaClient, ReportStatus, ReportTargetType, User } from '../../node_modules/.prisma/client';
import { BaseService } from './base.service';
import { CreateReportData } from '../types/moderation';

/**
 * 신고 처리 데이터
 */
export interface ProcessReportData {
  reportId: string;
  adminId: string;
  status: ReportStatus;
  adminNote?: string;
}

/**
 * 콘텐츠 필터링 결과
 */
export interface ContentFilterResult {
  isBlocked: boolean;
  reason?: string;
  confidence: number;
  suggestions?: string[];
}

/**
 * 사용자 제재 데이터
 */
export interface UserSanctionData {
  userId: string;
  type: 'WARNING' | 'SUSPENSION' | 'BAN';
  reason: string;
  duration?: number; // 일 단위
  adminId: string;
}

/**
 * 콘텐츠 관리 서비스
 * 
 * @description
 * - 신고 및 조정 관련 모든 비즈니스 로직 처리
 * - 자동 필터링 및 수동 검토 시스템
 * - 사용자 제재 및 복구 관리
 */
export class ModerationService extends BaseService {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * 신고 생성
   * 
   * @description
   * - 새로운 신고 생성
   * - 중복 신고 방지
   * - 자동 필터링 적용
   * 
   * @param data - 신고 생성 데이터
   * @returns 생성된 신고
   */
  async createReport(data: CreateReportData) {
    return await this.prisma.$transaction(async (tx) => {
      // 중복 신고 검증
      const existingReport = await tx.report.findFirst({
        where: {
          reporterId: data.reporterId,
          targetType: data.targetType,
          targetId: data.targetId,
          status: { in: ['PENDING', 'APPROVED'] },
        },
      });

      if (existingReport) {
        throw new Error('이미 신고한 콘텐츠입니다.');
      }

      // 신고 생성
      const report = await tx.report.create({
        data: {
          reporterId: data.reporterId,
          targetType: data.targetType,
          targetId: data.targetId,
          reason: data.reason,
          description: data.description,
        },
      });

      // 자동 필터링 적용
      await this.applyAutoFiltering(report.id, data.targetType, data.targetId);

      return report;
    });
  }

  /**
   * 신고 목록 조회
   * 
   * @description
   * - 관리자용 신고 목록 조회
   * - 상태별 필터링 지원
   * - 페이지네이션 지원
   * 
   * @param options - 조회 옵션
   * @returns 신고 목록
   */
  async getReports(options: {
    status?: ReportStatus;
    targetType?: ReportTargetType;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const {
      status,
      targetType,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (targetType) {
      where.targetType = targetType;
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          reporter: {
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
              content: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  nickname: true,
                },
              },
            },
          },
          answer: {
            select: {
              id: true,
              content: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  nickname: true,
                },
              },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 신고 처리
   * 
   * @description
   * - 관리자가 신고를 검토하고 처리
   * - 승인/거부 결정
   * - 관련 콘텐츠 상태 변경
   * 
   * @param data - 신고 처리 데이터
   * @returns 처리된 신고
   */
  async processReport(data: ProcessReportData) {
    return await this.prisma.$transaction(async (tx) => {
      // 신고 조회
      const report = await tx.report.findUnique({
        where: { id: data.reportId },
        include: {
          question: true,
          answer: true,
        },
      });

      if (!report) {
        throw new Error('신고를 찾을 수 없습니다.');
      }

      if (report.status !== 'PENDING') {
        throw new Error('이미 처리된 신고입니다.');
      }

      // 신고 상태 업데이트
      const updatedReport = await tx.report.update({
        where: { id: data.reportId },
        data: {
          status: data.status,
          adminId: data.adminId,
          adminNote: data.adminNote,
          resolvedAt: new Date(),
        },
      });

      // 신고 승인 시 관련 콘텐츠 처리
      if (data.status === 'APPROVED') {
        await this.handleApprovedReport(tx, report);
      }

      return updatedReport;
    });
  }

  /**
   * 승인된 신고 처리
   * 
   * @description
   * - 신고가 승인된 경우 관련 콘텐츠 처리
   * - 콘텐츠 숨김/삭제 처리
   * - 사용자 제재 적용
   * 
   * @param tx - Prisma 트랜잭션
   * @param report - 신고 정보
   */
  private async handleApprovedReport(tx: any, report: any) {
    switch (report.targetType) {
      case 'QUESTION':
        if (report.question) {
          await tx.question.update({
            where: { id: report.targetId },
            data: { status: 'HIDDEN' },
          });
        }
        break;
        
      case 'ANSWER':
        if (report.answer) {
          await tx.answer.update({
            where: { id: report.targetId },
            data: { status: 'HIDDEN' },
          });
        }
        break;
        
      case 'USER':
        // 사용자 제재 로직 (구현 필요)
        console.log(`사용자 제재 필요: ${report.targetId}`);
        break;
    }
  }

  /**
   * 자동 필터링 적용
   * 
   * @description
   * - 신고된 콘텐츠의 자동 필터링
   * - 욕설, 스팸, 부적절한 콘텐츠 감지
   * - 자동 처리 또는 관리자 검토 대기
   * 
   * @param reportId - 신고 ID
   * @param targetType - 신고 대상 타입
   * @param targetId - 신고 대상 ID
   */
  private async applyAutoFiltering(
    reportId: string,
    targetType: ReportTargetType,
    targetId: string
  ) {
    try {
      // 콘텐츠 조회
      let content = '';
      if (targetType === 'QUESTION') {
        const question = await this.prisma.question.findUnique({
          where: { id: targetId },
          select: { title: true, content: true },
        });
        content = question ? `${question.title} ${question.content}` : '';
      } else if (targetType === 'ANSWER') {
        const answer = await this.prisma.answer.findUnique({
          where: { id: targetId },
          select: { content: true },
        });
        content = answer ? answer.content : '';
      }

      // 자동 필터링 검사
      const filterResult = await this.checkContentFilter(content);

      if (filterResult.isBlocked) {
        // 자동으로 신고 승인 처리
        await this.prisma.report.update({
          where: { id: reportId },
          data: {
            status: 'APPROVED',
            adminNote: `자동 필터링: ${filterResult.reason}`,
            resolvedAt: new Date(),
          },
        });

        // 관련 콘텐츠 처리
        if (targetType === 'QUESTION') {
          await this.prisma.question.update({
            where: { id: targetId },
            data: { status: 'HIDDEN' },
          });
        } else if (targetType === 'ANSWER') {
          await this.prisma.answer.update({
            where: { id: targetId },
            data: { status: 'HIDDEN' },
          });
        }
      }
    } catch (error) {
      console.error('자동 필터링 적용 오류:', error);
    }
  }

  /**
   * 콘텐츠 필터링 검사
   * 
   * @description
   * - 텍스트 콘텐츠의 부적절성 검사
   * - 욕설, 스팸, 개인정보 등 감지
   * - 신뢰도 점수 반환
   * 
   * @param content - 검사할 콘텐츠
   * @returns 필터링 결과
   */
  private async checkContentFilter(content: string): Promise<ContentFilterResult> {
    // 간단한 키워드 기반 필터링 (실제 구현에서는 AI/ML 모델 사용)
    const blockedKeywords = [
      '욕설', '비방', '스팸', '광고', '사기', '피싱',
      '개인정보', '전화번호', '이메일', '주민등록번호',
    ];

    const spamPatterns = [
      /https?:\/\/[^\s]+/g, // URL 패턴
      /[0-9]{3}-[0-9]{4}-[0-9]{4}/g, // 전화번호 패턴
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // 이메일 패턴
    ];

    let isBlocked = false;
    let reason = '';
    let confidence = 0;

    // 키워드 검사
    for (const keyword of blockedKeywords) {
      if (content.includes(keyword)) {
        isBlocked = true;
        reason = `금지 키워드: ${keyword}`;
        confidence = 0.8;
        break;
      }
    }

    // 스팸 패턴 검사
    if (!isBlocked) {
      for (const pattern of spamPatterns) {
        if (pattern.test(content)) {
          isBlocked = true;
          reason = '스팸 패턴 감지';
          confidence = 0.6;
          break;
        }
      }
    }

    // 반복 문자 검사
    if (!isBlocked) {
      const repeatedChars = /(.)\1{4,}/g;
      if (repeatedChars.test(content)) {
        isBlocked = true;
        reason = '반복 문자 감지';
        confidence = 0.5;
      }
    }

    return {
      isBlocked,
      reason,
      confidence,
      suggestions: isBlocked ? ['콘텐츠를 수정해주세요.'] : undefined,
    };
  }

  /**
   * 사용자 제재 적용
   * 
   * @description
   * - 사용자에게 경고/정지/차단 적용
   * - 제재 이력 기록
   * - 자동 해제 스케줄링
   * 
   * @param data - 사용자 제재 데이터
   * @returns 제재 결과
   */
  async applyUserSanction(data: UserSanctionData) {
    return await this.prisma.$transaction(async (tx) => {
      // 사용자 제재 이력 생성 (별도 테이블 필요)
      // 현재는 사용자 테이블에 제재 정보 저장
      const sanctionData: any = {
        isActive: data.type !== 'BAN',
        lastSanctionAt: new Date(),
        lastSanctionType: data.type,
        lastSanctionReason: data.reason,
      };

      // 정지 기간 설정
      if (data.duration && data.type === 'SUSPENSION') {
        const suspensionEnd = new Date();
        suspensionEnd.setDate(suspensionEnd.getDate() + data.duration);
        sanctionData.suspensionEndAt = suspensionEnd;
      }

      // 사용자 상태 업데이트
      const updatedUser = await tx.user.update({
        where: { id: data.userId },
        data: sanctionData,
      });

      // 제재 알림 생성
      await tx.notification.create({
        data: {
          userId: data.userId,
          type: 'SYSTEM_ANNOUNCEMENT',
          title: '계정 제재 안내',
          message: `귀하의 계정이 ${data.type} 처리되었습니다. 사유: ${data.reason}`,
          data: {
            sanctionType: data.type,
            reason: data.reason,
            duration: data.duration,
          },
        },
      });

      return updatedUser;
    });
  }

  /**
   * 신고 통계 조회
   * 
   * @description
   * - 신고 관련 통계 정보
   * - 기간별 신고 현황
   * - 처리 상태별 분포
   * 
   * @param period - 조회 기간 (일)
   * @returns 신고 통계
   */
  async getReportStats(period: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const [
      totalReports,
      pendingReports,
      approvedReports,
      rejectedReports,
      typeStats,
      dailyStats,
    ] = await Promise.all([
      // 전체 신고 수
      this.prisma.report.count({
        where: { createdAt: { gte: startDate } },
      }),
      
      // 대기 중인 신고 수
      this.prisma.report.count({
        where: {
          createdAt: { gte: startDate },
          status: 'PENDING',
        },
      }),
      
      // 승인된 신고 수
      this.prisma.report.count({
        where: {
          createdAt: { gte: startDate },
          status: 'APPROVED',
        },
      }),
      
      // 거부된 신고 수
      this.prisma.report.count({
        where: {
          createdAt: { gte: startDate },
          status: 'REJECTED',
        },
      }),
      
      // 타입별 통계
      this.prisma.report.groupBy({
        by: ['targetType'],
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
      }),
      
      // 일별 통계
      this.prisma.report.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return {
      period: {
        days: period,
        startDate,
        endDate: new Date(),
      },
      summary: {
        total: totalReports,
        pending: pendingReports,
        approved: approvedReports,
        rejected: rejectedReports,
        approvalRate: totalReports > 0 ? (approvedReports / totalReports) * 100 : 0,
      },
      typeStats: typeStats.map(stat => ({
        type: stat.targetType,
        count: stat._count.id,
      })),
      dailyStats: dailyStats.map(stat => ({
        date: stat.createdAt,
        count: stat._count.id,
      })),
    };
  }

  /**
   * 신고 해제
   * 
   * @description
   * - 잘못된 신고 처리 취소
   * - 숨겨진 콘텐츠 복구
   * - 관리자 전용 기능
   * 
   * @param reportId - 신고 ID
   * @param adminId - 관리자 ID
   * @returns 해제 결과
   */
  async reverseReport(reportId: string, adminId: string) {
    return await this.prisma.$transaction(async (tx) => {
      // 신고 조회
      const report = await tx.report.findUnique({
        where: { id: reportId },
        include: {
          question: true,
          answer: true,
        },
      });

      if (!report) {
        throw new Error('신고를 찾을 수 없습니다.');
      }

      if (report.status !== 'APPROVED') {
        throw new Error('승인된 신고만 해제할 수 있습니다.');
      }

      // 신고 상태를 거부로 변경
      const updatedReport = await tx.report.update({
        where: { id: reportId },
        data: {
          status: 'REJECTED',
          adminId,
          adminNote: '신고 해제 처리',
          resolvedAt: new Date(),
        },
      });

      // 숨겨진 콘텐츠 복구
      if (report.targetType === 'QUESTION' && report.question) {
        await tx.question.update({
          where: { id: report.targetId },
          data: { status: 'ACTIVE' },
        });
      } else if (report.targetType === 'ANSWER' && report.answer) {
        await tx.answer.update({
          where: { id: report.targetId },
          data: { status: 'ACTIVE' },
        });
      }

      return updatedReport;
    });
  }
}
