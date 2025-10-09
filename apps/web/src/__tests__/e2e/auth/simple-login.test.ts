import { test, expect } from '@playwright/test';

test.describe('간단한 로그인 테스트', () => {
  test('로그인 폼 제출 후 상태 확인', async ({ page }) => {
    // 로그인 페이지로 이동
    await page.goto('http://localhost:3000/auth/signin');
    
    // 로그인 폼 작성
    await page.fill('input[type="email"]', 'playwright@test.com');
    await page.fill('input[type="password"]', 'password123!');
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 페이지가 로딩될 때까지 대기
    await page.waitForLoadState('networkidle');
    
    // 현재 URL 확인
    console.log('현재 URL:', page.url());
    
    // 에러 메시지가 있는지 확인
    const errorAlert = page.locator('[role="alert"]').first();
    if (await errorAlert.isVisible()) {
      const errorText = await errorAlert.textContent();
      console.log('에러 메시지:', errorText);
    }
    
    // 성공 메시지가 있는지 확인
    const successMessage = page.locator('text=로그인 성공');
    if (await successMessage.isVisible()) {
      console.log('로그인 성공 메시지 발견');
    }
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log('페이지 제목:', title);
  });
});
