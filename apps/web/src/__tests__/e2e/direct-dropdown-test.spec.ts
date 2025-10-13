import { test } from "@playwright/test";

test.describe("사용자 드롭다운 직접 테스트", () => {
  test("로그인 후 사용자 드롭다운 메뉴 직접 테스트", async ({ page }) => {
    // 데스크탑 뷰포트 설정
    await page.setViewportSize({ width: 1200, height: 800 });

    // 로그인 페이지로 이동
    await page.goto("http://localhost:3000/auth/signin");

    console.log("현재 URL:", page.url());

    // 로그인 폼 작성
    await page.fill("#login-email", "ip9202@gmail.com");
    await page.fill("#login-password", "rkdcjfIP00!");

    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');

    // 잠시 대기
    await page.waitForTimeout(3000);

    console.log("로그인 후 URL:", page.url());

    // 페이지 새로고침으로 상태 확인
    await page.reload();
    await page.waitForTimeout(2000);

    console.log("새로고침 후 URL:", page.url());

    // 헤더 내용 확인
    const header = page.locator("header");
    const headerText = await header.textContent();
    console.log("헤더 내용:", headerText);

    // 사용자 이름이 포함된 버튼 찾기
    const userButton = page.locator("button").filter({ hasText: "강강철권" });
    const userButtonCount = await userButton.count();
    console.log("사용자 버튼 개수:", userButtonCount);

    if (userButtonCount > 0) {
      console.log("✅ 사용자 버튼 발견!");

      // 사용자 버튼 클릭
      await userButton.click();
      await page.waitForTimeout(1000);

      // 드롭다운 메뉴 확인
      const dropdown = page.locator("div.z-\\[9999\\]");
      const dropdownCount = await dropdown.count();
      console.log("드롭다운 개수:", dropdownCount);

      if (dropdownCount > 0) {
        const dropdownVisible = await dropdown.isVisible();
        console.log("드롭다운 표시 상태:", dropdownVisible);

        if (dropdownVisible) {
          console.log("✅ 드롭다운 메뉴가 정상적으로 표시됨!");

          // 프로필 링크 확인
          const profileLink = dropdown.locator('a[href="/profile"]');
          const profileVisible = await profileLink.isVisible();
          console.log("프로필 링크 표시:", profileVisible);

          // 로그아웃 버튼 확인
          const logoutButton = dropdown
            .locator("button")
            .filter({ hasText: "로그아웃" });
          const logoutVisible = await logoutButton.isVisible();
          console.log("로그아웃 버튼 표시:", logoutVisible);
        } else {
          console.log("❌ 드롭다운이 표시되지 않음");
        }
      } else {
        console.log("❌ 드롭다운 요소를 찾을 수 없음");
      }
    } else {
      console.log("❌ 사용자 버튼을 찾을 수 없음");

      // 모든 버튼 확인
      const allButtons = await page.locator("button").all();
      console.log("전체 버튼 개수:", allButtons.length);

      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const buttonText = await allButtons[i].textContent();
        console.log(`버튼 ${i}: "${buttonText}"`);
      }
    }
  });
});
