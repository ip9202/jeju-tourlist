// @TAG-FE-COMPONENT-001: SearchTermBadge component for displaying individual search keywords
// SPEC: SPEC-FEATURE-SEARCH-001
// Phase 3: Frontend Component Implementation - SearchTermBadge Component

"use client";

import React from "react";
import { useRouter } from "next/navigation";

/**
 * Props for SearchTermBadge component
 */
export interface SearchTermBadgeProps {
  /** Search keyword text to display */
  keyword: string;
  /** Optional custom click handler (overrides default navigation) */
  onClick?: () => void;
}

/**
 * SearchTermBadge Component
 *
 * Displays a single popular search keyword as a clickable text link.
 * Clicking navigates to search results page with the keyword.
 *
 * Features:
 * - Simple text link styling (blue text with underline on hover)
 * - Click to navigate to search results
 * - Hover effect with color transition
 * - Proper accessibility (link semantics)
 *
 * @example
 * ```tsx
 * <SearchTermBadge keyword="제주도 맛집" />
 * <SearchTermBadge keyword="한라산 등반" onClick={customHandler} />
 * ```
 */
export const SearchTermBadge: React.FC<SearchTermBadgeProps> = ({
  keyword,
  onClick,
}: SearchTermBadgeProps) => {
  const router = useRouter();

  /**
   * Handle link click - navigate to search results or call custom handler
   */
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    } else {
      // Navigate to search results page with encoded keyword
      e.preventDefault();
      router.push(`/search?q=${encodeURIComponent(keyword)}`);
    }
  };

  return (
    <a
      onClick={handleClick}
      href={`/search?q=${encodeURIComponent(keyword)}`}
      className="inline-flex items-center px-0 text-xs text-gray-600 hover:text-blue-600 cursor-pointer transition-colors duration-150"
      aria-label={`Search for ${keyword}`}
    >
      {keyword}
    </a>
  );
};

// Memoize component to prevent unnecessary re-renders
export default React.memo(SearchTermBadge);
