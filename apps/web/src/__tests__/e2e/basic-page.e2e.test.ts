import { test, expect } from "@playwright/test";

test.describe("기본 페이지 테스트", () => {
  test("홈페이지가 로드된다", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/동네물어봐/);
  });

  test("전문가 페이지가 로드된다", async ({ page }) => {
    await page.goto("/experts");
    
    // 페이지가 로드될 때까지 대기
    await page.waitForLoadState("domcontentloaded");
    
    // 제목이 있는지 확인
    const title = await page.title();
    expect(title).toContain("전문가");
  });

  test("질문 페이지가 로드된다", async ({ page }) => {
    await page.goto("/questions");
    await page.waitForLoadState("domcontentloaded");
    
    const title = await page.title();
    expect(title).toContain("동네물어봐");
  });
});
