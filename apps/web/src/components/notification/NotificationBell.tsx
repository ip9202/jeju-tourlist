"use client";

import React, { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
  type: "answer" | "like" | "accept" | "system";
}

// 서버/클라이언트에서 동일한 초기 알림 데이터 (Hydration 에러 방지)
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    message: "새로운 답변이 등록되었습니다.",
    read: false,
    timestamp: "2025-10-06T10:00:00.000Z", // 고정된 timestamp
    type: "answer",
  },
];

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(
    INITIAL_NOTIFICATIONS
  );
  const [isMounted, setIsMounted] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    setIsMounted(true);
    // 실제 알림 데이터는 API에서 가져오기 (향후 구현)
  }, []);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        isOpen &&
        !target.closest('[data-testid="notification-bell"]') &&
        !target.closest('[data-testid="notification-dropdown"]')
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const formatTime = (timestamp: string) => {
    // 클라이언트에서만 시간 계산 (Hydration 에러 방지)
    if (!isMounted) {
      return "방금 전"; // 서버 렌더링 시 고정된 값
    }

    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 24 * 60)
      return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return date.toLocaleDateString("ko-KR");
  };

  return (
    <div className="relative">
      {/* 알림 벨 버튼 */}
      <button
        onClick={handleBellClick}
        className="relative px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors"
        data-testid="notification-bell"
        data-unread={unreadCount > 0 ? "true" : "false"}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold border-2 border-white"
            data-testid="notification-badge"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* 알림 드롭다운 */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
          data-testid="notification-dropdown"
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">알림</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-gray-500 hover:text-gray-700"
                  data-testid="mark-all-read-button"
                >
                  모두 읽음
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-gray-500 hover:text-gray-700"
                  data-testid="clear-all-notifications-button"
                >
                  전체 삭제
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                  data-testid="close-notifications-button"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="mt-2">
              <a
                href="/notifications/settings"
                className="text-sm text-indigo-600 hover:text-indigo-800"
                data-testid="notification-settings-link"
              >
                알림 설정
              </a>
            </div>
          </div>

          <div
            className="max-h-96 overflow-y-auto"
            data-testid="notification-list"
          >
            {notifications.length === 0 ? (
              <div
                className="p-4 text-center text-gray-500"
                data-testid="no-notifications-message"
              >
                알림이 없습니다
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                  data-testid="notification-item"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
