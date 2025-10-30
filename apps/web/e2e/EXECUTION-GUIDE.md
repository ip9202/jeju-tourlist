# Execution Guide: Fast-Playwright MCP Commands

**SPEC**: SPEC-FEATURE-SEARCH-001 - Phase 4
**File**: Complete command reference for all 13 tests

---

## Test T08.1: Display 5 Search Term Badges

### Commands

```typescript
// Step 1: Navigate to homepage
browser_navigate("http://localhost:3000")

// Step 2: Wait for popular search section to load
browser_wait_for({ text: "제주도 맛집" })

// Step 3: Find all badge buttons
browser_find_elements({ role: "button" })

// Step 4: Take screenshot
browser_take_screenshot({
  path: "test-results/t08.1-five-badges.png"
})
```

### Expected Output

```
✅ Navigated to: http://localhost:3000
✅ Found text: "제주도 맛집"
✅ Found 5 elements with role="button":
   - Element 1: "#1 제주도 맛집"
   - Element 2: "#2 한라산 등반"
   - Element 3: "#3 섭지코지"
   - Element 4: "#4 우도 여행"
   - Element 5: "#5 제주 카페"
✅ Screenshot saved: test-results/t08.1-five-badges.png
```

### Verification

- [ ] 5 badges found
- [ ] Correct order: 제주도 맛집, 한라산 등반, 섭지코지, 우도 여행, 제주 카페
- [ ] Screenshot clear and complete

---

## Test T08.2: Verify Color Scheme by Rank

### Commands

```typescript
// Step 1: Navigate to homepage
browser_navigate("http://localhost:3000")

// Step 2: Wait for popular search section
browser_wait_for({ text: "인기 검색어" })

// Step 3: Find rank #1 badge and check colors
browser_find_elements({ role: "button", hasText: "#1" })
// Manually verify classes: bg-red-100, text-red-700, border-red-300

// Step 4: Repeat for other ranks
browser_find_elements({ role: "button", hasText: "#2" })
// Verify: bg-orange-100, text-orange-700, border-orange-300

browser_find_elements({ role: "button", hasText: "#3" })
// Verify: bg-amber-100, text-amber-700, border-amber-300

browser_find_elements({ role: "button", hasText: "#4" })
// Verify: bg-yellow-100, text-yellow-700, border-yellow-300

browser_find_elements({ role: "button", hasText: "#5" })
// Verify: bg-blue-100, text-blue-700, border-blue-300

// Step 5: Verify accessibility tree
browser_snapshot()

// Step 6: Take screenshot showing color hierarchy
browser_take_screenshot({
  path: "test-results/t08.2-color-scheme.png"
})
```

### Expected Output

```
✅ Rank #1: Red color scheme (bg-red-100, text-red-700, border-red-300)
✅ Rank #2: Orange color scheme (bg-orange-100, text-orange-700, border-orange-300)
✅ Rank #3: Amber color scheme (bg-amber-100, text-amber-700, border-amber-300)
✅ Rank #4: Yellow color scheme (bg-yellow-100, text-yellow-700, border-yellow-300)
✅ Rank #5: Blue color scheme (bg-blue-100, text-blue-700, border-blue-300)
✅ Accessibility tree shows 5 buttons with proper ARIA labels
✅ Screenshot saved: test-results/t08.2-color-scheme.png
```

### Verification

- [ ] All 5 ranks have correct color classes
- [ ] Visual hierarchy clear in screenshot
- [ ] Accessibility tree valid

---

## Test T08.3: Skeleton Loading State

### Commands

```typescript
// Step 1: Navigate to homepage (don't wait)
browser_navigate("http://localhost:3000")

// Step 2: Immediately take screenshot (try to capture skeleton)
browser_take_screenshot({
  path: "test-results/t08.3-skeleton-loading.png"
})

// Step 3: Check for skeleton container
browser_find_elements({ className: "skeleton-container" })
// If found, verify 5 child divs

// Step 4: Wait for data to load
browser_wait_for({ text: "제주도 맛집" })

// Step 5: Take screenshot after data loads
browser_take_screenshot({
  path: "test-results/t08.3-data-loaded.png"
})

// Step 6: Verify skeleton no longer visible
browser_find_elements({ className: "skeleton-container" })
// Should be empty or hidden
```

### Expected Output

```
✅ Navigation started
✅ Screenshot captured (may show skeleton or loaded state)
✅ Found skeleton-container with 5 placeholders (if timing allows)
✅ Data loaded: "제주도 맛집" visible
✅ Screenshot saved: test-results/t08.3-data-loaded.png
✅ Skeleton no longer visible
```

### Verification

- [ ] Before screenshot captured (skeleton or loaded state)
- [ ] After screenshot shows loaded badges
- [ ] No layout shift between states

**Note**: If skeleton loads too fast (<200ms), document as positive result.

---

## Test T09.1: Click Rank #2 Badge (한라산 등반)

### Commands

```typescript
// Step 1: Navigate to homepage
browser_navigate("http://localhost:3000")

// Step 2: Wait for popular search section
browser_wait_for({ text: "인기 검색어" })

// Step 3: Find rank #2 badge
browser_find_elements({ role: "button", hasText: "#2 한라산 등반" })

// Step 4: Click the badge
browser_click({ selector: "button[aria-label*='한라산 등반']" })

// Step 5: Wait for page navigation
browser_wait_for({ time: 2000 })

// Step 6: Check current URL
browser_network_requests()
// Verify URL contains: /search?q=한라산

// Step 7: Take screenshot of search results
browser_take_screenshot({
  path: "test-results/t09.1-search-results.png"
})
```

### Expected Output

```
✅ Navigated to homepage
✅ Found rank #2 badge: "#2 한라산 등반"
✅ Clicked badge successfully
✅ Navigation complete
✅ Current URL: http://localhost:3000/search?q=한라산%20등반
✅ Screenshot saved: test-results/t09.1-search-results.png
```

### Verification

- [ ] URL contains /search?q=한라산
- [ ] URL encoding correct (%20 for space)
- [ ] Search results page loaded
- [ ] Screenshot shows search results

---

## Test T09.2: Search Results Display Relevant Questions

### Commands

```typescript
// Step 1: Complete T09.1 flow (navigate and click)
browser_navigate("http://localhost:3000")
browser_wait_for({ text: "인기 검색어" })
browser_click({ selector: "button[aria-label*='한라산 등반']" })
browser_wait_for({ time: 2000 })

// Step 2: On search results page, wait for keyword
browser_wait_for({ text: "한라산" })

// Step 3: Find all elements containing keyword
browser_find_elements({ text: "한라산" })
// Verify at least 1 result found

// Step 4: Check accessibility tree
browser_snapshot()

// Step 5: Take full page screenshot
browser_take_screenshot({
  path: "test-results/t09.2-results-content.png",
  fullPage: true
})
```

### Expected Output

```
✅ Navigation to search results complete
✅ Found keyword "한라산" in results
✅ Found 3 elements containing "한라산" (or more)
✅ Accessibility tree shows proper structure
✅ Screenshot saved: test-results/t09.2-results-content.png
```

### Verification

- [ ] At least 1 result contains keyword
- [ ] Results are properly structured
- [ ] Full page screenshot shows all results

---

## Test T09.3: URL Encoding Works Correctly

### Commands

```typescript
// Step 1: Navigate to homepage
browser_navigate("http://localhost:3000")

// Step 2: Wait for popular search section
browser_wait_for({ text: "제주도 맛집" })

// Step 3: Click badge with space in keyword
browser_click({ selector: "button[aria-label*='제주도 맛집']" })

// Step 4: Wait for navigation
browser_wait_for({ time: 2000 })

// Step 5: Check URL encoding
browser_network_requests()
// Verify: /search?q=제주도+맛집 or /search?q=제주도%20맛집

// Step 6: Verify search results loaded correctly
browser_wait_for({ text: "제주도" })
```

### Expected Output

```
✅ Clicked badge: "제주도 맛집"
✅ URL properly encoded: /search?q=제주도+맛집
✅ Spaces encoded as + or %20
✅ Korean characters properly encoded
✅ Search results loaded and decoded correctly
```

### Verification

- [ ] URL shows proper space encoding
- [ ] Korean characters encoded correctly
- [ ] Search results page loads
- [ ] Keyword decoded properly in results

---

## Test T10.1: Mobile View (375px)

### Commands

```typescript
// Step 1: Resize viewport to mobile
browser_resize({ width: 375, height: 667 })

// Step 2: Navigate to homepage
browser_navigate("http://localhost:3000")

// Step 3: Wait for popular search section
browser_wait_for({ text: "인기 검색어" })

// Step 4: Take screenshot
browser_take_screenshot({
  path: "test-results/t10.1-mobile-375px.png",
  fullPage: true
})

// Step 5: Find all badges
browser_find_elements({ role: "button" })
// Verify count === 5

// Step 6: Check accessibility tree
browser_snapshot()

// Step 7: Test click interaction
browser_click({ selector: "button[aria-label*='한라산']" })
browser_wait_for({ time: 2000 })
// Verify navigation works on mobile
```

### Expected Output

```
✅ Viewport resized: 375x667
✅ Navigated to homepage
✅ Found 5 badges (may require horizontal scroll)
✅ Screenshot saved: test-results/t10.1-mobile-375px.png
✅ Accessibility tree valid
✅ Click navigation works on mobile
```

### Verification

- [ ] All 5 badges visible
- [ ] Layout adapts to narrow viewport
- [ ] Text readable, no overflow
- [ ] Click interaction works

---

## Test T10.2: Tablet View (768px)

### Commands

```typescript
// Step 1: Resize viewport to tablet
browser_resize({ width: 768, height: 1024 })

// Step 2: Navigate to homepage
browser_navigate("http://localhost:3000")

// Step 3: Wait for popular search section
browser_wait_for({ text: "인기 검색어" })

// Step 4: Take screenshot
browser_take_screenshot({
  path: "test-results/t10.2-tablet-768px.png"
})

// Step 5: Find all badges
browser_find_elements({ role: "button" })
// Verify count === 5, all visible without horizontal scroll

// Step 6: Test click interaction
browser_click({ selector: "button[aria-label*='섭지코지']" })
browser_wait_for({ time: 2000 })
// Verify navigation works
```

### Expected Output

```
✅ Viewport resized: 768x1024
✅ Navigated to homepage
✅ Found 5 badges, all visible without scroll
✅ Screenshot saved: test-results/t10.2-tablet-768px.png
✅ Click navigation works
```

### Verification

- [ ] All 5 badges visible without horizontal scroll
- [ ] Badges wrap appropriately (2 rows if needed)
- [ ] Spacing optimal
- [ ] Click interaction works

---

## Test T10.3: Desktop View (1440px)

### Commands

```typescript
// Step 1: Resize viewport to desktop
browser_resize({ width: 1440, height: 900 })

// Step 2: Navigate to homepage
browser_navigate("http://localhost:3000")

// Step 3: Wait for popular search section
browser_wait_for({ text: "인기 검색어" })

// Step 4: Take screenshot
browser_take_screenshot({
  path: "test-results/t10.3-desktop-1440px.png"
})

// Step 5: Find all badges
browser_find_elements({ role: "button" })
// Verify count === 5, optimal layout

// Step 6: Test hover (if supported)
// Hover over badge and take screenshot
browser_take_screenshot({
  path: "test-results/t10.3-hover-state.png"
})

// Step 7: Test click interaction
browser_click({ selector: "button[aria-label*='우도 여행']" })
browser_wait_for({ time: 2000 })
// Verify navigation works
```

### Expected Output

```
✅ Viewport resized: 1440x900
✅ Navigated to homepage
✅ Found 5 badges in optimal layout
✅ Screenshot saved: test-results/t10.3-desktop-1440px.png
✅ Hover effects work (if supported)
✅ Click navigation works
```

### Verification

- [ ] All 5 badges visible in optimal layout
- [ ] Spacing generous and clear
- [ ] Hover effects visible (optional)
- [ ] Click interaction works

---

## Test T11.1: Page Load Time < 3 Seconds

### Commands

```typescript
// Step 1: Start timer
const startTime = Date.now()

// Step 2: Navigate to homepage
browser_navigate("http://localhost:3000")

// Step 3: Wait for popular search section to be fully loaded
browser_wait_for({ text: "제주도 맛집" })

// Step 4: Stop timer
const loadTime = Date.now() - startTime

// Step 5: Log result
console.log(`Page load time: ${loadTime}ms`)
console.log(`Target: < 3000ms`)
console.log(`Status: ${loadTime < 3000 ? '✅ PASS' : '❌ FAIL'}`)
```

### Expected Output

```
✅ Page load time: 1847ms
✅ Target: < 3000ms
✅ Status: ✅ PASS
```

### Verification

- [ ] Load time < 3000ms
- [ ] Component renders with data quickly
- [ ] No blocking resources

**Record in results doc**:
- Actual load time: _____ ms
- Status: ✅ Pass / ❌ Fail

---

## Test T11.2: API Response Time < 500ms

### Commands

```typescript
// Step 1: Navigate to homepage
browser_navigate("http://localhost:3000")

// Step 2: Monitor network requests
browser_network_requests()

// Step 3: Find /api/search/popular request
// Extract timing information:
// - Request start time
// - Response end time
// - Response time = end - start

// Step 4: Verify response
// - Status code === 200
// - Response time < 500ms
// - Response body contains 5 SearchTerm objects

// Step 5: Log results
console.log(`API response time: ${responseTime}ms`)
console.log(`Status code: ${statusCode}`)
console.log(`Target: < 500ms`)
console.log(`Status: ${responseTime < 500 ? '✅ PASS' : '❌ FAIL'}`)
```

### Expected Output

```
✅ API request: /api/search/popular
✅ Response time: 287ms
✅ Status code: 200
✅ Response body: 5 SearchTerm objects
✅ Target: < 500ms
✅ Status: ✅ PASS
```

### Verification

- [ ] API responds in < 500ms
- [ ] Status code: 200
- [ ] Response contains 5 SearchTerm objects

**Record in results doc**:
- API response time: _____ ms
- Status code: _____
- Status: ✅ Pass / ❌ Fail

---

## Test T11.3: No Layout Shift (CLS < 0.1)

### Commands

```typescript
// Step 1: Navigate to homepage
browser_navigate("http://localhost:3000")

// Step 2: Immediately take screenshot (before render)
browser_take_screenshot({
  path: "test-results/t11.3-before-render.png",
  clip: { x: 0, y: 0, width: 1280, height: 400 }
})

// Step 3: Wait for data to load
browser_wait_for({ text: "제주도 맛집" })

// Step 4: Take screenshot after render
browser_take_screenshot({
  path: "test-results/t11.3-after-render.png",
  clip: { x: 0, y: 0, width: 1280, height: 400 }
})

// Step 5: Visual comparison
// Compare screenshots manually:
// - Measure vertical shift of popular search section
// - Calculate impact fraction (% of viewport affected)
// - Calculate distance fraction (how far content moved)
// - CLS = impact × distance

// Step 6: Check for console warnings
browser_network_requests()
// Look for "layout shift" warnings in console
```

### Expected Output

```
✅ Screenshot before render captured
✅ Data loaded: "제주도 맛집"
✅ Screenshot after render captured
✅ Visual comparison:
   - Vertical shift: 0px (no shift detected)
   - Impact fraction: 0%
   - CLS score: 0.0
✅ No console warnings about layout shift
✅ Target: CLS < 0.1
✅ Status: ✅ PASS
```

### Verification

- [ ] Before/after screenshots captured
- [ ] No significant vertical shift
- [ ] CLS score < 0.1 (estimated)
- [ ] No console warnings

**Record in results doc**:
- Vertical shift: _____ px
- CLS score: _____
- Status: ✅ Pass / ❌ Fail

---

## Additional Tests (Optional)

### Test A01: Keyboard Navigation

```typescript
browser_navigate("http://localhost:3000")
browser_wait_for({ text: "인기 검색어" })
// Simulate Tab key (if supported)
// Verify badges receive focus
// Simulate Enter key
// Verify navigation occurs
```

### Test A02: ARIA Labels

```typescript
browser_navigate("http://localhost:3000")
browser_wait_for({ text: "인기 검색어" })
browser_snapshot()
// Verify accessibility tree shows:
// - 5 buttons
// - Each has aria-label: "Search for [keyword]"
```

### Test A03: API Failure Fallback

```typescript
// Note: May require temporarily disabling API
browser_navigate("http://localhost:3000")
browser_wait_for({ time: 3000 })
browser_find_elements({ role: "button" })
// Verify fallback keywords displayed (5 badges)
browser_take_screenshot({ path: "test-results/a03-fallback.png" })
```

---

## Execution Checklist

Before starting:
- [ ] Web app running (http://localhost:3000)
- [ ] API server running (http://localhost:4000)
- [ ] Database seeded with Phase 1 data
- [ ] fast-playwright MCP enabled
- [ ] test-results/ directory exists

During execution:
- [ ] Execute tests in order (T08 → T09 → T10 → T11)
- [ ] Document results after each test
- [ ] Capture all screenshots
- [ ] Record performance metrics
- [ ] Note any issues or unexpected behavior

After completion:
- [ ] All 13 tests documented
- [ ] All screenshots captured
- [ ] Results file updated
- [ ] Performance metrics recorded
- [ ] Acceptance criteria verified

---

**Ready to execute?** Start with T08.1 and work through each test sequentially.

**Document everything in**: `popular-search-terms.e2e.results.md`
