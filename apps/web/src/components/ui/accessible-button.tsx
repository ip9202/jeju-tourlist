import * as React from "react"
import { Button, ButtonProps } from "./button"
import { cn } from "../../lib/utils"

interface AccessibleButtonProps extends ButtonProps {
  /**
   * 스크린 리더를 위한 추가 설명
   */
  ariaDescription?: string
  /**
   * 키보드 단축키 설명
   */
  keyboardShortcut?: string
  /**
   * 버튼의 상태 (예: loading, disabled, pressed)
   */
  state?: "idle" | "loading" | "pressed" | "disabled"
  /**
   * 버튼의 중요도 레벨
   */
  importance?: "primary" | "secondary" | "tertiary"
}

/**
 * 접근성을 개선한 버튼 컴포넌트
 * WCAG 2.1 AA 가이드라인을 준수
 * 
 * SOLID 원칙 적용:
 * - Single Responsibility: 접근성 기능이 포함된 버튼 렌더링만 담당
 * - Open/Closed: 새로운 접근성 기능 추가 가능
 * - Liskov Substitution: 기본 Button과 호환 가능
 * - Interface Segregation: 필요한 접근성 props만 노출
 * - Dependency Inversion: 외부 접근성 도구와 통합 가능
 */
export const AccessibleButton = React.forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps
>(({ 
  className, 
  ariaDescription, 
  keyboardShortcut,
  state = "idle",
  importance = "primary",
  children,
  ...props 
}, ref) => {
  const [isPressed, setIsPressed] = React.useState(false)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // Enter와 Space 키로 버튼 활성화
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      setIsPressed(true)
    }
    
    // 키보드 단축키 처리
    if (keyboardShortcut && event.ctrlKey && event.key === keyboardShortcut) {
      event.preventDefault()
      props.onClick?.(event as any)
    }
  }

  const handleKeyUp = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      setIsPressed(false)
    }
  }

  const getAriaLabel = () => {
    let label = props["aria-label"] || ""
    if (ariaDescription) {
      label += `, ${ariaDescription}`
    }
    if (keyboardShortcut) {
      label += `, 단축키: Ctrl+${keyboardShortcut}`
    }
    return label
  }

  const getVariant = () => {
    if (props.variant) return props.variant
    
    switch (importance) {
      case "primary":
        return "default"
      case "secondary":
        return "outline"
      case "tertiary":
        return "ghost"
      default:
        return "default"
    }
  }

  return (
    <Button
      ref={ref}
      className={cn(
        // 접근성을 위한 최소 터치 타겟 크기 (44px)
        "min-h-[44px] min-w-[44px]",
        // 포커스 표시 개선
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // 상태별 스타일
        state === "loading" && "opacity-50 cursor-not-allowed",
        state === "pressed" && "scale-95",
        className
      )}
      variant={getVariant()}
      aria-label={getAriaLabel()}
      aria-pressed={isPressed || state === "pressed"}
      aria-disabled={state === "disabled" || props.disabled}
      aria-describedby={ariaDescription ? `${props.id}-description` : undefined}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      {...props}
    >
      {children}
      
      {/* 스크린 리더를 위한 숨겨진 설명 */}
      {ariaDescription && (
        <span
          id={`${props.id}-description`}
          className="sr-only"
        >
          {ariaDescription}
        </span>
      )}
      
      {/* 키보드 단축키 표시 */}
      {keyboardShortcut && (
        <kbd className="ml-2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>{keyboardShortcut}
        </kbd>
      )}
    </Button>
  )
})

AccessibleButton.displayName = "AccessibleButton"
