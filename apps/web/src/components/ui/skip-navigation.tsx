import * as React from "react"
import { cn } from "../../lib/utils"

interface SkipLink {
  href: string
  label: string
  targetId: string
}

interface SkipNavigationProps {
  links: SkipLink[]
  className?: string
}

/**
 * 스킵 네비게이션 컴포넌트
 * 키보드 사용자를 위한 빠른 네비게이션 제공
 * WCAG 2.1 AA 가이드라인을 준수
 * 
 * SOLID 원칙 적용:
 * - Single Responsibility: 스킵 네비게이션 기능만 담당
 * - Open/Closed: 새로운 스킵 링크 추가 가능
 * - Liskov Substitution: 다양한 네비게이션 패턴과 호환 가능
 * - Interface Segregation: 필요한 스킵 링크만 노출
 * - Dependency Inversion: 외부 포커스 관리와 통합 가능
 */
export function SkipNavigation({ links, className }: SkipNavigationProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Tab 키를 누르면 스킵 네비게이션 표시
      if (event.key === "Tab" && !event.shiftKey) {
        setIsVisible(true)
      }
    }

    const handleClick = () => {
      setIsVisible(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("click", handleClick)
    }
  }, [])

  const handleSkipLinkClick = (targetId: string) => {
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      targetElement.focus()
      targetElement.scrollIntoView({ behavior: "smooth" })
    }
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 z-50 w-full bg-background border-b shadow-sm",
        className
      )}
      role="navigation"
      aria-label="스킵 네비게이션"
    >
      <div className="container mx-auto px-4 py-2">
        <ul className="flex flex-wrap gap-4">
          {links.map((link) => (
            <li key={link.href}>
              <button
                className="px-3 py-2 text-sm font-medium text-foreground bg-transparent border border-border rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                onClick={() => handleSkipLinkClick(link.targetId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleSkipLinkClick(link.targetId)
                  }
                }}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * 기본 스킵 네비게이션 링크들
 */
export const defaultSkipLinks: SkipLink[] = [
  {
    href: "#main-content",
    label: "본문으로 건너뛰기",
    targetId: "main-content"
  },
  {
    href: "#navigation",
    label: "네비게이션으로 건너뛰기",
    targetId: "navigation"
  },
  {
    href: "#search",
    label: "검색으로 건너뛰기",
    targetId: "search"
  },
  {
    href: "#footer",
    label: "푸터로 건너뛰기",
    targetId: "footer"
  }
]

/**
 * 접근성을 개선한 포커스 트랩 컴포넌트
 */
interface FocusTrapProps {
  children: React.ReactNode
  active: boolean
  className?: string
}

export function FocusTrap({ children, active, className }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener("keydown", handleTabKey)
    firstElement?.focus()

    return () => {
      document.removeEventListener("keydown", handleTabKey)
    }
  }, [active])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}
