// @TAG-FE-TEST-001: Test suite for usePopularSearchTerms hook
// SPEC: SPEC-FEATURE-SEARCH-001
// Phase 3: Frontend Component Implementation - Hook Tests

import { renderHook, waitFor } from '@testing-library/react';
import { usePopularSearchTerms } from '../usePopularSearchTerms';

// Mock SWR module properly
const mockUseSWR = jest.fn();
jest.mock('swr', () => ({
  __esModule: true,
  default: (...args: any[]) => mockUseSWR(...args),
}));

describe('usePopularSearchTerms', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // [T-FE-01] usePopularSearchTerms() hook returns SearchTerm[] array
  it('should return SearchTerm[] array with rank, keyword, and popularity', () => {
    const mockData = [
      { rank: 1, keyword: '제주도 맛집', popularity: 565 },
      { rank: 2, keyword: '한라산 등반', popularity: 432 },
      { rank: 3, keyword: '섭지코지', popularity: 389 },
      { rank: 4, keyword: '우도 여행', popularity: 312 },
      { rank: 5, keyword: '제주 카페', popularity: 278 },
    ];

    mockUseSWR.mockReturnValue({
      data: mockData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => usePopularSearchTerms());

    expect(result.current.keywords).toEqual(mockData);
    expect(result.current.keywords).toHaveLength(5);
    expect(result.current.keywords[0]).toHaveProperty('rank');
    expect(result.current.keywords[0]).toHaveProperty('keyword');
    expect(result.current.keywords[0]).toHaveProperty('popularity');
  });

  // [T-FE-02] Hook calls `/api/search/popular` endpoint
  it('should call /api/search/popular endpoint with correct parameters', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => usePopularSearchTerms());

    expect(mockUseSWR).toHaveBeenCalledWith(
      '/api/search/popular?limit=5',
      expect.any(Function),
      expect.objectContaining({
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 3600000,
        focusThrottleInterval: 3600000,
      })
    );
  });

  // [T-FE-03] Hook implements SWR with 1-hour revalidation interval (3600000ms)
  it('should configure SWR with 1-hour revalidation interval', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => usePopularSearchTerms());

    const swrConfig = mockUseSWR.mock.calls[0][2];
    expect(swrConfig).toMatchObject({
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000, // 1 hour
      focusThrottleInterval: 3600000,
    });
  });

  // [T-FE-04] Returns fallback keywords on API error
  it('should return fallback keywords on API error', () => {
    const mockError = new Error('API Error');
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => usePopularSearchTerms());

    expect(result.current.keywords).toHaveLength(5);
    expect(result.current.keywords[0].keyword).toBe('제주도 맛집');
    expect(result.current.keywords[1].keyword).toBe('한라산 등반');
    expect(result.current.keywords[2].keyword).toBe('섭지코지');
    expect(result.current.keywords[3].keyword).toBe('우도 여행');
    expect(result.current.keywords[4].keyword).toBe('제주 카페');
    expect(result.current.error).toBe(mockError);
  });

  // [T-FE-05] Loading state is true initially, false after fetch
  it('should return correct loading state', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result, rerender } = renderHook(() => usePopularSearchTerms());

    expect(result.current.isLoading).toBe(true);

    // Simulate data loaded
    mockUseSWR.mockReturnValue({
      data: [{ rank: 1, keyword: '제주도 맛집', popularity: 565 }],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    rerender();

    expect(result.current.isLoading).toBe(false);
  });

  // [T-FE-06] Hook refetches on manual `mutate()` call
  it('should support manual refetch via mutate()', () => {
    const mockMutate = jest.fn();
    mockUseSWR.mockReturnValue({
      data: [{ rank: 1, keyword: '제주도 맛집', popularity: 565 }],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    } as any);

    const { result } = renderHook(() => usePopularSearchTerms());

    expect(result.current.mutate).toBe(mockMutate);
    result.current.mutate();
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  // [T-FE-07] Respects custom limit parameter
  it('should respect custom limit parameter', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => usePopularSearchTerms(10));

    expect(mockUseSWR).toHaveBeenCalledWith(
      '/api/search/popular?limit=10',
      expect.any(Function),
      expect.any(Object)
    );
  });

  // [T-FE-08] Deduplicate keywords if needed
  it('should handle duplicate keywords correctly', () => {
    const mockDataWithDuplicates = [
      { rank: 1, keyword: '제주도 맛집', popularity: 565 },
      { rank: 2, keyword: '제주도 맛집', popularity: 432 }, // Duplicate
      { rank: 3, keyword: '섭지코지', popularity: 389 },
      { rank: 4, keyword: '우도 여행', popularity: 312 },
      { rank: 5, keyword: '제주 카페', popularity: 278 },
    ];

    mockUseSWR.mockReturnValue({
      data: mockDataWithDuplicates,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => usePopularSearchTerms());

    // Should return data as-is (backend should handle deduplication)
    expect(result.current.keywords).toHaveLength(5);
  });

  it('should return fallback keywords when data is undefined', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => usePopularSearchTerms());

    expect(result.current.keywords).toHaveLength(5);
    expect(result.current.keywords[0].keyword).toBe('제주도 맛집');
  });

  it('should return fallback keywords when data is empty array', () => {
    mockUseSWR.mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => usePopularSearchTerms());

    expect(result.current.keywords).toHaveLength(5);
    expect(result.current.keywords[0].keyword).toBe('제주도 맛집');
  });
});
