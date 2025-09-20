import "dotenv-flow/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env, validateEnv } from "@jeju-tourlist/config";
import { ErrorHandler } from "./middleware/errorHandler";
import { generalLimiter, authLimiter } from "./middleware/rateLimiter";
import { sanitizeInput } from "./middleware/validation";
import { swaggerSpec, swaggerUiOptions } from "./config/swagger";
import healthRoutes from "./routes/health";
import { createAuthRouter } from "./routes/auth";
import { createUserRouter } from "./routes/user";
import { createQuestionRouter } from "./routes/question";
import { createAnswerRouter } from "./routes/answer";
import { createUserActivityRouter } from "./routes/userActivity";
import { PrismaClient } from "@prisma/client";

// 환경변수 검증
const validation = validateEnv();
if (!validation.success) {
  console.error("❌ 환경변수 검증 실패:", validation.error);
  process.exit(1);
}

const app = express();
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
    origin: env.NEXTAUTH_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate Limiting 적용
app.use(generalLimiter);

// 입력값 정제 (XSS 방지)
app.use(
  sanitizeInput(["title", "content", "name", "nickname", "bio", "location"])
);

// Swagger API 문서
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions)
);

// 라우트 설정
app.use("/health", healthRoutes);
app.use("/api/auth", authLimiter, createAuthRouter());
app.use("/api/users", createUserRouter());
app.use("/api/questions", createQuestionRouter(prisma));
app.use("/api/answers", createAnswerRouter(prisma));
app.use("/api", createUserActivityRouter(prisma));

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

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 API 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📊 환경: ${env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`📚 API 문서: http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});
