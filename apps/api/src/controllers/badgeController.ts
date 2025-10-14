/**
 * 배지 컨트롤러
 * 
 * @description
 * - 배지 관련 API 엔드포인트 처리
 * - 배지 조회, 부여, 관리 기능
 * - 자동 배지 부여 시스템
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { BadgeService } from '@jeju-tourlist/database';
import { prisma } from '@jeju-tourlist/database';
import { createResponse } from '../utils/response';

/**
 * 배지 컨트롤러 클래스
 * 
 * @description
 * - 배지 관련 모든 HTTP 요청 처리
 * - 요청 검증 및 응답 생성
 * - 에러 핸들링 및 로깅
 */
export class BadgeController {
  private badgeService: BadgeService;

  constructor() {
    this.badgeService = new BadgeService(prisma);
  }

  /**
   * 사용자 배지 목록 조회
   * 
   * @description
   * - 현재 사용자가 획득한 배지 목록 조회
   * - 카테고리별 필터링 지원
   * 
   * @route GET /api/badges/me
   * @access Private
   */
  getMyBadges = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json(
          createResponse(false, '인증이 필요합니다.', null)
        );
      }

      const { category } = req.query;
      const badges = await this.badgeService.getUserBadges(
        userId, 
        category as string
      );

      res.json(createResponse(true, '배지 목록을 조회했습니다.', { badges }));
    } catch (error) {
      console.error('배지 목록 조회 오류:', error);
      res.status(500).json(
        createResponse(false, '배지 목록 조회 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 사용자 배지 통계 조회
   * 
   * @description
   * - 사용자별 배지 획득 통계
   * - 카테고리별 배지 분포
   * 
   * @route GET /api/badges/stats
   * @access Private
   */
  getBadgeStats = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json(
          createResponse(false, '인증이 필요합니다.', null)
        );
      }

      const stats = await this.badgeService.getUserBadgeStats(userId);

      res.json(createResponse(true, '배지 통계를 조회했습니다.', stats));
    } catch (error) {
      console.error('배지 통계 조회 오류:', error);
      res.status(500).json(
        createResponse(false, '배지 통계 조회 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 전체 배지 목록 조회
   * 
   * @description
   * - 모든 배지 목록 조회
   * - 카테고리별 필터링 지원
   * 
   * @route GET /api/badges
   * @access Public
   */
  getBadges = async (req: Request, res: Response) => {
    try {
      const {
        category,
        isActive: _isActive = true,
        page = 1,
        limit = 20,
      } = req.query;

      const options = {
        category: category as string,
        isActive: true, // 기본값을 true로 고정
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 20,
      };

      const result = await this.badgeService.getBadges(options);

      res.json(createResponse(true, '배지 목록을 조회했습니다.', result));
    } catch (error) {
      console.error('배지 목록 조회 오류:', error);
      res.status(500).json(
        createResponse(false, '배지 목록 조회 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 특정 사용자 배지 조회
   * 
   * @description
   * - 특정 사용자가 획득한 배지 목록 조회
   * - 카테고리별 필터링 지원
   * 
   * @route GET /api/badges/users/:userId
   * @access Public
   */
  getUserBadges = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { category } = req.query;

      if (!userId) {
        return res.status(400).json(
          createResponse(false, '사용자 ID가 필요합니다.', null)
        );
      }

      const badges = await this.badgeService.getUserBadges(
        userId, 
        category as string
      );

      res.json(createResponse(true, '사용자 배지 목록을 조회했습니다.', { badges }));
    } catch (error) {
      console.error('사용자 배지 조회 오류:', error);
      res.status(500).json(
        createResponse(false, '사용자 배지 조회 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 특정 사용자 배지 진행률 조회
   * 
   * @description
   * - 사용자별 배지 진행률 조회
   * - 획득하지 않은 배지의 진행률 표시
   * 
   * @route GET /api/badges/users/:userId/progress
   * @access Public
   */
  getUserBadgeProgress = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json(
          createResponse(false, '사용자 ID가 필요합니다.', null)
        );
      }

      const progress = await this.badgeService.getUserBadgeProgress(userId);

      res.json(createResponse(true, '사용자 배지 진행률을 조회했습니다.', progress));
    } catch (error) {
      console.error('사용자 배지 진행률 조회 오류:', error);
      res.status(500).json(
        createResponse(false, '사용자 배지 진행률 조회 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 자동 배지 부여 검사
   * 
   * @description
   * - 사용자 활동 기반 자동 배지 부여
   * - 배지 조건 검증 및 자동 부여
   * 
   * @route POST /api/badges/check
   * @access Private
   */
  checkAndAwardBadges = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json(
          createResponse(false, '인증이 필요합니다.', null)
        );
      }

      const awardedBadges = await this.badgeService.checkAndAwardBadges(userId);

      res.json(createResponse(true, '배지 부여 검사를 완료했습니다.', {
        awardedBadges,
        count: awardedBadges.length,
      }));
    } catch (error) {
      console.error('배지 부여 검사 오류:', error);
      res.status(500).json(
        createResponse(false, '배지 부여 검사 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 배지 생성
   * 
   * @description
   * - 새로운 배지 생성
   * - 관리자 전용 기능
   * 
   * @route POST /api/badges
   * @access Private (Admin only)
   */
  createBadge = async (req: Request, res: Response) => {
    try {
      // TODO: 관리자 권한 검증 추가
      // if (!req.user?.isAdmin) {
      //   return res.status(403).json(
      //     createResponse(false, '관리자 권한이 필요합니다.', null)
      //   );
      // }

      const {
        name,
        description,
        icon,
        color,
        category,
        points = 0,
        condition,
      } = req.body;

      // 필수 필드 검증
      if (!name || !description || !icon || !color || !category || !condition) {
        return res.status(400).json(
          createResponse(false, '필수 필드가 누락되었습니다.', null)
        );
      }

      const badge = await this.badgeService.createBadge({
        name,
        description,
        icon,
        color,
        category,
        points,
        condition,
      });

      res.status(201).json(createResponse(true, '배지를 생성했습니다.', { badge }));
    } catch (error) {
      console.error('배지 생성 오류:', error);
      
      if (error instanceof Error && error.message.includes('이미 존재하는')) {
        return res.status(409).json(
          createResponse(false, error.message, null)
        );
      }

      res.status(500).json(
        createResponse(false, '배지 생성 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 배지 수정
   * 
   * @description
   * - 기존 배지 정보 수정
   * - 관리자 전용 기능
   * 
   * @route PUT /api/badges/:id
   * @access Private (Admin only)
   */
  updateBadge = async (req: Request, res: Response) => {
    try {
      // TODO: 관리자 권한 검증 추가
      // if (!req.user?.isAdmin) {
      //   return res.status(403).json(
      //     createResponse(false, '관리자 권한이 필요합니다.', null)
      //   );
      // }

      const { id } = req.params;
      const updateData = req.body;

      const badge = await this.badgeService.updateBadge(id, updateData);

      res.json(createResponse(true, '배지를 수정했습니다.', { badge }));
    } catch (error) {
      console.error('배지 수정 오류:', error);
      
      if (error instanceof Error && error.message.includes('이미 존재하는')) {
        return res.status(409).json(
          createResponse(false, error.message, null)
        );
      }

      res.status(500).json(
        createResponse(false, '배지 수정 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 배지 비활성화
   * 
   * @description
   * - 배지 비활성화 처리
   * - 관리자 전용 기능
   * 
   * @route DELETE /api/badges/:id
   * @access Private (Admin only)
   */
  deactivateBadge = async (req: Request, res: Response) => {
    try {
      // TODO: 관리자 권한 검증 추가
      // if (!req.user?.isAdmin) {
      //   return res.status(403).json(
      //     createResponse(false, '관리자 권한이 필요합니다.', null)
      //   );
      // }

      const { id } = req.params;

      const badge = await this.badgeService.deactivateBadge(id);

      res.json(createResponse(true, '배지를 비활성화했습니다.', { badge }));
    } catch (error) {
      console.error('배지 비활성화 오류:', error);
      res.status(500).json(
        createResponse(false, '배지 비활성화 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 수동 배지 부여
   * 
   * @description
   * - 관리자가 수동으로 배지 부여
   * - 관리자 전용 기능
   * 
   * @route POST /api/badges/award
   * @access Private (Admin only)
   */
  awardBadge = async (req: Request, res: Response) => {
    try {
      // TODO: 관리자 권한 검증 추가
      // if (!req.user?.isAdmin) {
      //   return res.status(403).json(
      //     createResponse(false, '관리자 권한이 필요합니다.', null)
      //   );
      // }

      const { userId, badgeId } = req.body;

      if (!userId || !badgeId) {
        return res.status(400).json(
          createResponse(false, '사용자 ID와 배지 ID가 필요합니다.', null)
        );
      }

      const userBadge = await this.badgeService.awardBadge(userId, badgeId);

      res.status(201).json(createResponse(true, '배지를 부여했습니다.', { userBadge }));
    } catch (error) {
      console.error('배지 부여 오류:', error);
      
      if (error instanceof Error && error.message.includes('이미 획득한')) {
        return res.status(409).json(
          createResponse(false, error.message, null)
        );
      }

      res.status(500).json(
        createResponse(false, '배지 부여 중 오류가 발생했습니다.', null)
      );
    }
  };
}
