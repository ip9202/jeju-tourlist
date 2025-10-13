import { Page } from "@playwright/test";

export class TestHelpers {
  /**
   * 사용자 로그인 시뮬레이션 (커스텀 인증 시스템)
   */
  static async loginUser(
    page: Page,
    userType: "local" | "admin" | "user" = "user"
  ) {
    // 커스텀 인증 시스템 모킹
    await page.addInitScript(type => {
      const userData = {
        id: `test-${type}-1`,
        name:
          type === "local"
            ? "제주 현지인"
            : type === "admin"
              ? "관리자"
              : "테스트 사용자",
        email: `${type}@example.com`,
        profileImage: "/avatars/default.png",
        provider: "email",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 커스텀 인증 시스템용 토큰 저장
      const tempToken = `temp_${userData.id}_${Date.now()}`;
      window.localStorage.setItem("auth_token", tempToken);

      // AuthContext 상태 강제 설정
      window.__AUTH_STATE__ = {
        user: userData,
        isAuthenticated: true,
        isLoading: false,
      };

      // API 모킹을 위한 전역 설정
      window.__MOCK_USER__ = userData;
    }, userType);

    await page.goto("http://localhost:3000");
  }

  /**
   * 알림 시뮬레이션
   */
  static async simulateNotification(
    page: Page,
    notification: { id: string; message: string; read: boolean }
  ) {
    await page.addInitScript(notif => {
      window.dispatchEvent(
        new CustomEvent("newNotification", { detail: notif })
      );
    }, notification);
  }

  /**
   * 페이지 로딩 대기
   */
  static async waitForPageLoad(page: Page, url?: string) {
    if (url) {
      await page.goto(url, { waitUntil: "load" });
    }
    await page.waitForLoadState("networkidle");
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
