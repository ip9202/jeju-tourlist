// @TEST:ANSWER-INTERACTION-001-E1
// SPEC: SPEC-ANSWER-INTERACTION-001 - Multiple Answer Adoption E2E Tests
// Tests: Answer adoption UI, completion badge, multiple adoptions

import { test, expect, Page } from "@playwright/test";

/**
 * E2E Test Suite: Multiple Answer Adoption Feature
 *
 * Purpose: Validate complete user flow for multiple answer adoptions
 * Test Scope:
 * - T-E1-01: Accept first answer shows completion badge in question list
 * - T-E1-02: Accept second answer maintains completion badge
 * - T-E1-03: Unaccept all answers removes completion badge
 * - T-E1-04: Completion badge styling with CheckCircle icon
 *
 * Test Environment:
 * - Web App: http://localhost:3000
 * - API Server: http://localhost:4000
 *
 * Prerequisites:
 * - Both servers must be running
 * - Database seeded with test questions and answers
 * - User authentication available
 */

/**
 * Test Data Setup
 */
const TEST_USER = {
  email: "test@example.com",
  password: "password123",
};

const TEST_QUESTION = {
  title: "제주도에서 가장 맛있는 흑돼지 맛집은 어디인가요?",
  content: "현지인 추천 맛집을 알려주세요.",
};

/**
 * Helper: Login as test user
 */
async function loginAsUser(page: Page) {
  await page.goto("/auth/login");

  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');

  // Wait for redirect to homepage
  await page.waitForURL("/", { timeout: 5000 });
}

/**
 * Helper: Create a test question
 */
async function createTestQuestion(page: Page) {
  await page.goto("/questions/new");

  await page.fill('input[name="title"]', TEST_QUESTION.title);
  await page.fill('textarea[name="content"]', TEST_QUESTION.content);
  await page.click('button[type="submit"]');

  // Wait for redirect to question detail page
  await page.waitForURL(/\/questions\/[\w-]+/, { timeout: 10000 });

  // Extract question ID from URL
  const url = page.url();
  const questionId = url.match(/\/questions\/([\w-]+)/)?.[1];

  return questionId;
}

/**
 * Helper: Add answer to question (as different user)
 */
async function addAnswerToQuestion(
  page: Page,
  questionId: string,
  answerContent: string
) {
  await page.goto(`/questions/${questionId}`);

  // Find answer textarea and fill it
  await page.fill('textarea[placeholder*="답변"]', answerContent);
  await page.click('button:has-text("답변 작성")');

  // Wait for answer to appear
  await page.waitForSelector(`text="${answerContent}"`, { timeout: 5000 });
}

/**
 * Helper: Check if completion badge exists in question list
 */
async function hasCompletionBadge(
  page: Page,
  questionTitle: string
): Promise<boolean> {
  await page.goto("/questions");

  // Find question card by title
  const questionCard = page.locator(`article:has-text("${questionTitle}")`);

  // Check for completion badge (CheckCircle icon or "해결됨" text)
  const badge = questionCard.locator(
    '[aria-label*="완료"], [aria-label*="해결"]'
  );
  const count = await badge.count();

  return count > 0;
}

/**
 * Test Group 1: Single Answer Adoption
 */
test.describe("Single Answer Adoption Flow", () => {
  test.skip("should show completion badge after accepting first answer", async ({
    page,
  }) => {
    // Setup: Login and create question
    await loginAsUser(page);
    const questionId = await createTestQuestion(page);

    if (!questionId) {
      throw new Error("Failed to create test question");
    }

    // Step 1: Add answer (as different user would do)
    // Note: In real scenario, you'd logout and login as different user
    await addAnswerToQuestion(
      page,
      questionId,
      "도남동에 있는 '돈사돈' 추천합니다!"
    );

    // Step 2: Accept the answer (as question author)
    await page.goto(`/questions/${questionId}`);

    // Find and click "채택" button on the answer
    const adoptButton = page.locator('button:has-text("채택")').first();
    await adoptButton.click();

    // Wait for adoption confirmation
    await page.waitForSelector('text="채택되었습니다"', { timeout: 5000 });

    // Step 3: Verify completion badge appears in question list
    const hasBadge = await hasCompletionBadge(page, TEST_QUESTION.title);
    expect(hasBadge).toBe(true);

    // Cleanup: Delete test question
    await page.goto(`/questions/${questionId}`);
    await page.click('button:has-text("삭제")');
    await page.click('button:has-text("확인")');
  });
});

/**
 * Test Group 2: Multiple Answer Adoption
 */
test.describe("Multiple Answer Adoption Flow", () => {
  test.skip("should maintain completion badge after accepting multiple answers", async ({
    page,
  }) => {
    // Setup: Login and create question
    await loginAsUser(page);
    const questionId = await createTestQuestion(page);

    if (!questionId) {
      throw new Error("Failed to create test question");
    }

    // Step 1: Add first answer
    await addAnswerToQuestion(page, questionId, "첫 번째 답변: 돈사돈 추천");

    // Step 2: Accept first answer
    await page.goto(`/questions/${questionId}`);
    let adoptButton = page.locator('button:has-text("채택")').first();
    await adoptButton.click();
    await page.waitForSelector('text="채택되었습니다"', { timeout: 5000 });

    // Step 3: Add second answer
    await addAnswerToQuestion(
      page,
      questionId,
      "두 번째 답변: 우진해장국 추천"
    );

    // Step 4: Accept second answer (should NOT unaccept first)
    await page.goto(`/questions/${questionId}`);
    adoptButton = page.locator('button:has-text("채택")').nth(1);
    await adoptButton.click();
    await page.waitForSelector('text="채택되었습니다"', { timeout: 5000 });

    // Step 5: Verify both answers show as accepted
    const acceptedBadges = page.locator('[aria-label*="채택된 답변"]');
    const count = await acceptedBadges.count();
    expect(count).toBe(2);

    // Step 6: Verify completion badge still shows in question list
    const hasBadge = await hasCompletionBadge(page, TEST_QUESTION.title);
    expect(hasBadge).toBe(true);

    // Cleanup
    await page.goto(`/questions/${questionId}`);
    await page.click('button:has-text("삭제")');
    await page.click('button:has-text("확인")');
  });
});

/**
 * Test Group 3: Completion Badge Behavior
 */
test.describe("Completion Badge Behavior", () => {
  test.skip("should remove completion badge after unaccepting all answers", async ({
    page,
  }) => {
    // Setup: Login and create question with accepted answers
    await loginAsUser(page);
    const questionId = await createTestQuestion(page);

    if (!questionId) {
      throw new Error("Failed to create test question");
    }

    // Add and accept first answer
    await addAnswerToQuestion(page, questionId, "답변 1");
    await page.goto(`/questions/${questionId}`);
    let adoptButton = page.locator('button:has-text("채택")').first();
    await adoptButton.click();
    await page.waitForSelector('text="채택되었습니다"', { timeout: 5000 });

    // Add and accept second answer
    await addAnswerToQuestion(page, questionId, "답변 2");
    await page.goto(`/questions/${questionId}`);
    adoptButton = page.locator('button:has-text("채택")').nth(1);
    await adoptButton.click();
    await page.waitForSelector('text="채택되었습니다"', { timeout: 5000 });

    // Verify badge exists
    let hasBadge = await hasCompletionBadge(page, TEST_QUESTION.title);
    expect(hasBadge).toBe(true);

    // Unaccept first answer
    await page.goto(`/questions/${questionId}`);
    let unacceptButton = page.locator('button:has-text("채택 해제")').first();
    await unacceptButton.click();
    await page.waitForSelector('text="채택 해제되었습니다"', { timeout: 5000 });

    // Badge should still exist (second answer still accepted)
    hasBadge = await hasCompletionBadge(page, TEST_QUESTION.title);
    expect(hasBadge).toBe(true);

    // Unaccept second answer
    await page.goto(`/questions/${questionId}`);
    unacceptButton = page.locator('button:has-text("채택 해제")').first();
    await unacceptButton.click();
    await page.waitForSelector('text="채택 해제되었습니다"', { timeout: 5000 });

    // Badge should now be removed (no accepted answers)
    hasBadge = await hasCompletionBadge(page, TEST_QUESTION.title);
    expect(hasBadge).toBe(false);

    // Cleanup
    await page.goto(`/questions/${questionId}`);
    await page.click('button:has-text("삭제")');
    await page.click('button:has-text("확인")');
  });
});

/**
 * Test Group 4: Visual Validation
 */
test.describe("Completion Badge Visual Validation", () => {
  test.skip("should display completion badge with green CheckCircle icon", async ({
    page,
  }) => {
    // Setup: Login and create question with accepted answer
    await loginAsUser(page);
    const questionId = await createTestQuestion(page);

    if (!questionId) {
      throw new Error("Failed to create test question");
    }

    // Add and accept answer
    await addAnswerToQuestion(page, questionId, "테스트 답변");
    await page.goto(`/questions/${questionId}`);
    const adoptButton = page.locator('button:has-text("채택")').first();
    await adoptButton.click();
    await page.waitForSelector('text="채택되었습니다"', { timeout: 5000 });

    // Navigate to question list
    await page.goto("/questions");

    // Find question card
    const questionCard = page.locator(
      `article:has-text("${TEST_QUESTION.title}")`
    );

    // Verify badge exists
    const badge = questionCard.locator(
      '[aria-label*="완료"], [aria-label*="해결"]'
    );
    await expect(badge).toBeVisible();

    // Verify green styling (CheckCircle icon should have green color)
    const badgeClasses = await badge.getAttribute("class");
    expect(badgeClasses).toContain("text-green");

    // Take screenshot for visual verification
    await page.screenshot({
      path: "e2e-screenshots/completion-badge.png",
      fullPage: false,
    });

    // Cleanup
    await page.goto(`/questions/${questionId}`);
    await page.click('button:has-text("삭제")');
    await page.click('button:has-text("확인")');
  });
});

/**
 * Test Group 5: Performance Validation
 */
test.describe("Performance Requirements", () => {
  test.skip("should load question list with completion badges in < 2 seconds", async ({
    page,
  }) => {
    await loginAsUser(page);

    const startTime = Date.now();
    await page.goto("/questions");
    await page.waitForSelector("article", { timeout: 10000 });
    const endTime = Date.now();

    const loadTime = endTime - startTime;

    // Verify load time is under 2000ms
    expect(loadTime).toBeLessThan(2000);
  });

  test.skip("should accept answer with API response < 500ms", async ({
    page,
  }) => {
    await loginAsUser(page);
    const questionId = await createTestQuestion(page);

    if (!questionId) {
      throw new Error("Failed to create test question");
    }

    await addAnswerToQuestion(page, questionId, "성능 테스트 답변");
    await page.goto(`/questions/${questionId}`);

    // Measure API response time
    const startTime = Date.now();
    const adoptButton = page.locator('button:has-text("채택")').first();
    await adoptButton.click();
    await page.waitForSelector('text="채택되었습니다"', { timeout: 5000 });
    const endTime = Date.now();

    const responseTime = endTime - startTime;

    // Verify response time is under 500ms
    expect(responseTime).toBeLessThan(500);

    // Cleanup
    await page.goto(`/questions/${questionId}`);
    await page.click('button:has-text("삭제")');
    await page.click('button:has-text("확인")');
  });
});
