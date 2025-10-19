# CLAUDE.md

## 🎯 프로젝트 개요

**"동네물어봐" (AskLocal)** - 제주도 여행자와 현지 주민을 연결하는 실시간 여행 Q&A 커뮤니티

### 기술 스택

- **프론트엔드**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **백엔드**: Node.js + Express.js + PostgreSQL + Prisma ORM
- **실시간**: Socket.io + 커스텀 JWT 인증

---

## 🚀 개발 환경

### ⚡ 하이브리드 환경 (개발용 - 권장)

```bash
# 1. DB만 Docker로 실행
docker-compose up -d postgres redis prisma-studio

# 2. API 서버 로컬 실행
cd apps/api && npm run dev

# 3. 웹 서버 로컬 실행
cd apps/web && npm run dev
```

### 🐳 Docker 전체 스택 (배포/테스트용)

```bash
docker-compose up -d
```

### 서비스 포트

| 서비스        | 포트 | URL                   |
| ------------- | ---- | --------------------- |
| Web Server    | 3001 | http://localhost:3001 |
| API Server    | 4000 | http://localhost:4000 |
| PostgreSQL    | 5433 | -                     |
| Redis         | 6379 | -                     |
| Prisma Studio | 5555 | http://localhost:5555 |

**포트 주의사항**:

- PostgreSQL: 호스트에서 5433으로 접근 (Docker 내부: 5432)
- 웹서버: 포트 3000 사용 중일 경우 3001로 자동 변경

---

## 📊 현재 상태

### 완료된 기능

- ✅ 회원가입/로그인 (이메일 + OAuth)
- ✅ 질문/답변 시스템
- ✅ 계층형 댓글 시스템
- ✅ 검색 및 필터링
- ✅ 전문가 대시보드 (Phase 1-5 완료)
- ✅ 실시간 알림
- ✅ 북마크 및 공유

### 주요 이슈 해결

- ✅ 커스텀 인증 시스템 구현 완료
- ✅ Docker 환경 동기화
- ✅ 전문가 대시보드 무한 루프 (useEffect 의존성 최적화)
- ✅ API 404 에러 (환경변수 설정)
- ✅ **데이터베이스 포트 충돌 해결 (2025-10-19)**
  - `.env.local`: `postgresql://test:test@localhost:5433/jeju_tourlist`
  - `packages/database/.env`: `postgresql://test:test@localhost:5433/jeju_tourlist?schema=public`
  - `~/.zprofile`: 환경변수 영구 설정
  - Docker 내부: `postgres:5432` (컨테이너 간 통신)
  - Prisma 마이그레이션: 3개 모두 완료 ✅

### 데이터 현황

- **카테고리**: 9개
- **테스트 사용자**: 47명
- **질문**: 100개
- **전문가**: 4명 (배지 6개 할당)

---

## 🛠️ 주요 명령어

```bash
# Health Check
curl http://localhost:4000/health
curl http://localhost:4000/api/auth/me

# Prisma Studio
docker-compose up -d prisma-studio
# 접속: http://localhost:5555

# 배치 스케줄러 수동 실행
curl -X POST http://localhost:4000/api/batch/run
```

---

## 🎯 다음 단계

### 백로그

- 검색 기능 무한 루프 해결
- Hydration 에러 해결
- E2E 테스트 안정화

### Phase 2 (계획)

- UI/UX 리뉴얼
- 반응형 최적화
- 소셜 계정 통합

---

**마지막 업데이트**: 2025-10-19
**현재 작업**: 데이터베이스 포트 충돌 해결 ✅
**시스템 상태**: 모든 서비스 정상 작동 ✅ (API + Web + DB)
