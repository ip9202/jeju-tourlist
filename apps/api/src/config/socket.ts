/**
 * Socket.io 서버 설정 및 초기화
 *
 * SOLID 원칙 적용:
 * - Single Responsibility: Socket.io 설정만 담당
 * - Open/Closed: 새로운 설정 추가 시 기존 코드 수정 없이 확장 가능
 * - Dependency Inversion: 환경 설정에 의존하여 유연한 구성
 */

import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
// 환경변수 설정
const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL || "postgresql://localhost:5432/jeju_tourlist",
  NEXTAUTH_SECRET:
    process.env.NEXTAUTH_SECRET ||
    "your-super-secret-key-here-must-be-at-least-32-characters-long",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  API_BASE_URL: process.env.API_BASE_URL || "http://localhost:4000",
  SOCKET_URL: process.env.SOCKET_URL || "http://localhost:4001",
  SOCKET_PORT: process.env.SOCKET_PORT || "4001",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: process.env.REDIS_PORT || "6379",
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DB: process.env.REDIS_DB || "0",
};
import {
  TypedServer,
  TypedSocket,
  SocketServerConfig,
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "../types/socket";

/**
 * Socket.io 서버 구성 클래스
 *
 * Single Responsibility: Socket.io 서버 생성과 설정만 담당
 */
export class SocketConfig {
  private static instance: TypedServer | null = null;

  /**
   * Socket.io 서버 설정 생성
   * 환경변수 기반으로 동적 설정 (Dependency Inversion)
   */
  private static createConfig(): SocketServerConfig {
    return {
      port: parseInt(env.SOCKET_PORT || "4001", 10),
      cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"],
        credentials: true,
      },
      redis: env.REDIS_URL
        ? {
            host: env.REDIS_HOST || "localhost",
            port: parseInt(env.REDIS_PORT || "6379", 10),
            password: env.REDIS_PASSWORD,
            db: parseInt(env.REDIS_DB || "0", 10),
            keyPrefix: "socket:",
          }
        : undefined,
      pingTimeout: 60000, // 60초
      pingInterval: 25000, // 25초
    };
  }

  /**
   * Socket.io 서버 인스턴스 생성 및 초기화
   * Singleton 패턴으로 단일 인스턴스 보장
   */
  public static async createServer(
    httpServer: HttpServer
  ): Promise<TypedServer> {
    if (SocketConfig.instance) {
      return SocketConfig.instance;
    }

    const config = SocketConfig.createConfig();

    // Socket.io 서버 생성
    const io: TypedServer = new SocketServer<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(httpServer, {
      cors: config.cors,
      pingTimeout: config.pingTimeout,
      pingInterval: config.pingInterval,
      transports: ["websocket", "polling"],
      allowEIO3: true, // Socket.io v3 호환성
    });

    // Redis 어댑터 설정 (클러스터링 지원) - 개발 환경에서는 스킵
    if (config.redis && env.NODE_ENV === "production") {
      try {
        const pubClient = createClient({
          socket: {
            host: config.redis.host,
            port: config.redis.port,
          },
          password: config.redis.password,
          database: config.redis.db,
        });

        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);

        io.adapter(
          createAdapter(pubClient, subClient, {
            key: config.redis.keyPrefix,
          })
        );

        console.log("✅ Redis 어댑터가 설정되었습니다.");
      } catch (error) {
        console.error("❌ Redis 어댑터 설정 실패:", error);
        console.log("📌 메모리 어댑터로 대체하여 실행합니다.");
      }
    } else {
      console.log("📌 개발 환경: 메모리 어댑터 사용");
    }

    // 기본 네임스페이스 설정
    io.on("connection", socket => {
      console.log(`🔌 새 연결: ${socket.id}`);

      // 연결 확인 이벤트 전송
      socket.emit("connection_confirmed", {
        socketId: socket.id,
        timestamp: Date.now(),
      });
    });

    // 에러 핸들링
    io.engine.on("connection_error", err => {
      console.error("Socket.io 연결 에러:", err);
    });

    SocketConfig.instance = io;
    console.log(
      `🚀 Socket.io 서버가 포트 ${config.port}에서 초기화되었습니다.`
    );

    return io;
  }

  /**
   * 기존 Socket.io 서버 인스턴스 반환
   */
  public static getInstance(): TypedServer | null {
    return SocketConfig.instance;
  }

  /**
   * Socket.io 서버 종료
   */
  public static async closeServer(): Promise<void> {
    if (SocketConfig.instance) {
      await SocketConfig.instance.close();
      SocketConfig.instance = null;
      console.log("🔌 Socket.io 서버가 종료되었습니다.");
    }
  }
}

/**
 * Socket.io CORS 설정 헬퍼
 */
export const createCorsConfig = (allowedOrigins: string[]) => ({
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // 개발 환경에서는 origin이 undefined일 수 있음 (Postman 등)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS 정책에 의해 차단됨"));
    }
  },
  credentials: true,
});

/**
 * Socket.io 미들웨어 타입
 */
export type SocketMiddleware = (
  socket: TypedSocket,
  next: (err?: Error) => void
) => void;

/**
 * 인증 미들웨어 생성 함수
 */
export const createAuthMiddleware = (): SocketMiddleware => {
  return (socket, next) => {
    try {
      // JWT 토큰 검증 로직 (향후 구현)
      const token =
        socket.handshake.auth?.token || socket.handshake.headers?.authorization;

      if (!token) {
        // 개발 환경에서는 게스트 접속 허용
        if (env.NODE_ENV === "development") {
          socket.data.userId = `guest_${socket.id}`;
          socket.data.userName = "게스트";
          socket.data.joinedRooms = new Set();
          socket.data.lastActivity = Date.now();
          return next();
        }

        return next(new Error("인증 토큰이 필요합니다"));
      }

      // 여기서 실제 JWT 검증 로직 구현
      // 임시로 기본값 설정
      socket.data.userId = "user_" + Date.now();
      socket.data.userName = "사용자";
      socket.data.joinedRooms = new Set();
      socket.data.lastActivity = Date.now();

      next();
    } catch {
      next(new Error("인증 실패"));
    }
  };
};

/**
 * 로깅 미들웨어
 */
export const createLoggingMiddleware = (): SocketMiddleware => {
  return (socket, next) => {
    const startTime = Date.now();

    socket.onAny((eventName: string, ...args: unknown[]) => {
      const duration = Date.now() - startTime;
      console.log(
        `📡 [${socket.id}] ${eventName} (${duration}ms)`,
        args.length > 0 ? args[0] : ""
      );
    });

    next();
  };
};

/**
 * Rate Limiting 미들웨어
 */
export const createRateLimitMiddleware = (
  maxEvents = 100,
  windowMs = 60000
): SocketMiddleware => {
  const clients = new Map<string, { count: number; resetTime: number }>();

  return (socket, next) => {
    const now = Date.now();
    const clientId = socket.handshake.address;
    const client = clients.get(clientId);

    if (!client || now > client.resetTime) {
      clients.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (client.count >= maxEvents) {
      return next(new Error("Rate limit exceeded"));
    }

    client.count++;
    next();
  };
};
