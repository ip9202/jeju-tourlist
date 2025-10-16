import "dotenv-flow/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import path from "path";
import rateLimit from "express-rate-limit";
// 환경변수 설정
const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://test:test@localhost:5433/asklocal_dev",
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

// 환경변수 검증 함수
function validateEnv() {
  const required = ["NODE_ENV", "DATABASE_URL", "NEXTAUTH_SECRET"];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    return {
      success: false,
      error: `Missing required environment variables: ${missing.join(", ")}`,
    };
  }

  return { success: true, error: null };
}
import { ErrorHandler } from "./middleware/errorHandler";
// import { generalLimiter } from "./middleware/rateLimiter";
// import { sanitizeInput } from "./middleware/validation";
import { swaggerSpec, swaggerUiOptions } from "./config/swagger";
import healthRoutes from "./routes/health";
import pointRoutes from "./routes/point";
import badgeRoutes from "./routes/badge";
import adminRoutes from "./routes/admin";
// import notificationRoutes from "./routes/notification";
import { PrismaClient } from "@prisma/client";
import { createQuestionRouter } from "./routes/question";
import { createAnswerRouter } from "./routes/answer";
import { createCategoryRouter } from "./routes/category";
import { createEmailAuthRouter } from "./routes/emailAuth";
import { createAnswerAdoptionRouter } from "./routes/answer-adoption";
import { createAnswerCommentRouter } from "./routes/answerComment";
import { createBatchSchedulerRouter } from "./routes/batch-scheduler";
import { createStatsRouter } from "./routes/stats";
import {
  SocketConfig,
  createAuthMiddleware,
  createLoggingMiddleware,
  createRateLimitMiddleware,
} from "./config/socket";
import uploadRoutes from "./routes/upload";
import { ConnectionManager } from "./services/socket/connectionManager";
import { StatsManager } from "./services/socket/statsManager";
import { RoomManager } from "./services/socket/roomManager";
import { NotificationManager } from "./services/socket/notificationManager";
import { SocketEventHandler } from "./services/socket/eventHandler";

// 환경변수 검증
const validation = validateEnv();
if (!validation.success) {
  console.error("❌ 환경변수 검증 실패:", validation.error);
  process.exit(1);
}

const app = express();
const httpServer = createServer(app); // HTTP 서버 생성
const PORT = process.env.PORT || 4000;

// Prisma 클라이언트 초기화
const prisma = new PrismaClient();

// 미들웨어 설정
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate Limiting 적용 (개발 환경용 완화된 설정)
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 100, // 최대 100 요청 (개발 환경용으로 완화)
  message: {
    success: false,
    error: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요.",
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => {
    // 헬스체크와 인증 관련 요청은 제외
    return req.path === "/health" || req.path.startsWith("/api/auth");
  },
});

app.use(generalLimiter);

// 입력값 정제 (XSS 방지) - 임시 비활성화
// app.use(
//   sanitizeInput(["title", "content", "name", "nickname", "bio", "location"])
// );

// Swagger API 문서
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions)
);

// 라우트 설정
app.use("/health", healthRoutes);

// API 라우트
app.use("/api/points", pointRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/admin", adminRoutes);
// app.use("/api/notifications", notificationRoutes);

// 질문/답변/카테고리 라우트 활성화
app.use("/api/questions", createQuestionRouter(prisma));
app.use("/api/answers", createAnswerRouter(prisma));
app.use("/api/answers", createAnswerAdoptionRouter(prisma));
app.use("/api/answer-comments", createAnswerCommentRouter(prisma));
app.use("/api/categories", createCategoryRouter(prisma));
app.use("/api/batch", createBatchSchedulerRouter(prisma));

// 이메일 기반 인증 라우트
app.use("/api/auth", createEmailAuthRouter());

// 통계 라우트
app.use("/api/stats", createStatsRouter(prisma));

// 파일 업로드 라우트
app.use("/api/upload", uploadRoutes);

// 업로드된 파일 정적 제공
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// TODO: Phase 7 테스트 후 활성화
// app.use("/api/auth", authLimiter, createAuthRouter());
// app.use("/api/users", createUserRouter());
// app.use("/api", createUserActivityRouter(prisma));

// API 라우트
app.get("/api", (req, res) => {
  res.json({
    message: "동네물어봐 API 서버",
    version: "1.0.0",
    environment: env.NODE_ENV,
  });
});

// 404 핸들러
app.use("*", ErrorHandler.notFound);

// 에러 핸들러
app.use(ErrorHandler.handle);

// Socket.io 서버 설정 및 초기화
async function startServer() {
  try {
    // Socket.io 서버 생성
    const io = await SocketConfig.createServer(httpServer);

    // Socket.io 미들웨어 설정
    io.use(createAuthMiddleware());
    io.use(createLoggingMiddleware());
    io.use(createRateLimitMiddleware(100, 60000)); // 분당 100개 이벤트 제한

    // Socket.io 서비스 매니저 초기화
    const roomManager = new RoomManager(io);
    const connectionManager = new ConnectionManager(io);
    const notificationManager = new NotificationManager(io);
    const statsManager = new StatsManager(io);
    const eventHandler = new SocketEventHandler(
      notificationManager,
      statsManager,
      roomManager,
      connectionManager
    );

    // Socket.io 연결 이벤트 핸들러
    io.on("connection", socket => {
      console.log(`🔌 새 소켓 연결: ${socket.id}`);

      // 연결 관리
      connectionManager.handleConnection(socket);

      // 모든 이벤트 핸들러 등록
      eventHandler.registerAllHandlers(socket);

      // 기본 룸 이벤트 핸들러 (기존 호환성 유지)
      socket.on("join_room", async data => {
        try {
          await roomManager.joinRoom(socket, data.roomId, data.userId);
        } catch {
          socket.emit("error", {
            message: "룸 참여 실패",
            code: "JOIN_ROOM_FAILED",
          });
        }
      });

      socket.on("leave_room", async data => {
        try {
          await roomManager.leaveRoom(socket, data.roomId, data.userId);
        } catch {
          socket.emit("error", {
            message: "룸 나가기 실패",
            code: "LEAVE_ROOM_FAILED",
          });
        }
      });
    });

    // HTTP 서버 시작
    httpServer.listen(PORT, () => {
      console.log(`🚀 API 서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`📊 환경: ${env.NODE_ENV}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`📚 API 문서: http://localhost:${PORT}/api-docs`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
      console.log(`⚡ Socket.io 서버가 동일한 포트에서 실행 중입니다.`);
    });

    // Graceful shutdown 처리
    process.on("SIGTERM", async () => {
      console.log("🛑 SIGTERM 신호 수신. 서버를 종료합니다...");
      statsManager.stop();
      await SocketConfig.closeServer();
      // await prisma.$disconnect();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      console.log("🛑 SIGINT 신호 수신. 서버를 종료합니다...");
      statsManager.stop();
      await SocketConfig.closeServer();
      // await prisma.$disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ 서버 시작 실패:", error);
    process.exit(1);
  }
}

// 서버 시작
startServer();
