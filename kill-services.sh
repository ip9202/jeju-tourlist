#!/bin/bash

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 서비스 종료 중...${NC}"
echo "====================================="

# 1. npm 프로세스 종료
echo -e "\n${YELLOW}1️⃣  npm 프로세스 종료 중...${NC}"
pkill -f "npm run dev"
pkill -f "tsx watch"
pkill -f "next dev"
sleep 2
echo -e "${GREEN}✅ npm 프로세스 종료${NC}"

# 2. Docker 컨테이너 종료
echo -e "\n${YELLOW}2️⃣  Docker 컨테이너 종료 중...${NC}"
docker-compose -f /Users/ip9202/develop/vibe/jeju-tourlist/docker-compose.yml down
sleep 2
echo -e "${GREEN}✅ Docker 컨테이너 종료${NC}"

echo -e "\n${GREEN}====================================="
echo "✅ 모든 서비스 종료 완료!"
echo "====================================="
echo -e "${NC}"
