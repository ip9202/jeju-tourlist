// @TEST:ANSWER-INTERACTION-002-U1
// SPEC: SPEC-ANSWER-INTERACTION-002 - Point Distribution Unit Tests
// Tests for automatic point distribution when answer is adopted

import { PrismaClient } from "@prisma/client";
import { PointService } from "../PointService";

/**
 * Test Suite for Point Distribution Feature
 *
 * Purpose: Verify that points are correctly distributed when answers are adopted
 * Key Requirements:
 * - Answer author receives 50 points when their answer is adopted
 * - PointTransaction record is created for audit trail
 * - User.points field is updated atomically
 * - Transaction ensures all-or-nothing behavior
 */

// Mock Prisma Client for unit testing
const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  pointTransaction: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
} as unknown as PrismaClient;

describe("PointService - Unit Tests", () => {
  let pointService: PointService;

  beforeEach(() => {
    pointService = new PointService(mockPrismaClient);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Group 1: increasePoints() Success Cases
   * @TEST:ANSWER-INTERACTION-002-U1 - Basic point increase functionality
   */
  describe("increasePoints() - Success Cases", () => {
    // [T-U2-01] Successfully increase points for valid user
    it("should increase user points and create transaction record", async () => {
      const userId = "user-123";
      const amount = 50;
      const reason = "Answer adopted";

      // Mock: User exists with current points
      const mockUser = {
        id: userId,
        points: 100,
        email: "test@example.com",
        name: "Test User",
      };

      // Mock: $transaction executes both operations atomically
      (mockPrismaClient.$transaction as jest.Mock).mockImplementation(
        async (callback: unknown) => {
          // Simulate transaction execution
          const result = await callback(mockPrismaClient);
          return result;
        }
      );

      // Mock: User update increases points
      (mockPrismaClient.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        points: 150, // 100 + 50
      });

      // Mock: PointTransaction creation
      (mockPrismaClient.pointTransaction.create as jest.Mock).mockResolvedValue(
        {
          id: "transaction-001",
          userId,
          amount,
          balance: 150,
          type: "ANSWER_ACCEPTED",
          description: reason,
          createdAt: new Date(),
        }
      );

      const result = await pointService.increasePoints(userId, amount, reason);

      // Verify result
      expect(result).toBeDefined();
      expect(result.newBalance).toBe(150);
      expect(result.transactionId).toBe("transaction-001");

      // Verify $transaction was called
      expect(mockPrismaClient.$transaction).toHaveBeenCalledTimes(1);
    });

    // [T-U2-02] Points increase from 0 to 50 (new user)
    it("should increase points from 0 to 50 for new user", async () => {
      const userId = "new-user-456";
      const amount = 50;
      const reason = "Answer adopted";

      // Mock: User with 0 points
      const mockUser = {
        id: userId,
        points: 0,
        email: "newuser@example.com",
        name: "New User",
      };

      (mockPrismaClient.$transaction as jest.Mock).mockImplementation(
        async (callback: unknown) => {
          return await callback(mockPrismaClient);
        }
      );

      (mockPrismaClient.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        points: 50,
      });

      (mockPrismaClient.pointTransaction.create as jest.Mock).mockResolvedValue(
        {
          id: "transaction-002",
          userId,
          amount,
          balance: 50,
          type: "ANSWER_ACCEPTED",
          description: reason,
          createdAt: new Date(),
        }
      );

      const result = await pointService.increasePoints(userId, amount, reason);

      expect(result.newBalance).toBe(50);
      expect(result.transactionId).toBe("transaction-002");
    });

    // [T-U2-03] Multiple point increases accumulate correctly
    it("should correctly accumulate multiple point increases", async () => {
      const userId = "user-789";
      const amount = 50;
      const reason = "Answer adopted";

      // Mock transaction to simulate sequential increases
      (mockPrismaClient.$transaction as jest.Mock).mockImplementation(
        async (callback: unknown) => {
          return await callback(mockPrismaClient);
        }
      );

      // First increase: 100 → 150
      (mockPrismaClient.user.update as jest.Mock).mockResolvedValueOnce({
        id: userId,
        points: 150,
      });

      (
        mockPrismaClient.pointTransaction.create as jest.Mock
      ).mockResolvedValueOnce({
        id: "transaction-003",
        userId,
        amount,
        balance: 150,
        type: "ANSWER_ACCEPTED",
        description: reason,
        createdAt: new Date(),
      });

      const result1 = await pointService.increasePoints(userId, amount, reason);
      expect(result1.newBalance).toBe(150);

      // Second increase: 150 → 200
      (mockPrismaClient.user.update as jest.Mock).mockResolvedValueOnce({
        id: userId,
        points: 200,
      });

      (
        mockPrismaClient.pointTransaction.create as jest.Mock
      ).mockResolvedValueOnce({
        id: "transaction-004",
        userId,
        amount,
        balance: 200,
        type: "ANSWER_ACCEPTED",
        description: reason,
        createdAt: new Date(),
      });

      const result2 = await pointService.increasePoints(userId, amount, reason);
      expect(result2.newBalance).toBe(200);
    });
  });

  /**
   * Test Group 2: increasePoints() Error Cases
   * @TEST:ANSWER-INTERACTION-002-U2 - Error handling for invalid inputs
   */
  describe("increasePoints() - Error Cases", () => {
    // [T-U2-04] Throw error for invalid userId
    it("should throw error when user does not exist", async () => {
      const invalidUserId = "nonexistent-user";
      const amount = 50;
      const reason = "Answer adopted";

      // Mock: $transaction throws error when user not found
      (mockPrismaClient.$transaction as jest.Mock).mockImplementation(
        async (callback: unknown) => {
          // Simulate user.update throwing error
          (mockPrismaClient.user.update as jest.Mock).mockRejectedValue(
            new Error("User not found")
          );
          return await callback(mockPrismaClient);
        }
      );

      await expect(
        pointService.increasePoints(invalidUserId, amount, reason)
      ).rejects.toThrow("User not found");
    });

    // [T-U2-05] Throw error for negative point amount
    it("should throw error when amount is negative", async () => {
      const userId = "user-123";
      const negativeAmount = -50;
      const reason = "Invalid operation";

      await expect(
        pointService.increasePoints(userId, negativeAmount, reason)
      ).rejects.toThrow("Point amount must be positive");
    });

    // [T-U2-06] Throw error for zero point amount
    it("should throw error when amount is zero", async () => {
      const userId = "user-123";
      const zeroAmount = 0;
      const reason = "Invalid operation";

      await expect(
        pointService.increasePoints(userId, zeroAmount, reason)
      ).rejects.toThrow("Point amount must be positive");
    });
  });

  /**
   * Test Group 3: Transaction Atomicity
   * @TEST:ANSWER-INTERACTION-002-U3 - Verify transaction rollback behavior
   */
  describe("Transaction Atomicity", () => {
    // [T-U2-07] Transaction rollback when PointTransaction creation fails
    it("should rollback user.points update if transaction creation fails", async () => {
      const userId = "user-123";
      const amount = 50;
      const reason = "Answer adopted";

      // Mock: Transaction fails after user.update succeeds
      (mockPrismaClient.$transaction as jest.Mock).mockImplementation(
        async (callback: unknown) => {
          // Simulate user update succeeding
          (mockPrismaClient.user.update as jest.Mock).mockResolvedValue({
            id: userId,
            points: 150,
          });

          // But transaction creation fails
          (
            mockPrismaClient.pointTransaction.create as jest.Mock
          ).mockRejectedValue(new Error("Transaction creation failed"));

          // $transaction should throw and rollback
          await callback(mockPrismaClient);
        }
      );

      await expect(
        pointService.increasePoints(userId, amount, reason)
      ).rejects.toThrow("Transaction creation failed");

      // Verify $transaction was called (atomicity attempt)
      expect(mockPrismaClient.$transaction).toHaveBeenCalledTimes(1);
    });

    // [T-U2-08] Transaction rollback when user.update fails
    it("should not create transaction record if user.update fails", async () => {
      const userId = "user-123";
      const amount = 50;
      const reason = "Answer adopted";

      // Mock: Transaction fails at user.update
      (mockPrismaClient.$transaction as jest.Mock).mockImplementation(
        async (callback: unknown) => {
          // Simulate user update failing
          (mockPrismaClient.user.update as jest.Mock).mockRejectedValue(
            new Error("User update failed")
          );

          await callback(mockPrismaClient);
        }
      );

      await expect(
        pointService.increasePoints(userId, amount, reason)
      ).rejects.toThrow("User update failed");

      // PointTransaction.create should NOT have been called
      expect(mockPrismaClient.pointTransaction.create).not.toHaveBeenCalled();
    });
  });

  /**
   * Test Group 4: PointTransaction Metadata
   * Verify transaction records include correct metadata
   */
  describe("PointTransaction Metadata", () => {
    // [T-U2-09] Transaction includes correct type and description
    it("should create transaction with correct type and description", async () => {
      const userId = "user-123";
      const amount = 50;
      const reason = "Answer adopted";

      (mockPrismaClient.$transaction as jest.Mock).mockImplementation(
        async (callback: unknown) => {
          return await callback(mockPrismaClient);
        }
      );

      (mockPrismaClient.user.update as jest.Mock).mockResolvedValue({
        id: userId,
        points: 150,
      });

      (mockPrismaClient.pointTransaction.create as jest.Mock).mockResolvedValue(
        {
          id: "transaction-005",
          userId,
          amount,
          balance: 150,
          type: "ANSWER_ACCEPTED",
          description: reason,
          metadata: null,
          createdAt: new Date(),
        }
      );

      await pointService.increasePoints(userId, amount, reason);

      // Verify PointTransaction.create was called with correct data
      expect(mockPrismaClient.pointTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          amount,
          balance: 150,
          type: "ANSWER_ACCEPTED",
          description: reason,
        }),
      });
    });

    // [T-U2-10] Transaction records include relatedType and relatedId
    it("should create transaction with relatedType and relatedId for answer adoption", async () => {
      const userId = "user-123";
      const amount = 50;
      const reason = "Answer adopted";
      const answerId = "answer-456";

      (mockPrismaClient.$transaction as jest.Mock).mockImplementation(
        async (callback: unknown) => {
          return await callback(mockPrismaClient);
        }
      );

      (mockPrismaClient.user.update as jest.Mock).mockResolvedValue({
        id: userId,
        points: 150,
      });

      (mockPrismaClient.pointTransaction.create as jest.Mock).mockResolvedValue(
        {
          id: "transaction-006",
          userId,
          amount,
          balance: 150,
          type: "ANSWER_ACCEPTED",
          description: reason,
          relatedType: "ANSWER",
          relatedId: answerId,
          metadata: null,
          createdAt: new Date(),
        }
      );

      await pointService.increasePoints(userId, amount, reason, {
        relatedType: "ANSWER",
        relatedId: answerId,
      });

      // Verify relatedType and relatedId are included
      expect(mockPrismaClient.pointTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          relatedType: "ANSWER",
          relatedId: answerId,
        }),
      });
    });
  });
});
