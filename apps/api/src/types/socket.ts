/**
 * Socket.io 실시간 통신을 위한 타입 정의
 *
 * SOLID 원칙 적용:
 * - Single Responsibility: 소켓 관련 타입만 관리
 * - Interface Segregation: 역할별로 인터페이스 분리
 * - Dependency Inversion: 구체적 구현이 아닌 추상화에 의존
 */

import { Server, Socket } from "socket.io";

/**
 * 클라이언트에서 서버로 전송하는 이벤트 타입
 */
export interface ClientToServerEvents {
  // 연결 관리
  join_room: (data: { roomId: string; userId: string }) => void;
  leave_room: (data: { roomId: string; userId: string }) => void;

  // 질문 관련
  new_question: (data: {
    questionId: string;
    content: string;
    hashtags: string[];
    location?: string;
  }) => void;
  question_updated: (data: {
    questionId: string;
    content?: string;
    hashtags?: string[];
  }) => void;

  // 답변 관련
  new_answer: (data: {
    questionId: string;
    answerId: string;
    content: string;
    userId: string;
  }) => void;
  answer_updated: (data: { answerId: string; content: string }) => void;
  answer_accepted: (data: { answerId: string; questionId: string }) => void;

  // 타이핑 표시
  typing_start: (data: {
    questionId: string;
    userId: string;
    userName: string;
  }) => void;
  typing_stop: (data: { questionId: string; userId: string }) => void;

  // 사용자 활동
  user_online: (data: { userId: string; location?: string }) => void;
  user_offline: (data: { userId: string }) => void;
}

/**
 * 서버에서 클라이언트로 전송하는 이벤트 타입
 *
 * @TAG:CODE:ANSWER-INTERACTION-001-E1
 * @TAG:CODE:ANSWER-INTERACTION-001-E2
 * @TAG:CODE:ANSWER-INTERACTION-001-E3
 */
export interface ServerToClientEvents {
  // 연결 확인
  connection_confirmed: (data: { socketId: string; timestamp: number }) => void;

  // 질문 브로드캐스트
  question_broadcast: (data: {
    questionId: string;
    content: string;
    hashtags: string[];
    author: { id: string; name: string; avatar?: string };
    location?: string;
    timestamp: number;
    isUpdate?: boolean;
  }) => void;

  // 답변 브로드캐스트
  answer_broadcast: (data: {
    questionId: string;
    answerId: string;
    content: string;
    author: { id: string; name: string; avatar?: string };
    timestamp: number;
    isUpdate?: boolean;
  }) => void;

  // @TAG:CODE:ANSWER-INTERACTION-001-E1 - Answer adoption event
  answer_adopted: (data: {
    answerId: string;
    adopterId: string;
    adopteeId: string;
    questionId: string;
    timestamp: number;
  }) => void;

  // @TAG:CODE:ANSWER-INTERACTION-001-E2 - Answer reaction (like/dislike) updates
  answer_reaction_updated: (data: {
    answerId: string;
    likeCount: number;
    dislikeCount: number;
    timestamp: number;
  }) => void;

  // @TAG:CODE:ANSWER-INTERACTION-001-E3 - Badge award notification
  badge_awarded: (data: {
    userId: string;
    badgeName: string;
    badgeId: string;
    timestamp: number;
  }) => void;

  // 타이핑 상태
  user_typing: (data: {
    questionId: string;
    userId: string;
    userName: string;
    isTyping: boolean;
  }) => void;

  // 실시간 통계
  stats_update: (data: {
    activeUsers: number;
    questionsToday: number;
    answersToday: number;
    responseRate: number;
  }) => void;

  // 알림
  notification: (data: {
    type: "question" | "answer" | "accepted" | "mention" | "system";
    title: string;
    message: string;
    targetUserId?: string;
    data?: unknown;
  }) => void;

  // 에러 처리
  error: (data: { message: string; code?: string }) => void;
}

/**
 * Socket 간 전송되는 이벤트 타입
 */
export interface InterServerEvents {
  ping: () => void;
  stats_sync: (data: { serverId: string; stats: unknown }) => void;
}

/**
 * Socket 데이터 타입
 */
export interface SocketData {
  userId?: string;
  userName?: string;
  userAvatar?: string;
  location?: string;
  joinedRooms: Set<string>;
  lastActivity: number;
}

/**
 * 타입이 지정된 Socket.io 서버
 */
export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

/**
 * 타입이 지정된 Socket
 */
export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

/**
 * 룸 관리 인터페이스 (Interface Segregation Principle)
 */
export interface IRoomManager {
  joinRoom(socket: TypedSocket, roomId: string, userId: string): Promise<void>;
  leaveRoom(socket: TypedSocket, roomId: string, userId: string): Promise<void>;
  getRoomUsers(roomId: string): Promise<string[]>;
  broadcastToRoom(
    roomId: string,
    event: keyof ServerToClientEvents,
    data: unknown
  ): void;
}

/**
 * 연결 관리 인터페이스 (Interface Segregation Principle)
 */
export interface IConnectionManager {
  handleConnection(socket: TypedSocket): void;
  handleDisconnection(socket: TypedSocket): void;
  getActiveUsers(): Promise<number>;
  getUserSockets(userId: string): TypedSocket[];
}

/**
 * 알림 관리 인터페이스 (Interface Segregation Principle)
 */
export interface INotificationManager {
  sendToUser(
    userId: string,
    event: keyof ServerToClientEvents,
    data: unknown
  ): void;
  broadcastToAll(event: keyof ServerToClientEvents, data: unknown): void;
  sendToLocation(
    location: string,
    event: keyof ServerToClientEvents,
    data: unknown
  ): void;
}

/**
 * 실시간 통계 인터페이스 (Interface Segregation Principle)
 */
export interface IStatsManager {
  updateActiveUsers(): Promise<void>;
  updateDailyStats(): Promise<void>;
  broadcastStats(): Promise<void>;
  getRealtimeStats(): Promise<{
    activeUsers: number;
    questionsToday: number;
    answersToday: number;
    responseRate: number;
  }>;
}

/**
 * Socket.io 이벤트 핸들러 인터페이스 (Single Responsibility Principle)
 */
export interface ISocketEventHandler {
  handleQuestionEvents(socket: TypedSocket): void;
  handleAnswerEvents(socket: TypedSocket): void;
  handleTypingEvents(socket: TypedSocket): void;
  handleUserEvents(socket: TypedSocket): void;
}

/**
 * Redis 어댑터 설정 타입
 */
export interface RedisAdapterConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
}

/**
 * Socket.io 서버 설정 타입
 */
export interface SocketServerConfig {
  port: number;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  redis?: RedisAdapterConfig;
  pingTimeout: number;
  pingInterval: number;
}
