/**
 * 포인트 컨트롤러
 * 
 * @description
 * - 포인트 관련 API 엔드포인트 처리
 * - 포인트 이력 조회 및 관리
 * - 포인트 랭킹 시스템
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { PointService } from '@jeju-tourlist/database';
import { prisma } from '@jeju-tourlist/database';
import { createResponse } from '../utils/response';

/**
 * 포인트 컨트롤러 클래스
 * 
 * @description
 * - 포인트 관련 모든 HTTP 요청 처리
 * - 요청 검증 및 응답 생성
 * - 에러 핸들링 및 로깅
 */
export class PointController {
  private pointService: PointService;

  constructor() {
    this.pointService = new PointService(prisma);
  }

  /**
   * 사용자 포인트 조회
   * 
   * @description
   * - 현재 사용자의 포인트 정보 조회
   * - 레벨 및 통계 정보 포함
   * 
   * @route GET /api/points/me
   * @access Private
   */
  getMyPoints = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json(
          createResponse(false, '인증이 필요합니다.', null)
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          points: true,
          level: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json(
          createResponse(false, '사용자를 찾을 수 없습니다.', null)
        );
      }

      res.json(createResponse(true, '포인트 정보를 조회했습니다.', {
        user: {
          id: user.id,
          name: user.name,
          points: user.points,
          level: user.level,
          joinDate: user.createdAt,
        },
      }));
    } catch (error) {
      console.error('포인트 조회 오류:', error);
      res.status(500).json(
        createResponse(false, '포인트 조회 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 포인트 이력 조회
   * 
   * @description
   * - 사용자의 포인트 트랜잭션 이력 조회
   * - 페이지네이션 및 필터링 지원
   * 
   * @route GET /api/points/history
   * @access Private
   */
  getPointHistory = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json(
          createResponse(false, '인증이 필요합니다.', null)
        );
      }

      const {
        page = 1,
        limit = 20,
        type,
        startDate,
        endDate,
      } = req.query;

      const options = {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 20,
        type: type as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const result = await this.pointService.getPointHistory(userId, options);

      res.json(createResponse(true, '포인트 이력을 조회했습니다.', result));
    } catch (error) {
      console.error('포인트 이력 조회 오류:', error);
      res.status(500).json(
        createResponse(false, '포인트 이력 조회 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 포인트 랭킹 조회
   * 
   * @description
   * - 전체 사용자 포인트 랭킹 조회
   * - 페이지네이션 지원
   * 
   * @route GET /api/points/ranking
   * @access Public
   */
  getPointRanking = async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 50,
        userId,
      } = req.query;

      const options = {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 50,
        userId: userId as string,
      };

      const result = await this.pointService.getPointRanking(options);

      res.json(createResponse(true, '포인트 랭킹을 조회했습니다.', result));
    } catch (error) {
      console.error('포인트 랭킹 조회 오류:', error);
      res.status(500).json(
        createResponse(false, '포인트 랭킹 조회 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 포인트 통계 조회
   * 
   * @description
   * - 사용자별 포인트 상세 통계
   * - 기간별 포인트 변화 추이
   * 
   * @route GET /api/points/stats
   * @access Private
   */
  getPointStats = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json(
          createResponse(false, '인증이 필요합니다.', null)
        );
      }

      const { period = 30 } = req.query;
      const days = parseInt(period as string) || 30;

      const stats = await this.pointService.getUserPointStats(userId, days);

      res.json(createResponse(true, '포인트 통계를 조회했습니다.', stats));
    } catch (error) {
      console.error('포인트 통계 조회 오류:', error);
      res.status(500).json(
        createResponse(false, '포인트 통계 조회 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 포인트 정합성 검증
   * 
   * @description
   * - 사용자 포인트와 트랜잭션 이력 일치성 검증
   * - 관리자 전용 기능
   * 
   * @route GET /api/points/validate/:userId
   * @access Private (Admin only)
   */
  validatePointIntegrity = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      // TODO: 관리자 권한 검증 추가
      // if (!req.user?.isAdmin) {
      //   return res.status(403).json(
      //     createResponse(false, '관리자 권한이 필요합니다.', null)
      //   );
      // }

      const result = await this.pointService.validatePointIntegrity(userId);

      res.json(createResponse(true, '포인트 정합성 검증을 완료했습니다.', result));
    } catch (error) {
      console.error('포인트 정합성 검증 오류:', error);
      res.status(500).json(
        createResponse(false, '포인트 정합성 검증 중 오류가 발생했습니다.', null)
      );
    }
  };

  /**
   * 포인트 정합성 복구
   * 
   * @description
   * - 포인트 불일치 시 자동 복구
   * - 관리자 전용 기능
   * 
   * @route POST /api/points/repair/:userId
   * @access Private (Admin only)
   */
  repairPointIntegrity = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      // TODO: 관리자 권한 검증 추가
      // if (!req.user?.isAdmin) {
      //   return res.status(403).json(
      //     createResponse(false, '관리자 권한이 필요합니다.', null)
      //   );
      // }

      const result = await this.pointService.repairPointIntegrity(userId);

      res.json(createResponse(true, '포인트 복구를 완료했습니다.', result));
    } catch (error) {
      console.error('포인트 복구 오류:', error);
      res.status(500).json(
        createResponse(false, '포인트 복구 중 오류가 발생했습니다.', null)
      );
    }
  };
}
