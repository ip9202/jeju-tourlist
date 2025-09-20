/**
 * TabGroup 컴포넌트
 * 
 * @description
 * - 탭 그룹을 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <TabGroup
 *   tabs={[
 *     { id: 'tab1', label: '탭 1', content: '내용 1' },
 *     { id: 'tab2', label: '탭 2', content: '내용 2' }
 *   ]}
 *   activeTab="tab1"
 *   onTabChange={handleTabChange}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * 탭 그룹 컴포넌트 스타일 variants 정의
 */
const tabGroupVariants = cva(
  // 기본 스타일
  'w-full',
  {
    variants: {
      orientation: {
        horizontal: 'flex flex-col',
        vertical: 'flex flex-row',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      size: 'md',
    },
  }
);

/**
 * 탭 리스트 스타일 variants 정의
 */
const tabListVariants = cva(
  // 기본 스타일
  'flex border-b border-border',
  {
    variants: {
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col border-b-0 border-r border-border',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      size: 'md',
    },
  }
);

/**
 * 탭 버튼 스타일 variants 정의
 */
const tabButtonVariants = cva(
  // 기본 스타일
  'inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      orientation: {
        horizontal: 'border-b-2 border-transparent hover:border-muted-foreground',
        vertical: 'border-r-2 border-transparent hover:border-muted-foreground',
      },
      size: {
        sm: 'text-xs px-3 py-1.5',
        md: 'text-sm px-4 py-2',
        lg: 'text-base px-6 py-3',
      },
      active: {
        true: 'border-primary text-primary',
        false: 'text-muted-foreground hover:text-foreground',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      size: 'md',
      active: false,
    },
  }
);

/**
 * 탭 패널 스타일 variants 정의
 */
const tabPanelVariants = cva(
  // 기본 스타일
  'mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      orientation: {
        horizontal: 'mt-2',
        vertical: 'mt-0 ml-2',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
);

/**
 * 탭 타입 정의
 */
export interface Tab {
  /**
   * 탭 ID
   */
  id: string;
  
  /**
   * 탭 라벨
   */
  label: string;
  
  /**
   * 탭 내용
   */
  content: React.ReactNode;
  
  /**
   * 탭 비활성화 여부
   * @default false
   */
  disabled?: boolean;
  
  /**
   * 탭 아이콘
   */
  icon?: React.ReactNode;
  
  /**
   * 탭 배지
   */
  badge?: string | number;
  
  /**
   * 탭 도움말 텍스트
   */
  tooltip?: string;
}

/**
 * TabGroup 컴포넌트 Props 타입 정의
 */
export interface TabGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabGroupVariants> {
  /**
   * 탭 목록
   */
  tabs: Tab[];
  
  /**
   * 활성 탭 ID
   */
  activeTab: string;
  
  /**
   * 탭 변경 핸들러
   */
  onTabChange: (tabId: string) => void;
  
  /**
   * 탭 방향
   * @default "horizontal"
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * 탭 크기
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * 탭 전체 너비 사용 여부
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * 접근성을 위한 라벨
   */
  'aria-label'?: string;
  
  /**
   * 접근성을 위한 숨김 처리
   * @default false
   */
  'aria-hidden'?: boolean;
}

/**
 * TabGroup 컴포넌트
 * 
 * @param props - TabGroup 컴포넌트 props
 * @returns JSX.Element
 */
const TabGroup = React.forwardRef<HTMLDivElement, TabGroupProps>(
  (
    {
      className,
      tabs,
      activeTab,
      onTabChange,
      orientation = 'horizontal',
      size = 'md',
      fullWidth = false,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden = false,
      ...props
    },
    ref
  ) => {
    // 활성 탭 찾기
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    
    // 탭 변경 핸들러
    const handleTabChange = (tabId: string) => {
      const tab = tabs.find(t => t.id === tabId);
      if (tab && !tab.disabled) {
        onTabChange(tabId);
      }
    };
    
    // 키보드 네비게이션 핸들러
    const handleKeyDown = (event: React.KeyboardEvent, tabId: string) => {
      const currentIndex = tabs.findIndex(tab => tab.id === tabId);
      
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          handleTabChange(tabs[prevIndex].id);
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          handleTabChange(tabs[nextIndex].id);
          break;
        case 'Home':
          event.preventDefault();
          handleTabChange(tabs[0].id);
          break;
        case 'End':
          event.preventDefault();
          handleTabChange(tabs[tabs.length - 1].id);
          break;
      }
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          tabGroupVariants({
            orientation,
            size,
            className,
          })
        )}
        aria-label={ariaLabel || '탭 그룹'}
        aria-hidden={ariaHidden}
        {...props}
      >
        {/* 탭 리스트 */}
        <div
          role="tablist"
          className={cn(
            tabListVariants({
              orientation,
              size,
            }),
            fullWidth && 'w-full'
          )}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={tab.id === activeTab}
              aria-controls={`tabpanel-${tab.id}`}
              aria-disabled={tab.disabled}
              tabIndex={tab.id === activeTab ? 0 : -1}
              onClick={() => handleTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              className={cn(
                tabButtonVariants({
                  orientation,
                  size,
                  active: tab.id === activeTab,
                }),
                tab.disabled && 'opacity-50 cursor-not-allowed',
                fullWidth && 'flex-1'
              )}
              title={tab.tooltip}
            >
              {tab.icon && (
                <span className="mr-2" aria-hidden="true">
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* 탭 패널 */}
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className={cn(
            tabPanelVariants({
              orientation,
            })
          )}
        >
          {activeTabData?.content}
        </div>
      </div>
    );
  }
);

TabGroup.displayName = 'TabGroup';

export { TabGroup, tabGroupVariants, tabListVariants, tabButtonVariants, tabPanelVariants };
