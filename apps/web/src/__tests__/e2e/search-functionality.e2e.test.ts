import { test, expect } from "@playwright/test";

test.describe("Search Functionality", () => {
  test("URL 파라미터로 검색이 작동하는지 확인", async ({ page }) => {
    // 검색 파라미터가 포함된 URL로 직접 이동
    await page.goto(
      "http://localhost:3000/questions?search=%EC%8B%A0%ED%98%BC%EB%B6%80%EB%B6%80"
    );

    // 페이지가 로드될 때까지 대기
    await page.waitForLoadState("networkidle");

    // 검색어가 입력창에 표시되는지 확인
    const searchInput = page.locator('input[placeholder="질문 검색..."]');
    await expect(searchInput).toHaveValue("신혼부부");

    // 검색 결과가 표시되는지 확인 (로딩 후)
    await page.waitForTimeout(2000);

    // 질문이 표시되는지 확인
    const questionCards = page
      .locator('[data-testid="question-card"], .space-y-4 > div')
      .first();
    await expect(questionCards).toBeVisible();

    // "질문이 없습니다" 메시지가 표시되지 않는지 확인
    const noQuestionsMessage = page.locator("text=질문이 없습니다");
    await expect(noQuestionsMessage).not.toBeVisible();
  });

  test("헤더 검색창으로 검색이 작동하는지 확인", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    // 헤더의 검색창에 검색어 입력
    const headerSearchInput = page.locator('header input[type="search"]');
    await headerSearchInput.fill("신혼부부");
    await headerSearchInput.press("Enter");

    // 질문 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*questions.*search/);

    // 검색 결과가 표시되는지 확인
    await page.waitForTimeout(2000);

    const questionCards = page
      .locator('[data-testid="question-card"], .space-y-4 > div')
      .first();
    await expect(questionCards).toBeVisible();
  });

  test("질문 페이지 내 검색창으로 검색이 작동하는지 확인", async ({ page }) => {
    await page.goto("http://localhost:3000/questions");

    // 질문 페이지의 검색창에 검색어 입력
    const pageSearchInput = page.locator('input[placeholder="질문 검색..."]');
    await pageSearchInput.fill("신혼부부");
    await pageSearchInput.press("Enter");

    // URL에 검색 파라미터가 추가되었는지 확인
    await expect(page).toHaveURL(
      /.*search=.*%EC%8B%A0%ED%98%BC%EB%B6%80%EB%B6%80/
    );

    // 검색 결과가 표시되는지 확인
    await page.waitForTimeout(2000);

    const questionCards = page
      .locator('[data-testid="question-card"], .space-y-4 > div')
      .first();
    await expect(questionCards).toBeVisible();
  });
});
