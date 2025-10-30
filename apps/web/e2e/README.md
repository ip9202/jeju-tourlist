# E2E Testing with fast-playwright MCP

This directory contains E2E test specifications using **fast-playwright MCP** (Model Context Protocol).

## Overview

Unlike traditional Playwright tests that run in Jest/test-runner, these tests use the fast-playwright MCP tool directly through Claude Code interface.

### Why fast-playwright MCP?

- **Real browser automation** via MCP protocol
- **No test framework dependencies** (no @playwright/test needed)
- **Visual verification** with screenshots and snapshots
- **Accessibility tree inspection** built-in
- **Network request monitoring** for performance testing

## Test Files

### 1. `popular-search-terms.spec.ts`

**Test specification** documenting all E2E test scenarios using fast-playwright MCP commands.

**Contents**:
- 13 test cases covering:
  - T08: Homepage display and rendering
  - T09: User interaction and navigation
  - T10: Responsive design (mobile, tablet, desktop)
  - T11: Performance requirements
  - A01-A03: Accessibility and error handling

### 2. `popular-search-terms.e2e.results.md`

**Test results documentation** where execution results, screenshots, and metrics are recorded.

**Updated after**:
- Each test execution
- Screenshot captures
- Performance measurements
- Issue identification

## Fast-Playwright MCP Tools

### Available Commands

#### Navigation
```typescript
browser_navigate("http://localhost:3000")
```

#### Element Finding
```typescript
browser_find_elements({ role: "button" })
browser_find_elements({ text: "제주도 맛집" })
browser_find_elements({ className: "skeleton-container" })
```

#### Interaction
```typescript
browser_click({ selector: "button[aria-label*='한라산']" })
browser_wait_for({ text: "인기 검색어" })
browser_wait_for({ time: 2000 })
```

#### Visual Testing
```typescript
browser_take_screenshot({ path: "screenshot.png" })
browser_take_screenshot({ path: "screenshot.png", fullPage: true })
browser_snapshot() // Accessibility tree
```

#### Responsive Testing
```typescript
browser_resize({ width: 375, height: 667 })  // Mobile
browser_resize({ width: 768, height: 1024 }) // Tablet
browser_resize({ width: 1440, height: 900 }) // Desktop
```

#### Performance Monitoring
```typescript
browser_network_requests() // Monitor API calls
```

## How to Execute Tests

### Prerequisites

1. **Start development servers**:
   ```bash
   # Terminal 1: Web app
   cd apps/web
   npm run dev

   # Terminal 2: API server
   cd apps/api
   npm run dev
   ```

2. **Verify database seeded**:
   ```bash
   cd packages/database
   npm run seed
   ```

3. **Enable fast-playwright MCP** in Claude Code interface

### Execution Steps

1. **Open test specification**:
   - Read `popular-search-terms.spec.ts`
   - Identify test case to execute

2. **Run MCP commands manually**:
   - Copy fast-playwright commands from spec
   - Execute in Claude Code interface
   - Wait for results

3. **Capture evidence**:
   - Take screenshots using `browser_take_screenshot()`
   - Save to `test-results/` directory
   - Document results in `popular-search-terms.e2e.results.md`

4. **Measure performance**:
   - Record timing with `Date.now()`
   - Monitor API calls with `browser_network_requests()`
   - Calculate metrics (load time, response time, CLS)

5. **Update results document**:
   - Mark test as passed/failed
   - Add actual results
   - Include screenshots
   - Note any issues

### Example Execution

**Test T08.1: Display 5 search term badges**

```bash
# Step 1: Navigate
browser_navigate("http://localhost:3000")

# Step 2: Wait for content
browser_wait_for({ text: "제주도 맛집" })

# Step 3: Find badges
browser_find_elements({ role: "button" })

# Step 4: Verify count === 5
# (Check output from previous command)

# Step 5: Screenshot
browser_take_screenshot({ path: "test-results/t08.1-five-badges.png" })
```

**Expected Output**:
```
Found 5 elements with role="button"
Elements:
1. "#1 제주도 맛집"
2. "#2 한라산 등반"
3. "#3 섭지코지"
4. "#4 우도 여행"
5. "#5 제주 카페"

Screenshot saved: test-results/t08.1-five-badges.png
```

## Test Scenarios

### Scenario 1: Display Tests (T08)

**T08.1**: Display 5 badges
- Navigate to homepage
- Verify 5 SearchTermBadge components
- Check correct order

**T08.2**: Verify color scheme
- Check rank-based colors (Red → Orange → Amber → Yellow → Blue)
- Verify CSS classes applied correctly

**T08.3**: Skeleton loading
- Capture loading state
- Verify skeleton has 5 placeholders
- Confirm smooth transition to data

### Scenario 2: Interaction Tests (T09)

**T09.1**: Click navigation
- Click rank #2 badge (한라산 등반)
- Verify URL: `/search?q=한라산%20등반`
- Check search results page loads

**T09.2**: Search results display
- Verify results contain clicked keyword
- Check results are properly structured

**T09.3**: URL encoding
- Test space encoding (%20 or +)
- Test Korean character encoding
- Verify proper decoding in results

### Scenario 3: Responsive Design Tests (T10)

**T10.1**: Mobile (375px)
- Resize viewport to mobile
- Verify all badges visible (may scroll)
- Test touch interaction

**T10.2**: Tablet (768px)
- Resize viewport to tablet
- Verify badges wrap appropriately
- Check spacing and layout

**T10.3**: Desktop (1440px)
- Resize viewport to desktop
- Verify optimal layout
- Test hover effects (if supported)

### Scenario 4: Performance Tests (T11)

**T11.1**: Page load < 3s
- Measure time from navigate to content visible
- Target: < 3000ms

**T11.2**: API response < 500ms
- Monitor `/api/search/popular` request
- Target: < 500ms

**T11.3**: No layout shift
- Compare before/after screenshots
- Calculate CLS score
- Target: < 0.1

## Performance Baselines

| Metric | Target | Good | Excellent |
|--------|--------|------|-----------|
| Page Load Time | < 3000ms | < 2000ms | < 1000ms |
| API Response | < 500ms | < 300ms | < 200ms |
| CLS Score | < 0.1 | < 0.05 | < 0.01 |

## Screenshot Naming Convention

```
[test-id]-[description].png

Examples:
- t08.1-five-badges.png
- t08.2-color-scheme.png
- t08.3-skeleton-loading.png
- t08.3-data-loaded.png
- t09.1-search-results.png
- t10.1-mobile-375px.png
- t10.2-tablet-768px.png
- t10.3-desktop-1440px.png
- t11.3-before-render.png
- t11.3-after-render.png
- a03-fallback.png
```

## Limitations

### Fast-Playwright MCP Constraints

1. **No test runner integration**
   - Cannot use Jest/Mocha/etc.
   - Manual execution required

2. **No automatic assertions**
   - Manual verification of results
   - Compare actual vs expected manually

3. **Limited keyboard simulation**
   - Tab/Enter may not be fully supported
   - Focus management may be limited

4. **No request interception**
   - Cannot mock API responses easily
   - Error scenarios may require backend changes

5. **Approximate performance metrics**
   - Timing includes MCP overhead
   - CLS calculation is visual estimation

## Best Practices

### 1. Run Tests in Order

Execute tests sequentially:
1. Display tests (T08) first
2. Interaction tests (T09) second
3. Responsive tests (T10) third
4. Performance tests (T11) last

### 2. Clear Browser State

Between tests:
- Close and reopen browser if needed
- Clear local storage/cookies
- Reset viewport size to default

### 3. Document Everything

For each test:
- Record actual results
- Capture screenshots
- Note any unexpected behavior
- Include performance metrics

### 4. Verify Prerequisites

Before starting:
- ✅ Web app running (http://localhost:3000)
- ✅ API server running (http://localhost:4000)
- ✅ Database seeded with test data
- ✅ fast-playwright MCP enabled

### 5. Handle Timing Issues

If content loads too fast:
- Skeleton may not be captured (acceptable)
- Add network throttling if needed
- Document fast load times as positive result

## Troubleshooting

### Issue: "Element not found"

**Solution**:
- Increase wait time: `browser_wait_for({ time: 3000 })`
- Check selector specificity
- Verify element actually exists in DOM

### Issue: "Screenshot shows blank page"

**Solution**:
- Add wait after navigate: `browser_wait_for({ text: "visible content" })`
- Ensure page fully loaded
- Check network requests completed

### Issue: "Test results differ from expected"

**Solution**:
- Verify database seeded correctly
- Check API returning correct data
- Compare with component implementation

### Issue: "Performance metrics too slow"

**Solution**:
- Check for console errors
- Verify no network issues
- Consider optimizing component rendering

## CI/CD Integration

**Note**: fast-playwright MCP tests are **not suitable for CI/CD** in their current form.

For automated CI/CD testing:
- Use standard Playwright tests (see `/apps/web/src/__tests__/e2e/`)
- Run with `npm run test:e2e`
- Integrate with GitHub Actions

Use fast-playwright MCP for:
- Manual exploratory testing
- Visual verification
- Accessibility audits
- Performance profiling
- One-off validations

## Related Documentation

- **SPEC**: `.moai/specs/SPEC-FEATURE-SEARCH-001.md`
- **Component**: `apps/web/src/components/search/PopularSearchTerms.tsx`
- **API**: `apps/api/src/routes/search.ts`
- **Unit Tests**: `apps/web/src/components/search/__tests__/PopularSearchTerms.test.tsx`
- **Integration Tests**: `apps/web/src/components/search/__tests__/PopularSearchTerms.integration.test.tsx`

## Support

For questions or issues:
1. Check test specification for detailed steps
2. Review fast-playwright MCP documentation
3. Verify environment setup (servers running, database seeded)
4. Contact team for assistance

---

**Last Updated**: 2025-10-29
**SPEC**: SPEC-FEATURE-SEARCH-001 - Phase 4
**Status**: Ready for execution
