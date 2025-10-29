import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log("전체 사용자:", userCount);

    const experts = await prisma.userBadge.findMany();
    console.log("배지 부여된 사용자:", experts.length);

    const badgeTypes = await prisma.badge.findMany();
    console.log("\n배지 목록 (총" + badgeTypes.length + "개):");
    badgeTypes.forEach(b => console.log(`  - ${b.name} (${b.badgeType})`));

    const questions = await prisma.question.count();
    const answers = await prisma.answer.count();
    console.log("\n질문:", questions);
    console.log("답변:", answers);
  } finally {
    await prisma.$disconnect();
  }
}

main();
