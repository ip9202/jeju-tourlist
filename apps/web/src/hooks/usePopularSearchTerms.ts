// @TAG-FE-HOOK-001: Custom hook for fetching popular search terms
// SPEC: SPEC-FEATURE-SEARCH-001
// Phase 3: Frontend Component Implementation - usePopularSearchTerms Hook

import useSWR from 'swr';

/**
 * SearchTerm interface representing a popular search keyword with metadata
 */
export interface SearchTerm {
  rank: number;
  keyword: string;
  popularity: number;
}

/**
 * Fallback keywords displayed when API fails or returns no data
 * These represent the most common Jeju tourism-related searches
 */
const FALLBACK_KEYWORDS: SearchTerm[] = [
  { rank: 1, keyword: '제주도 맛집', popularity: 0 },
  { rank: 2, keyword: '한라산 등반', popularity: 0 },
  { rank: 3, keyword: '섭지코지', popularity: 0 },
  { rank: 4, keyword: '우도 여행', popularity: 0 },
  { rank: 5, keyword: '제주 카페', popularity: 0 },
];

/**
 * Fetcher function for SWR to fetch data from API
 * @param url - API endpoint URL
 * @returns Promise resolving to SearchTerm array
 */
const fetcher = async (url: string): Promise<SearchTerm[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch popular search terms');
  }
  return response.json();
};

/**
 * Hook return type
 */
interface UsePopularSearchTermsReturn {
  keywords: SearchTerm[];
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

/**
 * Custom hook to fetch and manage popular search terms from API
 *
 * Features:
 * - Fetches top N popular search keywords from /api/search/popular
 * - Uses SWR with 1-hour cache and revalidation interval
 * - Returns fallback keywords on error or empty data
 * - Supports manual refetch via mutate()
 * - Disables automatic revalidation on focus/reconnect
 *
 * @param limit - Number of keywords to fetch (default: 5)
 * @returns Object containing keywords array, loading state, error, and mutate function
 *
 * @example
 * ```tsx
 * const { keywords, isLoading, error, mutate } = usePopularSearchTerms(5);
 *
 * if (isLoading) return <Skeleton />;
 * if (error) console.error('Failed to load keywords');
 *
 * return (
 *   <div>
 *     {keywords.map(term => (
 *       <Badge key={term.keyword} rank={term.rank} keyword={term.keyword} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function usePopularSearchTerms(
  limit: number = 5
): UsePopularSearchTermsReturn {
  const { data, error, isLoading, mutate } = useSWR<SearchTerm[]>(
    `/api/search/popular?limit=${limit}`,
    fetcher,
    {
      // Disable automatic revalidation
      revalidateOnFocus: false,
      revalidateOnReconnect: false,

      // Cache data for 1 hour (3600000ms)
      dedupingInterval: 3600000,
      focusThrottleInterval: 3600000,

      // Retry on error
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  // Return fallback keywords if data is undefined, empty, or error occurred
  const keywords = (data && data.length > 0) ? data : FALLBACK_KEYWORDS;

  return {
    keywords,
    isLoading,
    error,
    mutate,
  };
}
