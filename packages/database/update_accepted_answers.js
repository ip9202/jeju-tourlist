const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function updateAcceptedAnswers() {
  console.log("🔄 답변 채택 업데이트 중...\n");

  try {
    const testUser = await prisma.user.findFirst({
      where: { nickname: "user1" },
    });

    const userAnswers = await prisma.answer.findMany({
      where: { authorId: testUser.id },
    });

    console.log(`총 ${userAnswers.length}개 답변 중...\n`);

    // 35% 채택 처리
    const adoptCount = Math.ceil(userAnswers.length * 0.35);
    let adoptedCount = 0;

    for (let i = 0; i < adoptCount; i++) {
      const answer = userAnswers[i];

      // 직접 답변에 채택 표시
      const updated = await prisma.answer.update({
        where: { id: answer.id },
        data: {
          isAccepted: true,
          adoptedAt: new Date(),
        },
      });

      // 그리고 질문의 acceptedAnswerId도 업데이트
      await prisma.question.update({
        where: { id: answer.questionId },
        data: {
          acceptedAnswerId: answer.id,
        },
      });

      adoptedCount++;
      console.log(`  ✓ [${i+1}/${adoptCount}] 답변 ${answer.id} 채택됨`);
    }

    console.log(`\n✓ ${adoptedCount}개 답변 채택 완료\n`);

    // 최종 확인
    const finalUser = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: {
        answers: true,
      },
    });

    const finalAdoptedCount = finalUser.answers.filter(
      (a) => a.adoptedAt !== null
    ).length;
    const finalAdoptRate = ((finalAdoptedCount / finalUser.answers.length) * 100).toFixed(1);

    console.log(`📊 최종 채택 상태:`);
    console.log(`  - 총 답변: ${finalUser.answers.length}개`);
    console.log(`  - 채택된 답변: ${finalAdoptedCount}개`);
    console.log(`  - 채택율: ${finalAdoptRate}%\n`);

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ 오류:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

updateAcceptedAnswers();
