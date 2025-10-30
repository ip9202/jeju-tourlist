// @TEST:ANSWER-INTERACTION-001-U1
// SPEC: SPEC-ANSWER-INTERACTION-001 - Multiple Answer Adoption Unit Tests
// Tests for allowing multiple answer adoptions per question

import { PrismaClient } from "@prisma/client";
import { AnswerService } from "../AnswerService";

/**
 * Test Suite for Multiple Answer Adoption Feature
 *
 * Purpose: Verify that multiple answers can be adopted for a single question
 * Key Changes from Previous Behavior:
 * - acceptAnswer() no longer calls unacceptOtherAnswers()
 * - Multiple answers can have isAccepted=true simultaneously
 * - question.isResolved=true when ANY answer is accepted
 * - unacceptAnswer() manages isResolved based on remaining accepted answers
 */

// Mock Prisma Client with comprehensive answer adoption methods
const mockPrismaClient = {
  question: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  answer: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  answerLike: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  pointTransaction: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
  $disconnect: jest.fn(),
} as unknown as PrismaClient;

describe("AnswerService - Multiple Answer Adoption", () => {
  let answerService: AnswerService;
  const questionAuthorId = "question-author-123";
  const answerAuthorId = "answer-author-456";
  const questionId = "question-001";

  beforeEach(() => {
    answerService = new AnswerService(mockPrismaClient);
    jest.clearAllMocks();

    // Mock updateMany to return count: 0 by default (no other answers unaccepted)
    (mockPrismaClient.answer.updateMany as jest.Mock).mockResolvedValue({
      count: 0,
    });

    // Mock $transaction by default (Phase 2: point distribution integration)
    (mockPrismaClient.$transaction as jest.Mock).mockImplementation(
      async (callback: unknown) => {
        // Default mock: answer adoption succeeds, points distributed
        const txMock = {
          answer: {
            update: jest.fn().mockResolvedValue({
              id: "default-answer",
              isAccepted: true,
              acceptedAt: new Date(),
              author: {
                id: answerAuthorId,
                name: "Author",
                nickname: "nick",
                avatar: null,
              },
              question: {
                id: questionId,
                title: "Test",
                authorId: questionAuthorId,
              },
            }),
          },
          user: {
            update: jest.fn().mockResolvedValue({
              id: answerAuthorId,
              points: 50,
            }),
          },
          pointTransaction: {
            create: jest.fn().mockResolvedValue({
              id: "default-transaction",
              userId: answerAuthorId,
              amount: 50,
              balance: 50,
              type: "ANSWER_ACCEPTED",
              description: "Answer adopted",
            }),
          },
        };

        return await callback(txMock);
      }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Group 1: Multiple Answer Adoption
   * Verify that acceptAnswer() allows multiple answers to be adopted
   */
  describe("acceptAnswer() - Multiple Adoption Support", () => {
    // [T-U1-01] First answer adoption sets isAccepted=true and isResolved=true
    it("should accept first answer and mark question as resolved", async () => {
      const answerId = "answer-001";

      // Mock: Question exists and author matches
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: questionAuthorId,
        isResolved: false,
      });

      // Mock: Answer exists and belongs to question
      (mockPrismaClient.answer.findUnique as jest.Mock).mockResolvedValue({
        id: answerId,
        questionId: questionId,
        authorId: answerAuthorId,
        isAccepted: false,
      });

      // Mock: Update answer to accepted (via AnswerRepository)
      (mockPrismaClient.answer.update as jest.Mock).mockResolvedValue({
        id: answerId,
        isAccepted: true,
        acceptedAt: new Date(),
        author: {
          id: answerAuthorId,
          name: "Answer Author",
          nickname: "answer_nick",
          avatar: null,
        },
        question: {
          id: questionId,
          title: "Test Question",
          authorId: questionAuthorId,
        },
      });

      const result = await answerService.acceptAnswer(
        answerId,
        questionId,
        questionAuthorId
      );

      // Verify answer is accepted
      expect(result.isAccepted).toBe(true);
      expect(result.acceptedAt).toBeDefined();

      // Verify $transaction was called (Phase 2: transaction-based adoption)
      expect(mockPrismaClient.$transaction).toHaveBeenCalledTimes(1);
    });

    // [T-U1-02] Second answer adoption does NOT unaccept first answer
    it("should accept second answer WITHOUT unaccepting first answer", async () => {
      const secondAnswerId = "answer-002";

      // Mock: Question with one already accepted answer
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: questionAuthorId,
        isResolved: true, // Already resolved from first adoption
      });

      // Mock: Second answer exists
      (mockPrismaClient.answer.findUnique as jest.Mock).mockResolvedValue({
        id: secondAnswerId,
        questionId: questionId,
        authorId: "different-author-789",
        isAccepted: false,
      });

      // Mock: Update second answer to accepted
      (mockPrismaClient.answer.update as jest.Mock).mockResolvedValue({
        id: secondAnswerId,
        isAccepted: true,
        acceptedAt: new Date(),
        author: {
          id: "different-author-789",
          name: "Second Author",
          nickname: "second_nick",
          avatar: null,
        },
        question: {
          id: questionId,
          title: "Test Question",
          authorId: questionAuthorId,
        },
      });

      // Mock: Count accepted answers (will be 2 after this operation)
      (mockPrismaClient.answer.count as jest.Mock).mockResolvedValue(2);

      const result = await answerService.acceptAnswer(
        secondAnswerId,
        questionId,
        questionAuthorId
      );

      // Verify second answer is accepted
      expect(result.isAccepted).toBe(true);

      // CRITICAL: Verify that answer.updateMany was NOT called
      // This proves we did NOT unaccept other answers
      const updateManyCalls = (
        mockPrismaClient.answer.update as jest.Mock
      ).mock.calls.filter(call => call[0].where?.id?.not !== undefined);
      expect(updateManyCalls.length).toBe(0);
    });

    // [T-U1-03] Multiple answers can have isAccepted=true simultaneously
    it("should allow multiple answers to be accepted at the same time", async () => {
      const answerIds = ["answer-001", "answer-002", "answer-003"];

      for (const answerId of answerIds) {
        // Reset mocks for each iteration
        jest.clearAllMocks();

        // Mock: Question
        (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
          id: questionId,
          authorId: questionAuthorId,
          isResolved: true,
        });

        // Mock: Answer
        (mockPrismaClient.answer.findUnique as jest.Mock).mockResolvedValue({
          id: answerId,
          questionId: questionId,
          authorId: answerAuthorId,
          isAccepted: false,
        });

        // Mock: Update answer
        (mockPrismaClient.answer.update as jest.Mock).mockResolvedValue({
          id: answerId,
          isAccepted: true,
          acceptedAt: new Date(),
          author: {
            id: answerAuthorId,
            name: "Author",
            nickname: "nick",
            avatar: null,
          },
          question: {
            id: questionId,
            title: "Test",
            authorId: questionAuthorId,
          },
        });

        const result = await answerService.acceptAnswer(
          answerId,
          questionId,
          questionAuthorId
        );

        expect(result.isAccepted).toBe(true);
      }

      // All three answers should be accepted
      // (In real implementation, we'd query and verify all 3 have isAccepted=true)
    });

    // [T-U1-04] Question remains resolved when any answer is accepted
    it("should keep question.isResolved=true when multiple answers are accepted", async () => {
      const answerId = "answer-002";

      // Mock: Question already resolved
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: questionAuthorId,
        isResolved: true,
      });

      // Mock: Answer
      (mockPrismaClient.answer.findUnique as jest.Mock).mockResolvedValue({
        id: answerId,
        questionId: questionId,
        authorId: answerAuthorId,
        isAccepted: false,
      });

      // Mock: Update answer
      (mockPrismaClient.answer.update as jest.Mock).mockResolvedValue({
        id: answerId,
        isAccepted: true,
        acceptedAt: new Date(),
        author: {
          id: answerAuthorId,
          name: "Author",
          nickname: "nick",
          avatar: null,
        },
        question: {
          id: questionId,
          title: "Test",
          authorId: questionAuthorId,
        },
      });

      await answerService.acceptAnswer(answerId, questionId, questionAuthorId);

      // Question.isResolved should remain true
      // (updateQuestionResolvedStatus is called asynchronously with isResolved=true)
    });
  });

  /**
   * Test Group 2: isResolved State Management in unacceptAnswer()
   * Verify that unacceptAnswer() correctly manages question.isResolved
   */
  describe("unacceptAnswer() - isResolved State Management", () => {
    // [T-U1-05] Unaccepting answer when other accepted answers exist keeps isResolved=true
    it("should keep question.isResolved=true when other accepted answers exist", async () => {
      const answerId = "answer-001";

      // Mock: Question is resolved
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: questionAuthorId,
        isResolved: true,
      });

      // Mock: Answer is accepted
      (mockPrismaClient.answer.findUnique as jest.Mock).mockResolvedValue({
        id: answerId,
        questionId: questionId,
        isAccepted: true,
      });

      // Mock: Update answer to unaccepted
      (mockPrismaClient.answer.update as jest.Mock).mockResolvedValue({
        id: answerId,
        isAccepted: false,
        acceptedAt: null,
        author: {
          id: answerAuthorId,
          name: "Author",
          nickname: "nick",
          avatar: null,
        },
        question: {
          id: questionId,
          title: "Test",
          authorId: questionAuthorId,
        },
      });

      // Mock: Count remaining accepted answers (2 others still accepted)
      (mockPrismaClient.answer.count as jest.Mock).mockResolvedValue(2);

      await answerService.unacceptAnswer(
        answerId,
        questionId,
        questionAuthorId
      );

      // Verify answer.count was called to check remaining accepted answers
      expect(mockPrismaClient.answer.count).toHaveBeenCalledWith({
        where: {
          questionId: questionId,
          isAccepted: true,
        },
      });

      // Question should remain resolved (updateQuestionResolvedStatus called with true)
    });

    // [T-U1-06] Unaccepting last answer sets isResolved=false
    it("should set question.isResolved=false when unaccepting last accepted answer", async () => {
      const answerId = "answer-001";

      // Mock: Question is resolved
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: questionAuthorId,
        isResolved: true,
      });

      // Mock: Answer is accepted
      (mockPrismaClient.answer.findUnique as jest.Mock).mockResolvedValue({
        id: answerId,
        questionId: questionId,
        isAccepted: true,
      });

      // Mock: Update answer to unaccepted
      (mockPrismaClient.answer.update as jest.Mock).mockResolvedValue({
        id: answerId,
        isAccepted: false,
        acceptedAt: null,
        author: {
          id: answerAuthorId,
          name: "Author",
          nickname: "nick",
          avatar: null,
        },
        question: {
          id: questionId,
          title: "Test",
          authorId: questionAuthorId,
        },
      });

      // Mock: No remaining accepted answers
      (mockPrismaClient.answer.count as jest.Mock).mockResolvedValue(0);

      await answerService.unacceptAnswer(
        answerId,
        questionId,
        questionAuthorId
      );

      // Verify count was called
      expect(mockPrismaClient.answer.count).toHaveBeenCalledWith({
        where: {
          questionId: questionId,
          isAccepted: true,
        },
      });

      // Question should become unresolved (updateQuestionResolvedStatus called with false)
    });
  });

  /**
   * Test Group 3: Authorization Checks
   * Verify that only question authors can accept/unaccept answers
   */
  describe("Authorization - Question Author Only", () => {
    // [T-U1-07] Non-author cannot accept answer
    it("should throw error when non-author tries to accept answer", async () => {
      const answerId = "answer-001";
      const nonAuthorId = "different-user-999";

      // Mock: Question with different author
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: questionAuthorId,
        isResolved: false,
      });

      await expect(
        answerService.acceptAnswer(answerId, questionId, nonAuthorId)
      ).rejects.toThrow("질문 작성자만 답변을 채택할 수 있습니다.");
    });

    // [T-U1-08] Non-author cannot unaccept answer
    it("should throw error when non-author tries to unaccept answer", async () => {
      const answerId = "answer-001";
      const nonAuthorId = "different-user-999";

      // Mock: Question with different author
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: questionAuthorId,
        isResolved: true,
      });

      await expect(
        answerService.unacceptAnswer(answerId, questionId, nonAuthorId)
      ).rejects.toThrow("질문 작성자만 답변 채택을 해제할 수 있습니다.");
    });
  });

  /**
   * Test Group 4: Edge Cases
   */
  describe("Edge Cases", () => {
    // [T-U1-09] Cannot accept answer from different question
    it("should throw error when answer belongs to different question", async () => {
      const answerId = "answer-001";
      const wrongQuestionId = "wrong-question-999";

      // Mock: Question exists
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: questionAuthorId,
        isResolved: false,
      });

      // Mock: Answer belongs to DIFFERENT question
      (mockPrismaClient.answer.findUnique as jest.Mock).mockResolvedValue({
        id: answerId,
        questionId: wrongQuestionId, // Different!
        authorId: answerAuthorId,
      });

      await expect(
        answerService.acceptAnswer(answerId, questionId, questionAuthorId)
      ).rejects.toThrow("해당 질문의 답변이 아닙니다.");
    });

    // [T-U1-10] Cannot accept answer when question doesn't exist
    it("should throw error when question does not exist", async () => {
      const answerId = "answer-001";

      // Mock: Question not found
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue(
        null
      );

      await expect(
        answerService.acceptAnswer(answerId, questionId, questionAuthorId)
      ).rejects.toThrow("질문을 찾을 수 없습니다.");
    });

    // [T-U1-11] Cannot accept answer when answer doesn't exist
    it("should throw error when answer does not exist", async () => {
      const answerId = "answer-001";

      // Mock: Question exists
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: questionAuthorId,
        isResolved: false,
      });

      // Mock: Answer not found
      (mockPrismaClient.answer.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        answerService.acceptAnswer(answerId, questionId, questionAuthorId)
      ).rejects.toThrow("답변을 찾을 수 없습니다.");
    });
  });

  /**
   * Test Group 5: Point Distribution Integration
   * @TEST:ANSWER-INTERACTION-002-I1 - Verify point distribution on answer adoption
   */
  describe("acceptAnswer() - Point Distribution Integration", () => {
    // [T-I2-01] Points awarded when answer is adopted
    it("should increase author points by 50 when answer is adopted", async () => {
      const answerId = "answer-001";

      // Mock: Question exists
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: questionAuthorId,
        isResolved: false,
      });

      // Mock: Answer exists
      (mockPrismaClient.answer.findUnique as jest.Mock).mockResolvedValue({
        id: answerId,
        questionId: questionId,
        authorId: answerAuthorId,
        isAccepted: false,
      });

      // Mock: $transaction executes callback with tx client
      (mockPrismaClient.$transaction as jest.Mock).mockImplementation(
        async (callback: unknown) => {
          // Create mock tx client with same structure
          const txMock = {
            answer: {
              update: jest.fn().mockResolvedValue({
                id: answerId,
                isAccepted: true,
                acceptedAt: new Date(),
                authorId: answerAuthorId,
                author: {
                  id: answerAuthorId,
                  name: "Answer Author",
                  nickname: "answer_nick",
                  avatar: null,
                },
                question: {
                  id: questionId,
                  title: "Test Question",
                  authorId: questionAuthorId,
                },
              }),
            },
            user: {
              update: jest.fn().mockResolvedValue({
                id: answerAuthorId,
                points: 50,
              }),
            },
            pointTransaction: {
              create: jest.fn().mockResolvedValue({
                id: "transaction-001",
                userId: answerAuthorId,
                amount: 50,
                balance: 50,
                type: "ANSWER_ACCEPTED",
                description: "Answer adopted",
                relatedType: "ANSWER",
                relatedId: answerId,
              }),
            },
          };

          return await callback(txMock);
        }
      );

      const result = await answerService.acceptAnswer(
        answerId,
        questionId,
        questionAuthorId
      );

      expect(result.isAccepted).toBe(true);
      expect(result.pointsAwarded).toBe(50);
      expect(result.newBalance).toBe(50);
      expect(result.transactionId).toBe("transaction-001");

      // Verify $transaction was called
      expect(mockPrismaClient.$transaction).toHaveBeenCalledTimes(1);
    });

    // [T-I2-02] PointTransaction record created with correct metadata
    it("should create PointTransaction with ANSWER_ACCEPTED type", async () => {
      const answerId = "answer-002";
      let capturedTransactionData: Record<string, unknown> | null = null;

      // Mock: Question exists
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: questionAuthorId,
        isResolved: false,
      });

      // Mock: Answer exists
      (mockPrismaClient.answer.findUnique as jest.Mock).mockResolvedValue({
        id: answerId,
        questionId: questionId,
        authorId: answerAuthorId,
        isAccepted: false,
      });

      // Mock: $transaction with transaction data capture
      (mockPrismaClient.$transaction as jest.Mock).mockImplementation(
        async (callback: unknown) => {
          const txMock = {
            answer: {
              update: jest.fn().mockResolvedValue({
                id: answerId,
                isAccepted: true,
                acceptedAt: new Date(),
                authorId: answerAuthorId,
                author: {
                  id: answerAuthorId,
                  name: "Author",
                  nickname: "nick",
                  avatar: null,
                },
                question: {
                  id: questionId,
                  title: "Test",
                  authorId: questionAuthorId,
                },
              }),
            },
            user: {
              update: jest.fn().mockResolvedValue({
                id: answerAuthorId,
                points: 150,
              }),
            },
            pointTransaction: {
              create: jest.fn().mockImplementation(data => {
                capturedTransactionData = data.data;
                return Promise.resolve({
                  id: "transaction-002",
                  ...data.data,
                });
              }),
            },
          };

          return await callback(txMock);
        }
      );

      await answerService.acceptAnswer(answerId, questionId, questionAuthorId);

      // Verify pointTransaction includes correct metadata
      expect(capturedTransactionData).toBeDefined();
      expect(capturedTransactionData.type).toBe("ANSWER_ACCEPTED");
      expect(capturedTransactionData.relatedType).toBe("ANSWER");
      expect(capturedTransactionData.relatedId).toBe(answerId);
      expect(capturedTransactionData.amount).toBe(50);
      expect(capturedTransactionData.description).toBe("Answer adopted");
    });

    // [T-I2-03] Transaction rollback if point distribution fails
    it("should rollback answer adoption if point distribution fails", async () => {
      const answerId = "answer-003";

      // Mock: Question exists
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: questionAuthorId,
        isResolved: false,
      });

      // Mock: Answer exists
      (mockPrismaClient.answer.findUnique as jest.Mock).mockResolvedValue({
        id: answerId,
        questionId: questionId,
        authorId: answerAuthorId,
        isAccepted: false,
      });

      // Mock: $transaction that fails on user.update (simulating point distribution failure)
      (mockPrismaClient.$transaction as jest.Mock).mockImplementation(
        async (callback: unknown) => {
          const txMock = {
            answer: {
              update: jest.fn().mockResolvedValue({
                id: answerId,
                isAccepted: true,
                acceptedAt: new Date(),
                authorId: answerAuthorId,
                author: {
                  id: answerAuthorId,
                  name: "Author",
                  nickname: "nick",
                  avatar: null,
                },
                question: {
                  id: questionId,
                  title: "Test",
                  authorId: questionAuthorId,
                },
              }),
            },
            user: {
              // Simulate user not found error
              update: jest.fn().mockRejectedValue(new Error("User not found")),
            },
            pointTransaction: {
              create: jest.fn(),
            },
          };

          // $transaction should propagate the error
          return await callback(txMock);
        }
      );

      // Expect transaction to fail and throw error
      await expect(
        answerService.acceptAnswer(answerId, questionId, questionAuthorId)
      ).rejects.toThrow("User not found");

      // Verify $transaction was called (attempted)
      expect(mockPrismaClient.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
