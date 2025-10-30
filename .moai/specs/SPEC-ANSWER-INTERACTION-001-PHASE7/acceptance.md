# Acceptance Criteria - Phase 7: E2E Testing & Performance Validation

## 개요

Phase 7의 완료 기준을 정의합니다. 모든 E2E 테스트가 통과하고, 성능 메트릭이 목표를 달성하며, TRUST 5 원칙을 준수해야 Phase 7이 완료된 것으로 간주됩니다.

---

## Acceptance Scenarios

### Scenario 1: 사용자가 실시간으로 채택 알림을 받는다

**Given-When-Then Format:**

```gherkin
Given 사용자 A가 질문을 작성했고
  And 사용자 B가 해당 질문에 답변을 작성했고
  And 사용자 B가 브라우저에서 질문 페이지를 보고 있다
When 사용자 A가 사용자 B의 답변을 채택한다
Then 사용자 B는 500ms 이내에 채택 알림을 받아야 한다
  And 알림에는 "답변이 채택되었습니다" 메시지가 표시되어야 한다
  And 알림에는 "+10 포인트" 정보가 표시되어야 한다
  And 배지 획득 알림이 함께 표시되어야 한다
  And 알림은 3초 후 자동으로 사라져야 한다
```

**검증 방법:**

- fast-playwright MCP를 사용한 E2E 테스트
- Performance API로 지연시간 측정
- DOM 요소 검증 (`[data-testid="adoption-notification"]`)
- 타이머 검증 (3초 후 DOM 제거)

**예상 결과:**

- ✅ 알림 전송 지연: 평균 300-400ms
- ✅ 알림 자동 해제: 정확히 3초 후
- ✅ 배지 알림 표시: 100%
- ✅ 포인트 정보 표시: 100%

---

### Scenario 2: 여러 사용자가 동시에 좋아요 카운트를 본다

**Given-When-Then Format:**

```gherkin
Given 사용자 A, B, C가 동일한 답변 페이지를 보고 있고
  And 해당 답변의 좋아요 카운트가 0이다
When 사용자 A가 좋아요 버튼을 클릭한다
Then 사용자 A의 브라우저에서 좋아요 카운트가 1로 즉시 업데이트되어야 한다
  And 사용자 B의 브라우저에서 300ms 이내에 좋아요 카운트가 1로 업데이트되어야 한다
  And 사용자 C의 브라우저에서 300ms 이내에 좋아요 카운트가 1로 업데이트되어야 한다
  And 좋아요 아이콘 색상이 파란색으로 변경되어야 한다
  And 알림이 표시되지 않아야 한다 (Silent Operation)
```

**검증 방법:**

- 3개의 브라우저 인스턴스 동시 실행
- Socket.io 이벤트 모니터링
- UI 상태 변경 검증
- 알림 표시 여부 검증 (표시되지 않음)

**예상 결과:**

- ✅ 사용자 A: 즉시 업데이트 (낙관적 업데이트)
- ✅ 사용자 B, C: 평균 200-250ms 지연
- ✅ UI 일관성: 100% (모든 사용자가 동일한 카운트 표시)
- ✅ 알림 표시: 0건 (Silent)

---

### Scenario 3: 배지 알림이 자동으로 사라진다

**Given-When-Then Format:**

```gherkin
Given 사용자 B가 처음으로 답변 채택을 받았고
  And 배지 획득 조건을 만족한다
When 채택 이벤트가 발생한다
Then 배지 알림이 즉시 표시되어야 한다
  And 알림에는 "첫 채택 배지를 획득했습니다!" 메시지가 표시되어야 한다
  And 알림에는 배지 아이콘이 표시되어야 한다
  And 3초 후 Fade-out 애니메이션이 실행되어야 한다
  And 애니메이션 완료 후 DOM에서 알림 요소가 제거되어야 한다
  And 메모리에서 알림 객체가 제거되어야 한다
```

**검증 방법:**

- DOM 요소 생명주기 추적
- CSS 애니메이션 검증 (`transition: opacity 300ms`)
- Memory Profiler로 메모리 해제 확인
- 3초 타이머 정확도 검증

**예상 결과:**

- ✅ 알림 표시 즉시성: < 100ms
- ✅ 타이머 정확도: 3000ms ± 50ms
- ✅ Fade-out 지속시간: 300ms
- ✅ 메모리 해제: 100%

---

### Scenario 4: 성능 메트릭이 목표를 달성한다

**Given-When-Then Format:**

```gherkin
Given 100개의 채택 이벤트를 연속으로 발생시킨다
When 각 이벤트의 지연시간을 측정한다
Then 알림 전송 지연시간의 평균이 500ms 미만이어야 한다
  And P95 지연시간이 600ms 미만이어야 한다
  And P99 지연시간이 800ms 미만이어야 한다
  And 메모리 사용량이 선형적으로 증가하지 않아야 한다 (누수 없음)
  And 네트워크 대역폭이 합리적 범위 내에 있어야 한다 (< 1MB/100 events)
```

**검증 방법:**

- 100회 반복 테스트
- Performance API로 각 이벤트 지연시간 측정
- 통계 데이터 수집 (평균, 중앙값, P95, P99)
- Memory Profiler로 메모리 사용량 추적
- Network Monitor로 대역폭 측정

**예상 결과:**

| 메트릭          | 목표             | 예상 결과 |
| --------------- | ---------------- | --------- |
| 평균 지연시간   | < 500ms          | 300-400ms |
| P95 지연시간    | < 600ms          | 450-550ms |
| P99 지연시간    | < 800ms          | 600-750ms |
| 메모리 증가율   | 0% (누수 없음)   | 0%        |
| 네트워크 대역폭 | < 1MB/100 events | 500-800KB |

---

### Scenario 5: 메모리가 50개 알림으로 제한된다

**Given-When-Then Format:**

```gherkin
Given 알림 시스템이 초기화되었다
When 51개의 알림을 연속으로 생성한다
Then 메모리에는 최대 50개의 알림만 유지되어야 한다
  And 가장 오래된 알림 (1번)이 자동으로 제거되어야 한다
  And 최신 알림 (2-51번)은 유지되어야 한다
  And 메모리 사용량이 일정 수준으로 유지되어야 한다
```

**검증 방법:**

- 51개 알림 생성
- 알림 배열 크기 검증
- 순환 버퍼(Circular Buffer) 동작 확인
- Memory Profiler로 메모리 사용량 안정성 확인

**예상 결과:**

- ✅ 알림 배열 크기: 정확히 50개
- ✅ 가장 오래된 알림 제거: 100%
- ✅ 메모리 안정성: ± 5% 범위 내

---

### Scenario 6: 네트워크 단절 후 재연결 시 상태가 동기화된다

**Given-When-Then Format:**

```gherkin
Given 사용자 B가 Socket.io로 연결되어 있고
  And 답변 페이지를 보고 있다
When 네트워크 연결이 일시적으로 끊긴다
  And 사용자 A가 좋아요를 클릭한다
  And 네트워크 연결이 복구된다
Then Socket.io가 자동으로 재연결되어야 한다 (< 2초)
  And 재연결 후 서버 상태를 조회해야 한다
  And 사용자 B의 UI가 최신 상태로 업데이트되어야 한다
  And 좋아요 카운트가 정확히 반영되어야 한다
```

**검증 방법:**

- 네트워크 조건 시뮬레이션 (Offline → Online)
- Socket.io 재연결 이벤트 모니터링
- 상태 동기화 API 호출 검증
- UI 업데이트 확인

**예상 결과:**

- ✅ 재연결 시간: 평균 1-1.5초
- ✅ 상태 동기화 성공률: 100%
- ✅ UI 일관성: 100%

---

### Scenario 7: 중복 채택이 방지된다

**Given-When-Then Format:**

```gherkin
Given 사용자 A가 질문에 2개의 답변을 받았고
  And 두 답변 모두 채택되지 않았다
When 사용자 A가 답변1과 답변2를 거의 동시에 채택하려고 시도한다
Then 시스템은 첫 번째 요청만 수락해야 한다
  And 두 번째 요청은 거부되어야 한다
  And 사용자 A에게 "이미 답변을 채택했습니다" 에러 메시지가 표시되어야 한다
  And 데이터베이스에는 하나의 채택만 기록되어야 한다
```

**검증 방법:**

- 동시 요청 시뮬레이션 (`Promise.all`)
- API 응답 검증 (하나는 200 OK, 하나는 400 Bad Request)
- 데이터베이스 무결성 검증
- 에러 메시지 표시 확인

**예상 결과:**

- ✅ 채택 성공: 1건
- ✅ 채택 실패 (에러): 1건
- ✅ 데이터 무결성: 100%
- ✅ 사용자 에러 피드백: 명확한 메시지

---

## 테스트 실행 체크리스트

### 사전 준비

- [ ] fast-playwright MCP 서버 활성화 확인
- [ ] 로컬 개발 서버 실행 (`http://localhost:3000`)
- [ ] 테스트 데이터베이스 준비
- [ ] Socket.io 서버 활성화 확인
- [ ] 테스트 사용자 계정 생성 (최소 5개)

### E2E 테스트 실행

- [ ] Test Suite 1: Real-time Adoption Notifications (4 tests)
  - [ ] Test 1: 실시간 채택 알림 전송
  - [ ] Test 2: 배지 획득 알림 표시
  - [ ] Test 3: 알림 자동 해제 (3초)
  - [ ] Test 4: 포인트 증가 정보 표시

- [ ] Test Suite 2: Performance Validation (5 tests)
  - [ ] Test 5: 알림 전송 지연시간 (< 500ms)
  - [ ] Test 6: 좋아요 업데이트 지연시간 (< 300ms)
  - [ ] Test 7: 메모리 제한 (50개)
  - [ ] Test 8: 동시 사용자 (10명)
  - [ ] Test 9: 네트워크 대역폭

- [ ] Test Suite 3: Multi-user Integration (3 tests)
  - [ ] Test 10: 다중 사용자 동기화
  - [ ] Test 11: 충돌 방지 (중복 채택)
  - [ ] Test 12: 재연결 후 상태 동기화

### 성능 메트릭 검증

- [ ] 알림 전송 지연: < 500ms (평균)
- [ ] 좋아요 업데이트 지연: < 300ms (평균)
- [ ] 메모리 제한: ≤ 50개 알림
- [ ] 동시 사용자: ≥ 10명 지원
- [ ] 재연결 시간: < 2초
- [ ] 네트워크 대역폭: < 1MB/100 events

### 사후 정리

- [ ] 테스트 사용자 계정 정리
- [ ] 테스트 데이터베이스 초기화
- [ ] 테스트 실행 로그 저장
- [ ] 성능 벤치마크 결과 문서화
- [ ] 스크린샷 및 비디오 아카이브

---

## 성공 기준 (Success Criteria)

### 필수 기준 (Must Have)

1. **E2E 테스트 통과율**
   - ✅ 20개 이상의 E2E 테스트 작성
   - ✅ 모든 E2E 테스트 100% PASS
   - ✅ 테스트 커버리지: 주요 플로우 100%

2. **성능 메트릭 달성**
   - ✅ 알림 전송 지연: < 500ms (평균)
   - ✅ 좋아요 업데이트 지연: < 300ms (평균)
   - ✅ 메모리 제한: 50개 알림 준수
   - ✅ 동시 사용자: 10명 이상 지원
   - ✅ 재연결 시간: < 2초
   - ✅ 메모리 누수: 0건

3. **TRUST 5 원칙 준수**
   - ✅ **T**est First: E2E 테스트 우선 작성
   - ✅ **R**eadable: 테스트 코드 가독성 (ESLint PASS)
   - ✅ **U**nified: 테스트 헬퍼 재사용 (DRY)
   - ✅ **S**ecured: 테스트 데이터 격리
   - ✅ **T**rackable: @TAG 체인 100% 유지

### 권장 기준 (Should Have)

1. **문서화**
   - ✅ E2E 테스트 실행 가이드 작성
   - ✅ 성능 벤치마크 결과 문서화
   - ✅ 트러블슈팅 가이드 작성

2. **자동화**
   - ✅ CI/CD 파이프라인 통합 (선택)
   - ✅ 자동 성능 리포트 생성 (선택)

---

## 품질 게이트 (Quality Gates)

### Gate 1: E2E 테스트 완성도

**검증 항목:**

- [ ] 20개 이상의 E2E 테스트 작성 완료
- [ ] 모든 테스트 PASS (0 failures)
- [ ] 테스트 헬퍼 함수 구현 완료
- [ ] 테스트 독립성 확보 (각 테스트는 독립 실행 가능)

**통과 기준:**

- E2E 테스트 수: ≥ 20개
- 통과율: 100%
- 테스트 격리: 100%

**Gate 1 Status:** [ ] PASS / [ ] FAIL

---

### Gate 2: 성능 메트릭 달성

**검증 항목:**

- [ ] 알림 전송 지연: < 500ms 달성
- [ ] 좋아요 업데이트 지연: < 300ms 달성
- [ ] 메모리 제한: 50개 알림 준수
- [ ] 동시 사용자: 10명 이상 지원
- [ ] 재연결 시간: < 2초
- [ ] 메모리 누수: 0건

**통과 기준:**

- 모든 메트릭 목표 달성: 6/6
- 성능 테스트 반복 횟수: 100회 이상
- 통계적 신뢰도: P95, P99 검증

**Gate 2 Status:** [ ] PASS / [ ] FAIL

---

### Gate 3: TRUST 5 준수

**검증 항목:**

- [ ] **T**est First: E2E 테스트 우선 작성 확인
- [ ] **R**eadable: ESLint 검사 PASS
- [ ] **U**nified: 테스트 헬퍼 재사용 (DRY 원칙)
- [ ] **S**ecured: 테스트 데이터 격리 확인
- [ ] **T**rackable: @TAG 체인 100% 유지

**통과 기준:**

- TRUST 5 점수: 25/25 (100%)

**Gate 3 Status:** [ ] PASS / [ ] FAIL

---

### Gate 4: 사용자 시나리오 검증

**검증 항목:**

- [ ] Scenario 1: 실시간 채택 알림 검증 PASS
- [ ] Scenario 2: 다중 사용자 동기화 검증 PASS
- [ ] Scenario 3: 배지 알림 자동 해제 검증 PASS
- [ ] Scenario 4: 성능 메트릭 달성 PASS
- [ ] Scenario 5: 메모리 제한 검증 PASS
- [ ] Scenario 6: 재연결 동기화 검증 PASS
- [ ] Scenario 7: 중복 채택 방지 검증 PASS

**통과 기준:**

- 모든 시나리오 PASS: 7/7 (100%)

**Gate 4 Status:** [ ] PASS / [ ] FAIL

---

## Definition of Done (완료 정의)

Phase 7은 다음 조건을 **모두** 만족했을 때 완료된 것으로 간주됩니다:

### 코드 완성도

- [x] Phase 1-6 구현 완료 (v0.1.2)
- [ ] E2E 테스트 파일 작성 완료 (`answer-notification-realtime.e2e.spec.ts`)
- [ ] 테스트 헬퍼 함수 구현 완료 (3개 파일)
- [ ] 모든 E2E 테스트 PASS (20개 이상)

### 성능 검증

- [ ] 알림 전송 지연: < 500ms 달성 및 문서화
- [ ] 좋아요 업데이트 지연: < 300ms 달성 및 문서화
- [ ] 메모리 제한: 50개 알림 준수 확인
- [ ] 동시 사용자: 10명 이상 지원 확인
- [ ] 메모리 누수: 0건 확인

### 품질 보증

- [ ] TRUST 5 원칙 100% 준수 (25/25)
- [ ] 모든 품질 게이트 PASS (Gate 1-4)
- [ ] 코드 리뷰 완료
- [ ] 문서화 완료 (테스트 가이드, 성능 벤치마크)

### 추적성

- [ ] @TAG 체인 100% 유지
  - `@SPEC:ANSWER-INTERACTION-001-PHASE7`
  - `@REQ:ANSWER-INTERACTION-001-PHASE7-E1/E2/E3`
  - `@REQ:ANSWER-INTERACTION-001-PHASE7-S1/S2`
  - `@REQ:ANSWER-INTERACTION-001-PHASE7-C1/C2/C3`
- [ ] Git 커밋 메시지에 @TAG 포함
- [ ] PR 설명에 테스트 결과 포함

---

## 최종 승인 (Final Approval)

### 승인 체크리스트

- [ ] 모든 E2E 테스트 PASS (20개 이상)
- [ ] 모든 성능 메트릭 목표 달성 (6/6)
- [ ] TRUST 5 점수 25/25
- [ ] 모든 품질 게이트 PASS (Gate 1-4)
- [ ] Definition of Done 모든 항목 체크
- [ ] 문서화 완료

### 승인 서명

- **작성자**: @alfred
- **검토자**: tdd-implementer, debug-helper
- **승인 날짜**: [테스트 완료 후 기입]
- **Phase 7 상태**: [ ] 완료 / [ ] 진행 중 / [ ] 보류

---

## 다음 단계 (Phase 8 Preview)

Phase 7 완료 후 다음 단계:

1. **Phase 8 진입**
   - 부하 테스트 (100명 동시 접속)
   - 확장성 검증 (수평 확장 전략)
   - 프로덕션 준비 (모니터링, 알림)

2. **Phase 7 회고**
   - 성능 벤치마크 분석
   - 개선 사항 식별
   - Phase 8 요구사항 도출

3. **문서 업데이트**
   - SPEC 버전 업그레이드 (v0.0.1 → v0.1.0)
   - 성능 벤치마크 결과 아카이브
   - 베스트 프랙티스 문서화

---

## Notes

### 트러블슈팅 가이드

**문제 1: fast-playwright MCP가 활성화되지 않음**

- **해결 방법**: Claude Desktop MCP 설정 확인
- **대체 방안**: Playwright 직접 사용 (`npm install @playwright/test`)

**문제 2: Socket.io 연결 실패**

- **해결 방법**: 로컬 서버 포트 확인 (3000), CORS 설정 확인
- **대체 방안**: Socket.io 테스트 서버 재시작

**문제 3: 타이밍 이슈 (Flaky Tests)**

- **해결 방법**: Wait 조건 추가 (`waitForSelector`), 타임아웃 증가
- **대체 방안**: Polling 전략 사용, Retry 로직 추가

**문제 4: 메모리 누수 감지**

- **해결 방법**: Memory Profiler로 원인 분석, 클린업 로직 추가
- **대체 방안**: 테스트 후 브라우저 재시작

### 참고 문서

- [fast-playwright MCP 문서](https://github.com/executeautomation/fast-mcp)
- [Playwright E2E Testing Guide](https://playwright.dev/docs/writing-tests)
- [Socket.io Testing Best Practices](https://socket.io/docs/v4/testing/)
- [Performance API MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

### 연락처

- **Phase 7 담당**: tdd-implementer
- **성능 검증 담당**: tdd-implementer
- **디버깅 지원**: debug-helper
- **문서화 담당**: doc-syncer
