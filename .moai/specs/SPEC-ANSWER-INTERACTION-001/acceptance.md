# @SPEC:ANSWER-INTERACTION-001 Acceptance Criteria

> **답변 상호작용 기능 개선 - 인수 테스트 기준**

---

## Overview

이 문서는 @SPEC:ANSWER-INTERACTION-001의 인수 기준을 정의합니다. 모든 시나리오는 **Given-When-Then** 형식으로 작성되었으며, 각 시나리오는 독립적으로 검증 가능합니다.

---

## AC1. 복수 답변 채택 시나리오

### Scenario 1.1: 질문 작성자가 첫 번째 답변을 채택함

**@TEST:ANSWER-INTERACTION-001-U1-S1**

**Given**:

- 사용자 A가 질문을 작성함 (questionId: Q1)
- 사용자 B가 답변을 작성함 (answerId: A1, authorId: B)
- 답변 A1은 아직 채택되지 않음 (isAccepted: false)
- 사용자 A가 질문 상세 페이지에 접속함

**When**:

- 사용자 A가 답변 A1의 "답변 채택" 버튼을 클릭함

**Then**:

- 답변 A1의 `isAccepted` 필드가 `true`로 변경됨
- 답변 A1에 녹색 체크 아이콘과 "채택된 답변" 배지가 표시됨
- 사용자 B의 포인트가 50 증가함
- 사용자 B에게 실시간 알림이 전송됨 (Socket.io)

**Traceability**: @REQ:ANSWER-INTERACTION-001-U1, @REQ:ANSWER-INTERACTION-001-E1

---

### Scenario 1.2: 질문 작성자가 여러 답변을 채택함

**@TEST:ANSWER-INTERACTION-001-U1-S2**

**Given**:

- 질문 Q1에 3개의 답변이 있음 (A1, A2, A3)
- 답변 A1이 이미 채택됨 (isAccepted: true)

**When**:

- 사용자 A가 답변 A2의 "답변 채택" 버튼을 클릭함
- 사용자 A가 답변 A3의 "답변 채택" 버튼을 클릭함

**Then**:

- 답변 A1, A2, A3 모두 `isAccepted: true` 상태가 됨
- 모든 채택된 답변에 녹색 체크 아이콘이 표시됨
- 답변 A2, A3 작성자의 포인트가 각각 50씩 증가함

**Traceability**: @REQ:ANSWER-INTERACTION-001-U1

---

### Scenario 1.3: 질문 작성자가 채택을 해제함

**@TEST:ANSWER-INTERACTION-001-U1-S3**

**Given**:

- 답변 A1이 채택됨 (isAccepted: true)
- 사용자 A가 질문 상세 페이지에 접속함

**When**:

- 사용자 A가 답변 A1의 "채택 해제" 버튼을 클릭함

**Then**:

- 답변 A1의 `isAccepted` 필드가 `false`로 변경됨
- 녹색 체크 아이콘이 사라짐
- 사용자 B의 포인트는 감소하지 않음 (포인트 회수 없음)

**Traceability**: @REQ:ANSWER-INTERACTION-001-C3

---

### Scenario 1.4: 질문 작성자가 아닌 사용자는 채택 버튼을 볼 수 없음

**@TEST:ANSWER-INTERACTION-001-C2-S1**

**Given**:

- 사용자 A가 질문을 작성함 (questionId: Q1)
- 사용자 C가 질문 Q1의 상세 페이지에 접속함 (사용자 C는 질문 작성자가 아님)

**When**:

- 사용자 C가 답변 목록을 확인함

**Then**:

- 사용자 C의 화면에는 "답변 채택" 버튼이 표시되지 않음
- 채택된 답변의 녹색 체크 아이콘은 표시됨 (읽기 전용)

**Traceability**: @REQ:ANSWER-INTERACTION-001-C2

---

## AC2. 좋아요/싫어요 UI 시나리오

### Scenario 2.1: 사용자가 답변에 좋아요를 누름

**@TEST:ANSWER-INTERACTION-001-U2-S1**

**Given**:

- 답변 A1이 존재함 (likeCount: 5, dislikeCount: 2)
- 사용자 B가 질문 상세 페이지에 접속함
- 사용자 B는 아직 좋아요/싫어요를 누르지 않음 (isLiked: false, isDisliked: false)

**When**:

- 사용자 B가 답변 A1의 "좋아요" 버튼을 클릭함

**Then**:

- 답변 A1의 `likeCount`가 6으로 증가함
- "좋아요" 버튼이 활성화 상태로 표시됨 (하이라이트)
- 사용자 B의 `isLiked` 상태가 `true`로 변경됨

**Traceability**: @REQ:ANSWER-INTERACTION-001-U2, @REQ:ANSWER-INTERACTION-001-E2

---

### Scenario 2.2: 사용자가 좋아요를 누른 상태에서 싫어요를 누름

**@TEST:ANSWER-INTERACTION-001-U2-S2**

**Given**:

- 답변 A1이 존재함 (likeCount: 10, dislikeCount: 3)
- 사용자 B가 이미 좋아요를 누름 (isLiked: true, isDisliked: false)

**When**:

- 사용자 B가 답변 A1의 "싫어요" 버튼을 클릭함

**Then**:

- 답변 A1의 `likeCount`가 9로 감소함 (좋아요 취소)
- 답변 A1의 `dislikeCount`가 4로 증가함
- "좋아요" 버튼이 비활성화되고, "싫어요" 버튼이 활성화됨
- 사용자 B의 상태: `isLiked: false, isDisliked: true`

**Traceability**: @REQ:ANSWER-INTERACTION-001-U2, @REQ:ANSWER-INTERACTION-001-E2

---

### Scenario 2.3: 사용자가 좋아요를 다시 클릭하여 취소함

**@TEST:ANSWER-INTERACTION-001-U2-S3**

**Given**:

- 답변 A1이 존재함 (likeCount: 8, dislikeCount: 2)
- 사용자 B가 이미 좋아요를 누름 (isLiked: true)

**When**:

- 사용자 B가 답변 A1의 "좋아요" 버튼을 다시 클릭함

**Then**:

- 답변 A1의 `likeCount`가 7로 감소함
- "좋아요" 버튼이 비활성화됨
- 사용자 B의 상태: `isLiked: false, isDisliked: false`

**Traceability**: @REQ:ANSWER-INTERACTION-001-U2, @REQ:ANSWER-INTERACTION-001-E2

---

### Scenario 2.4: 사용자가 자신의 답변에 좋아요를 누를 수 없음

**@TEST:ANSWER-INTERACTION-001-C1-S1**

**Given**:

- 사용자 B가 답변 A1을 작성함 (authorId: B)
- 사용자 B가 질문 상세 페이지에 접속함

**When**:

- 사용자 B가 답변 A1의 "좋아요" 버튼을 클릭함

**Then**:

- API가 400 에러를 반환함 (message: "Cannot like your own answer")
- 좋아요 카운트가 증가하지 않음
- 프론트엔드에서 에러 토스트 메시지가 표시됨: "자신의 답변에는 좋아요를 누를 수 없습니다"

**Traceability**: @REQ:ANSWER-INTERACTION-001-C1

---

## AC3. 포인트 자동 증가 시나리오

### Scenario 3.1: 답변 채택 시 포인트가 50 증가함

**@TEST:ANSWER-INTERACTION-001-U3-S1**

**Given**:

- 사용자 B의 현재 포인트: 100점
- 사용자 B가 답변 A1을 작성함

**When**:

- 질문 작성자가 답변 A1을 채택함

**Then**:

- 사용자 B의 포인트가 150점으로 증가함
- API 응답에 `pointsAwarded: 50` 필드가 포함됨

**Traceability**: @REQ:ANSWER-INTERACTION-001-U3, @REQ:ANSWER-INTERACTION-001-E1

---

### Scenario 3.2: 채택 해제 시 포인트는 감소하지 않음

**@TEST:ANSWER-INTERACTION-001-C3-S1**

**Given**:

- 사용자 B의 현재 포인트: 150점
- 답변 A1이 채택됨 (포인트 50점 이미 부여됨)

**When**:

- 질문 작성자가 답변 A1의 채택을 해제함

**Then**:

- 사용자 B의 포인트는 150점으로 유지됨 (감소하지 않음)

**Traceability**: @REQ:ANSWER-INTERACTION-001-C3

---

### Scenario 3.3: 채택 실패 시 포인트가 증가하지 않음

**@TEST:ANSWER-INTERACTION-001-U3-S2**

**Given**:

- 사용자 B의 현재 포인트: 100점
- 답변 A1이 존재함

**When**:

- 질문 작성자가 아닌 사용자 C가 채택 API를 호출함 (권한 없음)
- API가 403 Forbidden 에러를 반환함

**Then**:

- 사용자 B의 포인트는 100점으로 유지됨 (증가하지 않음)
- 트랜잭션 롤백으로 인해 답변도 채택되지 않음 (isAccepted: false)

**Traceability**: @REQ:ANSWER-INTERACTION-001-U3, @REQ:ANSWER-INTERACTION-001-C2

---

## AC4. 배지 자동 부여 시나리오

### Scenario 4.1: 첫 번째 채택 시 배지 부여

**@TEST:ANSWER-INTERACTION-001-E3-S1**

**Given**:

- 사용자 B가 아직 채택된 답변이 없음 (adoptedAnswersCount: 0)
- 사용자 B가 배지를 보유하지 않음

**When**:

- 질문 작성자가 사용자 B의 답변 A1을 채택함

**Then**:

- 사용자 B에게 "첫 번째 채택" 배지가 자동 부여됨
- API 응답에 `badgesAwarded: ["첫 번째 채택"]` 필드가 포함됨
- 사용자 B의 프로필에서 배지가 표시됨

**Traceability**: @REQ:ANSWER-INTERACTION-001-E3

---

### Scenario 4.2: 10회 채택 시 "10회 채택 전문가" 배지 부여

**@TEST:ANSWER-INTERACTION-001-E3-S2**

**Given**:

- 사용자 B가 이미 9개의 답변을 채택받음 (adoptedAnswersCount: 9)
- 사용자 B가 "첫 번째 채택" 배지를 보유함

**When**:

- 질문 작성자가 사용자 B의 답변 A10을 채택함

**Then**:

- 사용자 B에게 "10회 채택 전문가" 배지가 자동 부여됨
- API 응답에 `badgesAwarded: ["10회 채택 전문가"]` 필드가 포함됨

**Traceability**: @REQ:ANSWER-INTERACTION-001-E3

---

### Scenario 4.3: 좋아요 50개 + 채택 시 "베스트 앤서" 배지 부여

**@TEST:ANSWER-INTERACTION-001-E3-S3**

**Given**:

- 답변 A1이 좋아요 50개를 받음 (likeCount: 50)
- 답변 A1이 아직 채택되지 않음 (isAccepted: false)

**When**:

- 질문 작성자가 답변 A1을 채택함

**Then**:

- 사용자 B에게 "베스트 앤서" 배지가 자동 부여됨
- API 응답에 `badgesAwarded: ["베스트 앤서"]` 필드가 포함됨

**Traceability**: @REQ:ANSWER-INTERACTION-001-E3

---

### Scenario 4.4: 배지 중복 부여 방지

**@TEST:ANSWER-INTERACTION-001-E3-S4**

**Given**:

- 사용자 B가 이미 "첫 번째 채택" 배지를 보유함
- 사용자 B가 두 번째 답변을 작성함 (A2)

**When**:

- 질문 작성자가 답변 A2를 채택함

**Then**:

- 사용자 B에게 "첫 번째 채택" 배지가 다시 부여되지 않음
- API 응답의 `badgesAwarded` 필드가 빈 배열임: `[]`

**Traceability**: @REQ:ANSWER-INTERACTION-001-E3

---

## AC5. 상태 표시 시나리오

### Scenario 5.1: 답변 카드에 현재 상태가 표시됨

**@TEST:ANSWER-INTERACTION-001-S1-S1**

**Given**:

- 답변 A1이 존재함 (likeCount: 15, dislikeCount: 3, isAccepted: true)
- 사용자 B가 이미 좋아요를 누름 (isLiked: true)

**When**:

- 사용자 B가 질문 상세 페이지에 접속함

**Then**:

- 답변 A1 카드에 다음 정보가 표시됨:
  - 좋아요 카운트: 15 (활성화 상태)
  - 싫어요 카운트: 3 (비활성화 상태)
  - 채택 배지: "채택된 답변" (녹색 체크 아이콘)

**Traceability**: @REQ:ANSWER-INTERACTION-001-S1

---

### Scenario 5.2: 여러 채택된 답변이 모두 표시됨

**@TEST:ANSWER-INTERACTION-001-S2-S1**

**Given**:

- 질문 Q1에 5개의 답변이 있음 (A1, A2, A3, A4, A5)
- 답변 A1, A3, A5가 채택됨 (isAccepted: true)

**When**:

- 사용자가 질문 Q1의 상세 페이지에 접속함

**Then**:

- 답변 A1, A3, A5에 모두 녹색 체크 아이콘과 "채택된 답변" 배지가 표시됨
- 답변 A2, A4에는 채택 배지가 표시되지 않음

**Traceability**: @REQ:ANSWER-INTERACTION-001-S2

---

## AC6. 기술적 시나리오 (API/DB/Notification)

### Scenario 6.1: API 응답 구조 검증

**@TEST:ANSWER-INTERACTION-001-TECH-S1**

**Given**:

- 답변 A1이 존재함

**When**:

- 클라이언트가 `GET /api/answers/:id` API를 호출함

**Then**:

- API 응답이 다음 필드를 포함함:
  ```json
  {
    "id": "A1",
    "content": "...",
    "isAccepted": true,
    "likeCount": 10,
    "dislikeCount": 2,
    "isLiked": true,
    "isDisliked": false,
    "author": { ... }
  }
  ```

**Traceability**: @REQ:ANSWER-INTERACTION-001-U2

---

### Scenario 6.2: 트랜잭션 롤백 검증

**@TEST:ANSWER-INTERACTION-001-TECH-S2**

**Given**:

- 사용자 B의 현재 포인트: 100점
- 답변 A1이 존재함

**When**:

- 채택 API 호출 중 배지 부여 로직에서 예외 발생 (DB 에러)

**Then**:

- 트랜잭션이 롤백됨
- 답변 A1은 채택되지 않음 (isAccepted: false)
- 사용자 B의 포인트는 100점으로 유지됨 (증가하지 않음)

**Traceability**: @REQ:ANSWER-INTERACTION-001-U3

---

### Scenario 6.3: 실시간 알림 전송 검증

**@TEST:ANSWER-INTERACTION-001-TECH-S3**

**Given**:

- 사용자 B가 Socket.io에 연결되어 있음

**When**:

- 질문 작성자가 사용자 B의 답변 A1을 채택함

**Then**:

- 사용자 B에게 Socket.io 이벤트가 전송됨:
  ```javascript
  socket.emit("answer:adopted", {
    answerId: "A1",
    pointsAwarded: 50,
    badgesAwarded: ["첫 번째 채택"],
  });
  ```
- 사용자 B의 화면에 토스트 알림이 표시됨: "답변이 채택되었습니다! +50 포인트"

**Traceability**: @REQ:ANSWER-INTERACTION-001-E1

---

## Definition of Done

모든 시나리오가 통과되었을 때 @SPEC:ANSWER-INTERACTION-001은 완료된 것으로 간주됩니다.

### 체크리스트

#### 복수 채택 기능

- [ ] Scenario 1.1: 첫 번째 답변 채택 성공
- [ ] Scenario 1.2: 여러 답변 채택 성공
- [ ] Scenario 1.3: 채택 해제 성공
- [ ] Scenario 1.4: 권한 검증 통과

#### 좋아요/싫어요 UI

- [ ] Scenario 2.1: 좋아요 기능 동작
- [ ] Scenario 2.2: 좋아요 ↔ 싫어요 토글 동작
- [ ] Scenario 2.3: 좋아요 취소 동작
- [ ] Scenario 2.4: 자기 좋아요 방지 동작

#### 포인트 자동 증가

- [ ] Scenario 3.1: 채택 시 포인트 증가
- [ ] Scenario 3.2: 채택 해제 시 포인트 유지
- [ ] Scenario 3.3: 채택 실패 시 포인트 미증가

#### 배지 자동 부여

- [ ] Scenario 4.1: 첫 번째 채택 배지 부여
- [ ] Scenario 4.2: 10회 채택 배지 부여
- [ ] Scenario 4.3: 베스트 앤서 배지 부여
- [ ] Scenario 4.4: 배지 중복 방지

#### 상태 표시

- [ ] Scenario 5.1: 답변 카드 상태 표시
- [ ] Scenario 5.2: 여러 채택 답변 표시

#### 기술적 검증

- [ ] Scenario 6.1: API 응답 구조 검증
- [ ] Scenario 6.2: 트랜잭션 롤백 검증
- [ ] Scenario 6.3: 실시간 알림 검증

#### 비기능 요구사항

- [ ] 모든 API 응답 시간 < 500ms
- [ ] UI 렌더링 시간 < 200ms
- [ ] 트랜잭션 일관성 보장
- [ ] 에러 처리 및 사용자 피드백 제공

---

## 검증 방법

### Unit Tests

- Jest를 사용한 서비스 로직 테스트
- 커버리지 80% 이상 확보

### Integration Tests

- API 엔드포인트 테스트 (Supertest)
- 데이터베이스 통합 테스트 (Prisma)

### E2E Tests

- Playwright를 사용한 브라우저 자동화 테스트
- 사용자 시나리오 기반 테스트

### Manual QA

- 실제 브라우저에서 수동 테스트
- 다양한 엣지 케이스 검증

---

**Last Updated**: 2025-10-30
**Author**: @alfred
**Related SPEC**: @SPEC:ANSWER-INTERACTION-001
