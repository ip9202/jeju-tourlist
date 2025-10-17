import { test, expect } from "@playwright/test";

test.describe("전문가 대시보드 간단 테스트", () => {
  test.beforeEach(async ({ page }) => {
    // 전문가 대시보드 페이지로 이동
    await page.goto("/experts");
  });

  test("전문가 대시보드 페이지가 올바르게 로드된다", async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/전문가 대시보드/);
    
    // 헤더 확인
    await expect(page.locator("h1")).toContainText("전문가 대시보드");
    
    // 설명 텍스트 확인
    await expect(page.locator("p")).toContainText("제주도 여행 전문가들의 랭킹과 통계를 확인하세요");
  });

  test("로딩 상태가 표시된다", async ({ page }) => {
    // 로딩 스피너 확인
    await expect(page.locator("[data-testid='loading-spinner']")).toBeVisible();
  });

  test("페이지가 완전히 로드된다", async ({ page }) => {
    // 로딩 완료까지 대기
    await page.waitForLoadState("networkidle");
    
    // 로딩 스피너가 사라지는지 확인
    await expect(page.locator("[data-testid='loading-spinner']")).not.toBeVisible();
    
    // 헤더가 표시되는지 확인
    await expect(page.locator("h1")).toBeVisible();
  });

  test("반응형 디자인이 작동한다", async ({ page }) => {
    // 로딩 완료까지 대기
    await page.waitForLoadState("networkidle");
    
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 모바일에서도 헤더가 표시되는지 확인
    await expect(page.locator("h1")).toBeVisible();
    
    // 태블릿 뷰포트로 변경
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // 태블릿에서도 헤더가 표시되는지 확인
    await expect(page.locator("h1")).toBeVisible();
    
    // 데스크톱 뷰포트로 변경
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // 데스크톱에서도 헤더가 표시되는지 확인
    await expect(page.locator("h1")).toBeVisible();
  });

  test("페이지 성능이 적절하다", async ({ page }) => {
    // 성능 측정 시작
    const startTime = Date.now();
    
    // 페이지 로드 완료까지 대기
    await page.waitForLoadState("networkidle");
    
    const loadTime = Date.now() - startTime;
    
    // 로드 시간이 10초 이내인지 확인
    expect(loadTime).toBeLessThan(10000);
  });

  test("에러 상태가 올바르게 처리된다", async ({ page }) => {
    // 네트워크 오프라인으로 설정
    await page.context().setOffline(true);
    
    // 페이지 새로고침
    await page.reload();
    
    // 에러 상태 확인 (실제 구현에 따라 다를 수 있음)
    // 현재는 로딩 상태만 확인
    await expect(page.locator("[data-testid='loading-spinner']")).toBeVisible();
    
    // 네트워크 온라인으로 복구
    await page.context().setOffline(false);
  });
});
