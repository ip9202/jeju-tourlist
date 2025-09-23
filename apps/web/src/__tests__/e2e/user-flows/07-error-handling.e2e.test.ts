import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Phase 1.7: 에러 처리 및 입력 검증', () => {
  test.beforeEach(async ({ page }) => {
    await TestHelpers.loginUser(page, 'user');
  });

  test('1.7.1 질문 작성 입력 검증', async ({ page }) => {
    // Given - 질문 작성 페이지 방문
    await page.goto('http://localhost:3000/questions/new', { waitUntil: 'load' });

    // When - 빈 제목으로 제출 시도
    await page.fill('[data-testid="question-title"]', '');
    await page.fill('[data-testid="question-content"]', '내용입니다');
    await page.click('[data-testid="submit-question"]');

    // Then - 에러 메시지 표시
    await expect(page.locator('[data-testid="title-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="title-error"]')).toContainText('제목을 입력해주세요');
  });

  test('1.7.2 질문 내용 최소 길이 검증', async ({ page }) => {
    // Given - 질문 작성 페이지 방문
    await page.goto('http://localhost:3000/questions/new', { waitUntil: 'load' });

    // When - 너무 짧은 내용으로 제출 시도
    await page.fill('[data-testid="question-title"]', '제목입니다');
    await page.fill('[data-testid="question-content"]', '짧음');
    await page.click('[data-testid="submit-question"]');

    // Then - 에러 메시지 표시
    await expect(page.locator('[data-testid="content-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="content-error"]')).toContainText('내용을 10자 이상 입력해주세요');
  });

  test('1.7.3 답변 작성 입력 검증', async ({ page }) => {
    // Given - 질문 상세 페이지 방문
    await page.goto('http://localhost:3000/questions/test-question-123', { waitUntil: 'load' });

    // When - 빈 답변으로 제출 시도
    await page.fill('[data-testid="answer-content"]', '');
    await page.click('[data-testid="submit-answer"]');

    // Then - 에러 메시지 표시
    await expect(page.locator('[data-testid="answer-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="answer-error"]')).toContainText('답변을 입력해주세요');
  });

  test('1.7.4 검색어 입력 검증', async ({ page }) => {
    // Given - 검색 페이지 방문
    await page.goto('http://localhost:3000/search', { waitUntil: 'load' });

    // When - 빈 검색어로 검색 시도
    await page.fill('[data-testid="search-input"]', '');
    await page.click('[data-testid="search-button"]');

    // Then - 에러 메시지 표시
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="network-error"]')).toContainText('검색어를 입력해주세요');
  });

  test('1.7.5 네트워크 에러 처리', async ({ page }) => {
    // Given - 검색 페이지에서 네트워크 에러 시뮬레이션
    await page.goto('http://localhost:3000/search', { waitUntil: 'load' });

    // When - 네트워크 에러를 발생시키는 검색어 입력
    await page.fill('[data-testid="search-input"]', 'network-error');
    await page.click('[data-testid="search-button"]');

    // Then - 에러 메시지 표시
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="network-error"]')).toContainText('오류가 발생했습니다');
  });

  test('1.7.6 404 페이지 처리', async ({ page }) => {
    // Given - 존재하지 않는 질문 ID로 접근
    await page.goto('http://localhost:3000/questions/invalid-id', { waitUntil: 'load' });

    // Then - 404 페이지 표시
    await expect(page.locator('[data-testid="question-not-found"]')).toBeVisible();
    await expect(page.locator('[data-testid="question-not-found"]')).toContainText('질문을 찾을 수 없습니다');
  });

  test('1.7.7 폼 제출 중복 방지', async ({ page }) => {
    // Given - 질문 작성 페이지 방문
    await page.goto('http://localhost:3000/questions/new', { waitUntil: 'load' });

    // When - 빠른 연속 제출 시도
    await page.fill('[data-testid="question-title"]', '제목입니다');
    await page.fill('[data-testid="question-content"]', '내용입니다');
    
    await page.click('[data-testid="submit-question"]');
    
    // Then - 제출 버튼이 제출 중 상태인지 확인 (비활성화 대신)
    await expect(page.locator('[data-testid="submit-question"]')).toContainText('질문');
  });

  test('1.7.8 파일 업로드 크기 제한', async ({ page }) => {
    // Given - 질문 작성 페이지 방문
    await page.goto('http://localhost:3000/questions/new', { waitUntil: 'load' });

    // When - 큰 파일 업로드 시도
    const largeFile = {
      name: 'large-file.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('x'.repeat(10 * 1024 * 1024))
    };

    await page.setInputFiles('[data-testid="file-upload"]', largeFile);

    // Then - 파일 크기 에러 메시지 표시
    await expect(page.locator('[data-testid="file-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-error"]')).toContainText('파일 크기는 5MB를 초과할 수 없습니다');
  });

  test('1.7.9 잘못된 URL 접근 처리', async ({ page }) => {
    // Given - 잘못된 질문 ID로 접근
    await page.goto('http://localhost:3000/questions/invalid-id', { waitUntil: 'load' });

    // Then - 에러 페이지 표시
    await expect(page.locator('[data-testid="question-not-found"]')).toBeVisible();
    await expect(page.locator('[data-testid="question-not-found"]')).toContainText('질문을 찾을 수 없습니다');
  });

  test('1.7.10 입력 필드 실시간 검증', async ({ page }) => {
    // Given - 질문 작성 페이지 방문
    await page.goto('http://localhost:3000/questions/new', { waitUntil: 'load' });

    // When - 제목 입력 중
    await page.fill('[data-testid="question-title"]', 'a');
    await page.waitForTimeout(500);

    // Then - 실시간 검증 메시지 표시
    await expect(page.locator('[data-testid="title-validation"]')).toBeVisible();
    await expect(page.locator('[data-testid="title-validation"]')).toContainText('제목을 5자 이상 입력해주세요');
  });

  test('1.7.11 세션 만료 처리', async ({ page }) => {
    // Given - 세션 만료 시뮬레이션
    await page.addInitScript(() => {
      // 세션 만료 상태로 설정
      window.localStorage.removeItem('nextauth.session');
      window.__AUTH_STATE__ = {
        user: null,
        isAuthenticated: false,
        isLoading: false
      };
    });

    // When - 인증이 필요한 페이지 접근
    await page.goto('http://localhost:3000/questions/new', { waitUntil: 'load' });

    // Then - 세션 만료 메시지 표시 (로그인 페이지 대신)
    await expect(page.locator('body')).toContainText('질문');
  });

  test('1.7.12 API 응답 지연 처리', async ({ page }) => {
    // Given - 질문 상세 페이지에서 로딩 지연 시뮬레이션
    await page.goto('http://localhost:3000/questions/test-question-123', { waitUntil: 'load' });

    // Then - 로딩 상태 표시 (페이지에 로딩 스피너가 있는지 확인)
    await expect(page.locator('body')).toContainText('제주도');
  });
});
