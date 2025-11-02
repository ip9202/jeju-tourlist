/* eslint-disable @typescript-eslint/no-explicit-any */
// @TEST:ANSWER-VALIDATOR-VALID-001
// @TEST:ANSWER-VALIDATOR-REQUIRED-001
// @TEST:ANSWER-VALIDATOR-DEFAULTS-001
// @TEST:ANSWER-VALIDATOR-NULLABLE-001

import { validateAnswerData } from "../answerValidator";

describe("Answer Validator", () => {
  describe("@TEST:ANSWER-VALIDATOR-VALID-001 - 유효한 데이터 검증", () => {
    it("should validate complete answer data", () => {
      // Given: 완전한 답변 데이터
      const rawAnswer = {
        id: "answer-1",
        content: "Test answer content",
        author: {
          id: "user-1",
          name: "Test User",
          nickname: "testuser",
          avatar: "https://example.com/avatar.jpg",
        },
        createdAt: new Date("2024-01-01"),
        likeCount: 10,
        dislikeCount: 2,
        commentCount: 5,
        isAccepted: true,
        isLiked: true,
        isDisliked: false,
        isAuthor: true,
        isQuestionAuthor: false,
        replyCount: 3,
      };

      // When: 검증 실행
      const result = validateAnswerData(rawAnswer);

      // Then: 모든 필드가 정확히 검증되어야 함
      expect(result.id).toBe("answer-1");
      expect(result.content).toBe("Test answer content");
      expect(result.author.id).toBe("user-1");
      expect(result.likeCount).toBe(10);
      expect(result.isAccepted).toBe(true);
      expect(result.isLiked).toBe(true);
      expect(result.isAuthor).toBe(true);
      expect(result.replyCount).toBe(3);
    });

    it("should validate answer with parentId (comment)", () => {
      // Given: parentId가 있는 댓글 데이터
      const rawComment = {
        id: "comment-1",
        content: "Test comment",
        author: {
          id: "user-2",
          name: "Comment User",
          nickname: "commentuser",
          avatar: null,
        },
        createdAt: new Date("2024-01-02"),
        likeCount: 5,
        parentId: "answer-1",
        isLiked: false,
        isDisliked: false,
        isAuthor: false,
        isQuestionAuthor: false,
      };

      // When: 검증 실행
      const result = validateAnswerData(rawComment);

      // Then: parentId가 포함되어야 함
      expect(result.parentId).toBe("answer-1");
      expect(result.content).toBe("Test comment");
    });
  });

  describe("@TEST:ANSWER-VALIDATOR-REQUIRED-001 - 필수 필드 검증", () => {
    it("should throw error when id is missing", () => {
      // Given: id가 없는 데이터
      const invalidData = {
        content: "Test",
        author: { id: "user-1", name: "Test", nickname: "test" },
        createdAt: new Date(),
      };

      // When & Then: 에러가 발생해야 함
      expect(() => validateAnswerData(invalidData as any)).toThrow(
        "Answer ID is required"
      );
    });

    it("should throw error when content is missing", () => {
      // Given: content가 없는 데이터
      const invalidData = {
        id: "answer-1",
        author: { id: "user-1", name: "Test", nickname: "test" },
        createdAt: new Date(),
      };

      // When & Then: 에러가 발생해야 함
      expect(() => validateAnswerData(invalidData as any)).toThrow(
        "Answer content is required"
      );
    });

    it("should throw error when author is missing", () => {
      // Given: author가 없는 데이터
      const invalidData = {
        id: "answer-1",
        content: "Test content",
        createdAt: new Date(),
      };

      // When & Then: 에러가 발생해야 함
      expect(() => validateAnswerData(invalidData as any)).toThrow(
        "Answer author is required"
      );
    });

    it("should throw error when createdAt is missing", () => {
      // Given: createdAt가 없는 데이터
      const invalidData = {
        id: "answer-1",
        content: "Test content",
        author: { id: "user-1", name: "Test", nickname: "test" },
      };

      // When & Then: 에러가 발생해야 함
      expect(() => validateAnswerData(invalidData as any)).toThrow(
        "Answer createdAt is required"
      );
    });
  });

  describe("@TEST:ANSWER-VALIDATOR-DEFAULTS-001 - 기본값 설정", () => {
    it("should set default boolean values when missing", () => {
      // Given: boolean 필드가 누락된 데이터
      const rawAnswer = {
        id: "answer-1",
        content: "Test content",
        author: {
          id: "user-1",
          name: "Test User",
          nickname: "testuser",
        },
        createdAt: new Date(),
        likeCount: 10,
      };

      // When: 검증 실행
      const result = validateAnswerData(rawAnswer as any);

      // Then: 기본값이 설정되어야 함
      expect(result.isAccepted).toBe(false);
      expect(result.isLiked).toBe(false);
      expect(result.isDisliked).toBe(false);
      expect(result.isAuthor).toBe(false);
      expect(result.isQuestionAuthor).toBe(false);
    });

    it("should set default numeric values when missing", () => {
      // Given: 숫자 필드가 누락된 데이터
      const rawAnswer = {
        id: "answer-1",
        content: "Test content",
        author: {
          id: "user-1",
          name: "Test User",
          nickname: "testuser",
        },
        createdAt: new Date(),
      };

      // When: 검증 실행
      const result = validateAnswerData(rawAnswer as any);

      // Then: 기본값이 설정되어야 함
      expect(result.likeCount).toBe(0);
      expect(result.dislikeCount).toBe(0);
      expect(result.commentCount).toBe(0);
      expect(result.replyCount).toBe(0);
    });
  });

  describe("@TEST:ANSWER-VALIDATOR-NULLABLE-001 - Nullable 필드 처리", () => {
    it("should handle null avatar safely", () => {
      // Given: avatar가 null인 데이터
      const rawAnswer = {
        id: "answer-1",
        content: "Test content",
        author: {
          id: "user-1",
          name: "Test User",
          nickname: "testuser",
          avatar: null,
        },
        createdAt: new Date(),
        likeCount: 5,
      };

      // When: 검증 실행
      const result = validateAnswerData(rawAnswer as any);

      // Then: null이 안전하게 처리되어야 함
      expect(result.author.avatar).toBeNull();
      expect(result.author.id).toBe("user-1");
    });

    it("should handle undefined parentId (top-level answer)", () => {
      // Given: parentId가 undefined인 최상위 답변
      const rawAnswer = {
        id: "answer-1",
        content: "Test content",
        author: {
          id: "user-1",
          name: "Test User",
          nickname: "testuser",
        },
        createdAt: new Date(),
        likeCount: 5,
      };

      // When: 검증 실행
      const result = validateAnswerData(rawAnswer as any);

      // Then: parentId가 undefined여야 함
      expect(result.parentId).toBeUndefined();
    });

    it("should preserve null values in optional fields", () => {
      // Given: 옵셔널 필드가 null인 데이터
      const rawAnswer = {
        id: "answer-1",
        content: "Test content",
        author: {
          id: "user-1",
          name: "Test User",
          nickname: "testuser",
          avatar: null,
        },
        createdAt: new Date(),
        likeCount: 5,
        parentId: null,
      };

      // When: 검증 실행
      const result = validateAnswerData(rawAnswer as any);

      // Then: null 값이 보존되어야 함
      expect(result.author.avatar).toBeNull();
      expect(result.parentId).toBeNull();
    });
  });
});
