/**
 * @CODE:ANSWER-INTERACTION-001-E1
 * @CODE:ANSWER-INTERACTION-001-E3
 *
 * AnswerNotificationToast Component
 *
 * SPEC: SPEC-ANSWER-INTERACTION-001 - Phase 6: Real-time Socket.io Notifications
 *
 * Responsibilities:
 * - Display toast notifications for answer adoptions
 * - Display toast notifications for badge awards
 * - Auto-dismiss after 5 seconds
 * - Support manual dismiss
 *
 * SOLID Principles:
 * - Single Responsibility: Displays only toast notifications
 * - Open/Closed: Easy to extend with new toast types
 */

import React, { useEffect } from "react";

export interface AnswerNotificationToastProps {
  type: "success" | "info" | "warning" | "error";
  message: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

/**
 * AnswerNotificationToast Component
 *
 * Displays real-time notifications as toast messages
 */
export function AnswerNotificationToast({
  type,
  message,
  onDismiss,
  autoDismissMs = 5000,
}: AnswerNotificationToastProps) {
  // Auto-dismiss after specified time
  useEffect(() => {
    if (autoDismissMs > 0) {
      const timer = setTimeout(onDismiss, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [autoDismissMs, onDismiss]);

  const typeStyles = {
    success: "bg-green-500 text-white",
    info: "bg-blue-500 text-white",
    warning: "bg-yellow-500 text-gray-900",
    error: "bg-red-500 text-white",
  };

  const typeIcons = {
    success: "✓",
    info: "ℹ",
    warning: "⚠",
    error: "✗",
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg transition-all duration-300 ${typeStyles[type]}`}
      role="alert"
      aria-live="assertive"
      data-testid="answer-notification-toast"
    >
      <span className="text-xl font-bold" aria-hidden="true">
        {typeIcons[type]}
      </span>
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
 * Example usage:
 *
 * ```tsx
 * const { latestToast, clearToast } = useAnswerNotifications(socket);
 *
 * {latestToast && (
 *   <AnswerNotificationToast
 *     type={latestToast.type}
 *     message={latestToast.message}
 *     onDismiss={clearToast}
 *   />
 * )}
 * ```
 */
