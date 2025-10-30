---
id: ANSWER-INTERACTION-001-PHASE7
version: 0.0.1
status: draft
created: 2025-10-30
updated: 2025-10-30
author: "@alfred"
priority: high
category: feature
labels: [phase7, e2e-testing, performance-validation, real-time-notifications]
---

# @SPEC:ANSWER-INTERACTION-001-PHASE7

## HISTORY

### v0.0.1 (2025-10-30) - INITIAL

- Phase 7: E2E 테스트 및 성능 검증 SPEC 초안 작성
- fast-playwright MCP를 활용한 실시간 알림 E2E 테스트 전략 수립
- 성능 메트릭 및 품질 게이트 정의

---

## Environment

### 시스템 컨텍스트

**WHEN** 사용자가 실시간 답변 상호작용 기능을 사용할 때

**시스템 환경:**

- Phase 1-6 완료: 100% 구현 완료 (채택/좋아요/싫어요/배지/실시간 동기화/UI)
- Phase 6 상태: v0.1.2, TRUST 5 점수 25/25 PASS
- Socket.io 실시간 통신 인프라 구축 완료
- 다중 사용자 동시 접속 환경
- Fast-playwright MCP 테스트 환경 구성

### 테스트 범위

**Phase 7 목표:**

1. **E2E 통합 테스트**: 전체 사용자 플로우 검증
2. **성능 검증**: 응답 시간, 메모리 사용량, 동시성 검증
3. **실시간 동기화 검증**: 다중 사용자 간 상태 동기화 확인
4. **UX 검증**: 알림 표시, 자동 해제, 시각적 피드백

---

## Assumptions

### 전제 조건

1. **Phase 1-6 구현 완료**
   - 채택 로직 (Phase 1-3): 완료
   - 좋아요/싫어요 기능 (Phase 4): 완료
   - 배지 시스템 (Phase 5): 완료
   - 실시간 동기화 (Phase 6): 완료

2. **테스트 환경**
   - fast-playwright MCP 서버 활성화
   - 로컬 개발 환경: http://localhost:3000
   - 테스트 데이터베이스: PostgreSQL 테스트 인스턴스
   - Socket.io 테스트 서버 구동

3. **성능 기준선**
   - 알림 전송 지연: < 500ms
   - 좋아요/싫어요 업데이트: < 300ms
   - 메모리 제한: 최대 50개 알림 유지
   - 동시 사용자: 최소 10명 동시 접속 지원

4. **테스트 데이터**
   - 테스트 사용자 계정: 최소 5개 이상
   - 테스트 질문/답변: 각 시나리오별 충분한 데이터
   - 초기 상태: 각 테스트마다 클린 상태로 리셋

---

## Requirements

### Event-based Requirements (이벤트 기반 요구사항)

#### @REQ:ANSWER-INTERACTION-001-PHASE7-E1

**WHEN** 답변 작성자가 자신의 답변이 채택되었을 때
**THE SYSTEM SHALL** 실시간으로 채택 알림을 전송하고 배지 획득 알림을 표시해야 한다

**상세 조건:**

- 채택 이벤트 발생 시 500ms 이내 알림 전송
- 배지 획득 시 축하 메시지 표시
- 알림은 3초 후 자동 해제
- 포인트 증가 정보 포함 (10 포인트)

**E2E 검증 시나리오:**

1. 사용자 A가 질문 작성
2. 사용자 B가 답변 작성
3. 사용자 A가 사용자 B의 답변 채택
4. 사용자 B의 브라우저에서 실시간 알림 확인
5. 배지 획득 알림 표시 확인
6. 3초 후 알림 자동 해제 확인

#### @REQ:ANSWER-INTERACTION-001-PHASE7-E2

**WHEN** 사용자가 답변에 좋아요 또는 싫어요를 누를 때
**THE SYSTEM SHALL** 모든 접속 중인 사용자에게 실시간으로 카운트를 업데이트해야 한다

**상세 조건:**

- 좋아요/싫어요 클릭 후 300ms 이내 전체 사용자 동기화
- UI 상태 즉시 반영 (아이콘 색상 변경)
- 낙관적 업데이트 적용
- 에러 발생 시 롤백

**E2E 검증 시나리오:**

1. 사용자 A, B, C가 동시 접속
2. 사용자 A가 답변에 좋아요 클릭
3. 사용자 B, C의 브라우저에서 좋아요 카운트 실시간 업데이트 확인
4. 사용자 B가 같은 답변에 싫어요 클릭
5. 모든 사용자에게 싫어요 카운트 업데이트 확인
6. 네트워크 에러 시뮬레이션 및 롤백 확인

#### @REQ:ANSWER-INTERACTION-001-PHASE7-E3

**WHEN** 배지 획득 알림이 표시될 때
**THE SYSTEM SHALL** 3초 후 자동으로 알림을 해제하고 메모리에서 제거해야 한다

**상세 조건:**

- 알림 표시 후 정확히 3초 대기
- Fade-out 애니메이션 적용 (300ms)
- 메모리에서 알림 객체 제거
- 알림 큐에서 다음 알림 처리

**E2E 검증 시나리오:**

1. 배지 획득 알림 트리거
2. 알림 표시 확인
3. 3초 타이머 카운트다운 확인
4. Fade-out 애니메이션 확인
5. DOM에서 알림 엘리먼트 제거 확인
6. 메모리 사용량 감소 확인

### State-based Requirements (상태 기반 요구사항)

#### @REQ:ANSWER-INTERACTION-001-PHASE7-S1

**WHILE** Socket.io 연결이 활성 상태일 때
**THE SYSTEM SHALL** 모든 상호작용 이벤트를 실시간으로 브로드캐스트해야 한다

**상세 조건:**

- 연결 상태 모니터링
- 재연결 시 상태 동기화
- 연결 끊김 시 재시도 로직 (최대 3회)
- 연결 상태 UI 표시

**E2E 검증 시나리오:**

1. Socket.io 연결 수립 확인
2. 다중 이벤트 동시 발생 시 순서 보장 확인
3. 네트워크 단절 시뮬레이션
4. 자동 재연결 확인
5. 재연결 후 상태 동기화 확인

#### @REQ:ANSWER-INTERACTION-001-PHASE7-S2

**WHILE** 여러 사용자가 동시에 접속 중일 때
**THE SYSTEM SHALL** 모든 사용자 간 상태 일관성을 유지해야 한다

**상세 조건:**

- 동시성 제어 메커니즘
- 충돌 방지 (같은 답변에 중복 채택 방지)
- 최종 일관성 보장
- 상태 불일치 시 서버 상태 우선

**E2E 검증 시나리오:**

1. 10명의 사용자 동시 접속
2. 동시에 여러 답변에 좋아요/싫어요 클릭
3. 모든 사용자의 UI 상태 일관성 확인
4. 충돌 시나리오 테스트 (중복 채택 시도)
5. 서버 상태와 클라이언트 상태 동기화 확인

### Constraint Requirements (제약 조건)

#### @REQ:ANSWER-INTERACTION-001-PHASE7-C1

**CONSTRAINT** 모든 실시간 알림은 500ms 이내에 전송되어야 한다

**측정 방법:**

- 이벤트 발생 시간과 알림 수신 시간 차이 측정
- Performance API 활용
- 평균, P95, P99 지연시간 기록

**E2E 검증:**

- 100회 반복 테스트
- 각 이벤트마다 지연시간 측정
- 통계 데이터 수집 및 분석

#### @REQ:ANSWER-INTERACTION-001-PHASE7-C2

**CONSTRAINT** 알림 메모리는 최대 50개로 제한되어야 한다

**구현 방법:**

- 순환 버퍼 (Circular Buffer) 사용
- 오래된 알림 자동 제거
- 메모리 사용량 모니터링

**E2E 검증:**

- 51개 이상의 알림 생성
- 가장 오래된 알림 자동 제거 확인
- 메모리 누수 검사

#### @REQ:ANSWER-INTERACTION-001-PHASE7-C3

**CONSTRAINT** 좋아요/싫어요 클릭 시 알림을 표시하지 않아야 한다 (Silent Operation)

**이유:**

- UX 방해 최소화
- 과도한 알림 방지
- 자연스러운 상호작용 유지

**E2E 검증:**

- 좋아요/싫어요 클릭 후 알림 표시 없음 확인
- UI 상태 변경만 확인 (아이콘 색상)
- Toast 또는 모달 표시 없음 확인

---

## Specifications

### E2E 테스트 아키텍처

**테스트 파일 구조:**

```
apps/web/e2e/
├── answer-notification-realtime.e2e.spec.ts  (신규 생성)
├── answer-interaction-integration.e2e.spec.ts (기존)
└── helpers/
    ├── test-users.ts
    ├── socket-helper.ts
    └── performance-monitor.ts
```

**테스트 도구:**

- **fast-playwright MCP**: 브라우저 자동화 및 E2E 테스트
- **Performance API**: 지연시간 측정
- **Socket.io Test Client**: 실시간 이벤트 검증
- **Memory Profiler**: 메모리 사용량 모니터링

### 테스트 스위트 구성

#### Test Suite 1: Real-time Adoption Notifications

1. ✅ **실시간 채택 알림 전송 테스트**
2. ✅ **배지 획득 알림 표시 테스트**
3. ✅ **알림 자동 해제 테스트 (3초)**
4. ✅ **포인트 증가 정보 표시 테스트**

#### Test Suite 2: Performance Validation

1. ✅ **알림 전송 지연시간 테스트 (< 500ms)**
2. ✅ **좋아요/싫어요 업데이트 지연시간 테스트 (< 300ms)**
3. ✅ **메모리 제한 테스트 (최대 50개 알림)**
4. ✅ **동시 사용자 성능 테스트 (10명)**
5. ✅ **네트워크 대역폭 사용량 테스트**

#### Test Suite 3: Multi-user Integration

1. ✅ **다중 사용자 좋아요/싫어요 동기화 테스트**
2. ✅ **충돌 방지 테스트 (중복 채택)**
3. ✅ **재연결 후 상태 동기화 테스트**

### 성능 메트릭

| 메트릭               | 목표           | 측정 방법                                         |
| -------------------- | -------------- | ------------------------------------------------- |
| 알림 전송 지연       | < 500ms        | Event timestamp - Notification received timestamp |
| 좋아요 업데이트 지연 | < 300ms        | Click timestamp - UI update timestamp             |
| 메모리 사용량        | 최대 50개 알림 | Memory Profiler                                   |
| 동시 접속            | 10명 이상      | Load testing                                      |
| 재연결 시간          | < 2초          | Socket.io reconnection time                       |

---

## Traceability

### TAG Chain

**SPEC → TEST → CODE → DOC**

- `@SPEC:ANSWER-INTERACTION-001-PHASE7` → E2E 테스트 및 성능 검증
  - `@REQ:ANSWER-INTERACTION-001-PHASE7-E1` → 실시간 채택 알림
  - `@REQ:ANSWER-INTERACTION-001-PHASE7-E2` → 좋아요/싫어요 동기화
  - `@REQ:ANSWER-INTERACTION-001-PHASE7-E3` → 배지 알림 자동 해제
  - `@REQ:ANSWER-INTERACTION-001-PHASE7-S1` → Socket.io 활성 상태
  - `@REQ:ANSWER-INTERACTION-001-PHASE7-S2` → 다중 사용자 일관성
  - `@REQ:ANSWER-INTERACTION-001-PHASE7-C1` → 500ms 지연시간 제약
  - `@REQ:ANSWER-INTERACTION-001-PHASE7-C2` → 50개 알림 메모리 제약
  - `@REQ:ANSWER-INTERACTION-001-PHASE7-C3` → Silent 좋아요/싫어요

### 연관 SPEC

- `@SPEC:ANSWER-INTERACTION-001` (Phase 1-6: 구현 완료)
- `@SPEC:ANSWER-INTERACTION-001-PHASE6` (v0.1.2: 실시간 동기화)

### 다음 단계

- **Phase 8**: 부하 테스트 및 확장성 검증
- **Phase 9**: 프로덕션 배포 및 모니터링

---

## Notes

### 테스트 전략

1. **격리된 환경**: 각 테스트는 독립적으로 실행
2. **재현 가능성**: 동일한 테스트 데이터 사용
3. **성능 기준**: 모든 메트릭은 3회 평균값 사용
4. **실패 처리**: 테스트 실패 시 스크린샷 및 로그 저장

### 리스크 및 완화 방안

| 리스크          | 영향도 | 완화 방안                        |
| --------------- | ------ | -------------------------------- |
| 네트워크 불안정 | High   | 재시도 로직, 타임아웃 설정       |
| 타이밍 이슈     | Medium | Wait 조건, Polling 전략          |
| 메모리 누수     | High   | 테스트 후 클린업, 프로파일링     |
| 동시성 버그     | High   | Race condition 테스트, 로그 분석 |

### 품질 게이트

- ✅ 모든 E2E 테스트 PASS (20개 이상)
- ✅ 성능 메트릭 목표 달성 (100%)
- ✅ 메모리 누수 없음
- ✅ TRUST 5 원칙 준수
