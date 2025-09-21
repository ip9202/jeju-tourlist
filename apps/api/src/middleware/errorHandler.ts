import { Request, Response, NextFunction } from "express";
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

// 에러 핸들링 미들웨어 (SRP: 단일 책임 원칙)
export class ErrorHandler {
  static handle(
    error: Error,
    req: Request,
    res: Response,
    _next: NextFunction
  ): void {
    console.error("❌ 에러 발생:", {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });

    // 개발 환경에서는 상세한 에러 정보 제공
    if (env.NODE_ENV === "development") {
      ResponseHelper.error(res, error.name || "Error", error.message, 500, {
        stack: error.stack,
      });
    } else {
      ResponseHelper.internalError(res);
    }
  }

  // 404 핸들러
  static notFound(req: Request, res: Response, _next: NextFunction): void {
    ResponseHelper.notFound(res, `경로를 찾을 수 없습니다: ${req.originalUrl}`);
  }

  // 비동기 에러 래퍼 (async/await 에러 처리)
  static asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}
