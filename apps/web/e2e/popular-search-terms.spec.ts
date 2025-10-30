// @TAG-E2E-POPULAR-SEARCH-001
// SPEC: SPEC-FEATURE-SEARCH-001 - Phase 4: E2E Testing using fast-playwright MCP
// Tests: T08-T11 (Homepage popular search terms, user interaction, responsive design, performance)

/**
 * E2E Test Specification: Popular Search Terms Feature
 *
 * CRITICAL: This test suite uses fast-playwright MCP tools ONLY.
 * DO NOT use standard Playwright library (@playwright/test).
 *
 * Fast-Playwright MCP Tools Available:
 * - browser_navigate(url)
 * - browser_click(selectors)
 * - browser_wait_for(text or time)
 * - browser_find_elements(searchCriteria)
 * - browser_snapshot()
 * - browser_take_screenshot()
 * - browser_resize(width, height)
 * - browser_network_requests()
 *
 * Test Environment:
 * - Web App: http://localhost:3000
 * - API Server: http://localhost:4000
 *
 * Prerequisites:
 * - Both servers running
 * - Database seeded with Phase 1 test data
 * - PopularSearchTerms component integrated in Header
 */

/**
 * Expected Test Data (from seed Phase 1)
 */
const EXPECTED_KEYWORDS = [
  "제주도 맛집",    // Rank #1 (Red)
  "한라산 등반",    // Rank #2 (Orange)
  "섭지코지",       // Rank #3 (Amber)
  "우도 여행",      // Rank #4 (Yellow)
  "제주 카페",      // Rank #5 (Blue)
];

/**
 * Color Scheme by Rank
 */
const RANK_COLORS = {
  1: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
  2: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
  3: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
  4: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
  5: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST SCENARIO 1: T08 - Homepage displays popular search terms
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Test T08.1: Display 5 search term badges
 *
 * Fast-Playwright MCP Execution Steps:
 *
 * 1. browser_navigate("http://localhost:3000")
 *    - Navigate to homepage
 *
 * 2. browser_wait_for({ text: "제주도 맛집" })
 *    - Wait for first popular search term to appear
 *    - Indicates data has loaded
 *
 * 3. browser_find_elements({ role: "button" })
 *    - Find all button elements (SearchTermBadge components)
 *    - Filter to only those with aria-label containing "Search for"
 *
 * 4. Verify count === 5
 *    - Check that exactly 5 badges were found
 *
 * 5. Verify order matches EXPECTED_KEYWORDS
 *    - Extract text from each badge
 *    - Remove "#1", "#2", etc. prefix
 *    - Compare with expected keyword array
 *
 * 6. browser_take_screenshot({ path: "t08.1-five-badges.png" })
 *    - Capture visual evidence
 *
 * Expected Result:
 * ✅ 5 badges displayed
 * ✅ Order: 제주도 맛집, 한라산 등반, 섭지코지, 우도 여행, 제주 카페
 * ✅ Screenshot shows all badges visible
 */

/**
 * Test T08.2: Verify color scheme by rank
 *
 * Fast-Playwright MCP Execution Steps:
 *
 * 1. browser_navigate("http://localhost:3000")
 *    - Navigate to homepage
 *
 * 2. browser_wait_for({ text: "인기 검색어" })
 *    - Wait for popular search section label
 *
 * 3. browser_find_elements({ role: "button", hasText: "#1" })
 *    - Find rank #1 badge
 *    - Extract class attribute
 *    - Verify contains: bg-red-100, text-red-700, border-red-300
 *
 * 4. Repeat for ranks #2-#5:
 *    - Rank #2: Orange colors
 *    - Rank #3: Amber colors
 *    - Rank #4: Yellow colors
 *    - Rank #5: Blue colors
 *
 * 5. browser_snapshot()
 *    - Verify accessibility tree structure
 *    - Check that all 5 buttons have proper ARIA labels
 *
 * 6. browser_take_screenshot({ path: "t08.2-color-scheme.png" })
 *    - Visual verification of color hierarchy
 *
 * Expected Result:
 * ✅ Rank #1: Red color scheme
 * ✅ Rank #2: Orange color scheme
 * ✅ Rank #3: Amber color scheme
 * ✅ Rank #4: Yellow color scheme
 * ✅ Rank #5: Blue color scheme
 * ✅ Visual hierarchy clear in screenshot
 */

/**
 * Test T08.3: Skeleton loading state
 *
 * Fast-Playwright MCP Execution Steps:
 *
 * 1. browser_navigate("http://localhost:3000")
 *    - Start navigation (don't wait)
 *
 * 2. Immediately: browser_take_screenshot({ path: "t08.3-skeleton-loading.png" })
 *    - Attempt to capture skeleton state
 *    - Note: May be too fast on local environment
 *
 * 3. browser_find_elements({ className: "skeleton-container" })
 *    - Look for skeleton loader element
 *    - If found, verify it has 5 child divs (placeholders)
 *
 * 4. browser_wait_for({ text: "제주도 맛집" })
 *    - Wait for actual data to load
 *
 * 5. browser_take_screenshot({ path: "t08.3-data-loaded.png" })
 *    - Capture state after data loads
 *
 * 6. Verify skeleton is no longer visible:
 *    - browser_find_elements({ className: "skeleton-container" })
 *    - Should return empty or element with display: none
 *
 * 7. Visual comparison:
 *    - Compare two screenshots
 *    - Skeleton should be replaced by actual badges
 *
 * Expected Result:
 * ✅ Skeleton loaders visible initially (if captured)
 * ✅ 5 skeleton placeholders displayed
 * ✅ Skeleton disappears after data loads
 * ✅ Actual badges replace skeleton
 * ✅ No layout shift between states
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST SCENARIO 2: T09 - Click popular search term navigates to results
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Test T09.1: Click rank #2 badge (한라산 등반)
 *
 * Fast-Playwright MCP Execution Steps:
 *
 * 1. browser_navigate("http://localhost:3000")
 *    - Navigate to homepage
 *
 * 2. browser_wait_for({ text: "인기 검색어" })
 *    - Wait for popular search section
 *
 * 3. browser_find_elements({ role: "button", hasText: "#2 한라산 등반" })
 *    - Find the rank #2 badge specifically
 *
 * 4. browser_click({ selector: "button[aria-label*='한라산 등반']" })
 *    - Click on the badge
 *
 * 5. browser_wait_for({ time: 2000 })
 *    - Wait for page navigation to complete
 *
 * 6. browser_network_requests()
 *    - Check current URL
 *    - Verify contains: /search?q=한라산
 *    - Verify URL encoding is correct
 *
 * 7. browser_take_screenshot({ path: "t09.1-search-results.png" })
 *    - Capture search results page
 *
 * Expected Result:
 * ✅ Navigation to /search page
 * ✅ URL parameter: q=한라산%20등반 (or similar encoding)
 * ✅ Search results page displays
 * ✅ Screenshot shows search results loaded
 */

/**
 * Test T09.2: Search results display relevant questions
 *
 * Fast-Playwright MCP Execution Steps:
 *
 * 1. Complete T09.1 flow (navigate and click badge)
 *
 * 2. On search results page:
 *    - browser_wait_for({ text: "한라산" })
 *    - Wait for search term to appear in results
 *
 * 3. browser_find_elements({ text: "한라산" })
 *    - Find all elements containing the keyword
 *    - Should find at least 1 result
 *
 * 4. browser_snapshot()
 *    - Verify accessibility tree shows results
 *    - Check semantic structure of search results
 *
 * 5. browser_take_screenshot({ path: "t09.2-results-content.png", fullPage: true })
 *    - Capture full page of results
 *
 * Expected Result:
 * ✅ At least 1 search result contains "한라산"
 * ✅ Results are properly structured
 * ✅ Accessibility tree is valid
 * ✅ Full page screenshot shows all results
 */

/**
 * Test T09.3: URL encoding works correctly
 *
 * Fast-Playwright MCP Execution Steps:
 *
 * 1. browser_navigate("http://localhost:3000")
 *    - Navigate to homepage
 *
 * 2. browser_wait_for({ text: "제주도 맛집" })
 *    - Wait for popular search section
 *
 * 3. browser_click({ selector: "button[aria-label*='제주도 맛집']" })
 *    - Click badge with space in keyword
 *
 * 4. browser_wait_for({ time: 2000 })
 *    - Wait for navigation
 *
 * 5. browser_network_requests()
 *    - Get current URL
 *    - Verify URL shows proper encoding:
 *      - Option 1: %20 for space
 *      - Option 2: + for space
 *    - Parse URL and verify search parameter
 *
 * 6. browser_wait_for({ text: "제주도" })
 *    - Verify search results loaded correctly
 *    - Confirms decoding works properly
 *
 * Expected Result:
 * ✅ URL contains /search?q=제주도+맛집 or similar
 * ✅ Spaces are properly encoded
 * ✅ Korean characters are properly encoded
 * ✅ Search results page loads correctly
 * ✅ Search term is decoded properly in results
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST SCENARIO 3: T10 - Responsive design across viewports
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Test T10.1: Mobile view (375px width)
 *
 * Fast-Playwright MCP Execution Steps:
 *
 * 1. browser_resize({ width: 375, height: 667 })
 *    - Set viewport to iPhone SE size
 *
 * 2. browser_navigate("http://localhost:3000")
 *    - Navigate to homepage with mobile viewport
 *
 * 3. browser_wait_for({ text: "인기 검색어" })
 *    - Wait for popular search section
 *
 * 4. browser_take_screenshot({ path: "t10.1-mobile-375px.png", fullPage: true })
 *    - Capture mobile view
 *
 * 5. browser_find_elements({ role: "button" })
 *    - Find all badges
 *    - Verify count === 5
 *
 * 6. browser_snapshot()
 *    - Verify accessibility tree on mobile
 *    - Check that all badges are in DOM
 *
 * 7. Verify badges are visible:
 *    - May require horizontal scroll
 *    - Check that badges don't overflow viewport
 *    - Verify text is readable (not truncated)
 *
 * 8. Test click interaction:
 *    - browser_click({ selector: "button[aria-label*='한라산']" })
 *    - Verify navigation works on mobile
 *
 * Expected Result:
 * ✅ All 5 badges visible (may require scroll)
 * ✅ Layout adapts to narrow viewport
 * ✅ Text remains readable
 * ✅ No overflow issues
 * ✅ Click navigation works on mobile
 * ✅ Screenshot shows proper mobile layout
 */

/**
 * Test T10.2: Tablet view (768px width)
 *
 * Fast-Playwright MCP Execution Steps:
 *
 * 1. browser_resize({ width: 768, height: 1024 })
 *    - Set viewport to iPad size
 *
 * 2. browser_navigate("http://localhost:3000")
 *    - Navigate to homepage with tablet viewport
 *
 * 3. browser_wait_for({ text: "인기 검색어" })
 *    - Wait for popular search section
 *
 * 4. browser_take_screenshot({ path: "t10.2-tablet-768px.png" })
 *    - Capture tablet view
 *
 * 5. browser_find_elements({ role: "button" })
 *    - Find all badges
 *    - Verify count === 5
 *    - Verify all visible without horizontal scroll
 *
 * 6. Verify responsive layout:
 *    - Badges should wrap appropriately
 *    - Spacing should be optimal
 *    - No cramped or stretched appearance
 *
 * 7. Test click interaction:
 *    - browser_click({ selector: "button[aria-label*='섭지코지']" })
 *    - Verify navigation works
 *
 * Expected Result:
 * ✅ All 5 badges visible without horizontal scroll
 * ✅ Badges wrap to 2 rows if needed
 * ✅ Spacing is appropriate
 * ✅ Touch targets are large enough
 * ✅ Click navigation works
 * ✅ Screenshot shows optimal tablet layout
 */

/**
 * Test T10.3: Desktop view (1440px width)
 *
 * Fast-Playwright MCP Execution Steps:
 *
 * 1. browser_resize({ width: 1440, height: 900 })
 *    - Set viewport to desktop size
 *
 * 2. browser_navigate("http://localhost:3000")
 *    - Navigate to homepage with desktop viewport
 *
 * 3. browser_wait_for({ text: "인기 검색어" })
 *    - Wait for popular search section
 *
 * 4. browser_take_screenshot({ path: "t10.3-desktop-1440px.png" })
 *    - Capture desktop view
 *
 * 5. browser_find_elements({ role: "button" })
 *    - Find all badges
 *    - Verify count === 5
 *    - Verify all visible in single row (if design allows)
 *
 * 6. Verify optimal desktop layout:
 *    - Badges have adequate spacing
 *    - Layout uses available width efficiently
 *    - No excessive whitespace
 *
 * 7. Test hover effects (if browser automation supports):
 *    - Hover over badge
 *    - browser_take_screenshot({ path: "t10.3-hover-state.png" })
 *
 * 8. Test click interaction:
 *    - browser_click({ selector: "button[aria-label*='우도 여행']" })
 *    - Verify navigation works
 *
 * Expected Result:
 * ✅ All 5 badges visible in optimal layout
 * ✅ May display in single row or wrapped
 * ✅ Spacing is generous and clear
 * ✅ Hover effects work (if supported)
 * ✅ Click navigation works
 * ✅ Screenshot shows professional desktop layout
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST SCENARIO 4: T11 - Performance requirements
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Test T11.1: Page load time < 3 seconds
 *
 * Fast-Playwright MCP Execution Steps:
 *
 * 1. Start timer: const startTime = Date.now()
 *
 * 2. browser_navigate("http://localhost:3000")
 *    - Navigate to homepage
 *
 * 3. browser_wait_for({ text: "제주도 맛집" })
 *    - Wait for popular search section to be fully loaded
 *    - This indicates component has rendered with data
 *
 * 4. Stop timer: const loadTime = Date.now() - startTime
 *
 * 5. Verify: loadTime < 3000
 *    - Assert load time is under 3 seconds
 *
 * 6. Log result: console.log(`Page load time: ${loadTime}ms`)
 *
 * Expected Result:
 * ✅ Total load time < 3000ms
 * ✅ Component renders and displays data quickly
 * ✅ No blocking resources delay render
 *
 * Performance Baseline:
 * - Target: < 3000ms
 * - Good: < 2000ms
 * - Excellent: < 1000ms
 */

/**
 * Test T11.2: API response time < 500ms
 *
 * Fast-Playwright MCP Execution Steps:
 *
 * 1. browser_navigate("http://localhost:3000")
 *    - Start navigation
 *
 * 2. browser_network_requests()
 *    - Monitor all network requests
 *    - Filter for: /api/search/popular
 *
 * 3. For /api/search/popular request:
 *    - Extract response timing
 *    - Calculate: responseEnd - requestStart
 *
 * 4. Verify:
 *    - Response status === 200
 *    - Response time < 500ms
 *    - Response contains valid SearchTerm[] data
 *
 * 5. Log result:
 *    - console.log(`API response time: ${responseTime}ms`)
 *    - console.log(`Response status: ${status}`)
 *
 * Expected Result:
 * ✅ API responds in < 500ms
 * ✅ Status code: 200
 * ✅ Response body contains 5 SearchTerm objects
 * ✅ Each SearchTerm has: id, keyword, searchCount, rank
 *
 * Performance Baseline:
 * - Target: < 500ms
 * - Good: < 300ms
 * - Excellent: < 200ms
 *
 * Note: In Next.js architecture, the client calls /api/search/popular
 * which then calls the backend API. Total time includes both hops.
 */

/**
 * Test T11.3: No layout shift during render (CLS < 0.1)
 *
 * Fast-Playwright MCP Execution Steps:
 *
 * 1. browser_navigate("http://localhost:3000")
 *    - Start navigation
 *
 * 2. Immediately: browser_take_screenshot({
 *      path: "t11.3-before-render.png",
 *      clip: { x: 0, y: 0, width: 1280, height: 400 }
 *    })
 *    - Capture skeleton state (if visible)
 *
 * 3. browser_wait_for({ text: "제주도 맛집" })
 *    - Wait for data to load
 *
 * 4. browser_take_screenshot({
 *      path: "t11.3-after-render.png",
 *      clip: { x: 0, y: 0, width: 1280, height: 400 }
 *    })
 *    - Capture final rendered state
 *
 * 5. Visual comparison:
 *    - Compare position of popular search section
 *    - Measure vertical shift (if any)
 *    - Calculate approximate CLS score
 *
 * 6. Verify no console errors related to layout:
 *    - browser_network_requests()
 *    - Check console logs for "layout shift" warnings
 *
 * 7. Measure skeleton dimensions:
 *    - browser_find_elements({ className: "skeleton-container" })
 *    - Verify skeleton has same dimensions as final render
 *
 * Expected Result:
 * ✅ Popular search section stays in same position
 * ✅ No significant vertical shift between skeleton and data
 * ✅ CLS score < 0.1 (visual estimation)
 * ✅ No console warnings about layout shift
 * ✅ Skeleton dimensions match final component
 *
 * Layout Shift Calculation:
 * - Impact Fraction: % of viewport that shifted
 * - Distance Fraction: How far content moved
 * - CLS = Impact × Distance
 * - Target: CLS < 0.1 (good user experience)
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ADDITIONAL VALIDATION: Accessibility & Error Handling
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Test A01: Keyboard navigation support
 *
 * Fast-Playwright MCP Execution Steps:
 *
 * 1. browser_navigate("http://localhost:3000")
 * 2. browser_wait_for({ text: "인기 검색어" })
 * 3. Simulate Tab key navigation (if supported by fast-playwright)
 * 4. Verify badges receive focus
 * 5. Simulate Enter key on focused badge
 * 6. Verify navigation to search results
 *
 * Expected Result:
 * ✅ Badges are keyboard accessible
 * ✅ Focus indicator visible
 * ✅ Enter key triggers navigation
 */

/**
 * Test A02: ARIA labels validation
 *
 * Fast-Playwright MCP Execution Steps:
 *
 * 1. browser_navigate("http://localhost:3000")
 * 2. browser_wait_for({ text: "인기 검색어" })
 * 3. browser_snapshot()
 *    - Verify accessibility tree shows 5 buttons
 *    - Check each button has aria-label
 *    - Verify aria-label format: "Search for [keyword]"
 * 4. browser_find_elements({ role: "button" })
 *    - Extract aria-label attribute from each
 *    - Verify format and content
 *
 * Expected Result:
 * ✅ All badges have aria-label
 * ✅ Labels follow format: "Search for [keyword]"
 * ✅ Accessibility tree is valid
 * ✅ Screen reader support confirmed
 */

/**
 * Test A03: API failure fallback
 *
 * Fast-Playwright MCP Execution Steps:
 *
 * Note: fast-playwright may not support request interception.
 * This test may need to be simulated by temporarily disabling the API.
 *
 * 1. Disable API or simulate network error
 * 2. browser_navigate("http://localhost:3000")
 * 3. browser_wait_for({ time: 3000 })
 * 4. browser_find_elements({ role: "button" })
 * 5. Verify fallback keywords are displayed
 * 6. Verify count === 5
 * 7. browser_take_screenshot({ path: "a03-fallback.png" })
 *
 * Expected Result:
 * ✅ Fallback keywords displayed when API fails
 * ✅ Still shows 5 badges
 * ✅ Badges are clickable
 * ✅ No error messages shown to user
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST EXECUTION SUMMARY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Total Test Cases: 13
 *
 * Scenario 1 (T08): 3 tests - Display and rendering
 * Scenario 2 (T09): 3 tests - User interaction and navigation
 * Scenario 3 (T10): 3 tests - Responsive design
 * Scenario 4 (T11): 3 tests - Performance requirements
 * Additional (A01-A03): 3 tests - Accessibility and error handling
 *
 * Manual Execution Required:
 * These tests are documented specifications for use with fast-playwright MCP.
 * They cannot be run with standard test runners (Jest/Playwright).
 *
 * To execute:
 * 1. Start development servers (npm run dev for both web and api)
 * 2. Open Claude Code interface with fast-playwright MCP enabled
 * 3. Execute each test scenario manually using the documented MCP commands
 * 4. Document results in: popular-search-terms.e2e.results.md
 * 5. Save all screenshots to: test-results/ directory
 *
 * Deliverables:
 * 1. This specification file (popular-search-terms.spec.ts)
 * 2. Test results documentation (popular-search-terms.e2e.results.md)
 * 3. Screenshots from each test (13+ images)
 * 4. Performance metrics log
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACCEPTANCE CRITERIA CHECKLIST
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Phase 4 - E2E Testing & Performance Validation
 *
 * [ ] T08.1: Homepage displays 5 search term badges
 * [ ] T08.2: Colors match rank (Red → Orange → Amber → Yellow → Blue)
 * [ ] T08.3: Skeleton loaders appear then disappear
 * [ ] T09.1: Clicking badge navigates to /search?q=keyword
 * [ ] T09.2: Search results show relevant questions
 * [ ] T09.3: URL encoding handles special characters
 * [ ] T10.1: Mobile view (375px) displays correctly
 * [ ] T10.2: Tablet view (768px) displays correctly
 * [ ] T10.3: Desktop view (1440px) displays correctly
 * [ ] T11.1: Page load time < 3 seconds
 * [ ] T11.2: API response time < 500ms
 * [ ] T11.3: No significant layout shift (CLS < 0.1)
 * [ ] A01: Keyboard navigation works
 * [ ] A02: ARIA labels are correct
 * [ ] A03: Fallback keywords display when API fails
 *
 * All tests must pass before Phase 4 is considered complete.
 */

export {};
