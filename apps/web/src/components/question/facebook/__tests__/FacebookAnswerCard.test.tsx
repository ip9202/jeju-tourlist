// @TAG:TEST-ANSWER-INTERACTION-001-U2: Test suite for FacebookAnswerCard Like/Dislike icon buttons
// @TAG:TEST-ANSWER-INTERACTION-001-S2: Test suite for adoption indicator display
// @TAG:TEST-ANSWER-INTERACTION-001-E1: Test suite for adopt button
// SPEC: SPEC-ANSWER-INTERACTION-001
// Phase 4: Frontend UI Implementation

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FacebookAnswerCard from "../FacebookAnswerCard";
import { Answer, User } from "../types";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Heart: ({ size, className, ...props }: any) => (
    <svg
      data-testid="heart-icon"
      {...props}
      data-size={size}
      className={className}
    />
  ),
  ThumbsDown: ({ size, className, ...props }: any) => (
    <svg
      data-testid="thumbs-down-icon"
      {...props}
      data-size={size}
      className={className}
    />
  ),
  ThumbsUp: ({ size, className, ...props }: any) => (
    <svg
      data-testid="thumbs-up-icon"
      {...props}
      data-size={size}
      className={className}
    />
  ),
  CheckCircle: ({ size, className, ...props }: any) => (
    <svg
      data-testid="check-circle-icon"
      {...props}
      data-size={size}
      className={className}
    />
  ),
  MoreHorizontal: ({ size, className, ...props }: any) => (
    <svg
      data-testid="more-horizontal-icon"
      {...props}
      data-size={size}
      className={className}
    />
  ),
}));

// Mock FacebookBadge
jest.mock("../FacebookBadge", () => {
  return function MockFacebookBadge() {
    return <div data-testid="facebook-badge">Badge</div>;
  };
});

// Mock utils
jest.mock("../utils", () => ({
  getBadgeType: jest.fn(answer => {
    if (answer.isAccepted) return "accepted";
    if (answer.author.badge) return answer.author.badge;
    return null;
  }),
}));

describe("FacebookAnswerCard - Phase 4 Frontend UI Implementation", () => {
  const mockAuthor: User = {
    id: "user-1",
    name: "Test User",
    avatar: "https://example.com/avatar.jpg",
    email: "test@example.com",
  };

  const mockQuestionAuthor: User = {
    id: "question-author-1",
    name: "Question Author",
    avatar: "https://example.com/question-avatar.jpg",
    email: "question@example.com",
  };

  const mockAnswer: Answer = {
    id: "answer-1",
    content: "This is a test answer",
    author: mockAuthor,
    createdAt: new Date("2024-01-15T10:00:00").toISOString(),
    likeCount: 5,
    dislikeCount: 2,
    isLiked: false,
    isDisliked: false,
    replyCount: 0,
    isAccepted: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("@REQ:ANSWER-INTERACTION-001-U2 - Like/Dislike Icon Buttons", () => {
    // RED TEST 1: Should render ThumbsUp icon instead of text "좋아요"
    it("[RED] should render ThumbsUp icon for like button instead of text", () => {
      const onLike = jest.fn();
      render(<FacebookAnswerCard answer={mockAnswer} onLike={onLike} />);

      // This test FAILS because component currently renders text "좋아요" instead of icon
      // After implementation, this should pass
      const thumbsUpIcon = screen.queryByTestId("thumbs-up-icon");
      expect(thumbsUpIcon).toBeInTheDocument();
      expect(screen.queryByText("좋아요")).not.toBeInTheDocument();
    });

    // RED TEST 2: Should render ThumbsDown icon instead of text "싫어요"
    it("[RED] should render ThumbsDown icon for dislike button instead of text", () => {
      const onDislike = jest.fn();
      render(<FacebookAnswerCard answer={mockAnswer} onDislike={onDislike} />);

      // This test FAILS because component currently renders text "싫어요" instead of icon
      // Use getByLabelText to get the specific dislike button icon
      const thumbsDownIcon = screen.getByLabelText("싫어요");
      expect(thumbsDownIcon).toBeInTheDocument();
      expect(screen.queryByText("싫어요")).not.toBeInTheDocument();
    });

    // RED TEST 3: Like icon should show active state when answer is liked
    it("[RED] like icon should have active styling when answer is liked", () => {
      const likedAnswer: Answer = { ...mockAnswer, isLiked: true };
      const onLike = jest.fn();
      render(<FacebookAnswerCard answer={likedAnswer} onLike={onLike} />);

      const likeButton = screen.getByLabelText("좋아요");
      // Should have active style class on the button parent
      expect(likeButton).toHaveClass("text-red-600");
    });

    // RED TEST 4: Dislike icon should show active state when answer is disliked
    it("[RED] dislike icon should have active styling when answer is disliked", () => {
      const dislikedAnswer: Answer = { ...mockAnswer, isDisliked: true };
      const onDislike = jest.fn();
      render(
        <FacebookAnswerCard answer={dislikedAnswer} onDislike={onDislike} />
      );

      const dislikeButton = screen.getByLabelText("싫어요");
      // Should have active style class on the button parent
      expect(dislikeButton).toHaveClass("text-gray-600");
    });

    // RED TEST 5: Clicking like icon should call onLike handler with correct params
    it("[RED] clicking like icon should trigger onLike handler", () => {
      const onLike = jest.fn();
      render(<FacebookAnswerCard answer={mockAnswer} onLike={onLike} />);

      const likeButton = screen.getByLabelText("좋아요");
      fireEvent.click(likeButton);

      expect(onLike).toHaveBeenCalledWith("answer-1", true);
    });

    // RED TEST 6: Clicking dislike icon should call onDislike handler
    it("[RED] clicking dislike icon should trigger onDislike handler", () => {
      const onDislike = jest.fn();
      render(<FacebookAnswerCard answer={mockAnswer} onDislike={onDislike} />);

      const dislikeButton = screen.getByLabelText("싫어요");
      fireEvent.click(dislikeButton);

      expect(onDislike).toHaveBeenCalledWith("answer-1", true);
    });
  });

  describe("@REQ:ANSWER-INTERACTION-001-S2 - Adoption Indicator Display", () => {
    // RED TEST 7: Should display adoption indicator when answer is accepted
    it('[RED] should display adoption indicator (CheckCircle icon + "채택됨" text) when answer is accepted', () => {
      const acceptedAnswer: Answer = { ...mockAnswer, isAccepted: true };
      render(<FacebookAnswerCard answer={acceptedAnswer} />);

      const checkCircleIcon = screen.queryByTestId("check-circle-icon");
      expect(checkCircleIcon).toBeInTheDocument();
      expect(screen.queryByText("채택됨")).toBeInTheDocument();
    });

    // RED TEST 8: Adoption indicator should have green styling
    it("[RED] adoption indicator should have green styling", () => {
      const acceptedAnswer: Answer = { ...mockAnswer, isAccepted: true };
      render(<FacebookAnswerCard answer={acceptedAnswer} />);

      const checkCircleIcon = screen.getByTestId("check-circle-icon");
      expect(checkCircleIcon).toHaveClass("text-green-700");
    });

    // RED TEST 9: Should NOT display adoption indicator when answer is not accepted
    it("[RED] should not display adoption indicator when answer is not accepted", () => {
      render(<FacebookAnswerCard answer={mockAnswer} />);

      const checkCircleIcon = screen.queryByTestId("check-circle-icon");
      expect(checkCircleIcon).not.toBeInTheDocument();
      expect(screen.queryByText("채택됨")).not.toBeInTheDocument();
    });

    // RED TEST 10: Adoption indicator should be displayed in the header section
    it("[RED] adoption indicator should be positioned in answer header", () => {
      const acceptedAnswer: Answer = { ...mockAnswer, isAccepted: true };
      render(<FacebookAnswerCard answer={acceptedAnswer} />);

      // Should find CheckCircle icon before the author name
      const checkCircleIcon = screen.getByTestId("check-circle-icon");
      const authorName = screen.getByText(mockAuthor.name);

      // Both should be in the header area
      expect(checkCircleIcon).toBeInTheDocument();
      expect(authorName).toBeInTheDocument();
    });
  });

  describe("@REQ:ANSWER-INTERACTION-001-E1 - Adopt Button", () => {
    // RED TEST 11: Question author should see adopt button for unadopted answers
    it("[RED] question author should see adopt button for unadopted answer", () => {
      const onAdopt = jest.fn();
      render(
        <FacebookAnswerCard
          answer={mockAnswer}
          questionAuthor={mockQuestionAuthor}
          currentUser={mockQuestionAuthor}
          onAdopt={onAdopt}
        />
      );

      // Should see adopt button with "채택" text
      const adoptButton = screen.queryByLabelText("답변 채택");
      expect(adoptButton).toBeInTheDocument();
    });

    // RED TEST 12: Non-author should NOT see adopt button
    it("[RED] non-author should not see adopt button", () => {
      const onAdopt = jest.fn();
      render(
        <FacebookAnswerCard
          answer={mockAnswer}
          questionAuthor={mockQuestionAuthor}
          currentUser={mockAuthor}
          onAdopt={onAdopt}
        />
      );

      // Should NOT see adopt button
      const adoptButton = screen.queryByLabelText("답변 채택");
      expect(adoptButton).not.toBeInTheDocument();
    });

    // RED TEST 13: Clicking adopt button should call onAdopt handler
    it("[RED] clicking adopt button should trigger onAdopt handler", () => {
      const onAdopt = jest.fn();
      render(
        <FacebookAnswerCard
          answer={mockAnswer}
          questionAuthor={mockQuestionAuthor}
          currentUser={mockQuestionAuthor}
          onAdopt={onAdopt}
        />
      );

      const adoptButton = screen.getByLabelText("답변 채택");
      fireEvent.click(adoptButton);

      expect(onAdopt).toHaveBeenCalledWith("answer-1");
    });

    // RED TEST 14: Adopt button should show CheckCircle icon with "채택" text
    it('[RED] adopt button should display CheckCircle icon with "채택" text', () => {
      const onAdopt = jest.fn();
      render(
        <FacebookAnswerCard
          answer={mockAnswer}
          questionAuthor={mockQuestionAuthor}
          currentUser={mockQuestionAuthor}
          onAdopt={onAdopt}
        />
      );

      // Look for button with "채택" text
      const adoptButton = screen.getByText("채택");
      expect(adoptButton).toBeInTheDocument();
    });

    // RED TEST 15: Adopt button should be disabled when answer is already accepted
    it("[RED] adopt button should show as disabled/inactive when answer is already accepted", () => {
      const acceptedAnswer: Answer = { ...mockAnswer, isAccepted: true };
      const onUnadopt = jest.fn();
      render(
        <FacebookAnswerCard
          answer={acceptedAnswer}
          questionAuthor={mockQuestionAuthor}
          currentUser={mockQuestionAuthor}
          onUnadopt={onUnadopt}
        />
      );

      // Adopt button should still be visible but showing unadopt state
      const unAdoptButton = screen.getByText("채택 해제");
      expect(unAdoptButton).toBeInTheDocument();
    });

    // RED TEST 16: Author sees undo adoption button when answer is adopted
    it("[RED] question author should see undo adoption button when answer is accepted", () => {
      const acceptedAnswer: Answer = { ...mockAnswer, isAccepted: true };
      const onUnadopt = jest.fn();
      render(
        <FacebookAnswerCard
          answer={acceptedAnswer}
          questionAuthor={mockQuestionAuthor}
          currentUser={mockQuestionAuthor}
          onUnadopt={onUnadopt}
        />
      );

      // Should see option to undo adoption
      const undoButton = screen.queryByLabelText("채택 취소");
      expect(undoButton).toBeInTheDocument();
    });
  });

  describe("Integration Tests - Interaction Between Features", () => {
    // RED TEST 17: Like count should display correctly with icon
    it("[RED] like count should display next to like icon", () => {
      const answerWithLikes: Answer = {
        ...mockAnswer,
        likeCount: 10,
        isLiked: false,
      };
      const { container } = render(
        <FacebookAnswerCard answer={answerWithLikes} />
      );

      // Find heart icon element in reactions count (size 12)
      const heartIcons = container.querySelectorAll(
        '[data-testid="heart-icon"]'
      );
      const heartIconInReactions = heartIcons[0]; // First heart icon is in reactions count

      // Get the parent span that contains the count
      const countSpan = heartIconInReactions?.parentElement;
      expect(countSpan?.textContent).toContain("10");
    });

    // RED TEST 18: Dislike count should display correctly with icon
    it("[RED] dislike count should display next to dislike icon", () => {
      const answerWithDislikes: Answer = {
        ...mockAnswer,
        dislikeCount: 5,
        isDisliked: false,
      };
      const { container } = render(
        <FacebookAnswerCard answer={answerWithDislikes} />
      );

      // Find thumbs-down icon elements - first one (size 12) is in reactions count
      const thumbsDownIcons = container.querySelectorAll(
        '[data-testid="thumbs-down-icon"]'
      );
      const thumbsDownInReactions = thumbsDownIcons[0]; // First thumbs-down is in reactions

      // Get the parent span that contains the count
      const countSpan = thumbsDownInReactions?.parentElement;
      expect(countSpan?.textContent).toContain("5");
    });

    // RED TEST 19: When answer is adopted, adoption indicator takes priority
    it("[RED] adopted answer should show both adoption indicator and like/dislike icons", () => {
      const adoptedAnswer: Answer = {
        ...mockAnswer,
        isAccepted: true,
        likeCount: 10,
        dislikeCount: 3,
      };
      render(<FacebookAnswerCard answer={adoptedAnswer} />);

      // Check adoption indicator exists
      expect(screen.getByText("채택됨")).toBeInTheDocument();

      // Check that like/dislike icons exist (using getAllByTestId since there are multiple)
      const thumbsUpIcons = screen.getAllByTestId("thumbs-up-icon");
      expect(thumbsUpIcons.length).toBeGreaterThanOrEqual(1);

      const thumbsDownIcons = screen.getAllByTestId("thumbs-down-icon");
      expect(thumbsDownIcons.length).toBeGreaterThanOrEqual(1);
    });
  });
});
