/**
 * Socket.io 성능 최적화 서비스
 *
 * @description
 * - 실시간 통신 성능 최적화
 * - 연결 관리, 메시지 큐잉, 부하 분산
 * - SRP: Socket.io 성능 최적화만 담당
 */

import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { EventEmitter } from "events";

/**
 * 연결 상태 인터페이스
 */
interface ConnectionState {
  socketId: string;
  userId?: string;
  room: string;
  connectedAt: Date;
  lastActivity: Date;
  messageCount: number;
  isActive: boolean;
}

/**
 * 성능 메트릭 인터페이스
 */
interface PerformanceMetrics {
  totalConnections: number;
  activeConnections: number;
  messagesPerSecond: number;
  averageResponseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  uptime: number;
}

/**
 * Socket.io 성능 최적화 서비스
 *
 * @description
 * - 실시간 통신 성능 모니터링 및 최적화
 * - 연결 풀 관리, 메시지 큐잉, 부하 분산
 * - 메모리 사용량 최적화
 */
export class SocketPerformanceService extends EventEmitter {
  private io: SocketIOServer;
  private connections: Map<string, ConnectionState> = new Map();
  private messageQueue: Map<string, any[]> = new Map();
  private performanceMetrics: PerformanceMetrics;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private metricsInterval: NodeJS.Timeout | null = null;

  constructor(server: HTTPServer) {
    super();
    
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      // 성능 최적화 설정
      pingTimeout: 60000, // 60초
      pingInterval: 25000, // 25초
      maxHttpBufferSize: 1e6, // 1MB
      allowEIO3: true,
      transports: ["websocket", "polling"],
    });

    this.performanceMetrics = {
      totalConnections: 0,
      activeConnections: 0,
      messagesPerSecond: 0,
      averageResponseTime: 0,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    };

    this.setupEventHandlers();
    this.startCleanupInterval();
    this.startMetricsCollection();
  }

  /**
   * Socket.io 이벤트 핸들러 설정
   */
  private setupEventHandlers(): void {
    this.io.on("connection", (socket) => {
      this.handleConnection(socket);
    });

    this.io.engine.on("connection_error", (err) => {
      console.error("Socket connection error:", err);
      this.emit("connectionError", err);
    });
  }

  /**
   * 새 연결 처리
   *
   * @param socket - Socket.io 소켓
   */
  private handleConnection(socket: any): void {
    const connectionState: ConnectionState = {
      socketId: socket.id,
      userId: socket.handshake.auth?.userId,
      room: "general",
      connectedAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      isActive: true,
    };

    this.connections.set(socket.id, connectionState);
    this.performanceMetrics.totalConnections++;
    this.performanceMetrics.activeConnections++;

    // 기본 룸에 참가
    socket.join("general");

    // 연결 이벤트 핸들러
    socket.on("join_room", (room: string) => {
      this.handleJoinRoom(socket, room);
    });

    socket.on("leave_room", (room: string) => {
      this.handleLeaveRoom(socket, room);
    });

    socket.on("message", (data: any) => {
      this.handleMessage(socket, data);
    });

    socket.on("typing", (data: any) => {
      this.handleTyping(socket, data);
    });

    socket.on("disconnect", () => {
      this.handleDisconnection(socket);
    });

    // 연결 성공 이벤트 발생
    this.emit("connection", connectionState);
  }

  /**
   * 룸 참가 처리
   *
   * @param socket - Socket.io 소켓
   * @param room - 참가할 룸
   */
  private handleJoinRoom(socket: any, room: string): void {
    const connection = this.connections.get(socket.id);
    if (!connection) return;

    // 이전 룸에서 나가기
    if (connection.room !== "general") {
      socket.leave(connection.room);
    }

    // 새 룸에 참가
    socket.join(room);
    connection.room = room;
    connection.lastActivity = new Date();

    // 룸 참가 알림
    socket.to(room).emit("user_joined", {
      userId: connection.userId,
      socketId: socket.id,
    });

    this.emit("joinRoom", { socketId: socket.id, room });
  }

  /**
   * 룸 나가기 처리
   *
   * @param socket - Socket.io 소켓
   * @param room - 나갈 룸
   */
  private handleLeaveRoom(socket: any, room: string): void {
    const connection = this.connections.get(socket.id);
    if (!connection) return;

    socket.leave(room);
    connection.room = "general";
    connection.lastActivity = new Date();

    // 룸 나가기 알림
    socket.to(room).emit("user_left", {
      userId: connection.userId,
      socketId: socket.id,
    });

    this.emit("leaveRoom", { socketId: socket.id, room });
  }

  /**
   * 메시지 처리
   *
   * @param socket - Socket.io 소켓
   * @param data - 메시지 데이터
   */
  private handleMessage(socket: any, data: any): void {
    const connection = this.connections.get(socket.id);
    if (!connection) return;

    connection.messageCount++;
    connection.lastActivity = new Date();

    // 메시지 큐에 추가 (부하 분산)
    this.addToMessageQueue(connection.room, {
      type: "message",
      data,
      from: socket.id,
      timestamp: new Date(),
    });

    this.emit("message", { socketId: socket.id, data });
  }

  /**
   * 타이핑 상태 처리
   *
   * @param socket - Socket.io 소켓
   * @param data - 타이핑 데이터
   */
  private handleTyping(socket: any, data: any): void {
    const connection = this.connections.get(socket.id);
    if (!connection) return;

    connection.lastActivity = new Date();

    // 타이핑 상태를 같은 룸의 다른 사용자들에게 전송
    socket.to(connection.room).emit("user_typing", {
      userId: connection.userId,
      socketId: socket.id,
      isTyping: data.isTyping,
    });

    this.emit("typing", { socketId: socket.id, data });
  }

  /**
   * 연결 해제 처리
   *
   * @param socket - Socket.io 소켓
   */
  private handleDisconnection(socket: any): void {
    const connection = this.connections.get(socket.id);
    if (!connection) return;

    // 연결 상태 업데이트
    connection.isActive = false;
    this.performanceMetrics.activeConnections--;

    // 룸에서 나가기 알림
    socket.to(connection.room).emit("user_left", {
      userId: connection.userId,
      socketId: socket.id,
    });

    // 연결 정보 제거 (지연 제거로 재연결 대응)
    setTimeout(() => {
      this.connections.delete(socket.id);
    }, 30000); // 30초 후 제거

    this.emit("disconnection", connection);
  }

  /**
   * 메시지 큐에 추가
   *
   * @param room - 룸 이름
   * @param message - 메시지 데이터
   */
  private addToMessageQueue(room: string, message: any): void {
    if (!this.messageQueue.has(room)) {
      this.messageQueue.set(room, []);
    }

    const queue = this.messageQueue.get(room)!;
    queue.push(message);

    // 큐 크기 제한 (메모리 사용량 제한)
    if (queue.length > 1000) {
      queue.shift(); // 가장 오래된 메시지 제거
    }
  }

  /**
   * 메시지 큐 처리
   *
   * @param room - 룸 이름
   * @param limit - 처리할 메시지 수 제한
   */
  private processMessageQueue(room: string, limit: number = 10): void {
    const queue = this.messageQueue.get(room);
    if (!queue || queue.length === 0) return;

    const messages = queue.splice(0, limit);
    
    messages.forEach(message => {
      this.io.to(room).emit(message.type, message.data);
    });
  }

  /**
   * 정리 작업 시작
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveConnections();
      this.processAllMessageQueues();
    }, 30000); // 30초마다 실행
  }

  /**
   * 비활성 연결 정리
   */
  private cleanupInactiveConnections(): void {
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5분

    for (const [socketId, connection] of this.connections) {
      const timeSinceLastActivity = now.getTime() - connection.lastActivity.getTime();
      
      if (timeSinceLastActivity > inactiveThreshold) {
        connection.isActive = false;
        this.performanceMetrics.activeConnections--;
        
        // 소켓 강제 연결 해제
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);
        }
      }
    }
  }

  /**
   * 모든 메시지 큐 처리
   */
  private processAllMessageQueues(): void {
    for (const room of this.messageQueue.keys()) {
      this.processMessageQueue(room);
    }
  }

  /**
   * 성능 메트릭 수집 시작
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.collectPerformanceMetrics();
    }, 10000); // 10초마다 실행
  }

  /**
   * 성능 메트릭 수집
   */
  private collectPerformanceMetrics(): void {
    this.performanceMetrics.memoryUsage = process.memoryUsage();
    this.performanceMetrics.uptime = process.uptime();
    
    // 메시지 처리량 계산
    const totalMessages = Array.from(this.connections.values())
      .reduce((sum, conn) => sum + conn.messageCount, 0);
    
    this.performanceMetrics.messagesPerSecond = totalMessages / 10; // 10초 기준

    // 성능 메트릭 이벤트 발생
    this.emit("metrics", this.performanceMetrics);
  }

  /**
   * 특정 룸에 메시지 브로드캐스트
   *
   * @param room - 룸 이름
   * @param event - 이벤트 이름
   * @param data - 전송할 데이터
   */
  public broadcastToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data);
  }

  /**
   * 특정 사용자에게 메시지 전송
   *
   * @param userId - 사용자 ID
   * @param event - 이벤트 이름
   * @param data - 전송할 데이터
   */
  public sendToUser(userId: string, event: string, data: any): void {
    const userSocket = this.findSocketByUserId(userId);
    if (userSocket) {
      userSocket.emit(event, data);
    }
  }

  /**
   * 사용자 ID로 소켓 찾기
   *
   * @param userId - 사용자 ID
   * @returns 찾은 소켓 또는 null
   */
  private findSocketByUserId(userId: string): any {
    for (const [socketId, connection] of this.connections) {
      if (connection.userId === userId && connection.isActive) {
        return this.io.sockets.sockets.get(socketId);
      }
    }
    return null;
  }

  /**
   * 성능 메트릭 조회
   *
   * @returns 현재 성능 메트릭
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * 연결 상태 조회
   *
   * @returns 현재 연결 상태들
   */
  public getConnections(): ConnectionState[] {
    return Array.from(this.connections.values());
  }

  /**
   * 특정 룸의 연결 수 조회
   *
   * @param room - 룸 이름
   * @returns 룸의 연결 수
   */
  public getRoomConnectionCount(room: string): number {
    return Array.from(this.connections.values())
      .filter(conn => conn.room === room && conn.isActive).length;
  }

  /**
   * 서비스 종료
   */
  public shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    // 모든 연결 종료
    this.io.disconnectSockets(true);
    this.io.close();
  }
}

// 싱글톤 인스턴스
let socketPerformanceService: SocketPerformanceService | null = null;

export function getSocketPerformanceService(server?: HTTPServer): SocketPerformanceService {
  if (!socketPerformanceService && server) {
    socketPerformanceService = new SocketPerformanceService(server);
  }
  return socketPerformanceService!;
}
