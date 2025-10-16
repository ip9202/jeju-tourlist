import { test, expect } from "@playwright/test";

test.describe("회원가입 테스트", () => {
  test.beforeEach(async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.goto("http://localhost:3001/auth/signup");
  });

  test("회원가입 폼 렌더링 확인", async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/동네물어봐/);

    // 회원가입 폼 요소들 확인
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="passwordConfirm"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="nickname"]')).toBeVisible();

    // 약관 동의 체크박스 확인
    await expect(page.locator('input[name="agreeToTerms"]')).toBeVisible();
    await expect(page.locator('input[name="agreeToPrivacy"]')).toBeVisible();
    await expect(page.locator('input[name="agreeToMarketing"]')).toBeVisible();

    // 회원가입 버튼 확인
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("이메일 중복 확인 기능 테스트", async ({ page }) => {
    // 이미 존재하는 이메일 입력
    await page.fill('input[name="email"]', "test-new@example.com");

    // 이메일 입력 후 잠시 대기 (debounce)
    await page.waitForTimeout(1000);

    // 이메일 중복 메시지 확인
    const emailError = page.locator("text=이미 사용 중인 이메일입니다");
    await expect(emailError).toBeVisible();
  });

  test("비밀번호 강도 표시기 테스트", async ({ page }) => {
    // 약한 비밀번호 입력
    await page.fill('input[name="password"]', "123");

    // 비밀번호 강도 표시기 확인
    const strengthIndicator = page.locator('[data-testid="password-strength"]');
    await expect(strengthIndicator).toBeVisible();
  });

  test("유효성 검사 테스트", async ({ page }) => {
    // 빈 폼으로 제출 시도
    await page.click('button[type="submit"]');

    // 필수 필드 오류 메시지 확인
    await expect(page.locator("text=이메일을 입력해주세요")).toBeVisible();
    await expect(page.locator("text=비밀번호를 입력해주세요")).toBeVisible();
    await expect(page.locator("text=이름을 입력해주세요")).toBeVisible();
    await expect(page.locator("text=닉네임을 입력해주세요")).toBeVisible();
  });

  test("성공적인 회원가입 테스트", async ({ page }) => {
    // 고유한 이메일과 닉네임 생성
    const timestamp = Date.now();
    const testEmail = `playwright-test-${timestamp}@example.com`;
    const testNickname = `playwright-test-${timestamp}`;

    // 폼 작성
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', "Test123!@#");
    await page.fill('input[name="passwordConfirm"]', "Test123!@#");
    await page.fill('input[name="name"]', "Playwright 테스트");
    await page.fill('input[name="nickname"]', testNickname);

    // 약관 동의
    await page.check('input[name="agreeToTerms"]');
    await page.check('input[name="agreeToPrivacy"]');

    // 회원가입 버튼 클릭
    await page.click('button[type="submit"]');

    // 성공 메시지 확인
    await expect(page.locator("text=회원가입이 완료되었습니다")).toBeVisible();

    // 이메일 인증 안내 메시지 확인
    await expect(page.locator("text=이메일 인증을 진행해주세요")).toBeVisible();
  });

  test("비밀번호 불일치 테스트", async ({ page }) => {
    // 폼 작성 (비밀번호 불일치)
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "Test123!@#");
    await page.fill('input[name="passwordConfirm"]', "Different123!@#");
    await page.fill('input[name="name"]', "테스트");
    await page.fill('input[name="nickname"]', "testuser");

    // 약관 동의
    await page.check('input[name="agreeToTerms"]');
    await page.check('input[name="agreeToPrivacy"]');

    // 회원가입 버튼 클릭
    await page.click('button[type="submit"]');

    // 비밀번호 불일치 오류 메시지 확인
    await expect(
      page.locator("text=비밀번호가 일치하지 않습니다")
    ).toBeVisible();
  });

  test("약관 동의 필수 테스트", async ({ page }) => {
    // 폼 작성 (약관 동의 없음)
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "Test123!@#");
    await page.fill('input[name="passwordConfirm"]', "Test123!@#");
    await page.fill('input[name="name"]', "테스트");
    await page.fill('input[name="nickname"]', "testuser");

    // 회원가입 버튼 클릭 (약관 동의 없음)
    await page.click('button[type="submit"]');

    // 약관 동의 필수 오류 메시지 확인
    await expect(page.locator("text=이용약관에 동의해주세요")).toBeVisible();
    await expect(
      page.locator("text=개인정보처리방침에 동의해주세요")
    ).toBeVisible();
  });

  test("API 엔드포인트 직접 테스트", async ({ page }) => {
    // API 직접 호출 테스트
    const response = await page.request.post(
      "http://localhost:4000/api/auth/register",
      {
        data: {
          email: `api-test-${Date.now()}@example.com`,
          password: "Test123!@#",
          passwordConfirm: "Test123!@#",
          name: "API 테스트",
          nickname: `api-test-${Date.now()}`,
          agreeToTerms: true,
          agreeToPrivacy: true,
          agreeToMarketing: false,
        },
      }
    );

    // 응답 상태 확인
    expect(response.status()).toBe(201);

    // 응답 데이터 확인
    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.data.user.email).toContain("api-test-");
    expect(responseData.data.verificationToken).toBeDefined();
  });
});

test.describe("회원가입 페이지 네비게이션", () => {
  test("로그인 페이지로 이동", async ({ page }) => {
    await page.goto("http://localhost:3001/auth/signup");

    // 로그인 링크 클릭
    await page.click("text=이미 계정이 있으신가요?");

    // 로그인 페이지로 이동 확인
    await expect(page).toHaveURL(/.*\/auth\/signin/);
  });

  test("홈페이지로 이동", async ({ page }) => {
    await page.goto("http://localhost:3001/auth/signup");

    // 로고 클릭
    await page.click("text=동네물어봐");

    // 홈페이지로 이동 확인
    await expect(page).toHaveURL("http://localhost:3001/");
  });
});
