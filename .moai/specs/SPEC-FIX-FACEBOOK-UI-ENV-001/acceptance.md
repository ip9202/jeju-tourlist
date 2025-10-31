# @SPEC:FIX-FACEBOOK-UI-ENV-001: 인수 기준 및 테스트 시나리오

## 인수 기준 요약 (Acceptance Criteria Summary)

### 🟢 필수 기준 (Mandatory Criteria)

모든 필수 기준이 충족되어야 SPEC이 완료된 것으로 간주됩니다.

1. **필수-001**: .env.local 파일이 생성되고 NEXT_PUBLIC_USE_FACEBOOK_UI=true로 설정됨
2. **필수-002**: 질문 상세 페이지에서 Facebook UI가 정상 렌더링됨
3. **필수-003**: 질문 작성자에게만 채택 버튼이 표시됨
4. **필수-004**: 채택 버튼 클릭 시 API 요청이 성공함
5. **필수-005**: 환경 변수 미설정 시 폴백 메시지가 표시됨

### 🟡 권장 기준 (Recommended Criteria)

프로덕션 배포 전에 확인하는 것이 권장됩니다.

1. **권장-001**: .env.example 파일이 NEXT_PUBLIC_USE_FACEBOOK_UI 변수를 포함함
2. **권장-002**: README.md에 환경 변수 설정 방법이 문서화됨
3. **권장-003**: .gitignore에 .env.local이 포함되어 있음
4. **권장-004**: 새로운 개발자가 문서만으로 환경 변수를 설정할 수 있음
5. **권장-005**: CI/CD 파이프라인에서 환경 변수를 정확히 설정함

### 🔵 선택 기준 (Optional Criteria)

향후 개선사항으로 포함할 수 있습니다.

1. **선택-001**: 환경 변수 검증을 위한 자동화 스크립트
2. **선택-002**: E2E 테스트로 Facebook UI 렌더링 확인
3. **선택-003**: 배포 전 자동 검증 스크립트

---

## Given-When-Then 테스트 시나리오

### ✅ Scenario 1: Facebook UI 활성화 및 채택 버튼 표시

**제목**: 질문 작성자가 자신의 질문 상세 페이지에서 채택 버튼을 볼 수 있다

```gherkin
Given
  - 개발자가 .env.local을 생성하고 NEXT_PUBLIC_USE_FACEBOOK_UI=true로 설정했다
  - 질문 작성자가 로그인 상태이다
  - 질문 상세 페이지(/questions/[id])가 존재한다
  - 해당 질문에 최소 하나 이상의 답변이 있다

When
  - 개발자가 npm run dev로 개발 서버를 시작한다
  - 질문 작성자가 자신의 질문 상세 페이지에 접속한다

Then
  - FacebookAnswerThread 컴포넌트가 렌더링된다
  - 각 답변 카드에 "좋아요", "싫어요", "답글" 버튼이 표시된다
  - 질문 작성자가 채택되지 않은 답변의 "채택" 버튼을 본다
  - 채택된 답변의 "채택 해제" 버튼을 본다
  - 채택 버튼이 클릭 가능한 상태이다
```

**검증 방법**:

```javascript
// 브라우저 콘솔에서 확인
document.body.innerHTML.includes("채택"); // true
document.querySelectorAll('[aria-label="채택"]').length > 0; // true
```

**예상 UI**:

```
┌─────────────────────────────────┐
│ 답변 내용                       │
├─────────────────────────────────┤
│ ☆ 좋아요 (N) | ☆ 싫어요 (N) | 답글 │
│ ✓ 채택 | 채택해제               │ ← 이 버튼들이 보여야 함
└─────────────────────────────────┘
```

**수락 조건**:

- ✅ "채택" 또는 "채택 해제" 텍스트가 UI에 표시됨
- ✅ 버튼이 마우스 호버 시 상태 변화 (색상, 커서 등)
- ✅ 에러 메시지가 브라우저 콘솔에 없음

---

### ✅ Scenario 2: 비작성자에게 채택 버튼 숨김

**제목**: 질문 작성자가 아닌 사용자는 채택 버튼을 볼 수 없다

```gherkin
Given
  - NEXT_PUBLIC_USE_FACEBOOK_UI=true로 설정됨
  - 비작성자가 로그인 상태이다
  - 다른 사용자의 질문 상세 페이지에 접속한다

When
  - 질문 상세 페이지가 로드된다
  - FacebookAnswerThread가 렌더링된다

Then
  - "좋아요", "싫어요", "답글" 버튼은 표시된다
  - "채택" 또는 "채택 해제" 버튼은 표시되지 않는다
  - 답변 카드의 높이가 채택 버튼으로 인해 늘어나지 않는다
  - 브라우저 네트워크 탭에 /adopt API 요청이 없다
```

**검증 방법**:

```javascript
// 브라우저 콘솔에서 확인
document.querySelectorAll('[aria-label="채택"]').length === 0; // true
```

**예상 UI**:

```
┌─────────────────────────────────┐
│ 답변 내용                       │
├─────────────────────────────────┤
│ ☆ 좋아요 (N) | ☆ 싫어요 (N) | 답글 │
│                               │
└─────────────────────────────────┘
```

**수락 조건**:

- ✅ 채택 버튼이 DOM에 렌더링되지 않음
- ✅ CSS display:none이 아닌 실제 미렌더링
- ✅ 네트워크 요청 없음

---

### ✅ Scenario 3: 환경 변수 미설정 시 폴백 동작

**제목**: NEXT_PUBLIC_USE_FACEBOOK_UI가 설정되지 않으면 레거시 시스템이 표시된다

```gherkin
Given
  - .env.local 파일이 없거나 NEXT_PUBLIC_USE_FACEBOOK_UI가 설정되지 않았다
  - 개발 서버가 재시작되었다

When
  - 질문 상세 페이지(/questions/[id])에 접속한다

Then
  - FacebookAnswerThread 컴포넌트가 렌더링되지 않는다
  - 대신 "기존 답변 시스템입니다." 메시지가 표시된다
  - 채택 버튼이 화면에 나타나지 않는다
  - 브라우저 콘솔에 "[useNewFacebookUI] ENV initialized as FALSE" 로그가 없다
```

**검증 방법**:

```javascript
// 브라우저 콘솔에서 확인
document.body.innerHTML.includes("기존 답변 시스템입니다"); // true
document.querySelectorAll('[aria-label="채택"]').length === 0; // true
```

**예상 UI**:

```
┌──────────────────────────────────┐
│ 기존 답변 시스템입니다.          │
├──────────────────────────────────┤
│                                │
└──────────────────────────────────┘
```

**수락 조건**:

- ✅ 폴백 메시지가 명확히 표시됨
- ✅ Facebook UI 구성요소가 렌더링되지 않음
- ✅ 콘솔에 에러가 없음

---

### ✅ Scenario 4: 환경 변수 변경 후 즉시 반영

**제목**: .env.local에서 환경 변수를 변경하면 개발 서버 재시작 후 즉시 반영된다

```gherkin
Given
  - NEXT_PUBLIC_USE_FACEBOOK_UI=true로 설정됨
  - Facebook UI가 정상 렌더링 중이다
  - 질문 상세 페이지가 열려 있다

When
  - .env.local에서 NEXT_PUBLIC_USE_FACEBOOK_UI=false로 변경한다
  - 개발 서버를 재시작한다 (pkill -f "next dev" && npm run dev)

Then
  - 페이지를 새로고침한다
  - "기존 답변 시스템입니다." 메시지가 표시된다
  - 채택 버튼이 더 이상 표시되지 않는다

When
  - .env.local에서 다시 NEXT_PUBLIC_USE_FACEBOOK_UI=true로 변경한다
  - 개발 서버를 재시작한다

Then
  - 페이지를 새로고침한다
  - Facebook UI와 채택 버튼이 다시 표시된다
```

**검증 방법**:

```bash
# Terminal에서 확인
# 1. 환경 변수 확인
cat apps/web/.env.local

# 2. 개발 서버 로그 확인
npm run dev | grep -i "NEXT_PUBLIC_USE_FACEBOOK_UI"

# 3. 브라우저 콘솔에서
process.env.NEXT_PUBLIC_USE_FACEBOOK_UI
```

**수락 조건**:

- ✅ 환경 변수 변경이 개발 서버 재시작 후 적용됨
- ✅ 페이지 새로고침으로 즉시 반영됨
- ✅ HMR(Hot Module Replacement)이 정상 작동함

---

### ✅ Scenario 5: .env.example 문서화 확인

**제목**: 새로운 개발자가 .env.example을 사용하여 환경을 설정할 수 있다

```gherkin
Given
  - 개발자가 저장소를 클론했다
  - .env.local 파일이 없다 (Git에 추적되지 않음)

When
  - .env.example 파일을 확인한다
  - NEXT_PUBLIC_USE_FACEBOOK_UI 변수가 포함되어 있는지 확인한다
  - README.md에서 환경 변수 설정 방법을 찾는다

Then
  - .env.example에 NEXT_PUBLIC_USE_FACEBOOK_UI가 명확히 기재되어 있다
  - 변수의 용도가 주석으로 설명되어 있다
  - 예시 값이 명확하다 (true 또는 false)
  - README.md에 설정 방법이 단계별로 설명되어 있다

When
  - 개발자가 문서를 따라 .env.local을 생성한다
  - NEXT_PUBLIC_USE_FACEBOOK_UI=true로 설정한다

Then
  - npm run dev 실행 후 Facebook UI가 정상 렌더링된다
```

**검증 방법**:

```bash
# Terminal에서 확인
grep "NEXT_PUBLIC_USE_FACEBOOK_UI" apps/web/.env.example
grep -A 5 "환경 변수" README.md
```

**수락 조건**:

- ✅ .env.example에 변수가 포함됨
- ✅ 변수에 대한 설명이 있음
- ✅ README에 설정 방법이 명확함
- ✅ 새로운 개발자가 문서만으로 설정 가능함

---

## 품질 게이트 (Quality Gates)

### 🟢 기능 품질 (Functional Quality)

| 항목                   | 기준                                 | 검증 방법                             |
| ---------------------- | ------------------------------------ | ------------------------------------- |
| **Facebook UI 렌더링** | useFacebookUI=true일 때 렌더링       | DOM에서 FacebookAnswerThread 확인     |
| **채택 버튼 표시**     | 질문 작성자에게만 표시               | CSS Selector 검증                     |
| **폴백 동작**          | useFacebookUI=false일 때 폴백 메시지 | "기존 답변 시스템입니다." 텍스트 확인 |
| **API 통신**           | 채택 버튼 클릭 시 POST 요청          | Network 탭에서 /adopt 요청 확인       |
| **상태 관리**          | 채택/취소 상태 정상 변경             | UI 버튼 텍스트 변경 확인              |

### 🟡 성능 품질 (Performance Quality)

| 항목                 | 기준            | 측정 방법                   |
| -------------------- | --------------- | --------------------------- |
| **페이지 로드 시간** | 3초 이내        | Lighthouse 또는 Network 탭  |
| **채택 버튼 응답성** | 100ms 이내 반응 | Performance 탭에서 FCP 측정 |
| **메모리 누수**      | 없음            | Chrome DevTools Memory 탭   |
| **네트워크 요청**    | 최소 (1-2개)    | Network 탭에서 요청 수 확인 |

### 🔵 보안 품질 (Security Quality)

| 항목                | 기준                      | 검증 방법                     |
| ------------------- | ------------------------- | ----------------------------- |
| **.env.local 보안** | Git 제외됨                | .gitignore 확인               |
| **환경 변수 노출**  | 클라이언트 콘솔 출력 없음 | 민감 정보 로그 검사           |
| **API 인증**        | Authorization 헤더 포함   | Network 탭에서 요청 헤더 확인 |
| **입력 검증**       | 유효성 검사               | 잘못된 입력에 대한 에러 처리  |

---

## 수동 테스트 체크리스트 (Manual Testing Checklist)

### ✅ 사전 준비 (Pre-requisites)

- [ ] Node.js 18 이상 설치됨
- [ ] npm 8 이상 설치됨
- [ ] 저장소 클론 완료
- [ ] npm install 실행 완료
- [ ] 데이터베이스 초기화 완료

### ✅ 환경 변수 설정 (Environment Setup)

- [ ] .env.local 파일 생성
- [ ] NEXT_PUBLIC_USE_FACEBOOK_UI=true 설정
- [ ] 파일 저장 확인
- [ ] .gitignore에 .env.local 포함 확인

### ✅ 서버 시작 (Server Startup)

- [ ] 기존 개발 서버 프로세스 종료
- [ ] npm run dev 실행
- [ ] "Ready in XXXms" 로그 확인
- [ ] http://localhost:3000 접속 가능 확인

### ✅ 환경 변수 로드 확인 (Environment Verification)

- [ ] 브라우저 개발자 도구 열기 (F12)
- [ ] Console 탭에서 다음 명령 실행:
  ```javascript
  console.log(process.env.NEXT_PUBLIC_USE_FACEBOOK_UI);
  ```
- [ ] 결과: "true" 출력 확인

### ✅ UI 렌더링 확인 (UI Rendering)

- [ ] 질문 목록 페이지 접속: http://localhost:3000/questions
- [ ] 질문 상세 페이지 접속 (질문 제목 클릭)
- [ ] FacebookAnswerThread 컴포넌트 렌더링 확인
- [ ] 답변 목록이 표시됨
- [ ] 버튼들(좋아요, 싫어요, 답글) 표시 확인

### ✅ 채택 버튼 표시 (Adoption Button Display)

**질문 작성자 계정으로 테스트**:

- [ ] 자신의 질문 상세 페이지 접속
- [ ] 각 답변에 "좋아요", "싫어요", "답글" 버튼 확인
- [ ] 채택되지 않은 답변: "채택" 버튼 표시 확인
- [ ] 채택된 답변: "채택 해제" 버튼 표시 확인
- [ ] 버튼들이 클릭 가능한 상태 확인

**비작성자 계정으로 테스트**:

- [ ] 다른 사용자의 질문 상세 페이지 접속
- [ ] "좋아요", "싫어요", "답글" 버튼만 표시됨
- [ ] "채택" 또는 "채택 해제" 버튼이 없음
- [ ] 답변 카드 높이가 작성자와 동일함

### ✅ 채택 버튼 기능 (Adoption Button Functionality)

**채택 기능**:

- [ ] "채택" 버튼 클릭
- [ ] Network 탭에서 POST /api/answers/{id}/adopt 요청 확인
- [ ] 요청 상태: 200 OK 확인
- [ ] 버튼이 "채택 해제"로 변경됨
- [ ] 페이지를 새로고침해도 상태 유지됨

**채택 해제 기능**:

- [ ] "채택 해제" 버튼 클릭
- [ ] Network 탭에서 POST /api/answers/{id}/unadopt 요청 확인
- [ ] 요청 상태: 200 OK 확인
- [ ] 버튼이 "채택"으로 변경됨
- [ ] 페이지를 새로고침해도 상태 유지됨

### ✅ 폴백 동작 확인 (Fallback Testing)

- [ ] .env.local 파일 삭제 또는 이름 변경
- [ ] 개발 서버 재시작 (npm run dev 재실행)
- [ ] 질문 상세 페이지 새로고침
- [ ] "기존 답변 시스템입니다." 메시지 표시 확인
- [ ] FacebookAnswerThread 렌더링되지 않음 확인
- [ ] 브라우저 콘솔 에러 없음 확인

### ✅ 환경 변수 문서화 확인 (Documentation)

- [ ] .env.example 파일 확인
- [ ] NEXT_PUBLIC_USE_FACEBOOK_UI 변수 포함 확인
- [ ] 변수 설명 주석 확인
- [ ] README.md 확인
- [ ] 환경 변수 설정 섹션 확인
- [ ] 설정 방법이 명확히 설명됨

---

## E2E 테스트 (E2E Testing - Optional)

### 권장: Playwright E2E 테스트

```typescript
// e2e/facebook-ui-adoption-button.e2e.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Facebook UI - Adoption Button", () => {
  test("Question author should see adoption button", async ({ page }) => {
    // 질문 작성자로 로그인
    await page.goto("/auth/signin");
    await page.fill('[name="email"]', "author@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('[type="submit"]');

    // 자신의 질문 상세 페이지 접속
    await page.goto("/questions/[question-id]");

    // 채택 버튼이 표시되어야 함
    const adoptButton = page.locator('[aria-label="채택"]').first();
    await expect(adoptButton).toBeVisible();
  });

  test("Non-author should not see adoption button", async ({ page }) => {
    // 비작성자로 로그인
    await page.goto("/auth/signin");
    await page.fill('[name="email"]', "user@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('[type="submit"]');

    // 다른 사용자의 질문 상세 페이지 접속
    await page.goto("/questions/[other-question-id]");

    // 채택 버튼이 표시되지 않아야 함
    const adoptButtons = page.locator('[aria-label="채택"]');
    await expect(adoptButtons).toHaveCount(0);
  });

  test("Adoption button should work correctly", async ({ page }) => {
    // 로그인 및 페이지 접속
    // ... (로그인 코드)

    // 채택 버튼 클릭
    const adoptButton = page.locator('[aria-label="채택"]').first();
    await adoptButton.click();

    // 요청이 완료될 때까지 대기
    await page.waitForTimeout(1000);

    // 버튼이 "채택 해제"로 변경되어야 함
    const unadoptButton = page.locator('[aria-label="채택 해제"]').first();
    await expect(unadoptButton).toBeVisible();
  });
});
```

---

## 완료 기준 (Definition of Done)

### 🟢 구현 완료 (Implementation Complete)

- [ ] .env.local 파일 생성
- [ ] NEXT_PUBLIC_USE_FACEBOOK_UI=true 설정
- [ ] 환경 변수 로드 확인 (콘솔 로그)
- [ ] FacebookAnswerThread 렌더링 확인
- [ ] 채택 버튼 표시 확인

### 🟡 테스트 완료 (Testing Complete)

- [ ] 모든 수동 테스트 체크리스트 통과
- [ ] 기능 품질 게이트 통과
- [ ] 성능 품질 게이트 통과
- [ ] 보안 품질 게이트 통과

### 🟡 문서화 완료 (Documentation Complete)

- [ ] .env.example 업데이트
- [ ] README.md 환경 변수 섹션 추가
- [ ] 개발자 온보딩 가이드 작성
- [ ] 팀원 공유 및 검토

### 🔵 배포 준비 (Deployment Ready)

- [ ] CI/CD 파이프라인 환경 변수 설정
- [ ] 프로덕션 배포 체크리스트 완료
- [ ] 롤백 계획 수립
- [ ] 모니터링 대시보드 구성

---

## 회귀 테스트 (Regression Testing)

### 기존 기능 영향 확인

| 기능              | 영향 없음 | 테스트 방법            |
| ----------------- | --------- | ---------------------- |
| **로그인**        | ✅        | 로그인 성공 확인       |
| **질문 목록**     | ✅        | 질문 목록 페이지 로드  |
| **질문 작성**     | ✅        | 새 질문 작성 및 저장   |
| **답변 작성**     | ✅        | 답변 입력 및 제출      |
| **좋아요/싫어요** | ✅        | 버튼 클릭 및 상태 변경 |
| **댓글 작성**     | ✅        | 댓글 입력 및 제출      |

---

## 성능 벤치마크 (Performance Benchmarks)

### 목표 성능 지표

| 지표                        | 목표값 | 측정 방법           |
| --------------------------- | ------ | ------------------- |
| **페이지 로드 시간**        | < 3s   | Lighthouse          |
| **First Contentful Paint**  | < 1.5s | Chrome DevTools     |
| **Time to Interactive**     | < 2.5s | Lighthouse          |
| **Cumulative Layout Shift** | < 0.1  | Lighthouse          |
| **메모리 사용량**           | < 50MB | Chrome Task Manager |

---

## 승인 기준 (Sign-off Criteria)

이 SPEC은 다음 조건을 만족할 때 **승인 완료**됩니다:

### 👨‍💼 제품 관리자 (Product Manager)

- [ ] 요구사항을 모두 충족했는가?
- [ ] 사용자 경험이 개선되었는가?
- [ ] 팀 온보딩이 용이해졌는가?

### 👨‍💻 개발자 (Developer)

- [ ] 모든 수동 테스트를 통과했는가?
- [ ] 코드 품질이 기준을 충족하는가?
- [ ] 문서화가 완벽한가?

### 🧪 QA 담당자 (QA Engineer)

- [ ] E2E 테스트를 통과했는가?
- [ ] 회귀 테스트 결과가 양호한가?
- [ ] 성능 벤치마크를 충족하는가?

---

## 알려진 제한사항 (Known Limitations)

1. **HMR 제한**: 환경 변수 변경 시 개발 서버 재시작 필요
   - 원인: Next.js 환경 변수는 빌드 타임에 로드됨
   - 대안: 문서에 명확히 기재

2. **프로덕션 환경**: .env.local 미지원
   - 원인: 프로덕션에서는 보안상 이유로 사용 불가
   - 대안: 환경 변수를 시스템 환경변수나 CI/CD로 설정

3. **다중 환경**: 각 개발자별 개별 .env.local 필요
   - 원인: Git에서 제외되므로 공유 불가
   - 대안: .env.example을 최신으로 유지하여 동기화

---

## 추가 참고사항 (Additional Notes)

- **개발자 경험**: 새로운 개발자가 문서만으로도 5분 내에 환경 설정 가능해야 함
- **지속적 개선**: 팀 피드백을 반영하여 문서 및 프로세스 개선
- **모니터링**: 프로덕션 배포 후 환경 변수 설정 상태 모니터링

---

## 참고 문서 (References)

- Next.js 환경 변수: https://nextjs.org/docs/basic-features/environment-variables
- 12 Factor App: https://12factor.net/
- Feature Flag Best Practices: https://martinfowler.com/articles/feature-toggles.html
