#!/bin/bash

# 전체 테스트 실행 스크립트
# Phase 9: 테스트 및 최적화 완료

set -e

echo "🚀 Phase 9: 테스트 및 최적화 시작"
echo "=================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 에러 카운터
ERROR_COUNT=0

# 함수: 에러 처리
handle_error() {
    echo -e "${RED}❌ 에러 발생: $1${NC}"
    ERROR_COUNT=$((ERROR_COUNT + 1))
}

# 함수: 성공 메시지
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 함수: 정보 메시지
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 함수: 경고 메시지
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. 환경 변수 확인
print_info "환경 변수 확인 중..."
if [ -z "$NODE_ENV" ]; then
    export NODE_ENV=test
    print_warning "NODE_ENV가 설정되지 않아 'test'로 설정합니다."
fi

# 2. 의존성 설치
print_info "의존성 설치 중..."
if ! pnpm install --frozen-lockfile; then
    handle_error "의존성 설치 실패"
    exit 1
fi
print_success "의존성 설치 완료"

# 3. TypeScript 컴파일 검사
print_info "TypeScript 컴파일 검사 중..."
if ! pnpm run type-check; then
    handle_error "TypeScript 컴파일 에러 발견"
    exit 1
fi
print_success "TypeScript 컴파일 검사 통과"

# 4. ESLint 검사
print_info "ESLint 검사 중..."
if ! pnpm run lint; then
    handle_error "ESLint 에러 발견"
    exit 1
fi
print_success "ESLint 검사 통과"

# 5. 단위 테스트 실행
print_info "단위 테스트 실행 중..."
if ! pnpm run test:unit; then
    handle_error "단위 테스트 실패"
    exit 1
fi
print_success "단위 테스트 통과"

# 6. 통합 테스트 실행
print_info "통합 테스트 실행 중..."
if ! pnpm run test:integration; then
    handle_error "통합 테스트 실패"
    exit 1
fi
print_success "통합 테스트 통과"

# 7. E2E 테스트 실행
print_info "E2E 테스트 실행 중..."
if ! pnpm run test:e2e; then
    handle_error "E2E 테스트 실패"
    exit 1
fi
print_success "E2E 테스트 통과"

# 8. 보안 테스트 실행
print_info "보안 테스트 실행 중..."
if ! pnpm run test:security; then
    handle_error "보안 테스트 실패"
    exit 1
fi
print_success "보안 테스트 통과"

# 9. 성능 테스트 실행
print_info "성능 테스트 실행 중..."
if ! pnpm run test:performance; then
    handle_error "성능 테스트 실패"
    exit 1
fi
print_success "성능 테스트 통과"

# 10. 빌드 테스트
print_info "빌드 테스트 중..."
if ! pnpm run build; then
    handle_error "빌드 실패"
    exit 1
fi
print_success "빌드 성공"

# 11. 테스트 커버리지 생성
print_info "테스트 커버리지 생성 중..."
if ! pnpm run test:coverage; then
    handle_error "테스트 커버리지 생성 실패"
    exit 1
fi
print_success "테스트 커버리지 생성 완료"

# 12. 보안 스캔 실행
print_info "보안 스캔 실행 중..."
if ! pnpm run security:scan; then
    handle_error "보안 스캔 실패"
    exit 1
fi
print_success "보안 스캔 완료"

# 13. 성능 벤치마크 실행
print_info "성능 벤치마크 실행 중..."
if ! pnpm run benchmark; then
    handle_error "성능 벤치마크 실패"
    exit 1
fi
print_success "성능 벤치마크 완료"

# 14. 최종 결과 출력
echo ""
echo "=================================="
echo "🎉 Phase 9: 테스트 및 최적화 완료"
echo "=================================="

if [ $ERROR_COUNT -eq 0 ]; then
    print_success "모든 테스트가 성공적으로 완료되었습니다!"
    echo ""
    echo "📊 테스트 결과 요약:"
    echo "  - 단위 테스트: ✅ 통과"
    echo "  - 통합 테스트: ✅ 통과"
    echo "  - E2E 테스트: ✅ 통과"
    echo "  - 보안 테스트: ✅ 통과"
    echo "  - 성능 테스트: ✅ 통과"
    echo "  - 빌드 테스트: ✅ 통과"
    echo "  - 보안 스캔: ✅ 통과"
    echo "  - 성능 벤치마크: ✅ 통과"
    echo ""
    echo "🚀 프로덕션 배포 준비 완료!"
    exit 0
else
    print_warning "$ERROR_COUNT 개의 에러가 발생했습니다."
    echo ""
    echo "❌ 다음 사항을 확인해주세요:"
    echo "  - 테스트 실패 원인 분석"
    echo "  - 코드 품질 개선"
    echo "  - 보안 취약점 해결"
    echo "  - 성능 최적화"
    exit 1
fi
