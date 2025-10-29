const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log('🌱 테스트 데이터 시딩 시작...\n');

    // 1. 모든 카테고리 조회
    console.log('📂 카테고리 조회 중...');
    const categories = await prisma.category.findMany();
    console.log(`✅ 카테고리 ${categories.length}개 조회 완료\n`);

    // 2. 사용자 조회
    console.log('👥 사용자 조회 중...');
    const users = await prisma.user.findMany({ take: 5 });
    console.log(`✅ 사용자 ${users.length}개 조회 완료\n`);

    if (users.length === 0 || categories.length === 0) {
      console.log('❌ 사용자 또는 카테고리가 없습니다.');
      await prisma.$disconnect();
      return;
    }

    // 3. 질문 생성
    console.log('❓ 질문 생성 중...');
    const questionsToCreate = [
      { title: '제주도에서 꼭 먹어야 할 음식은 뭔가요?', content: '제주도 여행에서 놓치면 안 되는 대표 음식들을 추천해주세요!', categoryId: categories[0].id, authorId: users[0].id, status: 'ACTIVE', viewCount: 125 },
      { title: '한라산 등산 코스 추천해주세요', content: '가족과 함께 할 수 있는 한라산 등산 코스가 있나요?', categoryId: categories[3].id, authorId: users[1].id, status: 'ACTIVE', viewCount: 234 },
      { title: '렌터카 추천 부탁드립니다', content: '제주도 렌터카 어디가 저렴하고 좋을까요?', categoryId: categories[4].id, authorId: users[2].id, status: 'CLOSED', viewCount: 456 },
      { title: '서귀포시 맛집 어디가 좋나요?', content: '서귀포시에서 식사할 곳을 찾고 있어요.', categoryId: categories[0].id, authorId: users[3].id, status: 'ACTIVE', viewCount: 89 },
      { title: '제주도 날씨가 어떻게 되나요?', content: '내주에 제주도 여행 가는데 날씨 정보 알려주세요.', categoryId: categories[3].id, authorId: users[4].id, status: 'ACTIVE', viewCount: 567 },
      { title: '제주도 숙박 추천', content: '저렴하면서도 깨끗한 숙박지 추천해주세요.', categoryId: categories[2].id, authorId: users[0].id, status: 'ACTIVE', viewCount: 234 },
      { title: '제주도 쇼핑은 어디서?', content: '기념품 살 만한 좋은 쇼핑 장소가 있을까요?', categoryId: categories[1].id, authorId: users[1].id, status: 'ACTIVE', viewCount: 145 },
      { title: '오설록 티뮤지엄 가는 길', content: '오설록 티뮤지엄 찾아가는 방법 좀 알려주세요.', categoryId: categories[3].id, authorId: users[2].id, status: 'ACTIVE', viewCount: 98 },
      { title: '제주도 카페 추천해주세요', content: '분위기 좋은 카페를 찾고 있어요.', categoryId: categories[0].id, authorId: users[3].id, status: 'ACTIVE', viewCount: 312 },
      { title: '돌하르방이 뭔가요?', content: '제주도에서 자주 보는 돌하르방의 의미가 뭘까요?', categoryId: categories[3].id, authorId: users[4].id, status: 'CLOSED', viewCount: 423 },
    ];

    const createdQuestions = [];
    for (const q of questionsToCreate) {
      try {
        const question = await prisma.question.create({ data: q });
        createdQuestions.push(question);
        console.log(`  ✅ "${question.title}"`);
      } catch (e) {
        console.error(`  ❌ 실패: ${e.message}`);
      }
    }
    console.log(`\n✅ 총 ${createdQuestions.length}개 질문 생성 완료\n`);

    console.log('🎉 테스트 데이터 시딩 완료!\n');
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
