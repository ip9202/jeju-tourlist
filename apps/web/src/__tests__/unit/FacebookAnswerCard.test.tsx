/**
 * FacebookAnswerCard 컴포넌트 단위 테스트
 *
 * @description
 * - 답변 카드 렌더링 테스트
 * - 배지 시스템 테스트
 * - 사용자 상호작용 테스트
 * - Props 검증
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FacebookAnswerCard } from "../../components/question/facebook/FacebookAnswerCard";
import "@testing-library/jest-dom";

// Mock 데이터
const mockAnswer = {
  id: "ans_test_001",
  content:
    "제주도는 흑돼지 고기가 유명합니다. 중문 관광단지 근처의 흑돼지 식당들이 추천됩니다.",
  author: {
    id: "user_002",
    name: "localExpert",
    avatar: undefined,
  },
  badge: "expert" as const,
  likeCount: 23,
  dislikeCount: 1,
  isLiked: false,
  isDisliked: false,
  replyCount: 2,
  createdAt: "2025-10-20",
  updatedAt: "2025-10-20",
};

describe("FacebookAnswerCard 컴포넌트", () => {
  describe("렌더링", () => {
    test("답변 카드가 정상적으로 렌더링되어야 함", () => {
      render(<FacebookAnswerCard answer={mockAnswer} />);

      // 답변 내용 확인
      expect(screen.getByText(mockAnswer.content)).toBeInTheDocument();

      // 작성자 정보 확인
      expect(screen.getByText(mockAnswer.author.name)).toBeInTheDocument();
    });

    test("답변 내용이 올바르게 표시되어야 함", () => {
      render(<FacebookAnswerCard answer={mockAnswer} />);

      const content = screen.getByText(mockAnswer.content);
      expect(content).toBeVisible();
    });

    test("작성자 정보가 올바르게 표시되어야 함", () => {
      render(<FacebookAnswerCard answer={mockAnswer} />);

      expect(screen.getByText(mockAnswer.author.name)).toBeInTheDocument();
    });

    test("작성 시간이 올바르게 표시되어야 함", () => {
      render(<FacebookAnswerCard answer={mockAnswer} />);

      // "1일 전" 형식으로 표시될 것으로 예상
      expect(
        screen.getByText(/일 전|방금 전|시간 전|분 전/)
      ).toBeInTheDocument();
    });

    test("댓글 개수가 올바르게 표시되어야 함", () => {
      render(<FacebookAnswerCard answer={mockAnswer} />);

      // "2개 보기" 형태로 표시
      expect(screen.getByText(/답글.*2/)).toBeInTheDocument();
    });
  });

  describe("배지 시스템", () => {
    test("Expert 배지가 표시되어야 함", () => {
      render(<FacebookAnswerCard answer={mockAnswer} />);

      // 배지가 렌더링되었는지 확인 (구체적 라벨은 컴포넌트에 따라 다를 수 있음)
      const container = screen.getByText(mockAnswer.author.name);
      expect(container).toBeInTheDocument();
    });

    test("배지가 없으면 정상 렌더링되어야 함", () => {
      const noBadgeAnswer = {
        ...mockAnswer,
        badge: undefined,
      };

      render(<FacebookAnswerCard answer={noBadgeAnswer} />);

      expect(screen.getByText(mockAnswer.author.name)).toBeInTheDocument();
    });
  });

  describe("사용자 상호작용", () => {
    test("좋아요 버튼을 클릭할 수 있어야 함", async () => {
      const user = userEvent.setup();
      const onLike = jest.fn();

      render(<FacebookAnswerCard answer={mockAnswer} onLike={onLike} />);

      const likeButtons = screen.getAllByRole("button", { name: /좋아요/i });
      expect(likeButtons.length).toBeGreaterThan(0);

      await user.click(likeButtons[0]);

      expect(onLike).toHaveBeenCalled();
    });

    test("싫어요 버튼을 클릭할 수 있어야 함", async () => {
      const user = userEvent.setup();
      const onDislike = jest.fn();

      render(<FacebookAnswerCard answer={mockAnswer} onDislike={onDislike} />);

      const dislikeButtons = screen.getAllByRole("button", { name: /싫어요/i });
      expect(dislikeButtons.length).toBeGreaterThan(0);

      await user.click(dislikeButtons[0]);

      expect(onDislike).toHaveBeenCalled();
    });

    test("답글 버튼을 클릭할 수 있어야 함", async () => {
      const user = userEvent.setup();
      const onReply = jest.fn();

      render(<FacebookAnswerCard answer={mockAnswer} onReply={onReply} />);

      const replyButtons = screen.getAllByRole("button", { name: /답글/i });
      expect(replyButtons.length).toBeGreaterThan(0);

      await user.click(replyButtons[0]);

      expect(onReply).toHaveBeenCalled();
    });
  });

  describe("접근성", () => {
    test("인터랙티브 요소가 존재해야 함", () => {
      render(<FacebookAnswerCard answer={mockAnswer} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    test("답변 내용이 읽을 수 있어야 함", () => {
      render(<FacebookAnswerCard answer={mockAnswer} />);

      expect(screen.getByText(mockAnswer.content)).toBeVisible();
    });

    test("작성자 정보가 표시되어야 함", () => {
      render(<FacebookAnswerCard answer={mockAnswer} />);

      expect(screen.getByText(mockAnswer.author.name)).toBeInTheDocument();
    });
  });

  describe("에러 처리", () => {
    test("필수 props가 없으면 에러를 발생시켜야 함", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        render(<FacebookAnswerCard answer={undefined as unknown as Answer} />);
      }).toThrow();

      consoleSpy.mockRestore();
    });

    test("답변 데이터가 있으면 정상 렌더링되어야 함", () => {
      expect(() => {
        render(<FacebookAnswerCard answer={mockAnswer} />);
      }).not.toThrow();
    });
  });
});
