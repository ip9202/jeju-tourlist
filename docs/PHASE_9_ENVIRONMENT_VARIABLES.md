# Phase 9: 환경 변수 설정 가이드

## 개요

Phase 9에서는 Feature flag를 통한 점진적 마이그레이션을 지원합니다.
두 가지 설정 방식이 있습니다:

## 1. Step 1-3: 명시적 Feature flag (현재)

**용도**: 개발 환경 또는 단순 true/false 전환

**.env.local 설정:**

```env
# Facebook 스타일 Q&A UI 활성화
# true: Facebook UI 사용
# false: 기존 UI 사용
NEXT_PUBLIC_USE_FACEBOOK_UI=true
```

**특징**:

- 빌드 타임에 결정됨
- 모든 사용자에게 동일하게 적용
- 변경 시 재배포 필요

---

## 2. Step 3: Gradual Rollout (향후 배포)

**용도**: 프로덕션 배포 시 단계적 사용자 적용

**.env.local 설정:**

```env
# Gradual rollout 단계 설정
# development: 100% (모든 사용자)
# stage-1: 5% 사용자만 적용
# stage-2: 25% 사용자만 적용
# stage-3: 100% (완전 배포)
NEXT_PUBLIC_ROLLOUT_STAGE=development

# 주의: NEXT_PUBLIC_USE_FACEBOOK_UI가 설정되어 있으면
# NEXT_PUBLIC_ROLLOUT_STAGE는 무시됩니다.
```

**사용자 할당 방식**:

- 사용자 ID를 해시하여 0~99 범위의 값 생성
- 동일 사용자는 항상 같은 그룹에 할당 (일관성)
- 예) stage-1 (5%)이면 해시값 0~4인 사용자만 Facebook UI 활성화

---

## 3. 배포 시나리오

### 시나리오 1: 개발 환경 (지금)

```env
NEXT_PUBLIC_USE_FACEBOOK_UI=true
```

모든 개발자와 테스터가 Facebook UI를 테스트합니다.

### 시나리오 2: 프로덕션 1차 (5% 롤아웃)

```env
# NEXT_PUBLIC_USE_FACEBOOK_UI 제거 또는 주석 처리
NEXT_PUBLIC_ROLLOUT_STAGE=stage-1
```

5%의 프로덕션 사용자만 Facebook UI를 경험합니다.

### 시나리오 3: 프로덕션 2차 (25% 롤아웃)

```env
NEXT_PUBLIC_ROLLOUT_STAGE=stage-2
```

25%의 사용자가 Facebook UI를 경험합니다.

### 시나리오 4: 프로덕션 3차 (100% 배포)

```env
NEXT_PUBLIC_ROLLOUT_STAGE=stage-3
```

모든 사용자가 Facebook UI를 사용합니다.

### 시나리오 5: 긴급 롤백

```env
NEXT_PUBLIC_USE_FACEBOOK_UI=false
```

모든 사용자가 기존 UI로 복귀합니다.

---

## 4. 모니터링 및 분석

### 자동 수집 메트릭

#### 성능 메트릭 (Web Vitals)

- **LCP** (Largest Contentful Paint): 가장 큰 콘텐츠 렌더링 시간
  - 목표: ≤ 2.5초 (good)
  - 제한: 2.5s ~ 4s (needs-improvement)
  - 초과: > 4s (poor)

- **FCP** (First Contentful Paint): 첫 콘텐츠 렌더링 시간
  - 목표: ≤ 1.8초 (good)

- **CLS** (Cumulative Layout Shift): 누적 레이아웃 시프트
  - 목표: ≤ 0.1 (good)
  - 제한: 0.1 ~ 0.25 (needs-improvement)
  - 초과: > 0.25 (poor)

- **INP/FID** (Interaction to Next Paint): 상호작용 응답 시간
  - 목표: ≤ 100ms (good)

#### 사용자 상호작용 이벤트

```typescript
// 자동 추적되는 이벤트
- ANSWER_SUBMITTED: 답변 작성
- ANSWER_LIKED: 답변 좋아요
- ANSWER_DISLIKED: 답변 싫어요
- REPLY_SUBMITTED: 댓글 작성
- REPLY_LIKED: 댓글 좋아요
- UI_RENDERED: UI 렌더링 완료
- UI_ERROR: UI 에러 발생
- ERROR_LOGGED: 에러 로깅
```

#### 에러 모니터링

- 실시간 에러 추적
- 에러율 모니터링
- 에러 타입별 분류:
  - ReferenceError
  - TypeError
  - SyntaxError
  - 기타 에러

### 분석 데이터 조회

#### 개발 환경에서 확인

1. 브라우저 개발자 도구 → Console
   - `[Analytics Event]` 접두사로 시작하는 로그 확인
   - `[Performance]` 접두사로 성능 메트릭 확인

2. 로컬 스토리지 확인

   ```javascript
   // 브라우저 콘솔에서 실행
   JSON.parse(localStorage.getItem("facebook-ui-analytics"));
   ```

3. 필터링된 데이터 조회
   ```javascript
   // 특정 이벤트 타입만 조회
   const events = JSON.parse(localStorage.getItem("facebook-ui-analytics"));
   const answerEvents = events.filter(e => e.type === "answer_submitted");
   ```

---

## 5. 향후 통합 (선택사항)

### Sentry (에러 추적)

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/project-id
```

### Datadog (종합 모니터링)

```env
NEXT_PUBLIC_DATADOG_API_KEY=xxxxx
```

---

## 6. 체크리스트

배포 전 확인사항:

- [ ] `.env.local`에 환경 변수 설정
- [ ] 로컬에서 빌드 성공 확인: `npm run build`
- [ ] 개발 환경에서 테스트
- [ ] Console에서 분석 로그 확인
- [ ] 성능 메트릭 수집 확인
- [ ] 롤아웃 단계별 동작 확인 (개발 환경에서만 가능)

---

**문서 작성**: 2025-10-23  
**버전**: 1.0
