import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { ResponseHelper } from "../utils/response";

// 유효성 검사 미들웨어 (SRP: 단일 책임 원칙)
export class ValidationMiddleware {
  // 요청 본문 검증
  static validateBody(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessage = error.issues
            .map((err: any) => `${err.path.join(".")}: ${err.message}`)
            .join(", ");
          ResponseHelper.badRequest(res, `유효성 검사 실패: ${errorMessage}`);
        } else {
          ResponseHelper.badRequest(res, "유효하지 않은 요청 데이터입니다");
        }
      }
    };
  }

  // 쿼리 파라미터 검증
  static validateQuery(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        req.query = schema.parse(req.query) as any;
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessage = error.issues
            .map((err: any) => `${err.path.join(".")}: ${err.message}`)
            .join(", ");
          ResponseHelper.badRequest(
            res,
            `쿼리 파라미터 검증 실패: ${errorMessage}`
          );
        } else {
          ResponseHelper.badRequest(res, "유효하지 않은 쿼리 파라미터입니다");
        }
      }
    };
  }

  // URL 파라미터 검증
  static validateParams(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        req.params = schema.parse(req.params) as any;
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessage = error.issues
            .map((err: any) => `${err.path.join(".")}: ${err.message}`)
            .join(", ");
          ResponseHelper.badRequest(
            res,
            `URL 파라미터 검증 실패: ${errorMessage}`
          );
        } else {
          ResponseHelper.badRequest(res, "유효하지 않은 URL 파라미터입니다");
        }
      }
    };
  }
}
