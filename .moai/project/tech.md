---
id: TECH-001
version: 0.2.0
status: active
created: 2025-10-01
updated: 2025-10-29
author: @tech-lead
priority: medium
---

# jeju-tourlist Technology Stack

## HISTORY

### v0.2.1 (2025-11-01)

- **ADDED**: Error Handling Test Strategy (SPEC-ANSWER-INTERACTION-001-PHASE7)
- **AUTHOR**: @Alfred
- **TEST STRATEGY**: Dual-tier testing (Unit + E2E)
- **UNIT TESTS**: 19 tests validating countdown timer, auto-dismiss, manual close
- **E2E TESTS**: 5 tests validating real browser interactions and user flows
- **COVERAGE**: Error banner display, countdown decrement, timer cleanup, accessibility
- **TOOLS**: Jest + React Testing Library (Unit), Playwright (E2E)

### v0.2.0 (2025-10-29)

- **MERGED**: Backup content merged into latest template (v0.3.8)
- **AUTHOR**: @Alfred
- **MERGE SOURCE**: .moai-backups/backup/CLAUDE.md
- **SECTIONS**: Stack, Framework, Quality, Security, Deploy populated with actual tech stack
- **PRESERVED**: Next.js 14, TypeScript, Node.js, Express.js, PostgreSQL, Socket.io, Redis, Prisma
- **ACTION**: Updated all technology sections with real project dependencies and configurations

### v0.1.1 (2025-10-17)

- **UPDATED**: Template version synced (v0.3.8)
- **AUTHOR**: @Alfred
- **SECTIONS**: Metadata standardization (single `author` field, added `priority`)

### v0.1.0 (2025-10-01)

- **INITIAL**: Authored the technology stack document
- **AUTHOR**: @tech-lead
- **SECTIONS**: Stack, Framework, Quality, Security, Deploy

---

## @DOC:STACK-001 Languages & Runtimes

### Primary Language

- **Language**: TypeScript
- **Version Range**: TypeScript 5.x, Node.js 20.x+
- **Rationale**: 타입 안정성, 최신 ECMAScript 지원, 대규모 생태계
- **Package Manager**: pnpm (Turborepo 최적화, 디스크 공간 절약)

### Multi-Platform Support

| Platform    | Support Level | Validation Tooling                 | Key Constraints       |
| ----------- | ------------- | ---------------------------------- | --------------------- |
| **macOS**   | ✅ Primary    | Local development (Docker Desktop) | None                  |
| **Linux**   | ✅ Production | Docker containers                  | None                  |
| **Windows** | ⚠️ Limited    | WSL2 required                      | Windows 10+ with WSL2 |

## @DOC:FRAMEWORK-001 Core Frameworks & Libraries

### 1. Frontend Runtime Dependencies (apps/web)

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "socket.io-client": "^4.7.0",
    "lucide-react": "^0.400.0",
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^3.4.0",
    "clsx": "^2.1.0",
    "react-hook-form": "^7.51.0",
    "zod": "^3.23.0"
  }
}
```

### 2. Backend Runtime Dependencies (apps/api)

```json
{
  "dependencies": {
    "express": "^4.19.0",
    "socket.io": "^4.7.0",
    "@prisma/client": "^5.14.0",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "redis": "^4.6.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.4.0"
  }
}
```

### 3. Shared Package Dependencies

```json
{
  "packages/database": {
    "prisma": "^5.14.0",
    "@prisma/client": "^5.14.0"
  },
  "packages/ui": {
    "react": "^18.3.0",
    "lucide-react": "^0.400.0",
    "tailwindcss": "^3.4.0"
  }
}
```

### 4. Development Tooling

```json
{
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0",
    "eslint": "^8.57.0",
    "prettier": "^3.3.0",
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/express": "^4.17.21",
    "vitest": "^1.6.0",
    "@playwright/test": "^1.44.0"
  }
}
```

### 5. Build System

- **Build Tool**: Turborepo (monorepo orchestration)
- **Bundling**:
  - Frontend: Next.js built-in Webpack/Turbopack
  - Backend: Node.js native ESM
- **Targets**:
  - apps/web → Static/SSR pages (Browser + Node.js)
  - apps/api → Node.js server
- **Performance Goals**:
  - Turbo cache hit → <5초
  - Cold build → <60초

## @DOC:QUALITY-001 Quality Gates & Policies

### Test Coverage & Strategy

#### Overall Coverage Target

- **Target**: 80% line coverage (unit + integration tests)
- **Measurement Tool**: Vitest coverage (c8)
- **Failure Response**: CI 빌드 실패, PR 머지 차단

#### Error Handling Test Strategy (SPEC-ANSWER-INTERACTION-001-PHASE7)

**Unit Tests (Jest + React Testing Library)**

- **Location**: `apps/web/src/app/questions/__tests__/QuestionDetail.error-handling.test.tsx`
- **Test Count**: 19 comprehensive tests
- **Coverage Areas**:
  1. Error Banner Display (4 tests) – 배너 표시, 숨김, 텍스트, ARIA role
  2. Countdown Timer Display (4 tests) – 4초 시작, 1초마다 감소, 자동 종료, 다중 오류 재설정
  3. Manual Close Button (3 tests) – 즉시 종료, 타이머 정지, aria-label
  4. Error Banner Styling (4 tests) – 배경색, 텍스트색, 폰트 크기, 아이콘
  5. Different Error Messages (3 tests) – 채택 오류, 좋아요 오류, 메시지 업데이트
  6. Cleanup (1 test) – 컴포넌트 언마운트 시 타이머 정리

**E2E Tests (Playwright)**

- **Location**: `apps/web/src/__tests__/e2e/question-detail-error.e2e.test.ts`
- **Test Count**: 5 integration tests
- **Coverage Areas**:
  1. Error banner displays in real browser
  2. Countdown timer works with real timing
  3. Auto-dismiss after countdown
  4. Manual close button stops timer
  5. Multiple error scenarios and recovery

**Test Execution**:

```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run with coverage
pnpm test:coverage
```

### Static Analysis

| Tool       | Role        | Config File     | Failure Handling     |
| ---------- | ----------- | --------------- | -------------------- |
| ESLint     | 코드 품질   | `.eslintrc.js`  | Pre-commit hook 실패 |
| Prettier   | 코드 포맷팅 | `.prettierrc`   | Auto-fix on save     |
| TypeScript | 타입 체크   | `tsconfig.json` | Build 실패           |

### Automation Scripts

```bash
# Quality gate pipeline (CI/CD)
pnpm test                    # Run Vitest unit tests
pnpm lint                    # ESLint check
pnpm type-check              # TypeScript compile check
pnpm build                   # Turborepo build all apps
pnpm test:e2e                # Playwright E2E tests
```

## @DOC:SECURITY-001 Security Policy & Operations

### Secret Management

- **Policy**: `.env` 파일은 `.gitignore`에 등록, 절대 커밋 금지
- **Tooling**: 로컬 개발용 `.env.example` 템플릿 제공
- **Verification**: Pre-commit hook으로 `.env` 파일 커밋 차단

### Dependency Security

```json
{
  "security": {
    "audit_tool": "pnpm audit",
    "update_policy": "주간 보안 패치 확인 및 적용",
    "vulnerability_threshold": "High severity 이상 즉시 대응"
  }
}
```

### Logging Policy

- **Log Levels**: debug, info, warn, error (NODE_ENV에 따라 필터링)
- **Sensitive Data Masking**:
  - 비밀번호, JWT 토큰은 로그에 기록 금지
  - 이메일 주소는 마스킹 (e\*\*\*@example.com)
- **Retention Policy**:
  - 로컬 개발: 재시작 시 초기화
  - 프로덕션: 7일 보관 후 삭제

## @DOC:DEPLOY-001 Release Channels & Strategy

### 1. Distribution Channels

- **Primary Channel**: Docker 컨테이너 배포 (apps/web, apps/api 각각)
- **Release Procedure**:
  1. Feature branch → `main` PR
  2. CI 테스트 통과
  3. Docker 이미지 빌드
  4. Staging 환경 배포
  5. Production 배포
- **Versioning Policy**: Semantic Versioning (major.minor.patch)
- **Rollback Strategy**: 이전 Docker 이미지 태그로 즉시 롤백

### 2. Developer Setup

```bash
# Local development setup
git clone <repository-url>
cd jeju-tourlist
pnpm install                 # Install all dependencies
pnpm db:setup                # Setup PostgreSQL + Prisma
pnpm dev                     # Start all services (web:3000, api:4000)

# Or use helper scripts
./start-services.sh          # Start all services
./kill-services.sh           # Stop all services
```

### 3. CI/CD Pipeline

| Stage      | Objective        | Tooling           | Success Criteria       |
| ---------- | ---------------- | ----------------- | ---------------------- |
| Lint       | 코드 품질 검증   | ESLint + Prettier | No errors              |
| Type Check | 타입 안정성 검증 | TypeScript        | No type errors         |
| Test       | 단위/통합 테스트 | Vitest            | 80%+ coverage          |
| Build      | 빌드 검증        | Turborepo         | All apps build success |
| E2E        | 통합 테스트      | Playwright        | Critical paths pass    |
| Deploy     | 배포             | Docker + Cloud    | Health check pass      |

## Environment Profiles

### Development (`dev`)

```bash
export NODE_ENV=development
export LOG_LEVEL=debug
export WEB_PORT=3000
export API_PORT=4000
export DATABASE_URL="postgresql://test:test@localhost:5433/jeju_tourlist"
export REDIS_URL="redis://localhost:6379"
pnpm dev
```

### Test (`test`)

```bash
export NODE_ENV=test
export LOG_LEVEL=info
export DATABASE_URL="postgresql://test:test@localhost:5433/jeju_tourlist_test"
pnpm test
```

### Production (`production`)

```bash
export NODE_ENV=production
export LOG_LEVEL=warning
export WEB_PORT=80
export API_PORT=8080
export DATABASE_URL="<production-database-url>"
export REDIS_URL="<production-redis-url>"
pnpm start
```

## Service Management Scripts

### Start All Services

```bash
#!/bin/bash
# start-services.sh

# Kill existing processes on ports
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:4000 | xargs kill -9 2>/dev/null
lsof -ti:5433 | xargs kill -9 2>/dev/null
lsof -ti:6379 | xargs kill -9 2>/dev/null

# Start services
docker-compose up -d postgres redis
pnpm dev
```

### Stop All Services

```bash
#!/bin/bash
# kill-services.sh

lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:4000 | xargs kill -9 2>/dev/null
docker-compose down
```

## @CODE:TECH-DEBT-001 Technical Debt Management

### Resolved Issues (v0.2.1)

1. **✅ 에러 핸들링 표준화** (RESOLVED in SPEC-ANSWER-INTERACTION-001-PHASE7)
   - Implemented unified error response format: `{ success: false, message: "user-friendly text" }`
   - Applied across all answer interaction handlers: adopt, like, dislike
   - Error messages prioritized from `response.message` field (backend)
   - Tests: 19 unit tests + 5 E2E tests validating error message display and countdown timer

2. ✅ E2E 테스트 커버리지 개선 (부분 해결)
   - Added 5 E2E tests for error handling workflows
   - Test scenarios: banner display, countdown accuracy, auto-dismiss, manual close
   - Still need: Additional E2E coverage for non-error answer flows

### Current Debt

1. **E2E 테스트 커버리지 부족** – Non-error answer flows 추가 필요 (우선순위: 높음)
2. **API 응답 캐싱 미흡** – Redis 캐싱 전략 개선 (우선순위: 중)
3. **성능 모니터링 부재** – APM 도구 도입 필요 (우선순위: 낮음)

### Remediation Plan

- **Short term (1 month)**: E2E 테스트 추가, 에러 핸들링 표준화
- **Mid term (3 months)**: Redis 캐싱 전략 개선, API 문서 자동화
- **Long term (6+ months)**: APM 도구 도입, 성능 최적화, 마이크로서비스 분리 검토

## EARS Technical Requirements Guide

### Using EARS for the Stack

Apply EARS patterns when documenting technical decisions and quality gates:

#### Technology Stack EARS Example

```markdown
### Ubiquitous Requirements (Baseline)

- The system shall guarantee TypeScript type safety across all modules.
- The system shall provide real-time notifications using Socket.io.

### Event-driven Requirements

- WHEN code is committed, the system shall run ESLint, type-check, and tests automatically.
- WHEN a build fails, the system shall notify developers via CI pipeline.

### State-driven Requirements

- WHILE in development mode, the system shall offer hot reloading for frontend and backend.
- WHILE in production mode, the system shall produce optimized builds with minification.

### Optional Features

- WHERE Docker is available, the system may support containerized deployment.
- WHERE Playwright is installed, the system may execute E2E tests on each commit.

### Constraints

- IF a dependency vulnerability (High+) is detected, the system shall halt the build.
- Test coverage shall remain at or above 80%.
- API response time shall not exceed 200ms (P95).
- Build time shall not exceed 60 seconds (cold build).
```

---

_This technology stack guides tool selection and quality gates when `/alfred:2-run` runs._
