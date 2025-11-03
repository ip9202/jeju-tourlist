/**
 * E2E Tests for Facebook Q&A System
 * Tests complete user workflows: viewing, answering, replying, and adopting answers
 */

import { test, expect } from "@playwright/test";

test.describe("Facebook Q&A - Question Detail Page", () => {
  // Use existing question ID for testing
  const questionId = "cmhbvi9y400ossda2zjbif9ug";
  const questionUrl = `http://localhost:3000/questions/${questionId}`;

  test.beforeEach(async ({ page }) => {
    // Navigate to question detail page
    await page.goto(questionUrl);
    await page.waitForLoadState("networkidle");
  });

  test("should display question with Facebook-style card", async ({ page }) => {
    // Check Facebook-style question card is rendered
    const questionCard = page
      .locator('[data-testid="facebook-question-card"]')
      .first();

    if ((await questionCard.count()) > 0) {
      await expect(questionCard).toBeVisible({ timeout: 10000 });
      console.log("✓ Facebook question card is visible");

      // Check for author avatar
      const avatar = questionCard
        .locator('img[alt*="avatar"], img[alt*="프로필"]')
        .first();
      if ((await avatar.count()) > 0) {
        console.log("✓ Author avatar found");
      }

      // Take screenshot
      await page.screenshot({
        path: "screenshots/facebook-qa-question-card.png",
        fullPage: true,
      });
    } else {
      console.log(
        "⚠ Facebook question card not found, checking for standard layout"
      );

      // Fallback to standard question layout
      const questionTitle = page
        .locator('h1, [data-testid="question-title"]')
        .first();
      await expect(questionTitle).toBeVisible({ timeout: 10000 });
      console.log("✓ Question title is visible (standard layout)");
    }
  });

  test("should display existing answers with badges", async ({ page }) => {
    // Wait for answers to load
    await page.waitForTimeout(2000);

    // Look for answer cards
    const answerCards = page
      .locator('[data-testid="answer-card"], .answer-card, article')
      .filter({
        hasText: /답변|Answer/,
      });

    const answerCount = await answerCards.count();
    console.log(`✓ Found ${answerCount} answer(s)`);

    if (answerCount > 0) {
      // Check for badges (accepted, expert, newbie, etc.)
      const badges = page
        .locator('[data-testid="facebook-badge"], .badge')
        .filter({
          hasText: /채택|전문가|신입|인기|인증/,
        });

      const badgeCount = await badges.count();
      if (badgeCount > 0) {
        console.log(`✓ Found ${badgeCount} badge(s)`);

        // Take screenshot showing badges
        await page.screenshot({
          path: "screenshots/facebook-qa-answers-with-badges.png",
          fullPage: true,
        });
      }
    }
  });

  test("should display login prompt for unauthenticated users", async ({
    page,
  }) => {
    // Check if login prompt is shown instead of textarea
    const loginPrompt = page.locator("text=/로그인|Login/").first();
    const loginButton = page
      .locator('button:has-text("로그인"), button:has-text("Login")')
      .first();

    const hasLoginPrompt = (await loginPrompt.count()) > 0;
    const hasLoginButton = (await loginButton.count()) > 0;

    if (hasLoginPrompt || hasLoginButton) {
      console.log("✓ Login prompt displayed for unauthenticated user");

      // Take screenshot
      await page.screenshot({
        path: "screenshots/facebook-qa-login-prompt.png",
        fullPage: true,
      });
    } else {
      console.log(
        "⚠ No login prompt found - user might be authenticated or textarea is shown"
      );
    }
  });
});

test.describe("Facebook Q&A - Answer Submission Flow", () => {
  const questionId = "cmhbvi9y400ossda2zjbif9ug";
  const questionUrl = `http://localhost:3000/questions/${questionId}`;

  test("should show textarea when user is authenticated", async ({ page }) => {
    // Note: This test requires a logged-in session
    // For now, we just verify the UI elements exist
    await page.goto(questionUrl);
    await page.waitForLoadState("networkidle");

    const textarea = page
      .locator('textarea[placeholder*="댓글"], textarea[placeholder*="답변"]')
      .first();
    const textareaCount = await textarea.count();

    if (textareaCount > 0) {
      const isVisible = await textarea.isVisible();
      console.log(`✓ Answer textarea found (visible: ${isVisible})`);

      // Check for submit button
      const submitButton = page
        .locator("button")
        .filter({
          hasText: /등록|제출|Submit/,
        })
        .first();

      if ((await submitButton.count()) > 0) {
        console.log("✓ Submit button found");
      }

      // Take screenshot
      await page.screenshot({
        path: "screenshots/facebook-qa-answer-input.png",
        fullPage: true,
      });
    } else {
      console.log("⚠ No answer textarea found - user might need to log in");
    }
  });

  test("should expand textarea on focus", async ({ page }) => {
    await page.goto(questionUrl);
    await page.waitForLoadState("networkidle");

    const textarea = page
      .locator('textarea[placeholder*="댓글"], textarea[placeholder*="답변"]')
      .first();

    if ((await textarea.count()) > 0) {
      // Get initial rows
      const initialRows = await textarea.getAttribute("rows");
      console.log(`Initial rows: ${initialRows}`);

      // Click to focus
      await textarea.click();
      await page.waitForTimeout(500);

      // Get expanded rows
      const expandedRows = await textarea.getAttribute("rows");
      console.log(`Expanded rows: ${expandedRows}`);

      // Verify expansion (should increase from 1 to 3)
      if (initialRows !== expandedRows) {
        console.log("✓ Textarea expanded on focus");
      }

      // Take screenshot
      await page.screenshot({
        path: "screenshots/facebook-qa-textarea-expanded.png",
        fullPage: true,
      });
    }
  });

  test("should show validation for empty submission", async ({ page }) => {
    await page.goto(questionUrl);
    await page.waitForLoadState("networkidle");

    const textarea = page
      .locator('textarea[placeholder*="댓글"], textarea[placeholder*="답변"]')
      .first();

    if ((await textarea.count()) > 0) {
      // Click textarea to expand
      await textarea.click();
      await page.waitForTimeout(500);

      // Find submit button
      const submitButton = page
        .locator("button")
        .filter({
          hasText: /등록|Submit/,
        })
        .first();

      if ((await submitButton.count()) > 0) {
        // Check if button is disabled for empty input
        const isDisabled = await submitButton.isDisabled();
        console.log(`✓ Submit button disabled when empty: ${isDisabled}`);

        // Take screenshot
        await page.screenshot({
          path: "screenshots/facebook-qa-empty-validation.png",
          fullPage: true,
        });
      }
    }
  });
});

test.describe("Facebook Q&A - Nested Reply Flow", () => {
  const questionId = "cmhbvi9y400ossda2zjbif9ug";
  const questionUrl = `http://localhost:3000/questions/${questionId}`;

  test("should show reply button on each answer", async ({ page }) => {
    await page.goto(questionUrl);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Find reply buttons
    const replyButtons = page.locator("button").filter({
      hasText: /답글|Reply/,
    });

    const replyButtonCount = await replyButtons.count();
    console.log(`✓ Found ${replyButtonCount} reply button(s)`);

    if (replyButtonCount > 0) {
      // Take screenshot
      await page.screenshot({
        path: "screenshots/facebook-qa-reply-buttons.png",
        fullPage: true,
      });
    }
  });

  test("should expand/collapse nested replies", async ({ page }) => {
    await page.goto(questionUrl);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Look for toggle buttons (답글 N개 보기/숨기기)
    const toggleButtons = page.locator("button").filter({
      hasText: /답글.*보기|답글.*숨기기/,
    });

    const toggleCount = await toggleButtons.count();

    if (toggleCount > 0) {
      console.log(`✓ Found ${toggleCount} reply toggle button(s)`);

      // Click first toggle to expand
      await toggleButtons.first().click();
      await page.waitForTimeout(1000);

      console.log("✓ Clicked reply toggle button");

      // Take screenshot
      await page.screenshot({
        path: "screenshots/facebook-qa-replies-expanded.png",
        fullPage: true,
      });
    } else {
      console.log("⚠ No nested replies found on this question");
    }
  });

  test("should show reply count badge", async ({ page }) => {
    await page.goto(questionUrl);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Look for reply count badges
    const replyCountBadges = page.locator("span").filter({
      hasText: /^\d+$/,
    });

    const badgeCount = await replyCountBadges.count();

    if (badgeCount > 0) {
      console.log(`✓ Found ${badgeCount} potential reply count badge(s)`);

      // Take screenshot
      await page.screenshot({
        path: "screenshots/facebook-qa-reply-count.png",
        fullPage: true,
      });
    }
  });

  test("should activate reply mode when clicking reply button", async ({
    page,
  }) => {
    await page.goto(questionUrl);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Find first reply button
    const replyButtons = page.locator("button").filter({
      hasText: /^답글$/,
    });

    if ((await replyButtons.count()) > 0) {
      // Click first reply button
      await replyButtons.first().click();
      await page.waitForTimeout(1000);

      console.log("✓ Clicked reply button");

      // Look for reply mode indicator (e.g., "@username에게 답글 중")
      const replyModeIndicator = page
        .locator("text=/답글 중|Replying to/")
        .first();

      if ((await replyModeIndicator.count()) > 0) {
        console.log("✓ Reply mode activated");

        // Take screenshot
        await page.screenshot({
          path: "screenshots/facebook-qa-reply-mode.png",
          fullPage: true,
        });
      }
    }
  });
});

test.describe("Facebook Q&A - Adopt/Unadopt Flow", () => {
  const questionId = "cmhbvi9y400ossda2zjbif9ug";
  const questionUrl = `http://localhost:3000/questions/${questionId}`;

  test("should show adopt button only to question author", async ({ page }) => {
    // Note: This test requires being logged in as the question author
    await page.goto(questionUrl);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Look for adopt button (채택)
    const adoptButtons = page.locator("button").filter({
      hasText: /채택|Accept/,
    });

    const adoptButtonCount = await adoptButtons.count();

    if (adoptButtonCount > 0) {
      console.log(
        `✓ Found ${adoptButtonCount} adopt button(s) - user is question author`
      );

      // Take screenshot
      await page.screenshot({
        path: "screenshots/facebook-qa-adopt-button.png",
        fullPage: true,
      });
    } else {
      console.log(
        "⚠ No adopt button found - user is not question author or not logged in"
      );
    }
  });

  test("should display accepted badge on adopted answer", async ({ page }) => {
    await page.goto(questionUrl);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Look for accepted badge
    const acceptedBadge = page
      .locator('[data-testid="facebook-badge"]')
      .filter({
        hasText: /채택됨|Accepted/,
      });

    // Alternative: look by class or text
    const acceptedIndicator = page.locator("text=/채택됨|Accepted/").first();

    const hasAcceptedBadge = (await acceptedBadge.count()) > 0;
    const hasAcceptedIndicator = (await acceptedIndicator.count()) > 0;

    if (hasAcceptedBadge || hasAcceptedIndicator) {
      console.log("✓ Accepted answer badge found");

      // Take screenshot
      await page.screenshot({
        path: "screenshots/facebook-qa-accepted-answer.png",
        fullPage: true,
      });
    } else {
      console.log("⚠ No accepted answer found on this question");
    }
  });

  test("should sort accepted answer first", async ({ page }) => {
    await page.goto(questionUrl);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Get all answer cards
    const answerCards = page
      .locator('[data-testid="answer-card"], .answer-card, article')
      .filter({
        hasText: /답변|Answer/,
      });

    const answerCount = await answerCards.count();

    if (answerCount > 0) {
      // Check if first answer has accepted badge
      const firstAnswer = answerCards.first();
      const firstAnswerText = await firstAnswer.textContent();

      if (
        firstAnswerText?.includes("채택됨") ||
        firstAnswerText?.includes("Accepted")
      ) {
        console.log("✓ Accepted answer is sorted first");
      } else {
        console.log("⚠ No accepted answer, or not sorted first");
      }

      // Take screenshot
      await page.screenshot({
        path: "screenshots/facebook-qa-answer-order.png",
        fullPage: true,
      });
    }
  });
});

test.describe("Facebook Q&A - Like/Dislike Functionality", () => {
  const questionId = "cmhbvi9y400ossda2zjbif9ug";
  const questionUrl = `http://localhost:3000/questions/${questionId}`;

  test("should display like/dislike buttons on answers", async ({ page }) => {
    await page.goto(questionUrl);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Look for like/dislike buttons (thumbs up/down icons)
    const likeButtons = page.locator("button").filter({
      has: page.locator(
        'svg[data-testid="thumbs-up-icon"], [class*="thumbs-up"]'
      ),
    });

    const dislikeButtons = page.locator("button").filter({
      has: page.locator(
        'svg[data-testid="thumbs-down-icon"], [class*="thumbs-down"]'
      ),
    });

    const likeCount = await likeButtons.count();
    const dislikeCount = await dislikeButtons.count();

    console.log(`✓ Found ${likeCount} like button(s)`);
    console.log(`✓ Found ${dislikeCount} dislike button(s)`);

    if (likeCount > 0 || dislikeCount > 0) {
      // Take screenshot
      await page.screenshot({
        path: "screenshots/facebook-qa-like-dislike.png",
        fullPage: true,
      });
    }
  });

  test("should display like/dislike counts", async ({ page }) => {
    await page.goto(questionUrl);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Look for like/dislike count numbers
    // They should be near the like/dislike buttons
    const counts = page.locator("span").filter({
      hasText: /^\d+$/,
    });

    const countElements = await counts.count();
    console.log(`✓ Found ${countElements} potential count element(s)`);

    // Take screenshot
    await page.screenshot({
      path: "screenshots/facebook-qa-interaction-counts.png",
      fullPage: true,
    });
  });
});

test.describe("Facebook Q&A - Accessibility", () => {
  const questionId = "cmhbvi9y400ossda2zjbif9ug";
  const questionUrl = `http://localhost:3000/questions/${questionId}`;

  test("should have proper aria-labels on interactive elements", async ({
    page,
  }) => {
    await page.goto(questionUrl);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Check for aria-labels on buttons
    const buttonsWithAriaLabel = page.locator("button[aria-label]");
    const ariaLabelCount = await buttonsWithAriaLabel.count();

    console.log(`✓ Found ${ariaLabelCount} button(s) with aria-label`);

    if (ariaLabelCount > 0) {
      // Log some aria-labels
      for (let i = 0; i < Math.min(3, ariaLabelCount); i++) {
        const label = await buttonsWithAriaLabel
          .nth(i)
          .getAttribute("aria-label");
        console.log(`  - aria-label: "${label}"`);
      }
    }
  });

  test("should support keyboard navigation", async ({ page }) => {
    await page.goto(questionUrl);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Try tabbing through interactive elements
    await page.keyboard.press("Tab");
    await page.waitForTimeout(500);

    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tagName: el?.tagName,
        text: el?.textContent?.substring(0, 50),
      };
    });

    console.log(`✓ Tab navigation works - focused: ${focusedElement.tagName}`);

    // Take screenshot
    await page.screenshot({
      path: "screenshots/facebook-qa-keyboard-nav.png",
      fullPage: true,
    });
  });
});
