/**
 * Playwright 글로벌 셋업
 *
 * @description
 * - E2E 테스트 실행 전 글로벌 설정
 * - 테스트 데이터베이스 초기화
 * - 테스트 사용자 생성
 * - 환경변수 검증
 */

import { chromium, FullConfig } from '@playwright/test';
import { prisma } from '@jeju-tourlist/database';
import { generateId } from '@jeju-tourlist/utils';

async function globalSetup(config: FullConfig) {
  console.log('🚀 E2E 테스트 글로벌 셋업 시작...');

  // 환경변수 검증
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL 환경변수가 설정되지 않았습니다.');
  }

  try {
    // 데이터베이스 연결 확인
    await prisma.$connect();
    console.log('✅ 테스트 데이터베이스 연결 성공');

    // 테스트 데이터베이스 초기화
    await cleanupTestData();
    console.log('✅ 테스트 데이터베이스 정리 완료');

    // 테스트 사용자 생성
    await createTestUsers();
    console.log('✅ 테스트 사용자 생성 완료');

    // 테스트 질문 데이터 생성
    await createTestQuestions();
    console.log('✅ 테스트 질문 데이터 생성 완료');

    console.log('🎉 E2E 테스트 글로벌 셋업 완료');
  } catch (error) {
    console.error('❌ E2E 테스트 글로벌 셋업 실패:', error);
    throw error;
  }
}

/**
 * 테스트 데이터 정리
 */
async function cleanupTestData() {
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
}

/**
 * 테스트 사용자 생성
 */
async function createTestUsers() {
  // 일반 사용자
  await prisma.user.create({
    data: {
      id: 'test-user-1',
      email: 'test.user@example.com',
      name: '테스트 사용자',
      provider: 'google',
      providerId: 'google-test-user-1',
      role: 'user',
      profile: {
        create: {
          nickname: '테스트유저',
          bio: '테스트용 사용자입니다',
          location: '제주시',
          isLocalResident: false,
          residencyVerificationLevel: 'none',
        }
      }
    }
  });

  // 현지인 사용자
  await prisma.user.create({
    data: {
      id: 'test-local-1',
      email: 'local.user@example.com',
      name: '제주 현지인',
      provider: 'kakao',
      providerId: 'kakao-test-local-1',
      role: 'user',
      profile: {
        create: {
          nickname: '제주토박이',
          bio: '제주도 태생 현지인입니다',
          location: '서귀포시',
          isLocalResident: true,
          residencyVerificationLevel: 'verified',
        }
      }
    }
  });

  // 관리자 사용자
  await prisma.user.create({
    data: {
      id: 'test-admin-1',
      email: 'admin@jeju-tourlist.com',
      name: '관리자',
      provider: 'google',
      providerId: 'google-test-admin-1',
      role: 'admin',
      profile: {
        create: {
          nickname: '관리자',
          bio: '시스템 관리자입니다',
          location: '제주시',
          isLocalResident: true,
          residencyVerificationLevel: 'official',
        }
      }
    }
  });
}

/**
 * 테스트 질문 데이터 생성
 */
async function createTestQuestions() {
  // 활성 질문 생성
  await prisma.question.create({
    data: {
      id: 'test-question-1',
      title: '제주공항에서 성산일출봉까지 가는 방법',
      content: '렌터카 없이 대중교통으로 갈 수 있을까요?',
      authorId: 'test-user-1',
      tags: ['교통', '성산일출봉', '대중교통'],
      regionCode: 'seongsan',
      status: 'active',
      viewCount: 45,
      likeCount: 3,
    }
  });

  // 답변 있는 질문 생성
  const questionWithAnswer = await prisma.question.create({
    data: {
      id: 'test-question-2',
      title: '한라산 등반 시 주의사항',
      content: '11월에 한라산 등반 계획 중인데 준비물이나 주의사항 있나요?',
      authorId: 'test-user-1',
      tags: ['한라산', '등반', '준비물'],
      regionCode: 'hallasan',
      status: 'active',
      viewCount: 128,
      likeCount: 8,
    }
  });

  // 답변 생성
  await prisma.answer.create({
    data: {
      id: 'test-answer-1',
      questionId: 'test-question-2',
      authorId: 'test-local-1',
      content: '11월 한라산은 추워서 방한복 필수입니다. 아이젠도 준비하시고 일찍 출발하세요!',
      likeCount: 5,
      isAccepted: true,
    }
  });
}

export default globalSetup;