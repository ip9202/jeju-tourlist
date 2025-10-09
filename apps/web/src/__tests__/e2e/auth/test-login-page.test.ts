import { test, expect } from '@playwright/test';

test.describe('테스트 로그인 페이지', () => {
  test('테스트 페이지에서 로그인 시도', async ({ page }) => {
    // 테스트 로그인 페이지로 이동
    await page.goto('http://localhost:3000/test-login');
    
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    
    // 초기 세션 상태 확인
    const sessionStatusElement = page.locator('text=세션 상태:').first();
    const sessionStatus = await sessionStatusElement.textContent();
    console.log('초기 세션 상태:', sessionStatus);
    
    // 로그인 버튼 클릭
    await page.click('text=로그인 테스트');
    
    // 로그인 처리 대기
    await page.waitForTimeout(3000);
    
    // 로그인 후 세션 상태 확인
    const sessionStatusAfter = await sessionStatusElement.textContent();
    console.log('로그인 후 세션 상태:', sessionStatusAfter);
    
    // 세션 데이터 확인
    const sessionDataElement = page.locator('pre').first();
    const sessionData = await sessionDataElement.textContent();
    console.log('세션 데이터:', sessionData);
    
    // 콘솔 로그 수집
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log('브라우저 콘솔:', msg.text());
      }
    });
    
    // 페이지 새로고침하여 세션 상태 재확인
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const sessionStatusReload = await sessionStatusElement.textContent();
    console.log('새로고침 후 세션 상태:', sessionStatusReload);
  });
});
