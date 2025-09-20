/**
 * Socket.io 룸 관리 서비스
 *
 * SOLID 원칙 적용:
 * - Single Responsibility: 룸 관리만 담당
 * - Open/Closed: 새로운 룸 기능 추가 시 기존 코드 수정 없이 확장
 * - Liskov Substitution: IRoomManager 인터페이스 완전 구현
 * - Interface Segregation: 룸 관리 기능만 인터페이스에 포함
 * - Dependency Inversion: 추상화된 인터페이스에 의존
 */

import {
  TypedServer,
  TypedSocket,
  IRoomManager,
  ServerToClientEvents,
} from "../../types/socket";

/**
 * 룸 정보 인터페이스
 */
interface RoomInfo {
  id: string;
  users: Set<string>;
  createdAt: number;
  lastActivity: number;
  metadata?: {
    questionId?: string;
    location?: string;
    category?: string;
  };
}

/**
 * Socket.io 룸 관리 클래스
 */
export class RoomManager implements IRoomManager {
  private rooms: Map<string, RoomInfo> = new Map();
  private userRooms: Map<string, Set<string>> = new Map(); // userId -> Set<roomId>

  constructor(private io: TypedServer) {
    this.startCleanupTask();
  }

  /**
   * 사용자를 룸에 추가
   * @param socket 소켓 인스턴스
   * @param roomId 룸 ID
   * @param userId 사용자 ID
   */
  public async joinRoom(
    socket: TypedSocket,
    roomId: string,
    userId: string
  ): Promise<void> {
    try {
      // 소켓을 룸에 추가
      await socket.join(roomId);

      // 룸 정보 업데이트
      let room = this.rooms.get(roomId);
      if (!room) {
        room = {
          id: roomId,
          users: new Set(),
          createdAt: Date.now(),
          lastActivity: Date.now(),
        };
        this.rooms.set(roomId, room);
      }

      room.users.add(userId);
      room.lastActivity = Date.now();

      // 사용자 룸 정보 업데이트
      let userRoomSet = this.userRooms.get(userId);
      if (!userRoomSet) {
        userRoomSet = new Set();
        this.userRooms.set(userId, userRoomSet);
      }
      userRoomSet.add(roomId);

      // 소켓 데이터 업데이트
      if (socket.data.joinedRooms) {
        socket.data.joinedRooms.add(roomId);
      }

      console.log(
        `👥 사용자 ${userId}가 룸 ${roomId}에 참여했습니다. (총 ${room.users.size}명)`
      );

      // 룸의 다른 사용자들에게 알림
      socket.to(roomId).emit("notification", {
        type: "answer",
        title: "새 참여자",
        message: `${socket.data.userName || "사용자"}님이 참여했습니다.`,
        data: { roomId, userId, userName: socket.data.userName },
      });
    } catch (error) {
      console.error(`❌ 룸 참여 실패 [${roomId}]:`, error);
      throw new Error("룸 참여에 실패했습니다");
    }
  }

  /**
   * 사용자를 룸에서 제거
   * @param socket 소켓 인스턴스
   * @param roomId 룸 ID
   * @param userId 사용자 ID
   */
  public async leaveRoom(
    socket: TypedSocket,
    roomId: string,
    userId: string
  ): Promise<void> {
    try {
      // 소켓을 룸에서 제거
      await socket.leave(roomId);

      // 룸 정보 업데이트
      const room = this.rooms.get(roomId);
      if (room) {
        room.users.delete(userId);
        room.lastActivity = Date.now();

        // 룸이 비어있으면 제거
        if (room.users.size === 0) {
          this.rooms.delete(roomId);
          console.log(`🗑️  빈 룸 제거: ${roomId}`);
        }
      }

      // 사용자 룸 정보 업데이트
      const userRoomSet = this.userRooms.get(userId);
      if (userRoomSet) {
        userRoomSet.delete(roomId);
        if (userRoomSet.size === 0) {
          this.userRooms.delete(userId);
        }
      }

      // 소켓 데이터 업데이트
      if (socket.data.joinedRooms) {
        socket.data.joinedRooms.delete(roomId);
      }

      console.log(`👋 사용자 ${userId}가 룸 ${roomId}에서 나갔습니다.`);

      // 룸의 다른 사용자들에게 알림
      socket.to(roomId).emit("notification", {
        type: "answer",
        title: "참여자 나가기",
        message: `${socket.data.userName || "사용자"}님이 나갔습니다.`,
        data: { roomId, userId, userName: socket.data.userName },
      });
    } catch (error) {
      console.error(`❌ 룸 나가기 실패 [${roomId}]:`, error);
      throw new Error("룸 나가기에 실패했습니다");
    }
  }

  /**
   * 룸의 사용자 목록 조회
   * @param roomId 룸 ID
   * @returns 사용자 ID 배열
   */
  public async getRoomUsers(roomId: string): Promise<string[]> {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.users) : [];
  }

  /**
   * 룸의 모든 사용자에게 메시지 브로드캐스트
   * @param roomId 룸 ID
   * @param event 이벤트 이름
   * @param data 전송할 데이터
   */
  public broadcastToRoom(
    roomId: string,
    event: keyof ServerToClientEvents,
    data: unknown
  ): void {
    try {
      const room = this.rooms.get(roomId);
      if (!room) {
        console.warn(`⚠️  존재하지 않는 룸에 브로드캐스트 시도: ${roomId}`);
        return;
      }

      this.io.to(roomId).emit(event, data);

      // 활동 시간 업데이트
      room.lastActivity = Date.now();

      console.log(
        `📡 룸 ${roomId}에 ${event} 이벤트 브로드캐스트 (${room.users.size}명)`
      );
    } catch (error) {
      console.error(`❌ 룸 브로드캐스트 실패 [${roomId}]:`, error);
    }
  }

  /**
   * 사용자가 참여한 모든 룸 조회
   * @param userId 사용자 ID
   * @returns 룸 ID 배열
   */
  public getUserRooms(userId: string): string[] {
    const userRoomSet = this.userRooms.get(userId);
    return userRoomSet ? Array.from(userRoomSet) : [];
  }

  /**
   * 전체 룸 통계 조회
   */
  public getRoomStats(): {
    totalRooms: number;
    totalUsers: number;
    activeRooms: RoomInfo[];
  } {
    const activeRooms = Array.from(this.rooms.values()).sort(
      (a, b) => b.lastActivity - a.lastActivity
    );

    const totalUsers = Array.from(this.rooms.values()).reduce(
      (sum, room) => sum + room.users.size,
      0
    );

    return {
      totalRooms: this.rooms.size,
      totalUsers,
      activeRooms,
    };
  }

  /**
   * 룸 메타데이터 설정
   * @param roomId 룸 ID
   * @param metadata 메타데이터
   */
  public setRoomMetadata(
    roomId: string,
    metadata: { questionId?: string; location?: string; category?: string }
  ): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.metadata = { ...room.metadata, ...metadata };
      console.log(`📝 룸 ${roomId} 메타데이터 업데이트:`, metadata);
    }
  }

  /**
   * 위치 기반 룸 조회
   * @param location 위치
   * @returns 해당 위치의 룸 ID 배열
   */
  public getRoomsByLocation(location: string): string[] {
    return Array.from(this.rooms.values())
      .filter(room => room.metadata?.location === location)
      .map(room => room.id);
  }

  /**
   * 비활성 룸 정리 작업
   * 30분 이상 비활성화된 룸을 자동 제거
   */
  private startCleanupTask(): void {
    const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5분마다 실행
    const INACTIVE_THRESHOLD = 30 * 60 * 1000; // 30분 비활성

    setInterval(() => {
      const now = Date.now();
      const roomsToDelete: string[] = [];

      const roomEntries = Array.from(this.rooms.entries());
      for (const [roomId, room] of roomEntries) {
        if (now - room.lastActivity > INACTIVE_THRESHOLD) {
          roomsToDelete.push(roomId);
        }
      }

      roomsToDelete.forEach(roomId => {
        const room = this.rooms.get(roomId);
        if (room) {
          // 사용자 룸 정보에서도 제거
          room.users.forEach(userId => {
            const userRoomSet = this.userRooms.get(userId);
            if (userRoomSet) {
              userRoomSet.delete(roomId);
              if (userRoomSet.size === 0) {
                this.userRooms.delete(userId);
              }
            }
          });

          this.rooms.delete(roomId);
          console.log(`🧹 비활성 룸 정리: ${roomId}`);
        }
      });

      if (roomsToDelete.length > 0) {
        console.log(
          `✨ 총 ${roomsToDelete.length}개 비활성 룸을 정리했습니다.`
        );
      }
    }, CLEANUP_INTERVAL);
  }
}
