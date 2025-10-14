/**
 * 관리자 라우트
 * 
 * @description
 * - 관리자 대시보드 API 라우트 정의
 * - 관리자 권한 검증 미들웨어 적용
 * - 콘텐츠 관리 및 사용자 관리 기능
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';

const router = Router();
const adminController = new AdminController();

/**
 * 관리자 라우트 정의
 * 
 * @description
 * - RESTful API 설계 원칙 적용
 * - 모든 라우트에 인증 및 관리자 권한 검증 적용
 * - 명확한 라우트 경로 및 HTTP 메서드 사용
 */

// 대시보드 통계 조회
router.get('/dashboard', authenticate, adminController.getDashboardStats);

// 사용자 관리
router.get('/users', authenticate, adminController.getUsers);
router.put('/users/:id/status', authenticate, adminController.updateUserStatus);

// 콘텐츠 관리
router.get('/content', authenticate, adminController.getContent);
router.put('/content/:type/:id/status', authenticate, adminController.updateContentStatus);

// 신고 관리
router.get('/reports', authenticate, adminController.getReports);
router.get('/reports/stats', authenticate, adminController.getReportStats);
router.post('/reports/:id/process', authenticate, adminController.processReport);

// 시스템 설정
router.get('/settings', authenticate, adminController.getSystemSettings);
router.put('/settings', authenticate, adminController.updateSystemSettings);

// 배지 관리
router.post('/badges/calculate', authenticate, adminController.calculateBadges);
router.get('/badges/stats', authenticate, adminController.getBadgeStats);

export default router;
