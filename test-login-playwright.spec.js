import { test, expect } from '@playwright/test';

test.describe('로그인 테스트', () => {
  test('ip9202@gmail.com 계정으로 로그인 테스트', async ({ page }) => {
    // 로그인 페이지로 이동
    await page.goto('http://localhost:3000/auth/signin');
    
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    
    // 이메일 입력 필드 찾기 및 입력
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="이메일"], input[placeholder*="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill('ip9202@gmail.com');
    
    // 비밀번호 입력 필드 찾기 및 입력
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="비밀번호"], input[placeholder*="password"]').first();
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill('rkdcjfIP00!');
    
    // 로그인 버튼 찾기 및 클릭
    const loginButton = page.locator('button[type="submit"], button:has-text("로그인"), button:has-text("Login"), input[type="submit"]').first();
    await loginButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // 로그인 버튼 클릭 전 스크린샷
    await page.screenshot({ path: 'login-before.png' });
    
    // 로그인 버튼 클릭
    await loginButton.click();
    
    // 로그인 처리 대기 (최대 10초)
    await page.waitForTimeout(3000);
    
    // 로그인 후 스크린샷
    await page.screenshot({ path: 'login-after.png' });
    
    // URL 확인 (로그인 성공 시 리다이렉트)
    const currentUrl = page.url();
    console.log('현재 URL:', currentUrl);
    
    // 로그인 성공 확인 (URL이 메인 페이지로 변경되었거나 로그아웃 버튼이 보이는지 확인)
    const isLoggedIn = currentUrl.includes('/') && !currentUrl.includes('/auth/signin');
    
    if (isLoggedIn) {
      console.log('✅ 로그인 성공!');
      
      // 헤더에서 로그아웃 버튼이나 사용자 정보 확인
      const logoutButton = page.locator('button:has-text("로그아웃"), a:has-text("로그아웃"), button:has-text("Logout")');
      const userMenu = page.locator('[data-testid="user-menu"], .user-menu, .profile-menu');
      
      if (await logoutButton.isVisible()) {
        console.log('✅ 로그아웃 버튼이 보입니다.');
      } else if (await userMenu.isVisible()) {
        console.log('✅ 사용자 메뉴가 보입니다.');
      } else {
        console.log('⚠️ 로그인은 성공했지만 UI 요소를 찾을 수 없습니다.');
      }
    } else {
      console.log('❌ 로그인 실패 또는 리다이렉트되지 않음');
      
      // 에러 메시지 확인
      const errorMessage = page.locator('.error, .alert, [role="alert"], .text-red-500, .text-red-600');
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        console.log('에러 메시지:', errorText);
      }
    }
    
    // 페이지 소스 일부 출력 (디버깅용)
    const pageContent = await page.content();
    console.log('페이지 제목:', await page.title());
    
    // 네트워크 요청 로그 확인
    page.on('response', response => {
      if (response.url().includes('/api/auth/login')) {
        console.log('로그인 API 응답:', response.status(), response.url());
      }
    });
  });
  
  test('로그인 폼 요소 확인', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.waitForLoadState('networkidle');
    
    // 페이지 스크린샷
    await page.screenshot({ path: 'login-form.png' });
    
    // 모든 입력 필드 찾기
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    console.log('입력 필드 개수:', inputCount);
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      
      console.log(`입력 필드 ${i + 1}:`, { type, name, placeholder, id });
    }
    
    // 모든 버튼 찾기
    const buttons = page.locator('button, input[type="submit"]');
    const buttonCount = await buttons.count();
    console.log('버튼 개수:', buttonCount);
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const type = await button.getAttribute('type');
      
      console.log(`버튼 ${i + 1}:`, { text, type });
    }
  });
});
