import { test, expect } from '@playwright/test';

test.describe('간단한 로그아웃 테스트', () => {
  test('로그인 없이 로그아웃 버튼 확인', async ({ page }) => {
    // 홈페이지로 이동
    await page.goto('http://localhost:3000');
    
    // 로그인 버튼이 보이는지 확인
    const loginButton = page.locator('text=로그인');
    await expect(loginButton).toBeVisible();
    
    // 로그아웃 버튼이 보이지 않는지 확인
    const logoutButton = page.locator('text=로그아웃');
    await expect(logoutButton).not.toBeVisible();
    
    console.log('✅ 비로그인 상태에서 로그인 버튼 표시, 로그아웃 버튼 숨김 확인');
  });

  test('수동으로 로그인 후 로그아웃 테스트', async ({ page }) => {
    // 1. 로그인 페이지로 이동
    await page.goto('http://localhost:3000/auth/signin');
    
    // 2. 로그인 폼 작성
    await page.fill('input[type="email"]', 'playwright@test.com');
    await page.fill('input[type="password"]', 'password123!');
    
    // 3. 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 4. 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    
    // 5. 현재 URL 확인
    console.log('로그인 시도 후 URL:', page.url());
    
    // 6. 에러 메시지 확인
    const errorAlert = page.locator('[role="alert"]').first();
    if (await errorAlert.isVisible()) {
      const errorText = await errorAlert.textContent();
      console.log('에러 메시지:', errorText);
    }
    
    // 7. 로그인 성공 여부 확인 (URL이 홈페이지인지)
    if (page.url() === 'http://localhost:3000/') {
      console.log('✅ 로그인 성공 - 홈페이지로 리다이렉트됨');
      
      // 8. 로그아웃 버튼 확인
      const logoutButton = page.locator('text=로그아웃');
      if (await logoutButton.isVisible()) {
        console.log('✅ 로그아웃 버튼 표시됨');
        
        // 9. 로그아웃 버튼 클릭
        await logoutButton.click();
        
        // 10. 로그아웃 후 상태 확인
        await page.waitForLoadState('networkidle');
        console.log('로그아웃 후 URL:', page.url());
        
        // 11. 로그인 버튼이 다시 보이는지 확인
        const loginButtonAfter = page.locator('text=로그인');
        if (await loginButtonAfter.isVisible()) {
          console.log('✅ 로그아웃 성공 - 로그인 버튼이 다시 표시됨');
        } else {
          console.log('❌ 로그아웃 실패 - 로그인 버튼이 표시되지 않음');
        }
      } else {
        console.log('❌ 로그아웃 버튼이 표시되지 않음');
      }
    } else {
      console.log('❌ 로그인 실패 - 로그인 페이지에 머물러 있음');
    }
  });
});
