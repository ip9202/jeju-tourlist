// @CODE:ANSWER-INTERACTION-002-C1
// SPEC: SPEC-ANSWER-INTERACTION-002 - Point Distribution Service
// Manages point distribution and transaction records

import { PrismaClient } from "@prisma/client";

/**
 * PointService - Manages user points and transaction history
 *
 * @description
 * - Handles point increases/decreases with transaction atomicity
 * - Creates audit trail through PointTransaction records
 * - Ensures all-or-nothing behavior using Prisma transactions
 *
 * @example
 * ```typescript
 * const pointService = new PointService(prisma);
 * await pointService.increasePoints(userId, 50, "Answer adopted");
 * ```
 */

export interface IncreasePointsOptions {
  relatedType?: string;
  relatedId?: string;
  metadata?: any;
}

export interface IncreasePointsResult {
  newBalance: number;
  transactionId: string;
}

export class PointService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Increase user points with transaction record
   *
   * @param userId - User ID to receive points
   * @param amount - Amount of points to add (must be positive)
   * @param reason - Reason for point increase (for audit trail)
   * @param options - Optional metadata (relatedType, relatedId, etc.)
   * @returns New balance and transaction ID
   * @throws {Error} If amount is invalid or user doesn't exist
   *
   * @TAG:CODE:ANSWER-INTERACTION-002-C1
   * Key Features:
   * - Atomic transaction (all-or-nothing)
   * - Creates PointTransaction record for audit
   * - Updates User.points field
   * - Validates input parameters
   */
  async increasePoints(
    userId: string,
    amount: number,
    reason: string,
    options: IncreasePointsOptions = {}
  ): Promise<IncreasePointsResult> {
    // Validation: amount must be positive
    if (amount <= 0) {
      throw new Error("Point amount must be positive");
    }

    // Execute in transaction for atomicity
    const result = await this.prisma.$transaction(async tx => {
      // Step 1: Update user points
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: amount,
          },
        },
        select: {
          id: true,
          points: true,
        },
      });

      // Step 2: Create transaction record
      const transaction = await tx.pointTransaction.create({
        data: {
          userId,
          amount,
          balance: updatedUser.points,
          type: "ANSWER_ACCEPTED",
          description: reason,
          relatedType: options.relatedType || null,
          relatedId: options.relatedId || null,
          metadata: options.metadata || null,
        },
      });

      return {
        newBalance: updatedUser.points,
        transactionId: transaction.id,
      };
    });

    return result;
  }

  /**
   * Decrease user points with transaction record
   *
   * @param userId - User ID to deduct points from
   * @param amount - Amount of points to deduct (must be positive)
   * @param reason - Reason for point decrease
   * @param options - Optional metadata
   * @returns New balance and transaction ID
   * @throws {Error} If amount is invalid, insufficient points, or user doesn't exist
   *
   * @future Phase 3 feature (not implemented yet)
   */
  async decreasePoints(
    userId: string,
    amount: number,
    reason: string,
    options: IncreasePointsOptions = {}
  ): Promise<IncreasePointsResult> {
    // Validation: amount must be positive
    if (amount <= 0) {
      throw new Error("Point amount must be positive");
    }

    // Execute in transaction
    const result = await this.prisma.$transaction(async tx => {
      // Get current user points
      const currentUser = await tx.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });

      if (!currentUser) {
        throw new Error("User not found");
      }

      if (currentUser.points < amount) {
        throw new Error("Insufficient points");
      }

      // Update user points
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          points: {
            decrement: amount,
          },
        },
        select: {
          id: true,
          points: true,
        },
      });

      // Create transaction record (negative amount)
      const transaction = await tx.pointTransaction.create({
        data: {
          userId,
          amount: -amount, // Negative for deduction
          balance: updatedUser.points,
          type: "POINT_SPENT",
          description: reason,
          relatedType: options.relatedType || null,
          relatedId: options.relatedId || null,
          metadata: options.metadata || null,
        },
      });

      return {
        newBalance: updatedUser.points,
        transactionId: transaction.id,
      };
    });

    return result;
  }

  /**
   * Get user point balance
   *
   * @param userId - User ID
   * @returns Current point balance
   * @throws {Error} If user doesn't exist
   */
  async getBalance(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user.points;
  }

  /**
   * Get user transaction history
   *
   * @param userId - User ID
   * @param limit - Number of transactions to fetch (default: 20)
   * @returns Array of point transactions
   */
  async getTransactionHistory(userId: string, limit: number = 20) {
    return await this.prisma.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
