// @TAG:TEST:ANSWER-INTERACTION-001-PHASE7-INSPECT
// Phase 7: Page Structure Inspection

import { test } from "@playwright/test";

const BASE_URL = "http://localhost:3000";
const QUESTION_ID = "cmhbvi9y400ossda2zjbif9ug";

test("inspect page structure", async ({ page }) => {
  try {
    await page.goto(`${BASE_URL}/questions/${QUESTION_ID}`, {
      timeout: 5000,
    });
  } catch {
    console.log("❌ Server not available");
    return;
  }

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("📋 PAGE STRUCTURE INSPECTION");
  console.log("═══════════════════════════════════════════════════════════\n");

  // 1. Check all buttons
  const buttons = page.locator("button");
  const buttonCount = await buttons.count();
  console.log(`✓ Found ${buttonCount} buttons`);

  for (let i = 0; i < Math.min(buttonCount, 15); i++) {
    const button = buttons.nth(i);
    const label = await button.getAttribute("aria-label").catch(() => null);
    const title = await button.getAttribute("title").catch(() => null);
    const text = await button.textContent().catch(() => null);

    if (label || title || text) {
      console.log(
        `  Button[${i}]: aria-label="${label}" | title="${title}" | text="${text?.trim()}"`
      );
    }
  }

  // 2. Check for specific aria-labels
  console.log("\n✓ Checking for key aria-labels:");
  const adoptLabels = ["답변 채택", "채택", "채택됨", "채택 취소"];
  for (const label of adoptLabels) {
    const count = await page.locator(`[aria-label="${label}"]`).count();
    if (count > 0) {
      console.log(`  ✓ Found ${count} element(s) with aria-label="${label}"`);
    }
  }

  // 3. Check for like/dislike
  console.log("\n✓ Checking for like/dislike labels:");
  const likeDislikeLabels = ["좋아요", "싫어요", "Like", "Dislike"];
  for (const label of likeDislikeLabels) {
    const count = await page.locator(`[aria-label="${label}"]`).count();
    if (count > 0) {
      console.log(`  ✓ Found ${count} element(s) with aria-label="${label}"`);
    }
  }

  // 4. Check page content length
  const content = await page.textContent("body");
  console.log(`\n✓ Page content: ${content?.length || 0} characters`);

  // 5. Look for specific text patterns
  const hasChecked = content?.includes("채택됨");
  const hasLike = content?.includes("좋아요");
  const hasAnswer = content?.includes("답변");

  console.log("\n✓ Content Patterns:");
  console.log(`  ${hasChecked ? "✓" : "✗"} Contains "채택됨"`);
  console.log(`  ${hasLike ? "✓" : "✗"} Contains "좋아요"`);
  console.log(`  ${hasAnswer ? "✓" : "✗"} Contains "답변"`);

  console.log(
    "\n═══════════════════════════════════════════════════════════\n"
  );
});
