// Node.js 내장 fetch 사용

const API_BASE = 'http://localhost:4000/api';

// 테스트 사용자 데이터
const testUsers = [
  { email: 'test1@jeju.com', name: '김제주', nickname: '제주킹', password: 'test123!', passwordConfirm: 'test123!', agreeToTerms: true, agreeToPrivacy: true, agreeToMarketing: false },
  { email: 'test2@jeju.com', name: '이여행', nickname: '여행러버', password: 'test123!', passwordConfirm: 'test123!', agreeToTerms: true, agreeToPrivacy: true, agreeToMarketing: false },
  { email: 'test3@jeju.com', name: '박맛집', nickname: '맛집헌터', password: 'test123!', passwordConfirm: 'test123!', agreeToTerms: true, agreeToPrivacy: true, agreeToMarketing: false },
  { email: 'test4@jeju.com', name: '최관광', nickname: '관광마스터', password: 'test123!', passwordConfirm: 'test123!', agreeToTerms: true, agreeToPrivacy: true, agreeToMarketing: false },
  { email: 'test5@jeju.com', name: '정숙박', nickname: '숙박전문가', password: 'test123!', passwordConfirm: 'test123!', agreeToTerms: true, agreeToPrivacy: true, agreeToMarketing: false },
  { email: 'test6@jeju.com', name: '한교통', nickname: '교통왕', password: 'test123!', passwordConfirm: 'test123!', agreeToTerms: true, agreeToPrivacy: true, agreeToMarketing: false },
  { email: 'test7@jeju.com', name: '서액티비티', nickname: '액티비티매니아', password: 'test123!', passwordConfirm: 'test123!', agreeToTerms: true, agreeToPrivacy: true, agreeToMarketing: false },
  { email: 'test8@jeju.com', name: '윤쇼핑', nickname: '쇼핑러', password: 'test123!', passwordConfirm: 'test123!', agreeToTerms: true, agreeToPrivacy: true, agreeToMarketing: false },
  { email: 'test9@jeju.com', name: '임문화', nickname: '문화탐험가', password: 'test123!', passwordConfirm: 'test123!', agreeToTerms: true, agreeToPrivacy: true, agreeToMarketing: false },
  { email: 'test10@jeju.com', name: '조자연', nickname: '자연사랑', password: 'test123!', passwordConfirm: 'test123!', agreeToTerms: true, agreeToPrivacy: true, agreeToMarketing: false }
];

// 카테고리 데이터
const categories = [
  { name: '맛집', description: '제주도 맛집 추천 및 후기' },
  { name: '관광지', description: '제주도 관광지 정보 및 추천' },
  { name: '숙박', description: '제주도 숙박시설 및 호텔 정보' },
  { name: '교통', description: '제주도 교통편 및 이동 방법' },
  { name: '액티비티', description: '제주도 체험활동 및 액티비티' },
  { name: '쇼핑', description: '제주도 쇼핑몰 및 기념품' },
  { name: '문화', description: '제주도 문화유산 및 역사' },
  { name: '자연', description: '제주도 자연경관 및 힐링' },
  { name: '일반', description: '기타 제주도 관련 질문' }
];

// 질문 데이터 (카테고리별로 분배)
const questions = [
  // 맛집 카테고리 (15개)
  { title: '제주도에서 꼭 먹어야 할 음식은 뭔가요?', content: '제주도 여행에서 놓치면 안 되는 대표 음식들을 추천해주세요!', category: '맛집' },
  { title: '제주시 근처 맛집 추천해주세요', content: '제주시에서 가볼 만한 맛집이 있나요? 가격대는 상관없어요.', category: '맛집' },
  { title: '서귀포시 맛집 어디가 좋나요?', content: '서귀포시에서 식사할 곳을 찾고 있어요. 현지인들이 많이 가는 곳 알려주세요.', category: '맛집' },
  { title: '제주도 흑돼지 맛집 추천', content: '제주도 흑돼지를 맛볼 수 있는 맛집을 찾고 있어요. 예약 필수인가요?', category: '맛집' },
  { title: '제주도 해산물 맛집 어디가 좋나요?', content: '신선한 해산물을 맛볼 수 있는 곳을 추천해주세요.', category: '맛집' },
  { title: '제주도 카페 추천해주세요', content: '제주도에서 예쁜 카페나 맛있는 카페를 찾고 있어요.', category: '맛집' },
  { title: '제주도 전통음식 맛집', content: '제주도 전통음식을 맛볼 수 있는 곳이 있나요?', category: '맛집' },
  { title: '제주도 야식 맛집 추천', content: '밤에 먹을 수 있는 야식 맛집이 있나요?', category: '맛집' },
  { title: '제주도 디저트 맛집', content: '제주도에서 맛있는 디저트를 먹을 수 있는 곳을 알려주세요.', category: '맛집' },
  { title: '제주도 한정식 맛집', content: '제주도 한정식을 맛볼 수 있는 곳을 추천해주세요.', category: '맛집' },
  { title: '제주도 치킨 맛집', content: '제주도에서 맛있는 치킨집이 있나요?', category: '맛집' },
  { title: '제주도 피자 맛집', content: '제주도에서 맛있는 피자를 먹을 수 있는 곳을 알려주세요.', category: '맛집' },
  { title: '제주도 파스타 맛집', content: '제주도에서 맛있는 파스타를 먹을 수 있는 곳이 있나요?', category: '맛집' },
  { title: '제주도 일식 맛집', content: '제주도에서 맛있는 일식을 먹을 수 있는 곳을 추천해주세요.', category: '맛집' },
  { title: '제주도 중식 맛집', content: '제주도에서 맛있는 중식을 먹을 수 있는 곳이 있나요?', category: '맛집' },

  // 관광지 카테고리 (15개)
  { title: '제주도 필수 관광지 추천', content: '제주도에서 꼭 가봐야 할 관광지를 추천해주세요.', category: '관광지' },
  { title: '제주도 한라산 등반 코스', content: '한라산 등반을 계획하고 있어요. 추천 코스가 있나요?', category: '관광지' },
  { title: '제주도 성산일출봉 관람 팁', content: '성산일출봉에서 일출을 보려고 해요. 팁이 있나요?', category: '관광지' },
  { title: '제주도 만장굴 관람 정보', content: '만장굴을 가볼 예정인데 미리 알아야 할 것이 있나요?', category: '관광지' },
  { title: '제주도 성읍민속마을 관람', content: '성읍민속마을에서 볼거리가 있나요?', category: '관광지' },
  { title: '제주도 중문관광단지 추천', content: '중문관광단지에서 가볼 만한 곳이 있나요?', category: '관광지' },
  { title: '제주도 제주올레길 추천', content: '제주올레길 중에서 추천하는 코스가 있나요?', category: '관광지' },
  { title: '제주도 박물관 추천', content: '제주도에서 가볼 만한 박물관이 있나요?', category: '관광지' },
  { title: '제주도 미술관 추천', content: '제주도에서 가볼 만한 미술관이나 갤러리가 있나요?', category: '관광지' },
  { title: '제주도 아쿠아리움 추천', content: '제주도에서 가볼 만한 아쿠아리움이 있나요?', category: '관광지' },
  { title: '제주도 테마파크 추천', content: '제주도에서 가볼 만한 테마파크가 있나요?', category: '관광지' },
  { title: '제주도 해변 추천', content: '제주도에서 아름다운 해변을 추천해주세요.', category: '관광지' },
  { title: '제주도 폭포 관람', content: '제주도에서 볼 수 있는 폭포가 있나요?', category: '관광지' },
  { title: '제주도 동굴 관람', content: '제주도에서 가볼 만한 동굴이 있나요?', category: '관광지' },
  { title: '제주도 전망대 추천', content: '제주도에서 아름다운 전망을 볼 수 있는 전망대를 추천해주세요.', category: '관광지' },

  // 숙박 카테고리 (12개)
  { title: '제주도 호텔 추천', content: '제주도에서 좋은 호텔을 추천해주세요.', category: '숙박' },
  { title: '제주도 펜션 추천', content: '제주도에서 좋은 펜션을 찾고 있어요.', category: '숙박' },
  { title: '제주도 게스트하우스 추천', content: '제주도에서 가성비 좋은 게스트하우스를 추천해주세요.', category: '숙박' },
  { title: '제주도 리조트 추천', content: '제주도에서 좋은 리조트를 추천해주세요.', category: '숙박' },
  { title: '제주도 민박 추천', content: '제주도에서 현지인 민박을 체험하고 싶어요.', category: '숙박' },
  { title: '제주도 캠핑장 추천', content: '제주도에서 캠핑할 수 있는 곳을 추천해주세요.', category: '숙박' },
  { title: '제주도 해변 근처 숙박', content: '해변 근처에서 숙박할 수 있는 곳을 추천해주세요.', category: '숙박' },
  { title: '제주도 공항 근처 숙박', content: '공항 근처에서 숙박할 수 있는 곳을 추천해주세요.', category: '숙박' },
  { title: '제주도 시내 숙박', content: '제주시 시내에서 숙박할 수 있는 곳을 추천해주세요.', category: '숙박' },
  { title: '제주도 서귀포 숙박', content: '서귀포시에서 숙박할 수 있는 곳을 추천해주세요.', category: '숙박' },
  { title: '제주도 가족 숙박', content: '가족 여행에 적합한 숙박시설을 추천해주세요.', category: '숙박' },
  { title: '제주도 커플 숙박', content: '커플 여행에 적합한 숙박시설을 추천해주세요.', category: '숙박' },

  // 교통 카테고리 (10개)
  { title: '제주도 렌터카 추천', content: '제주도에서 렌터카를 빌리고 싶어요. 추천 업체가 있나요?', category: '교통' },
  { title: '제주도 대중교통 이용법', content: '제주도 대중교통을 이용하는 방법을 알려주세요.', category: '교통' },
  { title: '제주도 택시 요금', content: '제주도 택시 요금이 어떻게 되나요?', category: '교통' },
  { title: '제주도 버스 이용법', content: '제주도 버스를 이용하는 방법을 알려주세요.', category: '교통' },
  { title: '제주도 자전거 대여', content: '제주도에서 자전거를 대여할 수 있는 곳이 있나요?', category: '교통' },
  { title: '제주도 스쿠터 대여', content: '제주도에서 스쿠터를 대여할 수 있는 곳이 있나요?', category: '교통' },
  { title: '제주도 관광버스', content: '제주도 관광버스를 이용하는 방법을 알려주세요.', category: '교통' },
  { title: '제주도 공항 이동', content: '제주공항에서 시내로 이동하는 방법을 알려주세요.', category: '교통' },
  { title: '제주도 항구 이동', content: '제주도 항구에서 시내로 이동하는 방법을 알려주세요.', category: '교통' },
  { title: '제주도 주차 정보', content: '제주도에서 주차할 수 있는 곳을 알려주세요.', category: '교통' },

  // 액티비티 카테고리 (12개)
  { title: '제주도 서핑 추천', content: '제주도에서 서핑을 배울 수 있는 곳이 있나요?', category: '액티비티' },
  { title: '제주도 다이빙 추천', content: '제주도에서 다이빙을 할 수 있는 곳을 추천해주세요.', category: '액티비티' },
  { title: '제주도 패러글라이딩', content: '제주도에서 패러글라이딩을 할 수 있는 곳이 있나요?', category: '액티비티' },
  { title: '제주도 승마 체험', content: '제주도에서 승마를 체험할 수 있는 곳이 있나요?', category: '액티비티' },
  { title: '제주도 골프장 추천', content: '제주도에서 골프를 칠 수 있는 곳을 추천해주세요.', category: '액티비티' },
  { title: '제주도 카약 체험', content: '제주도에서 카약을 체험할 수 있는 곳이 있나요?', category: '액티비티' },
  { title: '제주도 ATV 체험', content: '제주도에서 ATV를 체험할 수 있는 곳이 있나요?', category: '액티비티' },
  { title: '제주도 낚시 체험', content: '제주도에서 낚시를 할 수 있는 곳을 추천해주세요.', category: '액티비티' },
  { title: '제주도 요트 체험', content: '제주도에서 요트를 체험할 수 있는 곳이 있나요?', category: '액티비티' },
  { title: '제주도 스카이워킹', content: '제주도에서 스카이워킹을 할 수 있는 곳이 있나요?', category: '액티비티' },
  { title: '제주도 바이킹 체험', content: '제주도에서 바이킹을 체험할 수 있는 곳이 있나요?', category: '액티비티' },
  { title: '제주도 힐링 체험', content: '제주도에서 힐링할 수 있는 체험을 추천해주세요.', category: '액티비티' },

  // 쇼핑 카테고리 (10개)
  { title: '제주도 기념품 추천', content: '제주도에서 사갈 만한 기념품을 추천해주세요.', category: '쇼핑' },
  { title: '제주도 쇼핑몰 추천', content: '제주도에서 쇼핑할 수 있는 곳을 추천해주세요.', category: '쇼핑' },
  { title: '제주도 시장 추천', content: '제주도에서 가볼 만한 시장을 추천해주세요.', category: '쇼핑' },
  { title: '제주도 면세점 추천', content: '제주도에서 면세점 쇼핑을 할 수 있는 곳이 있나요?', category: '쇼핑' },
  { title: '제주도 로컬 브랜드', content: '제주도 로컬 브랜드 상품을 구매할 수 있는 곳이 있나요?', category: '쇼핑' },
  { title: '제주도 한정 상품', content: '제주도에서만 살 수 있는 한정 상품이 있나요?', category: '쇼핑' },
  { title: '제주도 전통 공예품', content: '제주도 전통 공예품을 구매할 수 있는 곳이 있나요?', category: '쇼핑' },
  { title: '제주도 식품 쇼핑', content: '제주도에서 사갈 만한 식품을 추천해주세요.', category: '쇼핑' },
  { title: '제주도 의류 쇼핑', content: '제주도에서 의류를 쇼핑할 수 있는 곳이 있나요?', category: '쇼핑' },
  { title: '제주도 액세서리 쇼핑', content: '제주도에서 액세서리를 쇼핑할 수 있는 곳이 있나요?', category: '쇼핑' },

  // 문화 카테고리 (8개)
  { title: '제주도 문화유산 추천', content: '제주도에서 가볼 만한 문화유산을 추천해주세요.', category: '문화' },
  { title: '제주도 전통문화 체험', content: '제주도 전통문화를 체험할 수 있는 곳이 있나요?', category: '문화' },
  { title: '제주도 역사 유적지', content: '제주도에서 가볼 만한 역사 유적지가 있나요?', category: '문화' },
  { title: '제주도 축제 정보', content: '제주도에서 열리는 축제 정보를 알려주세요.', category: '문화' },
  { title: '제주도 공연장 추천', content: '제주도에서 공연을 볼 수 있는 곳을 추천해주세요.', category: '문화' },
  { title: '제주도 전통 공연', content: '제주도 전통 공연을 볼 수 있는 곳이 있나요?', category: '문화' },
  { title: '제주도 문화센터', content: '제주도에서 문화 활동을 할 수 있는 곳이 있나요?', category: '문화' },
  { title: '제주도 전통 마을', content: '제주도 전통 마을을 둘러볼 수 있는 곳을 추천해주세요.', category: '문화' },

  // 자연 카테고리 (8개)
  { title: '제주도 자연경관 추천', content: '제주도에서 아름다운 자연경관을 추천해주세요.', category: '자연' },
  { title: '제주도 힐링 명소', content: '제주도에서 힐링할 수 있는 명소를 추천해주세요.', category: '자연' },
  { title: '제주도 등산 코스', content: '제주도에서 등산할 수 있는 코스를 추천해주세요.', category: '자연' },
  { title: '제주도 트레킹 코스', content: '제주도에서 트레킹할 수 있는 코스를 추천해주세요.', category: '자연' },
  { title: '제주도 야생화 관찰', content: '제주도에서 야생화를 관찰할 수 있는 곳이 있나요?', category: '자연' },
  { title: '제주도 새 관찰', content: '제주도에서 새를 관찰할 수 있는 곳이 있나요?', category: '자연' },
  { title: '제주도 별 관찰', content: '제주도에서 별을 관찰할 수 있는 곳이 있나요?', category: '자연' },
  { title: '제주도 일몰 명소', content: '제주도에서 아름다운 일몰을 볼 수 있는 곳을 추천해주세요.', category: '자연' },

  // 일반 카테고리 (10개)
  { title: '제주도 여행 팁', content: '제주도 여행을 위한 유용한 팁을 알려주세요.', category: '일반' },
  { title: '제주도 날씨 정보', content: '제주도 날씨는 어떤가요? 언제 가는 게 좋나요?', category: '일반' },
  { title: '제주도 여행 준비물', content: '제주도 여행을 위해 준비해야 할 물건이 있나요?', category: '일반' },
  { title: '제주도 여행 경비', content: '제주도 여행 경비는 얼마나 들까요?', category: '일반' },
  { title: '제주도 여행 일정', content: '제주도 여행 일정을 어떻게 짜면 좋을까요?', category: '일반' },
  { title: '제주도 현지인 추천', content: '제주도 현지인이 추천하는 곳이 있나요?', category: '일반' },
  { title: '제주도 숨은 명소', content: '제주도에서 알려지지 않은 숨은 명소가 있나요?', category: '일반' },
  { title: '제주도 여행 주의사항', content: '제주도 여행 시 주의해야 할 사항이 있나요?', category: '일반' },
  { title: '제주도 언어 정보', content: '제주도에서 사용하는 언어나 방언이 있나요?', category: '일반' },
  { title: '제주도 여행 동반자', content: '제주도 여행을 함께할 동반자를 찾고 있어요.', category: '일반' }
];

async function createCategories() {
  console.log('📂 카테고리 확인 중...');
  
  try {
    // 기존 카테고리 조회
    const response = await fetch(`${API_BASE}/categories`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ 기존 카테고리 ${data.data.length}개 확인됨`);
      return data.data;
    } else {
      console.log('❌ 카테고리 조회 실패');
      return [];
    }
  } catch (error) {
    console.log('❌ 카테고리 조회 에러:', error.message);
    return [];
  }
}

async function createUsers() {
  console.log('👥 사용자 생성 중...');
  const createdUsers = [];
  
  for (const user of testUsers) {
    try {
      const response = await fetch(`${API_BASE}/auth/email/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      
      if (response.ok) {
        const data = await response.json();
        createdUsers.push(data.data.user);
        console.log(`✅ 사용자 생성: ${user.name} (${user.email})`);
      } else if (response.status === 410) {
        // 이미 존재하는 사용자 - 기존 사용자 정보로 추가
        console.log(`⚠️ 사용자 이미 존재: ${user.name} (${user.email}) - 기존 사용자로 추가`);
        createdUsers.push({
          id: `existing-${user.email}`,
          email: user.email,
          name: user.name,
          nickname: user.nickname
        });
      } else {
        console.log(`❌ 사용자 생성 실패: ${user.name}`);
      }
    } catch (error) {
      console.log(`❌ 사용자 생성 에러: ${user.name}`, error.message);
    }
  }
  
  return createdUsers;
}

async function createQuestions(users, categories) {
  console.log('❓ 질문 생성 중...');
  let createdCount = 0;
  
  // 첫 번째 사용자로 로그인하여 토큰 획득
  if (users.length === 0) {
    console.log('❌ 사용자가 없어서 질문을 생성할 수 없습니다.');
    return 0;
  }
  
  const firstUser = users[0];
  let authToken = null;
  
  try {
    // 로그인하여 토큰 획득
    const loginResponse = await fetch(`${API_BASE}/auth/email/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: firstUser.email,
        password: 'test123!'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      authToken = loginData.data?.token || loginData.data?.accessToken;
      console.log('✅ 인증 토큰 획득 성공');
    } else {
      console.log('❌ 인증 토큰 획득 실패');
      return 0;
    }
  } catch (error) {
    console.log('❌ 로그인 에러:', error.message);
    return 0;
  }
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: question.title,
          content: question.content,
          categoryId: categories.find(cat => cat.name === question.category)?.id || null, // 카테고리 ID 사용
          tags: [question.category.toLowerCase()]
        })
      });
      
      if (response.ok) {
        createdCount++;
        console.log(`✅ 질문 생성 (${createdCount}/100): ${question.title}`);
      } else {
        const errorData = await response.json();
        console.log(`❌ 질문 생성 실패: ${question.title} - ${errorData.error || response.status}`);
      }
    } catch (error) {
      console.log(`❌ 질문 생성 에러: ${question.title}`, error.message);
    }
    
    // API 부하 방지를 위한 딜레이
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return createdCount;
}

async function main() {
  console.log('🚀 테스트 데이터 생성 시작...');
  
  try {
    // 1. 카테고리 생성
    const categories = await createCategories();
    console.log(`📂 카테고리 생성 완료: ${categories.length}개`);
    
    // 2. 사용자 생성
    const users = await createUsers();
    console.log(`👥 사용자 생성 완료: ${users.length}명`);
    
    // 3. 질문 생성
    const questionCount = await createQuestions(users, categories);
    console.log(`❓ 질문 생성 완료: ${questionCount}개`);
    
    console.log('\n🎉 테스트 데이터 생성 완료!');
    console.log('\n📋 생성된 데이터:');
    console.log(`- 카테고리: ${categories.length}개`);
    console.log(`- 사용자: ${users.length}명`);
    console.log(`- 질문: ${questionCount}개`);
    
    console.log('\n🔑 테스트 사용자 정보:');
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - 비밀번호: ${user.password}`);
    });
    
  } catch (error) {
    console.error('❌ 테스트 데이터 생성 중 오류:', error);
  }
}

main();
