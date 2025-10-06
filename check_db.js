const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const comment = await prisma.answerComment.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('\n=== Prisma가 반환하는 필드들 ===');
  console.log('Keys:', Object.keys(comment || {}));
  console.log('\n=== 전체 데이터 ===');
  console.log(JSON.stringify(comment, null, 2));
  
  await prisma.$disconnect();
}

main().catch(console.error);
