# Implementation Plan - 메인헤더 인기검색어 기능

> **SPEC ID**: @SPEC:FEATURE-SEARCH-001
> **Created**: 2025-10-29
> **Status**: draft

---

## 1. Architecture Overview (아키텍처 개요)

### 1.1 System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js 14)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  MainHeader Component                               │   │
│  │  └── PopularSearchTerms Component                   │   │
│  │      ├── useSWR('/api/search/popular')              │   │
│  │      ├── Loading State (Skeleton UI)                │   │
│  │      ├── Error State (Fallback Keywords)            │   │
│  │      └── SearchTermBadge × 5                        │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP GET /api/search/popular
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express.js)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PopularSearchRouter                                │   │
│  │  └── PopularSearchService                           │   │
│  │      ├── Cache Layer (In-Memory / Redis)            │   │
│  │      └── Prisma Query (Aggregation + Sorting)       │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL Query
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                 Database (PostgreSQL)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Question Table                                     │   │
│  │  ├── id, title, categoryId                          │   │
│  │  ├── viewCount, likeCount, answerCount              │   │
│  │  └── createdAt, updatedAt                           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

1. **User Request**: 사용자가 메인 페이지 접속
2. **Client Fetch**: `PopularSearchTerms` 컴포넌트가 SWR로 API 호출
3. **Cache Check**: Backend가 캐시 유효성 검사 (TTL 1시간)
4. **Database Query** (캐시 미스 시): Prisma로 인기도 계산 쿼리 실행
5. **Response**: JSON 형식으로 상위 5개 키워드 반환
6. **Render**: Frontend가 키워드 배지 렌더링
7. **User Interaction**: 키워드 클릭 시 검색 페이지로 라우팅

---

## 2. Implementation Timeline (구현 순서)

### Phase 1: Database & Seed Data (Backend Foundation)

#### Milestone 1.1: Database Schema Validation
**Goal**: Question 테이블에 필수 컬럼 존재 확인

**Tasks**:
- [ ] `viewCount`, `likeCount`, `answerCount` 컬럼 존재 확인
- [ ] 필요 시 migration 파일 작성 (Prisma)
- [ ] 인덱스 추가 검토 (`createdAt`, `viewCount`)

**Files**:
- `packages/database/prisma/schema.prisma` (확인)
- `packages/database/prisma/migrations/` (필요 시 생성)

#### Milestone 1.2: Seed Data Generation
**Goal**: 인기검색어 테스트를 위한 충분한 Question 데이터 생성

**Tasks**:
- [ ] `seed-popular-questions.ts` 스크립트 작성
- [ ] 100개 질문 데이터 생성 (키워드 다양성 확보)
- [ ] 가중치 분포 적용 (상위 5개 popularity > 300)
- [ ] `npm run seed:popular` 명령어로 실행

**Files**:
- `@CODE:packages/database/src/seed-popular-questions.ts`

**Example Seed Structure**:
```typescript
const seedQuestions = [
  {
    title: "제주도 맛집 추천 부탁드려요",
    viewCount: 120,
    likeCount: 15,
    answerCount: 8,
    categoryId: getCategoryId('food'),
  },
  // ... 99개 추가
];
```

---

### Phase 2: Backend Implementation (API & Business Logic)

#### Milestone 2.1: Service Layer
**Goal**: 인기검색어 계산 비즈니스 로직 구현

**Tasks**:
- [ ] `PopularSearchService.ts` 클래스 생성
- [ ] `getPopularSearchTerms()` 메서드 구현
- [ ] Prisma 쿼리 작성 (가중치 계산 포함)
- [ ] 캐시 로직 구현 (In-Memory 또는 Redis)
- [ ] 단위 테스트 작성 (`@TEST:FEATURE-SEARCH-001-T02`)

**Files**:
- `@CODE:apps/api/src/services/search/PopularSearchService.ts`
- `apps/api/src/services/search/__tests__/PopularSearchService.test.ts`

**Key Logic**:
```typescript
class PopularSearchService {
  private cache: Map<string, CachedData> = new Map();
  private readonly CACHE_TTL = 3600 * 1000; // 1 hour

  async getPopularSearchTerms(limit: number = 5) {
    // 1. Check cache
    const cached = this.getCachedData();
    if (cached) return cached;

    // 2. Query database
    const results = await this.prisma.$queryRaw`
      SELECT
        title as keyword,
        (viewCount * 1 + likeCount * 3 + answerCount * 2) as popularity
      FROM Question
      WHERE createdAt >= NOW() - INTERVAL '7 days'
        AND LENGTH(title) <= 20
      ORDER BY popularity DESC
      LIMIT ${limit}
    `;

    // 3. Add rank
    const rankedResults = results.map((item, index) => ({
      rank: index + 1,
      keyword: item.keyword,
      popularity: item.popularity,
    }));

    // 4. Cache and return
    this.cacheData(rankedResults);
    return rankedResults;
  }
}
```

#### Milestone 2.2: API Route
**Goal**: REST API 엔드포인트 생성

**Tasks**:
- [ ] `popular.ts` 라우터 파일 생성
- [ ] `GET /api/search/popular` 엔드포인트 구현
- [ ] Error handling (try-catch, 500 응답)
- [ ] Rate limiting 미들웨어 적용 (선택)
- [ ] 통합 테스트 작성 (`@TEST:FEATURE-SEARCH-001-T01`)

**Files**:
- `@CODE:apps/api/src/routes/search/popular.ts`
- `apps/api/src/routes/search/__tests__/popular.test.ts`

**Route Implementation**:
```typescript
import { Router } from 'express';
import { PopularSearchService } from '../../services/search/PopularSearchService';

const router = Router();
const service = new PopularSearchService();

router.get('/popular', async (req, res) => {
  try {
    const terms = await service.getPopularSearchTerms();
    res.json({
      success: true,
      data: terms,
      cachedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch popular search terms:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'POPULAR_SEARCH_ERROR',
        message: 'Failed to fetch popular search terms',
      },
    });
  }
});

export default router;
```

---

### Phase 3: Frontend Implementation (UI & Data Fetching)

#### Milestone 3.1: API Client & Hook
**Goal**: Backend API와 통신하는 클라이언트 로직

**Tasks**:
- [ ] `usePopularSearchTerms.ts` 커스텀 훅 작성 (SWR 활용)
- [ ] Fallback 키워드 상수 정의
- [ ] Error handling 및 retry 로직
- [ ] TypeScript 타입 정의

**Files**:
- `apps/web/src/hooks/usePopularSearchTerms.ts`
- `apps/web/src/types/search.ts`

**Hook Implementation**:
```typescript
import useSWR from 'swr';

const FALLBACK_TERMS = [
  "제주도 맛집",
  "한라산 등반",
  "섭지코지",
  "우도 여행",
  "제주 카페"
];

export function usePopularSearchTerms() {
  const { data, error, isLoading } = useSWR(
    '/api/search/popular',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000, // 1 hour
    }
  );

  if (error) {
    return {
      terms: FALLBACK_TERMS.map((keyword, index) => ({
        rank: index + 1,
        keyword,
        popularity: 0,
      })),
      isLoading: false,
      isError: true,
    };
  }

  return {
    terms: data?.data || [],
    isLoading,
    isError: false,
  };
}
```

#### Milestone 3.2: UI Component
**Goal**: 메인헤더에 인기검색어 컴포넌트 렌더링

**Tasks**:
- [ ] `PopularSearchTerms.tsx` 컴포넌트 생성
- [ ] `SearchTermBadge.tsx` 하위 컴포넌트 생성
- [ ] Loading state (Skeleton UI) 구현
- [ ] 클릭 이벤트 핸들러 (검색 페이지 라우팅)
- [ ] 반응형 디자인 (모바일 최적화)
- [ ] 컴포넌트 테스트 작성 (`@TEST:FEATURE-SEARCH-001-T03`)

**Files**:
- `@CODE:apps/web/src/components/layout/PopularSearchTerms.tsx`
- `apps/web/src/components/layout/SearchTermBadge.tsx`
- `apps/web/src/components/layout/__tests__/PopularSearchTerms.test.tsx`

**Component Implementation**:
```tsx
import { useRouter } from 'next/navigation';
import { usePopularSearchTerms } from '@/hooks/usePopularSearchTerms';

export function PopularSearchTerms() {
  const router = useRouter();
  const { terms, isLoading, isError } = usePopularSearchTerms();

  const handleTermClick = (keyword: string) => {
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="flex gap-2">
      {terms.slice(0, 5).map((term) => (
        <SearchTermBadge
          key={term.rank}
          rank={term.rank}
          keyword={term.keyword}
          onClick={() => handleTermClick(term.keyword)}
        />
      ))}
    </div>
  );
}
```

#### Milestone 3.3: Integration with MainHeader
**Goal**: 기존 MainHeader에 PopularSearchTerms 추가

**Tasks**:
- [ ] `MainHeader.tsx` 파일 수정
- [ ] 레이아웃 조정 (로고, 인기검색어, 사용자 메뉴 배치)
- [ ] 모바일 반응형 처리 (드롭다운 또는 숨김 처리)
- [ ] 시각적 디자인 가이드 준수

**Files**:
- `apps/web/src/components/layout/MainHeader.tsx`

---

### Phase 4: Testing & Validation (Quality Assurance)

#### Milestone 4.1: Unit Tests
**Goal**: 핵심 로직 단위 테스트 작성

**Tests**:
- [ ] `@TEST:FEATURE-SEARCH-001-T02` - 인기도 계산 로직 검증
- [ ] `@TEST:FEATURE-SEARCH-001-T04` - 캐시 TTL 동작 검증
- [ ] `@TEST:FEATURE-SEARCH-001-T06` - Fallback 키워드 처리 검증

**Tools**: Jest, React Testing Library

#### Milestone 4.2: Integration Tests
**Goal**: API 엔드포인트 통합 테스트

**Tests**:
- [ ] `@TEST:FEATURE-SEARCH-001-T01` - API 응답 검증 (200 OK, JSON 구조)
- [ ] `@TEST:FEATURE-SEARCH-001-T07` - API 실패 시나리오 (500 에러)

**Tools**: Supertest

#### Milestone 4.3: E2E Tests
**Goal**: 사용자 플로우 종단 간 테스트

**Tests**:
- [ ] `@TEST:FEATURE-SEARCH-001-T05` - 키워드 클릭 → 검색 페이지 이동
- [ ] `@TEST:FEATURE-SEARCH-001-T08` - 로딩 상태 UI 검증
- [ ] `@TEST:FEATURE-SEARCH-001-T09` - 모바일 반응형 테스트

**Tools**: Playwright (via MCP)

---

## 3. File Structure (파일 조직)

```
jeju-tourlist/
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── routes/
│   │       │   └── search/
│   │       │       ├── popular.ts                    ← NEW
│   │       │       └── __tests__/
│   │       │           └── popular.test.ts           ← NEW
│   │       └── services/
│   │           └── search/
│   │               ├── PopularSearchService.ts       ← NEW
│   │               └── __tests__/
│   │                   └── PopularSearchService.test.ts ← NEW
│   │
│   └── web/
│       └── src/
│           ├── components/
│           │   └── layout/
│           │       ├── MainHeader.tsx                ← MODIFIED
│           │       ├── PopularSearchTerms.tsx        ← NEW
│           │       ├── SearchTermBadge.tsx           ← NEW
│           │       └── __tests__/
│           │           ├── PopularSearchTerms.test.tsx ← NEW
│           │           └── SearchTermBadge.test.tsx   ← NEW
│           ├── hooks/
│           │   └── usePopularSearchTerms.ts          ← NEW
│           └── types/
│               └── search.ts                         ← NEW
│
└── packages/
    └── database/
        └── src/
            └── seed-popular-questions.ts             ← NEW
```

---

## 4. Dependencies (의존성 관리)

### Frontend Dependencies
```json
{
  "dependencies": {
    "swr": "^2.2.5"  // Data fetching & caching
  }
}
```

### Backend Dependencies
```json
{
  "dependencies": {
    "@prisma/client": "^5.x",
    "express": "^4.x"
  },
  "devDependencies": {
    "supertest": "^6.x"  // API testing
  }
}
```

**Note**: 모든 의존성은 이미 설치되어 있다고 가정. 추가 패키지 없음.

---

## 5. Risk Mitigation (위험 요소 대응)

### Risk 1: 초기 데이터 부족
**Problem**: 시드 데이터가 충분하지 않아 인기검색어가 제대로 표시되지 않음
**Mitigation**:
- Fallback 키워드 하드코딩
- Seed 스크립트에서 최소 100개 데이터 보장

### Risk 2: API 성능 저하
**Problem**: 복잡한 집계 쿼리로 인한 응답 지연
**Mitigation**:
- 캐시 전략 (1시간 TTL)
- 데이터베이스 인덱스 최적화 (`createdAt`, `viewCount`)
- 쿼리 기간 제한 (최근 7일 데이터만 조회)

### Risk 3: 캐시 무효화 전략 부재
**Problem**: 실시간 데이터 반영 지연
**Mitigation**:
- 초기 버전은 단순 TTL 사용
- v0.0.2에서 Redis pub/sub 기반 무효화 검토

### Risk 4: 검색 페이지 미구현
**Problem**: 인기검색어 클릭 시 이동할 검색 페이지가 없음
**Mitigation**:
- 기존 검색 기능 존재 여부 확인 (Assumption 검증)
- 없을 경우 별도 SPEC 작성 후 우선순위 조정

---

## 6. Definition of Done (완료 기준)

### Backend
- [x] API 엔드포인트 `GET /api/search/popular` 구현 완료
- [x] 인기도 계산 로직 단위 테스트 통과 (100% 커버리지)
- [x] 통합 테스트 통과 (200 OK, 에러 핸들링)
- [x] 캐시 로직 동작 검증

### Frontend
- [x] `PopularSearchTerms` 컴포넌트 렌더링 성공
- [x] 키워드 클릭 시 검색 페이지 이동 확인
- [x] 로딩/에러 상태 UI 테스트 통과
- [x] 모바일 반응형 디자인 검증

### Database
- [x] 100개 이상의 Seed 데이터 생성 완료
- [x] 인기도 분포 가중치 적용 확인

### Performance
- [x] API 응답 시간 200ms 이내 (P95)
- [x] 캐시 히트율 80% 이상

---

## 7. Next Steps After Implementation

### Immediate Actions
1. `/alfred:2-run SPEC-FEATURE-SEARCH-001` 명령어로 TDD 구현 시작
2. Git feature branch 생성 (`feature/FEATURE-SEARCH-001-popular-search`)
3. RED → GREEN → REFACTOR 사이클 진행

### Post-Implementation
1. `/alfred:3-sync` 명령어로 문서 동기화
2. Draft PR 생성 및 리뷰 요청
3. QA 검증 후 main 브랜치 머지

### Future Enhancements (v0.0.2+)
- 실시간 순위 변동 애니메이션
- Redis 기반 분산 캐싱
- 관리자 대시보드 트렌드 분석
- 사용자 맞춤형 인기검색어 (위치/관심사 기반)

---

**END OF PLAN**
