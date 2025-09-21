/**
 * SearchBar 컴포넌트
 * 
 * @description
 * - 검색 바를 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <SearchBar
 *   placeholder="검색어를 입력하세요"
 *   onSearch={handleSearch}
 *   suggestions={['제주도', '여행', '맛집']}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Input, Button } from '../atoms';

/**
 * 검색 바 컴포넌트 스타일 variants 정의
 */
const searchBarVariants = cva(
  // 기본 스타일
  'relative w-full',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
      variant: {
        default: 'border border-input',
        filled: 'bg-muted',
        outline: 'border-2 border-input',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

/**
 * 검색 제안 타입 정의
 */
export interface SearchSuggestion {
  /**
   * 제안 ID
   */
  id: string;
  
  /**
   * 제안 텍스트
   */
  text: string;
  
  /**
   * 제안 타입
   */
  type?: 'recent' | 'popular' | 'category' | 'tag';
  
  /**
   * 제안 아이콘
   */
  icon?: React.ReactNode;
  
  /**
   * 제안 클릭 핸들러
   */
  onClick?: () => void;
}

/**
 * SearchBar 컴포넌트 Props 타입 정의
 */
export interface SearchBarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onSubmit' | 'size'>,
    VariantProps<typeof searchBarVariants> {
  /**
   * 검색어
   */
  value?: string;
  
  /**
   * 검색어 변경 핸들러
   */
  onChange?: (value: string) => void;
  
  /**
   * 검색 실행 핸들러
   */
  onSearch?: (query: string) => void;
  
  /**
   * 검색 제안 목록
   */
  suggestions?: SearchSuggestion[];
  
  /**
   * 검색 제안 표시 여부
   * @default true
   */
  showSuggestions?: boolean;
  
  /**
   * 최대 제안 수
   * @default 10
   */
  maxSuggestions?: number;
  
  /**
   * 검색 버튼 표시 여부
   * @default true
   */
  showSearchButton?: boolean;
  
  /**
   * 검색 버튼 텍스트
   * @default "검색"
   */
  searchButtonText?: string;
  
  /**
   * 검색 버튼 아이콘
   */
  searchButtonIcon?: React.ReactNode;
  
  /**
   * 필터 버튼 표시 여부
   * @default false
   */
  showFilterButton?: boolean;
  
  /**
   * 필터 버튼 클릭 핸들러
   */
  onFilterClick?: () => void;
  
  /**
   * 필터 버튼 아이콘
   */
  filterButtonIcon?: React.ReactNode;
  
  /**
   * 검색 히스토리 표시 여부
   * @default true
   */
  showHistory?: boolean;
  
  /**
   * 검색 히스토리 목록
   */
  history?: string[];
  
  /**
   * 검색 히스토리 삭제 핸들러
   */
  onHistoryDelete?: (query: string) => void;
  
  /**
   * 검색 히스토리 전체 삭제 핸들러
   */
  onHistoryClear?: () => void;
  
  /**
   * 로딩 상태
   * @default false
   */
  loading?: boolean;
  
  /**
   * 검색 바 전체 너비 사용 여부
   * @default true
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
 * SearchBar 컴포넌트
 * 
 * @param props - SearchBar 컴포넌트 props
 * @returns JSX.Element
 */
const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      className,
      value = '',
      onChange,
      onSearch,
      suggestions = [],
      showSuggestions = true,
      maxSuggestions = 10,
      showSearchButton = true,
      searchButtonText = '검색',
      searchButtonIcon,
      showFilterButton = false,
      onFilterClick,
      filterButtonIcon,
      showHistory = true,
      history = [],
      onHistoryDelete,
      onHistoryClear,
      loading = false,
      fullWidth = true,
      size,
      variant,
      placeholder = '검색어를 입력하세요',
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden = false,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const suggestionRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
    
    // 검색어 변경 핸들러
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange?.(newValue);
      setIsOpen(newValue.length > 0);
      setFocusedIndex(-1);
    };
    
    // 검색 실행 핸들러
    const handleSearch = (query: string) => {
      if (query.trim()) {
        onSearch?.(query.trim());
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    
    // 검색 버튼 클릭 핸들러
    const handleSearchClick = () => {
      handleSearch(value);
    };
    
    // 엔터 키 핸들러
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && suggestions[focusedIndex]) {
            const suggestion = suggestions[focusedIndex];
            onChange?.(suggestion.text);
            handleSearch(suggestion.text);
          } else {
            handleSearch(value);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
      }
    };
    
    // 제안 클릭 핸들러
    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
      onChange?.(suggestion.text);
      handleSearch(suggestion.text);
      suggestion.onClick?.();
    };
    
    // 히스토리 삭제 핸들러
    const handleHistoryDelete = (query: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onHistoryDelete?.(query);
    };
    
    // 포커스된 제안에 스크롤
    React.useEffect(() => {
      if (focusedIndex >= 0 && suggestionRefs.current[focusedIndex]) {
        suggestionRefs.current[focusedIndex]?.scrollIntoView({
          block: 'nearest',
        });
      }
    }, [focusedIndex]);
    
    // 검색 아이콘
    const SearchIcon = () => (
      <svg
        className="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    );
    
    // 필터 아이콘
    const FilterIcon = () => (
      <svg
        className="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
      </svg>
    );
    
    // 삭제 아이콘
    const DeleteIcon = () => (
      <svg
        className="h-3 w-3"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );
    
    return (
      <div
        className={cn(
          searchBarVariants({
            size,
            variant,
            className,
          }),
          fullWidth && 'w-full'
        )}
        aria-hidden={ariaHidden}
      >
        {/* 검색 입력 컨테이너 */}
        <div className="relative flex items-center">
          {/* 검색 입력 */}
          <Input
            ref={ref || inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              // 제안 클릭을 위해 약간의 지연
              setTimeout(() => setIsOpen(false), 200);
            }}
            placeholder={placeholder}
            className="pr-20"
            aria-label={ariaLabel || '검색어 입력'}
            {...props}
          />
          
          {/* 필터 버튼 */}
          {showFilterButton && (
            <button
              onClick={onFilterClick}
              className="absolute right-16 p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="필터"
            >
                {filterButtonIcon || <FilterIcon />}
            </button>
          )}
          
          {/* 검색 버튼 */}
          {showSearchButton && (
            <Button
              onClick={handleSearchClick}
              disabled={loading || !value.trim()}
              size="sm"
              className="absolute right-2"
              aria-label="검색"
            >
              {loading ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                searchButtonIcon || <SearchIcon />
              )}
            </Button>
          )}
        </div>
        
        {/* 검색 제안 드롭다운 */}
        {isOpen && showSuggestions && (suggestions.length > 0 || (showHistory && history.length > 0)) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {/* 검색 제안 */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  검색 제안
                </div>
                {suggestions.slice(0, maxSuggestions).map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    ref={el => { suggestionRefs.current[index] = el; }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                      'hover:bg-muted focus:bg-muted focus:outline-none',
                      focusedIndex === index && 'bg-muted'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {suggestion.icon && (
                        <span className="text-muted-foreground" aria-hidden="true">
                          {suggestion.icon}
                        </span>
                      )}
                      <span>{suggestion.text}</span>
                      {suggestion.type && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {suggestion.type}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* 검색 히스토리 */}
            {showHistory && history.length > 0 && (
              <div className="p-2 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    최근 검색
                  </div>
                  <button
                    onClick={onHistoryClear}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    전체 삭제
                  </button>
                </div>
                {history.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(query)}
                    className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                  >
                    <div className="flex items-center gap-2">
                      <SearchIcon />
                      <span className="flex-1">{query}</span>
                      <button
                        onClick={(e) => handleHistoryDelete(query, e)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                        aria-label={`${query} 삭제`}
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export { SearchBar, searchBarVariants };
