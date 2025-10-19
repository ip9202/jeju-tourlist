const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://test:test@localhost:5433/jeju_tourlist?schema=public"
});

async function main() {
  try {
    // ip9202@gmail.com 사용자 찾기
    const user = await prisma.user.findFirst({
      where: { email: "ip9202@gmail.com" }
    });

    if (!user) {
      console.log("사용자를 찾을 수 없습니다.");
      process.exit(0);
    }

    console.log("사용자 ID:", user.id);
    console.log("닉네임:", user.nickname);

    // 모든 카테고리와 질문 조회
    const categories = await prisma.category.findMany();
    console.log("\n총 " + categories.length + "개 카테고리");

    let answerCount = 0;

    // 각 카테고리에서 질문을 선택하여 답변 생성
    for (const category of categories) {
      const questions = await prisma.question.findMany({
        where: { categoryId: category.id },
        take: 5
      });

      for (const question of questions) {
        const answer = await prisma.answer.create({
          data: {
            authorId: user.id,
            questionId: question.id,
            content: category.name + " 카테고리 전문 답변입니다. 이 답변은 테스트를 위해 생성되었습니다.",
            isAccepted: Math.random() > 0.6  // 40% 확률로 채택됨
          }
        });

        // 채택된 답변인 경우 질문의 acceptedAnswerId 업데이트
        if (answer.isAccepted) {
          await prisma.question.update({
            where: { id: question.id },
            data: {
              acceptedAnswerId: answer.id,
              isResolved: true
            }
          });
        }

        answerCount++;
      }
    }

    console.log("생성된 답변: " + answerCount + "개");

    // 생성 후 통계 확인
    const updatedAnswers = await prisma.answer.findMany({
      where: { authorId: user.id }
    });

    const acceptedAnswers = updatedAnswers.filter(a => a.isAccepted).length;
    console.log("\n생성 후 통계:");
    console.log("총 답변: " + updatedAnswers.length);
    console.log("채택된 답변: " + acceptedAnswers);
    console.log("채택율: " + ((acceptedAnswers / updatedAnswers.length) * 100).toFixed(1) + "%");

  } catch (error) {
    console.error("오류:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
