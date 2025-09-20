/**
 * 배지 라우트
 * 
 * @description
 * - 배지 관련 API 라우트 정의
 * - 인증 미들웨어 적용
 * - 요청 검증 및 응답 처리
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { Router } from 'express';
import { BadgeController } from '../controllers/badgeController';
import { authenticate } from '../middleware/auth';

const router = Router();
const badgeController = new BadgeController();

/**
 * 배지 라우트 정의
 * 
 * @description
 * - RESTful API 설계 원칙 적용
 * - 인증이 필요한 라우트에 미들웨어 적용
 * - 명확한 라우트 경로 및 HTTP 메서드 사용
 */

// 사용자 배지 목록 조회 (인증 필요)
router.get('/me', authenticate, badgeController.getMyBadges);

// 사용자 배지 통계 조회 (인증 필요)
router.get('/stats', authenticate, badgeController.getBadgeStats);

// 자동 배지 부여 검사 (인증 필요)
router.post('/check', authenticate, badgeController.checkAndAwardBadges);

// 전체 배지 목록 조회 (공개)
router.get('/', badgeController.getBadges);

// 배지 생성 (관리자 전용)
router.post('/', authenticate, badgeController.createBadge);

// 배지 수정 (관리자 전용)
router.put('/:id', authenticate, badgeController.updateBadge);

// 배지 비활성화 (관리자 전용)
router.delete('/:id', authenticate, badgeController.deactivateBadge);

// 수동 배지 부여 (관리자 전용)
router.post('/award', authenticate, badgeController.awardBadge);

export default router;
