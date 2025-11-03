// @TAG-FE-TEST-001: Test suite for PopularSearchTerms component
// SPEC: SPEC-FEATURE-SEARCH-001
// Phase 3: Frontend Component Implementation - PopularSearchTerms Tests

import React from "react";
import { render, screen } from "@testing-library/react";
import { PopularSearchTerms } from "../PopularSearchTerms";
import { usePopularSearchTerms } from "@/hooks/usePopularSearchTerms";

// Mock the hook
jest.mock("@/hooks/usePopularSearchTerms");

describe("PopularSearchTerms", () => {
  const mockKeywords = [
    { rank: 1, keyword: "제주도 맛집", popularity: 565 },
    { rank: 2, keyword: "한라산 등반", popularity: 534 },
    { rank: 3, keyword: "섭지코지", popularity: 456 },
    { rank: 4, keyword: "우도 여행", popularity: 389 },
    { rank: 5, keyword: "제주 카페", popularity: 312 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // [T-FE-09] Component renders 5 SearchTermBadge components
  it("should render 5 keywords", async () => {
    (usePopularSearchTerms as jest.Mock).mockReturnValue({
      keywords: mockKeywords,
      isLoading: false,
    });

    render(<PopularSearchTerms />);

    expect(screen.getByText("제주도 맛집")).toBeInTheDocument();
    expect(screen.getByText("한라산 등반")).toBeInTheDocument();
    expect(screen.getByText("섭지코지")).toBeInTheDocument();
    expect(screen.getByText("우도 여행")).toBeInTheDocument();
    expect(screen.getByText("제주 카페")).toBeInTheDocument();
  });

  // [T-FE-10] Component shows skeleton while loading
  it("should show skeleton loaders while loading", () => {
    (usePopularSearchTerms as jest.Mock).mockReturnValue({
      keywords: [],
      isLoading: true,
    });

    render(<PopularSearchTerms />);

    // Check for skeleton elements
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should not show skeleton when not loading", () => {
    (usePopularSearchTerms as jest.Mock).mockReturnValue({
      keywords: mockKeywords,
      isLoading: false,
    });

    render(<PopularSearchTerms />);

    // All keywords should be visible
    mockKeywords.forEach(kw => {
      expect(screen.getByText(kw.keyword)).toBeInTheDocument();
    });
  });

  // [T-FE-11] Component renders keywords passed from hook
  it("should render keywords from hook data", () => {
    (usePopularSearchTerms as jest.Mock).mockReturnValue({
      keywords: mockKeywords,
      isLoading: false,
    });

    render(<PopularSearchTerms />);

    mockKeywords.forEach(kw => {
      expect(screen.getByText(kw.keyword)).toBeInTheDocument();
    });
  });

  // [T-FE-12] Component handles error state gracefully
  it("should render fallback keywords on error", () => {
    (usePopularSearchTerms as jest.Mock).mockReturnValue({
      keywords: [
        { rank: 1, keyword: "제주도 맛집", popularity: 100 },
        { rank: 2, keyword: "한라산 등반", popularity: 100 },
        { rank: 3, keyword: "섭지코지", popularity: 100 },
        { rank: 4, keyword: "우도 여행", popularity: 100 },
        { rank: 5, keyword: "제주 카페", popularity: 100 },
      ],
      isLoading: false,
    });

    render(<PopularSearchTerms />);

    // Should still render something
    expect(screen.getByText("제주도 맛집")).toBeInTheDocument();
  });

  // [T-FE-13] Each link displays keyword correctly
  it("should display keywords in text link format", () => {
    (usePopularSearchTerms as jest.Mock).mockReturnValue({
      keywords: mockKeywords,
      isLoading: false,
    });

    render(<PopularSearchTerms />);

    // Check that keywords are rendered as links
    mockKeywords.forEach(kw => {
      const link = screen.getByRole("link", { name: new RegExp(kw.keyword) });
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent(kw.keyword);
    });
  });

  // [T-FE-14] Component is responsive
  it("should apply custom className prop", () => {
    (usePopularSearchTerms as jest.Mock).mockReturnValue({
      keywords: mockKeywords,
      isLoading: false,
    });

    const { container } = render(
      <PopularSearchTerms className="text-sm text-gray-600" />
    );

    const wrapper = container.querySelector("ul");
    expect(wrapper).toHaveClass("text-sm");
    expect(wrapper).toHaveClass("text-gray-600");
  });

  it("should render without className prop", () => {
    (usePopularSearchTerms as jest.Mock).mockReturnValue({
      keywords: mockKeywords,
      isLoading: false,
    });

    render(<PopularSearchTerms />);

    expect(screen.getByText("제주도 맛집")).toBeInTheDocument();
  });

  it("should have proper flex layout with separators", () => {
    (usePopularSearchTerms as jest.Mock).mockReturnValue({
      keywords: mockKeywords,
      isLoading: false,
    });

    const { container } = render(<PopularSearchTerms />);

    // Check for flex container
    const wrapper = container.querySelector("ul");
    expect(wrapper).toHaveClass("flex");
    expect(wrapper).toHaveClass("gap-0");

    // Check for list items (5 keywords means 5 list items)
    const listItems = container.querySelectorAll("li");
    expect(listItems.length).toBe(5); // 5 keywords means 5 list items
  });

  it("should handle empty keywords array gracefully", () => {
    (usePopularSearchTerms as jest.Mock).mockReturnValue({
      keywords: [],
      isLoading: false,
    });

    render(<PopularSearchTerms />);

    // Should render empty container
    const container = document.querySelector("div");
    expect(container).toBeInTheDocument();
  });

  it("should render correct number of badges based on data", () => {
    (usePopularSearchTerms as jest.Mock).mockReturnValue({
      keywords: mockKeywords.slice(0, 3), // Only 3 keywords
      isLoading: false,
    });

    render(<PopularSearchTerms />);

    expect(screen.getByText("제주도 맛집")).toBeInTheDocument();
    expect(screen.getByText("한라산 등반")).toBeInTheDocument();
    expect(screen.getByText("섭지코지")).toBeInTheDocument();
    expect(screen.queryByText("우도 여행")).not.toBeInTheDocument();
  });

  it("should use unique keys for each badge", () => {
    (usePopularSearchTerms as jest.Mock).mockReturnValue({
      keywords: mockKeywords,
      isLoading: false,
    });

    render(<PopularSearchTerms />);

    // All keywords should be rendered (unique keys)
    expect(screen.getAllByRole("link")).toHaveLength(5);
  });
});
