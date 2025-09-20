import { Request, Response, NextFunction } from "express";
import { ResponseHelper } from "../utils/response";
import { env } from "@jeju-tourlist/config";

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
