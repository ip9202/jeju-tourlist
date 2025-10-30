---
id: FEATURE-SEARCH-001
version: 0.0.1
status: draft
created: 2025-10-29
updated: 2025-10-29
author: "@developer"
priority: medium
complexity: medium
tags: [feature, search, popular-keywords, real-time, frontend, backend]
---

# @SPEC:FEATURE-SEARCH-001 메인헤더 인기검색어 기능

## HISTORY

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 0.0.1 | 2025-10-29 | @developer | INITIAL - 실시간 인기검색어 기능 초안 작성 |

---

## 1. Environment (환경)

### 1.1 시스템 환경
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Deployment**: Vercel (Frontend), Node.js server (Backend)
- **API Communication**: REST API (JSON)

### 1.2 기술 제약사항
- 브라우저: Chrome 90+, Safari 14+, Firefox 88+ (ES2020 지원 필수)
- 모바일 반응형 디자인 지원 (320px ~ 1920px)
- 접근성: WCAG 2.1 AA 수준 준수

### 1.3 성능 요구사항
- API 응답 시간: 200ms 이내 (P95)
- 캐시 전략: 1시간 TTL (서버 사이드 캐싱)
- 페이지 로드 영향: 200ms 이하 추가 지연

---

## 2. Assumptions (가정)

### 2.1 데이터 가정
- Question 테이블에 `viewCount`, `likeCount`, `answerCount` 컬럼이 이미 존재함
- 최소 100개 이상의 질문 데이터가 시드 데이터로 제공됨
- 인기도 계산 공식: `viewCount * 1 + likeCount * 3 + answerCount * 2`

### 2.2 사용자 행동 가정
- 인기검색어 클릭 시 해당 키워드로 검색 페이지로 이동
- 사용자는 최신 트렌드 키워드를 선호함
- 모바일 사용자는 터치 제스처로 키워드 선택

### 2.3 시스템 가정
- Redis 또는 in-memory 캐싱 솔루션 사용 가능
- 백엔드 API는 CORS 설정 완료 상태
- 기존 검색 기능 인프라 존재 (검색 페이지, 쿼리 파라미터 처리)

---

## 3. Requirements (요구사항)

### 3.1 Ubiquitous Requirements (보편적 요구사항)

#### @REQ:FEATURE-SEARCH-001-R01
**시스템은 실시간 인기검색어 상위 5개를 메인헤더에 표시해야 한다**

- **출처**: Product Owner 요구사항
- **근거**: 사용자 참여도 증대 및 트렌드 노출
- **제약**: 최대 5개 항목, 순위 표시 포함
- **검증**: UI 컴포넌트 렌더링 테스트, API 응답 검증

#### @REQ:FEATURE-SEARCH-001-R02
**인기도 계산은 viewCount, likeCount, answerCount의 가중치 합산으로 산정되어야 한다**

- **출처**: 기획 요구사항
- **공식**: `popularity = viewCount * 1 + likeCount * 3 + answerCount * 2`
- **근거**: 단순 조회수보다 상호작용(좋아요, 답변)에 높은 가중치 부여
- **검증**: 계산 로직 단위 테스트

### 3.2 Event-Driven Requirements (이벤트 기반 요구사항)

#### @REQ:FEATURE-SEARCH-001-R03
**사용자가 인기검색어를 클릭할 때, 해당 키워드로 검색 결과 페이지로 이동해야 한다**

- **Trigger**: 인기검색어 항목 클릭 이벤트
- **Action**: 검색 쿼리 파라미터에 키워드 포함하여 `/search?q={keyword}` 페이지로 라우팅
- **Response**: 검색 결과 페이지 렌더링 (로딩 상태 표시)
- **검증**: E2E 테스트 (Playwright)

#### @REQ:FEATURE-SEARCH-001-R04
**API 호출 실패 시, 시스템은 기본 인기검색어 목록으로 폴백해야 한다**

- **Trigger**: API 응답 오류 (네트워크 오류, 500 에러 등)
- **Action**: 하드코딩된 기본 키워드 리스트 렌더링
- **Response**: 오류 로그 기록, 사용자에게 에러 미노출
- **기본 키워드**: ["제주도 맛집", "한라산 등반", "섭지코지", "우도 여행", "제주 카페"]
- **검증**: API 실패 시뮬레이션 테스트

### 3.3 State-Driven Requirements (상태 기반 요구사항)

#### @REQ:FEATURE-SEARCH-001-R05
**시스템은 데이터 로딩 중, 로딩 상태를 시각적으로 표시해야 한다**

- **State**: `loading === true`
- **Action**: Skeleton UI 또는 스피너 표시
- **검증**: 로딩 상태 UI 테스트

#### @REQ:FEATURE-SEARCH-001-R06
**캐시된 데이터가 1시간 이내일 경우, 서버 재요청 없이 캐시 데이터를 사용해야 한다**

- **State**: `cacheTimestamp < currentTime - 3600s`
- **Action**: 캐시 데이터 반환 (API 요청 스킵)
- **검증**: 캐시 만료 시간 단위 테스트

### 3.4 Optional Requirements (선택적 요구사항)

#### @REQ:FEATURE-SEARCH-001-R07
**시스템은 인기검색어 순위 변동을 시각적으로 표시할 수 있다 (옵션)**

- **UI**: 순위 상승/하락 화살표 아이콘
- **조건**: 이전 캐시 데이터와 비교 가능한 경우에만 활성화
- **우선순위**: LOW (v0.0.2 이후 구현 고려)

### 3.5 Constraints (제약사항)

#### @CON:FEATURE-SEARCH-001-C01
**인기검색어는 최대 5개까지만 표시되어야 한다**

- **제약**: UI 레이아웃 공간 제약, 사용자 인지 부담 최소화

#### @CON:FEATURE-SEARCH-001-C02
**API 응답은 200ms 이내여야 한다 (P95 기준)**

- **제약**: 메인 페이지 로딩 성능 영향 최소화
- **검증**: 성능 테스트 (Artillery, k6)

#### @CON:FEATURE-SEARCH-001-C03
**인기검색어 키워드는 최대 20자로 제한되어야 한다**

- **제약**: UI 오버플로우 방지, 데이터베이스 인덱싱 효율성

---

## 4. Specifications (명세)

### 4.1 Backend API Specification

#### Endpoint: `GET /api/search/popular`

**Request**
```http
GET /api/search/popular
Accept: application/json
```

**Response (Success - 200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "keyword": "제주도 맛집",
      "popularity": 450,
      "trend": "up" // optional: "up", "down", "stable"
    },
    {
      "rank": 2,
      "keyword": "한라산 등반",
      "popularity": 380,
      "trend": "stable"
    },
    // ... 3개 항목 추가 (총 5개)
  ],
  "cachedAt": "2025-10-29T10:30:00.000Z"
}
```

**Response (Error - 500 Internal Server Error)**
```json
{
  "success": false,
  "error": {
    "code": "POPULAR_SEARCH_ERROR",
    "message": "Failed to fetch popular search terms"
  }
}
```

**Performance Requirements**
- Response Time: < 200ms (P95)
- Cache TTL: 3600s (1 hour)
- Rate Limit: 100 req/min per IP

### 4.2 Database Query Specification

**Popularity Calculation Query**
```sql
SELECT
  q.title AS keyword,
  (q.viewCount * 1 + q.likeCount * 3 + q.answerCount * 2) AS popularity,
  ROW_NUMBER() OVER (ORDER BY popularity DESC) AS rank
FROM Question q
WHERE q.createdAt >= NOW() - INTERVAL '7 days'
  AND LENGTH(q.title) <= 20
ORDER BY popularity DESC
LIMIT 5;
```

**Cache Key Structure**
```
popular_search_terms:{timestamp_hour}
```

### 4.3 Frontend Component Specification

**Component Hierarchy**
```
<MainHeader>
  ├── <Logo />
  ├── <PopularSearchTerms />  ← NEW
  │   ├── <SearchTermBadge /> × 5
  │   └── <LoadingState />
  └── <UserMenu />
```

**PopularSearchTerms Component Props**
```typescript
interface PopularSearchTerm {
  rank: number;
  keyword: string;
  popularity: number;
  trend?: 'up' | 'down' | 'stable';
}

interface PopularSearchTermsProps {
  maxItems?: number; // default: 5
  fallbackTerms?: string[];
  onTermClick?: (keyword: string) => void;
}
```

**State Management**
```typescript
type FetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success', data: PopularSearchTerm[] }
  | { status: 'error', fallbackData: string[] };
```

### 4.4 Seed Data Specification

**Requirements**
- 최소 100개의 Question 데이터 생성
- 키워드 분포: 50% 제주 관광지, 30% 맛집, 20% 기타
- 인기도 가중치 분포:
  - 상위 5개: popularity > 300
  - 중위 50개: 100 < popularity < 300
  - 하위 45개: popularity < 100

**Seed Data Structure**
```typescript
{
  title: "제주도 맛집 추천 부탁드려요",
  viewCount: 120,
  likeCount: 15,
  answerCount: 8,
  // popularity = 120*1 + 15*3 + 8*2 = 181
}
```

---

## 5. Traceability (추적성)

### 5.1 Related Tags
- `@TEST:FEATURE-SEARCH-001-T01` - API 엔드포인트 통합 테스트
- `@TEST:FEATURE-SEARCH-001-T02` - 인기도 계산 로직 단위 테스트
- `@TEST:FEATURE-SEARCH-001-T03` - Frontend 컴포넌트 렌더링 테스트
- `@TEST:FEATURE-SEARCH-001-T04` - API 실패 시 폴백 동작 테스트
- `@TEST:FEATURE-SEARCH-001-T05` - E2E 사용자 플로우 테스트 (클릭 → 검색 페이지)

### 5.2 Implementation Files
- `@CODE:apps/api/src/routes/search/popular.ts` - Backend API 라우트
- `@CODE:apps/api/src/services/search/PopularSearchService.ts` - 비즈니스 로직
- `@CODE:apps/web/src/components/layout/PopularSearchTerms.tsx` - Frontend 컴포넌트
- `@CODE:packages/database/src/seed-popular-questions.ts` - Seed 데이터 생성 스크립트

### 5.3 Documentation
- `@DOC:.moai/specs/SPEC-FEATURE-SEARCH-001/plan.md` - 구현 계획
- `@DOC:.moai/specs/SPEC-FEATURE-SEARCH-001/acceptance.md` - 인수 테스트 기준

---

## 6. Acceptance Criteria (간략 요약)

1. **API 동작**: `GET /api/search/popular` 호출 시 5개 키워드 반환 성공
2. **인기도 계산**: 가중치 공식 정확히 적용되어 순위 결정
3. **UI 렌더링**: 메인헤더에 5개 키워드 배지 표시 (순위 포함)
4. **클릭 동작**: 키워드 클릭 시 검색 페이지 이동 확인
5. **폴백 처리**: API 실패 시 기본 키워드 표시 확인
6. **성능**: API 응답 200ms 이내, 캐시 1시간 유지

---

## 7. Notes (참고사항)

### 7.1 향후 개선 계획 (v0.0.2+)
- 실시간 순위 변동 애니메이션
- 사용자 맞춤형 인기검색어 (위치 기반, 관심사 기반)
- 관리자 대시보드에서 인기검색어 트렌드 분석

### 7.2 알려진 제약사항
- 초기 시드 데이터 부족 시 기본 키워드 사용
- 캐시 무효화 전략은 단순 TTL 방식 (향후 Redis pub/sub 검토)

---

**END OF SPECIFICATION**
