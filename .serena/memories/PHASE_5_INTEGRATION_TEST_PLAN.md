# Phase 5: Integration Test Plan

## Objective

Phase 5는 백엔드 adoption API와 frontend UI 간 통합을 검증하는 단계입니다.
현재 Phase 4.5의 브라우저 E2E 테스트(fast-playwright)가 완료되었으므로,
API 계층과의 실제 데이터 플로우를 검증해야 합니다.

## Current Status

- Phase 4 ✅: Frontend UI 구현 완료 (like/dislike buttons, adoption indicator)
- Phase 4.5 ✅: Browser E2E 테스트 완료 (15/15 PASSED)
- Phase 5 🔄: 백엔드 API 통합 테스트 진행 중

## Test Scope

### 1. API Integration Tests (Post Handlers)

**Target Endpoints:**

- `POST /api/answers/:id/reaction` - Like/Dislike toggle
- `POST /api/answers/:id/accept` - Answer adoption
- `DELETE /api/answers/:id/accept` - Answer unadoption

**Test Scenarios:**

1. **toggleAnswerReaction 통합**
   - Like 버튼 클릭 → API 호출 → DB 업데이트 → UI 반영
   - Dislike 버튼 클릭 → API 호출 → DB 업데이트 → UI 반영
   - Like에서 Dislike 전환 → 상호 배타성 검증
   - Dislike에서 Like 전환 → 상호 배타성 검증
   - 취소 기능 (toggle off) → 다시 클릭 시 상태 제거

2. **acceptAnswer 통합**
   - 채택 버튼 클릭 → API 호출
   - questionId, answerId 전달 검증
   - DB Answer.isAccepted = true 업데이트
   - User.points +50 증가 검증
   - Badge 자동 부여 확인 (첫 채택, 10회 채택 등)
   - UI에서 "채택됨" 배지 표시 여부

3. **unacceptAnswer 통합**
   - 채택 해제 버튼 클릭 → API 호출
   - DB Answer.isAccepted = false 업데이트
   - 포인트 회수 안 됨 검증 (기존 정책)
   - UI에서 "채택됨" 배지 제거 여부

### 2. Database Validation

**Verify:**

- Answer 테이블: isAccepted, likeCount, dislikeCount 동기화
- User 테이블: points 증가 기록
- Badge 테이블: 자동 부여된 배지 데이터
- PointTransaction 테이블: 감사 추적(audit trail)

### 3. Error Handling

**Test Invalid Scenarios:**

- 비인증 사용자의 API 호출 → 401 Unauthorized
- 자신의 답변에 좋아요 → 400 Bad Request
- 질문 작성자가 아닌 사용자의 채택 시도 → 403 Forbidden
- 존재하지 않는 답변 ID → 404 Not Found
- 유효하지 않은 questionId → 404 Not Found

### 4. Data Consistency

**Verify:**

- Transaction atomicity: 포인트 증가 + 배지 부여 동시 처리
- Race condition: 동시 채택 요청 처리
- Concurrent reactions: 여러 사용자의 좋아요/싫어요 동시 처리

## Test Implementation Strategy

### Phase 5.1: API Integration Testing (fast-playwright MCP)

```
1. 브라우저에서 실제 API 호출 모니터링
2. Network tab에서 요청/응답 검증
3. UI 상태 변화 실시간 확인
4. Console 에러 검증
```

**Test File Location:** `apps/web/e2e/answer-interaction-integration.spec.ts`

**Test Cases:**

- 15개 통합 시나리오 (Like/Dislike/Adoption)
- 에러 처리 시나리오 (권한, 유효성)
- 데이터 동기화 검증

### Phase 5.2: Backend Integration Testing (Optional)

```
POST /api/answers/:id/accept 직접 호출
응답 데이터 구조 검증
데이터베이스 트랜잭션 검증
```

**Test Framework:** Jest + Prisma MockClient (또는 Test DB)

## Expected Outcomes

✅ **Success Criteria:**

1. 모든 API 호출이 200/201 응답 코드 반환
2. Like/Dislike 카운트가 정확하게 증가/감소
3. 답변 채택 시 User.points 증가 기록
4. Badge 자동 부여 동작
5. UI가 API 응답에 따라 실시간 업데이트
6. 에러 시나리오에서 적절한 HTTP 상태 코드 반환
7. 동시성 문제 없음 (race condition 없음)

❌ **Failure Criteria:**

1. API 5xx 에러 발생
2. 데이터 동기화 불일치 (DB 값 ≠ UI 표시)
3. 권한 검증 실패 (누구나 채택 가능하게 됨)
4. Transaction 실패 (포인트 증가는 되었으나 배지 미부여)

## Test Execution Timeline

- Phase 5.1: API Integration E2E (fast-playwright) - ~1-2시간
- Phase 5.2: 백엔드 통합 테스트 (선택사항) - ~1시간
- 총 예상 시간: 2-3시간

## Next Steps (Phase 6)

- Phase 6: Real-time notifications via Socket.io
  - 채택/좋아요 이벤트 실시간 전파
  - 여러 클라이언트 간 상태 동기화
