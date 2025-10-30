# CLAUDE.md

## 📋 기본 원칙

- 모든 답변은 한국어로 한다.
- 모든 시간은 한국시간 기준으로 한다.
- 서비스 재 시작 시 포트 충돌 발생 시 먼저 kill 후 재시작한다.
- E2E 테스트는 fast-playwright MCP를 사용하며, 진행 전 허용을 얻는다.
- 각종 테스트는 subagent `test-fixer-coverage-booster`를 이용한다.

## 개발 원칙

- 개발 실행계획서는 모든 Phase 및 bullet point에 checkbox를 달아 작성한다.
- 모든 구현은 SOLID 원칙으로 수행한다 (기존 로직 변경 없음).

## 🎯 프로젝트 개요

**"동네물어봐" (AskLocal)** - 제주도 여행자와 현지 주민을 연결하는 실시간 여행 Q&A 커뮤니티

**기술 스택**: Next.js 14 + TypeScript + Node.js + Express.js + PostgreSQL + Socket.io

## 🚀 서비스 관리

**서비스 시작/종료**:

```bash
./start-services.sh   # 모든 서비스 시작
./kill-services.sh    # 모든 서비스 종료
```

**서비스 포트**:
| 서비스 | 포트 | URL |
|--------|------|-----|
| Web | 3000 | http://localhost:3000 |
| API | 4000 | http://localhost:4000 |
| PostgreSQL | 5433 | - |
| Redis | 6379 | - |
| Prisma Studio | 5555 | http://localhost:5555 |

**DB 연결**: `postgresql://test:test@localhost:5433/jeju_tourlist`

## 👤 테스트 계정

| 이메일            | 비밀번호    |
| ----------------- | ----------- |
| ip9202@gmail.com  | rkdcjfIP00! |
| user1@example.com | test123456  |
| user2@example.com | test123456  |
| user3@example.com | test123456  |

## 📊 프로젝트 상태

### ✅ 완료된 기능

회원가입/로그인, 질문/답변, 계층형 댓글, 검색/필터링, 전문가 대시보드, 실시간 알림, 북마크/공유, 프로필

---

**마지막 업데이트**: 2025-10-24 (한국시간)  
**현재 상태**: ✅ 모든 기능 완료 및 안정화
