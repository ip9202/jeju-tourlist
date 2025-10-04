import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. 카테고리 생성
  console.log("📁 Creating categories...");
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "관광지",
        description: "제주도의 관광지와 명소에 대한 질문",
        color: "#FF6B6B",
        icon: "map-pin",
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "맛집",
        description: "제주도의 맛집과 음식에 대한 질문",
        color: "#4ECDC4",
        icon: "utensils",
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: "숙박",
        description: "제주도의 숙박시설과 펜션에 대한 질문",
        color: "#45B7D1",
        icon: "bed",
        order: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: "교통",
        description: "제주도의 교통수단과 이동에 대한 질문",
        color: "#96CEB4",
        icon: "car",
        order: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: "쇼핑",
        description: "제주도의 쇼핑과 기념품에 대한 질문",
        color: "#FFEAA7",
        icon: "shopping-bag",
        order: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: "기타",
        description: "기타 제주도 관련 질문",
        color: "#DDA0DD",
        icon: "help-circle",
        order: 6,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // 2. 테스트 사용자 생성
  console.log("👤 Creating test users...");
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "test1@example.com",
        name: "김제주",
        nickname: "제주러버",
        provider: "kakao",
        providerId: "kakao_123456",
        bio: "제주도 여행을 사랑하는 사람입니다!",
        location: "제주시",
        isActive: true,
        isVerified: true,
        points: 100,
        level: 2,
      },
    }),
    prisma.user.create({
      data: {
        email: "test2@example.com",
        name: "이서귀포",
        nickname: "서귀포가이드",
        provider: "naver",
        providerId: "naver_789012",
        bio: "서귀포 지역 전문가입니다.",
        location: "서귀포시",
        isActive: true,
        isVerified: true,
        points: 250,
        level: 3,
      },
    }),
    prisma.user.create({
      data: {
        email: "test3@example.com",
        name: "박중문",
        nickname: "중문마스터",
        provider: "google",
        providerId: "google_345678",
        bio: "중문 관광단지 전문가",
        location: "중문",
        isActive: true,
        isVerified: true,
        points: 500,
        level: 5,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} test users`);

  // 3. 사용자 프로필 생성
  console.log("👤 Creating user profiles...");
  await Promise.all([
    prisma.userProfile.create({
      data: {
        userId: users[0].id,
        isJejuResident: true,
        jejuDistrict: "제주시",
        interests: ["관광지", "맛집", "카페"],
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
      },
    }),
    prisma.userProfile.create({
      data: {
        userId: users[1].id,
        isJejuResident: true,
        jejuDistrict: "서귀포시",
        interests: ["숙박", "교통", "액티비티"],
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: true,
      },
    }),
    prisma.userProfile.create({
      data: {
        userId: users[2].id,
        isJejuResident: false,
        jejuDistrict: "중문",
        interests: ["관광지", "쇼핑", "맛집"],
        emailNotifications: false,
        pushNotifications: true,
        marketingEmails: false,
      },
    }),
  ]);

  console.log("✅ Created user profiles");

  // 4. 테스트 질문 생성
  console.log("❓ Creating test questions...");
  const questions = await Promise.all([
    prisma.question.create({
      data: {
        title: "제주도 3박4일 여행 코스 추천해주세요!",
        content:
          "처음 제주도 여행을 가는데 3박4일 일정으로 추천해주실 수 있나요? 가족 여행이고 어린이도 있어서 아이들이 좋아할 만한 곳 위주로 알려주세요.",
        authorId: users[0].id,
        categoryId: categories[0].id,
        tags: ["여행코스", "가족여행", "3박4일", "추천"],
        location: "제주시",
        status: "ACTIVE",
        isResolved: false,
        viewCount: 45,
        likeCount: 8,
        answerCount: 3,
      },
    }),
    prisma.question.create({
      data: {
        title: "제주도 맛집 추천 부탁드려요",
        content:
          "제주도에서 꼭 가봐야 할 맛집들을 추천해주세요. 해산물 요리와 제주도 특색 있는 음식 위주로 부탁드려요!",
        authorId: users[1].id,
        categoryId: categories[1].id,
        tags: ["맛집", "해산물", "제주음식", "추천"],
        location: "서귀포시",
        status: "ACTIVE",
        isResolved: true,
        viewCount: 78,
        likeCount: 15,
        answerCount: 5,
        resolvedAt: new Date(),
      },
    }),
    prisma.question.create({
      data: {
        title: "제주도 렌터카 vs 대중교통 어떤게 좋을까요?",
        content:
          "제주도 여행에서 렌터카를 빌릴지 대중교통을 이용할지 고민입니다. 2명이서 2박3일 일정인데 어떤게 더 효율적일까요?",
        authorId: users[2].id,
        categoryId: categories[3].id,
        tags: ["렌터카", "대중교통", "교통", "비용"],
        location: "제주시",
        status: "ACTIVE",
        isResolved: false,
        viewCount: 32,
        likeCount: 5,
        answerCount: 2,
      },
    }),
    prisma.question.create({
      data: {
        title: "제주도 펜션 추천해주세요",
        content:
          "제주도에서 바다가 보이는 펜션을 찾고 있습니다. 2명이서 1박2일 일정이고 예산은 20만원 이내로 생각하고 있어요.",
        authorId: users[0].id,
        categoryId: categories[2].id,
        tags: ["펜션", "숙박", "바다뷰", "예산"],
        location: "중문",
        status: "ACTIVE",
        isResolved: false,
        viewCount: 28,
        likeCount: 3,
        answerCount: 1,
      },
    }),
    prisma.question.create({
      data: {
        title: "제주도 기념품 쇼핑 어디서 하면 좋을까요?",
        content:
          "제주도에서 가족들에게 줄 기념품을 사려고 하는데 어디서 사는게 좋을까요? 가격도 합리적이고 품질도 좋은 곳을 찾고 있어요.",
        authorId: users[1].id,
        categoryId: categories[4].id,
        tags: ["기념품", "쇼핑", "가격", "품질"],
        location: "제주시",
        status: "ACTIVE",
        isResolved: false,
        viewCount: 19,
        likeCount: 2,
        answerCount: 0,
      },
    }),
  ]);

  console.log(`✅ Created ${questions.length} test questions`);

  // 5. 테스트 답변 생성
  console.log("💬 Creating test answers...");
  const answers = await Promise.all([
    prisma.answer.create({
      data: {
        content:
          "3박4일 가족 여행이라면 제주시-서귀포-중문 순으로 돌아보시는 것을 추천드려요. 첫째 날은 제주시에서 성산일출봉과 만장굴, 둘째 날은 서귀포에서 중문관광단지와 천지연폭포, 셋째 날은 중문에서 테디베어뮤지엄과 신비의도로를 가보시면 좋을 것 같아요!",
        authorId: users[1].id,
        questionId: questions[0].id,
        status: "ACTIVE",
        isAccepted: false,
        likeCount: 5,
        dislikeCount: 0,
      },
    }),
    prisma.answer.create({
      data: {
        content:
          "제주도 맛집으로는 서귀포의 '해녀의집'에서 신선한 해산물을 드실 수 있고, 제주시의 '제주향토음식점'에서 전통 제주 음식을 맛보실 수 있어요. 특히 흑돼지와 갈치조림은 꼭 드셔보세요!",
        authorId: users[2].id,
        questionId: questions[1].id,
        status: "ACTIVE",
        isAccepted: true,
        likeCount: 12,
        dislikeCount: 1,
        acceptedAt: new Date(),
      },
    }),
    prisma.answer.create({
      data: {
        content:
          "2명이서 2박3일이라면 렌터카가 더 효율적일 것 같아요. 대중교통은 시간이 오래 걸리고 이동이 불편해서요. 렌터카는 하루 5-6만원 정도면 괜찮은 차를 빌릴 수 있어요.",
        authorId: users[0].id,
        questionId: questions[2].id,
        status: "ACTIVE",
        isAccepted: false,
        likeCount: 3,
        dislikeCount: 0,
      },
    }),
  ]);

  console.log(`✅ Created ${answers.length} test answers`);

  // 6. 좋아요 및 북마크 생성
  console.log("👍 Creating likes and bookmarks...");
  await Promise.all([
    // 질문 좋아요
    prisma.questionLike.create({
      data: {
        userId: users[1].id,
        questionId: questions[0].id,
      },
    }),
    prisma.questionLike.create({
      data: {
        userId: users[2].id,
        questionId: questions[0].id,
      },
    }),
    // 답변 좋아요
    prisma.answerLike.create({
      data: {
        userId: users[0].id,
        answerId: answers[0].id,
        isLike: true,
      },
    }),
    prisma.answerLike.create({
      data: {
        userId: users[1].id,
        answerId: answers[1].id,
        isLike: true,
      },
    }),
    // 북마크
    prisma.bookmark.create({
      data: {
        userId: users[0].id,
        questionId: questions[1].id,
      },
    }),
    prisma.bookmark.create({
      data: {
        userId: users[1].id,
        questionId: questions[2].id,
      },
    }),
  ]);

  console.log("✅ Created likes and bookmarks");

  // 7. 알림 생성
  console.log("🔔 Creating notifications...");
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: "QUESTION_ANSWERED",
        title: "새로운 답변이 등록되었습니다",
        message:
          "제주도 3박4일 여행 코스 추천해주세요! 질문에 답변이 등록되었습니다.",
        data: {
          questionId: questions[0].id,
          answerId: answers[0].id,
        },
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[1].id,
        type: "ANSWER_ACCEPTED",
        title: "답변이 채택되었습니다",
        message: "제주도 맛집 추천 부탁드려요 질문에서 답변이 채택되었습니다.",
        data: {
          questionId: questions[1].id,
          answerId: answers[1].id,
        },
        isRead: true,
        readAt: new Date(),
      },
    }),
  ]);

  console.log("✅ Created notifications");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch(e => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
