import { test, expect } from "@playwright/test";

test.describe("질문 목록 - 헤더 간격 확인", () => {
  test("메인헤더와 서브헤더 사이의 간격이 최소화되어야 한다", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/questions");

    const mainHeader = page.locator("header").first();
    const subHeader = page.getByTestId("subpage-header");

    await expect(mainHeader).toBeVisible();
    await expect(subHeader).toBeVisible();

    const mainHeaderBox = await mainHeader.boundingBox();
    const subHeaderBox = await subHeader.boundingBox();

    expect(mainHeaderBox).not.toBeNull();
    expect(subHeaderBox).not.toBeNull();

    // 메인헤더 하단과 서브헤더 상단 사이의 간격 계산
    const gap = subHeaderBox!.y - (mainHeaderBox!.y + mainHeaderBox!.height);

    console.log(`메인헤더 높이: ${mainHeaderBox!.height}px`);
    console.log(`서브헤더 높이: ${subHeaderBox!.height}px`);
    console.log(
      `메인헤더 하단 Y: ${mainHeaderBox!.y + mainHeaderBox!.height}px`
    );
    console.log(`서브헤더 상단 Y: ${subHeaderBox!.y}px`);
    console.log(`헤더 간 간격: ${gap}px`);

    // 간격이 5px 이하여야 함 (거의 붙어있어야 함)
    expect(gap).toBeLessThanOrEqual(5);
  });

  test("서브헤더가 메인헤더 바로 아래에 위치해야 한다", async ({ page }) => {
    await page.goto("http://localhost:3000/questions");

    const mainHeader = page.locator("header").first();
    const subHeader = page.getByTestId("subpage-header");

    const mainHeaderBox = await mainHeader.boundingBox();
    const subHeaderBox = await subHeader.boundingBox();

    // 서브헤더가 메인헤더 아래에 있어야 함
    expect(subHeaderBox!.y).toBeGreaterThan(
      mainHeaderBox!.y + mainHeaderBox!.height - 5
    );
  });
});
