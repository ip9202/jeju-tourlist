# 🚀 동네물어봐 서비스 가이드

## 📋 개요

**동네물어봐** 서비스는 다음 4개의 주요 컴포넌트로 구성됩니다:

| 서비스           | 포트 | 용도                       |
| ---------------- | ---- | -------------------------- |
| 🌐 웹 앱         | 3000 | 프론트엔드 (Next.js 14)    |
| 🔧 API 서버      | 4000 | 백엔드 (Express + Prisma)  |
| 💾 Prisma Studio | 5555 | 데이터베이스 GUI 관리 도구 |
| 📊 PostgreSQL    | 5433 | 메인 데이터베이스          |
| 🔴 Redis         | 6379 | 캐시 & 세션 저장소         |

---

## 🎯 서비스 시작/종료

### ✅ 한 번에 모든 서비스 시작

```bash
cd /Users/ip9202/develop/vibe/jeju-tourlist
./start-services.sh
```

**자동 실행 내용:**

1. Docker daemon 확인 및 시작
2. PostgreSQL, Redis, Prisma Studio 시작 (Docker)
3. API 서버 시작 (npm run dev)
4. 웹 서버 시작 (npm run dev)
5. 모든 서비스 상태 확인

### ⏹️ 모든 서비스 종료

```bash
./kill-services.sh
```

---

## 🔍 개별 서비스 시작

### 1️⃣ Docker 컨테이너 시작

```bash
docker-compose up -d postgres redis prisma-studio
```

확인:

```bash
docker-compose ps
```

### 2️⃣ API 서버 시작

```bash
cd apps/api
npm run dev
```

테스트:

```bash
curl http://localhost:4000/health
```

### 3️⃣ 웹 서버 시작

```bash
cd apps/web
NEXT_PUBLIC_API_URL="http://localhost:4000" npm run dev
```

접속:

```
http://localhost:3000
```

---

## 🧩 Prisma Studio 접근

### 접속 URL

```
http://localhost:5555
```

### 기능

- 데이터베이스 테이블 조회 및 편집
- 데이터 CRUD 작업
- 스키마 시각화

---

## 🔑 테스트 계정

| 이메일            | 비밀번호    | 상태    |
| ----------------- | ----------- | ------- |
| ip9202@gmail.com  | rkdcjfIP00! | ✅ 활성 |
| user1@example.com | test123456  | ✅ 활성 |
| user2@example.com | test123456  | ✅ 활성 |

---

## 📊 주요 기능 검증

### 프로필 페이지 - 실제 통계 데이터 표시

로그인 후 프로필 페이지 (`/profile`)에서 확인:

- ✅ **답변**: 28개 (실제 데이터)
- ✅ **채택된 답변**: 16개 (57.1% 채택률)
- ✅ **포인트**: 1600점 (100점/채택 + 1점/좋아요)

#### API 검증

```bash
# 로그인
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ip9202@gmail.com","password":"rkdcjfIP00!"}' | jq -r '.data.user.id')

# 통계 조회
curl http://localhost:4000/api/users/me/stats \
  -H "Authorization: Bearer temp_${TOKEN}_$(date +%s)"
```

---

## 🐛 문제 해결

### 문제: Prisma Studio 연결 안 됨

**원인**: Docker daemon이 실행 중이지 않음

**해결**:

```bash
# macOS에서
open -a Docker

# 또는 수동으로 Docker Desktop 앱 실행
```

### 문제: 포트 충돌

**3000 포트 이미 사용 중일 경우**:

```bash
# 프로세스 확인
lsof -i :3000

# 종료
kill -9 <PID>
```

**4000 포트 이미 사용 중일 경우**:

```bash
lsof -i :4000
kill -9 <PID>
```

### 문제: 데이터베이스 연결 실패

**확인사항**:

1. Docker 실행: `docker-compose ps`
2. PostgreSQL 상태: `docker-compose logs postgres`
3. 환경변수: `echo $DATABASE_URL`

**재설정**:

```bash
docker-compose down -v
docker-compose up -d postgres redis prisma-studio
```

---

## 📝 로그 확인

### API 서버 로그

```bash
tail -f /tmp/api.log
```

### 웹 서버 로그

```bash
tail -f /tmp/web.log
```

---

## 🔄 서비스 재시작

### 전체 재시작

```bash
./kill-services.sh
sleep 2
./start-services.sh
```

### 개별 서비스 재시작

```bash
# API 서버만 재시작
pkill -f "api.*npm run dev"
cd apps/api && npm run dev &

# 웹 서버만 재시작
pkill -f "web.*npm run dev"
cd apps/web && NEXT_PUBLIC_API_URL="http://localhost:4000" npm run dev &
```

---

## ✨ 핵심 기능 구현 현황

### ✅ 완료된 기능

- ✅ 사용자 인증 (이메일 로그인)
- ✅ 질문/답변 시스템
- ✅ 계층형 댓글
- ✅ **프로필 페이지 - 실제 통계 데이터 표시** (Prisma를 통한 실제 DB 쿼리)
- ✅ 배지 시스템
- ✅ 포인트 시스템
- ✅ 검색 및 필터링

### 🚧 진행 중

- 🔄 E2E 테스트 안정화
- 🔄 성능 최적화

---

## 📞 지원

문제가 발생하면:

1. 로그 확인: `/tmp/api.log`, `/tmp/web.log`
2. Docker 상태 확인: `docker-compose ps`
3. 포트 상태 확인: `lsof -i :<포트>`
4. 전체 재시작: `./kill-services.sh && sleep 2 && ./start-services.sh`

---

**마지막 업데이트**: 2025-10-19 22:00 (한국시간)
**현재 상태**: ✅ 모든 서비스 정상 작동
