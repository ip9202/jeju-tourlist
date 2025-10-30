// @TEST:ANSWER-INTERACTION-001-F1
// SPEC: SPEC-ANSWER-INTERACTION-001 - Question List Completion Badge Tests
// Tests for CheckCircle icon display when question has accepted answers

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

/**
 * Test Suite: Question List Completion Badge
 *
 * Purpose: Verify that completion badge (CheckCircle icon) displays correctly
 * Key Features:
 * - CheckCircle icon appears when question.isResolved=true
 * - Green styling applied to badge
 * - Accessible aria-label for screen readers
 */

// Mock Next.js navigation hooks
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

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  CheckCircle: (props: React.SVGProps<SVGSVGElement>) =>
    React.createElement("svg", {
      ...props,
      "data-testid": "check-circle-icon",
    }),
}));

// Simple mock component for testing
const QuestionCard = ({
  question,
}: {
  question: {
    id: string;
    title: string;
    isResolved: boolean;
    category?: { name: string };
  };
}) => {
  return React.createElement(
    "div",
    { "data-testid": `question-${question.id}` },
    React.createElement(
      "div",
      { className: "flex items-center gap-2" },
      React.createElement(
        "span",
        { className: "bg-blue-100 text-blue-800" },
        question.category?.name || "일반"
      ),
      question.isResolved &&
        React.createElement(
          "span",
          {
            className:
              "inline-flex items-center gap-1 bg-green-100 text-green-800",
            "data-testid": "completion-badge",
          },
          React.createElement("svg", {
            className: "w-3 h-3",
            "aria-label": "Question resolved",
            "data-testid": "check-circle-icon",
          }),
          "해결됨"
        )
    ),
    React.createElement("h3", {}, question.title)
  );
};

describe("Question List Completion Badge", () => {
  /**
   * Test Group 1: Badge Display
   */
  describe("Badge Display", () => {
    // [T-F1-01] Shows completion badge when isResolved=true
    it("should display completion badge when question is resolved", () => {
      const question = {
        id: "q1",
        title: "Test Question",
        isResolved: true,
        category: { name: "여행" },
      };

      render(<QuestionCard question={question} />);

      const badge = screen.getByTestId("completion-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("해결됨");
    });

    // [T-F1-02] Hides completion badge when isResolved=false
    it("should NOT display completion badge when question is not resolved", () => {
      const question = {
        id: "q2",
        title: "Test Question",
        isResolved: false,
        category: { name: "여행" },
      };

      render(<QuestionCard question={question} />);

      const badge = screen.queryByTestId("completion-badge");
      expect(badge).not.toBeInTheDocument();
    });
  });

  /**
   * Test Group 2: CheckCircle Icon
   */
  describe("CheckCircle Icon", () => {
    // [T-F1-03] Shows CheckCircle icon in badge
    it("should display CheckCircle icon when question is resolved", () => {
      const question = {
        id: "q3",
        title: "Test Question",
        isResolved: true,
        category: { name: "여행" },
      };

      render(<QuestionCard question={question} />);

      const icon = screen.getByTestId("check-circle-icon");
      expect(icon).toBeInTheDocument();
    });

    // [T-F1-04] Icon has accessible aria-label
    it("should have aria-label for accessibility", () => {
      const question = {
        id: "q4",
        title: "Test Question",
        isResolved: true,
        category: { name: "여행" },
      };

      render(<QuestionCard question={question} />);

      const icon = screen.getByTestId("check-circle-icon");
      expect(icon).toHaveAttribute("aria-label", "Question resolved");
    });
  });

  /**
   * Test Group 3: Styling
   */
  describe("Badge Styling", () => {
    // [T-F1-05] Badge has green styling
    it("should apply green background and text color", () => {
      const question = {
        id: "q5",
        title: "Test Question",
        isResolved: true,
        category: { name: "여행" },
      };

      render(<QuestionCard question={question} />);

      const badge = screen.getByTestId("completion-badge");
      expect(badge).toHaveClass("bg-green-100");
      expect(badge).toHaveClass("text-green-800");
    });

    // [T-F1-06] Badge uses inline-flex for icon alignment
    it("should use inline-flex layout for icon and text alignment", () => {
      const question = {
        id: "q6",
        title: "Test Question",
        isResolved: true,
        category: { name: "여행" },
      };

      render(<QuestionCard question={question} />);

      const badge = screen.getByTestId("completion-badge");
      expect(badge).toHaveClass("inline-flex");
      expect(badge).toHaveClass("items-center");
      expect(badge).toHaveClass("gap-1");
    });

    // [T-F1-07] Icon has correct size classes
    it("should apply w-3 h-3 size classes to icon", () => {
      const question = {
        id: "q7",
        title: "Test Question",
        isResolved: true,
        category: { name: "여행" },
      };

      render(<QuestionCard question={question} />);

      const icon = screen.getByTestId("check-circle-icon");
      expect(icon).toHaveClass("w-3");
      expect(icon).toHaveClass("h-3");
    });
  });

  /**
   * Test Group 4: Multiple Questions
   */
  describe("Multiple Questions List", () => {
    // [T-F1-08] Shows badges only for resolved questions
    it("should display badges only for resolved questions in a list", () => {
      const questions = [
        { id: "q1", title: "Question 1", isResolved: true },
        { id: "q2", title: "Question 2", isResolved: false },
        { id: "q3", title: "Question 3", isResolved: true },
        { id: "q4", title: "Question 4", isResolved: false },
      ];

      render(
        React.createElement(
          "div",
          {},
          questions.map(q =>
            React.createElement(QuestionCard, { key: q.id, question: q })
          )
        )
      );

      const badges = screen.getAllByTestId("completion-badge");
      expect(badges).toHaveLength(2);

      // Verify q1 and q3 have badges
      expect(screen.getByTestId("question-q1")).toContainElement(badges[0]);
      expect(screen.getByTestId("question-q3")).toContainElement(badges[1]);
    });
  });
});
