# Docker 실행 가이드

## 📋 사전 요구사항

- Docker Desktop 설치 (v20.10 이상)
- Docker Compose v2.0 이상
- 최소 8GB RAM

## 🚀 빠른 시작

### 1. 환경 변수 설정

```bash
# .env.docker 파일이 없다면 복사
cp .env.docker.example .env.docker

# 필요한 값 수정
vi .env.docker
```

### 2. Docker Compose로 전체 서비스 실행

```bash
# 모든 서비스 빌드 및 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d --build
```

### 3. 서비스 확인

- **Web Application**: http://localhost:3000
- **API Server**: http://localhost:4000
- **API Health Check**: http://localhost:4000/health
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 📦 개별 서비스 관리

### 특정 서비스만 실행

```bash
# PostgreSQL + Redis만 실행
docker-compose up postgres redis -d

# API 서버만 재시작
docker-compose restart api

# Web 앱만 재빌드
docker-compose up --build web
```

### 로그 확인

```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f api
docker-compose logs -f web
```

## 🗄️ 데이터베이스 관리

### Prisma 마이그레이션

```bash
# API 컨테이너 접속
docker-compose exec api sh

# 마이그레이션 실행
cd packages/database
npx prisma migrate deploy

# Prisma Studio 실행 (로컬에서)
npx prisma studio
```

### 데이터베이스 초기화

```bash
# 모든 데이터 삭제 및 재시작
docker-compose down -v
docker-compose up -d postgres redis

# 마이그레이션 및 시드
docker-compose exec api npx prisma migrate deploy
docker-compose exec api npx prisma db seed
```

## 🔧 개발 환경

### Hot Reload 개발 모드

```bash
# docker-compose.dev.yml 사용 (추후 작성)
docker-compose -f docker-compose.dev.yml up
```

### 로컬 + Docker 하이브리드

```bash
# DB와 Redis만 Docker로
docker-compose up postgres redis -d

# Web과 API는 로컬에서
cd apps/web && npm run dev
cd apps/api && npm run dev
```

## 🛠️ 문제 해결

### 포트 충돌

```bash
# 사용 중인 포트 확인
lsof -i :3000
lsof -i :4000
lsof -i :5432

# 기존 프로세스 종료 후 재시작
docker-compose down
docker-compose up -d
```

### 빌드 캐시 초기화

```bash
# Docker 빌드 캐시 삭제
docker-compose build --no-cache

# 전체 초기화 (주의!)
docker-compose down -v --rmi all
docker system prune -a --volumes
```

### 컨테이너 디버깅

```bash
# 컨테이너 접속
docker-compose exec web sh
docker-compose exec api sh

# 컨테이너 상태 확인
docker-compose ps
docker-compose top

# 리소스 사용량
docker stats
```

## 📊 상태 모니터링

### Health Check

```bash
# 모든 서비스 상태
docker-compose ps

# API 헬스체크
curl http://localhost:4000/health

# Web 헬스체크
curl http://localhost:3000
```

### 데이터베이스 연결 테스트

```bash
# PostgreSQL 연결
docker-compose exec postgres psql -U test -d asklocal_dev

# Redis 연결
docker-compose exec redis redis-cli ping
```

## 🧹 정리

### 서비스 중지

```bash
# 컨테이너 중지
docker-compose stop

# 컨테이너 삭제
docker-compose down

# 볼륨까지 삭제 (데이터 손실 주의!)
docker-compose down -v
```

## 🏭 프로덕션 배포

### 환경 변수 설정

```bash
# .env.docker에서 프로덕션 값 설정
POSTGRES_PASSWORD=강력한_비밀번호
NEXTAUTH_SECRET=최소_32자_이상_랜덤_문자열
NODE_ENV=production
```

### 보안 체크리스트

- [ ] 모든 기본 비밀번호 변경
- [ ] NEXTAUTH_SECRET 32자 이상 랜덤 생성
- [ ] OAuth 클라이언트 ID/Secret 설정
- [ ] 데이터베이스 백업 설정
- [ ] SSL/TLS 인증서 설정 (Nginx)
- [ ] 방화벽 규칙 설정

## 📝 추가 명령어

```bash
# 모든 컨테이너 재시작
docker-compose restart

# 특정 컨테이너 재빌드
docker-compose up -d --no-deps --build api

# 리소스 사용량 확인
docker-compose stats

# 네트워크 확인
docker network ls
docker network inspect jeju-tourlist_jeju-network
```

## 🆘 지원

문제가 발생하면:

1. `docker-compose logs` 확인
2. GitHub Issues에 로그와 함께 문의
3. `docker-compose ps`로 서비스 상태 확인
