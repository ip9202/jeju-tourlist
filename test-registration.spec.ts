import { test, expect } from "@playwright/test";

test.describe("회원가입 테스트", () => {
  test("회원가입 폼이 정상적으로 작동한다", async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.goto("http://localhost:3001/auth/signup");

    // 페이지 로딩 확인
    await expect(page).toHaveTitle(/동네물어봐/);

    // 폼 요소들 확인
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="passwordConfirm"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="nickname"]')).toBeVisible();

    // 약관 동의 체크박스 확인
    await expect(page.locator('input[name="agreeToTerms"]')).toBeVisible();
    await expect(page.locator('input[name="agreeToPrivacy"]')).toBeVisible();

    // 회원가입 버튼 확인
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    console.log("✅ 회원가입 폼 요소들이 모두 표시됨");
  });

  test("회원가입 폼 제출이 정상적으로 작동한다", async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.goto("http://localhost:3001/auth/signup");

    // 폼 작성
    await page.fill('input[name="email"]', "test-playwright@example.com");
    await page.fill('input[name="password"]', "Test123!@#");
    await page.fill('input[name="passwordConfirm"]', "Test123!@#");
    await page.fill('input[name="name"]', "플레이라이트테스트");
    await page.fill('input[name="nickname"]', "playwrighttest123");

    // 약관 동의
    await page.check('input[name="agreeToTerms"]');
    await page.check('input[name="agreeToPrivacy"]');

    // 폼 제출 전 네트워크 요청 모니터링
    const responsePromise = page.waitForResponse(
      response =>
        response.url().includes("/api/auth/register") &&
        response.request().method() === "POST"
    );

    // 회원가입 버튼 클릭
    await page.click('button[type="submit"]');

    // API 응답 대기
    const response = await responsePromise;

    console.log("📡 API 응답 상태:", response.status());
    console.log("📡 API 응답 URL:", response.url());

    // 응답 확인
    expect(response.status()).toBe(201);

    const responseData = await response.json();
    console.log("📡 API 응답 데이터:", responseData);

    // 성공 메시지 확인
    expect(responseData.success).toBe(true);
    expect(responseData.data.user.email).toBe("test-playwright@example.com");

    console.log("✅ 회원가입이 성공적으로 완료됨");
  });

  test("이메일 중복 검증이 작동한다", async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.goto("http://localhost:3001/auth/signup");

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
    await page.goto("http://localhost:3001/auth/signup");

    // 약한 비밀번호 입력
    await page.fill('input[name="password"]', "123");

    // 비밀번호 강도 표시기 확인
    const strengthIndicator = page.locator('[data-testid="password-strength"]');
    await expect(strengthIndicator).toBeVisible();

    console.log("✅ 비밀번호 강도 검증이 정상적으로 작동함");
  });
});
