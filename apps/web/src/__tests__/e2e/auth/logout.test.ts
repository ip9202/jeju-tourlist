import { test, expect } from '@playwright/test';

test.describe('로그아웃 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 홈페이지로 이동
    await page.goto('http://localhost:3000');
  });

  test('로그인 후 로그아웃 버튼 클릭 테스트', async ({ page }) => {
    // 1. 로그인 페이지로 이동
    await page.click('text=로그인');
    await expect(page).toHaveURL(/.*\/auth\/signin/);
    
    // 2. 로그인 폼 작성
    await page.fill('input[type="email"]', 'playwright@test.com');
    await page.fill('input[type="password"]', 'password123!');
    
    // 3. 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 4. 로그인 성공 후 홈페이지로 리다이렉트 확인
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    
    // 5. 로그인 상태 확인 (로그아웃 버튼이 보이는지)
    const logoutButton = page.locator('text=로그아웃');
    await expect(logoutButton).toBeVisible();
    
    // 6. 로그아웃 버튼 클릭
    await logoutButton.click();
    
    // 7. 로그아웃 후 상태 확인 (로그인 버튼이 보이는지)
    await page.waitForLoadState('networkidle');
    const loginButton = page.locator('text=로그인');
    await expect(loginButton).toBeVisible();
    
    // 8. URL이 홈페이지인지 확인
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('로그인 상태에서 질문하기 버튼 클릭 후 로그아웃', async ({ page }) => {
    // 1. 로그인
    await page.click('text=로그인');
    await page.fill('input[type="email"]', 'playwright@test.com');
    await page.fill('input[type="password"]', 'password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    
    // 2. 질문하기 버튼 클릭 (로그인 상태이므로 직접 이동)
    await page.click('text=질문하기');
    await page.waitForURL(/.*\/questions\/new/, { timeout: 10000 });
    
    // 3. 질문하기 페이지에서 로그아웃 버튼 클릭
    const logoutButton = page.locator('text=로그아웃');
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();
    
    // 4. 로그아웃 후 홈페이지로 리다이렉트 확인
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('http://localhost:3000/');
    
    // 5. 로그인 버튼이 보이는지 확인
    const loginButton = page.locator('text=로그인');
    await expect(loginButton).toBeVisible();
  });
});
