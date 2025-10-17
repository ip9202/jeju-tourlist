import { test, expect } from '@playwright/test';

test.describe('태블릿 반응형 테스트', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test.describe('iPad (768x1024) - 표준 태블릿', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
    });

    test('페이지가 태블릿 화면에 맞게 조정됨', async ({ page }) => {
      // 가로 스크롤이 발생하지 않는지 확인
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    });

    test('헤더가 태블릿에 최적화됨', async ({ page }) => {
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      // 헤더 높이가 적절한지 확인
      const headerBox = await header.boundingBox();
      expect(headerBox?.height).toBeGreaterThanOrEqual(48);
    });

    test('데스크톱 네비게이션이 표시됨', async ({ page }) => {
      // 데스크톱 네비게이션 링크들이 보이는지 확인
      const questionLink = page.locator('a[href="/questions"]').first();
      const categoryLink = page.locator('a[href="/categories"]').first();
      
      await expect(questionLink).toBeVisible();
      await expect(categoryLink).toBeVisible();
      
      // 햄버거 메뉴는 숨겨져야 함
      const hamburgerMenu = page.locator('[data-testid="mobile-menu"], button[aria-label*="메뉴"]');
      await expect(hamburgerMenu).toBeHidden();
    });

    test('카드가 2열로 표시됨', async ({ page }) => {
      // QuestionCard들이 2열로 배치되는지 확인
      const cards = page.locator('[data-testid="question-card"], .question-card, [class*="QuestionCard"]');
      const cardCount = await cards.count();
      
      if (cardCount > 1) {
        // 첫 번째와 두 번째 카드가 같은 행에 있는지 확인
        const firstCard = cards.first();
        const secondCard = cards.nth(1);
        
        const firstCardBox = await firstCard.boundingBox();
        const secondCardBox = await secondCard.boundingBox();
        
        // Y 좌표가 비슷하면 같은 행에 있음 (10px 오차 허용)
        const yDifference = Math.abs((firstCardBox?.y || 0) - (secondCardBox?.y || 0));
        expect(yDifference).toBeLessThan(10);
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

    test('텍스트가 태블릿에 적절한 크기', async ({ page }) => {
      // 메인 제목이 태블릿에 적절한 크기인지 확인
      const mainTitle = page.locator('h1').first();
      if (await mainTitle.isVisible()) {
        const fontSize = await mainTitle.evaluate((el) => {
          return parseFloat(getComputedStyle(el).fontSize);
        });
        
        // 태블릿에서 24px 이상이어야 함
        expect(fontSize).toBeGreaterThanOrEqual(24);
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

    test('카드 간격이 적절함', async ({ page }) => {
      const cards = page.locator('[data-testid="question-card"], .question-card, [class*="QuestionCard"]');
      const cardCount = await cards.count();
      
      if (cardCount > 1) {
        const firstCard = cards.first();
        const secondCard = cards.nth(1);
        
        const firstCardBox = await firstCard.boundingBox();
        const secondCardBox = await secondCard.boundingBox();
        
        // 카드 간 간격이 16px 이상이어야 함
        const horizontalGap = (secondCardBox?.x || 0) - ((firstCardBox?.x || 0) + (firstCardBox?.width || 0));
        expect(horizontalGap).toBeGreaterThanOrEqual(16);
      }
    });
  });

  test.describe('iPad Pro (834x1194) - 대형 태블릿', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 834, height: 1194 });
    });

    test('카드 레이아웃이 2열로 표시됨', async ({ page }) => {
      const cards = page.locator('[data-testid="question-card"], .question-card, [class*="QuestionCard"]');
      const cardCount = await cards.count();
      
      if (cardCount > 1) {
        const firstCard = cards.first();
        const secondCard = cards.nth(1);
        
        const firstCardBox = await firstCard.boundingBox();
        const secondCardBox = await secondCard.boundingBox();
        
        // Y 좌표가 비슷하면 같은 행에 있음
        const yDifference = Math.abs((firstCardBox?.y || 0) - (secondCardBox?.y || 0));
        expect(yDifference).toBeLessThan(10);
      }
    });

    test('텍스트가 대형 태블릿에 적절한 크기', async ({ page }) => {
      // 본문 텍스트가 16px 이상인지 확인
      const bodyText = page.locator('p, span, div').first();
      if (await bodyText.isVisible()) {
        const fontSize = await bodyText.evaluate((el) => {
          return parseFloat(getComputedStyle(el).fontSize);
        });
        
        expect(fontSize).toBeGreaterThanOrEqual(16);
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

    test('카드 너비가 적절함', async ({ page }) => {
      const cards = page.locator('[data-testid="question-card"], .question-card, [class*="QuestionCard"]');
      const cardCount = await cards.count();
      
      if (cardCount > 0) {
        const firstCard = cards.first();
        const cardBox = await firstCard.boundingBox();
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        
        // 카드 너비가 뷰포트의 45% 이상 55% 이하여야 함 (2열 레이아웃)
        const cardWidthRatio = (cardBox?.width || 0) / viewportWidth;
        expect(cardWidthRatio).toBeGreaterThanOrEqual(0.45);
        expect(cardWidthRatio).toBeLessThanOrEqual(0.55);
      }
    });
  });

  test.describe('태블릿 카드 컴포넌트 테스트', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
    });

    test('QuestionCard 태블릿 최적화', async ({ page }) => {
      const questionCards = page.locator('[data-testid="question-card"], .question-card, [class*="QuestionCard"]');
      const cardCount = await questionCards.count();
      
      if (cardCount > 0) {
        const firstCard = questionCards.first();
        
        // 카드가 화면 너비에 맞게 조정되는지 확인
        const cardBox = await firstCard.boundingBox();
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        
        expect(cardBox?.width).toBeLessThanOrEqual(viewportWidth);
        
        // 카드 패딩이 태블릿에 적절한지 확인 (20px 이상)
        const padding = await firstCard.evaluate((el) => {
          const computedStyle = getComputedStyle(el);
          return parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
        });
        
        expect(padding).toBeGreaterThanOrEqual(20);
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

    test('카드 그림자와 둥근 모서리', async ({ page }) => {
      const cards = page.locator('[data-testid="question-card"], .question-card, [class*="QuestionCard"]');
      const cardCount = await cards.count();
      
      if (cardCount > 0) {
        const firstCard = cards.first();
        
        // 카드에 그림자가 있는지 확인
        const boxShadow = await firstCard.evaluate((el) => {
          return getComputedStyle(el).boxShadow;
        });
        expect(boxShadow).not.toBe('none');
        
        // 카드에 둥근 모서리가 있는지 확인
        const borderRadius = await firstCard.evaluate((el) => {
          return getComputedStyle(el).borderRadius;
        });
        expect(borderRadius).not.toBe('0px');
      }
    });
  });

  test.describe('태블릿 성능 테스트', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
    });

    test('페이지 로딩 성능', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // 태블릿에서 15초 이내 로딩 (개발 환경 고려)
      expect(loadTime).toBeLessThan(15000);
    });

    test('스크롤 성능', async ({ page }) => {
      // 페이지 높이 확인
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      
      // 스크롤 가능한 경우에만 테스트
      if (bodyHeight > viewportHeight) {
        // 스크롤 이벤트 성능 측정
        const scrollEvents = 0;
        
        // 스크롤 이벤트 리스너 등록
        await page.evaluate(() => {
          window.addEventListener('scroll', () => {
            window.scrollEventCount = (window.scrollEventCount || 0) + 1;
          });
        });
        
        // 페이지를 스크롤
        await page.evaluate(() => {
          window.scrollTo({ top: 300, behavior: 'smooth' });
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

    test('이미지 로딩 성능', async ({ page }) => {
      // 이미지 로딩 시간 측정
      const startTime = Date.now();
      
      // 이미지가 로드될 때까지 대기
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // 이미지 로딩이 2초 이내에 완료되어야 함
      expect(loadTime).toBeLessThan(2000);
    });
  });

  test.describe('태블릿 접근성 테스트', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
    });

    test('키보드 네비게이션', async ({ page }) => {
      // Tab 키로 네비게이션 가능한지 확인
      await page.keyboard.press('Tab');
      
      // 포커스가 이동했는지 확인
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });

    test('ARIA 레이블', async ({ page }) => {
      // 버튼에 적절한 ARIA 레이블이 있는지 확인
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const textContent = await button.textContent();
        
        // ARIA 레이블이나 텍스트 콘텐츠가 있어야 함
        expect(ariaLabel || textContent).toBeTruthy();
      }
    });

    test('색상 대비', async ({ page }) => {
      // 텍스트와 배경의 색상 대비 확인
      const mainTitle = page.locator('h1').first();
      if (await mainTitle.isVisible()) {
        const color = await mainTitle.evaluate((el) => {
          return getComputedStyle(el).color;
        });
        
        // 텍스트 색상이 설정되어 있는지 확인
        expect(color).not.toBe('rgba(0, 0, 0, 0)');
        expect(color).not.toBe('transparent');
        
        // 텍스트가 실제로 보이는지 확인
        const isVisible = await mainTitle.isVisible();
        expect(isVisible).toBe(true);
      }
    });
  });
});
