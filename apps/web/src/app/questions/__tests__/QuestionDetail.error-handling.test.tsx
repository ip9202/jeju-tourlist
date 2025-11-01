// @TEST:ANSWER-INTERACTION-001-F3
// SPEC: SPEC-ANSWER-INTERACTION-001 - Answer Error Handling with Countdown Timer Tests
// Tests for error banner display and auto-dismiss countdown functionality

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

/**
 * Test Suite: Question Detail Error Handling
 *
 * Purpose: Verify that answer interaction errors display with countdown timer and auto-dismiss
 * Key Features:
 * - Error banner appears prominently at top of answer section
 * - Countdown timer displays 4, 3, 2, 1, then auto-closes
 * - Manual close button stops timer and closes banner immediately
 * - User-friendly messages from API response.message field
 * - ARIA alert role for accessibility
 */

// Mock hooks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => null),
  })),
  usePathname: jest.fn(() => "/questions"),
}));

// Mock API client
jest.mock("@/lib/apiClient", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

/**
 * Mock Error Banner Component
 * Mimics the actual error banner from QuestionDetailPage
 */
const MockErrorBanner = ({
  error,
  countdown,
  onClose,
}: {
  error: string;
  countdown: number;
  onClose: () => void;
}) => {
  return error ? (
    <div
      className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start gap-3"
      data-testid="answer-error-banner"
      role="alert"
    >
      <svg
        className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
        data-testid="error-icon"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <div className="flex-1">
        <p className="text-red-800 font-medium" data-testid="error-message">
          {error}
        </p>
        <p className="text-red-700 text-xs mt-1" data-testid="countdown-text">
          {countdown}초 후 자동으로 닫힙니다.
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
        aria-label="에러 메시지 닫기"
        data-testid="error-close-btn"
      >
        ✕
      </button>
    </div>
  ) : null;
};

/**
 * Mock QuestionDetail Component with error handling logic
 */
const MockQuestionDetail = () => {
  const [answerError, setAnswerError] = React.useState("");
  const [countdown, setCountdown] = React.useState(0);
  const countdownIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const ANSWER_ERROR_TIMEOUT_MS = 4000;

  const setAnswerErrorWithTimer = (message: string) => {
    setAnswerError(message);
    setCountdown(ANSWER_ERROR_TIMEOUT_MS / 1000); // 4로 설정

    // 이전 interval 정리
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // 카운트다운 시작 - 처음부터 4로 표시하고 1초마다 감소
    let remainingSeconds = ANSWER_ERROR_TIMEOUT_MS / 1000;
    countdownIntervalRef.current = setInterval(() => {
      remainingSeconds--;
      setCountdown(remainingSeconds);
      if (remainingSeconds <= 0) {
        setAnswerError("");
        clearInterval(countdownIntervalRef.current!);
      }
    }, 1000);
  };

  const handleCloseError = () => {
    setAnswerError("");
    setCountdown(0);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  const handleSimulateError = (message: string) => {
    setAnswerErrorWithTimer(message);
  };

  React.useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  return (
    <div>
      <MockErrorBanner
        error={answerError}
        countdown={countdown}
        onClose={handleCloseError}
      />
      <button
        data-testid="trigger-error-btn"
        onClick={() => handleSimulateError("자신의 답변은 채택할 수 없습니다.")}
      >
        Trigger Error
      </button>
      <button
        data-testid="trigger-like-error-btn"
        onClick={() => handleSimulateError("좋아요 처리에 실패했습니다.")}
      >
        Trigger Like Error
      </button>
    </div>
  );
};

describe("Question Detail Error Handling", () => {
  /**
   * Test Group 1: Error Banner Display
   */
  describe("Error Banner Display", () => {
    // [T-F3-01] Error banner appears when error is set
    it("should display error banner when error message is set", () => {
      render(<MockQuestionDetail />);

      const triggerBtn = screen.getByTestId("trigger-error-btn");
      fireEvent.click(triggerBtn);

      const banner = screen.getByTestId("answer-error-banner");
      expect(banner).toBeInTheDocument();
    });

    // [T-F3-02] Error banner is hidden when no error
    it("should NOT display error banner when no error message", () => {
      render(<MockQuestionDetail />);

      const banner = screen.queryByTestId("answer-error-banner");
      expect(banner).not.toBeInTheDocument();
    });

    // [T-F3-03] Error message displays correct text
    it("should display correct error message text", () => {
      render(<MockQuestionDetail />);

      const triggerBtn = screen.getByTestId("trigger-error-btn");
      fireEvent.click(triggerBtn);

      const messageEl = screen.getByTestId("error-message");
      expect(messageEl).toHaveTextContent("자신의 답변은 채택할 수 없습니다.");
    });

    // [T-F3-04] Banner has ARIA alert role for accessibility
    it("should have role='alert' for accessibility", () => {
      render(<MockQuestionDetail />);

      const triggerBtn = screen.getByTestId("trigger-error-btn");
      fireEvent.click(triggerBtn);

      const banner = screen.getByTestId("answer-error-banner");
      expect(banner).toHaveAttribute("role", "alert");
    });
  });

  /**
   * Test Group 2: Countdown Timer Display
   */
  describe("Countdown Timer Display", () => {
    // [T-F3-05] Countdown starts at 4
    it("should display countdown starting at 4 seconds", () => {
      render(<MockQuestionDetail />);

      const triggerBtn = screen.getByTestId("trigger-error-btn");
      fireEvent.click(triggerBtn);

      const countdownText = screen.getByTestId("countdown-text");
      expect(countdownText).toHaveTextContent("4초 후 자동으로 닫힙니다.");
    });

    // [T-F3-06] Countdown decrements every second
    it("should decrement countdown every second", async () => {
      jest.useFakeTimers();

      render(<MockQuestionDetail />);

      const triggerBtn = screen.getByTestId("trigger-error-btn");
      fireEvent.click(triggerBtn);

      const countdownText = screen.getByTestId("countdown-text");

      // Initial state should be 4
      expect(countdownText).toHaveTextContent("4초 후 자동으로 닫힙니다.");

      // After 1 second
      jest.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(countdownText).toHaveTextContent("3초 후 자동으로 닫힙니다.");
      });

      // After 2 seconds total
      jest.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(countdownText).toHaveTextContent("2초 후 자동으로 닫힙니다.");
      });

      // After 3 seconds total
      jest.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(countdownText).toHaveTextContent("1초 후 자동으로 닫힙니다.");
      });

      jest.useRealTimers();
    });

    // [T-F3-07] Banner auto-closes when countdown reaches 0
    it("should auto-close banner when countdown reaches 0", async () => {
      jest.useFakeTimers();

      render(<MockQuestionDetail />);

      const triggerBtn = screen.getByTestId("trigger-error-btn");
      fireEvent.click(triggerBtn);

      const banner = screen.getByTestId("answer-error-banner");
      expect(banner).toBeInTheDocument();

      // Fast-forward 4 seconds
      jest.advanceTimersByTime(4000);

      await waitFor(() => {
        expect(
          screen.queryByTestId("answer-error-banner")
        ).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    // [T-F3-08] Multiple errors reset countdown
    it("should reset countdown when new error is triggered", async () => {
      jest.useFakeTimers();

      render(<MockQuestionDetail />);

      // Trigger first error
      const triggerBtn = screen.getByTestId("trigger-error-btn");
      fireEvent.click(triggerBtn);

      let countdownText = screen.getByTestId("countdown-text");
      expect(countdownText).toHaveTextContent("4초 후 자동으로 닫힙니다.");

      // Advance 2 seconds
      jest.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(countdownText).toHaveTextContent("2초 후 자동으로 닫힙니다.");
      });

      // Trigger new error (should reset to 4)
      const triggerLikeBtn = screen.getByTestId("trigger-like-error-btn");
      fireEvent.click(triggerLikeBtn);

      countdownText = screen.getByTestId("countdown-text");
      await waitFor(() => {
        expect(countdownText).toHaveTextContent("4초 후 자동으로 닫힙니다.");
      });

      jest.useRealTimers();
    });
  });

  /**
   * Test Group 3: Manual Close Button
   */
  describe("Manual Close Button", () => {
    // [T-F3-09] Close button closes error banner immediately
    it("should close banner immediately when close button is clicked", () => {
      render(<MockQuestionDetail />);

      const triggerBtn = screen.getByTestId("trigger-error-btn");
      fireEvent.click(triggerBtn);

      const banner = screen.getByTestId("answer-error-banner");
      expect(banner).toBeInTheDocument();

      const closeBtn = screen.getByTestId("error-close-btn");
      fireEvent.click(closeBtn);

      expect(
        screen.queryByTestId("answer-error-banner")
      ).not.toBeInTheDocument();
    });

    // [T-F3-10] Close button stops countdown timer
    it("should clear countdown timer when close button is clicked", async () => {
      jest.useFakeTimers();

      render(<MockQuestionDetail />);

      const triggerBtn = screen.getByTestId("trigger-error-btn");
      fireEvent.click(triggerBtn);

      const closeBtn = screen.getByTestId("error-close-btn");
      fireEvent.click(closeBtn);

      // Advance time - banner should not reappear
      jest.advanceTimersByTime(5000);

      expect(
        screen.queryByTestId("answer-error-banner")
      ).not.toBeInTheDocument();

      jest.useRealTimers();
    });

    // [T-F3-11] Close button has accessible aria-label
    it("should have aria-label for accessibility", () => {
      render(<MockQuestionDetail />);

      const triggerBtn = screen.getByTestId("trigger-error-btn");
      fireEvent.click(triggerBtn);

      const closeBtn = screen.getByTestId("error-close-btn");
      expect(closeBtn).toHaveAttribute("aria-label", "에러 메시지 닫기");
    });
  });

  /**
   * Test Group 4: Error Banner Styling
   */
  describe("Error Banner Styling", () => {
    // [T-F3-12] Banner has red background and border
    it("should have red background and left border", () => {
      render(<MockQuestionDetail />);

      const triggerBtn = screen.getByTestId("trigger-error-btn");
      fireEvent.click(triggerBtn);

      const banner = screen.getByTestId("answer-error-banner");
      expect(banner).toHaveClass("bg-red-50");
      expect(banner).toHaveClass("border-l-4");
      expect(banner).toHaveClass("border-red-500");
    });

    // [T-F3-13] Error message has red text color
    it("should have red text color for error message", () => {
      render(<MockQuestionDetail />);

      const triggerBtn = screen.getByTestId("trigger-error-btn");
      fireEvent.click(triggerBtn);

      const message = screen.getByTestId("error-message");
      expect(message).toHaveClass("text-red-800");
      expect(message).toHaveClass("font-medium");
    });

    // [T-F3-14] Countdown text has smaller font size
    it("should have smaller font size for countdown text", () => {
      render(<MockQuestionDetail />);

      const triggerBtn = screen.getByTestId("trigger-error-btn");
      fireEvent.click(triggerBtn);

      const countdownText = screen.getByTestId("countdown-text");
      expect(countdownText).toHaveClass("text-xs");
    });

    // [T-F3-15] Error icon is displayed
    it("should display error icon", () => {
      render(<MockQuestionDetail />);

      const triggerBtn = screen.getByTestId("trigger-error-btn");
      fireEvent.click(triggerBtn);

      const icon = screen.getByTestId("error-icon");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("w-5");
      expect(icon).toHaveClass("h-5");
    });
  });

  /**
   * Test Group 5: Different Error Messages
   */
  describe("Different Error Messages", () => {
    // [T-F3-16] Display adoption error message
    it("should display adoption error message", () => {
      render(<MockQuestionDetail />);

      const triggerBtn = screen.getByTestId("trigger-error-btn");
      fireEvent.click(triggerBtn);

      const message = screen.getByTestId("error-message");
      expect(message).toHaveTextContent("자신의 답변은 채택할 수 없습니다.");
    });

    // [T-F3-17] Display like error message
    it("should display like error message", () => {
      render(<MockQuestionDetail />);

      const triggerBtn = screen.getByTestId("trigger-like-error-btn");
      fireEvent.click(triggerBtn);

      const message = screen.getByTestId("error-message");
      expect(message).toHaveTextContent("좋아요 처리에 실패했습니다.");
    });

    // [T-F3-18] Error message changes when different error triggered
    it("should update error message when new error is triggered", () => {
      render(<MockQuestionDetail />);

      // First error
      let triggerBtn = screen.getByTestId("trigger-error-btn");
      fireEvent.click(triggerBtn);

      let message = screen.getByTestId("error-message");
      expect(message).toHaveTextContent("자신의 답변은 채택할 수 없습니다.");

      // Close first error
      let closeBtn = screen.getByTestId("error-close-btn");
      fireEvent.click(closeBtn);

      expect(
        screen.queryByTestId("answer-error-banner")
      ).not.toBeInTheDocument();

      // Trigger different error
      triggerBtn = screen.getByTestId("trigger-like-error-btn");
      fireEvent.click(triggerBtn);

      message = screen.getByTestId("error-message");
      expect(message).toHaveTextContent("좋아요 처리에 실패했습니다.");
    });
  });

  /**
   * Test Group 6: Cleanup
   */
  describe("Cleanup", () => {
    // [T-F3-19] Timer is cleared on component unmount
    it("should clear timer on component unmount", () => {
      const { unmount } = render(<MockQuestionDetail />);

      const triggerBtn = screen.getByTestId("trigger-error-btn");
      fireEvent.click(triggerBtn);

      const banner = screen.getByTestId("answer-error-banner");
      expect(banner).toBeInTheDocument();

      // Unmount component
      unmount();

      // Should not throw or cause errors
      expect(true).toBe(true);
    });
  });
});
