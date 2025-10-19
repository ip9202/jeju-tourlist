const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://test:test@localhost:5433/jeju_tourlist?schema=public"
});

async function main() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "ip9202@gmail.com" },
      include: {
        answers: {
          include: { question: { include: { category: true } } }
        },
        userBadges: {
          include: { badge: true }
        }
      }
    });

    if (!user) {
      console.log("사용자를 찾을 수 없습니다.");
      process.exit(0);
    }

    console.log("\n=== 사용자 정보 ===");
    console.log("이름:", user.name);
    console.log("이메일:", user.email);
    console.log("닉네임:", user.nickname);
    console.log("ID:", user.id);

    console.log("\n=== 답변 통계 ===");
    console.log("총 답변:", user.answers.length);

    if (user.answers.length > 0) {
      const categoryStats = {};
      let acceptedCount = 0;

      user.answers.forEach(answer => {
        const catName = answer.question.category.name;
        if (!categoryStats[catName]) {
          categoryStats[catName] = { total: 0, accepted: 0 };
        }
        categoryStats[catName].total++;
        if (answer.isAccepted) {
          categoryStats[catName].accepted++;
          acceptedCount++;
        }
      });

      console.log("\n카테고리별 답변:");
      Object.entries(categoryStats).forEach(([cat, stats]) => {
        const rate = ((stats.accepted / stats.total) * 100).toFixed(1);
        console.log("  " + cat + ": " + stats.total + "개 (채택: " + stats.accepted + "개, " + rate + "%)");
      });

      console.log("\n전체 채택율: " + acceptedCount + "/" + user.answers.length + " (" + ((acceptedCount / user.answers.length) * 100).toFixed(1) + "%)");
    }

    console.log("\n=== 배지 정보 ===");
    console.log("보유 배지:", user.userBadges.length);
    if (user.userBadges.length > 0) {
      user.userBadges.forEach(ub => {
        console.log("  - " + ub.badge.name + " (" + ub.badge.code + ")");
        console.log("    설명: " + ub.badge.description);
      });
    } else {
      console.log("  배지 없음");
    }

  } catch (error) {
    console.error("오류:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
