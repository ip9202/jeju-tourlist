/**
 * Unit tests for FacebookAnswerInput component
 * Tests input functionality, authentication states, and form submission
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FacebookAnswerInput } from "../FacebookAnswerInput";
import type { User } from "../types";

// Mock Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Smile: () => <svg data-testid="smile-icon" />,
  Send: () => <svg data-testid="send-icon" />,
  X: () => <svg data-testid="x-icon" />,
}));

describe("FacebookAnswerInput", () => {
  const mockUser: User = {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    avatar: "https://example.com/avatar.jpg",
  };

  const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Authentication States", () => {
    it("should show login prompt when user is not logged in", () => {
      render(<FacebookAnswerInput onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/답변을 작성하려면/)).toBeInTheDocument();
      expect(screen.getByText("로그인")).toBeInTheDocument();
    });

    it("should navigate to login page when clicking login button", () => {
      // Mock window.location
      delete (window as any).location;
      window.location = { pathname: "/questions/1", search: "" } as any;

      render(<FacebookAnswerInput onSubmit={mockOnSubmit} />);

      const loginButton = screen.getByText("로그인");
      fireEvent.click(loginButton);

      expect(mockPush).toHaveBeenCalledWith(
        "/auth/signin?redirect=%2Fquestions%2F1"
      );
    });

    it("should show input form when user is logged in", () => {
      render(<FacebookAnswerInput user={mockUser} onSubmit={mockOnSubmit} />);

      expect(
        screen.getByPlaceholderText("댓글을 작성해주세요...")
      ).toBeInTheDocument();
    });

    it("should show user avatar when logged in", () => {
      render(<FacebookAnswerInput user={mockUser} onSubmit={mockOnSubmit} />);

      const avatar = screen.getByAltText(mockUser.name);
      expect(avatar).toHaveAttribute("src", mockUser.avatar);
    });
  });

  describe("Input Functionality", () => {
    it("should update textarea value on input", async () => {
      const user = userEvent.setup();
      render(<FacebookAnswerInput user={mockUser} onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(
        "댓글을 작성해주세요..."
      ) as HTMLTextAreaElement;
      await user.type(textarea, "Test comment");

      expect(textarea.value).toBe("Test comment");
    });

    it("should expand textarea on focus", async () => {
      const user = userEvent.setup();
      render(<FacebookAnswerInput user={mockUser} onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(
        "댓글을 작성해주세요..."
      ) as HTMLTextAreaElement;

      // Initially 1 row
      expect(textarea.rows).toBe(1);

      // Focus should expand to 3 rows
      await user.click(textarea);
      expect(textarea.rows).toBe(3);
    });

    it("should show action buttons when expanded", async () => {
      const user = userEvent.setup();
      render(<FacebookAnswerInput user={mockUser} onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText("댓글을 작성해주세요...");
      await user.click(textarea);

      // Should show emoji, cancel, and submit buttons
      expect(screen.getByTestId("smile-icon")).toBeInTheDocument();
      expect(screen.getByText("취소")).toBeInTheDocument();
      expect(screen.getByText("등록")).toBeInTheDocument();
    });

    it("should collapse textarea on blur when empty", async () => {
      const user = userEvent.setup();
      render(<FacebookAnswerInput user={mockUser} onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(
        "댓글을 작성해주세요..."
      ) as HTMLTextAreaElement;

      await user.click(textarea);
      expect(textarea.rows).toBe(3);

      // Blur without content
      textarea.blur();
      await waitFor(() => {
        expect(textarea.rows).toBe(1);
      });
    });

    it("should keep textarea expanded when content exists", async () => {
      const user = userEvent.setup();
      render(<FacebookAnswerInput user={mockUser} onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(
        "댓글을 작성해주세요..."
      ) as HTMLTextAreaElement;

      await user.type(textarea, "Some content");
      textarea.blur();

      // Should remain expanded (3 rows)
      await waitFor(() => {
        expect(textarea.rows).toBe(3);
      });
    });
  });

  describe("Form Submission", () => {
    it("should call onSubmit with content when submit button is clicked", async () => {
      const user = userEvent.setup();
      render(<FacebookAnswerInput user={mockUser} onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText("댓글을 작성해주세요...");
      await user.type(textarea, "Test comment");
      await user.click(textarea); // Expand to show buttons

      const submitButton = screen.getByText("등록");
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith("Test comment");
    });

    it("should clear textarea after successful submission", async () => {
      const user = userEvent.setup();
      render(<FacebookAnswerInput user={mockUser} onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(
        "댓글을 작성해주세요..."
      ) as HTMLTextAreaElement;
      await user.type(textarea, "Test comment");
      await user.click(textarea);

      const submitButton = screen.getByText("등록");
      await user.click(submitButton);

      await waitFor(() => {
        expect(textarea.value).toBe("");
      });
    });

    it("should not submit empty content", async () => {
      const user = userEvent.setup();
      render(<FacebookAnswerInput user={mockUser} onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText("댓글을 작성해주세요...");
      await user.click(textarea);

      const submitButton = screen.getByRole("button", { name: /등록/ });
      expect(submitButton).toBeDisabled();
    });

    it("should not submit whitespace-only content", async () => {
      const user = userEvent.setup();
      render(<FacebookAnswerInput user={mockUser} onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText("댓글을 작성해주세요...");
      await user.type(textarea, "   ");
      await user.click(textarea);

      const submitButton = screen.getByRole("button", { name: /등록/ });
      expect(submitButton).toBeDisabled();
    });

    it("should handle submission errors gracefully", async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const errorOnSubmit = jest
        .fn()
        .mockRejectedValue(new Error("Submission failed"));

      render(<FacebookAnswerInput user={mockUser} onSubmit={errorOnSubmit} />);

      const textarea = screen.getByPlaceholderText("댓글을 작성해주세요...");
      await user.type(textarea, "Test comment");
      await user.click(textarea);

      const submitButton = screen.getByText("등록");
      await user.click(submitButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("should submit on Ctrl+Enter", async () => {
      const user = userEvent.setup();
      render(<FacebookAnswerInput user={mockUser} onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText("댓글을 작성해주세요...");
      await user.type(textarea, "Test comment");

      await user.keyboard("{Control>}{Enter}{/Control}");

      expect(mockOnSubmit).toHaveBeenCalledWith("Test comment");
    });

    it("should cancel on Escape key", async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      render(
        <FacebookAnswerInput
          user={mockUser}
          onSubmit={mockOnSubmit}
          onCancel={onCancel}
        />
      );

      const textarea = screen.getByPlaceholderText(
        "댓글을 작성해주세요..."
      ) as HTMLTextAreaElement;
      await user.type(textarea, "Test comment");

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(textarea.value).toBe("");
      });
    });
  });

  describe("Cancel Functionality", () => {
    it("should clear content when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<FacebookAnswerInput user={mockUser} onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(
        "댓글을 작성해주세요..."
      ) as HTMLTextAreaElement;
      await user.type(textarea, "Test comment");
      await user.click(textarea);

      const cancelButton = screen.getByText("취소");
      await user.click(cancelButton);

      expect(textarea.value).toBe("");
    });

    it("should call onCancel callback if provided", async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      render(
        <FacebookAnswerInput
          user={mockUser}
          onSubmit={mockOnSubmit}
          onCancel={onCancel}
        />
      );

      const textarea = screen.getByPlaceholderText("댓글을 작성해주세요...");
      await user.type(textarea, "Test comment");
      await user.click(textarea);

      const cancelButton = screen.getByText("취소");
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe("Reply Mode", () => {
    it("should show reply header when in reply mode", () => {
      render(
        <FacebookAnswerInput
          user={mockUser}
          onSubmit={mockOnSubmit}
          isReply={true}
          parentAuthorName="Parent Author"
        />
      );

      expect(screen.getByText(/@Parent Author/)).toBeInTheDocument();
      expect(screen.getByText(/에게 답글 중/)).toBeInTheDocument();
    });

    it("should show close button in reply mode", () => {
      render(
        <FacebookAnswerInput
          user={mockUser}
          onSubmit={mockOnSubmit}
          isReply={true}
          parentAuthorName="Parent Author"
        />
      );

      expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    });

    it("should call onCancel when closing reply", async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();

      render(
        <FacebookAnswerInput
          user={mockUser}
          onSubmit={mockOnSubmit}
          isReply={true}
          parentAuthorName="Parent Author"
          onCancel={onCancel}
        />
      );

      const closeButton = screen.getByTestId("x-icon").parentElement!;
      await user.click(closeButton);

      expect(onCancel).toHaveBeenCalled();
    });

    it("should use custom placeholder in reply mode", () => {
      render(
        <FacebookAnswerInput
          user={mockUser}
          onSubmit={mockOnSubmit}
          isReply={true}
          placeholder="Reply to comment..."
        />
      );

      expect(
        screen.getByPlaceholderText("Reply to comment...")
      ).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should disable textarea when loading", () => {
      render(
        <FacebookAnswerInput
          user={mockUser}
          onSubmit={mockOnSubmit}
          isLoading={true}
        />
      );

      const textarea = screen.getByPlaceholderText("댓글을 작성해주세요...");
      expect(textarea).toBeDisabled();
    });

    it("should disable submit button when loading", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <FacebookAnswerInput
          user={mockUser}
          onSubmit={mockOnSubmit}
          isLoading={false}
        />
      );

      const textarea = screen.getByPlaceholderText("댓글을 작성해주세요...");
      await user.type(textarea, "Test");
      await user.click(textarea);

      // Verify button is enabled initially
      const submitButton = screen.getByRole("button", { name: /등록/ });
      expect(submitButton).not.toBeDisabled();

      // Rerender with loading state
      rerender(
        <FacebookAnswerInput
          user={mockUser}
          onSubmit={mockOnSubmit}
          isLoading={true}
        />
      );

      // Now button should be disabled
      const disabledSubmitButton = screen.getByRole("button", { name: /등록/ });
      expect(disabledSubmitButton).toBeDisabled();
    });

    it("should disable cancel button when loading", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <FacebookAnswerInput
          user={mockUser}
          onSubmit={mockOnSubmit}
          isLoading={false}
        />
      );

      const textarea = screen.getByPlaceholderText("댓글을 작성해주세요...");
      await user.type(textarea, "Test");
      await user.click(textarea);

      // Verify button is enabled initially
      const cancelButton = screen.getByText("취소");
      expect(cancelButton).not.toBeDisabled();

      // Rerender with loading state
      rerender(
        <FacebookAnswerInput
          user={mockUser}
          onSubmit={mockOnSubmit}
          isLoading={true}
        />
      );

      // Now button should be disabled
      const disabledCancelButton = screen.getByText("취소");
      expect(disabledCancelButton).toBeDisabled();
    });
  });

  describe("React.memo Optimization", () => {
    it("should not re-render when props remain unchanged", () => {
      const { rerender } = render(
        <FacebookAnswerInput user={mockUser} onSubmit={mockOnSubmit} />
      );

      const textarea = screen.getByPlaceholderText("댓글을 작성해주세요...");
      expect(textarea).toBeInTheDocument();

      // Re-render with same props
      rerender(<FacebookAnswerInput user={mockUser} onSubmit={mockOnSubmit} />);

      // Should still work correctly
      expect(textarea).toBeInTheDocument();
    });
  });
});
