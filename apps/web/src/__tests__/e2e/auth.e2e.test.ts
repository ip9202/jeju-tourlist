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

    // 네트워크 요청 모킹 (커스텀 인증 시스템)
    await page.route("**/api/auth/**", async route => {
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
                provider: "email",
                profileImage: "/avatars/default.png",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
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
                provider: "email",
                profileImage: "/avatars/default.png",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
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
    await page.goto("http://localhost:3000/auth/signin");

    // When - 로그인 폼 작성 및 제출
    await page.fill("#login-email", "test@example.com");
    await page.fill("#login-password", "password123");
    await page.click('button[type="submit"]');

    // Then - 로그인 성공 확인 (홈페이지로 리다이렉트)
    await page.waitForURL("http://localhost:3000/", { timeout: 10000 });

    // 사용자 드롭다운 메뉴가 표시되는지 확인
    await expect(page.locator("text=로그인")).not.toBeVisible();
    await expect(
      page.locator("button").filter({ hasText: "Test User" })
    ).toBeVisible();
  });

  test("로그인된 사용자가 로그아웃할 수 있어야 함", async () => {
    // Given - 로그인된 상태
    await page.goto("http://localhost:3000/auth/signin");
    await page.fill("#login-email", "test@example.com");
    await page.fill("#login-password", "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:3000/");

    // When - 로그아웃 버튼 클릭
    await page.click("text=로그아웃");

    // Then - 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL("http://localhost:3000/auth/signin");
  });

  test("로그인하지 않은 사용자가 보호된 페이지에 접근 시 로그인 페이지로 리다이렉트되어야 함", async () => {
    // Given - 로그인하지 않은 상태
    await page.goto("http://localhost:3000/profile");

    // Then - 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL("http://localhost:3000/auth/signin");
  });

  test("사용자가 회원가입할 수 있어야 함", async () => {
    // Given - 회원가입 페이지로 이동
    await page.goto("http://localhost:3000/auth/signup");

    // When - 회원가입 폼 작성 및 제출
    await page.fill("#name", "New User");
    await page.fill("#email", "newuser@example.com");
    await page.fill("#password", "password123");
    await page.click('button[type="submit"]');

    // Then - 회원가입 성공 확인 (홈페이지로 리다이렉트)
    await page.waitForURL("http://localhost:3000/", { timeout: 10000 });
  });

  test("잘못된 이메일 형식으로 로그인 시 에러 메시지가 표시되어야 함", async () => {
    // Given - 로그인 페이지로 이동
    await page.goto("http://localhost:3000/auth/signin");

    // When - 잘못된 이메일 형식 입력
    await page.fill("#login-email", "invalid-email");
    await page.fill("#login-password", "password123");
    await page.click('button[type="submit"]');

    // Then - 에러 메시지 확인
    await expect(page.locator("text=유효하지 않은 이메일 형식")).toBeVisible();
  });

  test("로그인 상태가 새로고침 후에도 유지되어야 함", async () => {
    // Given - 로그인된 상태
    await page.goto("http://localhost:3000/auth/signin");
    await page.fill("#login-email", "test@example.com");
    await page.fill("#login-password", "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:3000/");
    await expect(page.locator("text=로그아웃")).toBeVisible();

    // When - 페이지 새로고침
    await page.reload();

    // Then - 로그인 상태 유지 확인
    await expect(page.locator("text=로그아웃")).toBeVisible();
  });
});
