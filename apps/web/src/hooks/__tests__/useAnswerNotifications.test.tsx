/**
 * @TEST:ANSWER-INTERACTION-001-E1
 * @TEST:ANSWER-INTERACTION-001-E2
 * @TEST:ANSWER-INTERACTION-001-E3
 *
 * useAnswerNotifications Hook Tests
 *
 * SPEC: SPEC-ANSWER-INTERACTION-001 - Phase 6: Real-time Socket.io Notifications
 *
 * Test Coverage:
 * - Listen to answer_adopted event
 * - Listen to answer_reaction_updated event
 * - Listen to badge_awarded event
 * - Display notifications in UI
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAnswerNotifications } from "../useAnswerNotifications";
import type { ISocketClient } from "../../types/socket";

describe("useAnswerNotifications", () => {
  let mockSocketClient: ISocketClient;
  let eventListeners: Map<string, (...args: unknown[]) => void>;

  beforeEach(() => {
    eventListeners = new Map();

    // Mock Socket Client
    mockSocketClient = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      isConnected: vi.fn().mockReturnValue(true),
      getConnectionStatus: vi.fn().mockReturnValue("connected"),
      on: vi.fn((event, handler) => {
        eventListeners.set(event, handler);
      }),
      off: vi.fn(event => {
        eventListeners.delete(event);
      }),
      emit: vi.fn(),
      joinRoom: vi.fn(),
      leaveRoom: vi.fn(),
    } as unknown as ISocketClient;
  });

  afterEach(() => {
    eventListeners.clear();
  });

  describe("@TEST:ANSWER-INTERACTION-001-E1 - Answer Adopted Event", () => {
    it("should listen to answer_adopted event on mount", () => {
      // Act
      renderHook(() => useAnswerNotifications(mockSocketClient));

      // Assert
      expect(mockSocketClient.on).toHaveBeenCalledWith(
        "answer_adopted",
        expect.any(Function)
      );
    });

    it("should add notification when answer_adopted event is received", async () => {
      // Arrange
      const { result } = renderHook(() =>
        useAnswerNotifications(mockSocketClient)
      );

      const adoptedData = {
        answerId: "answer-001",
        adopterId: "user-001",
        adopteeId: "user-002",
        questionId: "question-001",
        timestamp: Date.now(),
      };

      // Act
      const handler = eventListeners.get("answer_adopted");
      act(() => {
        handler?.(adoptedData);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(1);
        expect(result.current.notifications[0]).toMatchObject({
          type: "accepted",
          answerId: "answer-001",
          questionId: "question-001",
        });
      });
    });

    it("should display toast notification for answer adoption", async () => {
      // Arrange
      const { result } = renderHook(() =>
        useAnswerNotifications(mockSocketClient)
      );

      const adoptedData = {
        answerId: "answer-001",
        adopterId: "user-001",
        adopteeId: "user-002",
        questionId: "question-001",
        timestamp: Date.now(),
      };

      // Act
      const handler = eventListeners.get("answer_adopted");
      act(() => {
        handler?.(adoptedData);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.latestToast).toMatchObject({
          type: "success",
          message: expect.stringContaining("adopted"),
        });
      });
    });
  });

  describe("@TEST:ANSWER-INTERACTION-001-E2 - Answer Reaction Updated Event", () => {
    it("should listen to answer_reaction_updated event", () => {
      // Act
      renderHook(() => useAnswerNotifications(mockSocketClient));

      // Assert
      expect(mockSocketClient.on).toHaveBeenCalledWith(
        "answer_reaction_updated",
        expect.any(Function)
      );
    });

    it("should update reaction counts when event is received", async () => {
      // Arrange
      const { result } = renderHook(() =>
        useAnswerNotifications(mockSocketClient)
      );

      const reactionData = {
        answerId: "answer-001",
        likeCount: 10,
        dislikeCount: 2,
        timestamp: Date.now(),
      };

      // Act
      const handler = eventListeners.get("answer_reaction_updated");
      act(() => {
        handler?.(reactionData);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.reactionUpdates).toHaveProperty("answer-001");
        expect(result.current.reactionUpdates["answer-001"]).toEqual({
          likeCount: 10,
          dislikeCount: 2,
        });
      });
    });

    it("should NOT show toast for reaction updates", async () => {
      // Arrange
      const { result } = renderHook(() =>
        useAnswerNotifications(mockSocketClient)
      );

      const reactionData = {
        answerId: "answer-001",
        likeCount: 5,
        dislikeCount: 1,
        timestamp: Date.now(),
      };

      // Act
      const handler = eventListeners.get("answer_reaction_updated");
      act(() => {
        handler?.(reactionData);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.latestToast).toBeNull();
      });
    });
  });

  describe("@TEST:ANSWER-INTERACTION-001-E3 - Badge Awarded Event", () => {
    it("should listen to badge_awarded event", () => {
      // Act
      renderHook(() => useAnswerNotifications(mockSocketClient));

      // Assert
      expect(mockSocketClient.on).toHaveBeenCalledWith(
        "badge_awarded",
        expect.any(Function)
      );
    });

    it("should add badge notification when event is received", async () => {
      // Arrange
      const { result } = renderHook(() =>
        useAnswerNotifications(mockSocketClient)
      );

      const badgeData = {
        userId: "user-001",
        badgeName: "First Adoption",
        badgeId: "badge-001",
        timestamp: Date.now(),
      };

      // Act
      const handler = eventListeners.get("badge_awarded");
      act(() => {
        handler?.(badgeData);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(1);
        expect(result.current.notifications[0]).toMatchObject({
          type: "badge",
          badgeName: "First Adoption",
          badgeId: "badge-001",
        });
      });
    });

    it("should display toast notification for badge award", async () => {
      // Arrange
      const { result } = renderHook(() =>
        useAnswerNotifications(mockSocketClient)
      );

      const badgeData = {
        userId: "user-001",
        badgeName: "Answer Master",
        badgeId: "badge-002",
        timestamp: Date.now(),
      };

      // Act
      const handler = eventListeners.get("badge_awarded");
      act(() => {
        handler?.(badgeData);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.latestToast).toMatchObject({
          type: "success",
          message: expect.stringContaining("Answer Master"),
        });
      });
    });
  });

  describe("Cleanup", () => {
    it("should remove all event listeners on unmount", () => {
      // Act
      const { unmount } = renderHook(() =>
        useAnswerNotifications(mockSocketClient)
      );

      unmount();

      // Assert
      expect(mockSocketClient.off).toHaveBeenCalledWith("answer_adopted");
      expect(mockSocketClient.off).toHaveBeenCalledWith(
        "answer_reaction_updated"
      );
      expect(mockSocketClient.off).toHaveBeenCalledWith("badge_awarded");
    });

    it("should clear notifications when requested", async () => {
      // Arrange
      const { result } = renderHook(() =>
        useAnswerNotifications(mockSocketClient)
      );

      const adoptedData = {
        answerId: "answer-001",
        adopterId: "user-001",
        adopteeId: "user-002",
        questionId: "question-001",
        timestamp: Date.now(),
      };

      const handler = eventListeners.get("answer_adopted");
      act(() => {
        handler?.(adoptedData);
      });

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(1);
      });

      // Act
      act(() => {
        result.current.clearNotifications();
      });

      // Assert
      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(0);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle disconnected socket gracefully", () => {
      // Arrange
      mockSocketClient.isConnected = vi.fn().mockReturnValue(false);

      // Act & Assert
      expect(() =>
        renderHook(() => useAnswerNotifications(mockSocketClient))
      ).not.toThrow();
    });

    it("should handle null socket client", () => {
      // Act & Assert
      expect(() =>
        renderHook(() => useAnswerNotifications(null))
      ).not.toThrow();
    });

    it("should limit notification history to 50 items", async () => {
      // Arrange
      const { result } = renderHook(() =>
        useAnswerNotifications(mockSocketClient)
      );

      const handler = eventListeners.get("answer_adopted");

      // Act - Add 60 notifications
      act(() => {
        for (let i = 0; i < 60; i++) {
          handler?.({
            answerId: `answer-${i}`,
            adopterId: "user-001",
            adopteeId: "user-002",
            questionId: "question-001",
            timestamp: Date.now(),
          });
        }
      });

      // Assert
      await waitFor(() => {
        expect(result.current.notifications.length).toBeLessThanOrEqual(50);
      });
    });
  });
});
