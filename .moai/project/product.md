---
id: PRODUCT-001
version: 0.2.0
status: active
created: 2025-10-01
updated: 2025-10-29
author: @project-owner
priority: high
---

# jeju-tourlist Product Definition

## HISTORY

### v0.2.1 (2025-11-01)

- **ADDED**: Error Handling Feature (SPEC-ANSWER-INTERACTION-001-PHASE7)
- **AUTHOR**: @Alfred
- **FEATURE**: Answer interaction error messages with countdown timer
- **COMPONENTS**: Error banner with 4-second countdown, auto-dismiss, manual close button
- **IMPLEMENTATION**: `page.tsx`, `FacebookAnswerCard.tsx`, `FacebookAnswerInput.tsx`, `FacebookAnswerThread.tsx`
- **TESTS**: 19 unit tests + 5 E2E tests for error handling validation

### v0.2.0 (2025-10-29)

- **MERGED**: Backup content merged into latest template (v0.3.8)
- **AUTHOR**: @Alfred
- **MERGE SOURCE**: .moai-backups/backup/CLAUDE.md
- **SECTIONS**: Mission, User, Problem, Strategy populated with real project data
- **PRESERVED**: Service name, tech stack, test accounts, service ports
- **ACTION**: Replaced MoAI-ADK placeholder with actual "동네물어봐" (AskLocal) service information

### v0.1.3 (2025-10-17)

- **UPDATED**: Template version synced (v0.3.8)
- **AUTHOR**: @Alfred
- **SECTIONS**: Mission (finalized team of 12 agents: Alfred + 11 specialists)
  - Added implementation-planner, tdd-implementer, quality-gate
  - Split code-builder into implementation-planner + tdd-implementer + quality-gate

### v0.1.2 (2025-10-17)

- **UPDATED**: Agent count adjusted (9 → 11)
- **AUTHOR**: @Alfred
- **SECTIONS**: Mission (updated Alfred SuperAgent roster)

### v0.1.1 (2025-10-17)

- **UPDATED**: Template defaults aligned with the real MoAI-ADK project
- **AUTHOR**: @Alfred
- **SECTIONS**: Mission, User, Problem, Strategy, Success populated with project context

### v0.1.0 (2025-10-01)

- **INITIAL**: Authored the product definition document
- **AUTHOR**: @project-owner
- **SECTIONS**: Mission, User, Problem, Strategy, Success, Legacy

---

## @DOC:MISSION-001 Core Mission

> **"제주도 여행자와 현지 주민을 실시간으로 연결하는 Q&A 커뮤니티"**

**동네물어봐 (AskLocal)**는 제주도 여행자가 현지 주민과 전문가에게 실시간으로 질문하고 답변받을 수 있는 커뮤니티 플랫폼입니다.

### Core Value Proposition

#### Four Key Values

1. **실시간 연결**: 여행자와 현지 주민/전문가를 Socket.io 기반 실시간 알림으로 연결
2. **신뢰성**: 전문가 대시보드와 평판 시스템으로 답변 품질 보장
3. **편의성**: 검색/필터링, 북마크, 공유 기능으로 정보 접근성 극대화
4. **커뮤니티**: 계층형 댓글 시스템으로 깊이 있는 토론 가능

#### Technical Stack

- **Frontend**: Next.js 14 + TypeScript
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (port 5433)
- **Real-time**: Socket.io
- **Cache**: Redis (port 6379)
- **Development**: Prisma Studio (port 5555)

#### Service Ports

| 서비스        | 포트 | URL                   |
| ------------- | ---- | --------------------- |
| Web           | 3000 | http://localhost:3000 |
| API           | 4000 | http://localhost:4000 |
| PostgreSQL    | 5433 | -                     |
| Redis         | 6379 | -                     |
| Prisma Studio | 5555 | http://localhost:5555 |

## @SPEC:USER-001 Primary Users

### Primary Audience

- **Who**: 제주도를 여행하는 관광객
- **Core Needs**:
  - 현지인만 아는 맛집, 숨겨진 관광지, 실시간 날씨/교통 정보
  - 신뢰할 수 있는 답변 (전문가 검증)
  - 빠른 응답 (실시간 알림)
- **Critical Scenarios**:
  - 여행 중 긴급한 정보가 필요할 때 (식당 추천, 길 찾기 등)
  - 여행 계획 수립 시 현지 정보 수집
  - 다른 여행자들의 경험 공유 확인

### Secondary Audience

- **Who**: 제주도 현지 주민 및 전문가
- **Needs**:
  - 자신의 지역 전문성 공유
  - 전문가 대시보드로 답변 활동 통계 확인
  - 평판 시스템을 통한 신뢰도 구축

## @SPEC:PROBLEM-001 Problems to Solve

### High Priority

1. **정보 신뢰성**: 온라인 여행 정보의 신뢰성 부족 문제 해결
2. **실시간성**: 여행 중 긴급한 질문에 대한 빠른 답변 필요
3. **접근성**: 흩어진 여행 정보를 한 곳에서 검색/관리

### Medium Priority

- 여행자와 현지인 간의 소통 장벽
- 개인화된 여행 정보 부족

### Current Failure Cases

- 기존 여행 커뮤니티는 답변이 느리거나 신뢰도가 낮음
- 포털 사이트 정보는 상업적 목적이 강하고 현지 정보 부족
- SNS는 정보가 산발적이고 검색이 어려움

## @DOC:STRATEGY-001 Differentiators & Strengths

### Strengths Versus Alternatives

1. **실시간 알림 시스템**
   - **When it matters**: 여행 중 긴급한 질문에 대해 즉각적인 답변 알림을 받을 수 있음

2. **전문가 검증 시스템**
   - **When it matters**: 답변의 신뢰성이 중요한 질문 (숙박, 안전, 교통 등)에서 전문가 배지로 신뢰도 보장

3. **카테고리별 전문화**
   - **When it matters**: 음식, 관광, 교통, 숙박 등 카테고리별로 전문가를 찾아 정확한 답변 획득

## @SPEC:FEATURES-001 Implemented Features

### Phase 7: Error Handling with Countdown Timer (v0.2.1)

**Feature Name**: Answer Interaction Error Handling

**Description**: 사용자가 답변과 상호작용할 때 발생하는 오류를 명확하게 표시하고 자동으로 해제하는 기능입니다.

**Components**:

- **Error Banner**: 상단에 빨간색 배경으로 오류 메시지 표시
- **Countdown Timer**: 4초에서 1초까지 카운트다운 표시
- **Auto-dismiss**: 카운트다운이 0에 도달하면 자동으로 배너 숨김
- **Manual Close**: ✕ 버튼으로 즉시 닫을 수 있음
- **Accessibility**: ARIA alert role로 스크린 리더 지원

**User Interactions Supported**:

- 답변 채택 실패 → "자신의 답변은 채택할 수 없습니다."
- 좋아요 처리 실패 → "좋아요 처리에 실패했습니다."
- 싫어요 처리 실패 → "싫어요 처리에 실패했습니다."

**Technical Implementation**:

- Backend: Express.js 핸들러에서 `response.message` 필드로 사용자 친화적 메시지 전달
- Frontend: `setAnswerErrorWithTimer()` 함수로 카운트다운 로직 처리
- State Management: `answerError` (에러 메시지), `countdown` (타이머), `countdownIntervalRef` (interval 참조)
- Timer Logic: `remainingSeconds` 로컬 변수로 race condition 방지

**Test Coverage**:

- Unit Tests: 19개 (에러 배너 표시, 카운트다운, 자동 종료, 수동 종료 등)
- E2E Tests: 5개 (실제 브라우저 상호작용 검증)

**Related SPECs**: SPEC-ANSWER-INTERACTION-001-PHASE7
**Related TAGs**:

- @CODE:ANSWER-INTERACTION-001-ERROR-HANDLING
- @CODE:ANSWER-INTERACTION-001-FACEBOOK-CARD
- @CODE:ANSWER-INTERACTION-001-FACEBOOK-INPUT
- @CODE:ANSWER-INTERACTION-001-FACEBOOK-THREAD
- @TEST:ANSWER-INTERACTION-001-F3

---

## @SPEC:SUCCESS-001 Success Metrics

### Immediately Measurable KPIs

1. **답변 응답 시간**
   - **Baseline**: 평균 30분 이내 첫 답변 목표

2. **전문가 답변 비율**
   - **Baseline**: 전체 답변 중 전문가 답변 30% 이상 목표

3. **사용자 만족도**
   - **Baseline**: 답변 만족도 평균 4.0/5.0 이상

### Measurement Cadence

- **Daily**: 신규 질문 수, 답변 수, 실시간 알림 발송 수
- **Weekly**: 전문가 활동 통계, 카테고리별 질문 분포
- **Monthly**: 사용자 증가율, 재방문율, 전문가 활동 지속률

## Legacy Context

### Existing Assets

- **완료된 기능**: 회원가입/로그인, 질문/답변, 계층형 댓글, 검색/필터링, 전문가 대시보드, 실시간 알림, 북마크/공유, 프로필
- **테스트 계정**: 4개의 테스트 계정 보유 (관리자 및 일반 사용자)
- **서비스 스크립트**: `start-services.sh`, `kill-services.sh`로 전체 서비스 관리 자동화
- **DB 설정**: PostgreSQL 5433 포트, 테스트 DB 구축 완료

### Test Accounts

| 이메일            | 비밀번호    | 역할        |
| ----------------- | ----------- | ----------- |
| ip9202@gmail.com  | rkdcjfIP00! | 관리자      |
| user1@example.com | test123456  | 일반 사용자 |
| user2@example.com | test123456  | 일반 사용자 |
| user3@example.com | test123456  | 일반 사용자 |

## TODO:SPEC-BACKLOG-001 Next SPEC Candidates

1. **SPEC-001**: 답변 품질 향상을 위한 AI 추천 시스템
2. **SPEC-002**: 모바일 앱 버전 개발
3. **SPEC-003**: 다국어 지원 (영어, 중국어, 일본어)
4. **SPEC-004**: 위치 기반 질문 필터링
5. **SPEC-005**: 전문가 인증 자동화 시스템

## EARS Requirement Authoring Guide

### EARS (Easy Approach to Requirements Syntax)

Use these EARS patterns to keep SPEC requirements structured:

#### EARS Patterns

1. **Ubiquitous Requirements**: The system shall provide [capability].
2. **Event-driven Requirements**: WHEN [condition], the system shall [behaviour].
3. **State-driven Requirements**: WHILE [state], the system shall [behaviour].
4. **Optional Features**: WHERE [condition], the system may [behaviour].
5. **Constraints**: IF [condition], the system shall enforce [constraint].

#### Sample Application

```markdown
### Ubiquitous Requirements (Foundational)

- The system shall provide real-time notification capabilities.

### Event-driven Requirements

- WHEN a user posts a question, the system shall notify relevant experts.

### State-driven Requirements

- WHILE a user remains logged in, the system shall display personalized dashboard.

### Optional Features

- WHERE an account is verified expert, the system may display expert badge.

### Constraints

- IF a question is reported 3+ times, the system shall hide the content pending review.
```

---

_This document serves as the baseline when `/alfred:1-plan` runs._
