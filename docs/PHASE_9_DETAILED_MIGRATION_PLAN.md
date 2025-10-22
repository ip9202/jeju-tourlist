# Phase 9: Feature Flag 마이그레이션 상세 계획서

**작성일**: 2025-10-22  
**상태**: 진행 중  
**버전**: v1.0

---

## 📋 목차

1. [현재 상태 분석](#현재-상태-분석)
2. [Phase 9 목표](#phase-9-목표)
3. [영향도 분석](#영향도-분석)
4. [구현 로드맵](#구현-로드맵)
5. [테스트 및 검증](#테스트-및-검증)
6. [위험 요소 및 대응](#위험-요소-및-대응)
7. [체크리스트](#체크리스트)

---

## 현재 상태 분석

### ✅ 이미 구현된 것

#### Facebook UI 컴포넌트 (완벽한 상태)

- **FacebookQuestionCard**: 질문 카드 (208줄)
- **FacebookAnswerCard**: 답변 카드 (193줄)
- **FacebookAnswerInput**: 답변/댓글 입력 (154줄)
- **FacebookAnswerThread**: 마스터 컴포넌트 (150+줄)
- **FacebookBadge**: 배지 (71줄)
- **types.ts**: 타입 정의 (96줄)
- **utils.ts**: 유틸리티 함수 (78줄)
- **facebook-qa.css**: 완전한 CSS 시스템 (645줄)

#### 통합

- 질문 상세 페이지 (`app/questions/[id]/page.tsx`) 라인 516-573에서 **직접 사용 중**
- API 데이터 변환 함수 (`lib/facebook-qa-converter.ts`) 준비됨

#### 테스트

- 단위 테스트 (25/25 통과)
- 통합 테스트 (21/21 통과)
- E2E 테스트 (9/9 통과)
- 접근성 테스트 (6/6 통과)
- **총 61/61 테스트 통과 (100%)**

### ❌ 아직 없는 것

#### Feature Flag 시스템

- `useNewFacebookUI` 훅: **미구현** ⏳
- 환경 변수: `NEXT_PUBLIC_USE_FACEBOOK_UI` **미설정** ⏳
- 조건부 렌더링: **적용 안 됨** ⏳

#### 현재 상황

```
현재 [질문 페이지] = 항상 Facebook UI 사용
                    ↓
필요한 상황 [질문 페이지] = Feature flag에 따라 선택
  - flag = true:  Facebook UI 사용
  - flag = false: 기존 UI 사용 (또는 다른 UI)
```

---

## Phase 9 목표

### 주 목표

✅ **Feature flag를 통한 선택적 UI 렌더링**

### 부 목표

1. 기존 로직 100% 보존 (절대 수정 금지)
2. 점진적 마이그레이션 가능하게 구조화
3. 성능 영향 최소화
4. 모니터링 기반 마련

---

## 영향도 분석

### 🔍 영향을 받을 파일 (변경 필요)

#### 1. **`.env.local`** (또는 `.env.development`)

```
현재: NEXT_PUBLIC_API_URL=http://localhost:4000/api

추가할 것:
NEXT_PUBLIC_USE_FACEBOOK_UI=true
```

**영향도**: 낮음 (환경 변수 추가만)

#### 2. **`apps/web/src/hooks/useNewFacebookUI.ts`** (신규 생성)

```typescript
export const useNewFacebookUI = () => {
  const useFacebookUI = process.env.NEXT_PUBLIC_USE_FACEBOOK_UI === "true";
  return { useFacebookUI };
};
```

**영향도**: 낮음 (새 파일)

#### 3. **`apps/web/src/app/questions/[id]/page.tsx`** (부분 수정)

```typescript
// 라인 516 근처 - 답변 섹션

// 변경 전:
<div className="bg-white rounded-lg shadow-md p-8 mb-8">
  {user && question ? (
    <FacebookAnswerThread {...} />
  ) : (
    // 비로그인
  )}
</div>

// 변경 후:
<div className="bg-white rounded-lg shadow-md p-8 mb-8">
  {user && question ? (
    useFacebookUI ? (
      <FacebookAnswerThread {...} />
    ) : (
      <LegacyAnswerComponent {...} />
    )
  ) : (
    // 비로그인
  )}
</div>
```

**영향도**: 중간 (조건부 렌더링 추가)

### 🟢 영향을 받지 않을 것 (절대 수정 금지)

- ❌ `question/facebook/` 폴더의 모든 컴포넌트
- ❌ `lib/facebook-qa-converter.ts`
- ❌ `styles/facebook-qa.css`
- ❌ API 호출 로직
- ❌ 데이터 모델 (types)

---

## 구현 로드맵

### 📍 Step 1: 환경 변수 설정 (5분)

**파일**: `.env.local`

```bash
# 현재 설정
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# 추가할 것
NEXT_PUBLIC_USE_FACEBOOK_UI=true
```

**주의사항**:

- `.env.local`은 git에 커밋하지 않음 (이미 `.gitignore`에 포함)
- 배포 환경에서도 환경 변수 설정 필요

### 📍 Step 2: useNewFacebookUI 훅 생성 (10분)

**파일**: `apps/web/src/hooks/useNewFacebookUI.ts` (신규)

```typescript
"use client";

/**
 * Facebook 스타일 Q&A UI 활성화 여부를 확인하는 훅
 * 환경 변수 NEXT_PUBLIC_USE_FACEBOOK_UI를 기반으로 판단
 *
 * @returns { useFacebookUI: boolean }
 *   - true: Facebook UI 사용
 *   - false: 기존 UI 사용
 *
 * @example
 * const { useFacebookUI } = useNewFacebookUI();
 * if (useFacebookUI) {
 *   return <FacebookAnswerThread {...props} />;
 * } else {
 *   return <LegacyAnswerComponent {...props} />;
 * }
 */
export const useNewFacebookUI = () => {
  // 환경 변수에서 읽기 (빌드 타임에 결정됨)
  const useFacebookUI = process.env.NEXT_PUBLIC_USE_FACEBOOK_UI === "true";

  return {
    useFacebookUI,
    // 향후 추가 기능을 위한 확장성
    isTransitioning: false,
  };
};

// 기본값 설정 (명시성을 위해)
export const DEFAULT_USE_FACEBOOK_UI = true;
```

**설계 원칙**:

- ✅ Simple & Clear (읽기 쉽게)
- ✅ Type-safe (TypeScript)
- ✅ Extensible (향후 확장 가능)
- ✅ No side effects (순수 함수)

**왜 이렇게 설계했나?**

1. **환경 변수 기반**: 배포 후에도 동적 변경 불가능 (의도적)
2. **Client Component**: 브라우저에서 조건부 렌더링 필요
3. **반환값 객체**: 향후 추가 필드 추가 용이

### 📍 Step 3: 질문 상세 페이지 수정 (10분)

**파일**: `apps/web/src/app/questions/[id]/page.tsx`

```typescript
// 라인 최상단 imports에 추가
import { useNewFacebookUI } from '@/hooks/useNewFacebookUI';
import { FacebookAnswerThread } from '@/components/question/facebook';
import { LegacyAnswerComponent } from '@/components/question/legacy'; // 향후 필요 시

// 컴포넌트 내부 (라인 529)
export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 기존 코드...
  const { useFacebookUI } = useNewFacebookUI();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ... 기존 코드 ... */}

      {/* 답변 섹션 - 라인 516 근처 */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">
          {answers.length === 0 ? '아직 답변이 없습니다' : `답변 ${answers.length}개`}
        </h2>

        {/* 조건부 렌더링 추가 */}
        {user && question ? (
          useFacebookUI ? (
            <FacebookAnswerThread
              question={{
                id: question.id,
                title: question.title,
                category: question.category,
              }}
              answers={answers.map(answer => ({
                id: answer.id,
                content: answer.content,
                author: {
                  id: answer.author.id,
                  name: answer.author.name,
                  avatar: answer.author.avatar,
                  badge: answer.author.badge,
                },
                createdAt: answer.createdAt,
                likeCount: answer.likeCount,
                dislikeCount: answer.dislikeCount,
                isAccepted: answer.isAccepted,
                commentCount: answer.comments?.length ?? 0,
                comments: answer.comments ?? [],
              }))}
              currentUser={{
                id: user.id,
                name: user.name,
                avatar: user.avatar,
              }}
              onSubmitAnswer={handleAnswerSubmit}
              onLike={handleAnswerLike}
              onDislike={handleAnswerDislike}
              onReply={() => {}} // 대댓글 기능
              isLoading={isSubmitting}
              maxDepth={2}
            />
          ) : (
            <LegacyAnswerComponent
              answers={answers}
              onSubmit={handleAnswerSubmit}
              // ... 다른 props
            />
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              로그인 후 답변을 작성할 수 있습니다.
            </p>
            <a
              href="/auth/signin"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              로그인하기
            </a>
          </div>
        )}
      </div>

      {/* ... 기존 코드 ... */}
    </div>
  );
}
```

**변경 사항 정리**:

- `useNewFacebookUI()` 훅 호출 추가
- 조건부 렌더링 추가
- 기존 로직은 100% 보존

### 📍 Step 4: 타입 정의 업데이트 (선택사항, 10분)

**파일**: `apps/web/src/hooks/index.ts` (또는 `hooks.ts`)

```typescript
// 훅들을 한 곳에서 관리하기 위해 바렐 익스포트 추가

export { useNewFacebookUI, DEFAULT_USE_FACEBOOK_UI } from "./useNewFacebookUI";
export { useUser } from "./useUser";
// ... 기타 훅들
```

**목적**: 임포트 경로 일관성 유지

---

## 테스트 및 검증

### 🧪 Step 1: 개발 환경 테스트 (10분)

#### 1-1. Facebook UI 활성화 상태 테스트

```bash
# .env.local에서
NEXT_PUBLIC_USE_FACEBOOK_UI=true

# 개발 서버 재시작
npm run dev

# 브라우저에서 확인
# http://localhost:3000/questions/[id]
# -> FacebookAnswerThread가 렌더링되어야 함
```

**체크사항**:

- [ ] Facebook UI가 정상적으로 렌더링되는가?
- [ ] 모든 답변이 표시되는가?
- [ ] 좋아요/싫어요 버튼이 작동하는가?
- [ ] 입력창이 정상 작동하는가?
- [ ] 대댓글이 정상 표시되는가?

#### 1-2. 기존 UI로 폴백 테스트 (향후 필요 시)

```bash
# .env.local에서
NEXT_PUBLIC_USE_FACEBOOK_UI=false

# 개발 서버 재시작
npm run dev

# 브라우저에서 확인
# http://localhost:3000/questions/[id]
# -> LegacyAnswerComponent가 렌더링되어야 함
```

**체크사항**:

- [ ] 기존 UI가 정상적으로 렌더링되는가?
- [ ] 모든 기능이 작동하는가?

### 🧪 Step 2: 자동화 테스트 (15분)

#### 2-1. useNewFacebookUI 훅 단위 테스트

**파일**: `apps/web/src/hooks/__tests__/useNewFacebookUI.test.ts` (신규)

```typescript
import { renderHook } from "@testing-library/react";
import { useNewFacebookUI } from "../useNewFacebookUI";

describe("useNewFacebookUI", () => {
  it('should return true when NEXT_PUBLIC_USE_FACEBOOK_UI is "true"', () => {
    process.env.NEXT_PUBLIC_USE_FACEBOOK_UI = "true";
    const { result } = renderHook(() => useNewFacebookUI());
    expect(result.current.useFacebookUI).toBe(true);
  });

  it('should return false when NEXT_PUBLIC_USE_FACEBOOK_UI is not "true"', () => {
    process.env.NEXT_PUBLIC_USE_FACEBOOK_UI = "false";
    const { result } = renderHook(() => useNewFacebookUI());
    expect(result.current.useFacebookUI).toBe(false);
  });

  it("should return false when NEXT_PUBLIC_USE_FACEBOOK_UI is undefined", () => {
    delete process.env.NEXT_PUBLIC_USE_FACEBOOK_UI;
    const { result } = renderHook(() => useNewFacebookUI());
    expect(result.current.useFacebookUI).toBe(false);
  });
});
```

#### 2-2. 조건부 렌더링 통합 테스트

**파일**: `apps/web/src/__tests__/integration/question-detail-feature-flag.test.ts` (신규)

```typescript
import { render, screen } from '@testing-library/react';
import QuestionDetailPage from '@/app/questions/[id]/page';

// Mock useNewFacebookUI
jest.mock('@/hooks/useNewFacebookUI', () => ({
  useNewFacebookUI: jest.fn(() => ({ useFacebookUI: true })),
}));

// Mock FacebookAnswerThread
jest.mock('@/components/question/facebook', () => ({
  FacebookAnswerThread: () => <div data-testid="facebook-thread">Facebook UI</div>,
}));

describe('QuestionDetailPage with Feature Flag', () => {
  it('should render FacebookAnswerThread when feature flag is enabled', async () => {
    render(
      <QuestionDetailPage
        params={Promise.resolve({ id: 'test-id' })}
      />
    );

    expect(screen.getByTestId('facebook-thread')).toBeInTheDocument();
  });
});
```

#### 2-3. E2E 테스트 (Fast Playwright)

**파일**: `apps/web/src/__tests__/e2e/feature-flag-migration.test.ts` (신규)

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Flag Migration", () => {
  test("should render Facebook UI when feature flag is enabled", async ({
    page,
  }) => {
    process.env.NEXT_PUBLIC_USE_FACEBOOK_UI = "true";

    await page.goto("http://localhost:3000/questions/test-question-id");

    // Facebook UI 특정 요소 확인
    const facebookThread = page.locator(
      '[data-testid="facebook-answer-thread"]'
    );
    await expect(facebookThread).toBeVisible();

    // 답변 카드 확인
    const answerCard = page.locator('[data-testid="facebook-answer-card"]');
    await expect(answerCard.first()).toBeVisible();
  });

  test("should render Legacy UI when feature flag is disabled", async ({
    page,
  }) => {
    process.env.NEXT_PUBLIC_USE_FACEBOOK_UI = "false";

    await page.goto("http://localhost:3000/questions/test-question-id");

    // 기존 UI 요소 확인
    const legacyComponent = page.locator(
      '[data-testid="legacy-answer-component"]'
    );
    await expect(legacyComponent).toBeVisible();
  });
});
```

### 🧪 Step 3: 수동 테스트 체크리스트

| 테스트 항목       | Facebook UI | Legacy UI | 결과 |
| ----------------- | ----------- | --------- | ---- |
| 페이지 로드       | ✓           | ✓         | -    |
| 답변 표시         | ✓           | ✓         | -    |
| 좋아요 버튼       | ✓           | ✓         | -    |
| 입력창            | ✓           | ✓         | -    |
| 대댓글            | ✓           | N/A       | -    |
| 배지 표시         | ✓           | N/A       | -    |
| 반응형 (모바일)   | ✓           | ✓         | -    |
| 반응형 (태블릿)   | ✓           | ✓         | -    |
| 반응형 (데스크톱) | ✓           | ✓         | -    |

---

## 위험 요소 및 대응

### ⚠️ 위험 1: 환경 변수 배포 누락

**위험도**: 🔴 높음  
**발생 가능성**: 중간

**문제점**:

```
로컬에서는 .env.local이 있지만,
배포 환경(Vercel, AWS 등)에는 환경 변수 설정 안 함
-> 배포 후 Facebook UI가 항상 비활성화됨
```

**대응 방안**:

1. 배포 플랫폼 설정 체크리스트 작성
2. Vercel: Settings → Environment Variables에서 설정
3. 배포 후 실제로 Feature flag가 작동하는지 확인

### ⚠️ 위험 2: 기존 UI 컴포넌트 미구현

**위험도**: 🟡 중간  
**발생 가능성**: 높음

**문제점**:

```
NEXT_PUBLIC_USE_FACEBOOK_UI=false일 때
<LegacyAnswerComponent />가 없으면 에러 발생
```

**대응 방안**:

```typescript
// 임시 폴백 컴포넌트
const LegacyAnswerComponent = () => (
  <div className="text-gray-500 text-center py-8">
    기존 답변 시스템을 준비 중입니다.
    Facebook UI를 사용해주세요.
  </div>
);

// 또는 기존 답변 렌더링 컴포넌트 사용
import { AnswerList } from '@/components/question/legacy';
```

### ⚠️ 위험 3: 데이터 변환 로직 불일치

**위험도**: 🟡 중간  
**발생 가능성**: 낮음

**문제점**:

```
Facebook UI는 특정 데이터 구조를 기대함
기존 UI는 다른 구조를 사용할 수도 있음
-> Props 형식 불일치로 렌더링 에러
```

**대응 방안**:

- Props 타입 정의 명확히 (이미 `FacebookAnswerCard.tsx`에 구현됨)
- 데이터 변환 함수 사용 (`facebook-qa-converter.ts`)
- Props 검증 로직 추가

### ⚠️ 위험 4: 타입 에러

**위험도**: 🟢 낮음  
**발생 가능성**: 낮음

**문제점**:

```
TypeScript strict mode에서 타입 불일치
```

**대응 방안**:

```bash
# 타입 체크 실행
npm run type-check

# 에러 발생 시 수정
```

---

## 체크리스트

### 📝 구현 체크리스트

#### Phase 9-1: Feature Flag 구현

- [ ] Step 1: `.env.local`에 `NEXT_PUBLIC_USE_FACEBOOK_UI=true` 추가
- [ ] Step 2: `useNewFacebookUI.ts` 훅 생성
  - [ ] 타입 정의
  - [ ] 환경 변수 읽기 로직
  - [ ] 문서 작성 (JSDoc)
- [ ] Step 3: `pages/questions/[id].tsx` 수정
  - [ ] import 추가
  - [ ] 훅 호출
  - [ ] 조건부 렌더링 추가
  - [ ] 타입 정의 확인

#### Phase 9-2: 테스트

- [ ] 개발 환경 수동 테스트
  - [ ] Facebook UI=true 테스트
  - [ ] Facebook UI=false 테스트
- [ ] 자동화 테스트 작성
  - [ ] useNewFacebookUI 훅 테스트
  - [ ] 조건부 렌더링 테스트
  - [ ] E2E 테스트
- [ ] Type Check 실행
- [ ] Lint 실행

#### Phase 9-3: 검증

- [ ] 모든 테스트 통과 확인
- [ ] 기존 로직 변경 없음 확인
  - [ ] Facebook 컴포넌트 수정 안 함
  - [ ] CSS 수정 안 함
  - [ ] API 로직 수정 안 함
- [ ] Props 전달 확인
- [ ] 데이터 흐름 확인

#### Phase 9-4: 완료

- [ ] 코드 리뷰
- [ ] Git 커밋
  ```bash
  git commit -m "feat: Feature flag 기반 Facebook UI 마이그레이션 준비"
  ```
- [ ] Phase 9 체크 표시

---

## 다음 단계 (Phase 10 예정)

### 점진적 롤아웃 전략

```
1단계 (현재 - 개발):
  NEXT_PUBLIC_USE_FACEBOOK_UI=true (항상 Facebook UI)

2단계 (1주일 후):
  환경 변수로 제어 가능하게 변경
  개발/스테이징: true
  프로덕션: 10% (canary release)

3단계 (2주일 후):
  프로덕션: 50%

4단계 (3주일 후):
  프로덕션: 100%
```

### 모니터링 항목

- ✅ 페이지 로드 시간 (LCP, FID, CLS)
- ✅ 에러율
- ✅ 사용자 상호작용 이벤트
- ✅ 성능 메트릭

---

## 결론

Phase 9는 **Feature flag 시스템 도입**으로, 현재 구현된 Facebook UI를 **조건부로 활성화/비활성화**할 수 있게 합니다.

### 핵심 원칙

1. ✅ **기존 로직 절대 변경 금지** (Facebook 컴포넌트, CSS, API)
2. ✅ **분리된 기능** (Feature flag는 독립적인 훅)
3. ✅ **타입 안전** (TypeScript)
4. ✅ **테스트 기반** (모든 변경 테스트)

**예상 소요 시간**: 2시간  
**복잡도**: 낮음 (기존 코드 거의 수정 안 함)
