---
id: DEBUG-QUESTION-DETAIL-001
version: 0.0.1
status: draft
created: 2025-11-02
updated: 2025-11-02
author: @user
priority: critical
category: bug-fix
scope: full-stack
---

# @SPEC:DEBUG-QUESTION-DETAIL-001: 질문 상세보기 페이지 에러 진단 및 수정

## HISTORY

### v0.0.1 (2025-11-02)

- **INITIAL**: 질문 상세보기 페이지 에러 버그 리포트
- **AUTHOR**: @user
- **SCOPE**: API 응답 검증, Frontend 데이터 매핑, 컴포넌트 연동
- **CONTEXT**: 최근 에러 핸들링 개선 이후 발생한 지속적인 에러

---

## Environment

**Frontend**:

- Framework: Next.js 14.2.33
- Runtime: React 18
- Language: TypeScript 5.x
- Port: 3001 (development)
- UI Library: @jeju-tourlist/ui, lucide-react

**Backend**:

- Framework: Express.js
- Language: TypeScript 5.x
- ORM: Prisma 5.22.0
- Port: 4000 (development)
- Database: PostgreSQL 12+ (port 5433)

**Current Versions**:

- Node.js: 18+
- npm: 9+

---

## Assumptions

1. 사용자는 로그인 여부와 상관없이 질문 상세보기 페이지 접근 가능
2. `optionalAuthMiddleware`는 정상 작동 중
3. `FacebookAnswerThread` 컴포넌트는 안정적이고 올바른 props 구조 필요
4. API 응답에서 모든 필드는 명시적 기본값을 가져야 함
5. 최상위 답변과 중첩 댓글은 별도 처리 필요

---

## Requirements

### Ubiquitous

- The system must provide question detail page without errors regardless of authentication state
- The system must fetch complete question data from API including author and category information
- The system must display answer list with proper nested comment structure
- The system must handle all API response edge cases gracefully

### Event-driven

- **WHEN** user navigates to `/questions/[id]`, the system must call `GET /api/questions/:id` with optional user context
- **WHEN** API responds with 200 status code, the system must render question details and answers correctly
- **WHEN** API responds with 404 status code, the system must display user-friendly error message
- **WHEN** API returns error response, the system must display appropriate error banner with countdown timer
- **WHEN** user submits answer without authentication, the system must redirect to login page after 1.5 seconds
- **WHEN** user performs like/dislike/adopt action, the system must handle response and update UI state

### State-driven

- **WHILE** page is loading, the system must display loading spinner
- **WHILE** question data is available, the system must maintain question state in React state
- **WHILE** answers are being displayed, the system must filter top-level answers only
- **WHILE** user is interacting with answers, the system must show loading state and error messages with countdown

### Optional

- IF question has attachments, the system can display images in grid layout with lightbox functionality
- IF user is question author, the system can show delete button
- IF user is authenticated, the system can show answer submission form

### Constraints

- **IF** API response format differs from expected structure, the system MUST handle data mapping with type validation
- **IF** user is not authenticated, the system MUST still load and display public data without errors
- **IF** optional fields (avatar, category, etc.) are null, the system MUST provide default fallback values
- **IF** boolean fields (isLiked, isDisliked) are undefined, the system MUST initialize with false

---

## Root Cause Analysis

### Issue #1: API 응답 구조 불일치 (Critical)

**Problem**:

- Backend `QuestionService.getQuestionById()`가 최상위 답변과 중첩 댓글을 하나의 배열로 flatten하여 반환
- Frontend의 `answers` 상태에 모든 항목(답변 + 중첩 댓글)이 포함됨
- `FacebookAnswerThread`는 중첩 구조를 자체적으로 관리하므로, flat 배열을 받으면 렌더링 오류 발생

**Evidence**:

```typescript
// 현재 API 응답 구조 (문제)
{
  data: {
    answers: [
      { id: "ans-1", content: "..." }, // 최상위 답변
      { id: "comment-1", parentId: "ans-1" }, // 중첩 댓글 (별도 배열 항목)
      { id: "ans-2", content: "..." }, // 또 다른 최상위 답변
    ];
  }
}
```

**Impact**:

- 중첩 댓글이 별도 답변으로 렌더링됨
- 댓글 카운트 오류
- 사용자 경험 저하

### Issue #2: 사용자 반응 기본값 누락 (Critical)

**Problem**:

- 비로그인 사용자 또는 반응 데이터가 없을 때 `isLiked`, `isDisliked`, `isAuthor`, `isQuestionAuthor` 필드가 `undefined`
- Frontend에서 `if (answer.isLiked)` 체크 시 Boolean 대신 undefined 반환
- 버튼 상태 관리 오류 및 타입 체크 실패

**Evidence**:

```typescript
// Backend에서 반환되는 답변 (문제)
{
  id: 'ans-1',
  content: '...',
  likeCount: 5,
  isLiked: undefined,      // ❌ Boolean이 아님
  isDisliked: undefined,   // ❌ Boolean이 아님
  isAuthor: undefined,     // ❌ Boolean이 아님
}
```

**Impact**:

- React 렌더링 경고
- 버튼 상태 토글 실패
- 좋아요/싫어요 카운트 오류

### Issue #3: TypeScript 타입 안전성 부족 (High)

**Problem**:

- Frontend `Answer` 인터페이스와 실제 API 응답 구조가 불일치
- 런타임에 필드가 누락되거나 타입이 다를 수 있음
- TypeScript strict mode에서 컴파일 경고 발생

**Evidence**:

```typescript
// Frontend 정의 (page.tsx)
interface Answer {
  isLiked?: boolean;
  isDisliked?: boolean;
}

// Backend 응답
{
  isLiked: undefined;
} // ❌ optional이지만 실제로는 undefined
```

**Impact**:

- 타입 체크 부족
- 런타임 에러 가능성
- 개발자 경험 저하

### Issue #4: 필드명 불일치 (Medium)

**Problem**:

- Backend에서 `commentCount`로 정의
- Frontend에서 `replyCount`로 사용
- 데이터 손실 또는 잘못된 카운트 표시

**Evidence**:

```typescript
// Backend Answer 모델
likeCount: Int;
dislikeCount: Int; // ❌ Snake case와 camelCase 혼용

// Frontend에서 기대하는 구조
replyCount: number; // ❌ commentCount 아님
```

**Impact**:

- 댓글 수 표시 오류
- 중첩 댓글 렌더링 실패

### Issue #5: Null 안전성 부족 (Medium)

**Problem**:

- Optional 필드(`avatar`, `category`, `parentId`)의 null 처리 불충분
- Null reference 에러 가능성
- Falsy 값 처리 부정확

**Evidence**:

```typescript
// Frontend 코드
<img src={question.author.avatar} />  // ❌ avatar가 null이면 에러
<span>{question.category.name}</span>  // ❌ category가 null이면 에러
```

**Impact**:

- 런타임 에러 발생
- UI 렌더링 실패
- 타입 안전성 감소

---

## Identified Issues Summary

| #   | Issue                | Severity | Root Cause           | Impact                |
| --- | -------------------- | -------- | -------------------- | --------------------- |
| 1   | API 응답 구조 불일치 | Critical | Backend flatten 로직 | 답변/댓글 렌더링 오류 |
| 2   | 기본값 누락          | Critical | Backend 응답 생성    | Boolean 체크 실패     |
| 3   | 타입 안전성          | High     | Frontend 타입 정의   | 런타임 에러 가능      |
| 4   | 필드명 불일치        | Medium   | API 설계             | 데이터 손실           |
| 5   | Null 안전성          | Medium   | Frontend 처리        | Reference 에러        |

---

## Diagnostics Checklist

- [ ] **API 엔드포인트**: GET /api/questions/:id 응답 형식 검증
- [ ] **미들웨어**: optionalAuthMiddleware 동작 확인 (인증/미인증)
- [ ] **응답 데이터**: 최상위 답변 vs 중첩 댓글 구조 확인
- [ ] **사용자 반응**: isLiked, isDisliked 기본값 확인
- [ ] **필드명**: commentCount vs replyCount 통일 여부
- [ ] **Null 처리**: Optional 필드 기본값 설정
- [ ] **타입 매칭**: API 응답과 Frontend 인터페이스 일치
- [ ] **에러 핸들링**: 에러 응답 처리 로직
- [ ] **브라우저 콘솔**: 네트워크 에러 및 JavaScript 에러 확인
- [ ] **네트워크 탭**: 실제 API 응답 형식 검사

---

## Expected Deliverables

### Phase 1: Backend 응답 정규화 (QuestionService.ts)

- [ ] 모든 boolean 필드에 명시적 기본값 설정
- [ ] 사용자 반응 데이터 로드 및 매핑 로직
- [ ] 단위 테스트 작성 (기본값 검증)
- [ ] 타입 안전성 검증

### Phase 2: Frontend 데이터 필터링 (page.tsx)

- [ ] 최상위 답변만 필터링 로직
- [ ] 데이터 유효성 검사 함수 구현
- [ ] Null coalescing 연산자 적용
- [ ] 단위 테스트 작성

### Phase 3: 타입 안전성 강화

- [ ] 런타임 데이터 검증 함수
- [ ] TypeScript 인터페이스 업데이트
- [ ] 에러 바운더리 개선
- [ ] 통합 테스트

---

## Implementation Success Criteria

✅ **Functional**:

- Question detail page loads without errors
- Answer list displays correctly with proper nesting
- All user interactions (like/dislike/adopt) work as expected
- Error messages display with proper countdown timer

✅ **Quality**:

- TypeScript strict mode compliance
- ESLint 경고 0건
- 테스트 커버리지 > 80%
- E2E 테스트 100% 통과

✅ **Performance**:

- Initial load < 2초
- API response time < 500ms
- No console errors/warnings

---

## Traceability

- **@SPEC**: @SPEC:DEBUG-QUESTION-DETAIL-001
- **@TEST**: tests/e2e/question-detail.spec.ts
- **@CODE**:
  - apps/api/src/services/question/QuestionService.ts
  - apps/web/src/app/questions/[id]/page.tsx
- **@DOC**: docs/API-QUESTION-DETAIL.md
