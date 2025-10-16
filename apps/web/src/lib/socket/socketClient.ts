/**
 * Socket.io 클라이언트 구현 클래스
 *
 * SOLID 원칙 적용:
 * - Single Responsibility: Socket.io 클라이언트 관리만 담당
 * - Open/Closed: 새로운 기능 추가 시 기존 코드 수정 없이 확장
 * - Liskov Substitution: ISocketClient 인터페이스 완전 구현
 * - Interface Segregation: 클라이언트 기능만 인터페이스에 포함
 * - Dependency Inversion: 추상화된 인터페이스에 의존
 */

import {
  ISocketClient,
  SocketConnectionStatus,
  SocketClientOptions,
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../types/socket";

/**
 * Socket.io 클라이언트 구현 클래스
 */
export class SocketClient implements ISocketClient {
  private socket: any = null; // Socket.io 인스턴스 (dynamic import 후 타입 지정)
  private status: SocketConnectionStatus = "disconnected";
  private eventListeners: Map<string, any[]> = new Map();
  private options: SocketClientOptions;
  private reconnectAttempts = 0;

  constructor(options: SocketClientOptions) {
    this.options = {
      ...options,
      transports: options.transports || ["websocket", "polling"],
      timeout: options.timeout || 20000,
      autoConnect:
        options.autoConnect !== undefined ? options.autoConnect : false,
      reconnection:
        options.reconnection !== undefined ? options.reconnection : true,
      reconnectionAttempts: options.reconnectionAttempts || 5,
      reconnectionDelay: options.reconnectionDelay || 1000,
    };
  }

  /**
   * Socket.io 서버에 연결
   */
  public async connect(): Promise<void> {
    try {
      // Dynamic import for socket.io-client (to handle SSR)
      const { io } = await import("socket.io-client");

      if (this.socket?.connected) {
        return;
      }

      this.status = "connecting";
      this.socket = io(this.options.url, {
        transports: this.options.transports,
        timeout: this.options.timeout,
        autoConnect: this.options.autoConnect,
        reconnection: this.options.reconnection,
        reconnectionAttempts: this.options.reconnectionAttempts,
        reconnectionDelay: this.options.reconnectionDelay,
        auth: this.options.auth,
      });

      this.setupEventListeners();
      this.socket.connect();
    } catch (error) {
      console.error("❌ Socket.io 연결 실패:", error);
      this.status = "error";
      this.emitStatusChange();
    }
  }

  /**
   * Socket.io 서버 연결 해제
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.status = "disconnected";
    this.reconnectAttempts = 0;
    this.emitStatusChange();
  }

  /**
   * 연결 상태 확인
   */
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * 현재 연결 상태 반환
   */
  public getConnectionStatus(): SocketConnectionStatus {
    return this.status;
  }

  /**
   * 서버 이벤트 리스너 등록
   */
  public on<K extends keyof ServerToClientEvents>(
    event: K,
    handler: ServerToClientEvents[K]
  ): void {
    if (!this.eventListeners.has(event as string)) {
      this.eventListeners.set(event as string, []);
    }

    const listeners = this.eventListeners.get(event as string);
    if (!listeners) return;
    listeners.push(handler);

    // Socket이 이미 연결되어 있으면 즉시 등록
    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  /**
   * 서버 이벤트 리스너 제거
   */
  public off<K extends keyof ServerToClientEvents>(
    event: K,
    handler?: ServerToClientEvents[K]
  ): void {
    if (handler) {
      // 특정 핸들러 제거
      const listeners = this.eventListeners.get(event as string);
      if (listeners) {
        const index = listeners.indexOf(handler);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }

      if (this.socket) {
        this.socket.off(event, handler);
      }
    } else {
      // 모든 핸들러 제거
      this.eventListeners.delete(event as string);

      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  /**
   * 서버로 이벤트 전송
   */
  public emit<K extends keyof ClientToServerEvents>(
    event: K,
    data: Parameters<ClientToServerEvents[K]>[0]
  ): void {
    if (!this.socket?.connected) {
      console.warn(
        `⚠️  서버에 연결되지 않음. 이벤트 전송 실패: ${event as string}`
      );
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * 룸에 참여
   */
  public joinRoom(roomId: string, userId: string): void {
    this.emit("join_room", { roomId, userId });
  }

  /**
   * 룸에서 나가기
   */
  public leaveRoom(roomId: string, userId: string): void {
    this.emit("leave_room", { roomId, userId });
  }

  /**
   * Socket.io 기본 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // 연결 성공
    this.socket.on("connect", () => {
      this.status = "connected";
      this.reconnectAttempts = 0;
      this.emitStatusChange();

      // 기존 등록된 이벤트 리스너들을 다시 등록
      this.registerEventListeners();
    });

    // 연결 해제
    this.socket.on("disconnect", (_reason: string) => {
      this.status = "disconnected";
      this.emitStatusChange();
    });

    // 연결 에러
    this.socket.on("connect_error", (error: Error) => {
      this.status = "error";
      this.emitStatusChange();
      console.error("❌ Socket.io 연결 에러:", error.message);
    });

    // 재연결 시도
    this.socket.on("reconnect_attempt", (attempt: number) => {
      this.status = "reconnecting";
      this.reconnectAttempts = attempt;
      this.emitStatusChange();
    });

    // 재연결 성공
    this.socket.on("reconnect", (_attempt: number) => {
      this.status = "connected";
      this.reconnectAttempts = 0;
      this.emitStatusChange();
    });

    // 재연결 실패
    this.socket.on("reconnect_failed", () => {
      this.status = "error";
      this.emitStatusChange();
      console.error("❌ 재연결 실패: 최대 시도 횟수 초과");
    });
  }

  /**
   * 등록된 이벤트 리스너들을 Socket에 등록
   */
  private registerEventListeners(): void {
    this.eventListeners.forEach((handlers, event) => {
      handlers.forEach(handler => {
        this.socket?.on(event, handler);
      });
    });
  }

  /**
   * 상태 변경 이벤트 발생
   */
  private emitStatusChange(): void {
    // 상태 변경을 외부에 알림 (커스텀 이벤트)
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("socket-status-change", {
          detail: {
            status: this.status,
            isConnected: this.isConnected(),
            reconnectAttempts: this.reconnectAttempts,
          },
        })
      );
    }
  }

  /**
   * Socket.io 클라이언트 정리
   */
  public destroy(): void {
    this.disconnect();
    this.eventListeners.clear();

    if (typeof window !== "undefined") {
      window.removeEventListener("socket-status-change", this.emitStatusChange);
    }
  }
}

/**
 * Socket.io 클라이언트 팩토리 함수
 * Dependency Inversion: 환경변수 기반 설정 생성
 */
export function createSocketClient(
  options?: Partial<SocketClientOptions>
): SocketClient {
  const defaultOptions: SocketClientOptions = {
    url: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000",
    transports: ["websocket", "polling"],
    timeout: 20000,
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  };

  return new SocketClient({ ...defaultOptions, ...options });
}
