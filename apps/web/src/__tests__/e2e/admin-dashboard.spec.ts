import { test, expect } from '@playwright/test'

/**
 * 관리자 대시보드 E2E 테스트
 * 새로운 UI 시스템의 관리자 페이지 기능을 테스트
 * 
 * SOLID 원칙 적용:
 * - Single Responsibility: 관리자 대시보드 E2E 테스트만 담당
 * - Open/Closed: 새로운 관리자 기능 테스트 추가 가능
 * - Liskov Substitution: 다양한 브라우저와 호환 가능
 * - Interface Segregation: 필요한 E2E 테스트만 구현
 * - Dependency Inversion: 외부 E2E 테스트 도구와 통합 가능
 */
test.describe('관리자 대시보드', () => {
  test.beforeEach(async ({ page }) => {
    // 관리자 페이지로 이동
    await page.goto('/admin')
  })

  test('페이지가 정상적으로 로드된다', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page.getByRole('heading', { name: '관리자 대시보드' })).toBeVisible()
    
    // 설명 텍스트 확인
    await expect(page.getByText('제주 여행 Q&A 커뮤니티 현황을 한눈에 확인하세요')).toBeVisible()
  })

  test('통계 카드들이 표시된다', async ({ page }) => {
    // 총 사용자 카드
    await expect(page.getByText('총 사용자')).toBeVisible()
    await expect(page.getByText('1,234')).toBeVisible()
    
    // 총 질문 카드
    await expect(page.getByText('총 질문')).toBeVisible()
    await expect(page.getByText('567')).toBeVisible()
    
    // 총 답변 카드
    await expect(page.getByText('총 답변')).toBeVisible()
    await expect(page.getByText('2,341')).toBeVisible()
    
    // 총 조회수 카드
    await expect(page.getByText('총 조회수')).toBeVisible()
    await expect(page.getByText('45,678')).toBeVisible()
  })

  test('탭 네비게이션이 작동한다', async ({ page }) => {
    // 기본적으로 사용자 랭킹 탭이 활성화되어 있음
    await expect(page.getByText('사용자 랭킹')).toBeVisible()
    
    // 질문 통계 탭 클릭
    await page.getByRole('tab', { name: '질문 통계' }).click()
    await expect(page.getByText('질문 통계')).toBeVisible()
    
    // 분석 탭 클릭
    await page.getByRole('tab', { name: '분석' }).click()
    await expect(page.getByText('주간 활동 현황')).toBeVisible()
  })

  test('사용자 랭킹 테이블이 정상 작동한다', async ({ page }) => {
    // 사용자 랭킹 탭이 활성화되어 있는지 확인
    await expect(page.getByRole('tab', { name: '사용자 랭킹' })).toHaveAttribute('data-state', 'active')
    
    // 테이블 헤더 확인
    await expect(page.getByText('순위')).toBeVisible()
    await expect(page.getByText('사용자')).toBeVisible()
    await expect(page.getByText('포인트')).toBeVisible()
    await expect(page.getByText('질문')).toBeVisible()
    await expect(page.getByText('답변')).toBeVisible()
    await expect(page.getByText('받은 좋아요')).toBeVisible()
    await expect(page.getByText('상태')).toBeVisible()
    await expect(page.getByText('최근 활동')).toBeVisible()
    
    // 사용자 데이터 확인
    await expect(page.getByText('김제주')).toBeVisible()
    await expect(page.getByText('kim@jeju.com')).toBeVisible()
    await expect(page.getByText('15,420점')).toBeVisible()
  })

  test('사용자 랭킹 테이블 정렬이 작동한다', async ({ page }) => {
    // 포인트 컬럼 정렬 버튼 클릭
    await page.getByRole('button', { name: '포인트' }).click()
    
    // 정렬된 데이터 확인 (내림차순)
    const firstRow = page.locator('tbody tr').first()
    await expect(firstRow.getByText('15,420점')).toBeVisible()
  })

  test('사용자 랭킹 테이블 검색이 작동한다', async ({ page }) => {
    // 검색 입력 필드에 텍스트 입력
    await page.getByPlaceholder('사용자 이름으로 검색...').fill('김')
    
    // 검색 결과 확인
    await expect(page.getByText('김제주')).toBeVisible()
    await expect(page.getByText('이여행')).not.toBeVisible()
  })

  test('사용자 랭킹 테이블 컬럼 토글이 작동한다', async ({ page }) => {
    // 컬럼 토글 버튼 클릭
    await page.getByRole('button', { name: '컬럼' }).click()
    
    // 드롭다운 메뉴 확인
    await expect(page.getByText('name')).toBeVisible()
    await expect(page.getByText('email')).toBeVisible()
    await expect(page.getByText('points')).toBeVisible()
    await expect(page.getByText('status')).toBeVisible()
  })

  test('사용자 랭킹 테이블 액션 메뉴가 작동한다', async ({ page }) => {
    // 첫 번째 행의 액션 버튼 클릭
    await page.locator('tbody tr').first().getByRole('button', { name: '메뉴 열기' }).click()
    
    // 액션 메뉴 확인
    await expect(page.getByText('작업')).toBeVisible()
    await expect(page.getByText('사용자 ID 복사')).toBeVisible()
    await expect(page.getByText('프로필 보기')).toBeVisible()
    await expect(page.getByText('메시지 보내기')).toBeVisible()
    await expect(page.getByText('사용자 차단')).toBeVisible()
  })

  test('질문 통계 테이블이 정상 작동한다', async ({ page }) => {
    // 질문 통계 탭 클릭
    await page.getByRole('tab', { name: '질문 통계' }).click()
    
    // 테이블 헤더 확인
    await expect(page.getByText('질문')).toBeVisible()
    await expect(page.getByText('작성자')).toBeVisible()
    await expect(page.getByText('조회수')).toBeVisible()
    await expect(page.getByText('답변')).toBeVisible()
    await expect(page.getByText('좋아요')).toBeVisible()
    await expect(page.getByText('상태')).toBeVisible()
    await expect(page.getByText('우선순위')).toBeVisible()
    await expect(page.getByText('작성일')).toBeVisible()
    
    // 질문 데이터 확인
    await expect(page.getByText('제주도 3박4일 여행 코스 추천해주세요')).toBeVisible()
    await expect(page.getByText('김제주')).toBeVisible()
  })

  test('질문 통계 테이블 검색이 작동한다', async ({ page }) => {
    // 질문 통계 탭 클릭
    await page.getByRole('tab', { name: '질문 통계' }).click()
    
    // 검색 입력 필드에 텍스트 입력
    await page.getByPlaceholder('질문 제목으로 검색...').fill('제주도')
    
    // 검색 결과 확인
    await expect(page.getByText('제주도 3박4일 여행 코스 추천해주세요')).toBeVisible()
    await expect(page.getByText('제주도 렌터카 추천 업체는?')).toBeVisible()
  })

  test('질문 통계 테이블 정렬이 작동한다', async ({ page }) => {
    // 질문 통계 탭 클릭
    await page.getByRole('tab', { name: '질문 통계' }).click()
    
    // 조회수 컬럼 정렬 버튼 클릭
    await page.getByRole('button', { name: '조회수' }).click()
    
    // 정렬된 데이터 확인
    const firstRow = page.locator('tbody tr').first()
    await expect(firstRow.getByText('2,100')).toBeVisible() // 가장 높은 조회수
  })

  test('페이지네이션이 작동한다', async ({ page }) => {
    // 사용자 랭킹 탭에서 페이지네이션 확인
    await expect(page.getByText('이전')).toBeVisible()
    await expect(page.getByText('다음')).toBeVisible()
    
    // 다음 페이지 버튼이 비활성화되어 있는지 확인 (데이터가 적어서)
    await expect(page.getByRole('button', { name: '다음' })).toBeDisabled()
  })

  test('반응형 디자인이 작동한다', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 })
    
    // 페이지가 정상적으로 로드되는지 확인
    await expect(page.getByRole('heading', { name: '관리자 대시보드' })).toBeVisible()
    
    // 통계 카드들이 세로로 배치되는지 확인
    const statsGrid = page.locator('.grid.gap-4.md\\:grid-cols-2.lg\\:grid-cols-4')
    await expect(statsGrid).toBeVisible()
  })

  test('접근성이 올바르게 구현되어 있다', async ({ page }) => {
    // 스킵 네비게이션 확인
    await page.keyboard.press('Tab')
    await expect(page.getByText('본문으로 건너뛰기')).toBeVisible()
    
    // 키보드 네비게이션 확인
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // 포커스가 올바르게 이동하는지 확인
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // ARIA 레이블 확인
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('다크 모드가 작동한다', async ({ page }) => {
    // 다크 모드 토글 버튼 클릭 (있다면)
    const themeToggle = page.getByRole('button', { name: /테마|다크|라이트/ })
    if (await themeToggle.isVisible()) {
      await themeToggle.click()
      
      // 다크 모드 스타일이 적용되는지 확인
      const body = page.locator('body')
      await expect(body).toHaveClass(/dark/)
    }
  })

  test('성능 모니터가 작동한다', async ({ page }) => {
    // 성능 모니터 버튼 클릭
    const performanceButton = page.getByRole('button', { name: '성능 모니터' })
    if (await performanceButton.isVisible()) {
      await performanceButton.click()
      
      // 성능 모니터 패널이 표시되는지 확인
      await expect(page.getByText('성능 모니터')).toBeVisible()
      await expect(page.getByText('실시간 성능 메트릭')).toBeVisible()
    }
  })
})
