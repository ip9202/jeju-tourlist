/**
 * Socket.io 연결 관리 서비스
 *
 * SOLID 원칙 적용:
 * - Single Responsibility: 연결 관리만 담당
 * - Open/Closed: 새로운 연결 기능 추가 시 기존 코드 수정 없이 확장
 * - Liskov Substitution: IConnectionManager 인터페이스 완전 구현
 * - Interface Segregation: 연결 관리 기능만 인터페이스에 포함
 * - Dependency Inversion: 추상화된 인터페이스에 의존
 */

import {
  TypedServer,
  TypedSocket,
  IConnectionManager,
} from "../../types/socket";

/**
 * 사용자 연결 정보 인터페이스
 */
interface UserConnection {
  userId: string;
  sockets: Set<string>; // 하나의 사용자가 여러 탭에서 접속 가능
  lastActivity: number;
  location?: string;
  userAgent?: string;
  connectionTime: number;
}

/**
 * Socket.io 연결 관리 클래스
 */
export class ConnectionManager implements IConnectionManager {
  private userConnections: Map<string, UserConnection> = new Map();
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(private io: TypedServer) {
    this.startHeartbeat();
  }

  /**
   * 새로운 소켓 연결 처리
   * @param socket 소켓 인스턴스
   */
  public handleConnection(socket: TypedSocket): void {
    try {
      const userId = socket.data.userId;
      if (!userId) {
        console.warn(`⚠️  사용자 ID가 없는 연결: ${socket.id}`);
        socket.disconnect();
        return;
      }

      // 사용자 연결 정보 업데이트
      let userConnection = this.userConnections.get(userId);
      if (!userConnection) {
        userConnection = {
          userId,
          sockets: new Set(),
          lastActivity: Date.now(),
          connectionTime: Date.now(),
          location: socket.data.location,
          userAgent: socket.handshake.headers["user-agent"],
        };
        this.userConnections.set(userId, userConnection);
      }

      userConnection.sockets.add(socket.id);
      userConnection.lastActivity = Date.now();
      this.socketUsers.set(socket.id, userId);

      console.log(
        `🔌 연결 성공: ${userId} (소켓: ${socket.id}, 총 소켓: ${userConnection.sockets.size})`
      );

      // 연결 확인 메시지 전송
      socket.emit("connection_confirmed", {
        socketId: socket.id,
        timestamp: Date.now(),
      });

      // 사용자 온라인 상태 브로드캐스트
      this.broadcastUserStatus(userId, true);

      // 기본 이벤트 핸들러 등록
      this.setupSocketEventHandlers(socket);
    } catch (error) {
      console.error(`❌ 연결 처리 실패 [${socket.id}]:`, error);
      socket.emit("error", {
        message: "연결 처리에 실패했습니다",
        code: "CONNECTION_FAILED",
      });
      socket.disconnect();
    }
  }

  /**
   * 소켓 연결 해제 처리
   * @param socket 소켓 인스턴스
   */
  public handleDisconnection(socket: TypedSocket): void {
    try {
      const userId = this.socketUsers.get(socket.id);
      if (!userId) {
        console.warn(`⚠️  사용자 정보를 찾을 수 없는 연결 해제: ${socket.id}`);
        return;
      }

      const userConnection = this.userConnections.get(userId);
      if (userConnection) {
        userConnection.sockets.delete(socket.id);

        // 사용자의 마지막 소켓이면 오프라인 처리
        if (userConnection.sockets.size === 0) {
          this.userConnections.delete(userId);
          this.broadcastUserStatus(userId, false);
          console.log(`👋 사용자 오프라인: ${userId}`);
        } else {
          console.log(
            `🔌 소켓 해제: ${userId} (남은 소켓: ${userConnection.sockets.size})`
          );
        }
      }

      this.socketUsers.delete(socket.id);

      // 참여한 룸에서 제거 (RoomManager가 처리하지만 여기서도 정리)
      if (socket.data.joinedRooms) {
        socket.data.joinedRooms.forEach(roomId => {
          socket.leave(roomId);
        });
      }
    } catch (error) {
      console.error(`❌ 연결 해제 처리 실패 [${socket.id}]:`, error);
    }
  }

  /**
   * 현재 활성 사용자 수 조회
   * @returns 활성 사용자 수
   */
  public async getActiveUsers(): Promise<number> {
    return this.userConnections.size;
  }

  /**
   * 특정 사용자의 모든 소켓 조회
   * @param userId 사용자 ID
   * @returns 사용자의 소켓 배열
   */
  public getUserSockets(userId: string): TypedSocket[] {
    const userConnection = this.userConnections.get(userId);
    if (!userConnection) {
      return [];
    }

    return Array.from(userConnection.sockets)
      .map(socketId => this.io.sockets.sockets.get(socketId))
      .filter((socket): socket is TypedSocket => socket !== undefined);
  }

  /**
   * 사용자별 연결 통계 조회
   */
  public getConnectionStats(): {
    totalUsers: number;
    totalSockets: number;
    averageSocketsPerUser: number;
    connectionsByLocation: Map<string, number>;
  } {
    let totalSockets = 0;
    const connectionsByLocation = new Map<string, number>();

    const connections = Array.from(this.userConnections.values());
    for (const connection of connections) {
      totalSockets += connection.sockets.size;

      if (connection.location) {
        const count = connectionsByLocation.get(connection.location) || 0;
        connectionsByLocation.set(connection.location, count + 1);
      }
    }

    return {
      totalUsers: this.userConnections.size,
      totalSockets,
      averageSocketsPerUser:
        this.userConnections.size > 0
          ? totalSockets / this.userConnections.size
          : 0,
      connectionsByLocation,
    };
  }

  /**
   * 특정 위치의 사용자들 조회
   * @param location 위치
   * @returns 해당 위치의 사용자 ID 배열
   */
  public getUsersByLocation(location: string): string[] {
    return Array.from(this.userConnections.values())
      .filter(connection => connection.location === location)
      .map(connection => connection.userId);
  }

  /**
   * 사용자 활동 시간 업데이트
   * @param userId 사용자 ID
   */
  public updateUserActivity(userId: string): void {
    const userConnection = this.userConnections.get(userId);
    if (userConnection) {
      userConnection.lastActivity = Date.now();
    }
  }

  /**
   * 비활성 사용자 조회
   * @param thresholdMs 비활성 기준 시간 (밀리초)
   * @returns 비활성 사용자 ID 배열
   */
  public getInactiveUsers(thresholdMs: number = 30 * 60 * 1000): string[] {
    const now = Date.now();
    const connections = Array.from(this.userConnections.values());
    return connections
      .filter(connection => now - connection.lastActivity > thresholdMs)
      .map(connection => connection.userId);
  }

  /**
   * 사용자 온라인/오프라인 상태 브로드캐스트
   * @param userId 사용자 ID
   * @param isOnline 온라인 여부
   */
  private broadcastUserStatus(userId: string, isOnline: boolean): void {
    try {
      const userConnection = this.userConnections.get(userId);

      this.io.emit("notification", {
        type: "answer",
        title: isOnline ? "사용자 접속" : "사용자 접속 종료",
        message: `사용자가 ${isOnline ? "접속" : "접속 종료"}했습니다`,
        data: {
          userId,
          isOnline,
          location: userConnection?.location,
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      console.error(`❌ 사용자 상태 브로드캐스트 실패 [${userId}]:`, error);
    }
  }

  /**
   * 소켓 기본 이벤트 핸들러 설정
   * @param socket 소켓 인스턴스
   */
  private setupSocketEventHandlers(socket: TypedSocket): void {
    // Ping/Pong 핸들러 (Socket.io 내장 ping/pong 사용)
    socket.on("ping" as never, () => {
      socket.emit("error", { message: "pong" }); // 임시로 error 이벤트 사용
      const userId = this.socketUsers.get(socket.id);
      if (userId) {
        this.updateUserActivity(userId);
      }
    });

    // 에러 핸들러
    socket.on("error", error => {
      console.error(`🚨 소켓 에러 [${socket.id}]:`, error);
    });

    // 연결 해제 핸들러
    socket.on("disconnect", reason => {
      console.log(`🔌 연결 해제 [${socket.id}]: ${reason}`);
      this.handleDisconnection(socket);
    });

    // 사용자 활동 추적을 위한 범용 핸들러
    socket.onAny(() => {
      const userId = this.socketUsers.get(socket.id);
      if (userId) {
        this.updateUserActivity(userId);
      }
    });
  }

  /**
   * 하트비트 시스템 시작
   * 주기적으로 비활성 연결 정리
   */
  private startHeartbeat(): void {
    const HEARTBEAT_INTERVAL = 30 * 1000; // 30초마다 실행
    const INACTIVE_THRESHOLD = 5 * 60 * 1000; // 5분 비활성

    setInterval(() => {
      const inactiveUsers = this.getInactiveUsers(INACTIVE_THRESHOLD);

      inactiveUsers.forEach(userId => {
        const userSockets = this.getUserSockets(userId);
        userSockets.forEach(socket => {
          console.log(
            `💔 비활성 소켓 강제 해제: ${socket.id} (사용자: ${userId})`
          );
          socket.disconnect(true);
        });
      });

      if (inactiveUsers.length > 0) {
        console.log(`🧹 ${inactiveUsers.length}명의 비활성 사용자 정리`);
      }
    }, HEARTBEAT_INTERVAL);
  }
}
