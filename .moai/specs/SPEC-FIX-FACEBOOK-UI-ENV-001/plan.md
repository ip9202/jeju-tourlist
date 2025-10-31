# @SPEC:FIX-FACEBOOK-UI-ENV-001: 구현 계획

## 핵심 목표 (Primary Goal)

Facebook UI 기능 플래그 환경 변수를 설정하여 질문 상세 페이지에서 **채택(채택) 버튼 UI가 정상적으로 표시**되도록 복구합니다.

### 성과물 (Deliverables)

- ✅ `.env.local` 파일 생성 및 `NEXT_PUBLIC_USE_FACEBOOK_UI=true` 설정
- ✅ `.env.example` 파일에 환경 변수 문서화
- ✅ README.md 또는 CONTRIBUTING.md에 환경 변수 설명 추가
- ✅ 개발 서버에서 채택 버튼 정상 표시 확인
- ✅ 새로운 개발자가 쉽게 환경 변수 설정 가능하도록 문서화

---

## 실행 계획 (Implementation Strategy)

### Phase 1: 환경 변수 파일 생성 및 설정 (예상 시간: 5분)

#### Step 1.1: .env.local 파일 생성

```bash
# 작업 위치: apps/web/

# 1. .env.local 파일 생성
touch .env.local

# 2. 다음 내용 추가
echo "NEXT_PUBLIC_USE_FACEBOOK_UI=true" >> .env.local

# 3. 파일 확인
cat .env.local
```

**확인사항**:

- [ ] .env.local 파일이 `apps/web/` 디렉토리에 생성됨
- [ ] 파일 내용에 `NEXT_PUBLIC_USE_FACEBOOK_UI=true` 정확히 기재됨
- [ ] 줄바꿈 없음 (파일 끝에 newline 없음 - 선택사항)

#### Step 1.2: .gitignore 확인

```bash
# 1. .gitignore 파일 확인
grep ".env.local" .gitignore

# 2. 결과: 다음과 같아야 함
# .env.local
```

**확인사항**:

- [ ] .env.local이 .gitignore에 포함됨
- [ ] 버전 관리 시스템에서 제외됨

#### Step 1.3: git 상태 확인

```bash
# 1. 변경사항 확인
git status

# 예상 결과:
# Untracked files:
# (use "git add <file>..." to include in what will be committed)
#     apps/web/.env.local
```

**확인사항**:

- [ ] .env.local이 Untracked files (추적되지 않음)로 표시됨
- [ ] .env.local이 staging area에 포함되지 않음

---

### Phase 2: 환경 변수 문서화 (예상 시간: 10분)

#### Step 2.1: .env.example 파일 확인 및 업데이트

**현재 상태 확인**:

```bash
# 1. 기존 .env.example 확인
cat apps/web/.env.example | grep NEXT_PUBLIC_USE_FACEBOOK_UI

# 결과가 없으면 다음 단계 진행
```

**파일 업데이트**:

```bash
# 1. .env.example에 Facebook UI 환경 변수 추가
# 파일 끝에 다음 내용 추가:
cat >> apps/web/.env.example << 'EOF'

# Facebook UI Feature Flag (개발 환경에서만 true로 설정)
# NEXT_PUBLIC_USE_FACEBOOK_UI=true
EOF

# 2. 파일 확인
tail -5 apps/web/.env.example
```

**확인사항**:

- [ ] NEXT_PUBLIC_USE_FACEBOOK_UI 변수가 .env.example에 추가됨
- [ ] 주석으로 용도 설명이 포함됨
- [ ] 예시 값이 명확함

#### Step 2.2: README.md 환경 변수 섹션 추가

**파일 위치**: `apps/web/README.md` 또는 프로젝트 루트 `README.md`

**추가할 내용**:

````markdown
## 환경 변수 (Environment Variables)

### 개발 환경 설정 (Development Setup)

1. `.env.local` 파일 생성:
   ```bash
   cp .env.example .env.local
   ```
````

2. `.env.local` 파일 편집:

   ```bash
   NEXT_PUBLIC_USE_FACEBOOK_UI=true
   ```

3. 개발 서버 시작:
   ```bash
   npm run dev
   ```

### Facebook UI 기능 플래그 (Facebook UI Feature Flag)

- **NEXT_PUBLIC_USE_FACEBOOK_UI**: Facebook 스타일 Q&A UI 활성화 여부
  - `true`: Facebook UI 활성화 (채택 버튼 표시)
  - `false` 또는 미설정: 레거시 답변 시스템 사용
  - 기본값: false (안전한 폴백)

### 주의사항 (Important)

- ⚠️ `.env.local` 파일은 절대 Git에 커밋하지 마세요
- ⚠️ `.env.local`은 `.gitignore`에 포함되어 있습니다
- ✅ 민감한 정보(API Key, Secret)는 `.env.local`에만 저장하세요

````

**확인사항**:
- [ ] README.md에 환경 변수 섹션 추가됨
- [ ] 설정 방법이 명확히 설명됨
- [ ] 주의사항이 강조됨

---

### Phase 3: 개발 서버 재시작 및 동작 확인 (예상 시간: 5분)

#### Step 3.1: 기존 개발 서버 중지
```bash
# 1. 프로세스 확인
lsof -i :3000

# 2. 프로세스 종료
pkill -f "next dev"
# 또는
./kill-services.sh
````

**확인사항**:

- [ ] 포트 3000에서 실행 중인 프로세스 없음
- [ ] 개발 서버 완전히 종료됨

#### Step 3.2: 개발 서버 재시작

```bash
# 1. 개발 서버 시작
npm run dev

# 예상 로그:
# ▲ Next.js 14.2.33
# - Local:        http://localhost:3000
# ✓ Ready in XXXms
```

**확인사항**:

- [ ] 개발 서버가 정상 시작됨
- [ ] "Ready in" 메시지 출력됨
- [ ] 포트 3000에서 수신 중

#### Step 3.3: 환경 변수 로드 확인

```bash
# 브라우저 콘솔에서 다음 명령 실행:
console.log(process.env.NEXT_PUBLIC_USE_FACEBOOK_UI)

# 예상 결과: "true"
```

**확인사항**:

- [ ] 브라우저 콘솔에 "true" 출력됨
- [ ] 환경 변수가 정상 로드됨

#### Step 3.4: 훅 로그 확인

```bash
# 브라우저 콘솔에서 다음 로그 확인:
# [useNewFacebookUI] ENV initialized as TRUE
```

**확인사항**:

- [ ] 콘솔에 초기화 로그 출력됨
- [ ] useNewFacebookUI 훅이 "true" 값으로 초기화됨

---

### Phase 4: UI 동작 확인 (예상 시간: 10분)

#### Step 4.1: 질문 상세 페이지 접속

```bash
# URL: http://localhost:3000/questions/[question-id]

# 로그인 계정: 질문 작성자 계정으로 로그인 필수
```

**확인사항**:

- [ ] 페이지 정상 로드됨
- [ ] 답변 목록이 표시됨

#### Step 4.2: 채택 버튼 시각적 확인 (질문 작성자)

```
기대 결과:
┌────────────────────────────────┐
│ 답변 내용                      │
├────────────────────────────────┤
│ ☆ 좋아요 | ☆ 싫어요 | 답글     │
│ ✓ 채택 | ✓ 채택 해제          │ ← 이 부분이 보여야 함
└────────────────────────────────┘
```

**확인사항**:

- [ ] 채택 버튼이 표시됨
- [ ] "채택" 또는 "채택 해제" 중 하나 표시됨
- [ ] 버튼이 클릭 가능함

#### Step 4.3: 채택 버튼 숨김 확인 (비작성자)

```
기대 결과:
┌────────────────────────────────┐
│ 답변 내용                      │
├────────────────────────────────┤
│ ☆ 좋아요 | ☆ 싫어요 | 답글     │
│                               │
└────────────────────────────────┘
```

**확인사항**:

- [ ] 채택 버튼이 표시되지 않음
- [ ] 다른 사용자 계정으로 확인

#### Step 4.4: 채택 버튼 클릭 동작

```bash
# 1. 질문 작성자 계정으로 로그인
# 2. 채택되지 않은 답변 찾기
# 3. "채택" 버튼 클릭
```

**기대 결과**:

- [ ] 버튼이 "채택 해제"로 변경됨
- [ ] 답변에 채택 배지 표시
- [ ] 포인트 증가 알림 표시 (선택사항)

---

## 아키텍처 설계 (Architecture Design)

### 시스템 데이터 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│ 개발 환경 초기화 (Development Environment Init)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  .env.local 파일 로드                                          │
│     │                                                           │
│     ├─ NEXT_PUBLIC_USE_FACEBOOK_UI=true                        │
│     │                                                           │
│  Next.js 환경 변수 시스템                                      │
│     │                                                           │
│     └─→ process.env.NEXT_PUBLIC_USE_FACEBOOK_UI 설정          │
│                                                                 │
└────────────┬──────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 애플리케이션 런타임 (Application Runtime)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  page.tsx 렌더링                                               │
│     │                                                           │
│     ├─→ useNewFacebookUI() 호출                                │
│     │      │                                                   │
│     │      └─→ process.env.NEXT_PUBLIC_USE_FACEBOOK_UI 확인    │
│     │           │                                              │
│     │           └─→ "true" ✓                                   │
│     │                                                           │
│     ├─→ useFacebookUI = true                                   │
│     │                                                           │
│     └─→ <FacebookAnswerThread /> 렌더링 결정                  │
│                                                                 │
└────────────┬──────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ UI 렌더링 (UI Rendering)                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FacebookAnswerThread                                          │
│     │                                                           │
│     └─→ FacebookAnswerCard (각 답변별)                        │
│           │                                                    │
│           ├─→ 좋아요 / 싫어요 / 답글 버튼                      │
│           │                                                    │
│           └─→ 조건부 렌더링: isQuestionAuthor?                 │
│                 ✓ TRUE  └─→ 채택 버튼 표시                    │
│                 ✗ FALSE └─→ 채택 버튼 숨김                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 환경 변수 우선순위 (Environment Variable Priority)

```
┌──────────────────────────────────────────────────┐
│ NEXT_PUBLIC_USE_FACEBOOK_UI 로딩 순서            │
├──────────────────────────────────────────────────┤
│                                                  │
│ 1. .env.local (가장 우선)                      │
│    └─ NEXT_PUBLIC_USE_FACEBOOK_UI=true          │
│       ↓ 값 없으면                                │
│ 2. .env.development (개발 환경)                │
│    └─ 현재: 값 없음                             │
│       ↓ 값 없으면                                │
│ 3. .env (기본값)                                │
│    └─ 현재: 값 없음                             │
│       ↓ 값 없으면                                │
│ 4. 컴파일 타임 기본값                            │
│    └─ false (안전한 폴백)                       │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 기술 스택 및 버전 (Technology Stack)

| 항목       | 버전            | 설명          |
| ---------- | --------------- | ------------- |
| Node.js    | LTS (18.x 이상) | 런타임 환경   |
| npm        | 8.x 이상        | 패키지 매니저 |
| Next.js    | 14.2.33         | 프레임워크    |
| React      | 19.x            | UI 라이브러리 |
| TypeScript | 5.7+            | 언어          |

### 환경 변수 시스템

- **시스템**: Next.js Built-in Environment Variable System
- **특징**: 빌드 타임에 로드되며, `NEXT_PUBLIC_` 접두사는 클라이언트에서 접근 가능
- **문서**: https://nextjs.org/docs/basic-features/environment-variables

---

## 테스트 전략 (Testing Strategy)

### 수동 테스트 체크리스트

#### 1. 환경 변수 로드 확인

- [ ] `.env.local`이 `apps/web/` 디렉토리에 존재
- [ ] 파일 내용: `NEXT_PUBLIC_USE_FACEBOOK_UI=true`
- [ ] 브라우저 콘솔: `process.env.NEXT_PUBLIC_USE_FACEBOOK_UI === "true"`

#### 2. UI 렌더링 확인

- [ ] 질문 상세 페이지 로드 성공
- [ ] 답변 목록 표시됨
- [ ] Facebook 스타일 UI 렌더링됨

#### 3. 채택 버튼 표시

- [ ] 질문 작성자: 채택 버튼 표시
- [ ] 비작성자: 채택 버튼 숨김
- [ ] 채택됨 상태: "채택 해제" 버튼 표시
- [ ] 채택 안 됨 상태: "채택" 버튼 표시

#### 4. 버튼 기능 동작

- [ ] "채택" 클릭 → 상태 변경
- [ ] "채택 해제" 클릭 → 상태 복구
- [ ] API 요청 성공 (콘솔 확인)
- [ ] 에러 메시지 없음

#### 5. 폴백 동작 확인

- [ ] `.env.local` 제거
- [ ] 개발 서버 재시작
- [ ] "기존 답변 시스템입니다." 메시지 표시
- [ ] Facebook UI 렌더링 안 됨

---

## 리스크 및 완화 계획 (Risk Management)

### 리스크 1: 환경 변수 설정 누락

- **확률**: 중 (개발자 온보딩 단계)
- **영향**: 중 (기능 비활성화)
- **완화**:
  - .env.example 제공
  - README 문서화
  - 로그 메시지 출력

### 리스크 2: 환경 변수 값 오류

- **확률**: 낮음
- **영향**: 중 (기능 비활성화)
- **완화**:
  - 값 검증: `=== "true"` 정확 비교
  - 콘솔 로그: 값 확인 가능

### 리스크 3: .env.local Git 커밋

- **확률**: 낮음
- **영향**: 높음 (보안 위협)
- **완화**:
  - .gitignore 확인
  - pre-commit hook 설정 (선택)
  - 팀 가이드라인 문서화

### 리스크 4: 프로덕션 배포 미설정

- **확률**: 낮음
- **영향**: 높음 (기능 비활성화)
- **완화**:
  - CI/CD 파이프라인 환경 변수 설정
  - 배포 전 검증 스크립트
  - 모니터링 대시보드

---

## 마일스톤 (Milestones)

### 🟢 M1: 환경 파일 설정 완료

**목표**: 개발 환경에서 환경 변수 정상 로드

- 작업: Phase 1, 2
- 확인: 브라우저 콘솔에서 환경 변수 값 확인
- 우선순위: 🔴 Critical

### 🟡 M2: UI 렌더링 확인 완료

**목표**: Facebook UI와 채택 버튼 정상 표시

- 작업: Phase 3, 4
- 확인: 질문 상세 페이지에서 UI 시각적 확인
- 우선순위: 🔴 Critical

### 🟡 M3: 문서화 및 온보딩 완료

**목표**: 새로운 개발자가 쉽게 환경 변수 설정

- 작업: README, CONTRIBUTING 업데이트
- 확인: 팀원 실제 설정 확인
- 우선순위: 🟡 High

### 🔵 M4: CI/CD 파이프라인 업데이트

**목표**: 자동화된 배포 환경 변수 설정

- 작업: GitHub Actions 또는 배포 스크립트
- 확인: 프로덕션 배포 후 로그 확인
- 우선순위: 🔵 Medium (향후)

---

## 예상 완료 시간

| Phase    | 작업                | 예상 시간 |
| -------- | ------------------- | --------- |
| Phase 1  | 환경 파일 생성      | 5분       |
| Phase 2  | 문서화              | 10분      |
| Phase 3  | 서버 재시작 및 확인 | 5분       |
| Phase 4  | UI 동작 확인        | 10분      |
| **총합** |                     | **30분**  |

---

## 다음 단계 (Next Steps)

### 즉시 완료

1. ✅ Phase 1-4 실행
2. ✅ 모든 확인사항 체크
3. ✅ 스크린샷 또는 영상 기록 (선택)

### 이후 작업 (선택사항)

1. 🟡 CI/CD 파이프라인 환경 변수 설정
2. 🟡 자동화된 환경 변수 검증 스크립트
3. 🟡 팀 온보딩 세션 진행
4. 🟡 프로덕션 배포 환경 변수 설정

---

## 참고사항 (References)

- Next.js Environment Variables: https://nextjs.org/docs/basic-features/environment-variables
- Feature Flag Pattern: https://martinfowler.com/articles/feature-toggles.html
- .env 파일 보안: https://12factor.net/config
