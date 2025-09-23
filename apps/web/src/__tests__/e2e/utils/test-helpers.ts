import { Page } from '@playwright/test';

export class TestHelpers {
  /**
   * 사용자 로그인 시뮬레이션
   */
  static async loginUser(page: Page, userType: 'local' | 'admin' | 'user' = 'user') {
    // NextAuth.js 세션 모킹
    await page.addInitScript((type) => {
      const userData = {
        user: {
          id: `test-${type}-1`,
          name: type === 'local' ? '제주 현지인' : type === 'admin' ? '관리자' : '테스트 사용자',
          email: `${type}@example.com`,
          profileImage: '/avatars/default.png'
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      
      // localStorage에 세션 저장
      window.localStorage.setItem('nextauth.session', JSON.stringify(userData));
      
      // 인증 상태 강제 설정 (AuthContext에서 사용)
      window.__AUTH_STATE__ = {
        user: userData.user,
        isAuthenticated: true,
        isLoading: false
      };
      
      // NextAuth 세션 모킹
      Object.defineProperty(window, 'nextauth', {
        value: {
          session: userData,
          status: 'authenticated'
        },
        writable: true
      });
    }, userType);
    
    await page.goto('http://localhost:3000');
  }

  /**
   * 알림 시뮬레이션
   */
  static async simulateNotification(page: Page, notification: { id: string; message: string; read: boolean }) {
    await page.addInitScript((notif) => {
      window.dispatchEvent(new CustomEvent('newNotification', { detail: notif }));
    }, notification);
  }

  /**
   * 페이지 로딩 대기
   */
  static async waitForPageLoad(page: Page, url?: string) {
    if (url) {
      await page.goto(url, { waitUntil: 'load' });
    }
    await page.waitForLoadState('networkidle');
  }

  /**
   * 요소 클릭 및 대기
   */
  static async clickAndWait(page: Page, selector: string, timeout = 5000) {
    await page.click(selector);
    await page.waitForTimeout(timeout);
  }

  /**
   * 모바일 뷰포트 설정
   */
  static async setMobileViewport(page: Page) {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  }

  /**
   * 데스크톱 뷰포트 설정
   */
  static async setDesktopViewport(page: Page) {
    await page.setViewportSize({ width: 1280, height: 720 });
  }
}
