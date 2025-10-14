/**
 * Phase 3 API 테스트 스크립트
 * 
 * @description
 * - 배지 관련 API 엔드포인트 테스트
 * - 답변 채택 API 테스트
 * - 관리자 API 테스트
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// 테스트용 사용자 ID (실제 데이터베이스에서 가져와야 함)
const TEST_USER_ID = 'test-user-id';
const TEST_ANSWER_ID = 'test-answer-id';
const TEST_QUESTION_ID = 'test-question-id';

/**
 * API 테스트 헬퍼 함수
 */
class ApiTester {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * GET 요청 테스트
   */
  async testGet(endpoint: string, description: string) {
    try {
      console.log(`\n🧪 테스트: ${description}`);
      console.log(`📍 엔드포인트: GET ${endpoint}`);
      
      const response = await axios.get(`${this.baseURL}${endpoint}`);
      
      console.log(`✅ 성공: ${response.status}`);
      console.log(`📊 응답 데이터:`, JSON.stringify(response.data, null, 2));
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.log(`❌ 실패: ${error.response?.status || '네트워크 오류'}`);
      console.log(`📝 오류 메시지:`, error.response?.data || error.message);
      
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * POST 요청 테스트
   */
  async testPost(endpoint: string, data: any, description: string) {
    try {
      console.log(`\n🧪 테스트: ${description}`);
      console.log(`📍 엔드포인트: POST ${endpoint}`);
      console.log(`📤 요청 데이터:`, JSON.stringify(data, null, 2));
      
      const response = await axios.post(`${this.baseURL}${endpoint}`, data);
      
      console.log(`✅ 성공: ${response.status}`);
      console.log(`📊 응답 데이터:`, JSON.stringify(response.data, null, 2));
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.log(`❌ 실패: ${error.response?.status || '네트워크 오류'}`);
      console.log(`📝 오류 메시지:`, error.response?.data || error.message);
      
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * DELETE 요청 테스트
   */
  async testDelete(endpoint: string, description: string) {
    try {
      console.log(`\n🧪 테스트: ${description}`);
      console.log(`📍 엔드포인트: DELETE ${endpoint}`);
      
      const response = await axios.delete(`${this.baseURL}${endpoint}`);
      
      console.log(`✅ 성공: ${response.status}`);
      console.log(`📊 응답 데이터:`, JSON.stringify(response.data, null, 2));
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.log(`❌ 실패: ${error.response?.status || '네트워크 오류'}`);
      console.log(`📝 오류 메시지:`, error.response?.data || error.message);
      
      return { success: false, error: error.response?.data || error.message };
    }
  }
}

/**
 * 배지 API 테스트
 */
async function testBadgeApis() {
  console.log('\n🏆 ===== 배지 API 테스트 시작 =====');
  
  const tester = new ApiTester(API_BASE_URL);

  // 1. 전체 배지 목록 조회
  await tester.testGet('/badges', '전체 배지 목록 조회');

  // 2. 카테고리별 배지 목록 조회
  await tester.testGet('/badges?category=RESTAURANT', '맛집 카테고리 배지 목록 조회');

  // 3. 특정 사용자 배지 조회
  await tester.testGet(`/badges/users/${TEST_USER_ID}`, '특정 사용자 배지 조회');

  // 4. 특정 사용자 배지 진행률 조회
  await tester.testGet(`/badges/users/${TEST_USER_ID}/progress`, '특정 사용자 배지 진행률 조회');

  // 5. 내 배지 목록 조회 (인증 필요 - 실패 예상)
  await tester.testGet('/badges/me', '내 배지 목록 조회 (인증 없음)');

  // 6. 배지 통계 조회 (인증 필요 - 실패 예상)
  await tester.testGet('/badges/stats', '배지 통계 조회 (인증 없음)');
}

/**
 * 답변 채택 API 테스트
 */
async function testAnswerAdoptionApis() {
  console.log('\n✅ ===== 답변 채택 API 테스트 시작 =====');
  
  const tester = new ApiTester(API_BASE_URL);

  // 1. 답변 채택 (인증 필요 - 실패 예상)
  await tester.testPost(
    `/answers/${TEST_ANSWER_ID}/adopt`,
    { questionId: TEST_QUESTION_ID },
    '답변 채택 (인증 없음)'
  );

  // 2. 답변 채택 취소 (인증 필요 - 실패 예상)
  await tester.testDelete(
    `/answers/${TEST_ANSWER_ID}/adopt`,
    '답변 채택 취소 (인증 없음)'
  );

  // 3. 질문의 채택 상태 조회
  await tester.testGet(`/answer-adoption/${TEST_QUESTION_ID}/status`, '질문의 채택 상태 조회');

  // 4. 사용자별 채택 통계 조회 (인증 필요 - 실패 예상)
  await tester.testGet(`/answer-adoption/user/${TEST_USER_ID}/stats`, '사용자별 채택 통계 조회 (인증 없음)');
}

/**
 * 관리자 API 테스트
 */
async function testAdminApis() {
  console.log('\n👑 ===== 관리자 API 테스트 시작 =====');
  
  const tester = new ApiTester(API_BASE_URL);

  // 1. 배지 계산 수동 실행 (인증 필요 - 실패 예상)
  await tester.testPost(
    '/admin/badges/calculate',
    {},
    '배지 계산 수동 실행 (인증 없음)'
  );

  // 2. 특정 사용자 배지 계산 (인증 필요 - 실패 예상)
  await tester.testPost(
    '/admin/badges/calculate',
    { userId: TEST_USER_ID },
    '특정 사용자 배지 계산 (인증 없음)'
  );

  // 3. 배지 통계 조회 (인증 필요 - 실패 예상)
  await tester.testGet('/admin/badges/stats', '배지 통계 조회 (인증 없음)');

  // 4. 관리자 대시보드 통계 조회 (인증 필요 - 실패 예상)
  await tester.testGet('/admin/dashboard', '관리자 대시보드 통계 조회 (인증 없음)');
}

/**
 * 헬스 체크 테스트
 */
async function testHealthCheck() {
  console.log('\n❤️ ===== 헬스 체크 테스트 시작 =====');
  
  const tester = new ApiTester(API_BASE_URL);

  // 1. 기본 헬스 체크
  await tester.testGet('/health', '기본 헬스 체크');

  // 2. API 루트
  await tester.testGet('', 'API 루트');
}

/**
 * 메인 테스트 실행 함수
 */
async function runAllTests() {
  console.log('🚀 Phase 3 API 테스트 시작');
  console.log(`🌐 API 서버: ${API_BASE_URL}`);
  console.log('=' .repeat(50));

  try {
    // 헬스 체크 먼저 실행
    await testHealthCheck();

    // 각 API 그룹별 테스트 실행
    await testBadgeApis();
    await testAnswerAdoptionApis();
    await testAdminApis();

    console.log('\n🎉 ===== 모든 테스트 완료 =====');
    console.log('📝 참고: 인증이 필요한 API는 실패가 예상됩니다.');
    console.log('🔐 실제 테스트를 위해서는 유효한 JWT 토큰이 필요합니다.');

  } catch (error) {
    console.error('\n💥 테스트 실행 중 오류 발생:', error);
  }
}

// 테스트 실행
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { ApiTester, runAllTests };
