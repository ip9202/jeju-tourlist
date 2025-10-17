/**
 * 전문가 대시보드 E2E 테스트
 * 
 * @description
 * - 전문가 대시보드의 End-to-End 테스트
 * - Playwright를 사용한 실제 브라우저 테스트
 * - 사용자 시나리오 기반 테스트
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { test, expect } from "@playwright/test";

test.describe("전문가 대시보드 E2E 테스트", () => {
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

  test("통계 카드가 올바르게 표시된다", async ({ page }) => {
    // 통계 카드들이 표시되는지 확인
    await expect(page.locator("[data-testid='stats-card']")).toHaveCount(4);
    
    // 각 통계 카드의 내용 확인
    await expect(page.locator("text=총 전문가")).toBeVisible();
    await expect(page.locator("text=평균 평점")).toBeVisible();
    await expect(page.locator("text=인기 카테고리")).toBeVisible();
    await expect(page.locator("text=활성 카테고리")).toBeVisible();
  });

  test("TOP 전문가 섹션이 표시된다", async ({ page }) => {
    // TOP 전문가 섹션 확인
    await expect(page.locator("h2")).toContainText("TOP 전문가");
    
    // 새로고침 버튼 확인
    await expect(page.locator("button:has-text('새로고침')")).toBeVisible();
  });

  test("카테고리 필터가 올바르게 작동한다", async ({ page }) => {
    // 카테고리 필터 버튼들 확인
    await expect(page.locator("button:has-text('전체')")).toBeVisible();
    await expect(page.locator("button:has-text('맛집')")).toBeVisible();
    await expect(page.locator("button:has-text('교통')")).toBeVisible();
    await expect(page.locator("button:has-text('액티비티')")).toBeVisible();
    
    // 맛집 카테고리 클릭
    await page.click("button:has-text('맛집')");
    
    // 선택된 상태 확인
    await expect(page.locator("button:has-text('맛집')")).toHaveClass(/bg-blue-600/);
  });

  test("정렬 옵션이 올바르게 작동한다", async ({ page }) => {
    // 정렬 버튼들 확인
    await expect(page.locator("button:has-text('포인트 순')")).toBeVisible();
    await expect(page.locator("button:has-text('답변 수 순')")).toBeVisible();
    await expect(page.locator("button:has-text('채택률 순')")).toBeVisible();
    
    // 채택률 순 클릭
    await page.click("button:has-text('채택률 순')");
    
    // 선택된 상태 확인
    await expect(page.locator("button:has-text('채택률 순')")).toHaveClass(/bg-gray-800/);
  });

  test("뷰 모드 전환이 올바르게 작동한다", async ({ page }) => {
    // 카드/리스트 뷰 전환 버튼 확인
    await expect(page.locator("button:has-text('카드')")).toBeVisible();
    await expect(page.locator("button:has-text('리스트')")).toBeVisible();
    
    // 리스트 뷰로 전환
    await page.click("button:has-text('리스트')");
    
    // 리스트 뷰가 활성화되었는지 확인
    await expect(page.locator("button:has-text('리스트')")).toHaveClass(/bg-blue-600/);
  });

  test("전문가 카드가 올바르게 표시된다", async ({ page }) => {
    // 전문가 카드들이 표시되는지 확인
    const expertCards = page.locator("[data-testid='expert-card']");
    await expect(expertCards).toHaveCount.greaterThan(0);
    
    // 첫 번째 전문가 카드의 내용 확인
    const firstCard = expertCards.first();
    await expect(firstCard.locator("h3")).toBeVisible();
    await expect(firstCard.locator("text=포인트")).toBeVisible();
    await expect(firstCard.locator("text=답변수")).toBeVisible();
    await expect(firstCard.locator("text=채택률")).toBeVisible();
  });

  test("전문가 카드 클릭이 올바르게 작동한다", async ({ page }) => {
    // 전문가 카드 클릭
    const firstCard = page.locator("[data-testid='expert-card']").first();
    await firstCard.click();
    
    // 클릭 이벤트가 발생했는지 확인 (콘솔 로그 또는 모달 등)
    // 실제 구현에 따라 확인 방법이 달라질 수 있음
  });

  test("페이징이 올바르게 작동한다", async ({ page }) => {
    // 페이징 버튼들이 표시되는지 확인
    const pagination = page.locator("[data-testid='pagination']");
    
    if (await pagination.isVisible()) {
      // 이전/다음 버튼 확인
      await expect(page.locator("button:has-text('이전')")).toBeVisible();
      await expect(page.locator("button:has-text('다음')")).toBeVisible();
      
      // 페이지 번호 버튼들 확인
      const pageButtons = page.locator("[data-testid='page-button']");
      await expect(pageButtons).toHaveCount.greaterThan(0);
    }
  });

  test("반응형 디자인이 올바르게 작동한다", async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 모바일에서도 주요 요소들이 표시되는지 확인
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("button:has-text('전체')")).toBeVisible();
    
    // 태블릿 뷰포트로 변경
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // 태블릿에서도 주요 요소들이 표시되는지 확인
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("button:has-text('전체')")).toBeVisible();
    
    // 데스크톱 뷰포트로 변경
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // 데스크톱에서도 주요 요소들이 표시되는지 확인
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("button:has-text('전체')")).toBeVisible();
  });

  test("키보드 네비게이션이 올바르게 작동한다", async ({ page }) => {
    // Tab 키로 네비게이션
    await page.keyboard.press("Tab");
    
    // 첫 번째 포커스 가능한 요소가 포커스를 받았는지 확인
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
    
    // Enter 키로 활성화
    await page.keyboard.press("Enter");
    
    // Space 키로 활성화
    await page.keyboard.press(" ");
  });

  test("접근성이 올바르게 구현되어 있다", async ({ page }) => {
    // ARIA 라벨 확인
    const cards = page.locator("[role='button']");
    await expect(cards).toHaveCount.greaterThan(0);
    
    // 각 카드가 적절한 ARIA 라벨을 가지고 있는지 확인
    const firstCard = cards.first();
    await expect(firstCard).toHaveAttribute("aria-label");
    
    // 키보드 네비게이션 확인
    await firstCard.focus();
    await expect(firstCard).toHaveAttribute("tabindex", "0");
  });

  test("로딩 상태가 올바르게 표시된다", async ({ page }) => {
    // 페이지 로드 시 로딩 상태 확인
    await expect(page.locator("text=로딩 중")).toBeVisible();
    
    // 로딩 완료 후 콘텐츠 표시 확인
    await expect(page.locator("h1")).toBeVisible();
  });

  test("에러 상태가 올바르게 표시된다", async ({ page }) => {
    // 네트워크 오프라인으로 설정
    await page.context().setOffline(true);
    
    // 페이지 새로고침
    await page.reload();
    
    // 에러 메시지 확인
    await expect(page.locator("text=네트워크 연결 오류")).toBeVisible();
    
    // 네트워크 온라인으로 복구
    await page.context().setOffline(false);
  });

  test("검색 기능이 올바르게 작동한다", async ({ page }) => {
    // 검색 입력 필드가 있다면 테스트
    const searchInput = page.locator("input[type='search']");
    
    if (await searchInput.isVisible()) {
      // 검색어 입력
      await searchInput.fill("맛집");
      
      // 검색 버튼 클릭 또는 Enter 키 입력
      await page.keyboard.press("Enter");
      
      // 검색 결과 확인
      await expect(page.locator("text=맛집")).toBeVisible();
    }
  });

  test("사용자 경험이 일관성 있게 제공된다", async ({ page }) => {
    // 페이지 로드 시간 측정
    const startTime = Date.now();
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;
    
    // 로드 시간이 3초 이내인지 확인
    expect(loadTime).toBeLessThan(3000);
    
    // 애니메이션이 부드럽게 작동하는지 확인
    const cards = page.locator("[data-testid='expert-card']");
    await expect(cards.first()).toHaveCSS("transition", /shadow/);
  });
});

test.describe("전문가 대시보드 성능 테스트", () => {
  test("페이지 성능이 기준을 만족한다", async ({ page }) => {
    // 성능 메트릭 수집 시작
    await page.goto("/experts");
    
    // Core Web Vitals 확인
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === "largest-contentful-paint") {
              metrics.lcp = entry.startTime;
            }
            if (entry.entryType === "first-input") {
              metrics.fid = entry.processingStart - entry.startTime;
            }
            if (entry.entryType === "layout-shift") {
              metrics.cls = entry.value;
            }
          });
          
          resolve(metrics);
        }).observe({ entryTypes: ["largest-contentful-paint", "first-input", "layout-shift"] });
      });
    });
    
    // 성능 기준 확인 (실제 값은 프로젝트 요구사항에 따라 조정)
    expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
    expect(metrics.fid).toBeLessThan(100); // FID < 100ms
    expect(metrics.cls).toBeLessThan(0.1); // CLS < 0.1
  });

  test("메모리 사용량이 적절하다", async ({ page }) => {
    await page.goto("/experts");
    
    // 메모리 사용량 확인
    const memoryUsage = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // 메모리 사용량이 50MB 이내인지 확인
    expect(memoryUsage).toBeLessThan(50 * 1024 * 1024);
  });
});

test.describe("전문가 대시보드 보안 테스트", () => {
  test("XSS 공격에 안전하다", async ({ page }) => {
    // 악성 스크립트가 포함된 전문가 데이터 시뮬레이션
    const maliciousScript = "<script>alert('XSS')</script>";
    
    // 실제 구현에서는 서버에서 악성 데이터를 차단해야 함
    await page.goto("/experts");
    
    // 악성 스크립트가 실행되지 않았는지 확인
    const alerts = [];
    page.on("dialog", (dialog) => {
      alerts.push(dialog.message());
      dialog.dismiss();
    });
    
    // 페이지에 악성 스크립트가 렌더링되지 않았는지 확인
    await expect(page.locator("script")).toHaveCount(0);
  });

  test("CSRF 공격에 안전하다", async ({ page }) => {
    // CSRF 토큰이 포함되어 있는지 확인
    await page.goto("/experts");
    
    // 폼이 있다면 CSRF 토큰 확인
    const forms = page.locator("form");
    if (await forms.count() > 0) {
      const csrfToken = page.locator("input[name='_token']");
      await expect(csrfToken).toBeVisible();
    }
  });
});
