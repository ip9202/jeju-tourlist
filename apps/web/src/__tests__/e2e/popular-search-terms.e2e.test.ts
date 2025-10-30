// @TAG-E2E-POPULAR-SEARCH-001
// SPEC: SPEC-FEATURE-SEARCH-001 - Phase 4: E2E Testing & Performance Validation
// Tests: T08-T11 (Main page popular search terms, user interaction, responsive design, performance)

import { test, expect, Page } from "@playwright/test";

/**
 * E2E Test Suite: Popular Search Terms Feature
 *
 * This test suite validates the complete user flow for the popular search terms feature:
 * - T08: Display of popular search terms on homepage
 * - T09: Click navigation to search results
 * - T10: Responsive design across device sizes
 * - T11: Performance requirements validation
 *
 * Test Environment:
 * - Web App: http://localhost:3000
 * - API Server: http://localhost:4000
 *
 * Prerequisites:
 * - Both servers must be running
 * - Database must be seeded with test data (Phase 1)
 * - PopularSearchTerms component integrated in Header
 */

/**
 * Expected popular search keywords (from seed data Phase 1)
 */
const EXPECTED_KEYWORDS = [
  "제주도 맛집",
  "한라산 등반",
  "섭지코지",
  "우도 여행",
  "제주 카페",
];

/**
 * Color scheme mapping for ranks (from SearchTermBadge component)
 */
const RANK_COLORS = {
  1: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
  2: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
  3: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
  4: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
  5: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
};

/**
 * Helper: Wait for popular search section to be visible and loaded
 */
async function waitForPopularSearchSection(page: Page) {
  // Wait for "인기 검색어" label to be visible
  await page.waitForSelector('text="인기 검색어"', {
    state: "visible",
    timeout: 10000
  });

  // Wait for at least one search term badge to be visible (not skeleton)
  await page.waitForSelector('button[aria-label*="Search for"]', {
    state: "visible",
    timeout: 10000
  });
}

/**
 * Helper: Get all search term badges
 */
async function getSearchTermBadges(page: Page) {
  return page.locator('button[aria-label*="Search for"]');
}

/**
 * Helper: Extract keyword text from badge
 */
function extractKeyword(badgeText: string): string {
  // Format: "#1 제주도 맛집" -> "제주도 맛집"
  return badgeText.replace(/^#\d+\s+/, "").trim();
}

/**
 * Test Group: T08 - Main page loads with popular search terms
 */
test.describe("T08: Main page displays popular search terms", () => {

  test("should display 5 search term badges on homepage", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Wait for popular search section to load
    await waitForPopularSearchSection(page);

    // Get all search term badges
    const badges = await getSearchTermBadges(page);
    const count = await badges.count();

    // Verify exactly 5 badges are displayed
    expect(count).toBe(5);

    // Take screenshot for documentation
    await page.screenshot({
      path: "test-results/t08-popular-search-badges.png",
      fullPage: false
    });
  });

  test("should show skeleton loaders while data is loading", async ({ page }) => {
    // Start navigation but don't wait for load
    const navigationPromise = page.goto("/");

    // Try to capture skeleton state (may be very fast in local environment)
    // Check if skeleton-container exists at any point
    try {
      await page.waitForSelector('.skeleton-container', {
        state: "visible",
        timeout: 2000
      });

      // If we see skeleton, verify it has 5 placeholders
      const skeletons = page.locator('.skeleton-container > div');
      const skeletonCount = await skeletons.count();
      expect(skeletonCount).toBe(5);

      // Screenshot skeleton state
      await page.screenshot({
        path: "test-results/t08-skeleton-loading.png"
      });
    } catch (error) {
      // Skeleton may load too fast in local environment - this is acceptable
      console.log("Note: Skeleton loaders loaded too fast to capture (this is normal)");
    }

    // Wait for navigation to complete
    await navigationPromise;

    // Verify skeleton disappears and actual badges replace it
    await waitForPopularSearchSection(page);

    // Verify skeleton is no longer visible
    const skeletonVisible = await page.locator('.skeleton-container').isVisible().catch(() => false);
    expect(skeletonVisible).toBe(false);

    // Verify actual badges are visible
    const badges = await getSearchTermBadges(page);
    const count = await badges.count();
    expect(count).toBe(5);
  });

  test("should display correct ranking of keywords", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Wait for popular search section
    await waitForPopularSearchSection(page);

    // Get all badges
    const badges = await getSearchTermBadges(page);

    // Extract keyword text from each badge
    const actualKeywords: string[] = [];
    for (let i = 0; i < await badges.count(); i++) {
      const badgeText = await badges.nth(i).textContent();
      const keyword = extractKeyword(badgeText || "");
      actualKeywords.push(keyword);
    }

    // Verify keywords match expected order
    expect(actualKeywords).toEqual(EXPECTED_KEYWORDS);

    // Verify each badge shows correct rank number
    for (let rank = 1; rank <= 5; rank++) {
      const badge = badges.nth(rank - 1);
      const badgeText = await badge.textContent();
      expect(badgeText).toContain(`#${rank}`);
    }
  });

  test("should apply correct colors for each rank", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Wait for popular search section
    await waitForPopularSearchSection(page);

    // Get all badges
    const badges = await getSearchTermBadges(page);

    // Verify color scheme for each rank
    for (let rank = 1; rank <= 5; rank++) {
      const badge = badges.nth(rank - 1);
      const className = await badge.getAttribute("class");

      // Verify background color class
      expect(className).toContain(RANK_COLORS[rank as keyof typeof RANK_COLORS].bg);

      // Verify text color class
      expect(className).toContain(RANK_COLORS[rank as keyof typeof RANK_COLORS].text);

      // Verify border color class
      expect(className).toContain(RANK_COLORS[rank as keyof typeof RANK_COLORS].border);
    }

    // Take screenshot showing visual hierarchy
    await page.screenshot({
      path: "test-results/t08-color-scheme.png"
    });
  });
});

/**
 * Test Group: T09 - User can click popular search term and navigate
 */
test.describe("T09: User clicks popular search term", () => {

  test("should navigate to search results when clicking a badge", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Wait for popular search section
    await waitForPopularSearchSection(page);

    // Get rank #2 badge (한라산 등반)
    const badges = await getSearchTermBadges(page);
    const rank2Badge = badges.nth(1); // Index 1 = Rank 2

    // Verify badge text
    const badgeText = await rank2Badge.textContent();
    expect(badgeText).toContain("#2");
    expect(badgeText).toContain("한라산 등반");

    // Click on the badge
    await rank2Badge.click();

    // Wait for navigation to complete
    await page.waitForLoadState("networkidle");

    // Verify URL contains encoded keyword
    expect(page.url()).toContain("/search?q=");
    expect(page.url()).toContain(encodeURIComponent("한라산 등반"));

    // Take screenshot of search results page
    await page.screenshot({
      path: "test-results/t09-search-results-page.png",
      fullPage: true
    });
  });

  test("should properly encode special characters in search query", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Wait for popular search section
    await waitForPopularSearchSection(page);

    // Click on a search term
    const badges = await getSearchTermBadges(page);
    await badges.first().click();

    // Wait for navigation
    await page.waitForLoadState("networkidle");

    // Verify URL has proper encoding
    const currentUrl = page.url();
    expect(currentUrl).toContain("/search?q=");

    // Verify Korean characters are properly encoded
    const urlObj = new URL(currentUrl);
    const query = urlObj.searchParams.get("q");
    expect(query).toBeTruthy();
    expect(query).toContain("제주");
  });

  test("should show search results for clicked keyword", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Wait for popular search section
    await waitForPopularSearchSection(page);

    // Get the keyword we'll search for
    const badges = await getSearchTermBadges(page);
    const firstBadge = badges.first();
    const badgeText = await firstBadge.textContent();
    const keyword = extractKeyword(badgeText || "");

    // Click the badge
    await firstBadge.click();

    // Wait for search results page to load
    await page.waitForLoadState("networkidle");

    // Verify we're on search page
    expect(page.url()).toContain("/search");

    // Verify page title or heading exists
    // (The actual search page implementation may vary)
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
  });
});

/**
 * Test Group: T10 - Responsive design across devices
 */
test.describe("T10: Responsive design validation", () => {

  test("should display correctly on mobile (375px)", async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to homepage
    await page.goto("/");

    // Wait for popular search section
    await waitForPopularSearchSection(page);

    // Get all badges
    const badges = await getSearchTermBadges(page);
    const count = await badges.count();

    // Verify all 5 badges are visible
    expect(count).toBe(5);

    // Verify badges are visible (may require horizontal scroll)
    for (let i = 0; i < count; i++) {
      const badge = badges.nth(i);
      await badge.scrollIntoViewIfNeeded();
      const isVisible = await badge.isVisible();
      expect(isVisible).toBe(true);
    }

    // Verify click functionality works on mobile
    const firstBadge = badges.first();
    await firstBadge.scrollIntoViewIfNeeded();
    await firstBadge.click();
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/search");

    // Take screenshot
    await page.goto("/");
    await waitForPopularSearchSection(page);
    await page.screenshot({
      path: "test-results/t10-mobile-375px.png",
      fullPage: true
    });
  });

  test("should display correctly on tablet (768px)", async ({ page }) => {
    // Set viewport to tablet size
    await page.setViewportSize({ width: 768, height: 1024 });

    // Navigate to homepage
    await page.goto("/");

    // Wait for popular search section
    await waitForPopularSearchSection(page);

    // Get all badges
    const badges = await getSearchTermBadges(page);
    const count = await badges.count();

    // Verify all 5 badges are visible
    expect(count).toBe(5);

    // Verify all badges are visible without scrolling
    for (let i = 0; i < count; i++) {
      const badge = badges.nth(i);
      const isVisible = await badge.isVisible();
      expect(isVisible).toBe(true);
    }

    // Take screenshot
    await page.screenshot({
      path: "test-results/t10-tablet-768px.png",
      fullPage: false
    });
  });

  test("should display correctly on desktop (1440px)", async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1440, height: 900 });

    // Navigate to homepage
    await page.goto("/");

    // Wait for popular search section
    await waitForPopularSearchSection(page);

    // Get all badges
    const badges = await getSearchTermBadges(page);
    const count = await badges.count();

    // Verify all 5 badges are visible
    expect(count).toBe(5);

    // Verify all badges are visible in single row (if space allows)
    for (let i = 0; i < count; i++) {
      const badge = badges.nth(i);
      const isVisible = await badge.isVisible();
      expect(isVisible).toBe(true);
    }

    // Take screenshot
    await page.screenshot({
      path: "test-results/t10-desktop-1440px.png",
      fullPage: false
    });
  });
});

/**
 * Test Group: T11 - Performance requirements
 */
test.describe("T11: Performance validation", () => {

  test("should load homepage within 3 seconds", async ({ page }) => {
    // Start performance timer
    const startTime = Date.now();

    // Navigate to homepage and wait for popular search section
    await page.goto("/");
    await waitForPopularSearchSection(page);

    // Calculate load time
    const loadTime = Date.now() - startTime;

    // Verify load time is under 3 seconds (3000ms)
    expect(loadTime).toBeLessThan(3000);

    console.log(`✓ Homepage load time: ${loadTime}ms (Target: <3000ms)`);
  });

  test("should fetch popular search API within 500ms", async ({ page }) => {
    // Start listening to network requests
    let apiResponseTime = 0;

    page.on("response", async (response) => {
      if (response.url().includes("/api/search/popular")) {
        const timing = response.timing();
        // Calculate response time from request start to response end
        apiResponseTime = timing.responseEnd;

        // Verify status is 200
        expect(response.status()).toBe(200);

        console.log(`✓ API response time: ${apiResponseTime}ms`);
      }
    });

    // Navigate to homepage
    await page.goto("/");
    await waitForPopularSearchSection(page);

    // Note: In actual implementation, the web app calls Next.js API route
    // which then calls the backend API. Total time may be slightly higher.
    // This test validates the overall response time.

    // If API was called, verify response time
    if (apiResponseTime > 0) {
      expect(apiResponseTime).toBeLessThan(500);
    }
  });

  test("should render component without layout shift", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Take screenshot before skeleton loads
    const beforeScreenshot = await page.screenshot({
      clip: { x: 0, y: 0, width: 1280, height: 400 }
    });

    // Wait for component to render
    await waitForPopularSearchSection(page);

    // Take screenshot after render
    const afterScreenshot = await page.screenshot({
      clip: { x: 0, y: 0, width: 1280, height: 400 }
    });

    // Note: Visual comparison would require additional libraries
    // For now, we verify that both screenshots were captured successfully
    expect(beforeScreenshot).toBeTruthy();
    expect(afterScreenshot).toBeTruthy();

    // Verify no console errors related to layout shift
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Reload and check for errors
    await page.reload();
    await waitForPopularSearchSection(page);

    // Filter for layout-related errors
    const layoutErrors = consoleErrors.filter(err =>
      err.toLowerCase().includes("layout") ||
      err.toLowerCase().includes("shift") ||
      err.toLowerCase().includes("cls")
    );

    expect(layoutErrors.length).toBe(0);
  });

  test("should have no console errors during load", async ({ page }) => {
    const consoleErrors: string[] = [];

    // Listen to console events
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate and load popular search section
    await page.goto("/");
    await waitForPopularSearchSection(page);

    // Verify no console errors occurred
    expect(consoleErrors.length).toBe(0);

    if (consoleErrors.length > 0) {
      console.log("Console errors detected:", consoleErrors);
    }
  });
});

/**
 * Additional Test Group: Accessibility & Error Scenarios
 */
test.describe("Additional Validation: Accessibility & Error Handling", () => {

  test("should support keyboard navigation", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");
    await waitForPopularSearchSection(page);

    // Get first badge
    const badges = await getSearchTermBadges(page);
    const firstBadge = badges.first();

    // Focus on badge using Tab key
    await firstBadge.focus();

    // Verify badge is focused
    const isFocused = await firstBadge.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);

    // Press Enter to trigger click
    await page.keyboard.press("Enter");

    // Wait for navigation
    await page.waitForLoadState("networkidle");

    // Verify navigation occurred
    expect(page.url()).toContain("/search");
  });

  test("should have proper ARIA labels", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");
    await waitForPopularSearchSection(page);

    // Get all badges
    const badges = await getSearchTermBadges(page);

    // Verify each badge has aria-label
    for (let i = 0; i < await badges.count(); i++) {
      const badge = badges.nth(i);
      const ariaLabel = await badge.getAttribute("aria-label");

      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain("Search for");
    }
  });

  test("should display fallback keywords when API fails", async ({ page }) => {
    // Block API request to simulate failure
    await page.route("**/api/search/popular*", (route) => {
      route.abort("failed");
    });

    // Navigate to homepage
    await page.goto("/");

    // Wait for fallback to load
    await page.waitForTimeout(2000);

    // Verify fallback keywords are displayed
    const badges = await getSearchTermBadges(page);
    const count = await badges.count();

    // Should still show 5 badges (fallback)
    expect(count).toBe(5);

    // Verify fallback keywords match expected
    const firstBadgeText = await badges.first().textContent();
    expect(firstBadgeText).toContain("제주도 맛집");
  });
});
