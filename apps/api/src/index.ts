import "dotenv-flow/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env, validateEnv } from "@jeju-tourlist/config";
import { ErrorHandler } from "./middleware/errorHandler";
import healthRoutes from "./routes/health";
import { createAuthRouter } from "./routes/auth";
import { createUserRouter } from "./routes/user";

// 환경변수 검증
const validation = validateEnv();
if (!validation.success) {
  console.error("❌ 환경변수 검증 실패:", validation.error);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;

// 미들웨어 설정
app.use(helmet());
app.use(
  cors({
    origin: env.NEXTAUTH_URL,
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use("/health", healthRoutes);
app.use("/api/auth", createAuthRouter());
app.use("/api/users", createUserRouter());

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
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});
