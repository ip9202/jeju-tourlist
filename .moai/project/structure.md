---
id: STRUCTURE-001
version: 0.2.0
status: active
created: 2025-10-01
updated: 2025-10-29
author: @architect
priority: medium
---

# jeju-tourlist Structure Design

## HISTORY

### v0.2.0 (2025-10-29)
- **MERGED**: Backup content merged into latest template (v0.3.8)
- **AUTHOR**: @Alfred
- **MERGE SOURCE**: .moai-backups/backup/CLAUDE.md
- **SECTIONS**: Architecture populated with Turborepo monorepo structure
- **PRESERVED**: Service ports, module organization
- **ACTION**: Updated architecture section to reflect actual monorepo structure (apps/web, apps/api, packages/*)

### v0.1.1 (2025-10-17)
- **UPDATED**: Template version synced (v0.3.8)
- **AUTHOR**: @Alfred
- **SECTIONS**: Metadata standardization (single `author` field, added `priority`)

### v0.1.0 (2025-10-01)
- **INITIAL**: Authored the structure design document
- **AUTHOR**: @architect
- **SECTIONS**: Architecture, Modules, Integration, Traceability

---

## @DOC:ARCHITECTURE-001 System Architecture

### Architectural Strategy

**Turborepo 기반 Monorepo 아키텍처**로 Frontend (Next.js), Backend (Express.js), 공유 패키지를 단일 저장소에서 관리합니다.

```
jeju-tourlist (Turborepo Monorepo)
├── apps/
│   ├── web/              # Next.js 14 Frontend (Port 3000)
│   └── api/              # Express.js Backend (Port 4000)
├── packages/
│   ├── ui/               # 공유 UI 컴포넌트 (React)
│   ├── database/         # Prisma 스키마 및 DB 유틸리티
│   ├── typescript-config/ # 공유 TypeScript 설정
│   └── eslint-config/    # 공유 ESLint 설정
└── scripts/
    ├── start-services.sh  # 전체 서비스 시작
    └── kill-services.sh   # 전체 서비스 종료
```

**Rationale**:
- Monorepo로 코드 공유 및 버전 관리 단순화
- Turborepo 캐싱으로 빌드 속도 최적화
- 패키지 간 타입 안정성 보장 (TypeScript)
- 독립적인 배포 가능 (apps/web, apps/api 분리)

## @DOC:MODULES-001 Module Responsibilities

### 1. Frontend Application (apps/web)

- **Responsibilities**:
  - 사용자 인터페이스 렌더링 (Next.js 14 App Router)
  - 실시간 알림 수신 (Socket.io Client)
  - API 서버와 통신 (REST API)
- **Inputs**: 사용자 입력, API 응답, Socket 이벤트
- **Processing**: React 컴포넌트 렌더링, 상태 관리, 라우팅
- **Outputs**: HTML/CSS/JS, API 요청

| Component     | Role   | Key Capabilities |
| ------------- | ------ | ---------------- |
| Pages | 라우팅 | App Router 기반 페이지 라우팅, 동적 라우트 |
| Components | UI | 질문/답변 카드, 댓글, 프로필, 대시보드 |
| Hooks | 상태 관리 | 실시간 알림, 데이터 패칭, 폼 상태 |
| Layouts | 레이아웃 | 헤더, 사이드바, 푸터 공통 레이아웃 |

### 2. Backend Application (apps/api)

- **Responsibilities**:
  - REST API 제공
  - 실시간 알림 브로드캐스트 (Socket.io Server)
  - 데이터베이스 CRUD (Prisma ORM)
  - 인증/인가 (JWT)
- **Inputs**: HTTP 요청, Socket 이벤트
- **Processing**: 비즈니스 로직 실행, DB 쿼리, 권한 검증
- **Outputs**: JSON 응답, Socket 이벤트

| Component     | Role   | Key Capabilities |
| ------------- | ------ | ---------------- |
| Routes | API 엔드포인트 | RESTful API 라우팅 |
| Controllers | 비즈니스 로직 | 요청 처리, 응답 생성 |
| Services | 도메인 로직 | 질문/답변/댓글/전문가 관리 |
| Middleware | 공통 처리 | 인증, 로깅, 에러 핸들링 |

### 3. Shared Packages

- **packages/ui**: 공유 React 컴포넌트 (버튼, 입력, 카드 등)
- **packages/database**: Prisma 스키마, 마이그레이션, 시드 데이터
- **packages/typescript-config**: 공유 tsconfig.json
- **packages/eslint-config**: 공유 ESLint 규칙

## @DOC:INTEGRATION-001 External Integrations

### PostgreSQL Database Integration

- **Authentication**: 로컬 개발용 고정 계정 (test/test)
- **Data Exchange**: Prisma ORM을 통한 타입 안전 쿼리
- **Failure Handling**: Connection pool, 자동 재연결
- **Risk Level**: Medium - 로컬 개발 환경이므로 데이터 손실 리스크 낮음

### Redis Cache Integration

- **Purpose**: 세션 저장, 실시간 알림 큐
- **Dependency Level**: High - 실시간 알림 기능 의존
- **Performance Requirements**: 10ms 이내 응답 시간

### Socket.io Real-time Integration

- **Purpose**: 실시간 알림 (새 답변, 댓글, 좋아요)
- **Dependency Level**: High - 핵심 기능
- **Performance Requirements**: 100ms 이내 이벤트 전달

## @DOC:TRACEABILITY-001 Traceability Strategy

### Applying the TAG Framework

**Full TDD Alignment**: SPEC → Tests → Implementation → Documentation
- `@SPEC:ID` (`.moai/specs/`) → `@TEST:ID` (`tests/`) → `@CODE:ID` (`src/`) → `@DOC:ID` (`docs/`)

**Implementation Detail Levels**: Annotation within `@CODE:ID`
- `@CODE:ID:API` – REST APIs, Express routes
- `@CODE:ID:UI` – React components, Next.js pages
- `@CODE:ID:DATA` – Prisma models, database schemas
- `@CODE:ID:DOMAIN` – Business logic (Services)
- `@CODE:ID:INFRA` – Socket.io, Redis, PostgreSQL connections

### Managing TAG Traceability (Code-Scan Approach)

- **Verification**: Run `/alfred:3-sync`, which scans with `rg '@(SPEC|TEST|CODE|DOC):' -n`
- **Coverage**: Full project source (`.moai/specs/`, `tests/`, `apps/`, `packages/`)
- **Cadence**: Validate whenever the code changes
- **Code-First Principle**: TAG truth lives in the source itself

## Legacy Context

### Current System Snapshot

**완료된 모듈 구조 (2025-10-24 기준)**

```
jeju-tourlist/
├── apps/
│   ├── web/              # ✅ 완료 (회원, 질문/답변, 검색, 프로필, 북마크)
│   └── api/              # ✅ 완료 (REST API, Socket.io, 인증)
├── packages/
│   ├── ui/               # ✅ 완료 (공유 컴포넌트)
│   ├── database/         # ✅ 완료 (Prisma 스키마, 마이그레이션)
│   ├── typescript-config/ # ✅ 완료
│   └── eslint-config/    # ✅ 완료
```

### Migration Considerations

1. **AI 추천 시스템 추가** – 향후 Machine Learning 서비스 모듈 추가 필요 (우선순위: 중)
2. **모바일 앱 개발** – React Native 앱 추가 (apps/mobile) (우선순위: 중)
3. **성능 최적화** – Redis 캐싱 전략 개선, DB 인덱스 최적화 (우선순위: 높음)

## TODO:STRUCTURE-001 Structural Improvements

1. **마이크로서비스 분리 고려** – 알림 서비스 독립 실행 검토
2. **API Gateway 도입** – 인증/라우팅 중앙화
3. **모니터링 대시보드** – Grafana + Prometheus 구축

## EARS for Architectural Requirements

### Applying EARS to Architecture

Use EARS patterns to write clear architectural requirements:

#### Architectural EARS Example
```markdown
### Ubiquitous Requirements (Baseline Architecture)
- The system shall adopt a monorepo architecture using Turborepo.
- The system shall maintain loose coupling between apps and packages.

### Event-driven Requirements
- WHEN an API call fails, the system shall execute retry logic with exponential backoff.
- WHEN a new answer is posted, the system shall broadcast a Socket.io event to subscribed clients.

### State-driven Requirements
- WHILE the system operates in production mode, it shall use connection pooling for database access.
- WHILE in development mode, the system shall provide hot reloading for both frontend and backend.

### Optional Features
- WHERE Redis is unavailable, the system may fall back to in-memory session storage.
- WHERE high traffic is detected, the system may enable rate limiting per user.

### Constraints
- IF the database connection pool is exhausted, the system shall reject new requests with HTTP 503.
- Each API endpoint shall respond within 200ms (P95).
```

---

_This structure informs the TDD implementation when `/alfred:2-run` runs._
