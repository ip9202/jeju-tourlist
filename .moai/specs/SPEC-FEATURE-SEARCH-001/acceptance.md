# Acceptance Criteria - 메인헤더 인기검색어 기능

> **SPEC ID**: @SPEC:FEATURE-SEARCH-001
> **Created**: 2025-10-29
> **Status**: draft

---

## Overview (개요)

이 문서는 메인헤더 인기검색어 기능의 인수 테스트 기준을 정의합니다. 각 시나리오는 **Given-When-Then** 형식으로 작성되며, 테스트 자동화 가능성을 고려하여 구체적인 검증 기준을 포함합니다.

---

## 1. Backend API Tests (백엔드 API 테스트)

### @TEST:FEATURE-SEARCH-001-T01 - API 엔드포인트 정상 응답 검증

**Description**: API가 올바른 형식으로 인기검색어 데이터를 반환해야 함

**Given**:
- 데이터베이스에 최소 100개의 Question 데이터 존재
- 각 Question은 `viewCount`, `likeCount`, `answerCount` 값 보유
- 최근 7일 이내 생성된 데이터 포함

**When**:
- `GET /api/search/popular` 엔드포인트 호출

**Then**:
- HTTP 상태 코드 `200 OK` 반환
- 응답 JSON 구조가 다음과 같음:
  ```json
  {
    "success": true,
    "data": [
      {
        "rank": 1,
        "keyword": "string (max 20자)",
        "popularity": "number (> 0)"
      }
      // ... 최대 5개
    ],
    "cachedAt": "ISO 8601 timestamp"
  }
  ```
- `data` 배열 길이가 정확히 5개
- 각 항목의 `rank` 값이 1부터 5까지 순차적
- 응답 시간이 200ms 이내 (P95 기준)

**Automation**:
```typescript
// apps/api/src/routes/search/__tests__/popular.test.ts
describe('GET /api/search/popular', () => {
  it('should return 5 popular search terms in correct format', async () => {
    const response = await request(app)
      .get('/api/search/popular')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(5);
    expect(response.body.data[0]).toMatchObject({
      rank: 1,
      keyword: expect.any(String),
      popularity: expect.any(Number),
    });
  });
});
```

---

### @TEST:FEATURE-SEARCH-001-T02 - 인기도 계산 로직 검증

**Description**: 가중치 공식이 정확히 적용되어야 함

**Given**:
- 다음 데이터를 가진 Question 존재:
  - Question A: `viewCount=100`, `likeCount=10`, `answerCount=5`
  - Question B: `viewCount=50`, `likeCount=20`, `answerCount=10`
- 계산 공식: `popularity = viewCount * 1 + likeCount * 3 + answerCount * 2`

**When**:
- `PopularSearchService.getPopularSearchTerms()` 메서드 호출

**Then**:
- Question A의 popularity = `100*1 + 10*3 + 5*2 = 140`
- Question B의 popularity = `50*1 + 20*3 + 10*2 = 130`
- Question A가 Question B보다 높은 순위 (rank 1)

**Automation**:
```typescript
// apps/api/src/services/search/__tests__/PopularSearchService.test.ts
describe('PopularSearchService', () => {
  it('should calculate popularity with correct weighted formula', async () => {
    // Arrange: Seed test data
    await prisma.question.createMany({
      data: [
        { title: 'Question A', viewCount: 100, likeCount: 10, answerCount: 5 },
        { title: 'Question B', viewCount: 50, likeCount: 20, answerCount: 10 },
      ],
    });

    // Act
    const service = new PopularSearchService();
    const results = await service.getPopularSearchTerms();

    // Assert
    expect(results[0].keyword).toBe('Question A');
    expect(results[0].popularity).toBe(140);
    expect(results[1].keyword).toBe('Question B');
    expect(results[1].popularity).toBe(130);
  });
});
```

---

### @TEST:FEATURE-SEARCH-001-T03 - 캐시 동작 검증

**Description**: 캐시된 데이터가 TTL 내에서 재사용되어야 함

**Given**:
- 첫 번째 API 호출이 완료되어 캐시에 데이터 저장됨 (TTL: 1시간)
- 데이터베이스에 새로운 Question 추가 (더 높은 인기도)

**When**:
- TTL 만료 전 (30분 후) 두 번째 API 호출

**Then**:
- 데이터베이스 쿼리 실행되지 않음 (캐시 히트)
- 첫 번째 호출과 동일한 데이터 반환
- 새로 추가된 Question이 결과에 포함되지 않음

**Automation**:
```typescript
describe('Cache behavior', () => {
  it('should return cached data within TTL', async () => {
    const service = new PopularSearchService();

    // First call - cache miss
    const result1 = await service.getPopularSearchTerms();
    const dbQueryCount1 = getDbQueryCount();

    // Add new question with higher popularity
    await prisma.question.create({
      data: { title: 'New Popular Question', viewCount: 1000, likeCount: 100, answerCount: 50 },
    });

    // Second call within TTL - cache hit
    const result2 = await service.getPopularSearchTerms();
    const dbQueryCount2 = getDbQueryCount();

    // Assert
    expect(dbQueryCount2).toBe(dbQueryCount1); // No new query
    expect(result1).toEqual(result2); // Same data
  });
});
```

---

### @TEST:FEATURE-SEARCH-001-T04 - API 실패 시 에러 응답 검증

**Description**: 서버 오류 시 적절한 에러 응답 반환

**Given**:
- 데이터베이스 연결 실패 상황 시뮬레이션 (Prisma 에러)

**When**:
- `GET /api/search/popular` 엔드포인트 호출

**Then**:
- HTTP 상태 코드 `500 Internal Server Error` 반환
- 응답 JSON 구조:
  ```json
  {
    "success": false,
    "error": {
      "code": "POPULAR_SEARCH_ERROR",
      "message": "Failed to fetch popular search terms"
    }
  }
  ```
- 에러 로그가 서버 콘솔에 출력됨

**Automation**:
```typescript
describe('Error handling', () => {
  it('should return 500 error when database fails', async () => {
    // Mock Prisma error
    jest.spyOn(prisma, '$queryRaw').mockRejectedValue(new Error('DB Connection Lost'));

    const response = await request(app)
      .get('/api/search/popular')
      .expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('POPULAR_SEARCH_ERROR');
  });
});
```

---

## 2. Frontend Component Tests (프론트엔드 컴포넌트 테스트)

### @TEST:FEATURE-SEARCH-001-T05 - 컴포넌트 렌더링 검증

**Description**: PopularSearchTerms 컴포넌트가 올바르게 렌더링되어야 함

**Given**:
- API가 5개의 인기검색어 데이터 반환
- Mock 데이터:
  ```json
  [
    { "rank": 1, "keyword": "제주도 맛집", "popularity": 450 },
    { "rank": 2, "keyword": "한라산 등반", "popularity": 380 },
    { "rank": 3, "keyword": "섭지코지", "popularity": 320 },
    { "rank": 4, "keyword": "우도 여행", "popularity": 280 },
    { "rank": 5, "keyword": "제주 카페", "popularity": 250 }
  ]
  ```

**When**:
- `PopularSearchTerms` 컴포넌트 마운트

**Then**:
- 5개의 `SearchTermBadge` 컴포넌트 렌더링
- 각 배지에 순위 번호 표시 (1~5)
- 각 배지에 키워드 텍스트 표시
- 배지가 클릭 가능한 상태 (cursor: pointer)

**Automation**:
```typescript
// apps/web/src/components/layout/__tests__/PopularSearchTerms.test.tsx
import { render, screen } from '@testing-library/react';
import { PopularSearchTerms } from '../PopularSearchTerms';

describe('PopularSearchTerms', () => {
  it('should render 5 search term badges', () => {
    // Mock SWR response
    jest.mock('@/hooks/usePopularSearchTerms', () => ({
      usePopularSearchTerms: () => ({
        terms: mockTerms,
        isLoading: false,
        isError: false,
      }),
    }));

    render(<PopularSearchTerms />);

    expect(screen.getByText('제주도 맛집')).toBeInTheDocument();
    expect(screen.getByText('한라산 등반')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });
});
```

---

### @TEST:FEATURE-SEARCH-001-T06 - 로딩 상태 UI 검증

**Description**: 데이터 로딩 중 Skeleton UI 표시

**Given**:
- API 응답이 지연됨 (네트워크 느림)

**When**:
- `PopularSearchTerms` 컴포넌트 마운트
- `isLoading` 상태가 `true`

**Then**:
- Skeleton UI 또는 스피너 표시
- 5개의 placeholder 박스 렌더링 (키워드 위치 표시)
- 실제 키워드 텍스트는 표시되지 않음

**Automation**:
```typescript
describe('Loading state', () => {
  it('should display skeleton UI while loading', () => {
    jest.mock('@/hooks/usePopularSearchTerms', () => ({
      usePopularSearchTerms: () => ({
        terms: [],
        isLoading: true,
        isError: false,
      }),
    }));

    render(<PopularSearchTerms />);

    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    expect(screen.queryByText('제주도 맛집')).not.toBeInTheDocument();
  });
});
```

---

### @TEST:FEATURE-SEARCH-001-T07 - Fallback 키워드 표시 검증

**Description**: API 실패 시 기본 키워드 표시

**Given**:
- API 호출이 실패함 (500 에러 또는 네트워크 오류)

**When**:
- `usePopularSearchTerms` 훅이 에러 상태 반환

**Then**:
- 다음 기본 키워드가 표시됨:
  1. 제주도 맛집
  2. 한라산 등반
  3. 섭지코지
  4. 우도 여행
  5. 제주 카페
- 에러 메시지가 사용자에게 표시되지 않음 (Silent fallback)

**Automation**:
```typescript
describe('Error state', () => {
  it('should display fallback keywords on API error', () => {
    jest.mock('@/hooks/usePopularSearchTerms', () => ({
      usePopularSearchTerms: () => ({
        terms: FALLBACK_TERMS.map((keyword, index) => ({
          rank: index + 1,
          keyword,
          popularity: 0,
        })),
        isLoading: false,
        isError: true,
      }),
    }));

    render(<PopularSearchTerms />);

    expect(screen.getByText('제주도 맛집')).toBeInTheDocument();
    expect(screen.getByText('한라산 등반')).toBeInTheDocument();
    expect(screen.queryByText('Error')).not.toBeInTheDocument(); // No error UI
  });
});
```

---

## 3. E2E User Flow Tests (종단 간 사용자 플로우 테스트)

### @TEST:FEATURE-SEARCH-001-T08 - 키워드 클릭 시 검색 페이지 이동

**Description**: 인기검색어 클릭 시 검색 페이지로 라우팅

**Given**:
- 메인 페이지에서 5개의 인기검색어 표시됨
- 두 번째 키워드가 "한라산 등반"

**When**:
- 사용자가 "한라산 등반" 배지 클릭

**Then**:
- 브라우저 URL이 `/search?q=%ED%95%9C%EB%9D%BC%EC%82%B0%20%EB%93%B1%EB%B0%98`으로 변경 (URL 인코딩)
- 검색 페이지가 로드됨
- 검색 결과에 "한라산 등반" 관련 질문들 표시
- 페이지 전환 시 로딩 인디케이터 표시

**Automation** (Playwright):
```typescript
// fast-playwright MCP 도구를 사용한 E2E 테스트
// 다음 도구들을 순차적으로 호출하여 테스트 실행:

const testPopularSearchNavigation = async () => {
  // 1. 메인 페이지 네비게이션
  await browser_navigate({ url: "http://localhost:3000" });

  // 2. 인기 검색어 로드 대기
  await browser_wait_for({ text: "한라산 등반" });

  // 3. "한라산 등반" 키워드 클릭
  await browser_click({ selectors: [{ text: "한라산 등반" }] });

  // 4. 검색 페이지 로드 확인
  await browser_wait_for({ text: "검색 결과" });

  // 5. 페이지 상태 스냅샷 (아리아 형식)
  const snapshot = await browser_snapshot();

  // 6. 네트워크 요청 검증 (검색 API 호출 확인)
  const requests = await browser_network_requests({ 
    urlPatterns: ["/search\?q="] 
  });

  // Assertion
  console.assert(requests.length > 0, "Search API should be called");
  console.assert(snapshot.includes("검색 결과"), "Search results page should be displayed");
};
```

---

### @TEST:FEATURE-SEARCH-001-T09 - 모바일 반응형 UI 검증

**Description**: 모바일 화면에서 인기검색어가 올바르게 표시되어야 함

**Given**:
- 뷰포트 크기: 375px × 667px (iPhone SE)
- 메인 페이지 접속

**When**:
- 페이지 로드 완료

**Then**:
- 인기검색어가 수평 스크롤 또는 2줄로 표시
- 각 키워드 배지가 터치 가능한 크기 (최소 44px × 44px)
- 텍스트가 말줄임표 없이 완전히 표시
- 스크롤 없이 모든 UI 요소 접근 가능

**Automation** (Playwright):
```typescript
// fast-playwright MCP를 사용한 모바일 테스트
const testMobileResponsiveness = async () => {
  // 1. 브라우저 뷰포트 설정 (375x667 - iPhone SE)
  await browser_resize({ width: 375, height: 667 });
  // 2. 메인 페이지 네비게이션
  await browser_navigate({ url: "http://localhost:3000" });
  // 3. 인기 검색어 배지들 검증 (모두 5개)
  const badges = await browser_find_elements({
    searchCriteria: { role: "button" }
  });
  console.assert(badges.length === 5);
}

// 예전 테스트
test('should display properly on mobile viewport', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  // Check component visibility
  const searchTerms = page.locator('[data-testid="popular-search-terms"]');
  await expect(searchTerms).toBeVisible();

  // Check touch target size
  const firstBadge = searchTerms.locator('button').first();
  const boundingBox = await firstBadge.boundingBox();
  expect(boundingBox.height).toBeGreaterThanOrEqual(44);
});
```

---

### @TEST:FEATURE-SEARCH-001-T10 - 실시간 데이터 갱신 검증 (캐시 만료 후)

**Description**: 캐시 만료 후 새로운 인기검색어 반영

**Given**:
- 메인 페이지 접속 후 인기검색어 표시 (캐시 생성)
- 1시간 경과 (캐시 TTL 만료)
- 데이터베이스에 더 인기 있는 새로운 질문 추가

**When**:
- 페이지 새로고침

**Then**:
- API가 새로운 데이터 쿼리 실행
- 갱신된 인기검색어 리스트 표시
- 새로 추가된 질문의 키워드가 상위 5개에 포함됨

**Manual Test** (자동화 어려움 - 시간 의존성):
1. 메인 페이지 접속
2. 브라우저 DevTools에서 캐시 타임스탬프 확인
3. 서버 시간을 1시간 앞으로 조정 (테스트 환경)
4. 데이터베이스에 인기도 높은 질문 추가
5. 페이지 새로고침
6. 새로운 키워드가 표시되는지 확인

---

## 4. Performance Tests (성능 테스트)

### @TEST:FEATURE-SEARCH-001-T11 - API 응답 시간 검증

**Description**: API가 성능 요구사항을 충족해야 함

**Given**:
- 데이터베이스에 1000개의 Question 데이터 존재
- 서버 정상 운영 상태

**When**:
- 100회의 동시 API 호출 실행

**Then**:
- P95 응답 시간이 200ms 이내
- P99 응답 시간이 500ms 이내
- 에러율 0% (모든 요청 성공)

**Automation** (Artillery):
```yaml
# artillery-load-test.yml
config:
  target: "http://localhost:3001"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - get:
          url: "/api/search/popular"
          expect:
            - statusCode: 200
            - contentType: json
            - hasProperty: data
```

**Run Command**:
```bash
artillery run artillery-load-test.yml
```

---

## 5. Quality Gates (품질 게이트)

### Minimum Acceptance Criteria

기능이 Production으로 배포되기 위해서는 다음 기준을 **모두** 충족해야 합니다:

- [ ] **Backend Tests**: 모든 API 테스트 통과 (T01, T02, T03, T04)
- [ ] **Frontend Tests**: 모든 컴포넌트 테스트 통과 (T05, T06, T07)
- [ ] **E2E Tests**: 핵심 사용자 플로우 테스트 통과 (T08, T09)
- [ ] **Performance**: API P95 응답 시간 < 200ms (T11)
- [ ] **Code Coverage**:
  - Backend: > 90% line coverage
  - Frontend: > 80% line coverage
- [ ] **Accessibility**: WCAG 2.1 AA 수준 준수 (자동 검증 도구)
- [ ] **Visual Regression**: UI 스크린샷 비교 통과 (변경 사항 없음)
- [ ] **Manual QA**: 최소 2명의 팀원이 기능 검증 완료

---

## 6. Test Execution Plan (테스트 실행 계획)

### Pre-commit (Local Development)
```bash
# Unit tests only (fast feedback)
npm run test:unit
```

### Pre-push (CI Pipeline)
```bash
# Full test suite
npm run test:all
npm run test:e2e
npm run test:performance
```

### Pre-merge (GitHub Actions)
```yaml
# .github/workflows/spec-validation.yml
- name: Run SPEC Tests
  run: |
    npm run test:spec:FEATURE-SEARCH-001
    npm run test:e2e:popular-search
```

---

## 7. Definition of Done (완료 정의)

이 SPEC은 다음 조건이 **모두** 충족될 때 완료된 것으로 간주됩니다:

1. ✅ 모든 Acceptance Criteria 테스트 통과
2. ✅ Code review 완료 (최소 1명 승인)
3. ✅ Documentation 동기화 완료 (`/alfred:3-sync`)
4. ✅ Production 환경 배포 성공
5. ✅ Smoke test 통과 (실제 사용자 데이터로 검증)
6. ✅ Traceability 체인 완성 (@SPEC → @TEST → @CODE → @DOC)

---

**END OF ACCEPTANCE CRITERIA**
