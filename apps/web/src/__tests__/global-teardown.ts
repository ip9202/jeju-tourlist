/**
 * Playwright 글로벌 티어다운
 *
 * @description
 * - E2E 테스트 실행 후 정리 작업
 * - 테스트 데이터 삭제
 * - 데이터베이스 연결 종료
 * - 임시 파일 정리
 */

import { FullConfig } from '@playwright/test';
import { prisma } from '@jeju-tourlist/database';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 E2E 테스트 글로벌 티어다운 시작...');

  try {
    // 테스트 데이터 정리
    await cleanupTestData();
    console.log('✅ 테스트 데이터 정리 완료');

    // 데이터베이스 연결 종료
    await prisma.$disconnect();
    console.log('✅ 데이터베이스 연결 종료 완료');

    console.log('🎉 E2E 테스트 글로벌 티어다운 완료');
  } catch (error) {
    console.error('❌ E2E 테스트 글로벌 티어다운 실패:', error);
    // 티어다운 실패는 테스트 실패로 이어지지 않도록 에러를 던지지 않음
  }
}

/**
 * 테스트 데이터 정리
 */
async function cleanupTestData() {
  try {
    // 관련 데이터 순서대로 삭제
    await prisma.answer.deleteMany({
      where: {
        OR: [
          { authorId: { startsWith: 'test-' } },
          { questionId: { startsWith: 'test-' } }
        ]
      }
    });

    await prisma.question.deleteMany({
      where: {
        OR: [
          { id: { startsWith: 'test-' } },
          { authorId: { startsWith: 'test-' } }
        ]
      }
    });

    await prisma.userProfile.deleteMany({
      where: {
        userId: { startsWith: 'test-' }
      }
    });

    await prisma.user.deleteMany({
      where: {
        id: { startsWith: 'test-' }
      }
    });

    console.log('✅ 모든 테스트 데이터 삭제 완료');
  } catch (error) {
    console.error('❌ 테스트 데이터 정리 중 오류:', error);
    throw error;
  }
}

export default globalTeardown;