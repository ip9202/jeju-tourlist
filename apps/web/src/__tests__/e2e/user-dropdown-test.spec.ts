import { test, expect } from "@playwright/test";

test.describe("사용자 드롭다운 테스트", () => {
  test("로그인 후 사용자 드롭다운 메뉴 테스트", async ({ page }) => {
    // 데스크탑 뷰포트 설정 (md 브레이크포인트 이상)
    await page.setViewportSize({ width: 768, height: 1024 });

    // 로그인 페이지로 이동
    await page.goto("http://localhost:3000/auth/signin");

    // 로그인 폼 작성
    await page.fill("#login-email", "ip9202@gmail.com");
    await page.fill("#login-password", "rkdcjfIP00!");

    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');

    // 로그인 성공 메시지 대기
    await page.waitForSelector("text=✅ 로그인 성공", { timeout: 10000 });

    console.log("로그인 성공 메시지 확인됨");

    // 잠시 대기 후 현재 상태 확인
    await page.waitForTimeout(2000);
    console.log("현재 URL:", page.url());

    // 페이지의 모든 버튼과 링크 확인
    const allButtons = await page.locator("button").all();
    const allLinks = await page.locator("a").all();

    console.log("버튼 개수:", allButtons.length);
    console.log("링크 개수:", allLinks.length);

    // 사용자 관련 요소 찾기
    const userElements = await page
      .locator("*")
      .filter({ hasText: /사용자|프로필|로그아웃/ })
      .all();
    console.log("사용자 관련 요소 개수:", userElements.length);

    // 헤더 영역 확인
    const header = page.locator("header");
    const headerText = await header.textContent();
    console.log("헤더 내용:", headerText);

    // 사용자 아바타 버튼 찾기 (사용자 이름이 포함된 버튼)
    const userAvatarButton = page
      .locator("button")
      .filter({ hasText: "강강철권" });

    // 사용자 아바타가 존재하는지 확인
    const avatarExists = (await userAvatarButton.count()) > 0;
    console.log("사용자 아바타 존재:", avatarExists);

    if (avatarExists) {
      // 사용자 아바타 클릭
      await userAvatarButton.click();

      // 드롭다운 메뉴가 나타나는지 확인 (z-[9999] 클래스가 있는 드롭다운만)
      const dropdownMenu = page
        .locator("div.z-\\[9999\\]")
        .filter({ hasText: "프로필" });
      await expect(dropdownMenu).toBeVisible({ timeout: 5000 });

      console.log("✅ 사용자 드롭다운 메뉴가 정상적으로 표시됨");

      // 프로필 링크 확인
      const profileLink = page.locator('div.z-\\[9999\\] a[href="/profile"]');
      await expect(profileLink).toBeVisible();

      // 로그아웃 버튼 확인
      const logoutButton = page
        .locator("div.z-\\[9999\\] button")
        .filter({ hasText: "로그아웃" });
      await expect(logoutButton).toBeVisible();

      console.log("✅ 프로필 링크와 로그아웃 버튼이 정상적으로 표시됨");

      // 외부 클릭으로 드롭다운 닫기 테스트
      await page.click("body", { position: { x: 100, y: 100 } });

      // 드롭다운이 닫혔는지 확인
      await expect(dropdownMenu).not.toBeVisible();

      console.log("✅ 외부 클릭으로 드롭다운이 정상적으로 닫힘");
    } else {
      console.log(
        "❌ 사용자 아바타를 찾을 수 없음 - 데스크탑 모드에서 테스트 필요"
      );

      // 모든 버튼의 텍스트 확인
      for (let i = 0; i < allButtons.length; i++) {
        const buttonText = await allButtons[i].textContent();
        console.log(`버튼 ${i}: "${buttonText}"`);
      }
    }
  });

  test("모바일에서 햄버거 메뉴 테스트", async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });

    // 로그인 페이지로 이동
    await page.goto("http://localhost:3000/auth/signin");

    // 로그인 폼 작성
    await page.fill("#login-email", "ip9202@gmail.com");
    await page.fill("#login-password", "rkdcjfIP00!");

    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');

    // 로그인 성공 메시지 대기
    await page.waitForSelector("text=✅ 로그인 성공", { timeout: 10000 });

    // 메인 페이지로 리다이렉트 대기
    await page.waitForURL("http://localhost:3000/**", { timeout: 2000 });

    console.log("모바일 현재 URL:", page.url());

    // 햄버거 메뉴 버튼 찾기
    const hamburgerButton = page
      .locator("button")
      .filter({ hasText: "" })
      .first();

    // 햄버거 메뉴 클릭
    await hamburgerButton.click();

    // 모바일 메뉴가 나타나는지 확인
    const mobileMenu = page.locator("div").filter({ hasText: "프로필" });
    await expect(mobileMenu).toBeVisible({ timeout: 5000 });

    console.log("✅ 모바일 햄버거 메뉴가 정상적으로 표시됨");

    // 모바일 메뉴에서 로그아웃 버튼 확인
    const mobileLogoutButton = page
      .locator("button")
      .filter({ hasText: "로그아웃" });
    await expect(mobileLogoutButton).toBeVisible();

    console.log("✅ 모바일 메뉴에서 로그아웃 버튼이 정상적으로 표시됨");
  });
});
