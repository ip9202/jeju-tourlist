/**
 * 관리자 컨트롤러
 * 
 * @description
 * - 관리자 대시보드 API 엔드포인트 처리
 * - 콘텐츠 관리 및 사용자 관리 기능
 * - 시스템 설정 및 통계 관리
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { AdminService } from '@jeju-tourlist/database';
import { ModerationService } from '@jeju-tourlist/database';
import { BadgeService } from '@jeju-tourlist/database';
import { prisma } from '@jeju-tourlist/database';
import { createResponse } from '../utils/response';

/**
 * 관리자 컨트롤러 클래스
 * 
 * @description
 * - 관리자 관련 모든 HTTP 요청 처리
 * - 권한 검증 및 응답 생성
 * - 에러 핸들링 및 로깅
 */
export class AdminController {
  private adminService: AdminService;
  private moderationService: ModerationService;
  private badgeService: BadgeService;

  constructor() {
    this.adminService = new AdminService(prisma);
    this.moderationService = new ModerationService(prisma);
    this.badgeService = new BadgeService(prisma);
  }

  /**
   * 관리자 권한 검증 미들웨어
   * 
   * @description
   * - 관리자 권한 확인
   * - 인증된 사용자만 접근 가능
   * 
   * @param req - Express 요청 객체
   * @param res - Express 응답 객체
   * @param next - 다음 미들웨어 함수
   */
  private checkAdminAuth = (req: Request, res: Response, next: () => void) => {
    // TODO: 실제 관리자 권한 검증 로직 구현
    // if (!req.user?.isAdmin) {
    //   return res.status(403).json(
    //     createResponse(false, '관리자 권한이 필요합니다.', null)
    //   );
    // }
    next();
  };

  /**
   * 대시보드 통계 조회
   * 
   * @description
   * - 관리자 대시보드용 종합 통계
   * - 사용자, 콘텐츠, 신고 현황
   * 
   * @route GET /api/admin/dashboard
   * @access Private (Admin only)
   */
  getDashboardStats = async (req: Request, res: Response) => {
    try {
      this.checkAdminAuth(req, res, async () => {
        const stats = await this.adminService.getDashboardStats();
        
        res.json(createResponse(true, '대시보드 통계를 조회했습니다.', stats));
      });
    } catch (error) {
      console.error('대시보드 통계 조회 오류:', error);
      res.status(500).json(
        createResponse(false, '대시보드 통계 조회 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 사용자 관리 데이터 조회
   * 
   * @description
   * - 관리자용 사용자 목록 조회
   * - 페이지네이션 및 필터링 지원
   * 
   * @route GET /api/admin/users
   * @access Private (Admin only)
   */
  getUsers = async (req: Request, res: Response) => {
    try {
      this.checkAdminAuth(req, res, async () => {
        const {
          page = 1,
          limit = 20,
          search,
          isActive,
          sortBy = 'createdAt',
          sortOrder = 'desc',
        } = req.query;

        const options = {
          page: parseInt(page as string) || 1,
          limit: parseInt(limit as string) || 20,
          search: search as string,
          isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
          sortBy: sortBy as any,
          sortOrder: sortOrder as any,
        };

        const result = await this.adminService.getUserManagementData(options);
        
        res.json(createResponse(true, '사용자 목록을 조회했습니다.', result));
      });
    } catch (error) {
      console.error('사용자 목록 조회 오류:', error);
      res.status(500).json(
        createResponse(false, '사용자 목록 조회 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 콘텐츠 관리 데이터 조회
   * 
   * @description
   * - 관리자용 질문/답변 목록 조회
   * - 페이지네이션 및 필터링 지원
   * 
   * @route GET /api/admin/content
   * @access Private (Admin only)
   */
  getContent = async (req: Request, res: Response) => {
    try {
      this.checkAdminAuth(req, res, async () => {
        const {
          page = 1,
          limit = 20,
          type,
          status,
          search,
        } = req.query;

        const options = {
          page: parseInt(page as string) || 1,
          limit: parseInt(limit as string) || 20,
          type: type as 'question' | 'answer',
          status: status as string,
          search: search as string,
        };

        const result = await this.adminService.getContentManagementData(options);
        
        res.json(createResponse(true, '콘텐츠 목록을 조회했습니다.', result));
      });
    } catch (error) {
      console.error('콘텐츠 목록 조회 오류:', error);
      res.status(500).json(
        createResponse(false, '콘텐츠 목록 조회 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 신고 목록 조회
   * 
   * @description
   * - 관리자용 신고 목록 조회
   * - 상태별 필터링 지원
   * 
   * @route GET /api/admin/reports
   * @access Private (Admin only)
   */
  getReports = async (req: Request, res: Response) => {
    try {
      this.checkAdminAuth(req, res, async () => {
        const {
          status,
          targetType,
          page = 1,
          limit = 20,
          sortBy = 'createdAt',
          sortOrder = 'desc',
        } = req.query;

        const options = {
          status: status as any,
          targetType: targetType as any,
          page: parseInt(page as string) || 1,
          limit: parseInt(limit as string) || 20,
          sortBy: sortBy as any,
          sortOrder: sortOrder as any,
        };

        const result = await this.moderationService.getReports(options);
        
        res.json(createResponse(true, '신고 목록을 조회했습니다.', result));
      });
    } catch (error) {
      console.error('신고 목록 조회 오류:', error);
      res.status(500).json(
        createResponse(false, '신고 목록 조회 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 신고 처리
   * 
   * @description
   * - 관리자가 신고를 검토하고 처리
   * - 승인/거부 결정
   * 
   * @route POST /api/admin/reports/:id/process
   * @access Private (Admin only)
   */
  processReport = async (req: Request, res: Response) => {
    try {
      this.checkAdminAuth(req, res, async () => {
        const { id } = req.params;
        const { status, adminNote } = req.body;
        const adminId = req.user?.id;

        if (!adminId) {
          return res.status(401).json(
            createResponse(false, '인증이 필요합니다.', null)
          );
        }

        if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
          return res.status(400).json(
            createResponse(false, '유효하지 않은 상태입니다.', null)
          );
        }

        const result = await this.moderationService.processReport({
          reportId: id,
          adminId,
          status: status as any,
          adminNote,
        });
        
        res.json(createResponse(true, '신고를 처리했습니다.', { report: result }));
      });
    } catch (error) {
      console.error('신고 처리 오류:', error);
      
      if (error instanceof Error && error.message.includes('이미 처리된')) {
        return res.status(409).json(
          createResponse(false, error.message, null)
        );
      }

      res.status(500).json(
        createResponse(false, '신고 처리 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 사용자 상태 변경
   * 
   * @description
   * - 사용자 활성화/비활성화
   * - 관리자 전용 기능
   * 
   * @route PUT /api/admin/users/:id/status
   * @access Private (Admin only)
   */
  updateUserStatus = async (req: Request, res: Response) => {
    try {
      this.checkAdminAuth(req, res, async () => {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
          return res.status(400).json(
            createResponse(false, '유효하지 않은 상태입니다.', null)
          );
        }

        const user = await this.adminService.updateUserStatus(id, isActive);
        
        res.json(createResponse(true, '사용자 상태를 변경했습니다.', { user }));
      });
    } catch (error) {
      console.error('사용자 상태 변경 오류:', error);
      res.status(500).json(
        createResponse(false, '사용자 상태 변경 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 콘텐츠 상태 변경
   * 
   * @description
   * - 질문/답변 상태 변경
   * - 숨김/삭제/복구 처리
   * 
   * @route PUT /api/admin/content/:type/:id/status
   * @access Private (Admin only)
   */
  updateContentStatus = async (req: Request, res: Response) => {
    try {
      this.checkAdminAuth(req, res, async () => {
        const { type, id } = req.params;
        const { status } = req.body;

        if (!['question', 'answer'].includes(type)) {
          return res.status(400).json(
            createResponse(false, '유효하지 않은 콘텐츠 타입입니다.', null)
          );
        }

        if (!status) {
          return res.status(400).json(
            createResponse(false, '상태가 필요합니다.', null)
          );
        }

        const content = await this.adminService.updateContentStatus(
          type as 'question' | 'answer',
          id,
          status
        );
        
        res.json(createResponse(true, '콘텐츠 상태를 변경했습니다.', { content }));
      });
    } catch (error) {
      console.error('콘텐츠 상태 변경 오류:', error);
      res.status(500).json(
        createResponse(false, '콘텐츠 상태 변경 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 신고 통계 조회
   * 
   * @description
   * - 신고 관련 통계 정보
   * - 기간별 신고 현황
   * 
   * @route GET /api/admin/reports/stats
   * @access Private (Admin only)
   */
  getReportStats = async (req: Request, res: Response) => {
    try {
      this.checkAdminAuth(req, res, async () => {
        const { period = 30 } = req.query;
        const days = parseInt(period as string) || 30;

        const stats = await this.moderationService.getReportStats(days);
        
        res.json(createResponse(true, '신고 통계를 조회했습니다.', stats));
      });
    } catch (error) {
      console.error('신고 통계 조회 오류:', error);
      res.status(500).json(
        createResponse(false, '신고 통계 조회 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 시스템 설정 조회
   * 
   * @description
   * - 시스템 전반의 설정 정보
   * 
   * @route GET /api/admin/settings
   * @access Private (Admin only)
   */
  getSystemSettings = async (req: Request, res: Response) => {
    try {
      this.checkAdminAuth(req, res, async () => {
        const settings = await this.adminService.getSystemSettings();
        
        res.json(createResponse(true, '시스템 설정을 조회했습니다.', settings));
      });
    } catch (error) {
      console.error('시스템 설정 조회 오류:', error);
      res.status(500).json(
        createResponse(false, '시스템 설정 조회 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 시스템 설정 업데이트
   * 
   * @description
   * - 시스템 설정 변경
   * 
   * @route PUT /api/admin/settings
   * @access Private (Admin only)
   */
  updateSystemSettings = async (req: Request, res: Response) => {
    try {
      this.checkAdminAuth(req, res, async () => {
        const settings = req.body;

        const updatedSettings = await this.adminService.updateSystemSettings(settings);
        
        res.json(createResponse(true, '시스템 설정을 업데이트했습니다.', updatedSettings));
      });
    } catch (error) {
      console.error('시스템 설정 업데이트 오류:', error);
      res.status(500).json(
        createResponse(false, '시스템 설정 업데이트 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 배지 계산 수동 실행
   * 
   * @description
   * - 관리자가 수동으로 배지 계산 실행
   * - 모든 사용자에 대해 배지 조건 검사
   * 
   * @route POST /api/admin/badges/calculate
   * @access Private (Admin only)
   */
  calculateBadges = async (req: Request, res: Response) => {
    try {
      this.checkAdminAuth(req, res, async () => {
        const { userId } = req.body;

        let result;
        if (userId) {
          // 특정 사용자만 계산
          result = await this.badgeService.checkAndAwardBadges(userId);
        } else {
          // 모든 사용자 계산
          result = await this.badgeService.calculateAllUserBadges();
        }

        res.json(createResponse(true, '배지 계산을 완료했습니다.', result));
      });
    } catch (error) {
      console.error('배지 계산 오류:', error);
      res.status(500).json(
        createResponse(false, '배지 계산 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 배지 통계 조회
   * 
   * @description
   * - 배지 시스템 전체 통계
   * - 배지별 획득 현황, 사용자별 배지 분포
   * 
   * @route GET /api/admin/badges/stats
   * @access Private (Admin only)
   */
  getBadgeStats = async (req: Request, res: Response) => {
    try {
      this.checkAdminAuth(req, res, async () => {
        const { period = 30 } = req.query;
        const days = parseInt(period as string) || 30;

        const stats = await this.badgeService.getBadgeSystemStats(days);

        res.json(createResponse(true, '배지 통계를 조회했습니다.', stats));
      });
    } catch (error) {
      console.error('배지 통계 조회 오류:', error);
      res.status(500).json(
        createResponse(false, '배지 통계 조회 중 오류가 발생했습니다.', null)
      );
    }
  };
}
