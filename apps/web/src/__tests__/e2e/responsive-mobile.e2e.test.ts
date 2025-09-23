import { test, expect } from '@playwright/test';

test.describe('모바일 반응형 테스트', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test.describe('iPhone SE (375x667) - 최소 모바일', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('페이지가 화면 너비에 맞게 조정됨', async ({ page }) => {
      // 가로 스크롤이 발생하지 않는지 확인
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    });

    test('헤더가 적절한 크기로 표시됨', async ({ page }) => {
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      // 헤더 높이가 적절한지 확인 (44px 이상)
      const headerBox = await header.boundingBox();
      expect(headerBox?.height).toBeGreaterThanOrEqual(44);
    });

    test('네비게이션이 모바일에 최적화됨', async ({ page }) => {
      // 햄버거 메뉴가 있는지 확인
      const hamburgerMenu = page.locator('[data-testid="mobile-menu"], button[aria-label*="메뉴"], button[aria-label*="menu"]').first();
      await expect(hamburgerMenu).toBeVisible();
      
      // 햄버거 메뉴 버튼이 44px 이상인지 확인
      const menuBox = await hamburgerMenu.boundingBox();
      expect(menuBox?.height).toBeGreaterThanOrEqual(44);
      expect(menuBox?.width).toBeGreaterThanOrEqual(44);
    });

    test('카드가 1열로 표시됨', async ({ page }) => {
      // QuestionCard들이 1열로 배치되는지 확인
      const cards = page.locator('[data-testid="question-card"], .question-card, [class*="QuestionCard"]');
      const cardCount = await cards.count();
      
      if (cardCount > 0) {
        // 첫 번째 카드의 위치 확인
        const firstCard = cards.first();
        const firstCardBox = await firstCard.boundingBox();
        
        // 두 번째 카드가 있다면 첫 번째 카드 아래에 있는지 확인
        if (cardCount > 1) {
          const secondCard = cards.nth(1);
          const secondCardBox = await secondCard.boundingBox();
          
          expect(secondCardBox?.y).toBeGreaterThan(firstCardBox?.y || 0);
        }
      }
    });

    test('터치 타겟이 44px 이상', async ({ page }) => {
      // 모든 버튼이 44px 이상인지 확인
      const buttons = page.locator('button, [role="button"], a[href]');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i);
        const buttonBox = await button.boundingBox();
        
        if (buttonBox) {
          expect(buttonBox.height).toBeGreaterThanOrEqual(44);
          expect(buttonBox.width).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('텍스트가 읽기 편한 크기', async ({ page }) => {
      // 메인 제목이 적절한 크기인지 확인
      const mainTitle = page.locator('h1, h2, [class*="title"]').first();
      if (await mainTitle.isVisible()) {
        const titleBox = await mainTitle.boundingBox();
        const fontSize = await mainTitle.evaluate((el) => {
          return parseFloat(getComputedStyle(el).fontSize);
        });
        
        // 모바일에서 16px 이상이어야 함
        expect(fontSize).toBeGreaterThanOrEqual(16);
      }
    });

    test('콘텐츠가 잘리지 않음', async ({ page }) => {
      // 메인 제목이 완전히 보이는지 확인
      const mainTitle = page.locator('h1').first();
      if (await mainTitle.isVisible()) {
        const titleText = await mainTitle.textContent();
        expect(titleText).toContain('제주 여행');
        expect(titleText).toContain('궁금한 게 있으신가요');
      }
    });
  });

  test.describe('iPhone 12 Pro (390x844) - 표준 모바일', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
    });

    test('카드 레이아웃이 1열로 표시됨', async ({ page }) => {
      const cards = page.locator('[data-testid="question-card"], .question-card, [class*="QuestionCard"]');
      const cardCount = await cards.count();
      
      if (cardCount > 0) {
        const firstCard = cards.first();
        const firstCardBox = await firstCard.boundingBox();
        
        if (cardCount > 1) {
          const secondCard = cards.nth(1);
          const secondCardBox = await secondCard.boundingBox();
          
          expect(secondCardBox?.y).toBeGreaterThan(firstCardBox?.y || 0);
        }
      }
    });

    test('텍스트가 읽기 편한 크기', async ({ page }) => {
      // 본문 텍스트가 14px 이상인지 확인
      const bodyText = page.locator('p, span, div').first();
      if (await bodyText.isVisible()) {
        const fontSize = await bodyText.evaluate((el) => {
          return parseFloat(getComputedStyle(el).fontSize);
        });
        
        expect(fontSize).toBeGreaterThanOrEqual(14);
      }
    });

    test('버튼들이 충분히 큰 크기', async ({ page }) => {
      const buttons = page.locator('button, [role="button"]');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const buttonBox = await button.boundingBox();
        
        if (buttonBox) {
          expect(buttonBox.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('스크롤이 부드럽게 작동함', async ({ page }) => {
      // 페이지 높이 확인
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      
      // 스크롤 가능한 경우에만 테스트
      if (bodyHeight > viewportHeight) {
        // 페이지를 스크롤해보고 성능 확인
        await page.evaluate(() => {
          window.scrollTo({ top: 500, behavior: 'smooth' });
        });
        
        await page.waitForTimeout(500);
        
        // 스크롤 위치 확인
        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBeGreaterThan(0);
      } else {
        // 스크롤할 내용이 없는 경우 테스트 통과
        expect(true).toBe(true);
      }
    });
  });

  test.describe('모바일 카드 컴포넌트 테스트', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('QuestionCard 모바일 최적화', async ({ page }) => {
      const questionCards = page.locator('[data-testid="question-card"], .question-card, [class*="QuestionCard"]');
      const cardCount = await questionCards.count();
      
      if (cardCount > 0) {
        const firstCard = questionCards.first();
        
        // 카드가 화면 너비에 맞게 조정되는지 확인
        const cardBox = await firstCard.boundingBox();
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        
        expect(cardBox?.width).toBeLessThanOrEqual(viewportWidth);
        
        // 카드 패딩이 모바일에 적절한지 확인 (16px 이상)
        const padding = await firstCard.evaluate((el) => {
          const computedStyle = getComputedStyle(el);
          return parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
        });
        
        expect(padding).toBeGreaterThanOrEqual(16);
      }
    });

    test('터치 인터페이스 최적화', async ({ page }) => {
      // 모든 인터랙티브 요소가 44px 이상인지 확인
      const interactiveElements = page.locator('button, [role="button"], a, input, select, textarea');
      const elementCount = await interactiveElements.count();
      
      for (let i = 0; i < Math.min(elementCount, 10); i++) {
        const element = interactiveElements.nth(i);
        const elementBox = await element.boundingBox();
        
        if (elementBox) {
          expect(elementBox.height).toBeGreaterThanOrEqual(44);
          expect(elementBox.width).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('Pretendard Variable 폰트 적용', async ({ page }) => {
      // 폰트 패밀리가 Pretendard Variable인지 확인
      const bodyElement = page.locator('body');
      const fontFamily = await bodyElement.evaluate((el) => {
        return getComputedStyle(el).fontFamily;
      });
      
      expect(fontFamily).toContain('Pretendard');
    });
  });

  test.describe('모바일 성능 테스트', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('페이지 로딩 성능', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // 모바일에서 4초 이내 로딩 (개발 환경 고려)
      expect(loadTime).toBeLessThan(4000);
    });

    test('스크롤 성능', async ({ page }) => {
      // 페이지 높이 확인
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      
      // 스크롤 가능한 경우에만 테스트
      if (bodyHeight > viewportHeight) {
        // 스크롤 이벤트 성능 측정
        let scrollEvents = 0;
        
        // 스크롤 이벤트 리스너 등록
        await page.evaluate(() => {
          window.addEventListener('scroll', () => {
            window.scrollEventCount = (window.scrollEventCount || 0) + 1;
          });
        });
        
        // 페이지를 스크롤
        await page.evaluate(() => {
          window.scrollTo({ top: 200, behavior: 'smooth' });
        });
        
        await page.waitForTimeout(1000);
        
        // 스크롤 이벤트 카운트 확인
        const scrollEventCount = await page.evaluate(() => window.scrollEventCount || 0);
        expect(scrollEventCount).toBeGreaterThan(0);
      } else {
        // 스크롤할 내용이 없는 경우 테스트 통과
        expect(true).toBe(true);
      }
    });
  });
});
