import { test, expect } from "@playwright/test";

test.describe("Header Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
  });

  test("헤더 요소들이 올바르게 표시되는지 확인", async ({ page }) => {
    // 로고 확인
    await expect(page.locator("header")).toBeVisible();

    // 로고 텍스트 확인 (정확한 선택자 사용)
    await expect(page.locator('header a[href="/"] span')).toBeVisible();

    // 검색창 확인 (데스크톱에서만) - 헤더의 검색창만 선택
    await expect(page.locator('header input[type="search"]')).toBeVisible();

    // 액션 버튼들 확인
    const loginButton = page.locator("text=로그인");
    const questionButton = page.locator("text=질문하기");
    const logoutButton = page.locator("text=로그아웃");

    // 로그인 상태에 따라 버튼이 다르게 표시됨
    const isLoggedIn = await logoutButton.isVisible();
    if (isLoggedIn) {
      await expect(questionButton).toBeVisible();
    } else {
      await expect(loginButton).toBeVisible();
    }
  });

  test("검색 기능이 올바르게 작동하는지 확인", async ({ page }) => {
    const searchInput = page.locator('header input[type="search"]');

    await searchInput.fill("제주도 맛집");
    await searchInput.press("Enter");

    // 검색 결과 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*questions.*search/);
  });

  test("모바일 메뉴 버튼이 표시되는지 확인", async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 });

    // 햄버거 메뉴 버튼 확인 (검색 버튼 제외)
    const menuButton = page.locator('button[aria-label="메뉴 열기"]');
    await expect(menuButton).toBeVisible();
  });

  test("헤더 레이아웃이 반응형으로 작동하는지 확인", async ({ page }) => {
    // 데스크톱 뷰포트
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('header input[type="search"]')).toBeVisible();

    // 태블릿 뷰포트
    await page.setViewportSize({ width: 768, height: 1024 });
    // 태블릿에서는 검색창이 숨겨져야 함 (lg:flex이므로)
    await expect(page.locator('header input[type="search"]')).toBeHidden();

    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 });
    // 모바일에서는 검색창이 숨겨져야 함
    await expect(page.locator('header input[type="search"]')).toBeHidden();
  });

  test("헤더 메뉴 정렬이 올바른지 확인", async ({ page }) => {
    const header = page.locator("header");

    // 헤더 컨테이너의 flex 레이아웃 확인
    const container = header.locator(".container");
    await expect(container).toHaveClass(/flex/);

    // 컨테이너의 최대 너비 확인
    await expect(container).toHaveClass(/max-w-screen-2xl/);

    // 로고 영역 확인
    const logoArea = header.locator('a[href="/"]');
    await expect(logoArea).toBeVisible();

    // 왼쪽 영역 (로고 + 네비게이션) 확인
    const leftArea = header.locator("div.flex.items-center.space-x-8");
    await expect(leftArea).toBeVisible();

    // 오른쪽 영역 (액션 버튼) 확인
    const rightArea = header.locator("div.flex.items-center.space-x-4");
    await expect(rightArea).toBeVisible();

    // 검색창 확인 (데스크톱에서만)
    const searchArea = header.locator("div.hidden.lg\\:flex");
    await expect(searchArea).toBeVisible();
  });
});
