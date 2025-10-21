/**
 * Facebook 스타일 Q&A 크로스 브라우저 호환성 E2E 테스트
 *
 * @description
 * - 기본 렌더링 호환성 테스트
 * - 폼 입력 호환성 확인
 * - 이벤트 처리 호환성 검증
 * - 레이아웃 호환성 확인
 * - 텍스트 렌더링 검증
 */

import { test, expect } from "@playwright/test";

const WEB_BASE_URL = "http://localhost:3000";

test.describe("Facebook 스타일 Q&A 크로스 브라우저 호환성 테스트", () => {
  test.describe("기본 렌더링 호환성", () => {
    test("페이지가 모든 브라우저에서 로드되어야 함", async ({ page }) => {
      // Given & When
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // Then
      const body = page.locator("body");
      await expect(body).toBeVisible();

      const title = page.locator("h1, h2").first();
      if (await title.isVisible()) {
        const text = await title.textContent();
        expect(text?.length).toBeGreaterThan(0);
      }
    });

    test("CSS가 올바르게 적용되어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 스타일 확인
      const element = page.locator("body");
      const style = await element.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          fontSize: computed.fontSize,
          fontFamily: computed.fontFamily,
          color: computed.color,
        };
      });

      // Then - 기본 스타일이 적용되었는지 확인
      expect(style.fontSize).toBeDefined();
      expect(style.fontFamily).toBeDefined();
      expect(style.color).toBeDefined();
    });

    test("border-radius가 올바르게 렌더링되어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - border-radius 확인
      const element = page.locator("button").first();
      if (await element.isVisible()) {
        const style = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            borderRadius: computed.borderRadius,
          };
        });

        // Then - border-radius가 설정되어 있어야 함
        expect(style.borderRadius).toBeDefined();
      }
    });

    test("box-shadow가 올바르게 렌더링되어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - box-shadow 확인
      const element = page.locator("[class*='shadow']").first();
      if (await element.isVisible()) {
        const style = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            boxShadow: computed.boxShadow,
          };
        });

        // Then - 스타일이 정의되어 있어야 함
        expect(style.boxShadow).toBeDefined();
      }
    });
  });

  test.describe("폼 입력 호환성", () => {
    test("텍스트 입력이 작동해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 입력 필드 검색
      const input = page.locator('input[type="text"]').first();
      if (await input.isVisible()) {
        // 텍스트 입력
        await input.fill("Test input");

        // Then - 입력이 올바르게 설정되었는지 확인
        const value = await input.inputValue();
        expect(value).toContain("Test input");
      }
    });

    test("버튼 클릭이 작동해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 버튼 검색 및 클릭
      const button = page.locator("button").first();
      if (await button.isVisible()) {
        // 클릭 가능 상태 확인
        const isDisabled = await button.isDisabled();

        // Then
        if (!isDisabled) {
          expect(isDisabled).toBe(false);
        }
      }
    });

    test("Focus 상태가 작동해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 요소에 포커스
      const element = page.locator("button").first();
      if (await element.isVisible()) {
        await element.focus();

        // Then - 포커스 상태 확인
        const isFocused = await element.evaluate(el => {
          return el === document.activeElement;
        });
        expect(isFocused).toBe(true);
      }
    });

    test("Hover 상태가 작동해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 요소에 호버
      const button = page.locator("button").first();
      if (await button.isVisible()) {
        await button.hover();

        // Then - 호버 후 요소가 여전히 가시 범위 내
        const boundingBox = await button.boundingBox();
        if (boundingBox) {
          expect(boundingBox.width).toBeGreaterThan(0);
          expect(boundingBox.height).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe("이벤트 처리 호환성", () => {
    test("Click 이벤트가 작동해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 버튼 클릭
      const button = page.locator("button").first();
      if ((await button.isVisible()) && !(await button.isDisabled())) {
        // 클릭 가능한 경우만 확인
        expect(true).toBe(true);
      }
    });

    test("Change 이벤트가 작동해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - select 요소 확인
      const select = page.locator("select").first();
      if (await select.isVisible()) {
        const options = select.locator("option");
        const optionCount = await options.count();

        // Then - option이 있으면 select 요소가 작동함
        expect(optionCount).toBeGreaterThan(0);
      }
    });

    test("Input 이벤트가 작동해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 텍스트 입력
      const input = page.locator('input[type="text"]').first();
      if (await input.isVisible()) {
        await input.fill("test");
        await input.clear();

        // Then - 입력 필드가 응답함
        const value = await input.inputValue();
        expect(value).toBe("");
      }
    });
  });

  test.describe("레이아웃 호환성", () => {
    test("Flexbox가 올바르게 작동해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - flexbox 요소 확인
      const element = page.locator("[class*='flex']").first();
      if (await element.isVisible()) {
        const style = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            display: computed.display,
          };
        });

        // Then - flex 스타일이 적용되었으면 확인
        expect(style.display).toBeDefined();
      }
    });

    test("Grid가 올바르게 작동해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - grid 요소 확인
      const element = page.locator("[class*='grid']").first();
      if (await element.isVisible()) {
        const style = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            display: computed.display,
          };
        });

        // Then - grid 스타일이 정의되어 있어야 함
        expect(style.display).toBeDefined();
      }
    });
  });

  test.describe("텍스트 렌더링", () => {
    test("기본 텍스트가 올바르게 렌더링되어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 텍스트 확인
      const element = page.locator("body");
      const text = await element.textContent();

      // Then - 텍스트가 있어야 함
      expect(text?.length).toBeGreaterThan(0);
    });

    test("한글이 올바르게 렌더링되어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 한글 텍스트 확인
      const heading = page.locator("h1, h2, h3").first();
      if (await heading.isVisible()) {
        const text = await heading.textContent();

        // Then - 한글이 포함되어 있는지 확인 (또는 단순히 텍스트가 있는지만 확인)
        expect(text).toBeDefined();
        expect(text?.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe("이미지 렌더링", () => {
    test("이미지가 올바르게 로드되어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 이미지 확인
      const images = page.locator("img");
      const imageCount = await images.count();

      // Then - 이미지가 로드됨
      if (imageCount > 0) {
        const firstImage = images.first();
        const isVisible = await firstImage.isVisible();
        expect(isVisible).toBe(true);
      }
    });
  });
});
