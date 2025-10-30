// @TAG-FE-TEST-001: Test suite for SearchTermBadge component
// SPEC: SPEC-FEATURE-SEARCH-001
// Phase 3: Frontend Component Implementation - SearchTermBadge Tests

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchTermBadge } from '../SearchTermBadge';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('SearchTermBadge', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  // [T-FE-15] Badge renders keyword text
  it('should render keyword text correctly', () => {
    render(<SearchTermBadge rank={1} keyword="제주도 맛집" />);

    expect(screen.getByText('제주도 맛집')).toBeInTheDocument();
  });

  it('should render different keywords', () => {
    const { rerender } = render(<SearchTermBadge rank={1} keyword="한라산 등반" />);
    expect(screen.getByText('한라산 등반')).toBeInTheDocument();

    rerender(<SearchTermBadge rank={2} keyword="섭지코지" />);
    expect(screen.getByText('섭지코지')).toBeInTheDocument();

    rerender(<SearchTermBadge rank={3} keyword="우도 여행" />);
    expect(screen.getByText('우도 여행')).toBeInTheDocument();

    rerender(<SearchTermBadge rank={4} keyword="제주 카페" />);
    expect(screen.getByText('제주 카페')).toBeInTheDocument();

    rerender(<SearchTermBadge rank={5} keyword="해수욕장" />);
    expect(screen.getByText('해수욕장')).toBeInTheDocument();
  });

  // [T-FE-16] Badge has correct text link styling
  it('should apply text link styling', () => {
    const { container } = render(<SearchTermBadge rank={1} keyword="제주도 맛집" />);
    const button = container.querySelector('button');

    expect(button).toHaveClass('text-blue-600');
    expect(button).toHaveClass('hover:text-blue-800');
    expect(button).toHaveClass('hover:underline');
    expect(button).toHaveClass('cursor-pointer');
    expect(button).toHaveClass('transition-colors');
  });

  // [T-FE-17] Badge is clickable and triggers search navigation
  it('should navigate to search results when clicked', () => {
    render(<SearchTermBadge rank={1} keyword="제주도 맛집" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith('/search?q=%EC%A0%9C%EC%A3%BC%EB%8F%84%20%EB%A7%9B%EC%A7%91');
  });

  it('should properly encode special characters in keyword', () => {
    render(<SearchTermBadge rank={1} keyword="한라산 등산 & 맛집" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/search?q='));
    expect(mockPush.mock.calls[0][0]).toContain('%26'); // & encoded
  });

  it('should call custom onClick handler if provided', () => {
    const customOnClick = jest.fn();
    render(<SearchTermBadge rank={1} keyword="제주도 맛집" onClick={customOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(customOnClick).toHaveBeenCalledTimes(1);
  });

  it('should render as a button element', () => {
    render(<SearchTermBadge rank={1} keyword="제주도 맛집" />);

    const button = screen.getByRole('button');
    expect(button.tagName).toBe('BUTTON');
  });

  it('should have proper accessibility attributes', () => {
    render(<SearchTermBadge rank={1} keyword="제주도 맛집" />);

    const button = screen.getByRole('button', { name: /제주도 맛집/ });
    expect(button).toHaveAttribute('aria-label', 'Search for 제주도 맛집');
  });
});
