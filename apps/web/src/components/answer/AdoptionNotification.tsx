/**
 * @CODE:ANSWER-INTERACTION-001-PHASE7-A1
 * @CODE:ANSWER-INTERACTION-001-PHASE7-A2
 * @CODE:ANSWER-INTERACTION-001-PHASE7-A3
 *
 * AdoptionNotification Component
 *
 * SPEC: SPEC-ANSWER-INTERACTION-001-PHASE7
 * Phase 7: Real-time Adoption Notifications
 *
 * Minimal implementation to pass E2E tests (GREEN phase)
 *
 * Requirements:
 * - Display notification within 500ms
 * - Show adoption status + points
 * - Auto-dismiss after 3 seconds
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CheckCircle } from "lucide-react";

export interface AdoptionNotificationProps {
  message: string;
  points: number;
  onDismiss: () => void;
  autoDismissMs?: number;
}

/**
 * AdoptionNotification Component
 * Displays real-time adoption notifications as toast messages
 */
export function AdoptionNotification({
  message,
  points,
  onDismiss,
  autoDismissMs = 3000, // @TEST:ANSWER-INTERACTION-001-PHASE7-A3 - Auto-dismiss after 3 seconds
}: AdoptionNotificationProps) {
  // @TEST:ANSWER-INTERACTION-001-PHASE7-A3 - Auto-dismiss timer
  useEffect(() => {
    if (autoDismissMs > 0) {
      const timer = setTimeout(onDismiss, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [autoDismissMs, onDismiss]);

  return (
    <div
      className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg bg-green-500 text-white px-4 py-3 shadow-lg transition-all duration-300 animate-in slide-in-from-top"
      role="alert"
      aria-live="assertive"
      data-testid="adoption-notification" // @TEST:ANSWER-INTERACTION-001-PHASE7-A1
    >
      <div
        className="flex items-center gap-2 bg-green-600 rounded-full px-3 py-1"
        data-testid="adoption-notification-badge" // @TEST:ANSWER-INTERACTION-001-PHASE7-A2
      >
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-bold">채택됨</span>
        <span className="text-sm">+{points} 포인트</span>
      </div>
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 rounded hover:bg-white/20 p-1 transition-colors"
        aria-label="Dismiss notification"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

/**
 * AdoptionNotificationContainer Component
 * Manages multiple adoption notifications
 */
export interface NotificationData {
  id: string;
  message: string;
  points: number;
  timestamp: number;
}

export function AdoptionNotificationContainer() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  // Expose notifications to window for E2E testing
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__notifications = notifications;
    }
  }, [notifications]);

  // @TEST:ANSWER-INTERACTION-001-PHASE7-P3 - Memory limit: 50 notifications max
  const addNotification = useCallback((notification: NotificationData) => {
    setNotifications(prev => {
      const updated = [...prev, notification];
      // Enforce memory limit of 50 notifications
      if (updated.length > 50) {
        return updated.slice(-50);
      }
      return updated;
    });
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []); // Expose add/remove methods to window for E2E testing
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__addAdoptionNotification = addNotification;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__removeAdoptionNotification = removeNotification;
    }
  }, [addNotification, removeNotification]);

  return (
    <>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{ top: `${4 + index * 5}rem` }}
          className="fixed right-4 z-50"
        >
          <AdoptionNotification
            message={notification.message}
            points={notification.points}
            onDismiss={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </>
  );
}
