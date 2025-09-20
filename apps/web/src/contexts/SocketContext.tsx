/**
 * Socket.io React Context Provider
 *
 * SOLID 원칙 적용:
 * - Single Responsibility: Socket 상태와 알림 관리만 담당
 * - Open/Closed: 새로운 Socket 기능 추가 시 기존 코드 수정 없이 확장
 * - Dependency Inversion: 추상화된 Hook과 인터페이스에 의존
 */

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  SocketContextType,
  RealtimeNotification,
  TypingState,
  RealtimeStats,
} from "../types/socket";
import { useSocket, useSocketEvent } from "../hooks/useSocket";

/**
 * Socket Context 생성
 */
const SocketContext = createContext<SocketContextType | null>(null);

/**
 * Socket Context Provider Props
 */
interface SocketProviderProps {
  children: ReactNode;
  socketUrl?: string;
  autoConnect?: boolean;
  userId?: string;
  token?: string;
}

/**
 * Socket Context Provider 컴포넌트
 */
export function SocketProvider({
  children,
  socketUrl,
  autoConnect = true,
  userId,
  token,
}: SocketProviderProps) {
  // Socket Hook 사용
  const { socket, state, connect, disconnect } = useSocket({
    url: socketUrl,
    autoConnect,
    auth: { userId, token },
  });

  // 상태 관리
  const [notifications, setNotifications] = useState<RealtimeNotification[]>(
    []
  );
  const [typingStates, setTypingStates] = useState<TypingState[]>([]);
  const [stats, setStats] = useState<RealtimeStats | null>(null);

  /**
   * 알림을 읽음으로 표시
   */
  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  /**
   * 모든 알림 제거
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * 새 알림 추가
   */
  const addNotification = useCallback((data: unknown) => {
    const dataObj = data as Record<string, unknown>;
    const notification: RealtimeNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: (dataObj.type as RealtimeNotification["type"]) || "system",
      title: dataObj.title as string,
      message: dataObj.message as string,
      timestamp: Date.now(),
      read: false,
      data: dataObj.data as Record<string, unknown>,
    };

    setNotifications(prev => [notification, ...prev].slice(0, 50)); // 최대 50개 보관

    // 브라우저 알림 (권한이 있는 경우)
    if (Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: notification.id,
      });
    }
  }, []);

  /**
   * 타이핑 상태 업데이트
   */
  const updateTypingState = useCallback((data: unknown) => {
    const dataObj = data as Record<string, unknown>;
    const { questionId, userId: typingUserId, userName, isTyping } = dataObj;

    setTypingStates(prev => {
      const existingStateIndex = prev.findIndex(
        state => state.questionId === questionId
      );

      if (existingStateIndex === -1) {
        // 새로운 질문의 타이핑 상태
        if (isTyping) {
          return [
            ...prev,
            {
              questionId,
              users: [
                {
                  userId: typingUserId,
                  userName,
                  startTime: Date.now(),
                },
              ],
            },
          ];
        }
        return prev;
      }

      // 기존 질문의 타이핑 상태 업데이트
      const existingState = prev[existingStateIndex];
      const userIndex = existingState.users.findIndex(
        user => user.userId === typingUserId
      );

      if (isTyping) {
        if (userIndex === -1) {
          // 새 사용자 추가
          const updatedState = {
            ...existingState,
            users: [
              ...existingState.users,
              {
                userId: typingUserId,
                userName,
                startTime: Date.now(),
              },
            ],
          };
          return prev.map((state, index) =>
            index === existingStateIndex ? updatedState : state
          );
        }
      } else {
        if (userIndex > -1) {
          // 사용자 제거
          const updatedUsers = existingState.users.filter(
            user => user.userId !== typingUserId
          );
          if (updatedUsers.length === 0) {
            // 타이핑하는 사용자가 없으면 상태 제거
            return prev.filter((_, index) => index !== existingStateIndex);
          } else {
            const updatedState = { ...existingState, users: updatedUsers };
            return prev.map((state, index) =>
              index === existingStateIndex ? updatedState : state
            );
          }
        }
      }

      return prev;
    });
  }, []);

  /**
   * 실시간 통계 업데이트
   */
  const updateStats = useCallback((data: unknown) => {
    const dataObj = data as Record<string, unknown>;
    setStats({
      activeUsers: dataObj.activeUsers as number,
      questionsToday: dataObj.questionsToday as number,
      answersToday: dataObj.answersToday as number,
      responseRate: dataObj.responseRate as number,
      lastUpdated: Date.now(),
    });
  }, []);

  // Socket 이벤트 리스너 등록
  useSocketEvent(socket, "notification", addNotification);
  useSocketEvent(socket, "user_typing", updateTypingState);
  useSocketEvent(socket, "stats_update", updateStats);

  /**
   * 타이핑 상태 자동 정리 (5초 후)
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingStates(prev =>
        prev
          .map(state => ({
            ...state,
            users: state.users.filter(user => now - user.startTime < 5000), // 5초 이후 제거
          }))
          .filter(state => state.users.length > 0)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * 브라우저 알림 권한 요청
   */
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().then(permission => {
        console.log(`📢 알림 권한: ${permission}`);
      });
    }
  }, []);

  /**
   * Context 값 생성
   */
  const contextValue: SocketContextType = {
    socket,
    state,
    notifications,
    typingStates,
    stats,
    connect,
    disconnect,
    markNotificationAsRead,
    clearNotifications,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

/**
 * Socket Context Hook
 */
export function useSocketContext(): SocketContextType {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error(
      "useSocketContext는 SocketProvider 내부에서만 사용할 수 있습니다."
    );
  }
  return context;
}

/**
 * Socket 연결 상태만 필요한 경우 사용하는 Hook
 */
export function useSocketConnection() {
  const { socket, state } = useSocketContext();
  return {
    isConnected: state.isConnected,
    status: state.status,
    reconnectAttempts: state.reconnectAttempts,
    error: state.error,
    socket,
  };
}

/**
 * 실시간 알림만 필요한 경우 사용하는 Hook
 */
export function useSocketNotifications() {
  const { notifications, markNotificationAsRead, clearNotifications } =
    useSocketContext();

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markNotificationAsRead,
    clearNotifications,
  };
}

/**
 * 타이핑 상태만 필요한 경우 사용하는 Hook
 */
export function useSocketTyping(questionId?: string) {
  const { typingStates } = useSocketContext();

  if (questionId) {
    const questionTyping = typingStates.find(
      state => state.questionId === questionId
    );
    return questionTyping?.users || [];
  }

  return typingStates;
}

/**
 * 실시간 통계만 필요한 경우 사용하는 Hook
 */
export function useSocketStats() {
  const { stats } = useSocketContext();
  return stats;
}
