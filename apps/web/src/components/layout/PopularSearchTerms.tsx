// @TAG-FE-COMPONENT-001: PopularSearchTerms component for displaying top 5 search keywords
// SPEC: SPEC-FEATURE-SEARCH-001
// Phase 3: Frontend Component Implementation - PopularSearchTerms Component

"use client";

import React from "react";
import { usePopularSearchTerms } from "@/hooks/usePopularSearchTerms";
import { SearchTermBadge } from "./SearchTermBadge";

/**
 * Props for PopularSearchTerms component
 */
export interface PopularSearchTermsProps {
  /** Optional custom CSS classes for container styling */
  className?: string;
}

/**
 * Skeleton loader component for loading state
 * Displays 5 animated placeholder text while data is fetching
 */
const SkeletonLoader: React.FC = () => (
  <ul className="flex items-center gap-0 flex-wrap">
    {[1, 2, 3, 4, 5].map(index => (
      <li key={`skeleton-${index}`} className="mr-2 md:mr-3">
        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
      </li>
    ))}
  </ul>
);

/**
 * PopularSearchTerms Component
 *
 * Displays the top 5 popular search keywords fetched from the API.
 * Shows skeleton loaders during data fetch and gracefully handles errors
 * by displaying fallback keywords.
 *
 * Features:
 * - Real-time data from /api/search/popular endpoint
 * - SWR caching with 1-hour revalidation interval
 * - Skeleton loading state during initial fetch
 * - Fallback keywords on error or empty data
 * - List format with separator (·)
 * - Each keyword is clickable for search navigation
 *
 * Design:
 * - ul/li structure (Carrot Market style)
 * - Separated by " · "
 * - Responsive on all screen sizes
 *
 * @example
 * ```tsx
 * // Basic usage (in Header)
 * <PopularSearchTerms className="text-sm text-gray-600" />
 * ```
 */
export const PopularSearchTerms: React.FC<PopularSearchTermsProps> = ({
  className = "",
}) => {
  const { keywords, isLoading } = usePopularSearchTerms();

  // Show skeleton loaders while data is loading
  if (isLoading) {
    return <SkeletonLoader />;
  }

  // Render search terms as ul/li list (Carrot Market style)
  return (
    <ul className={`flex items-center gap-0 flex-wrap ${className}`}>
      {keywords.map((term, index) => (
        <li key={term.keyword} className="mr-2 md:mr-3">
          <SearchTermBadge keyword={term.keyword} />
          {/* Separator between keywords (not after last one) */}
          {index < keywords.length - 1 && (
            <span className="text-gray-300 ml-2 md:ml-3">·</span>
          )}
        </li>
      ))}
    </ul>
  );
};

// Export as default with React.memo for performance optimization
export default React.memo(PopularSearchTerms);
