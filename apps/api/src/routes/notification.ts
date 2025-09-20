/**
 * 알림 라우트
 * 
 * @description
 * - 알림 관련 API 라우트 정의
 * - 인증 미들웨어 적용
 * - 요청 검증 및 응답 처리
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();
const notificationController = new NotificationController();

/**
 * 알림 라우트 정의
 * 
 * @description
 * - RESTful API 설계 원칙 적용
 * - 인증이 필요한 라우트에 미들웨어 적용
 * - 명확한 라우트 경로 및 HTTP 메서드 사용
 */

// 사용자 알림 목록 조회 (인증 필요)
router.get('/', authenticate, notificationController.getNotifications);

// 알림 읽음 처리 (인증 필요)
router.put('/:id/read', authenticate, notificationController.markAsRead);

// 모든 알림 읽음 처리 (인증 필요)
router.put('/read-all', authenticate, notificationController.markAllAsRead);

// 알림 삭제 (인증 필요)
router.delete('/:id', authenticate, notificationController.deleteNotification);

// 알림 설정 조회 (인증 필요)
router.get('/settings', authenticate, notificationController.getSettings);

// 알림 설정 업데이트 (인증 필요)
router.put('/settings', authenticate, notificationController.updateSettings);

// 알림 통계 조회 (인증 필요)
router.get('/stats', authenticate, notificationController.getStats);

// 알림 생성 (관리자 전용)
router.post('/', authenticate, notificationController.createNotification);

// 알림 템플릿 생성 (관리자 전용)
router.post('/template', authenticate, notificationController.createTemplate);

// 알림 정리 작업 (관리자 전용)
router.post('/cleanup', authenticate, notificationController.cleanupNotifications);

export default router;
