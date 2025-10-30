/**
 * @CODE:ANSWER-INTERACTION-001-E1
 * @CODE:ANSWER-INTERACTION-001-E2
 * @CODE:ANSWER-INTERACTION-001-E3
 *
 * useAnswerNotifications Hook
 *
 * SPEC: SPEC-ANSWER-INTERACTION-001 - Phase 6: Real-time Socket.io Notifications
 *
 * Responsibilities:
 * - Listen to answer_adopted events
 * - Listen to answer_reaction_updated events
 * - Listen to badge_awarded events
 * - Manage notification state
 * - Display toast notifications
 *
 * SOLID Principles:
 * - Single Responsibility: Handles only answer notification listening
 * - Open/Closed: Easy to extend with new event handlers
 * - Dependency Inversion: Depends on ISocketClient interface
 */

import { useState, useEffect, useCallback } from "react";
import type { ISocketClient } from "../types/socket";

/**
 * Answer notification data types
 */
export interface AnswerNotification {
  id: string;
  type: "accepted" | "reaction" | "badge";
  answerId?: string;
  questionId?: string;
  badgeName?: string;
  badgeId?: string;
  timestamp: number;
}

export interface ToastNotification {
  type: "success" | "info" | "warning" | "error";
  message: string;
}

export interface ReactionUpdate {
  [answerId: string]: {
    likeCount: number;
    dislikeCount: number;
  };
}

/**
 * useAnswerNotifications Hook
 *
 * @param socket - Socket.io client instance
 * @returns Notification state and methods
 */
export function useAnswerNotifications(socket: ISocketClient | null) {
  const [notifications, setNotifications] = useState<AnswerNotification[]>([]);
  const [latestToast, setLatestToast] = useState<ToastNotification | null>(
    null
  );
  const [reactionUpdates, setReactionUpdates] = useState<ReactionUpdate>({});

  /**
   * Handle answer_adopted event
   *
   * @TAG:CODE:ANSWER-INTERACTION-001-E1
   */
  const handleAnswerAdopted = useCallback(
    (data: {
      answerId: string;
      adopterId: string;
      adopteeId: string;
      questionId: string;
      timestamp: number;
    }) => {
      const notification: AnswerNotification = {
        id: `adopted-${data.answerId}-${data.timestamp}`,
        type: "accepted",
        answerId: data.answerId,
        questionId: data.questionId,
        timestamp: data.timestamp,
      };

      setNotifications(prev => {
        const updated = [notification, ...prev];
        // Limit to 50 notifications
        return updated.slice(0, 50);
      });

      setLatestToast({
        type: "success",
        message: "Your answer was adopted! You earned 50 points.",
      });
    },
    []
  );

  /**
   * Handle answer_reaction_updated event
   *
   * @TAG:CODE:ANSWER-INTERACTION-001-E2
   */
  const handleReactionUpdated = useCallback(
    (data: {
      answerId: string;
      likeCount: number;
      dislikeCount: number;
      timestamp: number;
    }) => {
      setReactionUpdates(prev => ({
        ...prev,
        [data.answerId]: {
          likeCount: data.likeCount,
          dislikeCount: data.dislikeCount,
        },
      }));

      // Do NOT show toast for reaction updates (real-time counter update only)
    },
    []
  );

  /**
   * Handle badge_awarded event
   *
   * @TAG:CODE:ANSWER-INTERACTION-001-E3
   */
  const handleBadgeAwarded = useCallback(
    (data: {
      userId: string;
      badgeName: string;
      badgeId: string;
      timestamp: number;
    }) => {
      const notification: AnswerNotification = {
        id: `badge-${data.badgeId}-${data.timestamp}`,
        type: "badge",
        badgeName: data.badgeName,
        badgeId: data.badgeId,
        timestamp: data.timestamp,
      };

      setNotifications(prev => {
        const updated = [notification, ...prev];
        return updated.slice(0, 50);
      });

      setLatestToast({
        type: "success",
        message: `You earned the "${data.badgeName}" badge!`,
      });
    },
    []
  );

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setLatestToast(null);
  }, []);

  /**
   * Clear latest toast
   */
  const clearToast = useCallback(() => {
    setLatestToast(null);
  }, []);

  /**
   * Register Socket.io event listeners
   */
  useEffect(() => {
    if (!socket) return;

    // Register event handlers
    socket.on("answer_adopted", handleAnswerAdopted);
    socket.on("answer_reaction_updated", handleReactionUpdated);
    socket.on("badge_awarded", handleBadgeAwarded);

    // Cleanup on unmount
    return () => {
      socket.off("answer_adopted");
      socket.off("answer_reaction_updated");
      socket.off("badge_awarded");
    };
  }, [socket, handleAnswerAdopted, handleReactionUpdated, handleBadgeAwarded]);

  return {
    notifications,
    latestToast,
    reactionUpdates,
    clearNotifications,
    clearToast,
  };
}
