# CLAUDE.md

## 꼭 해야 할일

- 모든 답변은 한국어로 한다.
- 모든 시간은 한국시간 기준으로 한다. 현재 시간을 확인하고 지정한다.

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
| Web Server    | 3000 | http://localhost:3000 |
| API Server    | 4000 | http://localhost:4000 |
| PostgreSQL    | 5433 | -                     |
| Redis         | 6379 | -                     |
| Prisma Studio | 5555 | http://localhost:5555 |

**포트 주의사항**:

- **PostgreSQL**: 호스트에서 5433으로 접근 (Docker 내부: 5432)
  - 호스트 연결: `postgresql://test:test@localhost:5433/jeju_tourlist`
  - Docker 컨테이너 간: `postgresql://test:test@postgres:5432/jeju_tourlist`
  - 마이그레이션 적용 완료 (password, attachments, acceptedAnswerId 컬럼)
- **웹서버**: 포트 3000 사용 중일 경우 3001로 자동 변경 (Next.js 기본 동작)
- **API 서버**: 포트 4000 (고정, 환경변수: `PORT=4000`)
- **Prisma Studio**: 포트 5555 (GUI 데이터베이스 관리 도구)

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
- ✅ **Prisma Studio 데이터베이스 연결 오류 해결 (2025-10-19)**
  - docker-compose.yml의 Prisma Studio DATABASE_URL을 asklocal_dev에서 jeju_tourlist로 수정
  - 캐시 정리 후 컨테이너 재시작
- ✅ **데이터베이스 초기화 및 테스트 데이터 생성 (2025-10-19)**
  - 모든 테이블 데이터 삭제 및 정리
  - 새로운 테스트 데이터로 완전 초기화

### 데이터 현황

- **카테고리**: 9개
- **테스트 사용자**: 3명 (user1, user2, user3)
  - 로그인 테스트 계���: user1@example.com / test123456
- **질문**: 10개
- **답변**: 10개

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

## 📌 테스트 계정

| 이메일            | 비밀번호   | 닉네임 | 상태 |
| ----------------- | ---------- | ------ | ---- |
| user1@example.com | test123456 | user1  | ✅   |
| user2@example.com | test123456 | user2  | ✅   |
| user3@example.com | test123456 | user3  | ✅   |

---

## 🚦 시스템 상태 체크

```bash
# API 서버 헬스 체크
curl http://localhost:4000/health

# 질문 목록 조회
curl http://localhost:4000/api/questions?page=1&limit=20

# 로그인 테스트
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"test123456"}'
```

---

**마지막 업데이트**: 2025-10-19
**현재 작업**: 데이터베이스 초기화 및 설정 완료 ✅
**시스템 상태**: 모든 서비스 정상 작동 ✅ (API + Web + DB + Prisma Studio)
