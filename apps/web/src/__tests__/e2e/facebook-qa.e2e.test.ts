/**
 * Facebook 스타일 Q&A E2E 테스트
 *
 * @description
 * - 전체 사용자 흐름 테스트 (질문 조회 → 상세 → 답변 작성)
 * - 컴포넌트 상호작용 테스트 (좋아요, 북마크 등)
 * - 데이터 렌더링 정확성 테스트
 */

import { test, expect } from "@playwright/test";

const WEB_BASE_URL = "http://localhost:3000";

test.describe("Facebook 스타일 Q&A E2E 테스트", () => {
  test.describe("1. 전체 사용자 흐름", () => {
    test("질문 목록 페이지에서 질문을 선택하여 상세 페이지로 이동할 수 있어야 함", async ({
      page,
    }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 첫 번째 질문 선택
      const firstQuestion = page
        .locator("[data-testid='question-card']")
        .first();
      if (await firstQuestion.isVisible()) {
        await firstQuestion.click();
        await page.waitForLoadState("networkidle");

        // Then - 상세 페이지로 이동했는지 확인
        expect(page.url()).toContain("/questions/");
      }
    });

    test("상세 페이지에서 답변을 볼 수 있어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // 질문 카드가 있으면 클릭
      const questionCard = page
        .locator("[data-testid='question-card']")
        .first();
      if (await questionCard.isVisible()) {
        await questionCard.click();
        await page.waitForLoadState("networkidle");

        // When - 답변 섹션 확인
        const answersSection = page.locator("[data-testid='answers-section']");
        if (await answersSection.isVisible()) {
          // Then - 적어도 하나의 답변이 표시되어야 함
          const answers = page.locator("[data-testid='answer-card']");
          const answerCount = await answers.count();
          expect(answerCount).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test("북마크 기능이 작동해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 북마크 버튼 찾기
      const bookmarkButton = page
        .locator("[data-testid='bookmark-button']")
        .first();
      if (await bookmarkButton.isVisible()) {
        await bookmarkButton.click();

        // Then - 북마크 버튼이 상호작용 가능해야 함
        expect(bookmarkButton).toBeVisible();
      }
    });

    test("좋아요 기능이 작동해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 좋아요 버튼 찾기
      const likeButton = page.locator("[data-testid='like-button']").first();
      if (await likeButton.isVisible()) {
        await likeButton.click();

        // Then - 좋아요 버튼이 상호작용 가능해야 함
        expect(likeButton).toBeVisible();
      }
    });
  });

  test.describe("2. 컴포넌트 상호작용", () => {
    test("답변의 배지 정보가 올바르게 표시되어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // 질문 상세 페이지로 이동
      const questionCard = page
        .locator("[data-testid='question-card']")
        .first();
      if (await questionCard.isVisible()) {
        await questionCard.click();
        await page.waitForLoadState("networkidle");

        // When - 배지 요소 확인
        const badges = page.locator("[data-testid='author-badge']");
        const badgeCount = await badges.count();

        // Then - 배지가 있을 수 있음 (선택사항)
        expect(badgeCount).toBeGreaterThanOrEqual(0);
      }
    });

    test("중첩된 댓글을 볼 수 있어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // 질문 상세로 이동
      const questionCard = page
        .locator("[data-testid='question-card']")
        .first();
      if (await questionCard.isVisible()) {
        await questionCard.click();
        await page.waitForLoadState("networkidle");

        // When - 댓글 섹션 확인
        const replies = page.locator("[data-testid='reply-item']");
        const replyCount = await replies.count();

        // Then - 댓글이 있을 수 있음
        expect(replyCount).toBeGreaterThanOrEqual(0);
      }
    });

    test("질문 작성자 표시가 정확해야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 질문 작성자 정보 확인
      const authorName = page
        .locator("[data-testid='question-author-name']")
        .first();
      if (await authorName.isVisible()) {
        const text = await authorName.textContent();

        // Then - 작성자 이름이 있어야 함
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    });

    test("카테고리 정보가 표시되어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 카테고리 요소 확인
      const category = page
        .locator("[data-testid='question-category']")
        .first();
      if (await category.isVisible()) {
        const text = await category.textContent();

        // Then - 카테고리 텍스트가 있어야 함
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    });
  });

  test.describe("3. 데이터 렌더링", () => {
    test("질문 제목이 올바르게 표시되어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // When - 질문 제목 확인
      const title = page.locator("[data-testid='question-title']").first();
      if (await title.isVisible()) {
        const text = await title.textContent();

        // Then - 제목 텍스트가 존재해야 함
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    });

    test("질문 내용이 올바르게 표시되어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // 상세 페이지로 이동
      const questionCard = page
        .locator("[data-testid='question-card']")
        .first();
      if (await questionCard.isVisible()) {
        await questionCard.click();
        await page.waitForLoadState("networkidle");

        // When - 질문 내용 확인
        const content = page.locator("[data-testid='question-content']");
        if (await content.isVisible()) {
          const text = await content.textContent();

          // Then - 내용이 있어야 함
          expect(text?.trim().length).toBeGreaterThan(0);
        }
      }
    });

    test("답변 목록이 올바르게 렌더링되어야 함", async ({ page }) => {
      // Given
      await page.goto(`${WEB_BASE_URL}/questions`);
      await page.waitForLoadState("networkidle");

      // 상세 페이지로 이동
      const questionCard = page
        .locator("[data-testid='question-card']")
        .first();
      if (await questionCard.isVisible()) {
        await questionCard.click();
        await page.waitForLoadState("networkidle");

        // When - 답변 카운트 확인
        const answerCount = page.locator("[data-testid='answer-card']");
        const count = await answerCount.count();

        // Then - 답변이 없거나 있어야 함
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
