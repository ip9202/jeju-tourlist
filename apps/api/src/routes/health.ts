import { Router } from "express";
import { ResponseHelper } from "../utils/response";
// 환경변수 설정
const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/jeju_tourlist',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'your-super-secret-key-here-must-be-at-least-32-characters-long',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:4000',
  SOCKET_URL: process.env.SOCKET_URL || 'http://localhost:4001',
  SOCKET_PORT: process.env.SOCKET_PORT || '4001',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || '6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DB: process.env.REDIS_DB || '0',
};

const router: Router = Router();

// 헬스 체크 라우트 (SRP: 단일 책임 원칙)
router.get("/", (req, res) => {
  ResponseHelper.success(
    res,
    {
      status: "healthy",
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    },
    "서버가 정상적으로 작동 중입니다"
  );
});

// 상세 헬스 체크 (개발 환경에서만)
router.get("/detailed", (req, res) => {
  if (env.NODE_ENV !== "development") {
    return ResponseHelper.forbidden(
      res,
      "상세 헬스 체크는 개발 환경에서만 사용 가능합니다"
    );
  }

  ResponseHelper.success(
    res,
    {
      status: "healthy",
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    "상세 서버 상태 정보"
  );
});

export default router;
