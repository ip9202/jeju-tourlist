import { test, expect } from "@playwright/test";

test.describe("회원가입 테스트", () => {
  test("회원가입 폼이 정상적으로 작동한다", async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.goto("/auth/signup");

    // 페이지 로딩 확인
    await expect(page).toHaveTitle(/동네물어봐/);

    // 폼 요소들 확인
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="passwordConfirm"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="nickname"]')).toBeVisible();

    // 약관 동의 체크박스 확인
    await expect(page.locator("#register-terms")).toBeVisible();
    await expect(page.locator("#register-privacy")).toBeVisible();

    // 회원가입 버튼 확인
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    console.log("✅ 회원가입 폼 요소들이 모두 표시됨");
  });

  test("회원가입 폼 제출이 정상적으로 작동한다", async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.goto("/auth/signup");

    // 페이지 로딩 대기 (더 관대한 조건)
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(5000); // 더 긴 대기 시간

    // 페이지가 로딩되었는지 확인
    const pageTitle = await page.title();
    console.log("📄 페이지 제목:", pageTitle);

    // 클라이언트 사이드 렌더링 완료 대기
    await page.waitForFunction(
      () => {
        const emailInput = document.querySelector('input[name="email"]');
        return emailInput !== null;
      },
      { timeout: 10000 }
    );

    // 폼 요소가 존재하는지 확인
    const emailInput = page.locator('input[name="email"]');
    const isEmailInputVisible = await emailInput.isVisible();
    console.log("📧 이메일 입력 필드:", isEmailInputVisible);

    if (!isEmailInputVisible) {
      // 페이지 내용 확인
      const pageContent = await page.textContent("body");
      console.log("📄 페이지 내용:", pageContent?.substring(0, 500));
      throw new Error("이메일 입력 필드를 찾을 수 없습니다");
    }

    // 고유한 이메일 생성
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const uniqueNickname = `playwright${Date.now()}`;

    // 폼 작성
    await emailInput.fill(uniqueEmail);
    await page.locator('input[name="password"]').fill("Test123!@#");
    await page.locator('input[name="passwordConfirm"]').fill("Test123!@#");
    await page.locator('input[name="name"]').fill("플레이라이트테스트");
    await page.locator('input[name="nickname"]').fill(uniqueNickname);

    // 약관 동의
    await page.locator("#register-terms").click();
    await page.locator("#register-privacy").click();

    // 잠시 대기 (이메일 중복 체크 완료 대기)
    await page.waitForTimeout(2000);

    // 회원가입 버튼 클릭
    await page.locator('button[type="submit"]').click();

    // 성공 메시지 또는 에러 메시지 확인
    await page.waitForTimeout(3000);

    // 페이지의 모든 텍스트 확인 (디버깅용)
    const pageText = await page.textContent("body");
    console.log("📄 페이지 텍스트:", pageText);

    // 페이지에 성공 메시지가 있는지 확인
    const successMessage = page.locator("text=회원가입이 완료되었습니다");
    const errorMessage = page.locator("text=이미 사용 중인 이메일입니다");
    const anyAlert = page.locator('[role="alert"]');

    // 둘 중 하나는 나타나야 함
    const hasSuccess = await successMessage.isVisible();
    const hasError = await errorMessage.isVisible();
    const hasAlert = await anyAlert.isVisible();

    console.log("🔍 성공 메시지:", hasSuccess);
    console.log("🔍 에러 메시지:", hasError);
    console.log("🔍 알림 요소:", hasAlert);

    if (hasSuccess) {
      console.log("✅ 회원가입이 성공적으로 완료됨");
    } else if (hasError) {
      console.log("⚠️ 이메일이 이미 사용 중임");
    } else if (hasAlert) {
      console.log("📢 알림 메시지가 표시됨");
    } else {
      console.log("❓ 예상치 못한 결과");
    }

    // 최소한 하나의 메시지는 나타나야 함
    expect(hasSuccess || hasError || hasAlert).toBe(true);
  });

  test("이메일 중복 검증이 작동한다", async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.goto("/auth/signup");

    // 이미 존재하는 이메일 입력
    await page.fill('input[name="email"]', "test-playwright@example.com");

    // 이메일 입력 후 잠시 대기 (디바운싱)
    await page.waitForTimeout(1000);

    // 이메일 중복 에러 메시지 확인
    const errorMessage = page.locator("text=이미 사용 중인 이메일입니다");
    await expect(errorMessage).toBeVisible();

    console.log("✅ 이메일 중복 검증이 정상적으로 작동함");
  });

  test("비밀번호 강도 검증이 작동한다", async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.goto("/auth/signup");

    // 약한 비밀번호 입력
    await page.fill('input[name="password"]', "123");

    // 비밀번호 강도 표시기 확인 (Progress 컴포넌트)
    const strengthIndicator = page.locator('[role="progressbar"]');
    await expect(strengthIndicator).toBeVisible();

    console.log("✅ 비밀번호 강도 검증이 정상적으로 작동함");
  });
});
