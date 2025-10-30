/**
 * Socket.io 클라이언트 타입 정의
 *
 * SOLID 원칙 적용:
 * - Single Responsibility: Socket 클라이언트 타입만 관리
 * - Interface Segregation: 클라이언트별 인터페이스 분리
 * - Dependency Inversion: 구체적 구현이 아닌 추상화에 의존
 */

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
  }) => void;

  // 답변 브로드캐스트
  answer_broadcast: (data: {
    questionId: string;
    answerId: string;
    content: string;
    author: { id: string; name: string; avatar?: string };
    timestamp: number;
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
 * Socket.io 클라이언트 옵션
 */
export interface SocketClientOptions {
  url: string;
  transports: ("polling" | "websocket")[];
  timeout: number;
  autoConnect: boolean;
  reconnection: boolean;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  auth?: {
    token?: string;
    userId?: string;
  };
}

/**
 * Socket.io 연결 상태
 */
export type SocketConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

/**
 * Socket.io 이벤트 핸들러 타입
 */
export type SocketEventHandler<T = any> = (data: T) => void;

/**
 * Socket.io 클라이언트 관리 인터페이스 (Interface Segregation Principle)
 */
export interface ISocketClient {
  // 연결 관리
  connect(): void;
  disconnect(): void;
  isConnected(): boolean;
  getConnectionStatus(): SocketConnectionStatus;

  // 이벤트 리스너
  on<K extends keyof ServerToClientEvents>(
    event: K,
    handler: ServerToClientEvents[K]
  ): void;
  off<K extends keyof ServerToClientEvents>(
    event: K,
    handler?: ServerToClientEvents[K]
  ): void;

  // 이벤트 전송
  emit<K extends keyof ClientToServerEvents>(
    event: K,
    data: Parameters<ClientToServerEvents[K]>[0]
  ): void;

  // 룸 관리
  joinRoom(roomId: string, userId: string): void;
  leaveRoom(roomId: string, userId: string): void;
}

/**
 * Socket.io 상태 관리 인터페이스 (Single Responsibility Principle)
 */
export interface ISocketState {
  status: SocketConnectionStatus;
  isConnected: boolean;
  lastConnected?: Date;
  reconnectAttempts: number;
  error?: string;
}

/**
 * Socket.io React Hook 반환 타입
 */
export interface UseSocketReturn {
  socket: ISocketClient | null;
  state: ISocketState;
  connect: () => void;
  disconnect: () => void;
  emit: <K extends keyof ClientToServerEvents>(
    event: K,
    data: Parameters<ClientToServerEvents[K]>[0]
  ) => void;
  joinRoom: (roomId: string, userId: string) => void;
  leaveRoom: (roomId: string, userId: string) => void;
}

/**
 * 실시간 알림 데이터 타입
 */
export interface RealtimeNotification {
  id: string;
  type: "question" | "answer" | "accepted" | "mention" | "system";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: {
    questionId?: string;
    answerId?: string;
    userId?: string;
    url?: string;
  };
}

/**
 * 타이핑 상태 데이터 타입
 */
export interface TypingState {
  questionId: string;
  users: Array<{
    userId: string;
    userName: string;
    startTime: number;
  }>;
}

/**
 * 실시간 통계 데이터 타입
 */
export interface RealtimeStats {
  activeUsers: number;
  questionsToday: number;
  answersToday: number;
  responseRate: number;
  lastUpdated: number;
}

/**
 * Socket.io Context 타입
 */
export interface SocketContextType {
  socket: ISocketClient | null;
  state: ISocketState;
  notifications: RealtimeNotification[];
  typingStates: TypingState[];
  stats: RealtimeStats | null;

  // 액션
  connect: () => void;
  disconnect: () => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
}
