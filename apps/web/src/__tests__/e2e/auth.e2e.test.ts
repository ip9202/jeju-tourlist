/**
 * 인증 플로우 E2E 테스트
 *
 * @description
 * - 사용자 인증 전체 플로우에 대한 E2E 테스트
 * - 실제 브라우저 환경에서의 사용자 상호작용 테스트
 * - SRP: 각 테스트는 특정 인증 시나리오만 검증
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Authentication E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // 테스트 환경 설정
    await page.goto("http://localhost:3000");
    
    // 네트워크 요청 모킹 (실제 API 호출 대신)
    await page.route("**/api/auth/**", async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      
      if (url.includes("/api/auth/login") && method === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              user: {
                id: "test-user-123",
                email: "test@example.com",
                name: "Test User",
                provider: "google",
              },
              token: "mock-jwt-token",
            },
          }),
        });
      } else if (url.includes("/api/auth/me") && method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              user: {
                id: "test-user-123",
                email: "test@example.com",
                name: "Test User",
                provider: "google",
              },
            },
          }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("사용자가 로그인할 수 있어야 함", async () => {
    // Given - 로그인 페이지로 이동
    await page.goto("http://localhost:3000/auth/login");

    // When - 로그인 폼 작성 및 제출
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.click('[data-testid="google-login-button"]');

    // Then - 로그인 성공 확인
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-name"]')).toContainText("Test User");
    
    // URL이 홈페이지로 변경되었는지 확인
    await expect(page).toHaveURL("http://localhost:3000/");
  });

  test("로그인된 사용자가 로그아웃할 수 있어야 함", async () => {
    // Given - 로그인된 상태
    await page.goto("http://localhost:3000/auth/login");
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.click('[data-testid="google-login-button"]');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // When - 로그아웃 버튼 클릭
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Then - 로그아웃 확인
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
  });

  test("로그인하지 않은 사용자가 보호된 페이지에 접근 시 로그인 페이지로 리다이렉트되어야 함", async () => {
    // Given - 로그인하지 않은 상태
    await page.goto("http://localhost:3000/profile");

    // Then - 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL("http://localhost:3000/auth/login");
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test("사용자가 회원가입할 수 있어야 함", async () => {
    // Given - 회원가입 페이지로 이동
    await page.goto("http://localhost:3000/auth/register");

    // When - 회원가입 폼 작성 및 제출
    await page.fill('[data-testid="name-input"]', "New User");
    await page.fill('[data-testid="email-input"]', "newuser@example.com");
    await page.click('[data-testid="google-register-button"]');

    // Then - 회원가입 성공 확인
    await expect(page.locator('[data-testid="success-message"]')).toContainText("회원가입이 완료되었습니다");
    await expect(page).toHaveURL("http://localhost:3000/");
  });

  test("잘못된 이메일 형식으로 로그인 시 에러 메시지가 표시되어야 함", async () => {
    // Given - 로그인 페이지로 이동
    await page.goto("http://localhost:3000/auth/login");

    // When - 잘못된 이메일 형식 입력
    await page.fill('[data-testid="email-input"]', "invalid-email");
    await page.click('[data-testid="google-login-button"]');

    // Then - 에러 메시지 확인
    await expect(page.locator('[data-testid="error-message"]')).toContainText("유효하지 않은 이메일 형식입니다");
  });

  test("로그인 상태가 새로고침 후에도 유지되어야 함", async () => {
    // Given - 로그인된 상태
    await page.goto("http://localhost:3000/auth/login");
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.click('[data-testid="google-login-button"]');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // When - 페이지 새로고침
    await page.reload();

    // Then - 로그인 상태 유지 확인
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-name"]')).toContainText("Test User");
  });
});
