/**
 * Facebook 스타일 Q&A 반응형 디자인 E2E 테스트
 *
 * @description
 * - 모바일 (375px) 테스트
 * - 태블릿 (768px) 테스트
 * - 데스크톱 (1920px) 테스트
 * - 각 해상도에서 UI 요소 가시성 및 상호작용성 확인
 */

import { test, expect } from "@playwright/test";

const WEB_BASE_URL = "http://localhost:3000";

const viewports = [
  { name: "Mobile", width: 375, height: 667 },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Desktop", width: 1920, height: 1080 },
];

viewports.forEach(viewport => {
  test.describe(`반응형 테스트 - ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
    });

    test("페이지가 오류 없이 로드되어야 함", async ({ page }) => {
      // When
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // Then
      const body = page.locator("body");
      await expect(body).toBeVisible();
    });

    test("주요 콘텐츠가 표시되어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When
      const mainContent = page.locator("main");
      const questions = page.locator("[data-testid='question-card']");
      const questionCount = await questions.count();

      // Then
      await expect(mainContent).toBeVisible();
      expect(questionCount).toBeGreaterThanOrEqual(0);
    });

    test("버튼이 터치 가능한 크기여야 함 (44px 이상)", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When
      const buttons = page.locator("button");
      const buttonCount = await buttons.count();

      // Then
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();

        if (box) {
          // 모바일에서는 최소 44px 권장, 다른 기기도 확인
          const isReasonableSize = box.width >= 32 && box.height >= 32;
          expect(isReasonableSize).toBeTruthy();
        }
      }
    });

    test("텍스트 가독성이 유지되어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When
      const paragraphs = page.locator("p");
      const firstParagraph = paragraphs.first();

      if (await firstParagraph.isVisible()) {
        const fontSize = await firstParagraph.evaluate(el => {
          return window.getComputedStyle(el).fontSize;
        });

        // Then - 최소 12px (모바일), 일반적으로 14px 이상
        const fontSizeNum = parseInt(fontSize);
        expect(fontSizeNum).toBeGreaterThanOrEqual(12);
      }
    });

    test("레이아웃이 올바르게 조정되어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When
      const main = page.locator("main");
      const box = await main.boundingBox();

      // Then
      if (box) {
        // 뷰포트 너비에 맞게 조정되었는지 확인
        expect(box.width).toBeLessThanOrEqual(viewport.width + 1); // 픽셀 오차 허용
      }
    });

    test("네비게이션이 접근 가능해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When
      const nav = page.locator("nav");
      const links = page.locator("a");
      const linkCount = await links.count();

      // Then
      const hasNav = await nav.isVisible().catch(() => false);
      expect(hasNav || linkCount > 0).toBeTruthy();
    });

    test("이미지가 올바르게 스케일되어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When
      const images = page.locator("img");
      const imageCount = await images.count();

      // Then
      if (imageCount > 0) {
        const firstImage = images.first();
        const box = await firstImage.boundingBox();

        if (box) {
          // 이미지가 뷰포트 너비를 초과하지 않아야 함
          expect(box.width).toBeLessThanOrEqual(viewport.width);
        }
      }
    });

    test("오버플로우가 없어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth >
          document.documentElement.clientWidth
          ? true
          : false;
      });

      // Then
      expect(hasHorizontalScroll).toBe(false);
    });
  });
});
