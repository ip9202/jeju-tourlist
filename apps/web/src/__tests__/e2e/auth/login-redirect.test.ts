import { test, expect } from '@playwright/test';

test.describe('로그인 리다이렉트 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 홈페이지로 이동
    await page.goto('http://localhost:3000');
  });

  test('질문하기 버튼 클릭 시 로그인 페이지로 리다이렉트', async ({ page }) => {
    // 질문하기 버튼 클릭
    await page.click('text=질문하기');
    
    // 로그인 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*\/auth\/signin/);
    
    // URL에 callbackUrl 파라미터가 포함되어 있는지 확인
    const url = page.url();
    expect(url).toContain('callbackUrl=%2Fquestions%2Fnew');
  });

  test('로그인 후 질문하기 페이지로 리다이렉트', async ({ page }) => {
    // 질문하기 버튼 클릭하여 로그인 페이지로 이동
    await page.click('text=질문하기');
    await expect(page).toHaveURL(/.*\/auth\/signin/);
    
    // 로그인 폼 작성
    await page.fill('input[type="email"]', 'playwright@test.com');
    await page.fill('input[type="password"]', 'password123!');
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 로그인 성공 후 질문하기 페이지로 리다이렉트되는지 확인 (더 긴 대기 시간)
    await page.waitForURL(/.*\/questions\/new/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/questions\/new/);
  });

  test('일반 로그인 버튼 클릭 시 현재 페이지로 리다이렉트', async ({ page }) => {
    // 질문 목록 페이지로 이동
    await page.goto('http://localhost:3000/questions');
    
    // 로그인 버튼 클릭
    await page.click('text=로그인');
    
    // 로그인 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*\/auth\/signin/);
    
    // URL에 현재 페이지가 callbackUrl로 포함되어 있는지 확인
    const url = page.url();
    expect(url).toContain('callbackUrl=%2Fquestions');
  });

  test('홈페이지에서 로그인 후 홈페이지로 리다이렉트', async ({ page }) => {
    // 홈페이지에서 로그인 버튼 클릭
    await page.click('text=로그인');
    await expect(page).toHaveURL(/.*\/auth\/signin/);
    
    // URL에 홈페이지가 callbackUrl로 포함되어 있는지 확인
    const url = page.url();
    expect(url).toContain('callbackUrl=%2F');
    
    // 로그인 폼 작성
    await page.fill('input[type="email"]', 'playwright@test.com');
    await page.fill('input[type="password"]', 'password123!');
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 로그인 성공 후 홈페이지로 리다이렉트되는지 확인 (더 긴 대기 시간)
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('모바일 메뉴에서 질문하기 버튼 테스트', async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 페이지 새로고침하여 모바일 레이아웃 적용
    await page.reload();
    
    // 햄버거 메뉴 버튼 찾기 및 클릭
    const menuButton = page.locator('button[class*="md:hidden"]').first();
    await menuButton.waitFor({ state: 'visible' });
    await menuButton.click();
    
    // 모바일 메뉴가 열릴 때까지 대기
    await page.waitForSelector('text=질문하기', { state: 'visible' });
    
    // 모바일 메뉴에서 질문하기 클릭
    await page.click('text=질문하기');
    
    // 로그인 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*\/auth\/signin/);
    
    // URL에 callbackUrl 파라미터가 포함되어 있는지 확인
    const url = page.url();
    expect(url).toContain('callbackUrl=%2Fquestions%2Fnew');
  });
});
