// @TEST:ANSWER-INTERACTION-001-I1
// SPEC: SPEC-ANSWER-INTERACTION-001 - Multiple Answer Adoption API Integration Tests
// Integration tests for POST /api/answers/:id/accept endpoint

import request from "supertest";
import express, { Application, Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { createAnswerRouter } from "../answer";

/**
 * Integration Test Suite for Multiple Answer Adoption API
 *
 * Purpose: Verify that the API endpoint correctly handles multiple answer adoptions
 * Test Scope: HTTP requests, controller, service, repository layers
 */

// Mock Prisma Client
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
  pointTransaction: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
  $disconnect: jest.fn(),
} as unknown as PrismaClient;

// Mock auth middleware
jest.mock("../../middleware/auth", () => ({
  authMiddleware: (req: Request, res: Response, next: NextFunction) => {
    // Mock authenticated user
    req.user = {
      id: "question-author-123",
      email: "author@test.com",
      name: "Question Author",
    };
    next();
  },
}));

describe("POST /api/answers/:id/accept - Multiple Adoption Integration", () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/answers", createAnswerRouter(mockPrismaClient));
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock: updateMany returns count: 0
    (mockPrismaClient.answer.updateMany as jest.Mock).mockResolvedValue({
      count: 0,
    });

    // Mock $transaction (Phase 2: point distribution integration)
    (mockPrismaClient.$transaction as jest.Mock).mockImplementation(
      async (callback: unknown) => {
        const txMock = {
          answer: {
            update: jest.fn().mockResolvedValue({
              id: "answer-001",
              isAccepted: true,
              acceptedAt: new Date(),
              content: "Great answer!",
              author: {
                id: "answer-author-456",
                name: "Answer Author",
                nickname: "answer_nick",
                avatar: null,
              },
              question: {
                id: "question-001",
                title: "Test Question",
                authorId: "question-author-123",
              },
            }),
          },
          user: {
            update: jest.fn().mockResolvedValue({
              id: "answer-author-456",
              points: 50,
            }),
          },
          pointTransaction: {
            create: jest.fn().mockResolvedValue({
              id: "transaction-001",
              userId: "answer-author-456",
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

  /**
   * Test Group 1: Successful Multiple Adoptions
   */
  describe("Successful Multiple Adoptions", () => {
    // [T-I1-01] First answer adoption returns 200 with accepted answer
    it("should return 200 and accept first answer", async () => {
      const questionId = "question-001";
      const answerId = "answer-001";

      // Mock: Question exists
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: "question-author-123",
        isResolved: false,
      });

      // Mock: Answer exists
      (mockPrismaClient.answer.findUnique as jest.Mock).mockResolvedValue({
        id: answerId,
        questionId: questionId,
        authorId: "answer-author-456",
        isAccepted: false,
      });

      // Mock: Update answer
      (mockPrismaClient.answer.update as jest.Mock).mockResolvedValue({
        id: answerId,
        isAccepted: true,
        acceptedAt: new Date(),
        content: "Great answer!",
        author: {
          id: "answer-author-456",
          name: "Answer Author",
          nickname: "answer_nick",
          avatar: null,
        },
        question: {
          id: questionId,
          title: "Test Question",
          authorId: "question-author-123",
        },
      });

      const response = await request(app)
        .post(`/api/answers/${answerId}/accept`)
        .send({ questionId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isAccepted).toBe(true);
      expect(response.body.data.acceptedAt).toBeDefined();
      expect(response.body.message).toBe("답변이 성공적으로 채택되었습니다.");
    });

    // [T-I1-02] Second answer adoption returns 200 and both answers remain accepted
    it("should accept second answer and keep first answer accepted", async () => {
      const questionId = "question-001";
      const secondAnswerId = "answer-002";

      // Mock: Question already resolved
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: "question-author-123",
        isResolved: true,
      });

      // Mock: Second answer exists
      (mockPrismaClient.answer.findUnique as jest.Mock).mockResolvedValue({
        id: secondAnswerId,
        questionId: questionId,
        authorId: "different-author-789",
        isAccepted: false,
      });

      // Mock: Update second answer
      (mockPrismaClient.answer.update as jest.Mock).mockResolvedValue({
        id: secondAnswerId,
        isAccepted: true,
        acceptedAt: new Date(),
        content: "Another great answer!",
        author: {
          id: "different-author-789",
          name: "Second Author",
          nickname: "second_nick",
          avatar: null,
        },
        question: {
          id: questionId,
          title: "Test Question",
          authorId: "question-author-123",
        },
      });

      const response = await request(app)
        .post(`/api/answers/${secondAnswerId}/accept`)
        .send({ questionId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isAccepted).toBe(true);

      // Verify that updateMany was NOT called (no unaccepting of other answers)
      expect(mockPrismaClient.answer.updateMany).not.toHaveBeenCalled();
    });
  });

  /**
   * Test Group 2: Authorization Checks
   */
  describe("Authorization Checks", () => {
    // [T-I1-03] Non-author returns 404 with authorization error
    it("should return 404 when non-author tries to accept answer", async () => {
      const questionId = "question-001";
      const answerId = "answer-001";

      // Mock: Question with different author
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: "different-author-999", // Different from req.user.id
        isResolved: false,
      });

      const response = await request(app)
        .post(`/api/answers/${answerId}/accept`)
        .send({ questionId })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe(
        "질문 작성자만 답변을 채택할 수 있습니다."
      );
    });
  });

  /**
   * Test Group 3: Validation Errors
   */
  describe("Validation Errors", () => {
    // [T-I1-04] Missing questionId returns 400
    it("should return 400 when questionId is missing", async () => {
      const answerId = "answer-001";

      const response = await request(app)
        .post(`/api/answers/${answerId}/accept`)
        .send({}) // Missing questionId
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("질문 ID가 필요합니다.");
    });

    // [T-I1-05] Non-existent question returns 404
    it("should return 404 when question does not exist", async () => {
      const questionId = "non-existent-question";
      const answerId = "answer-001";

      // Mock: Question not found
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue(
        null
      );

      const response = await request(app)
        .post(`/api/answers/${answerId}/accept`)
        .send({ questionId })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("질문을 찾을 수 없습니다.");
    });

    // [T-I1-06] Non-existent answer returns 404
    it("should return 404 when answer does not exist", async () => {
      const questionId = "question-001";
      const answerId = "non-existent-answer";

      // Mock: Question exists
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: "question-author-123",
        isResolved: false,
      });

      // Mock: Answer not found
      (mockPrismaClient.answer.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post(`/api/answers/${answerId}/accept`)
        .send({ questionId })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("답변을 찾을 수 없습니다.");
    });

    // [T-I1-07] Answer from different question returns 404
    it("should return 404 when answer belongs to different question", async () => {
      const questionId = "question-001";
      const answerId = "answer-001";
      const differentQuestionId = "different-question-999";

      // Mock: Question exists
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: "question-author-123",
        isResolved: false,
      });

      // Mock: Answer belongs to different question
      (mockPrismaClient.answer.findUnique as jest.Mock).mockResolvedValue({
        id: answerId,
        questionId: differentQuestionId, // Different!
        authorId: "answer-author-456",
      });

      const response = await request(app)
        .post(`/api/answers/${answerId}/accept`)
        .send({ questionId })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("해당 질문의 답변이 아닙니다.");
    });
  });

  /**
   * Test Group 4: Response Format
   */
  describe("Response Format", () => {
    // [T-I1-08] Response includes ApiResponse structure
    it("should return response with standard ApiResponse structure", async () => {
      const questionId = "question-001";
      const answerId = "answer-001";

      // Mock: Question exists
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: "question-author-123",
        isResolved: false,
      });

      // Mock: Answer exists
      (mockPrismaClient.answer.findUnique as jest.Mock).mockResolvedValue({
        id: answerId,
        questionId: questionId,
        authorId: "answer-author-456",
      });

      // Mock: Update answer
      (mockPrismaClient.answer.update as jest.Mock).mockResolvedValue({
        id: answerId,
        isAccepted: true,
        acceptedAt: new Date(),
        content: "Test answer",
        author: {
          id: "answer-author-456",
          name: "Author",
          nickname: "nick",
          avatar: null,
        },
        question: {
          id: questionId,
          title: "Test",
          authorId: "question-author-123",
        },
      });

      const response = await request(app)
        .post(`/api/answers/${answerId}/accept`)
        .send({ questionId })
        .expect(200);

      // Verify ApiResponse structure
      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("timestamp");

      expect(response.body.success).toBe(true);
      expect(typeof response.body.timestamp).toBe("string");
    });
  });
});

/**
 * DELETE /api/answers/:id/accept - Unaccept Answer Integration Tests
 */
describe("DELETE /api/answers/:id/accept - Unaccept Answer Integration", () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/answers", createAnswerRouter(mockPrismaClient));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Group 5: Unaccept Answer with Remaining Accepted Answers
   */
  describe("Unaccept Answer - isResolved Management", () => {
    // [T-I1-09] Unaccept answer when other accepted answers exist
    it("should unaccept answer and keep question resolved when other accepted answers exist", async () => {
      const questionId = "question-001";
      const answerId = "answer-001";

      // Mock: Question exists
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: "question-author-123",
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
        content: "Test answer",
        author: {
          id: "answer-author-456",
          name: "Author",
          nickname: "nick",
          avatar: null,
        },
        question: {
          id: questionId,
          title: "Test",
          authorId: "question-author-123",
        },
      });

      // Mock: 2 other accepted answers remain
      (mockPrismaClient.answer.count as jest.Mock).mockResolvedValue(2);

      const response = await request(app)
        .delete(`/api/answers/${answerId}/accept`)
        .send({ questionId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isAccepted).toBe(false);
      expect(response.body.message).toBe("답변 채택이 해제되었습니다.");

      // Verify count was called
      expect(mockPrismaClient.answer.count).toHaveBeenCalledWith({
        where: {
          questionId: questionId,
          isAccepted: true,
        },
      });
    });

    // [T-I1-10] Unaccept last answer marks question as unresolved
    it("should unaccept answer and mark question as unresolved when no other accepted answers", async () => {
      const questionId = "question-001";
      const answerId = "answer-001";

      // Mock: Question exists
      (mockPrismaClient.question.findUnique as jest.Mock).mockResolvedValue({
        id: questionId,
        authorId: "question-author-123",
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
        content: "Test answer",
        author: {
          id: "answer-author-456",
          name: "Author",
          nickname: "nick",
          avatar: null,
        },
        question: {
          id: questionId,
          title: "Test",
          authorId: "question-author-123",
        },
      });

      // Mock: No remaining accepted answers
      (mockPrismaClient.answer.count as jest.Mock).mockResolvedValue(0);

      const response = await request(app)
        .delete(`/api/answers/${answerId}/accept`)
        .send({ questionId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isAccepted).toBe(false);

      // Verify count was called
      expect(mockPrismaClient.answer.count).toHaveBeenCalledWith({
        where: {
          questionId: questionId,
          isAccepted: true,
        },
      });
    });
  });
});
