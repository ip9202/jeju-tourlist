import { test, expect } from "@playwright/test";

test.describe("질문 목록 - 서브헤더/필터 겹침 방지", () => {
  test("서브헤더가 필터를 덮지 않는다", async ({ page }) => {
    await page.goto("http://localhost:3000/questions");

    const header = page.getByTestId("subpage-header");

    await expect(header).toBeVisible();
    const headerBox = await header.boundingBox();
    expect(headerBox).not.toBeNull();

    // 필터 블록이 헤더 아래 있어야 함
    const filters = page.getByTestId("filters-block");
    await expect(filters).toBeVisible();
    const filtersBox = await filters.boundingBox();
    expect(filtersBox).not.toBeNull();
    expect(filtersBox!.y).toBeGreaterThan(headerBox!.y + headerBox!.height);

    // 필터 영역 첫 번째 셀렉트가 헤더 아래에 위치해야 함
    const firstFilter = page.locator("select").first();
    await expect(firstFilter).toBeVisible();
    const filterBox = await firstFilter.boundingBox();
    expect(filterBox).not.toBeNull();
    expect(filterBox!.y).toBeGreaterThan(headerBox!.y + headerBox!.height);
  });
});
