/**
 * Socket.io 실시간 알림 관리 서비스
 *
 * SOLID 원칙 적용:
 * - Single Responsibility: 알림 전송 및 관리만 담당
 * - Open/Closed: 새로운 알림 타입 추가 시 기존 코드 수정 없이 확장
 * - Liskov Substitution: INotificationManager 인터페이스 완전 구현
 * - Interface Segregation: 알림 관리 기능만 인터페이스에 포함
 * - Dependency Inversion: 추상화된 인터페이스에 의존
 */

import {
  TypedServer,
  INotificationManager,
  ServerToClientEvents,
} from "../../types/socket";

/**
 * 알림 타입 정의
 */
export interface NotificationData {
  type: "question" | "answer" | "accepted" | "mention" | "system";
  title: string;
  message: string;
  targetUserId?: string;
  data?: {
    questionId?: string;
    answerId?: string;
    userId?: string;
    url?: string;
    [key: string]: unknown;
  };
}

/**
 * 알림 전송 옵션
 */
export interface NotificationOptions {
  urgent?: boolean; // 긴급 알림 여부
  persistent?: boolean; // 영구 저장 여부
  sound?: boolean; // 사운드 재생 여부
  vibration?: boolean; // 진동 여부
  delay?: number; // 지연 전송 (밀리초)
}

/**
 * 사용자별 알림 설정
 */
export interface UserNotificationSettings {
  enabled: boolean;
  questionNotifications: boolean;
  answerNotifications: boolean;
  mentionNotifications: boolean;
  systemNotifications: boolean;
  quietHours?: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string; // "07:00"
  };
}

/**
 * Socket.io 알림 관리 클래스
 */
export class NotificationManager implements INotificationManager {
  private userSettings: Map<string, UserNotificationSettings> = new Map();
  private notificationQueue: Map<string, NotificationData[]> = new Map(); // 오프라인 사용자용 큐
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>

  constructor(private io: TypedServer) {
    this.startNotificationCleanup();
  }

  /**
   * 특정 사용자에게 알림 전송
   * @param userId 사용자 ID
   * @param event 이벤트 이름
   * @param data 전송할 데이터
   */
  public sendToUser(
    userId: string,
    event: keyof ServerToClientEvents,
    data: unknown
  ): void {
    try {
      const userSocketIds = this.userSockets.get(userId);

      if (!userSocketIds || userSocketIds.size === 0) {
        // 오프라인 사용자 - 큐에 저장
        if (event === "notification") {
          this.queueNotification(userId, data as NotificationData);
        }
        console.log(`📴 오프라인 사용자: ${userId} - 알림 큐에 저장`);
        return;
      }

      // 사용자 설정 확인
      if (
        event === "notification" &&
        !this.shouldSendNotification(userId, data as NotificationData)
      ) {
        console.log(`🔕 알림 차단: ${userId} - ${(data as any).type}`);
        return;
      }

      // 온라인 사용자의 모든 소켓에 전송
      userSocketIds.forEach(socketId => {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit(event, data as any);
        }
      });

      console.log(
        `📢 알림 전송: ${userId} (${userSocketIds.size}개 소켓) - ${event}`
      );
    } catch (error) {
      console.error(`❌ 사용자 알림 전송 실패 [${userId}]:`, error);
    }
  }

  /**
   * 모든 사용자에게 브로드캐스트
   * @param event 이벤트 이름
   * @param data 전송할 데이터
   */
  public broadcastToAll(
    event: keyof ServerToClientEvents,
    data: unknown
  ): void {
    try {
      this.io.emit(event, data as any);
      console.log(`📡 전체 브로드캐스트: ${event}`, data);
    } catch (error) {
      console.error(`❌ 전체 브로드캐스트 실패:`, error);
    }
  }

  /**
   * 특정 위치의 사용자들에게 알림 전송
   * @param location 위치
   * @param event 이벤트 이름
   * @param data 전송할 데이터
   */
  public sendToLocation(
    location: string,
    event: keyof ServerToClientEvents,
    data: unknown
  ): void {
    try {
      // 위치 기반 룸에 브로드캐스트
      const roomName = `location:${location}`;
      this.io.to(roomName).emit(event, data as any);

      console.log(`🗺️  위치 기반 알림: ${location} - ${event}`);
    } catch (error) {
      console.error(`❌ 위치 기반 알림 실패 [${location}]:`, error);
    }
  }

  /**
   * 사용자 소켓 등록
   * @param userId 사용자 ID
   * @param socketId 소켓 ID
   */
  public registerUserSocket(userId: string, socketId: string): void {
    let userSocketIds = this.userSockets.get(userId);
    if (!userSocketIds) {
      userSocketIds = new Set();
      this.userSockets.set(userId, userSocketIds);
    }
    userSocketIds.add(socketId);

    // 오프라인 알림 큐 확인 및 전송
    this.processQueuedNotifications(userId);

    console.log(`🔌 사용자 소켓 등록: ${userId} -> ${socketId}`);
  }

  /**
   * 사용자 소켓 해제
   * @param userId 사용자 ID
   * @param socketId 소켓 ID
   */
  public unregisterUserSocket(userId: string, socketId: string): void {
    const userSocketIds = this.userSockets.get(userId);
    if (userSocketIds) {
      userSocketIds.delete(socketId);
      if (userSocketIds.size === 0) {
        this.userSockets.delete(userId);
      }
    }

    console.log(`🔌 사용자 소켓 해제: ${userId} -> ${socketId}`);
  }

  /**
   * 사용자 알림 설정 업데이트
   * @param userId 사용자 ID
   * @param settings 알림 설정
   */
  public updateUserSettings(
    userId: string,
    settings: UserNotificationSettings
  ): void {
    this.userSettings.set(userId, settings);
    console.log(`⚙️  알림 설정 업데이트: ${userId}`, settings);
  }

  /**
   * 질문 관련 알림 전송
   * @param data 질문 데이터
   */
  public sendQuestionNotification(data: {
    questionId: string;
    authorId: string;
    content: string;
    hashtags: string[];
    location?: string;
  }): void {
    const notification: NotificationData = {
      type: "question",
      title: "새로운 질문이 등록되었습니다",
      message: `${data.content.substring(0, 100)}${data.content.length > 100 ? "..." : ""}`,
      data: {
        questionId: data.questionId,
        userId: data.authorId,
        url: `/questions/${data.questionId}`,
      },
    };

    // 위치 기반 알림
    if (data.location) {
      this.sendToLocation(data.location, "notification", notification);
    }

    // 해시태그 관심 사용자들에게 알림 (향후 구현)
    // this.sendToHashtagFollowers(data.hashtags, 'notification', notification);

    console.log(`❓ 질문 알림 전송: ${data.questionId}`);
  }

  /**
   * 답변 관련 알림 전송
   * @param data 답변 데이터
   */
  public sendAnswerNotification(data: {
    answerId: string;
    questionId: string;
    questionAuthorId: string;
    answerAuthorId: string;
    content: string;
  }): void {
    const notification: NotificationData = {
      type: "answer",
      title: "질문에 새로운 답변이 달렸습니다",
      message: `${data.content.substring(0, 100)}${data.content.length > 100 ? "..." : ""}`,
      targetUserId: data.questionAuthorId,
      data: {
        questionId: data.questionId,
        answerId: data.answerId,
        userId: data.answerAuthorId,
        url: `/questions/${data.questionId}#answer-${data.answerId}`,
      },
    };

    // 질문 작성자에게 알림
    this.sendToUser(data.questionAuthorId, "notification", notification);

    console.log(
      `💬 답변 알림 전송: ${data.answerId} -> ${data.questionAuthorId}`
    );
  }

  /**
   * 답변 채택 알림 전송
   * @param data 채택 데이터
   */
  public sendAnswerAcceptedNotification(data: {
    answerId: string;
    questionId: string;
    answerAuthorId: string;
    questionAuthorId: string;
  }): void {
    const notification: NotificationData = {
      type: "accepted",
      title: "답변이 채택되었습니다! 🎉",
      message: "축하합니다! 회원님의 답변이 채택되어 포인트를 획득했습니다.",
      targetUserId: data.answerAuthorId,
      data: {
        questionId: data.questionId,
        answerId: data.answerId,
        userId: data.questionAuthorId,
        url: `/questions/${data.questionId}#answer-${data.answerId}`,
      },
    };

    // 답변 작성자에게 알림
    this.sendToUser(data.answerAuthorId, "notification", notification);

    console.log(
      `✅ 답변 채택 알림 전송: ${data.answerId} -> ${data.answerAuthorId}`
    );
  }

  /**
   * 시스템 알림 전송
   * @param message 알림 메시지
   * @param targetUsers 대상 사용자 (없으면 전체)
   */
  public sendSystemNotification(message: string, targetUsers?: string[]): void {
    const notification: NotificationData = {
      type: "system",
      title: "시스템 알림",
      message,
    };

    if (targetUsers && targetUsers.length > 0) {
      targetUsers.forEach(userId => {
        this.sendToUser(userId, "notification", notification);
      });
    } else {
      this.broadcastToAll("notification", notification);
    }

    console.log(`🔔 시스템 알림 전송: ${message}`);
  }

  /**
   * 알림 전송 여부 확인
   * @param userId 사용자 ID
   * @param notification 알림 데이터
   * @returns 전송 여부
   */
  private shouldSendNotification(
    userId: string,
    notification: NotificationData
  ): boolean {
    const settings = this.userSettings.get(userId);
    if (!settings || !settings.enabled) {
      return false;
    }

    // 알림 타입별 설정 확인
    switch (notification.type) {
      case "question":
        return settings.questionNotifications;
      case "answer":
        return settings.answerNotifications;
      case "mention":
        return settings.mentionNotifications;
      case "system":
        return settings.systemNotifications;
      case "accepted":
        return true; // 채택 알림은 항상 전송
      default:
        return true;
    }
  }

  /**
   * 오프라인 알림 큐에 저장
   * @param userId 사용자 ID
   * @param notification 알림 데이터
   */
  private queueNotification(
    userId: string,
    notification: NotificationData
  ): void {
    let queue = this.notificationQueue.get(userId);
    if (!queue) {
      queue = [];
      this.notificationQueue.set(userId, queue);
    }

    queue.push(notification);

    // 큐 크기 제한 (최대 50개)
    if (queue.length > 50) {
      queue.shift();
    }
  }

  /**
   * 대기 중인 알림 처리
   * @param userId 사용자 ID
   */
  private processQueuedNotifications(userId: string): void {
    const queue = this.notificationQueue.get(userId);
    if (!queue || queue.length === 0) {
      return;
    }

    // 큐의 모든 알림 전송
    queue.forEach(notification => {
      this.sendToUser(userId, "notification", notification);
    });

    // 큐 비우기
    this.notificationQueue.delete(userId);

    console.log(`📬 대기 알림 전송 완료: ${userId} (${queue.length}개)`);
  }

  /**
   * 알림 정리 작업 시작
   * 오래된 알림 큐 정리
   */
  private startNotificationCleanup(): void {
    const CLEANUP_INTERVAL = 30 * 60 * 1000; // 30분마다 실행

    setInterval(() => {
      let cleanedCount = 0;

      // 오래된 알림 큐 정리
      const queueEntries = Array.from(this.notificationQueue.entries());
      for (const [userId, queue] of queueEntries) {
        if (queue.length === 0) {
          this.notificationQueue.delete(userId);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`🧹 알림 큐 정리 완료: ${cleanedCount}개 사용자`);
      }
    }, CLEANUP_INTERVAL);
  }

  /**
   * 사용자 통계 조회
   */
  public getNotificationStats(): {
    onlineUsers: number;
    queuedNotifications: number;
    totalSettings: number;
  } {
    const queuedCount = Array.from(this.notificationQueue.values()).reduce(
      (sum, queue) => sum + queue.length,
      0
    );

    return {
      onlineUsers: this.userSockets.size,
      queuedNotifications: queuedCount,
      totalSettings: this.userSettings.size,
    };
  }
}
