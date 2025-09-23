import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"

interface NavigationItem {
  id: string
  label: string
  href?: string
  icon?: React.ReactNode
  children?: NavigationItem[]
  disabled?: boolean
  current?: boolean
}

interface AccessibleNavigationProps {
  items: NavigationItem[]
  orientation?: "horizontal" | "vertical"
  className?: string
  onItemClick?: (item: NavigationItem) => void
}

/**
 * 접근성을 개선한 네비게이션 컴포넌트
 * WCAG 2.1 AA 가이드라인을 준수
 * 
 * SOLID 원칙 적용:
 * - Single Responsibility: 접근성이 개선된 네비게이션 렌더링만 담당
 * - Open/Closed: 새로운 네비게이션 타입 추가 가능
 * - Liskov Substitution: 다양한 네비게이션 패턴과 호환 가능
 * - Interface Segregation: 필요한 접근성 props만 노출
 * - Dependency Inversion: 외부 라우팅 시스템과 통합 가능
 */
export function AccessibleNavigation({
  items,
  orientation = "horizontal",
  className,
  onItemClick,
}: AccessibleNavigationProps) {
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null)
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set())

  const handleKeyDown = (event: React.KeyboardEvent, item: NavigationItem) => {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault()
        if (item.children) {
          toggleExpanded(item.id)
        } else {
          handleItemClick(item)
        }
        break
      case "ArrowDown":
        if (orientation === "horizontal" && item.children) {
          event.preventDefault()
          setExpandedItems(prev => new Set(prev).add(item.id))
        }
        break
      case "ArrowUp":
        if (orientation === "horizontal" && item.children) {
          event.preventDefault()
          setExpandedItems(prev => {
            const newSet = new Set(prev)
            newSet.delete(item.id)
            return newSet
          })
        }
        break
      case "Escape":
        setExpandedItems(new Set())
        setActiveItemId(null)
        break
    }
  }

  const handleItemClick = (item: NavigationItem) => {
    if (item.disabled) return
    
    setActiveItemId(item.id)
    onItemClick?.(item)
  }

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isExpanded = expandedItems.has(item.id)
    const isActive = activeItemId === item.id || item.current
    const hasChildren = item.children && item.children.length > 0

    return (
      <li key={item.id} className="relative">
        <div
          className={cn(
            "flex items-center justify-between",
            level > 0 && "ml-4"
          )}
        >
          <a
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent text-accent-foreground",
              item.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
              level > 0 && "text-sm"
            )}
            tabIndex={item.disabled ? -1 : 0}
            aria-current={isActive ? "page" : undefined}
            aria-disabled={item.disabled}
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-haspopup={hasChildren ? "true" : undefined}
            onKeyDown={(e) => handleKeyDown(e, item)}
            onClick={() => handleItemClick(item)}
          >
            {item.icon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
            {hasChildren && (
              <span className="flex-shrink-0" aria-hidden="true">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
            )}
          </a>
        </div>

        {/* 하위 메뉴 */}
        {hasChildren && isExpanded && (
          <ul
            className={cn(
              "mt-1 space-y-1",
              orientation === "horizontal" && "absolute top-full left-0 z-50 min-w-[200px] bg-popover border rounded-md shadow-lg"
            )}
            role="menu"
            aria-label={`${item.label} 하위 메뉴`}
          >
            {item.children.map((child) => renderNavigationItem(child, level + 1))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <nav
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-row space-x-1" : "flex-col space-y-1",
        className
      )}
      role="navigation"
      aria-label="주요 네비게이션"
    >
      <ul
        className={cn(
          "flex",
          orientation === "horizontal" ? "flex-row space-x-1" : "flex-col space-y-1"
        )}
        role="menubar"
      >
        {items.map((item) => renderNavigationItem(item))}
      </ul>
    </nav>
  )
}

/**
 * 접근성을 개선한 브레드크럼 컴포넌트
 */
interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface AccessibleBreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  separator?: React.ReactNode
}

export function AccessibleBreadcrumb({
  items,
  className,
  separator = "/",
}: AccessibleBreadcrumbProps) {
  return (
    <nav
      className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
      aria-label="브레드크럼 네비게이션"
    >
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2" aria-hidden="true">
                {separator}
              </span>
            )}
            {item.current ? (
              <span
                className="font-medium text-foreground"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="hover:text-foreground transition-colors"
                aria-label={`${item.label}로 이동`}
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
