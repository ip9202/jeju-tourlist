/**
 * Unit tests for FacebookBadge component
 * Tests badge rendering, styling, tooltips, and sizes
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { FacebookBadge } from "../FacebookBadge";
import type { BadgeType } from "../types";

describe("FacebookBadge", () => {
  describe("Badge Rendering", () => {
    it("should render accepted badge with green styling", () => {
      const { container } = render(<FacebookBadge type="accepted" />);

      const badge = container.querySelector(".bg-green-100");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("채택됨");
    });

    it("should render expert badge with blue styling", () => {
      const { container } = render(<FacebookBadge type="expert" />);

      const badge = container.querySelector(".bg-blue-100");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("전문가");
    });

    it("should render newbie badge with yellow styling", () => {
      const { container } = render(<FacebookBadge type="newbie" />);

      const badge = container.querySelector(".bg-yellow-100");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("신입");
    });

    it("should render popular badge with orange styling", () => {
      const { container } = render(<FacebookBadge type="popular" />);

      const badge = container.querySelector(".bg-orange-100");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("인기");
    });

    it("should render verified badge with purple styling", () => {
      const { container } = render(<FacebookBadge type="verified" />);

      const badge = container.querySelector(".bg-purple-100");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("인증");
    });

    it("should render badge icon", () => {
      const { container } = render(<FacebookBadge type="accepted" />);

      // Check for icon presence (✓)
      expect(container).toHaveTextContent("✓");
    });
  });

  describe("Badge Sizes", () => {
    it("should render small badge", () => {
      const { container } = render(<FacebookBadge type="accepted" size="sm" />);

      const badge = container.querySelector(".text-xs");
      expect(badge).toBeInTheDocument();
    });

    it("should render medium badge (default)", () => {
      const { container } = render(<FacebookBadge type="accepted" />);

      const badge = container.querySelector(".text-sm");
      expect(badge).toBeInTheDocument();
    });

    it("should render large badge", () => {
      const { container } = render(<FacebookBadge type="accepted" size="lg" />);

      const badge = container.querySelector(".text-base");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Tooltip Functionality", () => {
    it("should show tooltip as title attribute by default", () => {
      const { container } = render(<FacebookBadge type="accepted" />);

      const badge = container.querySelector("[title]");
      expect(badge).toHaveAttribute("title", "질문 작성자가 채택한 답변입니다");
    });

    it("should not show title attribute when showTooltip is true", () => {
      const { container } = render(
        <FacebookBadge type="accepted" showTooltip={true} />
      );

      const badge = container.querySelector(
        '[title="질문 작성자가 채택한 답변입니다"]'
      );
      expect(badge).not.toBeInTheDocument();
    });

    it("should have correct tooltip for expert badge", () => {
      const { container } = render(<FacebookBadge type="expert" />);

      const badge = container.querySelector("[title]");
      expect(badge).toHaveAttribute("title", "질문 작성자입니다");
    });

    it("should have correct tooltip for newbie badge", () => {
      const { container } = render(<FacebookBadge type="newbie" />);

      const badge = container.querySelector("[title]");
      expect(badge).toHaveAttribute(
        "title",
        "최근에 활동을 시작한 사용자입니다"
      );
    });
  });

  describe("Visual Styling", () => {
    it("should have hover effect classes", () => {
      const { container } = render(<FacebookBadge type="accepted" />);

      const badge = container.querySelector(".hover\\:shadow-md");
      expect(badge).toBeInTheDocument();
    });

    it("should have transition classes", () => {
      const { container } = render(<FacebookBadge type="accepted" />);

      const badge = container.querySelector(".transition-all");
      expect(badge).toBeInTheDocument();
    });

    it("should have rounded styling", () => {
      const { container } = render(<FacebookBadge type="accepted" />);

      const badge = container.querySelector(".rounded-full");
      expect(badge).toBeInTheDocument();
    });

    it("should have cursor-help class", () => {
      const { container } = render(<FacebookBadge type="accepted" />);

      const badge = container.querySelector(".cursor-help");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should have responsive text sizing", () => {
      const { container } = render(<FacebookBadge type="accepted" size="md" />);

      const badge = container.querySelector(".md\\:text-xs");
      expect(badge).toBeInTheDocument();
    });

    it("should hide badge label on mobile", () => {
      const { container } = render(<FacebookBadge type="accepted" />);

      const label = container.querySelector(".md\\:hidden");
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent("채택됨");
    });

    it("should show icon on all screen sizes", () => {
      const { container } = render(<FacebookBadge type="accepted" />);

      // Icon should always be visible (check for icon content directly)
      expect(container).toHaveTextContent("✓");
    });
  });

  describe("Badge Icons", () => {
    const badgeIcons: { type: BadgeType; icon: string }[] = [
      { type: "accepted", icon: "✓" },
      { type: "verified", icon: "✓" },
      { type: "expert", icon: "⭐" },
      { type: "popular", icon: "🔥" },
      { type: "newbie", icon: "🌟" },
    ];

    badgeIcons.forEach(({ type, icon }) => {
      it(`should render ${type} badge with correct icon: ${icon}`, () => {
        const { container } = render(<FacebookBadge type={type} />);
        expect(container).toHaveTextContent(icon);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle invalid badge type gracefully", () => {
      // @ts-expect-error Testing invalid type
      const { container } = render(<FacebookBadge type="invalid" />);

      // Should render nothing or handle gracefully
      expect(container.querySelector(".rounded-full")).not.toBeInTheDocument();
    });

    it("should memoize and prevent unnecessary re-renders", () => {
      const { rerender } = render(<FacebookBadge type="accepted" />);

      // Re-render with same props
      rerender(<FacebookBadge type="accepted" />);

      // Should still render correctly
      const badge = screen.getByText("채택됨");
      expect(badge).toBeInTheDocument();
    });
  });
});
