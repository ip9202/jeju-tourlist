# CLAUDE.md

## 📋 기본 원칙

- 모든 답변은 한국어로 한다.
- 모든 시간은 한국시간 기준으로 한다.
- 서비스 재 시작해야 할 때 사용할 포트가 이미 사용중이라면 같은 종류의 서비스일때 먼저 kill 하고 다시 시작한다.

## 개발실행계획서 작성
  - 개발할 실행계획서 만들고 모든 Phase 및 bullet point 에 checkbox를 달아줘
  - 모든 구현은 SOLID 원칙으로 구현한다 (현재 구현되어있는 상태를 이용해서 개발하고, 기존 로직을 바꾸지 않는다)


## 🎯 프로젝트 개요

**"동네물어봐" (AskLocal)** - 제주도 여행자와 현지 주민을 연결하는 실시간 여행 Q&A 커뮤니티

### 기술 스택

- **프론트엔드**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **백엔드**: Node.js + Express.js + PostgreSQL + Prisma ORM
- **실시간**: Socket.io + 커스텀 JWT 인증

---

## 🚀 개발 환경

### ⚡ 빠른 시작

- 현재 실행중인 서비들의 현재 상태를 제일 먼저 점검한다.
- 지정된 서비스가 live 상태이면 kill-services.sh 을 먼저 실행하고 start-services.sh 을 실행한다.

```bash
# 모든 서비스 시작
./start-services.sh

# 모든 서비스 종료
./kill-services.sh
```

### 서비스 포트

| 서비스        | 포트 | URL                   |
| ------------- | ---- | --------------------- |
| Web Server    | 3000 | http://localhost:3000 |
| API Server    | 4000 | http://localhost:4000 |
| PostgreSQL    | 5433 | -                     |
| Redis         | 6379 | -                     |
| Prisma Studio | 5555 | http://localhost:5555 |

### 📌 데이터베이스 연결

- **호스트**: `postgresql://test:test@localhost:5433/jeju_tourlist`
- **Docker 내부**: `postgresql://test:test@postgres:5432/jeju_tourlist`
- **Prisma**: `postgresql://test:test@localhost:5433/jeju_tourlist?schema=public`

---

## 👤 테스트 계정

| 이메일            | 비밀번호    | 상태 |
| ----------------- | ----------- | ---- |
| ip9202@gmail.com  | rkdcjfIP00! | ✅   |
| user1@example.com | test123456  | ✅   |
| user2@example.com | test123456  | ✅   |
| user3@example.com | test123456  | ✅   |

---

## 📊 프로젝트 상태

### ✅ 완료된 기능

- 회원가입/로그인 (이메일 + OAuth)
- 질문/답변 시스템
- 계층형 댓글 시스템
- 검색 및 필터링
- 전문가 대시보드
- 실시간 알림
- 북마크 및 공유
- 프로필 페이지 (실제 통계 데이터)

### ⚠️ 백로그

- 검색 기능 무한 루프 해결
- Hydration 에러 해결
- E2E 테스트 안정화

### 🗂️ 데이터 현황

- 카테고리: 9개
- 테스트 사용자: 4명
- 질문: 10개
- 답변: 10개

---

## 🛠️ 주요 명령어

```bash
# API 헬스 체크
curl http://localhost:4000/health

# 질문 목록 조회
curl http://localhost:4000/api/questions?page=1&limit=20

# 로그인 테스트
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"test123456"}'

# 배치 스케줄러 수동 실행
curl -X POST http://localhost:4000/api/batch/run
```

---

**마지막 업데이트**: 2025-10-21 (한국시간)  
**현재 상태**: ✅ 모든 서비스 정상 작동 + Phase 6 계획 수립 완료
