import { test } from "@playwright/test";

test.describe("인증 상태 디버깅", () => {
  test("로그인 후 상태 확인", async ({ page }) => {
    // 1. 로그인 페이지로 이동
    await page.goto("http://localhost:3000/auth/signin");

    // 2. 로그인 폼 작성
    await page.fill('input[type="email"]', "playwright@test.com");
    await page.fill('input[type="password"]', "password123!");

    // 3. 로그인 버튼 클릭
    await page.click('button[type="submit"]');

    // 4. 페이지 로딩 대기
    await page.waitForLoadState("networkidle");

    // 5. 현재 URL 확인
    console.log("로그인 후 URL:", page.url());

    // 6. 페이지 제목 확인
    const title = await page.title();
    console.log("페이지 제목:", title);

    // 7. 로그아웃 버튼 존재 여부 확인
    const logoutButton = page.locator("text=로그아웃");
    const logoutCount = await logoutButton.count();
    console.log("로그아웃 버튼 개수:", logoutCount);

    // 8. 로그인 버튼 존재 여부 확인
    const loginButton = page.locator("text=로그인");
    const loginCount = await loginButton.count();
    console.log("로그인 버튼 개수:", loginCount);

    // 9. 모든 버튼 텍스트 확인
    const allButtons = page.locator("button");
    const buttonCount = await allButtons.count();
    console.log("전체 버튼 개수:", buttonCount);

    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i);
      const text = await button.textContent();
      if (text && (text.includes("로그인") || text.includes("로그아웃"))) {
        console.log(`버튼 ${i}: "${text}"`);
      }
    }

    // 10. 커스텀 인증 시스템 상태 확인
    const authState = await page.evaluate(() => {
      // AuthContext 상태 확인
      const authInfo = (window as any).__AUTH_STATE__;
      return authInfo;
    });
    console.log("AuthContext 상태:", authState);

    // 11. localStorage 토큰 확인
    const token = await page.evaluate(() => {
      return localStorage.getItem("auth_token");
    });
    console.log("저장된 토큰:", token);
  });
});
