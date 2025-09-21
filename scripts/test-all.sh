#!/bin/bash

# 종합 테스트 실행 스크립트
# 제주도 여행 Q&A 커뮤니티 플랫폼 전체 테스트 수행

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 테스트 결과 저장 변수
UNIT_TEST_RESULT=0
INTEGRATION_TEST_RESULT=0
E2E_TEST_RESULT=0
SECURITY_TEST_RESULT=0
PERFORMANCE_TEST_RESULT=0

# 시작 시간 기록
START_TIME=$(date +%s)

echo "🚀 제주도 여행 Q&A 커뮤니티 종합 테스트 시작"
echo "================================================"

# 환경 체크
log_info "환경 설정 확인 중..."

# Node.js 버전 확인
if ! command -v node &> /dev/null; then
    log_error "Node.js가 설치되지 않았습니다."
    exit 1
fi

# pnpm 확인
if ! command -v pnpm &> /dev/null; then
    log_error "pnpm이 설치되지 않았습니다."
    exit 1
fi

# 환경변수 확인
if [ -z "$DATABASE_URL" ] && [ -z "$TEST_DATABASE_URL" ]; then
    log_warning "데이터베이스 URL이 설정되지 않았습니다."
fi

log_success "환경 설정 확인 완료"

# 의존성 설치
log_info "의존성 설치 중..."
pnpm install --frozen-lockfile
log_success "의존성 설치 완료"

# 1. 단위 테스트
echo ""
echo "📋 1. 단위 테스트 실행"
echo "----------------------"
log_info "단위 테스트 시작..."

if pnpm run test:unit; then
    log_success "단위 테스트 통과"
    UNIT_TEST_RESULT=1
else
    log_error "단위 테스트 실패"
    UNIT_TEST_RESULT=0
fi

# 2. 통합 테스트
echo ""
echo "🔗 2. 통합 테스트 실행"
echo "----------------------"
log_info "통합 테스트 시작..."

if pnpm run test:integration; then
    log_success "통합 테스트 통과"
    INTEGRATION_TEST_RESULT=1
else
    log_error "통합 테스트 실패"
    INTEGRATION_TEST_RESULT=0
fi

# 3. 보안 테스트
echo ""
echo "🛡️ 3. 보안 테스트 실행"
echo "----------------------"
log_info "보안 테스트 시작..."

if pnpm run test:security; then
    log_success "보안 테스트 통과"
    SECURITY_TEST_RESULT=1
else
    log_error "보안 테스트 실패"
    SECURITY_TEST_RESULT=0
fi

# 4. E2E 테스트
echo ""
echo "🌐 4. E2E 테스트 실행"
echo "---------------------"
log_info "E2E 테스트 시작..."

# Playwright 브라우저 설치 확인
if ! pnpm exec playwright install-deps && pnpm exec playwright install; then
    log_warning "Playwright 브라우저 설치 실패, E2E 테스트 건너뜀"
    E2E_TEST_RESULT=0
else
    if pnpm run test:e2e; then
        log_success "E2E 테스트 통과"
        E2E_TEST_RESULT=1
    else
        log_error "E2E 테스트 실패"
        E2E_TEST_RESULT=0
    fi
fi

# 5. 성능 테스트
echo ""
echo "⚡ 5. 성능 테스트 실행"
echo "---------------------"
log_info "성능 테스트 시작..."

# 서버가 실행 중인지 확인
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    if pnpm run benchmark; then
        log_success "성능 테스트 통과"
        PERFORMANCE_TEST_RESULT=1
    else
        log_error "성능 테스트 실패"
        PERFORMANCE_TEST_RESULT=0
    fi
else
    log_warning "개발 서버가 실행되지 않아 성능 테스트 건너뜀"
    PERFORMANCE_TEST_RESULT=0
fi

# 6. 커버리지 리포트 생성
echo ""
echo "📊 6. 커버리지 리포트 생성"
echo "--------------------------"
log_info "커버리지 리포트 생성 중..."

if pnpm run test:coverage; then
    log_success "커버리지 리포트 생성 완료"
    if [ -f "coverage/lcov-report/index.html" ]; then
        log_info "커버리지 리포트: coverage/lcov-report/index.html"
    fi
else
    log_warning "커버리지 리포트 생성 실패"
fi

# 7. 린팅 및 타입 체크
echo ""
echo "🔍 7. 코드 품질 검사"
echo "--------------------"
log_info "린팅 및 타입 체크 중..."

if pnpm run lint && pnpm run type-check; then
    log_success "코드 품질 검사 통과"
else
    log_error "코드 품질 검사 실패"
fi

# 테스트 결과 요약
echo ""
echo "📈 테스트 결과 요약"
echo "=================="

# 종료 시간 기록
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "실행 시간: ${DURATION}초"
echo ""

# 테스트 결과 출력
if [ $UNIT_TEST_RESULT -eq 1 ]; then
    echo -e "✅ 단위 테스트: ${GREEN}통과${NC}"
else
    echo -e "❌ 단위 테스트: ${RED}실패${NC}"
fi

if [ $INTEGRATION_TEST_RESULT -eq 1 ]; then
    echo -e "✅ 통합 테스트: ${GREEN}통과${NC}"
else
    echo -e "❌ 통합 테스트: ${RED}실패${NC}"
fi

if [ $SECURITY_TEST_RESULT -eq 1 ]; then
    echo -e "✅ 보안 테스트: ${GREEN}통과${NC}"
else
    echo -e "❌ 보안 테스트: ${RED}실패${NC}"
fi

if [ $E2E_TEST_RESULT -eq 1 ]; then
    echo -e "✅ E2E 테스트: ${GREEN}통과${NC}"
elif [ $E2E_TEST_RESULT -eq 0 ]; then
    echo -e "❌ E2E 테스트: ${RED}실패${NC}"
fi

if [ $PERFORMANCE_TEST_RESULT -eq 1 ]; then
    echo -e "✅ 성능 테스트: ${GREEN}통과${NC}"
elif [ $PERFORMANCE_TEST_RESULT -eq 0 ]; then
    echo -e "❌ 성능 테스트: ${RED}실패${NC}"
fi

# 전체 성공률 계산
TOTAL_TESTS=5
PASSED_TESTS=$((UNIT_TEST_RESULT + INTEGRATION_TEST_RESULT + SECURITY_TEST_RESULT + E2E_TEST_RESULT + PERFORMANCE_TEST_RESULT))
SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo ""
echo "전체 성공률: ${SUCCESS_RATE}% (${PASSED_TESTS}/${TOTAL_TESTS})"

# 최종 결과 판정
if [ $SUCCESS_RATE -eq 100 ]; then
    echo -e "${GREEN}🎉 모든 테스트가 성공적으로 완료되었습니다!${NC}"
    echo -e "${GREEN}Phase 9: 테스트 및 최적화 단계가 완료되었습니다.${NC}"
    exit 0
elif [ $SUCCESS_RATE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  대부분의 테스트가 통과했지만 일부 실패가 있습니다.${NC}"
    exit 1
else
    echo -e "${RED}❌ 많은 테스트가 실패했습니다. 코드를 검토해주세요.${NC}"
    exit 1
fi