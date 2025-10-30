import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verify() {
  console.log("🔍 Verifying Answer records have categoryId...\n");

  const answers = await prisma.answer.findMany({
    include: {
      question: { select: { title: true, categoryId: true } },
      category: { select: { name: true } },
      author: { select: { nickname: true } },
    },
  });

  console.log(`📊 Total answers: ${answers.length}\n`);

  answers.forEach((answer, idx) => {
    console.log(
      `Answer ${idx + 1}:`
    );
    console.log(
      `  Question: "${answer.question.title.substring(0, 40)}..."`
    );
    console.log(
      `  Author: ${answer.author.nickname}`
    );
    console.log(
      `  Question categoryId: ${answer.question.categoryId}`
    );
    console.log(
      `  Answer categoryId: ${answer.categoryId}`
    );
    console.log(
      `  Category: ${answer.category?.name || "NULL"}`
    );
    console.log(
      `  ✅ Match: ${answer.categoryId === answer.question.categoryId ? "YES" : "NO"}\n`
    );
  });

  // 카테고리별 답변 수 통계
  console.log("📈 Answers by Category:");
  const statsByCategory = await prisma.answer.groupBy({
    by: ["categoryId"],
    _count: { id: true },
  });

  for (const stat of statsByCategory) {
    const category = await prisma.category.findUnique({
      where: { id: stat.categoryId || undefined },
    });
    console.log(
      `  ${category?.name || "NULL"}: ${stat._count.id} answers`
    );
  }

  await prisma.$disconnect();
}

verify()
  .catch(e => {
    console.error("❌ Error:", e);
    process.exit(1);
  });
