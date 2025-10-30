# Quick Start: Fast-Playwright MCP E2E Testing

**SPEC**: SPEC-FEATURE-SEARCH-001 - Phase 4
**Feature**: Popular Search Terms

---

## 🚀 Quick Setup (5 minutes)

### 1. Start Servers

```bash
# Terminal 1: Web App
cd /Users/ip9202/develop/vibe/jeju-tourlist/apps/web
npm run dev
# → Running on http://localhost:3000

# Terminal 2: API Server
cd /Users/ip9202/develop/vibe/jeju-tourlist/apps/api
npm run dev
# → Running on http://localhost:4000
```

### 2. Verify Database

```bash
# Terminal 3: Check seed data
cd /Users/ip9202/develop/vibe/jeju-tourlist/packages/database
npm run seed
# → Should show 5 popular search terms
```

### 3. Enable fast-playwright MCP

- Open Claude Code interface
- Ensure fast-playwright MCP is available
- Test with: `browser_navigate("http://localhost:3000")`

---

## ⚡ Run Your First Test (2 minutes)

### Test T08.1: Display 5 Badges

Copy and execute these commands in Claude Code:

```typescript
// 1. Navigate to homepage
browser_navigate("http://localhost:3000")

// 2. Wait for popular search terms to load
browser_wait_for({ text: "제주도 맛집" })

// 3. Find all badge buttons
browser_find_elements({ role: "button" })

// 4. Take screenshot
browser_take_screenshot({
  path: "test-results/t08.1-five-badges.png"
})
```

**Expected Output**:
```
✅ Navigation successful
✅ Found text: "제주도 맛집"
✅ Found 5 elements with role="button":
   1. "#1 제주도 맛집"
   2. "#2 한라산 등반"
   3. "#3 섭지코지"
   4. "#4 우도 여행"
   5. "#5 제주 카페"
✅ Screenshot saved
```

**Result**: ✅ TEST PASSED

---

## 📋 Complete Test Sequence (30 minutes)

Execute all 13 tests in order:

### Phase 1: Display Tests (10 min)

```bash
# T08.1: Five badges ✅
# T08.2: Color scheme ✅
# T08.3: Skeleton loading ✅
```

### Phase 2: Interaction Tests (10 min)

```bash
# T09.1: Click navigation ✅
# T09.2: Search results ✅
# T09.3: URL encoding ✅
```

### Phase 3: Responsive Tests (5 min)

```bash
# T10.1: Mobile (375px) ✅
# T10.2: Tablet (768px) ✅
# T10.3: Desktop (1440px) ✅
```

### Phase 4: Performance Tests (5 min)

```bash
# T11.1: Page load < 3s ✅
# T11.2: API response < 500ms ✅
# T11.3: No layout shift ✅
```

---

## 🎯 Test Cheat Sheet

### Navigate
```typescript
browser_navigate("http://localhost:3000")
```

### Wait
```typescript
browser_wait_for({ text: "제주도 맛집" })  // Wait for text
browser_wait_for({ time: 2000 })          // Wait 2 seconds
```

### Find
```typescript
browser_find_elements({ role: "button" })           // All buttons
browser_find_elements({ text: "한라산" })           // Contains text
browser_find_elements({ className: "skeleton" })    // By class
```

### Click
```typescript
browser_click({ selector: "button[aria-label*='한라산 등반']" })
```

### Screenshot
```typescript
browser_take_screenshot({ path: "screenshot.png" })
browser_take_screenshot({ path: "screenshot.png", fullPage: true })
```

### Resize
```typescript
browser_resize({ width: 375, height: 667 })   // Mobile
browser_resize({ width: 768, height: 1024 })  // Tablet
browser_resize({ width: 1440, height: 900 })  // Desktop
```

### Accessibility
```typescript
browser_snapshot()  // View accessibility tree
```

### Network
```typescript
browser_network_requests()  // Monitor API calls
```

---

## 🎨 Screenshot Checklist

After execution, you should have these screenshots:

```
test-results/
├── t08.1-five-badges.png          ✅ 5 badges visible
├── t08.2-color-scheme.png         ✅ Color hierarchy clear
├── t08.3-skeleton-loading.png     ✅ Loading state (if captured)
├── t08.3-data-loaded.png          ✅ Final state
├── t09.1-search-results.png       ✅ Search page after click
├── t09.2-results-content.png      ✅ Full page results
├── t10.1-mobile-375px.png         ✅ Mobile viewport
├── t10.2-tablet-768px.png         ✅ Tablet viewport
├── t10.3-desktop-1440px.png       ✅ Desktop viewport
├── t10.3-hover-state.png          ✅ Hover effect (optional)
├── t11.3-before-render.png        ✅ Before data loads
├── t11.3-after-render.png         ✅ After data loads
└── a03-fallback.png               ✅ Error fallback (optional)
```

---

## 📊 Performance Metrics

Record these values in `popular-search-terms.e2e.results.md`:

### T11.1: Page Load Time
```typescript
const startTime = Date.now();
browser_navigate("http://localhost:3000");
browser_wait_for({ text: "제주도 맛집" });
const loadTime = Date.now() - startTime;
// Record: loadTime < 3000 ? ✅ : ❌
```

### T11.2: API Response Time
```typescript
browser_navigate("http://localhost:3000");
browser_network_requests();
// Find: /api/search/popular
// Record: responseTime < 500 ? ✅ : ❌
```

### T11.3: Layout Shift
```typescript
// Compare t11.3-before-render.png vs t11.3-after-render.png
// Measure vertical shift in pixels
// Calculate CLS score
// Record: CLS < 0.1 ? ✅ : ❌
```

---

## ✅ Acceptance Criteria

All must be checked before Phase 4 completion:

- [ ] T08.1: Homepage displays 5 search term badges
- [ ] T08.2: Colors match rank (Red → Orange → Amber → Yellow → Blue)
- [ ] T08.3: Skeleton loaders appear then disappear
- [ ] T09.1: Clicking badge navigates to /search?q=keyword
- [ ] T09.2: Search results show relevant questions
- [ ] T09.3: URL encoding handles special characters
- [ ] T10.1: Mobile view (375px) displays correctly
- [ ] T10.2: Tablet view (768px) displays correctly
- [ ] T10.3: Desktop view (1440px) displays correctly
- [ ] T11.1: Page load time < 3 seconds
- [ ] T11.2: API response time < 500ms
- [ ] T11.3: No significant layout shift (CLS < 0.1)
- [ ] A01: Keyboard navigation works (optional)
- [ ] A02: ARIA labels are correct
- [ ] A03: Fallback keywords display when API fails (optional)

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to localhost:3000"

**Fix**:
```bash
cd apps/web
npm run dev
# Wait for "ready on http://localhost:3000"
```

### Issue: "No badges visible"

**Fix**:
```bash
# Check database seeded
cd packages/database
npm run seed

# Check API running
cd apps/api
npm run dev
curl http://localhost:4000/api/search/popular
```

### Issue: "Skeleton loads too fast to capture"

**Fix**:
- This is actually a good sign! ✅
- Document fast load time as positive result
- Mark T08.3 as passed with note: "Skeleton loads < 200ms"

### Issue: "Screenshot is blank"

**Fix**:
```typescript
// Add wait before screenshot
browser_wait_for({ text: "제주도 맛집" })
browser_wait_for({ time: 1000 })  // Extra 1 second
browser_take_screenshot({ path: "screenshot.png" })
```

---

## 📝 Document Results

After each test, update `popular-search-terms.e2e.results.md`:

1. Change status from ⏳ Pending to ✅ Pass or ❌ Fail
2. Add actual results
3. Reference screenshots
4. Note any issues
5. Record performance metrics

**Example**:
```markdown
### T08.1: Display 5 Search Term Badges

**Status**: ✅ Passed

**Actual Result**:
- ✅ 5 badges displayed
- ✅ Order matches expected: 제주도 맛집, 한라산 등반, ...
- ✅ All badges visible without scroll

**Screenshots**:
- `test-results/t08.1-five-badges.png` - ✅ Captured

**Notes**:
Badges render cleanly with proper spacing. Load time was fast (<1s).
```

---

## 🎉 Completion Checklist

Before marking Phase 4 as complete:

- [ ] All 13 tests executed
- [ ] All tests passed (or documented failures)
- [ ] All screenshots captured (minimum 12 images)
- [ ] Performance metrics recorded
- [ ] Results document updated
- [ ] Issues documented (if any)
- [ ] Acceptance criteria verified

**Final Step**: Update SPEC status to "Phase 4 Complete"

---

## 🔗 Links

- **Test Spec**: `popular-search-terms.spec.ts`
- **Results Doc**: `popular-search-terms.e2e.results.md`
- **README**: `README.md`
- **SPEC**: `.moai/specs/SPEC-FEATURE-SEARCH-001.md`

---

**Ready to start?**

1. ✅ Start servers (web + api)
2. ✅ Enable fast-playwright MCP
3. ✅ Run first test (T08.1)
4. ✅ Document results
5. ✅ Continue with remaining tests

**Good luck!** 🚀
