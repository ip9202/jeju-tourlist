import { test, expect } from '@playwright/test';

test.describe('Phase 1.5: 실시간 알림 시스템', () => {
  test.beforeEach(async ({ page }) => {
    // 인증 상태 모킹
    await page.addInitScript(() => {
      window.__AUTH_STATE__ = {
        user: {
          id: 'test-user',
          name: '테스트 사용자',
          email: 'test@example.com',
          profileImage: '/avatars/default.png'
        },
        isAuthenticated: true,
        isLoading: false
      };
    });
  });

  test('1.5.1 알림 벨 표시', async ({ page }) => {
    // Given - 홈페이지 방문
    await page.goto('http://localhost:3000', { waitUntil: 'load' });

    // Then - 알림 벨이 표시됨
    await expect(page.locator('[data-testid="notification-bell"]')).toBeVisible();
  });

  test('1.5.2 알림 드롭다운 열기', async ({ page }) => {
    // Given - 홈페이지 방문
    await page.goto('http://localhost:3000', { waitUntil: 'load' });

    // When - 알림 벨 클릭
    await page.click('[data-testid="notification-bell"]');

    // Then - 알림 드롭다운이 열림
    await expect(page.locator('[data-testid="notification-dropdown"]')).toBeVisible();
  });

  test('1.5.3 알림 목록 표시', async ({ page }) => {
    // Given - 홈페이지 방문
    await page.goto('http://localhost:3000', { waitUntil: 'load' });

    // When - 알림 벨 클릭
    await page.click('[data-testid="notification-bell"]');

    // Then - 알림 목록이 표시됨
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
  });

  test('1.5.4 읽지 않은 알림 개수 표시', async ({ page }) => {
    // Given - 홈페이지 방문
    await page.goto('http://localhost:3000', { waitUntil: 'load' });

    // Then - 읽지 않은 알림 개수가 표시됨
    await expect(page.locator('[data-testid="notification-badge"]')).toBeVisible();
  });

  test('1.5.5 알림 모두 읽음 처리', async ({ page }) => {
    // Given - 홈페이지 방문
    await page.goto('http://localhost:3000', { waitUntil: 'load' });

    // When - 알림 벨 클릭 후 모두 읽음 버튼 클릭
    await page.click('[data-testid="notification-bell"]');
    await page.click('[data-testid="mark-all-read-button"]');

    // Then - 알림이 모두 읽음 처리됨
    await expect(page.locator('[data-testid="notification-badge"]')).not.toBeVisible();
  });

  test('1.5.6 알림 전체 삭제', async ({ page }) => {
    // Given - 홈페이지 방문
    await page.goto('http://localhost:3000', { waitUntil: 'load' });

    // When - 알림 벨 클릭 후 전체 삭제 버튼 클릭
    await page.click('[data-testid="notification-bell"]');
    await page.click('[data-testid="clear-all-notifications-button"]');

    // Then - 알림이 모두 삭제됨
    await expect(page.locator('[data-testid="no-notifications-message"]')).toBeVisible();
  });

  test('1.5.7 알림 설정 페이지 이동', async ({ page }) => {
    // Given - 홈페이지 방문
    await page.goto('http://localhost:3000', { waitUntil: 'load' });

    // When - 알림 벨 클릭 후 설정 링크 클릭
    await page.click('[data-testid="notification-bell"]');
    await page.click('[data-testid="notification-settings-link"]');

    // Then - 알림 설정 페이지로 이동
    await expect(page).toHaveURL(/.*\/notifications\/settings/);
  });

  test('1.5.8 새 알림 시뮬레이션', async ({ page }) => {
    // Given - 홈페이지 방문
    await page.goto('http://localhost:3000', { waitUntil: 'load' });

    // When - 새 알림 시뮬레이션
    await page.evaluate(() => {
      const event = new CustomEvent('simulateNewNotification', {
        detail: {
          message: '새로운 답변이 등록되었습니다!',
          link: '/questions/123'
        }
      });
      window.dispatchEvent(event);
    });

    // Then - 새 알림이 추가됨
    await expect(page.locator('[data-testid="notification-badge"]')).toBeVisible();
  });

  test('1.5.9 알림 드롭다운 닫기', async ({ page }) => {
    // Given - 홈페이지 방문
    await page.goto('http://localhost:3000', { waitUntil: 'load' });

    // When - 알림 벨 클릭 후 닫기 버튼 클릭
    await page.click('[data-testid="notification-bell"]');
    await page.click('[data-testid="close-notifications-button"]');

    // Then - 알림 드롭다운이 닫힘
    await expect(page.locator('[data-testid="notification-dropdown"]')).not.toBeVisible();
  });

  test('1.5.10 외부 클릭으로 드롭다운 닫기', async ({ page }) => {
    // Given - 홈페이지 방문
    await page.goto('http://localhost:3000', { waitUntil: 'load' });

    // When - 알림 벨 클릭 후 외부 클릭
    await page.click('[data-testid="notification-bell"]');
    await page.click('body', { position: { x: 50, y: 50 } });

    // Then - 알림 드롭다운이 닫힘 (약간의 대기 시간 추가)
    await page.waitForTimeout(100);
    await expect(page.locator('[data-testid="notification-dropdown"]')).not.toBeVisible();
  });
});