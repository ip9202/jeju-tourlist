import { test, expect } from '@playwright/test';

test.describe('세션 디버깅', () => {
  test('로그인 후 NextAuth 세션 확인', async ({ page }) => {
    // 1. 로그인 페이지로 이동
    await page.goto('http://localhost:3000/auth/signin');
    
    // 2. 로그인 폼 작성
    await page.fill('input[type="email"]', 'playwright@test.com');
    await page.fill('input[type="password"]', 'password123!');
    
    // 3. 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 4. 로그인 성공 후 홈페이지로 이동 대기
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    
    // 5. NextAuth 세션 API 직접 호출
    const sessionResponse = await page.evaluate(async () => {
      const response = await fetch('/api/auth/session');
      return response.json();
    });
    
    console.log('NextAuth 세션:', sessionResponse);
    
    // 6. 페이지의 모든 버튼 텍스트 확인
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log('전체 버튼 개수:', buttonCount);
    
    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i);
      const text = await button.textContent();
      if (text && (text.includes('로그인') || text.includes('로그아웃'))) {
        console.log(`버튼 ${i}: "${text}"`);
      }
    }
    
    // 7. AuthContext 상태 확인을 위한 디버그 정보
    const authState = await page.evaluate(() => {
      // window 객체에서 AuthContext 관련 정보 찾기
      const authInfo = (window as any).__AUTH_STATE__;
      return authInfo;
    });
    
    console.log('AuthContext 상태:', authState);
  });
});
