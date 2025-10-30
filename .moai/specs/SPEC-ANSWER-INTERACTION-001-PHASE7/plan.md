# Implementation Plan - Phase 7: E2E Testing & Performance Validation

## 개요

Phase 7은 Phase 1-6에서 구현한 실시간 답변 상호작용 기능의 E2E 통합 테스트 및 성능 검증을 수행합니다. fast-playwright MCP를 활용하여 실제 브라우저 환경에서 사용자 플로우를 검증하고, 성능 메트릭을 측정합니다.

---

## 목표

### Primary Goals (최우선 목표)

1. **E2E 통합 테스트 완성**
   - 실시간 채택 알림 플로우 검증
   - 다중 사용자 좋아요/싫어요 동기화 검증
   - 배지 알림 자동 해제 검증

2. **성능 메트릭 검증**
   - 알림 전송 지연: < 500ms 달성
   - 좋아요/싫어요 업데이트: < 300ms 달성
   - 메모리 사용량: 최대 50개 알림 제한 준수

3. **품질 게이트 통과**
   - 모든 E2E 테스트 PASS (20개 이상)
   - TRUST 5 원칙 100% 준수
   - 메모리 누수 0건

### Secondary Goals (부차 목표)

1. **테스트 인프라 개선**
   - 재사용 가능한 테스트 헬퍼 함수 구축
   - 성능 모니터링 유틸리티 구축

2. **문서화**
   - E2E 테스트 실행 가이드 작성
   - 성능 벤치마크 결과 문서화

---

## 테스트 전략

### 1. fast-playwright MCP 활용

**MCP 서버 확인:**

```bash
# fast-playwright MCP가 활성화되어 있는지 확인
# Claude Desktop에서 MCP 서버 상태 확인
```

**테스트 환경 설정:**

- 브라우저: Chromium (headless mode)
- 뷰포트: 1280x720 (데스크탑)
- 타임아웃: 30초
- 재시도: 최대 3회

### 2. 테스트 파일 구조

```
apps/web/e2e/
├── answer-notification-realtime.e2e.spec.ts  (신규)
│   ├── Test Suite 1: Real-time Adoption Notifications
│   │   ├── Test 1: 실시간 채택 알림 전송
│   │   ├── Test 2: 배지 획득 알림 표시
│   │   ├── Test 3: 알림 자동 해제 (3초)
│   │   └── Test 4: 포인트 증가 정보 표시
│   │
│   ├── Test Suite 2: Performance Validation
│   │   ├── Test 5: 알림 전송 지연시간 (< 500ms)
│   │   ├── Test 6: 좋아요 업데이트 지연시간 (< 300ms)
│   │   ├── Test 7: 메모리 제한 (50개)
│   │   ├── Test 8: 동시 사용자 (10명)
│   │   └── Test 9: 네트워크 대역폭
│   │
│   └── Test Suite 3: Multi-user Integration
│       ├── Test 10: 다중 사용자 동기화
│       ├── Test 11: 충돌 방지 (중복 채택)
│       └── Test 12: 재연결 후 상태 동기화
│
├── helpers/
│   ├── test-users.ts          (신규)
│   ├── socket-helper.ts        (신규)
│   └── performance-monitor.ts  (신규)
│
└── answer-interaction-integration.e2e.spec.ts (기존)
```

### 3. 테스트 시나리오 상세

#### Test Suite 1: Real-time Adoption Notifications

**Test 1: 실시간 채택 알림 전송**

```typescript
describe("Real-time Adoption Notifications", () => {
  it("should send adoption notification in real-time", async () => {
    // Given: 사용자 A가 질문 작성, 사용자 B가 답변 작성
    const userA = await createTestUser("userA");
    const userB = await createTestUser("userB");

    // When: 사용자 A가 사용자 B의 답변 채택
    await adoptAnswer(userA, answerByB);

    // Then: 사용자 B에게 500ms 이내 알림 전송
    const notification = await waitForNotification(userB, { timeout: 500 });
    expect(notification).toBeDefined();
    expect(notification.type).toBe("adoption");
  });
});
```

**Test 2: 배지 획득 알림 표시**

```typescript
it("should display badge notification on adoption", async () => {
  // Given: 사용자 B가 첫 채택 받음
  // When: 채택 이벤트 발생
  // Then: 배지 획득 알림 표시 확인
  const badgeNotification = await page.locator(
    '[data-testid="badge-notification"]'
  );
  await expect(badgeNotification).toBeVisible();
  await expect(badgeNotification).toContainText("첫 채택 배지");
});
```

**Test 3: 알림 자동 해제 (3초)**

```typescript
it("should auto-dismiss notification after 3 seconds", async () => {
  // Given: 알림이 표시됨
  const notification = await page.locator('[data-testid="notification"]');
  await expect(notification).toBeVisible();

  // When: 3초 대기
  await page.waitForTimeout(3000);

  // Then: 알림이 사라짐
  await expect(notification).not.toBeVisible();
});
```

**Test 4: 포인트 증가 정보 표시**

```typescript
it("should display point increase information", async () => {
  // Then: 포인트 증가 정보 (+10) 표시 확인
  const pointInfo = await page.locator('[data-testid="point-increase"]');
  await expect(pointInfo).toContainText("+10");
});
```

#### Test Suite 2: Performance Validation

**Test 5: 알림 전송 지연시간 (< 500ms)**

```typescript
describe("Performance Validation", () => {
  it("should send notification within 500ms", async () => {
    const startTime = performance.now();
    await adoptAnswer(userA, answerByB);
    const notification = await waitForNotification(userB);
    const endTime = performance.now();

    const latency = endTime - startTime;
    expect(latency).toBeLessThan(500);
  });
});
```

**Test 6: 좋아요 업데이트 지연시간 (< 300ms)**

```typescript
it("should update like count within 300ms", async () => {
  const startTime = performance.now();
  await clickLikeButton(userA, answer);
  await waitForLikeCountUpdate(userB, answer);
  const endTime = performance.now();

  const latency = endTime - startTime;
  expect(latency).toBeLessThan(300);
});
```

**Test 7: 메모리 제한 (50개)**

```typescript
it("should limit notifications to 50", async () => {
  // Given: 51개의 알림 생성
  for (let i = 0; i < 51; i++) {
    await triggerNotification();
  }

  // Then: 메모리에 최대 50개만 유지
  const notificationCount = await getNotificationCount();
  expect(notificationCount).toBeLessThanOrEqual(50);
});
```

**Test 8: 동시 사용자 (10명)**

```typescript
it("should handle 10 concurrent users", async () => {
  // Given: 10명의 사용자 동시 접속
  const users = await createMultipleUsers(10);

  // When: 동시에 좋아요 클릭
  await Promise.all(users.map(user => clickLikeButton(user, answer)));

  // Then: 모든 사용자에게 업데이트 전송
  for (const user of users) {
    await waitForLikeCountUpdate(user, answer);
  }
});
```

**Test 9: 네트워크 대역폭**

```typescript
it("should optimize network bandwidth usage", async () => {
  // Given: 네트워크 모니터링 시작
  const monitor = await startNetworkMonitor();

  // When: 100개의 이벤트 발생
  for (let i = 0; i < 100; i++) {
    await triggerEvent();
  }

  // Then: 대역폭 사용량 측정
  const bandwidth = await monitor.getBandwidthUsage();
  expect(bandwidth).toBeLessThan(1024 * 1024); // < 1MB
});
```

#### Test Suite 3: Multi-user Integration

**Test 10: 다중 사용자 동기화**

```typescript
describe("Multi-user Integration", () => {
  it("should sync state across multiple users", async () => {
    // Given: 사용자 A, B, C 동시 접속
    const [userA, userB, userC] = await createMultipleUsers(3);

    // When: 사용자 A가 좋아요 클릭
    await clickLikeButton(userA, answer);

    // Then: 사용자 B, C에게 실시간 업데이트
    await waitForLikeCountUpdate(userB, answer);
    await waitForLikeCountUpdate(userC, answer);
  });
});
```

**Test 11: 충돌 방지 (중복 채택)**

```typescript
it("should prevent duplicate adoption", async () => {
  // When: 두 답변을 동시에 채택 시도
  await Promise.all([adoptAnswer(userA, answer1), adoptAnswer(userA, answer2)]);

  // Then: 하나만 채택됨
  const adoptedAnswers = await getAdoptedAnswers(question);
  expect(adoptedAnswers.length).toBe(1);
});
```

**Test 12: 재연결 후 상태 동기화**

```typescript
it("should sync state after reconnection", async () => {
  // Given: Socket.io 연결 끊김
  await disconnectSocket(userB);

  // When: 사용자 A가 좋아요 클릭
  await clickLikeButton(userA, answer);

  // When: 사용자 B 재연결
  await reconnectSocket(userB);

  // Then: 재연결 후 상태 동기화 확인
  await waitForLikeCountUpdate(userB, answer);
});
```

---

## 테스트 헬퍼 함수

### 1. test-users.ts

```typescript
// 테스트 사용자 생성 및 관리
export async function createTestUser(name: string): Promise<TestUser> {
  // 사용자 생성 로직
}

export async function createMultipleUsers(count: number): Promise<TestUser[]> {
  // 다중 사용자 생성 로직
}

export async function cleanupTestUsers(): Promise<void> {
  // 테스트 사용자 정리
}
```

### 2. socket-helper.ts

```typescript
// Socket.io 연결 관리
export async function connectSocket(user: TestUser): Promise<Socket> {
  // Socket.io 연결
}

export async function disconnectSocket(user: TestUser): Promise<void> {
  // Socket.io 연결 끊기
}

export async function reconnectSocket(user: TestUser): Promise<void> {
  // Socket.io 재연결
}

export async function waitForSocketEvent(
  user: TestUser,
  eventName: string,
  timeout: number = 5000
): Promise<any> {
  // Socket.io 이벤트 대기
}
```

### 3. performance-monitor.ts

```typescript
// 성능 모니터링
export class PerformanceMonitor {
  async measureLatency(fn: () => Promise<void>): Promise<number> {
    // 지연시간 측정
  }

  async getMemoryUsage(): Promise<number> {
    // 메모리 사용량 측정
  }

  async startNetworkMonitor(): Promise<NetworkMonitor> {
    // 네트워크 모니터링 시작
  }
}
```

---

## 성능 메트릭 목표

| 메트릭               | 목표             | 측정 방법         | 우선순위 |
| -------------------- | ---------------- | ----------------- | -------- |
| 알림 전송 지연       | < 500ms          | Performance API   | High     |
| 좋아요 업데이트 지연 | < 300ms          | Performance API   | High     |
| 메모리 사용량        | ≤ 50개 알림      | Memory Profiler   | High     |
| 동시 접속 지원       | ≥ 10명           | Load Testing      | Medium   |
| 재연결 시간          | < 2초            | Socket.io metrics | Medium   |
| 네트워크 대역폭      | < 1MB/100 events | Network Monitor   | Low      |

---

## 의존성 및 전제 조건

### 필수 의존성

1. **fast-playwright MCP 서버**
   - 설치 및 활성화 확인
   - Claude Desktop MCP 설정 완료

2. **테스트 데이터베이스**
   - PostgreSQL 테스트 인스턴스 준비
   - 테스트 데이터 시드 준비

3. **Socket.io 테스트 서버**
   - 로컬 개발 서버 실행 (http://localhost:3000)
   - Socket.io 서버 활성화

### Phase 1-6 구현 상태

| Phase     | 상태    | 버전   | TRUST 5 점수 |
| --------- | ------- | ------ | ------------ |
| Phase 1-3 | ✅ 완료 | v0.1.0 | 25/25 PASS   |
| Phase 4   | ✅ 완료 | v0.1.1 | 25/25 PASS   |
| Phase 5   | ✅ 완료 | v0.1.1 | 25/25 PASS   |
| Phase 6   | ✅ 완료 | v0.1.2 | 25/25 PASS   |

---

## 리스크 관리

### 리스크 식별 및 완화 방안

| 리스크                     | 확률   | 영향도 | 완화 방안                                    | 담당            |
| -------------------------- | ------ | ------ | -------------------------------------------- | --------------- |
| 네트워크 불안정            | Medium | High   | 재시도 로직, 타임아웃 설정                   | tdd-implementer |
| 타이밍 이슈                | High   | Medium | Wait 조건, Polling 전략                      | tdd-implementer |
| 메모리 누수                | Low    | High   | 테스트 후 클린업, 프로파일링                 | debug-helper    |
| 동시성 버그                | Medium | High   | Race condition 테스트, 로그 분석             | debug-helper    |
| fast-playwright MCP 미지원 | Low    | High   | 대체 테스트 도구 준비 (Playwright 직접 사용) | tdd-implementer |

---

## 타임라인 (우선순위 기반)

### Priority 1: High (필수)

1. **E2E 테스트 파일 생성**
   - `answer-notification-realtime.e2e.spec.ts` 작성
   - Test Suite 1-3 구현
   - 의존성: fast-playwright MCP

2. **테스트 헬퍼 함수 구현**
   - `test-users.ts` 작성
   - `socket-helper.ts` 작성
   - `performance-monitor.ts` 작성
   - 의존성: Phase 1-6 완료

3. **E2E 테스트 실행 및 검증**
   - 모든 테스트 실행
   - 성능 메트릭 측정
   - 의존성: E2E 테스트 파일 완성

### Priority 2: Medium (중요)

1. **성능 벤치마크 문서화**
   - 성능 메트릭 결과 기록
   - 그래프 및 차트 생성
   - 의존성: E2E 테스트 완료

2. **테스트 실행 가이드 작성**
   - 로컬 환경 설정 가이드
   - CI/CD 통합 가이드
   - 의존성: E2E 테스트 완료

### Priority 3: Low (선택)

1. **CI/CD 파이프라인 통합**
   - GitHub Actions 워크플로우 업데이트
   - E2E 테스트 자동화
   - 의존성: E2E 테스트 안정화

---

## 품질 게이트

### 테스트 통과 기준

- ✅ E2E 테스트 20개 이상 작성
- ✅ 모든 E2E 테스트 PASS (100%)
- ✅ 성능 메트릭 6개 모두 목표 달성
- ✅ 메모리 누수 0건
- ✅ TRUST 5 원칙 100% 준수

### TRUST 5 검증

| 원칙           | 검증 방법               | 목표        |
| -------------- | ----------------------- | ----------- |
| **T**est First | E2E 테스트 우선 작성    | 20개 이상   |
| **R**eadable   | 테스트 코드 가독성 검토 | ESLint PASS |
| **U**nified    | 테스트 헬퍼 재사용      | DRY 원칙    |
| **S**ecured    | 테스트 데이터 격리      | 독립 실행   |
| **T**rackable  | @TAG 체인 유지          | 100% 추적   |

---

## 다음 단계 (Phase 8 준비)

### Phase 8 Preview: Load Testing & Scalability

1. **부하 테스트**
   - 100명 동시 접속 시뮬레이션
   - 1000개 이벤트 동시 처리
   - 서버 리소스 모니터링

2. **확장성 검증**
   - 수평 확장 전략 (Multiple Socket.io Instances)
   - Redis Pub/Sub 통합 검토
   - CDN 캐싱 전략

3. **프로덕션 준비**
   - 모니터링 대시보드 구축
   - 알림 시스템 (Sentry, Datadog)
   - 백업 및 복구 전략

---

## Notes

### 테스트 베스트 프랙티스

1. **독립성**: 각 테스트는 독립적으로 실행 가능해야 함
2. **재현성**: 동일한 입력에 대해 동일한 결과 보장
3. **격리**: 테스트 데이터베이스 사용, 테스트 후 클린업
4. **명확성**: 테스트 이름과 시나리오를 명확하게 작성

### fast-playwright MCP 활용 가이드

- **병렬 실행**: 독립적인 테스트는 병렬로 실행하여 시간 단축
- **스크린샷**: 테스트 실패 시 스크린샷 자동 저장
- **비디오 녹화**: 중요한 플로우는 비디오로 녹화하여 디버깅 지원
- **네트워크 조건 시뮬레이션**: 느린 네트워크, 연결 끊김 시나리오 테스트

### 참고 문서

- [fast-playwright MCP 문서](https://github.com/executeautomation/fast-mcp)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Socket.io Testing Guide](https://socket.io/docs/v4/testing/)
