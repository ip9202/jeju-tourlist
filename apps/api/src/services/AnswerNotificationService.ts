/**
 * @CODE:ANSWER-INTERACTION-001-E1
 * @CODE:ANSWER-INTERACTION-001-E2
 * @CODE:ANSWER-INTERACTION-001-E3
 *
 * Answer Notification Service
 *
 * SPEC: SPEC-ANSWER-INTERACTION-001 - Phase 6: Real-time Socket.io Notifications
 *
 * Responsibilities:
 * - Broadcast answer adoption events via Socket.io
 * - Broadcast like/dislike count updates via Socket.io
 * - Broadcast badge award notifications via Socket.io
 *
 * SOLID Principles:
 * - Single Responsibility: Handles only Socket.io notification broadcasting
 * - Open/Closed: Easy to extend with new event types
 * - Dependency Inversion: Depends on TypedServer interface, not concrete implementation
 */

import { TypedServer } from "../types/socket";

export class AnswerNotificationService {
  constructor(private readonly io: TypedServer) {}

  /**
   * Broadcast answer adoption event to all connected clients
   *
   * @TAG:CODE:ANSWER-INTERACTION-001-E1
   * @param answerId - The ID of the adopted answer
   * @param adopterId - The ID of the user who adopted the answer
   * @param adopteeId - The ID of the answer author (receives points)
   * @param questionId - The ID of the parent question
   */
  async broadcastAnswerAdopted(
    answerId: string,
    adopterId: string,
    adopteeId: string,
    questionId: string
  ): Promise<void> {
    try {
      // Validate parameters
      if (!answerId || !adopterId || !adopteeId || !questionId) {
        throw new Error("Invalid parameters for answer adoption broadcast");
      }

      const timestamp = Date.now();

      // Broadcast to all connected clients
      this.io.emit("answer_adopted", {
        answerId,
        adopterId,
        adopteeId,
        questionId,
        timestamp,
      });

      // Send targeted notification to answer author
      this.io.to(`user:${adopteeId}`).emit("notification", {
        type: "accepted" as const,
        title: "Your answer was adopted!",
        message: "Your answer received 50 points",
        targetUserId: adopteeId,
        data: {
          answerId,
          questionId,
          points: 50,
        },
      });
    } catch (error) {
      console.error("Failed to broadcast answer adoption:", error);
      throw new Error("Failed to broadcast answer adoption");
    }
  }

  /**
   * Broadcast answer reaction (like/dislike) updates
   *
   * @TAG:CODE:ANSWER-INTERACTION-001-E2
   * @param answerId - The ID of the answer
   * @param likeCount - Updated like count
   * @param dislikeCount - Updated dislike count
   * @param questionId - Optional question ID for room-specific broadcast
   */
  async broadcastAnswerReaction(
    answerId: string,
    likeCount: number,
    dislikeCount: number,
    questionId?: string
  ): Promise<void> {
    try {
      // Validate counts
      if (likeCount < 0 || dislikeCount < 0) {
        throw new Error("Invalid reaction counts");
      }

      const timestamp = Date.now();

      const payload = {
        answerId,
        likeCount,
        dislikeCount,
        timestamp,
      };

      // Broadcast to specific question room if provided
      if (questionId) {
        this.io
          .to(`question:${questionId}`)
          .emit("answer_reaction_updated", payload);
      } else {
        // Broadcast to all clients
        this.io.emit("answer_reaction_updated", payload);
      }
    } catch (error) {
      console.error("Failed to broadcast answer reaction:", error);
      throw error;
    }
  }

  /**
   * Broadcast badge award notification to user
   *
   * @TAG:CODE:ANSWER-INTERACTION-001-E3
   * @param userId - The ID of the user who earned the badge
   * @param badgeName - The name of the badge
   * @param badgeId - The ID of the badge
   */
  async broadcastBadgeAwarded(
    userId: string,
    badgeName: string,
    badgeId: string
  ): Promise<void> {
    try {
      // Validate parameters
      if (!userId || !badgeName || !badgeId) {
        throw new Error("Invalid badge award parameters");
      }

      const timestamp = Date.now();

      // Send badge event to user
      this.io.to(`user:${userId}`).emit("badge_awarded", {
        userId,
        badgeName,
        badgeId,
        timestamp,
      });

      // Send notification to user
      this.io.to(`user:${userId}`).emit("notification", {
        type: "system" as const,
        title: "New Badge Earned!",
        message: `You earned the "${badgeName}" badge`,
        targetUserId: userId,
        data: {
          badgeId,
          badgeName,
        },
      });
    } catch (error) {
      console.error("Failed to broadcast badge award:", error);
      throw error;
    }
  }
}
