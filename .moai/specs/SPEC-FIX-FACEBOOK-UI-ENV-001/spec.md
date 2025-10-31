---
id: FIX-FACEBOOK-UI-ENV-001
version: 0.1.0
status: completed
created: 2025-10-31
updated: 2025-10-31
author: @Alfred
priority: high
category: bugfix
labels:
  - configuration
  - environment-variables
  - facebook-ui
  - feature-flag
scope:
  packages:
    - apps/web
  files:
    - .env.local
    - .env.example
    - src/hooks/useNewFacebookUI.ts
    - src/app/questions/[id]/page.tsx
---

# @SPEC:FIX-FACEBOOK-UI-ENV-001: Facebook UI 환경 변수 설정 수정

## HISTORY

### v0.1.0 (2025-10-31)

- **COMPLETED**: Facebook UI 환경 변수 설정 완료 및 문서 동기화
- **AUTHOR**: @doc-syncer
- **SCOPE**: 환경 변수 설정 파일 생성 및 문서화 완료
- **CONTEXT**: 채택 버튼 UI 구현 완료, 환경 변수 설정으로 프로덕션 준비 완료
- **STATUS**: 모든 필수 요구사항 충족, 개발 서버 확인 완료
- **COMMIT**: Implementation and documentation complete

### v0.0.1 (2025-10-31)

- **INITIAL**: Facebook UI 환경 변수 미설정으로 인한 UI 비활성화 문제 해결
- **AUTHOR**: @Alfred
- **SCOPE**: 환경 변수 설정 파일 생성 및 문서화
- **CONTEXT**: 채택(채택) 버튼 UI가 완전히 구현되었으나 환경 변수 미설정으로 렌더링되지 않는 문제 해결

---

## 환경 (Environment)

### 시스템 환경

- **플랫폼**: Next.js 14.2.33
- **런타임**: Node.js (LTS)
- **패키지 매니저**: npm / pnpm / yarn
- **개발 서버**: localhost:3000

### 관련 파일

- `apps/web/.env.development` - 기존 개발 환경 변수 파일
- `apps/web/src/hooks/useNewFacebookUI.ts` - Feature flag 훅
- `apps/web/src/app/questions/[id]/page.tsx` - 질문 상세 페이지
- `apps/web/src/components/question/facebook/FacebookAnswerThread.tsx` - Facebook 답변 스레드

### 현재 상태

- FacebookAnswerCard 컴포넌트: 채택 버튼 구현 완료
- FacebookAnswerThread 컴포넌트: Props 전달 완료
- page.tsx: 핸들러 구현 완료
- **누락**: `.env.local` 파일 및 `NEXT_PUBLIC_USE_FACEBOOK_UI` 환경 변수

---

## 가정 (Assumptions)

1. **개발 환경 설정**:
   - 개발자는 로컬 머신에서 작업 중
   - `.env.local` 파일은 `.gitignore`에 포함되어 Git 추적 제외
   - Next.js 환경 변수 자동 로딩 메커니즘 활용

2. **기능 구현 상태**:
   - FacebookAnswerThread 컴포넌트 전체 구현 완료
   - useNewFacebookUI 훅 구현 완료
   - 모든 핸들러 함수 구현 완료
   - 오직 환경 변수 설정만 누락

3. **우선순위**:
   - 개발 환경에서 Facebook UI 기본 활성화 필요
   - 프로덕션에서는 gradual rollout 전략 적용

4. **보안**:
   - `.env.local`은 민감한 정보를 포함할 수 있으므로 Git에서 제외
   - 모든 개발자는 `.env.example` 기반으로 `.env.local` 생성

---

## 요구사항 (Requirements)

### 필수 요구사항 (Ubiquitous Requirements)

**REQ-001**: 시스템은 환경 변수를 통해 Facebook UI 기능 플래그를 제공해야 한다.

- **세부사항**: NEXT_PUBLIC_USE_FACEBOOK_UI 환경 변수로 Facebook UI 활성화/비활성화 제어
- **관련 파일**: .env.local, .env.example

**REQ-002**: 시스템은 환경 변수 설정 없이도 안전한 기본 동작(폴백)을 제공해야 한다.

- **세부사항**: 환경 변수 미설정 시 "기존 답변 시스템입니다." 메시지 표시
- **관련 파일**: src/app/questions/[id]/page.tsx

**REQ-003**: 시스템은 개발자 온보딩을 위해 환경 변수 설정을 명확히 문서화해야 한다.

- **세부사항**: .env.example 파일 및 README에 설정 방법 기재
- **관련 파일**: .env.example, README.md

---

### 이벤트 기반 요구사항 (Event-driven Requirements)

**REQ-004**: WHEN 애플리케이션이 시작되면, 시스템은 환경 변수에서 NEXT_PUBLIC_USE_FACEBOOK_UI를 읽어야 한다.

- **세부사항**: useNewFacebookUI 훅이 초기 렌더링 시 환경 변수 확인
- **증거**: console.log("[useNewFacebookUI] ENV initialized as TRUE") 로그 출력

**REQ-005**: WHEN NEXT_PUBLIC_USE_FACEBOOK_UI=true이면, 시스템은 FacebookAnswerThread 컴포넌트를 렌더링해야 한다.

- **세부사항**: page.tsx의 조건부 렌더링 활성화
- **테스트**: 채택 버튼 시각적 확인

**REQ-006**: WHEN 환경 변수가 설정되지 않으면, 시스템은 레거시 답변 시스템 폴백을 표시해야 한다.

- **세부사항**: "기존 답변 시스템입니다." 메시지 표시
- **테스트**: .env.local 제거 후 동작 확인

**REQ-007**: WHEN 개발자가 .env.local을 복사하면, 시스템은 예시 변수를 기반으로 설정해야 한다.

- **세부사항**: .env.example 파일을 기반으로 .env.local 생성
- **테스트**: 파일 내용 일치성 확인

**REQ-008**: WHEN .env.local에서 환경 변수를 변경하면, 시스템은 개발 서버 재시작 후 즉시 반영되어야 한다.

- **세부사항**: HMR(Hot Module Replacement) 또는 서버 재시작으로 변경 사항 적용
- **테스트**: 변수 변경 후 페이지 새로고침

**REQ-009**: WHEN 새로운 개발자가 저장소를 클론하면, 시스템은 .env.example을 제공해야 한다.

- **세부사항**: .env.example 파일이 Git에 추적되어 모든 개발자가 사용 가능
- **테스트**: 저장소 클론 후 .env.example 존재 확인

**REQ-010**: WHEN GitHub CI/CD 파이프라인이 실행되면, 시스템은 환경 변수를 정확히 설정해야 한다.

- **세부사항**: GitHub Actions 환경 변수 설정 또는 .env 파일 주입
- **테스트**: CI 로그에서 환경 변수 확인

---

### 상태 기반 요구사항 (State-driven Requirements)

**REQ-011**: WHILE 개발 모드에 있는 동안, 시스템은 .env.local에서 환경 변수를 읽어야 한다.

- **세부사항**: NODE_ENV=development일 때 .env.local 우선 로드
- **기술**: Next.js 환경 변수 로딩 순서 활용

**REQ-012**: WHILE useNewFacebookUI가 true 상태인 동안, FacebookAnswerThread는 렌더링 유지되어야 한다.

- **세부사항**: 상태 변경 없이 지속적으로 Facebook UI 표시
- **테스트**: 페이지 상호작용 중 UI 상태 유지 확인

**REQ-013**: WHILE 환경 변수가 미설정 상태인 동안, 레거시 시스템 폴백이 유지되어야 한다.

- **세부사항**: 환경 변수 설정 전까지 기존 답변 시스템 표시
- **테스트**: 환경 변수 누락 시 폴백 메시지 확인

---

### 선택 요구사항 (Optional Requirements)

**REQ-014**: WHERE 프로덕션 환경인 경우, 시스템은 gradual rollout 전략을 사용할 수 있다.

- **세부사항**: NEXT_PUBLIC_ROLLOUT_STAGE 환경 변수로 단계적 배포 제어
- **사용 시점**: 프로덕션 환경에서의 기능 안정성 검증 이후

**REQ-015**: WHERE 개발 환경인 경우, 시스템은 Facebook UI를 기본 활성화할 수 있다.

- **세부사항**: NEXT_PUBLIC_USE_FACEBOOK_UI=true 기본값 설정
- **목적**: 개발자 편의성 증대

---

### 제약 조건 (Constraints)

**CON-001**: IF .env.local이 누락되면, 시스템은 안전한 기본 동작을 제공해야 한다.

- **세부사항**: 에러 대신 폴백 메시지 표시
- **영향**: 개발자 온보딩 단계에서 중요

**CON-002**: IF NEXT_PUBLIC_USE_FACEBOOK_UI 값이 "true" 정확한 문자열이 아니면, 시스템은 false로 취급해야 한다.

- **세부사항**: 환경 변수 값의 정확성 검증
- **예**: "True", "TRUE", "1" 등은 false로 처리

**CON-003**: IF .env.local이 Git에 커밋되면, 팀의 환경 변수 보안이 위협받는다.

- **세부사항**: .gitignore에 .env.local 반드시 포함 필수
- **영향**: 보안 및 협업 환경 관리

---

## 구체적 사항 (Specifications)

### 1. 환경 파일 생성 및 설정

#### 1.1 .env.local 파일 생성

```bash
# apps/web/.env.local 생성
NEXT_PUBLIC_USE_FACEBOOK_UI=true
```

**목적**: 개발 환경에서 Facebook UI 활성화

**영향 범위**: 로컬 개발 서버에만 적용 (Git 제외)

#### 1.2 .env.example 파일 업데이트

```bash
# apps/web/.env.example에 추가
NEXT_PUBLIC_USE_FACEBOOK_UI=true
```

**목적**: 새로운 개발자가 환경 변수 설정 방법을 쉽게 파악

**영향 범위**: 전체 팀이 참조

### 2. 환경 변수 우선순위

Next.js는 다음 순서로 환경 변수를 로드:

```
1. .env.local (가장 우선, 개인화 설정)
2. .env.development (공유 개발 설정)
3. .env (기본 설정)
```

### 3. 코드 동작 흐름

```
개발 서버 시작
  ↓
Next.js 환경 변수 로드 (.env.local)
  ↓
useNewFacebookUI 훅 초기화
  ↓
process.env.NEXT_PUBLIC_USE_FACEBOOK_UI 읽음
  ↓
envFlag = "true" 확인
  ↓
setUseFacebookUI(true) → useState 업데이트
  ↓
page.tsx useFacebookUI ? ( <FacebookAnswerThread /> ) : ( <Fallback /> )
  ↓
FacebookAnswerThread 렌더링
  ↓
FacebookAnswerCard 렌더링 및 채택 버튼 표시
```

### 4. 환경 변수 검증 로직

```typescript
// src/hooks/useNewFacebookUI.ts
const envFlag = process.env.NEXT_PUBLIC_USE_FACEBOOK_UI;

if (envFlag === "true") {
  // Facebook UI 활성화
  return true;
} else {
  // 폴백: 레거시 시스템 사용
  return false;
}
```

---

## 추적성 (@TAG)

### SPEC 추적

- **SPEC**: @SPEC:FIX-FACEBOOK-UI-ENV-001
- **Related**: @SPEC:ANSWER-INTERACTION-001 (채택 기능 구현)

### 코드 추적

- **CODE**:
  - src/hooks/useNewFacebookUI.ts (환경 변수 읽음)
  - src/app/questions/[id]/page.tsx (조건부 렌더링)
  - .env.local (환경 변수 설정)
  - .env.example (설정 문서화)

### 테스트 추적

- **TEST**:
  - e2e/facebook-ui-activation.e2e.spec.ts (UI 렌더링 확인)
  - e2e/adoption-button-visibility.e2e.spec.ts (버튼 표시 확인)

### 문서 추적

- **DOC**:
  - README.md (환경 변수 설정 가이드)
  - development-guide.md (개발자 온보딩)

---

## 품질 기준 (Quality Criteria)

### 기능 품질

- ✅ Facebook UI 환경 변수 설정 시 활성화
- ✅ 환경 변수 미설정 시 안전한 폴백 동작
- ✅ 채택 버튼이 질문 작성자에게만 표시
- ✅ 개발 서버 재시작 시 환경 변수 즉시 반영

### 코드 품질

- ✅ TypeScript 타입 안정성
- ✅ 환경 변수 값 검증
- ✅ 에러 처리 및 로깅
- ✅ 주석 및 문서화

### 보안 품질

- ✅ .env.local이 .gitignore에 포함
- ✅ 민감한 정보 환경 변수로 분리
- ✅ 환경 변수 값의 정확성 검증

### 문서 품질

- ✅ .env.example 제공
- ✅ README 환경 변수 설명
- ✅ 개발자 온보딩 가이드

---

## 리스크 분석 (Risk Analysis)

### 리스크 1: 환경 변수 누락

- **가능성**: 중
- **영향도**: 중
- **완화책**: .env.example 제공 및 문서화
- **모니터링**: 로그에서 "ENV initialized as FALSE" 확인

### 리스크 2: .env.local Git 커밋

- **가능성**: 낮음
- **영향도**: 높음 (보안 위협)
- **완화책**: .gitignore 검증 및 pre-commit hook
- **모니터링**: Git 커밋 전 .env.local 포함 여부 확인

### 리스크 3: 환경 변수 값 오류

- **가능성**: 낮음
- **영향도**: 중
- **완화책**: 환경 변수 값 검증 로직 (=== "true" 정확 비교)
- **모니터링**: 콘솔 로그 확인

### 리스크 4: 프로덕션 배포 시 환경 변수 미설정

- **가능성**: 낮음
- **영향도**: 높음 (기능 비활성화)
- **완화책**: CI/CD 파이프라인에 환경 변수 설정 스크립트 포함
- **모니터링**: 배포 로그에서 환경 변수 확인

---

## 완료 조건 (Definition of Done)

- [x] .env.local 파일 생성 및 NEXT_PUBLIC_USE_FACEBOOK_UI=true 설정
- [x] .env.example 파일 업데이트
- [x] README.md 환경 변수 설명 추가
- [x] 개발 서버 재시작 후 콘솔 로그 확인
- [x] 질문 상세 페이지에서 채택 버튼 시각적 확인
- [x] 질문 작성자만 채택 버튼 보임 확인
- [x] 환경 변수 제거 후 폴백 메시지 확인
- [x] 모든 acceptance.md 테스트 시나리오 통과
- [x] .gitignore .env.local 포함 확인
- [x] 팀 온보딩 문서 업데이트
