const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkBadgeData() {
  console.log("=== 배지 시스템 데이터 상태 ===\n");

  // 1. 활성 배지 목록
  const badges = await prisma.badge.findMany({
    where: { isActive: true },
  });
  console.log("📌 활성 배지:");
  badges.forEach((b) => {
    console.log(
      `  ${b.emoji} ${b.name} (${b.type}): 필요 답변수=${b.requiredAnswers}, 채택율=${b.requiredAdoptRate}%`
    );
  });

  // 2. 사용자별 답변 수
  const users = await prisma.user.findMany({
    include: {
      answers: true,
      userBadges: { include: { badge: true } },
    },
  });

  console.log("\n👤 사용자별 데이터:");
  for (const user of users) {
    const totalAnswers = user.answers.length;
    const adoptedAnswers = user.answers.filter(
      (a) => a.adoptedAnswerId
    ).length;
    const adoptRate =
      totalAnswers > 0 ? ((adoptedAnswers / totalAnswers) * 100).toFixed(1) : 0;

    console.log(
      `  ${user.nickname}: 답변=${totalAnswers}개, 채택=${adoptedAnswers}개, 채택율=${adoptRate}%, 포인트=${user.points}, 배지=${user.userBadges.length}개`
    );

    if (user.userBadges.length > 0) {
      user.userBadges.forEach((ub) => {
        console.log(`    ✓ ${ub.badge.emoji} ${ub.badge.name}`);
      });
    }
  }

  // 3. 카테고리별 답변 수
  const categories = await prisma.category.findMany({
    include: {
      questions: { include: { answers: true } },
    },
  });

  console.log("\n📂 카테고리별 데이터:");
  for (const cat of categories) {
    const totalAnswers = cat.questions.reduce(
      (acc, q) => acc + q.answers.length,
      0
    );
    console.log(`  ${cat.name}: 답변=${totalAnswers}개`);
  }

  await prisma.$disconnect();
}

checkBadgeData();
