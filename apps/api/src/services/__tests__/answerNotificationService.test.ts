/**
 * @TEST:ANSWER-INTERACTION-001-E1
 * @TEST:ANSWER-INTERACTION-001-E2
 * @TEST:ANSWER-INTERACTION-001-E3
 *
 * Answer Notification Service Tests
 *
 * SPEC: SPEC-ANSWER-INTERACTION-001 - Phase 6: Real-time Socket.io Notifications
 *
 * Test Coverage:
 * - Answer adoption broadcast (@REQ:ANSWER-INTERACTION-001-E1)
 * - Like/Dislike count broadcast (@REQ:ANSWER-INTERACTION-001-E2)
 * - Badge award notification (@REQ:ANSWER-INTERACTION-001-E3)
 */

import { AnswerNotificationService } from "../AnswerNotificationService";
import { TypedServer } from "../../types/socket";

describe("AnswerNotificationService", () => {
  let mockIo: TypedServer;
  let service: AnswerNotificationService;

  beforeEach(() => {
    // Mock Socket.io server
    mockIo = {
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    } as unknown as TypedServer;

    service = new AnswerNotificationService(mockIo);
  });

  describe("@TEST:ANSWER-INTERACTION-001-E1 - Answer Adoption Broadcast", () => {
    it("should broadcast answer_adopted event to all connected clients", async () => {
      // Arrange
      const answerId = "answer-001";
      const adopterId = "user-001";
      const adopteeId = "user-002";
      const questionId = "question-001";

      // Act
      await service.broadcastAnswerAdopted(
        answerId,
        adopterId,
        adopteeId,
        questionId
      );

      // Assert
      expect(mockIo.emit).toHaveBeenCalledWith("answer_adopted", {
        answerId,
        adopterId,
        adopteeId,
        questionId,
        timestamp: expect.any(Number),
      });
    });

    it("should send targeted notification to answer author", async () => {
      // Arrange
      const answerId = "answer-001";
      const adopterId = "user-001";
      const adopteeId = "user-002";
      const questionId = "question-001";

      // Act
      await service.broadcastAnswerAdopted(
        answerId,
        adopterId,
        adopteeId,
        questionId
      );

      // Assert
      expect(mockIo.to).toHaveBeenCalledWith(`user:${adopteeId}`);
      expect(mockIo.emit).toHaveBeenCalledWith("notification", {
        type: "accepted",
        title: "Your answer was adopted!",
        message: "Your answer received 50 points",
        targetUserId: adopteeId,
        data: {
          answerId,
          questionId,
          points: 50,
        },
      });
    });

    it("should handle missing parameters gracefully", async () => {
      // Act & Assert
      await expect(
        service.broadcastAnswerAdopted("", "", "", "")
      ).rejects.toThrow("Invalid parameters for answer adoption broadcast");
    });
  });

  describe("@TEST:ANSWER-INTERACTION-001-E2 - Like/Dislike Broadcast", () => {
    it("should broadcast answer_reaction_updated event with like count", async () => {
      // Arrange
      const answerId = "answer-001";
      const likeCount = 10;
      const dislikeCount = 2;

      // Act
      await service.broadcastAnswerReaction(answerId, likeCount, dislikeCount);

      // Assert
      expect(mockIo.emit).toHaveBeenCalledWith("answer_reaction_updated", {
        answerId,
        likeCount,
        dislikeCount,
        timestamp: expect.any(Number),
      });
    });

    it("should broadcast to specific question room if provided", async () => {
      // Arrange
      const answerId = "answer-001";
      const questionId = "question-001";
      const likeCount = 5;
      const dislikeCount = 1;

      // Act
      await service.broadcastAnswerReaction(
        answerId,
        likeCount,
        dislikeCount,
        questionId
      );

      // Assert
      expect(mockIo.to).toHaveBeenCalledWith(`question:${questionId}`);
    });

    it("should handle negative counts gracefully", async () => {
      // Arrange
      const answerId = "answer-001";

      // Act & Assert
      await expect(
        service.broadcastAnswerReaction(answerId, -1, -1)
      ).rejects.toThrow("Invalid reaction counts");
    });
  });

  describe("@TEST:ANSWER-INTERACTION-001-E3 - Badge Award Notification", () => {
    it("should broadcast badge_awarded event to user", async () => {
      // Arrange
      const userId = "user-001";
      const badgeName = "First Answer Adopted";
      const badgeId = "badge-001";

      // Act
      await service.broadcastBadgeAwarded(userId, badgeName, badgeId);

      // Assert
      expect(mockIo.to).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockIo.emit).toHaveBeenCalledWith("badge_awarded", {
        userId,
        badgeName,
        badgeId,
        timestamp: expect.any(Number),
      });
    });

    it("should send notification about badge award", async () => {
      // Arrange
      const userId = "user-001";
      const badgeName = "Answer Master";
      const badgeId = "badge-002";

      // Act
      await service.broadcastBadgeAwarded(userId, badgeName, badgeId);

      // Assert
      expect(mockIo.emit).toHaveBeenCalledWith("notification", {
        type: "system",
        title: "New Badge Earned!",
        message: `You earned the "${badgeName}" badge`,
        targetUserId: userId,
        data: {
          badgeId,
          badgeName,
        },
      });
    });

    it("should handle missing badge information", async () => {
      // Act & Assert
      await expect(service.broadcastBadgeAwarded("", "", "")).rejects.toThrow(
        "Invalid badge award parameters"
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle Socket.io emit failures gracefully", async () => {
      // Arrange
      mockIo.emit = jest.fn().mockRejectedValue(new Error("Socket error"));

      // Act & Assert
      await expect(
        service.broadcastAnswerAdopted(
          "answer-001",
          "user-001",
          "user-002",
          "question-001"
        )
      ).rejects.toThrow("Failed to broadcast answer adoption");
    });

    it("should log errors when notification fails", async () => {
      // Arrange
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockIo.emit = jest.fn().mockRejectedValue(new Error("Connection lost"));

      // Act
      try {
        await service.broadcastAnswerReaction("answer-001", 5, 1);
      } catch (error) {
        // Expected to throw
      }

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to broadcast"),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Integration Scenarios", () => {
    it("should broadcast multiple events in sequence", async () => {
      // Arrange
      const answerId = "answer-001";
      const adopterId = "user-001";
      const adopteeId = "user-002";
      const questionId = "question-001";

      // Act
      await service.broadcastAnswerAdopted(
        answerId,
        adopterId,
        adopteeId,
        questionId
      );
      await service.broadcastAnswerReaction(answerId, 1, 0);
      await service.broadcastBadgeAwarded(
        adopteeId,
        "First Adoption",
        "badge-001"
      );

      // Assert
      expect(mockIo.emit).toHaveBeenCalledTimes(5); // 3 broadcasts + 2 notifications
    });
  });
});
