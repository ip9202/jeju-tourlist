/**
 * Integration tests for FacebookAnswerThread component
 * Tests answer list rendering, sorting, nested replies, and state management
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FacebookAnswerThread } from "../FacebookAnswerThread";
import type { Answer, Question, User } from "../types";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Heart: () => <svg data-testid="heart-icon" />,
  ThumbsDown: () => <svg data-testid="thumbs-down-icon" />,
  ThumbsUp: () => <svg data-testid="thumbs-up-icon" />,
  CheckCircle: () => <svg data-testid="check-circle-icon" />,
  ChevronDown: () => <svg data-testid="chevron-down-icon" />,
  ChevronUp: () => <svg data-testid="chevron-up-icon" />,
  Smile: () => <svg data-testid="smile-icon" />,
  Send: () => <svg data-testid="send-icon" />,
  X: () => <svg data-testid="x-icon" />,
}));

describe("FacebookAnswerThread Integration Tests", () => {
  const mockUser: User = {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    avatar: "https://example.com/avatar.jpg",
  };

  const questionAuthor: User = {
    id: "author-1",
    name: "Question Author",
    email: "author@example.com",
  };

  const expertUser: User = {
    id: "expert-1",
    name: "Expert User",
    badge: "expert",
  };

  const mockQuestion: Question = {
    id: "q-1",
    title: "Test Question",
    content: "Question content",
    author: questionAuthor,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    answerCount: 0,
    viewCount: 0,
  };

  const mockOnSubmitAnswer = jest.fn().mockResolvedValue(undefined);
  const mockOnLike = jest.fn();
  const mockOnDislike = jest.fn();
  const mockOnAdopt = jest.fn();
  const mockOnUnadopt = jest.fn();
  const mockOnReply = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Answer List Rendering", () => {
    it("should render empty state when no answers", () => {
      render(
        <FacebookAnswerThread
          answers={[]}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
        />
      );

      expect(screen.getByText("아직 답변이 없습니다.")).toBeInTheDocument();
      expect(
        screen.getByText("가장 먼저 답변을 작성해보세요!")
      ).toBeInTheDocument();
    });

    it("should render multiple answers", () => {
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "First answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
        {
          id: "ans-2",
          content: "Second answer",
          author: expertUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
      ];

      render(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
        />
      );

      expect(screen.getByText("First answer")).toBeInTheDocument();
      expect(screen.getByText("Second answer")).toBeInTheDocument();
    });

    it("should always render answer input at top", () => {
      render(
        <FacebookAnswerThread
          answers={[]}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
        />
      );

      expect(
        screen.getByPlaceholderText("댓글을 작성해주세요...")
      ).toBeInTheDocument();
    });
  });

  describe("Badge-based Sorting", () => {
    it("should sort accepted answers first", () => {
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Regular answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
        {
          id: "ans-2",
          content: "Accepted answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
          isAccepted: true,
        },
      ];

      const { container } = render(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
        />
      );

      const answerContents = container.querySelectorAll("p");
      const firstAnswer = Array.from(answerContents).find(
        p => p.textContent === "Accepted answer"
      );
      const secondAnswer = Array.from(answerContents).find(
        p => p.textContent === "Regular answer"
      );

      expect(firstAnswer).toBeInTheDocument();
      expect(secondAnswer).toBeInTheDocument();
    });

    it("should sort expert answers before regular answers", () => {
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Regular answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
        {
          id: "ans-2",
          content: "Expert answer",
          author: expertUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
      ];

      const { container } = render(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
        />
      );

      const answerContents = container.querySelectorAll("p");
      const expertAnswer = Array.from(answerContents).find(
        p => p.textContent === "Expert answer"
      );
      const regularAnswer = Array.from(answerContents).find(
        p => p.textContent === "Regular answer"
      );

      expect(expertAnswer).toBeInTheDocument();
      expect(regularAnswer).toBeInTheDocument();
    });
  });

  describe("Nested Replies", () => {
    it("should render nested replies under parent answer", () => {
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Parent answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
        {
          id: "ans-2",
          content: "Child reply",
          author: expertUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
          parentId: "ans-1",
        },
      ];

      render(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
        />
      );

      expect(screen.getByText("Parent answer")).toBeInTheDocument();
      // Check for reply count in button
      const replyButtons = screen.getAllByTitle("답글");
      expect(replyButtons.length).toBeGreaterThan(0);
      // Reply count should be (1)
      expect(screen.getByText("(1)")).toBeInTheDocument();
    });

    it("should expand/collapse nested replies on button click", async () => {
      const user = userEvent.setup();
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Parent answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
        {
          id: "ans-2",
          content: "Child reply",
          author: expertUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
          parentId: "ans-1",
        },
      ];

      render(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
        />
      );

      // Initially collapsed
      expect(screen.queryByText("Child reply")).not.toBeInTheDocument();

      // Expand - find button using aria-label
      const toggleButton = screen.getByLabelText("답글 1개 보기");
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText("Child reply")).toBeInTheDocument();
      });

      // Collapse - find button using updated aria-label
      const collapseButton = screen.getByLabelText("답글 1개 숨기기");
      await user.click(collapseButton);

      await waitFor(() => {
        expect(screen.queryByText("Child reply")).not.toBeInTheDocument();
      });
    });

    it("should show reply count badge", () => {
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Parent answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
        {
          id: "ans-2",
          content: "Reply 1",
          author: expertUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
          parentId: "ans-1",
        },
        {
          id: "ans-3",
          content: "Reply 2",
          author: expertUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
          parentId: "ans-1",
        },
      ];

      render(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
        />
      );

      // Check for reply count badge showing "2" and toggle button
      expect(screen.getByLabelText("답글 2개 보기")).toBeInTheDocument();
    });
  });

  describe("Answer Submission", () => {
    it("should submit top-level answer", async () => {
      const user = userEvent.setup();

      render(
        <FacebookAnswerThread
          answers={[]}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
        />
      );

      const textarea = screen.getByPlaceholderText("댓글을 작성해주세요...");
      await user.type(textarea, "New answer");
      await user.click(textarea); // Expand to show submit button

      const submitButton = screen.getByRole("button", { name: /등록/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmitAnswer).toHaveBeenCalledWith(
          "New answer",
          undefined
        );
      });
    });

    it("should submit nested reply with parentId", async () => {
      const user = userEvent.setup();
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Parent answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
      ];

      render(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
          onReply={mockOnReply}
        />
      );

      // Click reply button
      const replyButtons = screen.getAllByText("답글");
      await user.click(replyButtons[0]);

      // Type reply
      const replyTextarea = screen.getByPlaceholderText(/님에게 답글.../);
      await user.type(replyTextarea, "Reply content");

      // Submit
      const submitButtons = screen.getAllByRole("button", { name: /등록/ });
      await user.click(submitButtons[submitButtons.length - 1]);

      await waitFor(() => {
        expect(mockOnSubmitAnswer).toHaveBeenCalledWith(
          "Reply content",
          "ans-1"
        );
      });
    });

    it("should clear reply input after submission", async () => {
      const user = userEvent.setup();

      render(
        <FacebookAnswerThread
          answers={[]}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
        />
      );

      const textarea = screen.getByPlaceholderText(
        "댓글을 작성해주세요..."
      ) as HTMLTextAreaElement;
      await user.type(textarea, "Test answer");
      await user.click(textarea);

      const submitButton = screen.getByRole("button", { name: /등록/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(textarea.value).toBe("");
      });
    });
  });

  describe("Like/Dislike Functionality", () => {
    it("should call onLike when like button is clicked", async () => {
      const user = userEvent.setup();
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Test answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
          isLiked: false,
        },
      ];

      render(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
          onLike={mockOnLike}
        />
      );

      const likeButtons = screen.getAllByTitle("좋아요");
      await user.click(likeButtons[0]);

      expect(mockOnLike).toHaveBeenCalledWith("ans-1", true);
    });

    it("should call onDislike when dislike button is clicked", async () => {
      const user = userEvent.setup();
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Test answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
          isDisliked: false,
        },
      ];

      render(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
          onDislike={mockOnDislike}
        />
      );

      const dislikeButtons = screen.getAllByTitle("싫어요");
      await user.click(dislikeButtons[0]);

      expect(mockOnDislike).toHaveBeenCalledWith("ans-1", true);
    });

    it("should toggle like state", async () => {
      const user = userEvent.setup();
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Test answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 1,
          dislikeCount: 0,
          isLiked: true,
        },
      ];

      render(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
          onLike={mockOnLike}
        />
      );

      const likeButtons = screen.getAllByTitle("좋아요");
      await user.click(likeButtons[0]);

      // Should toggle to false
      expect(mockOnLike).toHaveBeenCalledWith("ans-1", false);
    });
  });

  describe("Adoption Functionality", () => {
    it("should show adopt button only to question author", () => {
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Test answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
      ];

      // Render as question author
      const { rerender } = render(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={questionAuthor}
          onSubmitAnswer={mockOnSubmitAnswer}
          onAdopt={mockOnAdopt}
        />
      );

      expect(screen.getByText("채택")).toBeInTheDocument();

      // Rerender as different user
      rerender(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
          onAdopt={mockOnAdopt}
        />
      );

      expect(screen.queryByText("채택")).not.toBeInTheDocument();
    });

    it("should call onAdopt when adopt button is clicked", async () => {
      const user = userEvent.setup();
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Test answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
          isAccepted: false,
        },
      ];

      render(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={questionAuthor}
          onSubmitAnswer={mockOnSubmitAnswer}
          onAdopt={mockOnAdopt}
        />
      );

      const adoptButton = screen.getByText("채택");
      await user.click(adoptButton);

      expect(mockOnAdopt).toHaveBeenCalledWith("ans-1");
    });

    it("should call onUnadopt when unadopt button is clicked", async () => {
      const user = userEvent.setup();
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Test answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
          isAccepted: true,
        },
      ];

      render(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={questionAuthor}
          onSubmitAnswer={mockOnSubmitAnswer}
          onUnadopt={mockOnUnadopt}
        />
      );

      const unadoptButton = screen.getByText("채택 해제");
      await user.click(unadoptButton);

      expect(mockOnUnadopt).toHaveBeenCalledWith("ans-1");
    });

    it("should not show adopt button for nested replies", () => {
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Parent answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
        {
          id: "ans-2",
          content: "Nested reply",
          author: expertUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
          parentId: "ans-1",
        },
      ];

      render(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={questionAuthor}
          onSubmitAnswer={mockOnSubmitAnswer}
          onAdopt={mockOnAdopt}
        />
      );

      // Only 1 adopt button (for parent answer)
      const adoptButtons = screen.getAllByText("채택");
      expect(adoptButtons).toHaveLength(1);
    });
  });

  describe("Reply Mode", () => {
    it("should show reply input when reply button is clicked", async () => {
      const user = userEvent.setup();
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Test answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
      ];

      render(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
          onReply={mockOnReply}
        />
      );

      const replyButtons = screen.getAllByText("답글");
      await user.click(replyButtons[0]);

      expect(screen.getByPlaceholderText(/님에게 답글.../)).toBeInTheDocument();
      expect(mockOnReply).toHaveBeenCalledWith("ans-1");
    });

    it("should cancel reply mode when cancel button is clicked", async () => {
      const user = userEvent.setup();
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Test answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
      ];

      render(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
        />
      );

      const replyButtons = screen.getAllByText("답글");
      await user.click(replyButtons[0]);

      // Reply input should be visible
      const replyTextarea = screen.getByPlaceholderText(/님에게 답글.../);
      expect(replyTextarea).toBeInTheDocument();

      // Type something to ensure input is expanded
      await user.type(replyTextarea, "Test reply");

      // Now cancel button should be visible
      const cancelButtons = screen.getAllByText("취소");
      await user.click(cancelButtons[cancelButtons.length - 1]); // Click the last cancel button (reply mode)

      // Reply input should be hidden
      await waitFor(() => {
        expect(
          screen.queryByPlaceholderText(/님에게 답글.../)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    it("should disable all buttons when loading", () => {
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Test answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
      ];

      render(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
          isLoading={true}
        />
      );

      const textarea = screen.getByPlaceholderText("댓글을 작성해주세요...");
      expect(textarea).toBeDisabled();
    });
  });

  describe("React.memo Optimization", () => {
    it("should not re-render when props remain unchanged", () => {
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Test answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
      ];

      const { rerender } = render(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
        />
      );

      expect(screen.getByText("Test answer")).toBeInTheDocument();

      // Re-render with same props
      rerender(
        <FacebookAnswerThread
          answers={answers}
          question={mockQuestion}
          currentUser={mockUser}
          onSubmitAnswer={mockOnSubmitAnswer}
        />
      );

      // Should still work correctly
      expect(screen.getByText("Test answer")).toBeInTheDocument();
    });
  });
});
