const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedBadgeTestData() {
  console.log("🌱 배지 시스템 테스트 데이터 생성 시작...\n");

  try {
    // 1. user1 선택
    const testUser = await prisma.user.findFirst({
      where: { nickname: "user1" },
    });

    if (!testUser) {
      console.log("❌ user1을 찾을 수 없습니다.");
      return;
    }

    console.log(`✓ 테스트 사용자: ${testUser.nickname}\n`);

    // 2. 모든 카테고리 조회
    const categories = await prisma.category.findMany();
    console.log(`✓ 총 ${categories.length}개 카테고리\n`);

    // 3. 각 카테고리별로 12개씩 질문 선택
    console.log("📝 각 카테고리별 질문 조회 중...");
    let totalQuestionsForAnswers = 0;

    for (const category of categories) {
      const questions = await prisma.question.findMany({
        where: { categoryId: category.id },
        take: 12,
      });
      totalQuestionsForAnswers += questions.length;
      console.log(`  ${category.name}: ${questions.length}개 질문 선택됨`);
    }

    console.log(`\n✓ 총 ${totalQuestionsForAnswers}개 질문 선택됨\n`);

    // 4. 답변 생성
    console.log("💬 답변 생성 중...");
    let answerCount = 0;

    for (const category of categories) {
      const questions = await prisma.question.findMany({
        where: { categoryId: category.id },
        take: 12,
      });

      for (const question of questions) {
        await prisma.answer.create({
          data: {
            authorId: testUser.id,
            questionId: question.id,
            content: `${category.name} 카테고리 전문 답변입니다.`,
          },
        });
        answerCount++;
      }
    }

    console.log(`✓ ${answerCount}개 답변 생성됨\n`);

    // 5. 답변 채택 처리 (30% 이상)
    console.log("✅ 답변 채택 처리 중...");

    const userAnswers = await prisma.answer.findMany({
      where: { authorId: testUser.id },
    });

    const adoptCount = Math.ceil(userAnswers.length * 0.35);
    let adoptedCount = 0;

    for (let i = 0; i < adoptCount; i++) {
      const answer = userAnswers[i];

      await prisma.question.update({
        where: { id: answer.questionId },
        data: {
          acceptedAnswerId: answer.id,
        },
      });

      adoptedCount++;
    }

    console.log(`✓ ${adoptedCount}개 답변 채택됨\n`);

    // 6. 최종 상태 확인
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: {
        answers: true,
        userBadges: { include: { badge: true } },
      },
    });

    const newAnswerCount = updatedUser.answers.length;
    const newAdoptedCount = updatedUser.answers.filter(
      (a) => a.adoptedAnswerId
    ).length;
    const newAdoptRate =
      newAnswerCount > 0
        ? ((newAdoptedCount / newAnswerCount) * 100).toFixed(1)
        : 0;

    console.log(`📊 최종 데이터:`);
    console.log(`  - 총 답변: ${newAnswerCount}개`);
    console.log(`  - 채택된 답변: ${newAdoptedCount}개`);
    console.log(`  - 채택율: ${newAdoptRate}%`);
    console.log(`  - 현재 배지: ${updatedUser.userBadges.length}개`);
    if (updatedUser.userBadges.length > 0) {
      updatedUser.userBadges.forEach((ub) => {
        console.log(`    ✓ ${ub.badge.emoji} ${ub.badge.name}`);
      });
    }
    console.log(`  - 포인트: ${updatedUser.points}점\n`);

    console.log("✅ 테스트 데이터 생성 완료!");

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ 오류:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

seedBadgeTestData();
