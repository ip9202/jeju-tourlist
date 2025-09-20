/**
 * 포인트 라우트
 * 
 * @description
 * - 포인트 관련 API 라우트 정의
 * - 인증 미들웨어 적용
 * - 요청 검증 및 응답 처리
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { Router } from 'express';
import { PointController } from '../controllers/pointController';
import { authenticate } from '../middleware/auth';

const router = Router();
const pointController = new PointController();

/**
 * 포인트 라우트 정의
 * 
 * @description
 * - RESTful API 설계 원칙 적용
 * - 인증이 필요한 라우트에 미들웨어 적용
 * - 명확한 라우트 경로 및 HTTP 메서드 사용
 */

// 사용자 포인트 조회 (인증 필요)
router.get('/me', authenticate, pointController.getMyPoints);

// 포인트 이력 조회 (인증 필요)
router.get('/history', authenticate, pointController.getPointHistory);

// 포인트 통계 조회 (인증 필요)
router.get('/stats', authenticate, pointController.getPointStats);

// 포인트 랭킹 조회 (공개)
router.get('/ranking', pointController.getPointRanking);

// 포인트 정합성 검증 (관리자 전용)
router.get('/validate/:userId', authenticate, pointController.validatePointIntegrity);

// 포인트 정합성 복구 (관리자 전용)
router.post('/repair/:userId', authenticate, pointController.repairPointIntegrity);

export default router;
