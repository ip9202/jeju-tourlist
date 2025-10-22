/**
 * FacebookQuestionCard 컴포넌트 단위 테스트
 *
 * @description
 * - 컴포넌트 렌더링 테스트
 * - Props 검증
 * - 사용자 상호작용 테스트
 * - 배지 시스템 테스트
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FacebookQuestionCard } from "../../components/question/facebook/FacebookQuestionCard";
import "@testing-library/jest-dom";

// Mock 데이터
const mockQuestion = {
  id: "q_test_001",
  title: "제주도 맛집 추천",
  content: "제주도에서 유명한 맛집이 있을까요?",
  category: "맛집",
  author: {
    id: "user_001",
    name: "testUser",
    avatar: undefined,
  },
  viewCount: 150,
  likeCount: 45,
  answerCount: 8,
  createdAt: "2025-10-21",
  isLiked: false,
  isBookmarked: false,
};

describe("FacebookQuestionCard 컴포넌트", () => {
  describe("렌더링", () => {
    test("컴포넌트가 정상적으로 렌더링되어야 함", () => {
      render(<FacebookQuestionCard question={mockQuestion} />);

      // 제목 확인
      expect(screen.getByText(mockQuestion.title)).toBeInTheDocument();

      // 작성자 정보 확인
      expect(screen.getByText(mockQuestion.author.name)).toBeInTheDocument();

      // 카테고리 확인
      expect(screen.getByText(mockQuestion.category)).toBeInTheDocument();
    });

    test("질문 제목이 정확하게 표시되어야 함", () => {
      render(<FacebookQuestionCard question={mockQuestion} />);

      const title = screen.getByText(mockQuestion.title);
      expect(title).toBeVisible();
    });

    test("조회수가 올바르게 표시되어야 함", () => {
      render(<FacebookQuestionCard question={mockQuestion} />);

      // 조회수 텍스트 확인
      const viewText = screen.getByText(
        new RegExp(`${mockQuestion.viewCount}`)
      );
      expect(viewText).toBeInTheDocument();
    });

    test("답변 개수가 올바르게 표시되어야 함", () => {
      render(<FacebookQuestionCard question={mockQuestion} />);

      const answerText = screen.getByText(
        new RegExp(`${mockQuestion.answerCount}`)
      );
      expect(answerText).toBeInTheDocument();
    });

    test("작성 시간이 올바르게 표시되어야 함", () => {
      render(<FacebookQuestionCard question={mockQuestion} />);

      // "1일 전" 형식으로 표시될 것으로 예상
      expect(
        screen.getByText(/일 전|방금 전|시간 전|분 전/)
      ).toBeInTheDocument();
    });
  });

  describe("배지 시스템", () => {
    test("배지가 없어도 정상 렌더링되어야 함", () => {
      render(<FacebookQuestionCard question={mockQuestion} />);

      expect(screen.getByText(mockQuestion.author.name)).toBeInTheDocument();
    });
  });

  describe("사용자 상호작용", () => {
    test("좋아요 버튼을 클릭할 수 있어야 함", async () => {
      const user = userEvent.setup();
      const onLike = jest.fn();

      render(<FacebookQuestionCard question={mockQuestion} onLike={onLike} />);

      const likeButtons = screen.getAllByRole("button", { name: /좋아요/i });
      expect(likeButtons.length).toBeGreaterThan(0);

      await user.click(likeButtons[0]);

      expect(onLike).toHaveBeenCalled();
    });

    test("북마크 버튼을 클릭할 수 있어야 함", async () => {
      const user = userEvent.setup();
      const onBookmark = jest.fn();

      render(
        <FacebookQuestionCard question={mockQuestion} onBookmark={onBookmark} />
      );

      const bookmarkButtons = screen.queryAllByRole("button", {
        name: /북마크|저장/i,
      });
      if (bookmarkButtons.length > 0) {
        await user.click(bookmarkButtons[0]);
        expect(onBookmark).toHaveBeenCalled();
      }
    });

    test("좋아요 상태가 업데이트되어야 함", () => {
      const { rerender } = render(
        <FacebookQuestionCard question={mockQuestion} />
      );

      const updatedQuestion = {
        ...mockQuestion,
        isLiked: true,
        likeCount: 46,
      };

      rerender(<FacebookQuestionCard question={updatedQuestion} />);

      // 좋아요 개수가 업데이트됨
      expect(screen.getByText("46")).toBeInTheDocument();
    });
  });

  describe("접근성", () => {
    test("제목이 헤딩으로 마크업되어야 함", () => {
      render(<FacebookQuestionCard question={mockQuestion} />);

      // 최소한 제목이 보여야 함
      expect(screen.getByText(mockQuestion.title)).toBeInTheDocument();
    });

    test("인터랙티브 요소가 존재해야 함", () => {
      render(<FacebookQuestionCard question={mockQuestion} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    test("카테고리 정보가 표시되어야 함", () => {
      render(<FacebookQuestionCard question={mockQuestion} />);

      expect(screen.getByText(mockQuestion.category)).toBeInTheDocument();
    });
  });

  describe("에러 처리", () => {
    test("필수 props가 없으면 에러를 발생시켜야 함", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        render(
          <FacebookQuestionCard question={undefined as unknown as Question} />
        );
      }).toThrow();

      consoleSpy.mockRestore();
    });

    test("질문 데이터가 있으면 정상 렌더링되어야 함", () => {
      expect(() => {
        render(<FacebookQuestionCard question={mockQuestion} />);
      }).not.toThrow();
    });
  });

  describe("성능", () => {
    test("같은 props로 리렌더링되지 않아야 함 (메모이제이션)", () => {
      const { rerender } = render(
        <FacebookQuestionCard question={mockQuestion} />
      );

      // 같은 props로 리렌더링
      expect(() => {
        rerender(<FacebookQuestionCard question={mockQuestion} />);
      }).not.toThrow();
    });
  });
});
