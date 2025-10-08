# CLAUDE.md

## 🎯 프로젝트 개요

**"동네물어봐" (AskLocal)** - 제주도 여행자와 현지 주민을 연결하는 실시간 여행 Q&A 커뮤니티

### 핵심 컨셉
- **브랜드**: "동네물어봐" (AskLocal)
- **핵심**: 제주 여행자 ↔ 현지 주민 실시간 Q&A
- **비즈니스**: 커뮤니티 + 리워드 → 업체 제휴 → AI 추천
- **플랫폼**: 웹 우선 → 모바일 앱 확장

### 기술 스택
- **프론트엔드**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **백엔드**: Node.js + Express.js + PostgreSQL + Prisma ORM
- **실시간**: Socket.io + NextAuth.js

---

## 🐳 Docker 우선 실행 정책

**⚠️ 중요: 모든 서비스는 Docker를 이용해서 실행합니다.**

```bash
# 전체 스택 실행
docker-compose up -d

# 서비스 확인
docker-compose ps
```

---

## 📅 개발 진행 상황 (시간순)

### Phase 1.1~1.7: 핵심 기능 완성 (2025-10-04 이전)
✅ **완료된 기능들**:
- 온보딩 플로우
- 질문 작성 및 답변
- 검색 및 필터링
- 현지인 전문가 기능
- 실시간 알림 시스템
- 북마크 및 공유
- 에러 처리 및 검증

### Phase 1.8: 답변 댓글 기능 (2025-10-04)
✅ **완료**:
- DB 스키마: `AnswerComment`, `AnswerCommentLike` 모델 추가
- 백엔드: 댓글 CRUD API 완전 구현
- 프론트엔드: 계층형 댓글 시스템 (무한 깊이)
- UX: 댓글 수 배지, 기본 펼침 상태

### Phase 1.9: 검색 및 필터링 개선 (2025-10-04)
✅ **완료**:
- 검색 기능 수정 (이중 URL 인코딩 제거)
- 카테고리 필터 동적 로드
- Input 컴포넌트 Hydration 에러 해결
- 실시간 검색 구현

### Phase 1.10: 시스템 안정화 (2025-10-05)
✅ **완료**:
- Turbo 빌드 시스템 수정
- 중복 프로세스 정리 (Next.js 서버 2개 → 1개)
- 서비스 상태 검증 완료

### Phase 1.11: 계층형 댓글 시스템 (2025-10-06)
✅ **완료**:
- DB 스키마: `parentId`, `depth` 필드 추가
- API: 계층 데이터 저장 로직 구현
- 프론트엔드: `buildCommentTree()` 함수로 트리 구조 변환
- UX: 답글에 답글 달기 기능 완전 구현

### Phase 1.12: 검색 통합 및 헤더 최적화 (2025-10-06)
✅ **완료**:
- `useQuestionSearch` 훅으로 검색 로직 통합
- 헤더 3-column 레이아웃 적용
- Playwright E2E 테스트 추가
- 서브헤더/필터 간격 최적화

### Phase 1.13: Docker 컨테이너화 (2025-10-07)
⚠️ **진행 중**:
- ✅ Docker 환경 구축 완료
- ✅ PostgreSQL, Redis 컨테이너 정상 작동
- ⚠️ API Server: Prisma 바이너리 문제 (네트워크 타임아웃)
- ⏸️ Web Server: API 대기 중

### Phase 1.14: 이메일 기반 로그인 시스템 (2025-10-07~08)
🚀 **현재 진행 중**:

#### Step 1: 데이터베이스 준비 ✅ (2025-10-07)
- User 모델 확장 (`password`, `emailVerified` 필드 추가)
- 인증 토큰 모델 추가 (`EmailVerificationToken`, `PasswordResetToken`)

#### Step 2: 백엔드 회원가입 API ✅ (2025-10-07)
- Zod 스키마 정의 (`RegisterSchema`, `LoginSchema` 등)
- PasswordService 구현 (bcrypt 기반)
- AuthRepository, AuthService 구현
- EmailAuthController & Router 구현
- API 테스트 성공

#### Step 3: 백엔드 로그인 API ✅ (2025-10-07)
- AuthService 로그인 메서드 구현
- NextAuth CredentialsProvider 설정
- OAuth + 이메일 로그인 통합 시스템
- 통합 테스트 성공

#### Step 4: 프론트엔드 회원가입 페이지 ✅ (2025-10-08)
- `useRegisterForm` 훅 (React Hook Form + Zod)
- `PasswordStrengthIndicator` 컴포넌트
- `RegisterForm` 컴포넌트 (3개 약관 동의)
- `/auth/signup` 페이지 구현
- Playwright E2E 테스트 100% 통과

#### Step 5: 프론트엔드 로그인 페이지 ⚠️ (2025-10-08)
- `EmailLoginForm` 컴포넌트 구현
- `signin/page.tsx` 레이아웃 개선
- OAuth + 이메일 로그인 통합 UI
- **문제**: Docker 환경 동기화 이슈로 파일 되돌림 발생

---

## 🚨 현재 문제점

### 1. Docker 환경 동기화 문제
- 로컬 파일 변경사항이 Docker 컨테이너에 반영되지 않음
- `docker-compose build --no-cache` 필요

### 2. Prisma 바이너리 문제
- Docker 빌드 시 네트워크 타임아웃
- Prisma Client 바이너리 다운로드 실패

### 3. 개발 환경 설정 이슈
- Prettier 권한 문제 (Git 커밋 시)
- TypeScript Zod 스키마 타입 에러

---

## 📊 현재 시스템 상태

### 로컬 개발 환경 ✅
```
✅ Web Server (localhost:3000) - Next.js 14 + shadcn/ui
✅ API Server (localhost:4000) - Express.js + Prisma
✅ Database - PostgreSQL 15 + Redis 7
```

### Docker 환경 ⚠️
```
✅ PostgreSQL 15 (포트 5433) - 정상
✅ Redis 7 (포트 6379) - 정상
⚠️ API Server (포트 4000) - Prisma 바이너리 문제
⚠️ Web Server (포트 3000) - API 대기 중
```

---

## 🎯 다음 단계

### 즉시 해결 필요
1. **Step 5 재구현**: 이메일 로그인 폼 복구
2. **Docker 환경 안정화**: Prisma 바이너리 문제 해결
3. **Step 6 진행**: 보안 강화 (Rate Limiter, CSRF)

### 백로그
- 검색 기능 무한 루프 해결
- Hydration 에러 해결
- Rate Limiter 재활성화

---

## 🛠️ 개발 환경 운영

### 서버 실행
```bash
# Docker 환경 (권장)
docker-compose up -d

# 로컬 환경
cd apps/web && npm run dev    # 포트 3000
cd apps/api && npm run dev    # 포트 4000
```

### Health Check
```bash
curl http://localhost:3000/api/auth/session  # Web
curl http://localhost:4000/health            # API
```

### Prisma Studio
```bash
# Docker 환경
http://localhost:5555

# 로컬 환경
cd packages/database && npx prisma studio
```

---

**마지막 업데이트**: 2025-10-08  
**현재 작업**: Phase 1.14 Step 5 복구 및 Step 6 진행  
**완료 사항**: Step 1-4 완료 ✅  
**다음 단계**: Step 5 재구현 → Step 6 보안 강화