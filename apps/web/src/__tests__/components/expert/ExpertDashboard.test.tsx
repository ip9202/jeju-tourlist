/**
 * 전문가 대시보드 테스트 파일들
 * 
 * @description
 * - 전문가 대시보드의 테스트 커버리지를 향상시키기 위한 테스트 파일들
 * - 단위 테스트, 통합 테스트, E2E 테스트 구현
 * - Jest, React Testing Library, Playwright 사용
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Expert, CategoryFilter } from "@/types/expert";
import { BadgeInfo } from "@/types/badge";
import { ExpertCard } from "@/components/expert/ExpertCard";
import { CategoryFilterComponent } from "@/components/expert/CategoryFilter";
import { ExpertListItem } from "@/components/expert/ExpertListItem";
import { ExpertRanking } from "@/components/expert/ExpertRanking";
import { AccessibleCard } from "@/components/expert/AccessibilityImproved";
import { ErrorBoundary, ErrorFallback } from "@/components/expert/ErrorHandling";
import { Skeleton, ExpertCardSkeleton } from "@/components/expert/PerformanceOptimized";

// Mock 데이터
const mockExpert: Expert = {
  id: "1",
  name: "김제주",
  nickname: "제주맛집왕",
  avatar: "https://example.com/avatar.jpg",
  rank: 1,
  badges: [
    {
      id: "1",
      code: "FOOD_EXPERT",
      name: "맛집 전문가",
      emoji: "🍽️",
      description: "맛집 전문가",
      type: "CATEGORY_EXPERT",
      category: "맛집",
      requiredAnswers: 10,
      bonusPoints: 100,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  primaryBadge: {
    id: "1",
    code: "FOOD_EXPERT",
    name: "맛집 전문가",
    emoji: "🍽️",
    description: "맛집 전문가",
    type: "CATEGORY_EXPERT",
    category: "맛집",
    requiredAnswers: 10,
    bonusPoints: 100,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  totalAnswers: 50,
  adoptedAnswers: 45,
  adoptRate: 90,
  points: 1500,
  joinDate: new Date("2023-01-01"),
  rating: 4.8,
};

const mockBadge: BadgeInfo = {
  id: "1",
  code: "FOOD_EXPERT",
  name: "맛집 전문가",
  emoji: "🍽️",
  description: "맛집 전문가",
  type: "CATEGORY_EXPERT",
  category: "맛집",
  requiredAnswers: 10,
  bonusPoints: 100,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ExpertCard 테스트
describe("ExpertCard", () => {
  it("전문가 정보를 올바르게 렌더링한다", () => {
    render(<ExpertCard expert={mockExpert} />);
    
    expect(screen.getByText("김제주")).toBeInTheDocument();
    expect(screen.getByText("제주맛집왕")).toBeInTheDocument();
    expect(screen.getByText("1,500")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("90.0%")).toBeInTheDocument();
  });

  it("클릭 이벤트를 올바르게 처리한다", () => {
    const handleClick = jest.fn();
    render(<ExpertCard expert={mockExpert} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledWith(mockExpert);
  });

  it("다양한 variant를 올바르게 렌더링한다", () => {
    const { rerender } = render(<ExpertCard expert={mockExpert} variant="compact" />);
    expect(screen.getByText("김제주")).toBeInTheDocument();
    
    rerender(<ExpertCard expert={mockExpert} variant="detailed" />);
    expect(screen.getByText("김제주")).toBeInTheDocument();
  });

  it("순위 배지를 올바르게 표시한다", () => {
    render(<ExpertCard expert={mockExpert} showRank={true} />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("배지 정보를 올바르게 표시한다", () => {
    render(<ExpertCard expert={mockExpert} showBadges={true} />);
    expect(screen.getByText("맛집 전문가")).toBeInTheDocument();
  });
});

// CategoryFilter 테스트
describe("CategoryFilterComponent", () => {
  const mockCategories: CategoryFilter[] = ["전체", "맛집", "교통", "액티비티"];
  
  it("카테고리 목록을 올바르게 렌더링한다", () => {
    const handleCategoryChange = jest.fn();
    render(
      <CategoryFilterComponent
        selectedCategory="전체"
        onCategoryChange={handleCategoryChange}
        categories={mockCategories}
      />
    );
    
    mockCategories.forEach(category => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it("카테고리 선택을 올바르게 처리한다", () => {
    const handleCategoryChange = jest.fn();
    render(
      <CategoryFilterComponent
        selectedCategory="전체"
        onCategoryChange={handleCategoryChange}
        categories={mockCategories}
      />
    );
    
    fireEvent.click(screen.getByText("맛집"));
    expect(handleCategoryChange).toHaveBeenCalledWith("맛집");
  });

  it("선택된 카테고리를 올바르게 하이라이트한다", () => {
    render(
      <CategoryFilterComponent
        selectedCategory="맛집"
        onCategoryChange={jest.fn()}
        categories={mockCategories}
      />
    );
    
    const selectedButton = screen.getByText("맛집");
    expect(selectedButton).toHaveClass("bg-blue-600");
  });
});

// ExpertListItem 테스트
describe("ExpertListItem", () => {
  it("전문가 리스트 아이템을 올바르게 렌더링한다", () => {
    render(<ExpertListItem expert={mockExpert} rank={1} />);
    
    expect(screen.getByText("김제주")).toBeInTheDocument();
    expect(screen.getByText("제주맛집왕")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("클릭 이벤트를 올바르게 처리한다", () => {
    const handleClick = jest.fn();
    render(<ExpertListItem expert={mockExpert} rank={1} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledWith(mockExpert);
  });

  it("다양한 variant를 올바르게 렌더링한다", () => {
    const { rerender } = render(
      <ExpertListItem expert={mockExpert} rank={1} variant="compact" />
    );
    expect(screen.getByText("김제주")).toBeInTheDocument();
    
    rerender(<ExpertListItem expert={mockExpert} rank={1} variant="detailed" />);
    expect(screen.getByText("김제주")).toBeInTheDocument();
  });
});

// AccessibleCard 테스트
describe("AccessibleCard", () => {
  it("접근성 속성을 올바르게 설정한다", () => {
    render(<AccessibleCard expert={mockExpert} />);
    
    const card = screen.getByRole("button");
    expect(card).toHaveAttribute("aria-label", "김제주 전문가 프로필 보기");
    expect(card).toHaveAttribute("tabIndex", "0");
  });

  it("키보드 네비게이션을 올바르게 처리한다", () => {
    const handleClick = jest.fn();
    render(<AccessibleCard expert={mockExpert} onClick={handleClick} />);
    
    const card = screen.getByRole("button");
    fireEvent.keyDown(card, { key: "Enter" });
    expect(handleClick).toHaveBeenCalledWith(mockExpert);
    
    fireEvent.keyDown(card, { key: " " });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("스크린 리더용 설명을 제공한다", () => {
    render(<AccessibleCard expert={mockExpert} />);
    
    const description = screen.getByText(
      /김제주은 50개의 답변을 작성했으며/
    );
    expect(description).toBeInTheDocument();
  });
});

// ErrorBoundary 테스트
describe("ErrorBoundary", () => {
  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error("Test error");
    }
    return <div>No error</div>;
  };

  it("에러가 발생하지 않을 때 자식 컴포넌트를 렌더링한다", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("에러가 발생할 때 에러 폴백을 렌더링한다", () => {
    // 콘솔 에러를 억제
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText("예상치 못한 오류")).toBeInTheDocument();
    expect(screen.getByText("일시적인 문제가 발생했습니다.")).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it("재시도 기능을 올바르게 작동한다", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    
    render(
      <ErrorBoundary maxRetries={3}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const retryButton = screen.getByText("다시 시도 (1/3)");
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(screen.getByText("다시 시도 (2/3)")).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});

// Skeleton 테스트
describe("Skeleton", () => {
  it("기본 스켈레톤을 올바르게 렌더링한다", () => {
    render(<Skeleton />);
    
    const skeleton = screen.getByRole("generic");
    expect(skeleton).toHaveClass("animate-pulse", "bg-gray-200");
  });

  it("다양한 variant를 올바르게 렌더링한다", () => {
    const { rerender } = render(<Skeleton variant="text" />);
    expect(screen.getByRole("generic")).toHaveClass("h-4", "rounded");
    
    rerender(<Skeleton variant="circular" />);
    expect(screen.getByRole("generic")).toHaveClass("rounded-full");
  });

  it("크기를 올바르게 설정한다", () => {
    render(<Skeleton width={100} height={50} />);
    
    const skeleton = screen.getByRole("generic");
    expect(skeleton).toHaveStyle({ width: "100px", height: "50px" });
  });
});

// ExpertCardSkeleton 테스트
describe("ExpertCardSkeleton", () => {
  it("전문가 카드 스켈레톤을 올바르게 렌더링한다", () => {
    render(<ExpertCardSkeleton />);
    
    const skeletons = screen.getAllByRole("generic");
    expect(skeletons).toHaveLength(8); // 아바타, 이름, 닉네임, 통계 3개, 배지 3개
  });
});

// 통합 테스트
describe("Expert Dashboard Integration", () => {
  it("전체 전문가 대시보드가 올바르게 작동한다", async () => {
    const mockExperts = [mockExpert];
    const handleExpertClick = jest.fn();
    
    render(
      <ExpertRanking
        experts={mockExperts}
        pagination={{
          currentPage: 1,
          totalPages: 1,
          totalCount: 1,
          hasNext: false,
          hasPrev: false,
        }}
        isLoading={false}
        error={null}
        onExpertClick={handleExpertClick}
      />
    );
    
    expect(screen.getByText("김제주")).toBeInTheDocument();
    
    fireEvent.click(screen.getByText("김제주"));
    expect(handleExpertClick).toHaveBeenCalledWith(mockExpert);
  });

  it("로딩 상태를 올바르게 표시한다", () => {
    render(
      <ExpertRanking
        experts={[]}
        pagination={{
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNext: false,
          hasPrev: false,
        }}
        isLoading={true}
        error={null}
      />
    );
    
    expect(screen.getByText("전문가 정보를 불러오는 중...")).toBeInTheDocument();
  });

  it("에러 상태를 올바르게 표시한다", () => {
    const error = new Error("API Error");
    
    render(
      <ExpertRanking
        experts={[]}
        pagination={{
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNext: false,
          hasPrev: false,
        }}
        isLoading={false}
        error={error.message}
      />
    );
    
    expect(screen.getByText("오류가 발생했습니다")).toBeInTheDocument();
    expect(screen.getByText("API Error")).toBeInTheDocument();
  });
});

// E2E 테스트 시나리오
describe("Expert Dashboard E2E Scenarios", () => {
  it("사용자가 전문가 대시보드를 탐색할 수 있다", async () => {
    const mockExperts = [mockExpert];
    const handleExpertClick = jest.fn();
    
    render(
      <div>
        <CategoryFilterComponent
          selectedCategory="전체"
          onCategoryChange={jest.fn()}
          categories={["전체", "맛집", "교통"]}
        />
        <ExpertRanking
          experts={mockExperts}
          pagination={{
            currentPage: 1,
            totalPages: 1,
            totalCount: 1,
            hasNext: false,
            hasPrev: false,
          }}
          isLoading={false}
          error={null}
          onExpertClick={handleExpertClick}
        />
      </div>
    );
    
    // 카테고리 필터 확인
    expect(screen.getByText("전체")).toBeInTheDocument();
    expect(screen.getByText("맛집")).toBeInTheDocument();
    expect(screen.getByText("교통")).toBeInTheDocument();
    
    // 전문가 정보 확인
    expect(screen.getByText("김제주")).toBeInTheDocument();
    expect(screen.getByText("제주맛집왕")).toBeInTheDocument();
    
    // 전문가 클릭
    fireEvent.click(screen.getByText("김제주"));
    expect(handleExpertClick).toHaveBeenCalledWith(mockExpert);
  });

  it("사용자가 카테고리를 필터링할 수 있다", async () => {
    const handleCategoryChange = jest.fn();
    
    render(
      <CategoryFilterComponent
        selectedCategory="전체"
        onCategoryChange={handleCategoryChange}
        categories={["전체", "맛집", "교통"]}
      />
    );
    
    // 맛집 카테고리 선택
    fireEvent.click(screen.getByText("맛집"));
    expect(handleCategoryChange).toHaveBeenCalledWith("맛집");
    
    // 교통 카테고리 선택
    fireEvent.click(screen.getByText("교통"));
    expect(handleCategoryChange).toHaveBeenCalledWith("교통");
  });

  it("사용자가 키보드로 네비게이션할 수 있다", async () => {
    const handleExpertClick = jest.fn();
    
    render(<AccessibleCard expert={mockExpert} onClick={handleExpertClick} />);
    
    const card = screen.getByRole("button");
    
    // 포커스 설정
    card.focus();
    expect(card).toHaveFocus();
    
    // Enter 키로 클릭
    fireEvent.keyDown(card, { key: "Enter" });
    expect(handleExpertClick).toHaveBeenCalledWith(mockExpert);
    
    // Space 키로 클릭
    fireEvent.keyDown(card, { key: " " });
    expect(handleExpertClick).toHaveBeenCalledTimes(2);
  });
});
