import { PrismaClient, BadgeType } from "@prisma/client";

const prisma = new PrismaClient();

async function seedBadges() {
  console.log("🌱 배지 데이터 시딩 시작...");

  try {
    // 기존 배지 데이터 삭제
    await prisma.userBadge.deleteMany();
    await prisma.badge.deleteMany();
    console.log("✅ 기존 배지 데이터 삭제 완료");

    // 전문 분야 배지 (Category Expert Badges)
    const categoryExpertBadges = [
      {
        code: "FOOD_DETECTIVE",
        name: "맛집 탐정",
        emoji: "🍜",
        description: "맛집 카테고리에서 전문성을 인정받은 사용자",
        type: BadgeType.CATEGORY_EXPERT,
        category: "맛집",
        requiredAnswers: 50,
        requiredAdoptRate: 30.0,
        bonusPoints: 50,
        adoptBonusPoints: 5,
      },
      {
        code: "CAFE_CURATOR",
        name: "카페 큐레이터",
        emoji: "☕",
        description: "카페 관련 질문에 전문적으로 답변하는 사용자",
        type: BadgeType.CATEGORY_EXPERT,
        category: "맛집",
        requiredAnswers: 30,
        requiredAdoptRate: 25.0,
        bonusPoints: 30,
        adoptBonusPoints: 3,
      },
      {
        code: "DRIVE_MASTER",
        name: "드라이브 마스터",
        emoji: "🚗",
        description: "교통 및 드라이브 관련 전문가",
        type: BadgeType.CATEGORY_EXPERT,
        category: "교통",
        requiredAnswers: 30,
        requiredAdoptRate: 25.0,
        bonusPoints: 30,
        adoptBonusPoints: 3,
      },
      {
        code: "BEACH_EXPERT",
        name: "해변 전문가",
        emoji: "🏖️",
        description: "해변 및 액티비티 관련 전문가",
        type: BadgeType.CATEGORY_EXPERT,
        category: "액티비티",
        requiredAnswers: 20,
        requiredAdoptRate: 20.0,
        bonusPoints: 20,
        adoptBonusPoints: 3,
      },
    ];

    // 활동 수준 배지 (Activity Level Badges)
    const activityLevelBadges = [
      {
        code: "NEWBIE_HELPER",
        name: "새내기 도우미",
        emoji: "🥉",
        description: "처음 시작하는 사용자를 도와주는 친절한 도우미",
        type: BadgeType.ACTIVITY_LEVEL,
        category: null,
        requiredAnswers: 10,
        requiredAdoptRate: null,
        bonusPoints: 10,
        adoptBonusPoints: null,
      },
      {
        code: "RELIABLE_GUIDE",
        name: "든든한 가이드",
        emoji: "🥈",
        description: "많은 답변으로 커뮤니티에 기여하는 든든한 가이드",
        type: BadgeType.ACTIVITY_LEVEL,
        category: null,
        requiredAnswers: 50,
        requiredAdoptRate: null,
        bonusPoints: 30,
        adoptBonusPoints: null,
      },
      {
        code: "JEJU_MASTER",
        name: "제주 마스터",
        emoji: "🥇",
        description: "제주도에 대한 깊은 지식을 가진 마스터",
        type: BadgeType.ACTIVITY_LEVEL,
        category: null,
        requiredAnswers: 100,
        requiredAdoptRate: null,
        bonusPoints: 50,
        adoptBonusPoints: null,
      },
      {
        code: "JEJU_LEGEND",
        name: "제주 전설",
        emoji: "👑",
        description: "제주도 커뮤니티의 전설적인 존재",
        type: BadgeType.ACTIVITY_LEVEL,
        category: null,
        requiredAnswers: 300,
        requiredAdoptRate: null,
        bonusPoints: 100,
        adoptBonusPoints: null,
      },
    ];

    // 모든 배지 데이터 생성
    const allBadges = [...categoryExpertBadges, ...activityLevelBadges];

    for (const badgeData of allBadges) {
      await prisma.badge.create({
        data: badgeData,
      });
      console.log(`✅ 배지 생성: ${badgeData.emoji} ${badgeData.name}`);
    }

    console.log(`🎉 총 ${allBadges.length}개의 배지 데이터 시딩 완료!`);

    // 생성된 배지 확인
    const createdBadges = await prisma.badge.findMany({
      orderBy: [{ type: "asc" }, { requiredAnswers: "asc" }],
    });

    console.log("\n📊 생성된 배지 목록:");
    createdBadges.forEach(badge => {
      console.log(
        `  ${badge.emoji} ${badge.name} (${badge.type}) - 답변 ${badge.requiredAnswers}개 필요`
      );
    });
  } catch (error) {
    console.error("❌ 배지 시딩 중 오류 발생:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  seedBadges()
    .then(() => {
      console.log("✅ 배지 시딩 완료");
      process.exit(0);
    })
    .catch(error => {
      console.error("❌ 배지 시딩 실패:", error);
      process.exit(1);
    });
}

export { seedBadges };
