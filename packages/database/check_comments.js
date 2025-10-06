const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const comments = await prisma.answerComment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      content: true,
      parentId: true,
      depth: true,
      createdAt: true,
    }
  });
  
  console.log('\n=== 최근 댓글 10개 ===');
  console.log(JSON.stringify(comments, null, 2));
  
  await prisma.$disconnect();
}

main();
