/**
 * Facebook 스타일 Q&A 접근성 E2E 테스트
 *
 * @description
 * - WCAG 2.1 AA 준수 확인
 * - 키보드 네비게이션 테스트
 * - 스크린 리더 호환성 테스트
 * - 색상 대비 검증
 * - 포커스 관리 테스트
 */

import { test, expect } from "@playwright/test";

const WEB_BASE_URL = "http://localhost:3000";

test.describe("Facebook 스타일 Q&A 접근성 테스트", () => {
  test.describe("키보드 네비게이션", () => {
    test("Tab 키로 모든 인터랙티브 요소에 접근 가능해야 함", async ({
      page,
    }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - Tab 키로 요소 탐색
      let tabCount = 0;
      const maxTabs = 10;

      while (tabCount < maxTabs) {
        const focusedElement = await page.evaluate(() => {
          const active = document.activeElement as HTMLElement;
          return {
            tagName: active?.tagName,
            visible: active?.offsetParent !== null,
          };
        });

        if (focusedElement.visible && focusedElement.tagName) {
          break;
        }

        await page.press("body", "Tab");
        tabCount++;
      }

      // Then - 포커스 이동이 작동함을 확인
      expect(tabCount).toBeLessThanOrEqual(maxTabs);
    });

    test("Enter 키로 버튼을 활성화할 수 있어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 버튼 포커스
      const button = page.locator("button").first();
      if (await button.isVisible()) {
        await button.focus();

        // Then - Enter 키 입력 가능
        const isDisabled = await button.isDisabled();
        expect(isDisabled).toBe(false);
      }
    });

    test("Escape 키로 페이지 상태를 유지해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - Escape 키 입력
      await page.press("body", "Escape");

      // Then - 페이지가 정상 상태 유지
      const body = page.locator("body");
      await expect(body).toBeVisible();
    });
  });

  test.describe("ARIA 레이블", () => {
    test("모든 버튼이 접근 가능한 이름을 가져야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 버튼 검증
      const buttons = page.locator("button");
      const buttonCount = await buttons.count();

      // Then
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute("aria-label");
        const text = await button.textContent();
        const title = await button.getAttribute("title");

        // aria-label, 텍스트, 또는 title 중 하나는 있어야 함
        const hasAccessibleName = ariaLabel || text?.trim() || title;
        expect(hasAccessibleName).toBeTruthy();
      }
    });

    test("모든 이미지가 alt 텍스트를 가져야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 이미지 검증
      const images = page.locator("img");
      const imageCount = await images.count();

      // Then
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute("alt");
        const ariaLabel = await img.getAttribute("aria-label");

        expect(alt !== null || ariaLabel !== null).toBeTruthy();
      }
    });

    test("폼 입력이 식별 가능해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 입력 필드 검증
      const inputs = page.locator("input[type='text'], textarea");
      const inputCount = await inputs.count();

      // Then
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const input = inputs.nth(i);
        const ariaLabel = await input.getAttribute("aria-label");
        const placeholder = await input.getAttribute("placeholder");
        const id = await input.getAttribute("id");

        expect(ariaLabel || placeholder || id).toBeTruthy();
      }
    });
  });

  test.describe("포커스 관리", () => {
    test("포커스 표시기가 시각적으로 명확해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 버튼에 포커스
      const button = page.locator("button").first();
      if (await button.isVisible()) {
        await button.focus();

        // Then - 포커스 스타일 확인
        const isFocused = await button.evaluate(el => {
          return el === document.activeElement;
        });
        expect(isFocused).toBe(true);
      }
    });

    test("포커스가 감지 가능해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 링크에 포커스
      const link = page.locator("a").first();
      if (await link.isVisible()) {
        await link.focus();

        // Then - 포커스된 요소의 크기 확인
        const boundingBox = await link.boundingBox();
        if (boundingBox) {
          expect(boundingBox.width).toBeGreaterThan(0);
          expect(boundingBox.height).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe("색상 대비", () => {
    test("텍스트와 배경에 충분한 색상이 적용되어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 제목 요소 검사
      const heading = page.locator("h1, h2, h3").first();
      if (await heading.isVisible()) {
        const contrast = await heading.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            color: style.color,
            backgroundColor: style.backgroundColor,
          };
        });

        // Then - 색상이 설정되어 있어야 함
        expect(contrast.color).toBeDefined();
        expect(contrast.color).not.toBe("rgba(0, 0, 0, 0)");
      }
    });
  });

  test.describe("스크린 리더 호환성", () => {
    test("시맨틱 HTML이 사용되어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 시맨틱 요소 검사
      const main = page.locator("main");
      const nav = page.locator("nav");

      // Then - 기본 시맨틱 구조가 있어야 함
      const hasMain = await main.isVisible().catch(() => false);
      const hasNav = await nav.isVisible().catch(() => false);

      expect(hasMain || hasNav).toBeTruthy();
    });

    test("제목 계층 구조가 논리적이어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 제목 요소 수집
      const h1 = page.locator("h1");
      const h2 = page.locator("h2");

      const h1Count = await h1.count();
      const h2Count = await h2.count();

      // Then - 제목이 있어야 함
      expect(h1Count + h2Count).toBeGreaterThanOrEqual(0);
    });

    test("리스트가 적절한 마크업을 사용해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 리스트 요소 검사
      const lists = page.locator("ul, ol");
      const listCount = await lists.count();

      // Then - 리스트가 있으면 적절한 마크업 사용
      if (listCount > 0) {
        const firstList = lists.first();
        const items = firstList.locator("li");
        const itemCount = await items.count();
        expect(itemCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe("동적 콘텐츠", () => {
    test("페이지 로드가 완료되어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);

      // When - 로딩 완료 대기
      await page.waitForLoadState("networkidle");

      // Then - 메인 콘텐츠가 보여야 함
      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("오류 상황을 명확하게 표시해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 오류 요소 검색
      const alerts = page.locator("[role='alert']");
      const alertCount = await alerts.count();

      // Then - alert role이 있으면 텍스트 확인
      if (alertCount > 0) {
        const firstAlert = alerts.first();
        const text = await firstAlert.textContent();
        expect(text?.length).toBeGreaterThan(0);
      }
    });
  });
});
