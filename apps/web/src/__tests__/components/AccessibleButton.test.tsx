import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccessibleButton } from '@/components/ui/accessible-button'

/**
 * AccessibleButton 컴포넌트 테스트
 * 접근성 기능과 키보드 네비게이션을 테스트
 * 
 * SOLID 원칙 적용:
 * - Single Responsibility: AccessibleButton 컴포넌트 테스트만 담당
 * - Open/Closed: 새로운 접근성 테스트 케이스 추가 가능
 * - Liskov Substitution: 다양한 버튼 타입과 호환 가능
 * - Interface Segregation: 필요한 접근성 테스트만 구현
 * - Dependency Inversion: 외부 테스트 라이브러리와 통합 가능
 */
describe('AccessibleButton', () => {
  it('renders button with children', () => {
    render(
      <AccessibleButton>
        클릭하세요
      </AccessibleButton>
    )

    expect(screen.getByRole('button', { name: '클릭하세요' })).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <AccessibleButton className="custom-class">
        버튼
      </AccessibleButton>
    )

    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(
      <AccessibleButton onClick={handleClick}>
        클릭하세요
      </AccessibleButton>
    )

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('handles keyboard events (Enter and Space)', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(
      <AccessibleButton onClick={handleClick}>
        클릭하세요
      </AccessibleButton>
    )

    const button = screen.getByRole('button')
    
    // Enter 키 테스트
    await user.type(button, '{Enter}')
    expect(handleClick).toHaveBeenCalledTimes(1)

    // Space 키 테스트
    await user.type(button, ' ')
    expect(handleClick).toHaveBeenCalledTimes(2)
  })

  it('shows aria-label when provided', () => {
    render(
      <AccessibleButton aria-label="사용자 추가">
        +
      </AccessibleButton>
    )

    expect(screen.getByRole('button', { name: '사용자 추가' })).toBeInTheDocument()
  })

  it('shows aria-description when provided', () => {
    render(
      <AccessibleButton
        id="test-button"
        ariaDescription="새로운 사용자를 추가합니다"
      >
        +
      </AccessibleButton>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-describedby', 'test-button-description')
    expect(screen.getByText('새로운 사용자를 추가합니다')).toBeInTheDocument()
  })

  it('shows keyboard shortcut when provided', () => {
    render(
      <AccessibleButton keyboardShortcut="a">
        추가
      </AccessibleButton>
    )

    expect(screen.getByText('⌘a')).toBeInTheDocument()
  })

  it('handles keyboard shortcut (Ctrl+key)', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(
      <AccessibleButton
        onClick={handleClick}
        keyboardShortcut="a"
      >
        추가
      </AccessibleButton>
    )

    // Ctrl+a 키 조합 테스트
    await user.keyboard('{Control>}a{/Control}')
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies correct variant based on importance', () => {
    const { rerender } = render(
      <AccessibleButton importance="primary">
        기본
      </AccessibleButton>
    )

    expect(screen.getByRole('button')).toHaveClass('bg-primary')

    rerender(
      <AccessibleButton importance="secondary">
        보조
      </AccessibleButton>
    )

    expect(screen.getByRole('button')).toHaveClass('border')

    rerender(
      <AccessibleButton importance="tertiary">
        차
      </AccessibleButton>
    )

    expect(screen.getByRole('button')).toHaveClass('hover:bg-accent')
  })

  it('handles different states correctly', () => {
    const { rerender } = render(
      <AccessibleButton state="loading">
        로딩 중
      </AccessibleButton>
    )

    expect(screen.getByRole('button')).toHaveClass('opacity-50', 'cursor-not-allowed')

    rerender(
      <AccessibleButton state="pressed">
        눌림
      </AccessibleButton>
    )

    expect(screen.getByRole('button')).toHaveClass('scale-95')

    rerender(
      <AccessibleButton state="disabled">
        비활성
      </AccessibleButton>
    )

    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
  })

  it('maintains minimum touch target size', () => {
    render(
      <AccessibleButton>
        작은 버튼
      </AccessibleButton>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass('min-h-[44px]', 'min-w-[44px]')
  })

  it('applies focus styles correctly', () => {
    render(
      <AccessibleButton>
        포커스 테스트
      </AccessibleButton>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-ring')
  })

  it('handles disabled state correctly', () => {
    render(
      <AccessibleButton disabled>
        비활성 버튼
      </AccessibleButton>
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })

  it('combines aria-label with description and shortcut', () => {
    render(
      <AccessibleButton
        id="complex-button"
        aria-label="사용자 추가"
        ariaDescription="새로운 사용자를 시스템에 추가합니다"
        keyboardShortcut="a"
      >
        +
      </AccessibleButton>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', '사용자 추가, 새로운 사용자를 시스템에 추가합니다, 단축키: Ctrl+a')
  })

  it('handles press state with keyboard', async () => {
    const user = userEvent.setup()

    render(
      <AccessibleButton>
        눌림 테스트
      </AccessibleButton>
    )

    const button = screen.getByRole('button')
    
    // Space 키를 누르고 있을 때
    await user.keyboard(' ')
    expect(button).toHaveAttribute('aria-pressed', 'true')

    // Space 키를 놓을 때
    await user.keyboard(' ')
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })
})
