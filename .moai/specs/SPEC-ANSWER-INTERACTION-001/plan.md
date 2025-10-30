# @SPEC:ANSWER-INTERACTION-001 Implementation Plan

> **답변 상호작용 기능 개선 구현 계획**

---

## Overview

이 문서는 @SPEC:ANSWER-INTERACTION-001의 구현 계획을 담고 있습니다. 4개 Phase로 나누어 점진적으로 기능을 구현하며, 각 Phase는 독립적으로 테스트 가능합니다.

---

## Phase 1: 복수 채택 UI + API 구현

### Priority: PRIMARY GOAL (최우선)

### Objectives

- 기존 단일 채택 시스템을 복수 채택으로 확장
- 프론트엔드에서 채택 버튼 및 시각적 표시 개선
- API 엔드포인트 수정 및 권한 검증 강화

### Files to Modify/Create

#### Backend

- **Modify**: `apps/api/src/services/answer/AnswerService.ts`
  - `adoptAnswer(answerId: string, userId: string)`: 복수 채택 지원
  - `unadoptAnswer(answerId: string, userId: string)`: 채택 해제 로직
  - 권한 검증: 질문 작성자만 채택 가능 확인

- **Modify**: `apps/api/src/controllers/answerController.ts`
  - `POST /api/answers/:id/adopt` 엔드포인트 추가
  - `DELETE /api/answers/:id/adopt` 엔드포인트 추가

- **Create**: `apps/api/src/middleware/validateQuestionOwnership.ts`
  - 질문 작성자 권한 검증 미들웨어

#### Frontend

- **Modify**: `apps/web/src/components/answer/AnswerCard.tsx`
  - 채택 버튼 UI 추가 (질문 작성자에게만 표시)
  - 채택된 답변 표시 (녹색 체크 아이콘 + 배경색 변경)
  - `handleAdopt()` 함수 구현 (낙관적 업데이트)

- **Modify**: `apps/web/src/app/questions/page.tsx` (또는 `QuestionList.tsx` 컴포넌트)
  - 질문 카드/리스트 항목에 완료 상태 배지 추가
  - 질문의 `answers[]` 배열에서 `isAccepted: true`인 답변이 1개 이상 있으면 '완료' 배지 표시
  - 배지 스타일: 기존 배지 스타일과 일치 (예: 녹색 배경, 체크마크 아이콘)
  - 위치: 질문 제목 우측 또는 카테고리 배지 옆

#### Database

- **No Schema Change**: 기존 `isAccepted` 필드 재사용

### Testing Strategy

- **Unit Tests**:
  - `AnswerService.adoptAnswer()` 테스트
  - 권한 검증 미들웨어 테스트
  - 질문 목록 컴포넌트: 채택된 답변 있을 때 완료 배지 렌더링 테스트
  - 질문 목록 컴포넌트: 채택된 답변 없을 때 완료 배지 미렌더링 테스트
- **Integration Tests**:
  - `POST /api/answers/:id/adopt` API 테스트
  - 복수 답변 채택 시나리오 테스트
  - 질문 조회 API에서 answers 배열에 isAccepted 필드가 포함되는지 테스트
- **E2E Tests**:
  - Playwright로 질문 상세 페이지에서 채택 버튼 클릭 테스트
  - Playwright로 답변 채택 후 질문 목록 페이지로 돌아가 완료 배지 표시 확인

### Acceptance Criteria

- [ ] 질문 작성자가 여러 답변을 채택할 수 있음
- [ ] 질문 상세 페이지에서 채택된 답변은 시각적으로 구분됨

- [ ] 질문 목록 페이지에서 채택된 답변이 1개 이상 있는 질문 옆에 '완료' 배지가 표시됨
- [ ] 질문 목록 페이지에서 채택된 답변이 없는 질문에는 '완료' 배지가 표시되지 않음 (녹색 체크 아이콘)
- [ ] 질문 작성자가 아닌 사용자는 채택 버튼이 보이지 않음
- [ ] 채택 해제 가능
- [ ] 채택 해제 후 질문 목록에서 '완료' 배지가 제거됨

### Dependencies

- None (첫 번째 Phase)

---

## Phase 2: 포인트 자동 증가 통합 ✅ COMPLETE

### Priority: PRIMARY GOAL (최우선)

### Status: ✅ IMPLEMENTED (2024-10-30)

### Objectives

- ✅ 답변 채택 시 답변 작성자에게 자동으로 50 포인트 부여
- ✅ 포인트 증가 로직을 트랜잭션으로 묶어 일관성 보장
- ✅ 중복 방지 로직 구현 (선택적)

### Files to Modify/Create

#### Backend

- **Modify**: `apps/api/src/services/answer/AnswerService.ts`
  - `adoptAnswer()` 메서드 내에 `PointService.increasePoints()` 호출 추가
  - Prisma Transaction으로 답변 채택 + 포인트 증가를 원자적으로 처리

- **Create/Modify**: `apps/api/src/services/point/PointService.ts`
  - `increasePoints(userId: string, amount: number, reason: string)` 메서드
  - 포인트 증가 이력 로깅 (선택적)

#### Database

- **Optional**: `PointTransaction` 모델 추가 (포인트 증감 이력 저장)
  ```prisma
  model PointTransaction {
    id        String   @id @default(cuid())
    userId    String
    amount    Int
    reason    String
    createdAt DateTime @default(now())
    user      User     @relation(fields: [userId], references: [id])
  }
  ```

### Testing Strategy

- **Unit Tests**:
  - `PointService.increasePoints()` 테스트
  - 트랜잭션 롤백 테스트 (채택 실패 시 포인트도 증가하지 않음)
- **Integration Tests**:
  - 답변 채택 API 호출 후 포인트가 50 증가했는지 확인
- **E2E Tests**:
  - 답변 채택 후 사용자 프로필에서 포인트 증가 확인

### Acceptance Criteria

- [x] 답변 채택 시 답변 작성자의 포인트가 50 증가함
- [x] 채택 실패 시 포인트가 증가하지 않음 (트랜잭션 롤백 테스트 완료)

### Implementation Summary

**Created Files**:

- `apps/api/src/services/point/PointService.ts` (210 lines)
- `apps/api/src/services/point/__tests__/PointService.test.ts` (415 lines, 10 unit tests)

**Modified Files**:

- `apps/api/src/services/answer/AnswerService.ts` (+63 lines in acceptAnswer method)
- `apps/api/src/services/answer/__tests__/AnswerService.acceptance.test.ts` (+142 lines, 3 integration tests)
- `apps/api/src/routes/__tests__/answer.acceptance.test.ts` (+47 lines)

**Test Coverage**:

- Unit Tests: 10/10 ✅ (PointService.increasePoints success/error/atomicity/metadata)
- Integration Tests: 3/3 ✅ (Point distribution, PointTransaction creation, rollback)
- Total: 34 tests passing (24 existing + 10 new)

**Key Features**:

1. **Transaction Safety**: All point operations wrapped in Prisma $transaction
2. **Audit Trail**: PointTransaction records with type, balance, relatedType/relatedId
3. **Error Handling**: Negative/zero amount validation, user existence check
4. **Atomicity**: Answer adoption + point distribution succeed or fail together

### Dependencies

- **Requires**: Phase 1 완료 (adoptAnswer API)

---

## Phase 3: 좋아요/싫어요 UI 구현

### Priority: SECONDARY GOAL (부차적)

### Objectives

- 기존 Like/Dislike API를 활용한 프론트엔드 UI 구현
- 사용자별 좋아요/싫어요 상태 표시
- 토글 방식 구현 (좋아요 ↔ 싫어요 상호 배타적)

### Files to Modify/Create

#### Backend

- **Modify**: `apps/api/src/services/answer/AnswerService.ts`
  - `likeAnswer(answerId: string, userId: string)`: 좋아요 토글
  - `dislikeAnswer(answerId: string, userId: string)`: 싫어요 토글
  - 자기 좋아요 방지 로직 추가

- **Modify**: `apps/api/src/controllers/answerController.ts`
  - API 응답에 `likeCount`, `dislikeCount`, `isLiked`, `isDisliked` 필드 추가

#### Frontend

- **Modify**: `apps/web/src/components/answer/AnswerCard.tsx`
  - 좋아요/싫어요 버튼 컴포넌트 추가
  - lucide-react의 `ThumbsUp`, `ThumbsDown` 아이콘 사용
  - 활성화 상태 표시 (사용자가 이미 누른 버튼은 하이라이트)
  - `handleLike()`, `handleDislike()` 함수 구현 (낙관적 업데이트)

#### Database

- **Assumption**: 기존 Like/Dislike 관계 테이블 존재 (예: `AnswerLike`, `AnswerDislike`)

### Testing Strategy

- **Unit Tests**:
  - `AnswerService.likeAnswer()` 테스트
  - 자기 좋아요 방지 테스트
  - 좋아요 ↔ 싫어요 상호 배타적 테스트
- **Integration Tests**:
  - `POST /api/answers/:id/like` API 테스트
  - `POST /api/answers/:id/dislike` API 테스트
- **E2E Tests**:
  - Playwright로 좋아요 버튼 클릭 후 UI 상태 변경 확인

### Acceptance Criteria

- [ ] 모든 답변 카드에 좋아요/싫어요 버튼과 카운트 표시
- [ ] 사용자가 이미 누른 버튼은 활성화 상태로 표시
- [ ] 좋아요 클릭 시 싫어요는 자동 해제됨 (반대도 마찬가지)
- [ ] 사용자는 자신의 답변에 좋아요/싫어요를 누를 수 없음

### Dependencies

- **Requires**: Phase 1 완료 (AnswerCard UI 수정)

---

## Phase 4: 배지 자동 부여 시스템

### Priority: FINAL GOAL (최종 목표)

### Objectives

- 답변 채택 시 배지 부여 조건 확인
- 배지 자동 부여 로직 구현
- 배지 시스템 확장 가능성 확보

### Files to Modify/Create

#### Backend

- **Create**: `apps/api/src/services/badge/BadgeService.ts`
  - `checkAndAwardBadges(userId: string)`: 배지 부여 조건 확인 및 부여
  - `awardBadge(userId: string, badgeId: string)`: 배지 부여 메서드

- **Modify**: `apps/api/src/services/answer/AnswerService.ts`
  - `adoptAnswer()` 메서드 내에 `BadgeService.checkAndAwardBadges()` 호출 추가

#### Database

- **Modify**: `packages/database/prisma/schema.prisma`
  - Badge 모델에 배지 메타데이터 추가 (예: 조건, 설명)
  - UserBadge 관계 테이블 추가 (이미 존재할 수 있음)

- **Seed Data**: `packages/database/src/seed.ts`
  - 기본 배지 데이터 추가:
    - "첫 번째 채택" (1회 채택)
    - "10회 채택 전문가" (10회 채택)
    - "베스트 앤서" (좋아요 50개 + 채택)

### Testing Strategy

- **Unit Tests**:
  - `BadgeService.checkAndAwardBadges()` 테스트
  - 배지 부여 조건 테스트 (1회, 10회, 50회 등)
- **Integration Tests**:
  - 답변 채택 후 배지가 자동 부여되는지 확인
- **E2E Tests**:
  - 답변 채택 후 사용자 프로필에서 배지 표시 확인

### Acceptance Criteria

- [ ] 첫 번째 답변 채택 시 "첫 번째 채택" 배지 부여
- [ ] 10회 답변 채택 시 "10회 채택 전문가" 배지 부여
- [ ] 좋아요 50개 + 채택된 답변에 "베스트 앤서" 배지 부여
- [ ] 배지 중복 부여 방지

### Dependencies

- **Requires**: Phase 2 완료 (포인트 시스템 통합)

---

## Technical Architecture

### API 엔드포인트 설계

#### Adopt/Unadopt Endpoints

```typescript
// 답변 채택
POST /api/answers/:id/adopt
Authorization: Bearer <token>
Body: {}
Response: {
  success: true,
  data: {
    answer: { id, isAccepted, ... },
    pointsAwarded: 50,
    badgesAwarded: ["첫 번째 채택"]
  }
}

// 답변 채택 해제
DELETE /api/answers/:id/adopt
Authorization: Bearer <token>
Response: {
  success: true,
  data: {
    answer: { id, isAccepted: false, ... }
  }
}
```

#### Like/Dislike Endpoints (기존 API 활용)

```typescript
// 좋아요 토글
POST /api/answers/:id/like
Authorization: Bearer <token>
Response: {
  success: true,
  data: {
    likeCount: 10,
    dislikeCount: 2,
    isLiked: true,
    isDisliked: false
  }
}

// 싫어요 토글
POST /api/answers/:id/dislike
Authorization: Bearer <token>
Response: {
  success: true,
  data: {
    likeCount: 10,
    dislikeCount: 3,
    isLiked: false,
    isDisliked: true
  }
}
```

### Database Transaction Example

```typescript
// AnswerService.ts
async adoptAnswer(answerId: string, userId: string) {
  return await this.prisma.$transaction(async (tx) => {
    // 1. 권한 검증
    const answer = await tx.answer.findUnique({
      where: { id: answerId },
      include: { question: true }
    });
    if (answer.question.authorId !== userId) {
      throw new Error('Only question author can adopt answers');
    }

    // 2. 답변 채택
    const updatedAnswer = await tx.answer.update({
      where: { id: answerId },
      data: { isAccepted: true }
    });

    // 3. 포인트 증가
    await tx.user.update({
      where: { id: answer.authorId },
      data: { points: { increment: 50 } }
    });

    // 4. 배지 부여 확인
    const badges = await this.badgeService.checkAndAwardBadges(
      answer.authorId,
      tx
    );

    return { answer: updatedAnswer, pointsAwarded: 50, badges };
  });
}
```

### Frontend Component Structure

```tsx
// AnswerCard.tsx
<div className="answer-card">
  {/* 기존 답변 콘텐츠 */}
  <div className="answer-content">{answer.content}</div>

  {/* 좋아요/싫어요 버튼 (Phase 3) */}
  <div className="answer-actions">
    <button onClick={handleLike}>
      <ThumbsUp className={isLiked ? "active" : ""} />
      <span>{likeCount}</span>
    </button>
    <button onClick={handleDislike}>
      <ThumbsDown className={isDisliked ? "active" : ""} />
      <span>{dislikeCount}</span>
    </button>
  </div>

  {/* 채택 버튼 (Phase 1, 질문 작성자만 표시) */}
  {isQuestionAuthor && (
    <button onClick={handleAdopt}>
      {isAccepted ? "채택 해제" : "답변 채택"}
    </button>
  )}

  {/* 채택 표시 (Phase 1) */}
  {isAccepted && (
    <div className="adopted-badge">
      <CheckCircle className="text-green-600" />
      <span>채택된 답변</span>
    </div>
  )}
</div>
```

---

## Risk Management

### 식별된 위험 요소

#### Risk 1: 포인트 중복 증가

- **설명**: 답변 채택 해제 후 재채택 시 포인트가 중복 증가할 수 있음
- **완화 방안**:
  - Option A: 중복 증가 허용 (SPEC 가정 사항)
  - Option B: `PointTransaction` 테이블로 이력 추적 및 중복 방지
- **선택**: Option A (SPEC 가정에 따라 중복 증가 허용)

#### Risk 2: 좋아요/싫어요 동시 요청 경쟁 조건

- **설명**: 사용자가 빠르게 좋아요/싫어요를 번갈아 클릭할 경우 상태 불일치 발생 가능
- **완화 방안**:
  - Optimistic Lock 또는 Unique Constraint 활용
  - 프론트엔드에서 디바운싱 적용
- **선택**: Unique Constraint (userId, answerId) + 프론트엔드 디바운싱

#### Risk 3: 배지 부여 조건 복잡도 증가

- **설명**: 배지 조건이 복잡해질 경우 `checkAndAwardBadges()` 메서드가 비대해질 수 있음
- **완화 방안**:
  - 배지 조건을 별도의 전략 패턴(Strategy Pattern)으로 분리
  - 각 배지마다 독립적인 검증 함수 작성
- **선택**: 전략 패턴 적용 (확장성 확보)

---

## Next Steps

### Immediate Actions (Phase 1 시작)

1. **Create Feature Branch**:

   ```bash
   git checkout -b feature/SPEC-ANSWER-INTERACTION-001
   ```

2. **Setup Test Environment**:
   - Jest 테스트 파일 생성
   - Playwright E2E 테스트 시나리오 작성

3. **Implement Phase 1**:
   - 백엔드: `adoptAnswer()` API 구현
   - 프론트엔드: 채택 버튼 UI 추가
   - 테스트: 단위/통합/E2E 테스트 작성

### After Phase Completion

- **Code Review**: PR 생성 및 리뷰 요청
- **QA Testing**: 수동 테스트 및 회귀 테스트
- **Documentation**: 개발 가이드 업데이트
- **Deployment**: Staging 환경 배포 및 검증

### Transition to Next Phase

- Phase 1 완료 후 `/alfred:3-sync` 실행하여 문서 동기화
- Phase 2 시작 전 `/alfred:1-plan "포인트 자동 증가 통합"` 실행 (선택적)

---

**Last Updated**: 2025-10-30
**Author**: @alfred
**Related SPEC**: @SPEC:ANSWER-INTERACTION-001
