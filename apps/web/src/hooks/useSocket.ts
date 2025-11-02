/**
 * Socket.io React Hook
 *
 * SOLID 원칙 적용:
 * - Single Responsibility: Socket 상태 관리만 담당
 * - Open/Closed: 새로운 Socket 기능 추가 시 Hook 수정 없이 확장 가능
 * - Dependency Inversion: SocketClient 인터페이스에 의존
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  ISocketClient,
  ISocketState,
  UseSocketReturn,
  SocketConnectionStatus,
  ClientToServerEvents,
} from "../types/socket";
import { SocketClient, createSocketClient } from "../lib/socket/socketClient";

/**
 * Socket.io 연결을 관리하는 React Hook
 */
export function useSocket(options?: {
  url?: string;
  autoConnect?: boolean;
  auth?: { token?: string; userId?: string };
}): UseSocketReturn {
  const [socket, setSocket] = useState<ISocketClient | null>(null);
  const [state, setState] = useState<ISocketState>({
    status: "disconnected",
    isConnected: false,
    reconnectAttempts: 0,
  });

  const socketRef = useRef<SocketClient | null>(null);
  const isInitialized = useRef(false);

  /**
   * Socket 상태 업데이트 핸들러
   */
  const handleStatusChange = useCallback((event: CustomEvent) => {
    const { status, isConnected, reconnectAttempts } = event.detail;
    setState(prev => ({
      ...prev,
      status,
      isConnected,
      reconnectAttempts,
      lastConnected: isConnected ? new Date() : prev.lastConnected,
      error: status === "error" ? "연결에 실패했습니다" : undefined,
    }));
  }, []);

  /**
   * Socket 연결
   */
  const connect = useCallback(async () => {
    if (socketRef.current?.isConnected()) {
      return;
    }

    try {
      await socketRef.current?.connect();
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: "error",
        isConnected: false,
        error: "연결에 실패했습니다",
      }));
    }
  }, []);

  /**
   * Socket 연결 해제
   */
  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    setState(prev => ({
      ...prev,
      status: "disconnected",
      isConnected: false,
      error: undefined,
    }));
  }, []);

  /**
   * 서버로 이벤트 전송
   */
  const emit = useCallback(
    <K extends keyof ClientToServerEvents>(
      event: K,
      data: Parameters<ClientToServerEvents[K]>[0]
    ) => {
      socketRef.current?.emit(event, data);
    },
    []
  );

  /**
   * 룸에 참여
   */
  const joinRoom = useCallback((roomId: string, userId: string) => {
    socketRef.current?.joinRoom(roomId, userId);
  }, []);

  /**
   * 룸에서 나가기
   */
  const leaveRoom = useCallback((roomId: string, userId: string) => {
    socketRef.current?.leaveRoom(roomId, userId);
  }, []);

  /**
   * Socket 초기화 및 이벤트 리스너 설정
   */
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Socket 클라이언트 생성
    const socketClient = createSocketClient({
      url: options?.url,
      autoConnect: options?.autoConnect || false,
      auth: options?.auth,
    });

    socketRef.current = socketClient;
    setSocket(socketClient);

    // 상태 변경 이벤트 리스너 등록
    if (typeof window !== "undefined") {
      window.addEventListener(
        "socket-status-change",
        handleStatusChange as EventListener
      );
    }

    // 자동 연결이 활성화된 경우 연결 시도
    if (options?.autoConnect) {
      connect();
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "socket-status-change",
          handleStatusChange as EventListener
        );
      }
      socketClient.destroy();
      setSocket(null);
      isInitialized.current = false;
    };
  }, [
    options?.url,
    options?.autoConnect,
    options?.auth?.token,
    options?.auth?.userId,
  ]);

  return {
    socket,
    state,
    connect,
    disconnect,
    emit,
    joinRoom,
    leaveRoom,
  };
}

/**
 * Socket 이벤트 리스너를 관리하는 Hook
 */
export function useSocketEvent<
  K extends keyof import("../types/socket").ServerToClientEvents,
>(
  socket: ISocketClient | null,
  event: K,
  handler: import("../types/socket").ServerToClientEvents[K],
  dependencies: React.DependencyList = []
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!socket) return;

    const eventHandler = (...args: unknown[]) => {
      if (typeof handlerRef.current === "function") {
        (handlerRef.current as (...args: unknown[]) => void)(...args);
      }
    };

    socket.on(event, eventHandler);

    return () => {
      socket.off(event, eventHandler);
    };
  }, [socket, event, JSON.stringify(dependencies)]);
}

/**
 * Socket 연결 상태를 추적하는 Hook
 */
export function useSocketConnection(socket: ISocketClient | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<SocketConnectionStatus>("disconnected");

  useEffect(() => {
    if (!socket) {
      setIsConnected(false);
      setStatus("disconnected");
      return;
    }

    const handleStatusChange = (event: CustomEvent) => {
      const { status: newStatus, isConnected: connected } = event.detail;
      setStatus(newStatus);
      setIsConnected(connected);
    };

    if (typeof window !== "undefined") {
      window.addEventListener(
        "socket-status-change",
        handleStatusChange as EventListener
      );
    }

    // 초기 상태 설정
    setIsConnected(socket.isConnected());
    setStatus(socket.getConnectionStatus());

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "socket-status-change",
          handleStatusChange as EventListener
        );
      }
    };
  }, [socket]);

  return { isConnected, status };
}
