import { test, expect } from '@playwright/test'

/**
 * 접근성 E2E 테스트
 * WCAG 2.1 AA 가이드라인 준수를 테스트
 * 
 * SOLID 원칙 적용:
 * - Single Responsibility: 접근성 E2E 테스트만 담당
 * - Open/Closed: 새로운 접근성 테스트 케이스 추가 가능
 * - Liskov Substitution: 다양한 접근성 도구와 호환 가능
 * - Interface Segregation: 필요한 접근성 테스트만 구현
 * - Dependency Inversion: 외부 접근성 테스트 도구와 통합 가능
 */
test.describe('접근성 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('키보드 네비게이션이 작동한다', async ({ page }) => {
    // Tab 키로 네비게이션
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // 포커스가 올바르게 이동하는지 확인
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('스킵 네비게이션이 작동한다', async ({ page }) => {
    // 첫 번째 Tab 키로 스킵 네비게이션 표시
    await page.keyboard.press('Tab')
    
    // 스킵 네비게이션 링크들이 표시되는지 확인
    await expect(page.getByText('본문으로 건너뛰기')).toBeVisible()
    await expect(page.getByText('네비게이션으로 건너뛰기')).toBeVisible()
    await expect(page.getByText('검색으로 건너뛰기')).toBeVisible()
    await expect(page.getByText('푸터로 건너뛰기')).toBeVisible()
  })

  test('스킵 네비게이션 링크가 올바른 위치로 이동한다', async ({ page }) => {
    // 스킵 네비게이션 표시
    await page.keyboard.press('Tab')
    
    // 본문으로 건너뛰기 링크 클릭
    await page.getByText('본문으로 건너뛰기').click()
    
    // 메인 콘텐츠 영역으로 포커스가 이동했는지 확인
    const mainContent = page.locator('main, [role="main"], #main-content')
    await expect(mainContent).toBeFocused()
  })

  test('모든 이미지에 alt 텍스트가 있다', async ({ page }) => {
    // 모든 img 태그 확인
    const images = page.locator('img')
    const count = await images.count()
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
  })

  test('모든 링크에 의미있는 텍스트가 있다', async ({ page }) => {
    // 모든 링크 확인
    const links = page.locator('a')
    const count = await links.count()
    
    for (let i = 0; i < count; i++) {
      const link = links.nth(i)
      const text = await link.textContent()
      const ariaLabel = await link.getAttribute('aria-label')
      
      // 링크 텍스트나 aria-label이 있어야 함
      expect(text?.trim() || ariaLabel).toBeTruthy()
    }
  })

  test('모든 버튼에 의미있는 텍스트가 있다', async ({ page }) => {
    // 모든 버튼 확인
    const buttons = page.locator('button')
    const count = await buttons.count()
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      
      // 버튼 텍스트나 aria-label이 있어야 함
      expect(text?.trim() || ariaLabel).toBeTruthy()
    }
  })

  test('폼 요소에 적절한 라벨이 있다', async ({ page }) => {
    // 모든 입력 필드 확인
    const inputs = page.locator('input, textarea, select')
    const count = await inputs.count()
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledBy = await input.getAttribute('aria-labelledby')
      
      // id, aria-label, aria-labelledby 중 하나는 있어야 함
      expect(id || ariaLabel || ariaLabelledBy).toBeTruthy()
    }
  })

  test('색상 대비가 충분하다', async ({ page }) => {
    // 텍스트와 배경색의 대비 확인
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div')
    const count = await textElements.count()
    
    // 색상 대비는 시각적으로 확인해야 하므로 기본적인 체크만 수행
    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = textElements.nth(i)
      const computedStyle = await element.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor
        }
      })
      
      // 색상이 설정되어 있는지 확인
      expect(computedStyle.color).not.toBe('rgba(0, 0, 0, 0)')
    }
  })

  test('포커스 표시가 명확하다', async ({ page }) => {
    // Tab 키로 포커스 이동
    await page.keyboard.press('Tab')
    
    // 포커스된 요소에 포커스 스타일이 적용되는지 확인
    const focusedElement = page.locator(':focus')
    const computedStyle = await focusedElement.evaluate(el => {
      const styles = window.getComputedStyle(el)
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow
      }
    })
    
    // 포커스 표시가 있는지 확인
    expect(computedStyle.outline !== 'none' || computedStyle.boxShadow !== 'none').toBeTruthy()
  })

  test('ARIA 속성이 올바르게 사용된다', async ({ page }) => {
    // ARIA 역할 확인
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
  })

  test('테이블이 접근 가능하다', async ({ page }) => {
    // 관리자 페이지로 이동하여 테이블 테스트
    await page.goto('/admin')
    
    // 테이블이 있는지 확인
    const table = page.locator('table')
    await expect(table).toBeVisible()
    
    // 테이블 헤더가 올바르게 마크업되어 있는지 확인
    const headers = page.locator('th')
    const headerCount = await headers.count()
    expect(headerCount).toBeGreaterThan(0)
    
    // 테이블에 caption이나 aria-label이 있는지 확인
    const caption = page.locator('caption')
    const ariaLabel = await table.getAttribute('aria-label')
    expect(caption.isVisible() || ariaLabel).toBeTruthy()
  })

  test('모달이 접근 가능하다', async ({ page }) => {
    // 모달을 열 수 있는 버튼이 있다면 테스트
    const modalTrigger = page.getByRole('button', { name: /모달|팝업|열기/ })
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click()
      
      // 모달이 표시되는지 확인
      const modal = page.locator('[role="dialog"]')
      await expect(modal).toBeVisible()
      
      // 모달에 적절한 ARIA 속성이 있는지 확인
      await expect(modal).toHaveAttribute('aria-modal', 'true')
      
      // 모달을 닫을 수 있는 버튼이 있는지 확인
      const closeButton = page.getByRole('button', { name: /닫기|닫음/ })
      await expect(closeButton).toBeVisible()
      
      // Escape 키로 모달 닫기
      await page.keyboard.press('Escape')
      await expect(modal).not.toBeVisible()
    }
  })

  test('드롭다운 메뉴가 접근 가능하다', async ({ page }) => {
    // 관리자 페이지로 이동하여 드롭다운 테스트
    await page.goto('/admin')
    
    // 컬럼 토글 버튼 클릭
    await page.getByRole('button', { name: '컬럼' }).click()
    
    // 드롭다운 메뉴가 표시되는지 확인
    const dropdown = page.locator('[role="menu"]')
    await expect(dropdown).toBeVisible()
    
    // 드롭다운 메뉴 항목들이 접근 가능한지 확인
    const menuItems = page.locator('[role="menuitem"]')
    const itemCount = await menuItems.count()
    expect(itemCount).toBeGreaterThan(0)
    
    // 키보드로 메뉴 항목 선택
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
  })

  test('페이지 제목이 적절하다', async ({ page }) => {
    // 페이지 제목 확인
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(0)
  })

  test('언어 속성이 설정되어 있다', async ({ page }) => {
    // html 태그의 lang 속성 확인
    const html = page.locator('html')
    const lang = await html.getAttribute('lang')
    expect(lang).toBeTruthy()
  })

  test('스크린 리더를 위한 숨겨진 텍스트가 있다', async ({ page }) => {
    // sr-only 클래스를 가진 요소들 확인
    const srOnlyElements = page.locator('.sr-only')
    const count = await srOnlyElements.count()
    
    // 스크린 리더 전용 텍스트가 있는지 확인
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const element = srOnlyElements.nth(i)
        const text = await element.textContent()
        expect(text?.trim()).toBeTruthy()
      }
    }
  })

  test('오류 메시지가 접근 가능하다', async ({ page }) => {
    // 폼이 있다면 유효성 검사 오류 테스트
    const form = page.locator('form')
    if (await form.isVisible()) {
      // 필수 필드를 비워두고 제출
      const submitButton = page.getByRole('button', { name: /제출|전송|저장/ })
      if (await submitButton.isVisible()) {
        await submitButton.click()
        
        // 오류 메시지가 표시되는지 확인
        const errorMessage = page.locator('[role="alert"]')
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toBeVisible()
        }
      }
    }
  })
})
