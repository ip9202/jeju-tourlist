#!/bin/bash

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 동네물어봐 서비스 시작${NC}"
echo "====================================="

# 1. Docker 시작 확인
echo -e "\n${YELLOW}1️⃣  Docker 상태 확인 중...${NC}"
if ! docker ps > /dev/null 2>&1; then
  echo -e "${YELLOW}   Docker daemon이 실행 중이지 않습니다. 시작 중...${NC}"
  open -a Docker
  sleep 10
fi
echo -e "${GREEN}✅ Docker OK${NC}"

# 2. 프로젝트 경로
PROJECT_PATH="/Users/ip9202/develop/vibe/jeju-tourlist"
cd "$PROJECT_PATH"

# 3. Docker Compose 컨테이너 시작
echo -e "\n${YELLOW}2️⃣  Docker 컨테이너 시작 중...${NC}"
docker-compose up -d postgres redis prisma-studio
sleep 5
echo -e "${GREEN}✅ Docker 컨테이너 OK${NC}"

# 4. API 서버 시작
echo -e "\n${YELLOW}3️⃣  API 서버 시작 중...${NC}"
cd "$PROJECT_PATH/apps/api"
npm run dev > /tmp/api-server.log 2>&1 &
API_PID=$!
echo "   PID: $API_PID"
sleep 5

# API 서버 상태 확인
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ API 서버 OK (포트 4000)${NC}"
else
  echo -e "${RED}❌ API 서버 연결 실패${NC}"
fi

# 5. 웹 서버 시작
echo -e "\n${YELLOW}4️⃣  웹 서버 시작 중...${NC}"
cd "$PROJECT_PATH/apps/web"
NEXT_PUBLIC_API_URL="http://localhost:4000" npm run dev > /tmp/web-server.log 2>&1 &
WEB_PID=$!
echo "   PID: $WEB_PID"
sleep 8

# 웹 서버 상태 확인
if curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 웹 서버 OK (포트 3000)${NC}"
else
  echo -e "${RED}❌ 웹 서버 연결 실패${NC}"
fi

# 6. 최종 상태
echo -e "\n${GREEN}====================================="
echo "✅ 모든 서비스 시작 완료!"
echo "====================================="
echo -e "${NC}"
echo "📋 서비스 정보:"
echo "   🌐 웹 앱:       http://localhost:3000"
echo "   🔧 API 서버:    http://localhost:4000"
echo "   💾 Prisma:      http://localhost:5555"
echo "   📊 PostgreSQL:  localhost:5433"
echo "   🔴 Redis:       localhost:6379"
echo ""
echo "📝 로그 파일:"
echo "   API:   /tmp/api-server.log"
echo "   웹:    /tmp/web-server.log"
echo ""
echo "⏹️  서비스 종료: Ctrl+C 또는 kill-services.sh 실행"
echo ""

# 프로세스 보관
wait
