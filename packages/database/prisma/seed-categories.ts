/**
 * 카테고리 시드 데이터 스크립트
 *
 * @description
 * - 제주 여행 관련 기본 카테고리 데이터를 DB에 삽입
 * - npm run db:seed:categories 명령으로 실행
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    name: "일반",
    description: "일반적인 질문",
    color: "#6B7280",
    icon: "💬",
    order: 1,
  },
  {
    name: "숙박",
    description: "호텔, 펜션, 게스트하우스 등 숙박 시설 관련",
    color: "#3B82F6",
    icon: "🏨",
    order: 2,
  },
  {
    name: "맛집",
    description: "음식점, 카페, 식당 추천",
    color: "#EF4444",
    icon: "🍽️",
    order: 3,
  },
  {
    name: "교통",
    description: "렌터카, 버스, 택시 등 교통 수단",
    color: "#F59E0B",
    icon: "🚗",
    order: 4,
  },
  {
    name: "관광지",
    description: "관광 명소, 여행지 추천",
    color: "#10B981",
    icon: "🗺️",
    order: 5,
  },
  {
    name: "쇼핑",
    description: "쇼핑몰, 기념품, 특산품",
    color: "#8B5CF6",
    icon: "🛍️",
    order: 6,
  },
  {
    name: "액티비티",
    description: "체험 활동, 레저 스포츠",
    color: "#06B6D4",
    icon: "🏄",
    order: 7,
  },
  {
    name: "날씨",
    description: "날씨, 기온, 복장 관련",
    color: "#14B8A6",
    icon: "🌤️",
    order: 8,
  },
];

async function seedCategories() {
  console.log("🌱 카테고리 시드 데이터 삽입 시작...");

  try {
    // 기존 카테고리 확인
    const existingCount = await prisma.category.count();

    if (existingCount > 0) {
      console.log(`⚠️  이미 ${existingCount}개의 카테고리가 존재합니다.`);
      const answer = process.argv.includes("--force");

      if (!answer) {
        console.log(
          "❌ 시드 작업을 중단합니다. (--force 옵션을 사용하여 강제 실행)"
        );
        return;
      }

      console.log("🗑️  기존 카테고리를 삭제합니다...");
      await prisma.category.deleteMany({});
    }

    // 카테고리 삽입
    for (const category of categories) {
      const created = await prisma.category.create({
        data: category,
      });
      console.log(`✅ 카테고리 생성: ${created.name} (${created.id})`);
    }

    console.log(`\n🎉 총 ${categories.length}개의 카테고리가 생성되었습니다!`);
  } catch (error) {
    console.error("❌ 카테고리 시드 실패:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
seedCategories().catch(error => {
  console.error("❌ 시드 스크립트 실행 실패:", error);
  process.exit(1);
});
