import { Response } from "express";
import { ApiResponse, ApiError } from "../types";

// 성공 응답 헬퍼 (SRP: 단일 책임 원칙)
export class ResponseHelper {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    error: string,
    message: string,
    statusCode: number = 500,
    details?: any
  ): void {
    const response: ApiError = {
      success: false,
      error,
      message,
      timestamp: new Date().toISOString(),
      details,
    };
    res.status(statusCode).json(response);
  }

  static notFound(
    res: Response,
    message: string = "리소스를 찾을 수 없습니다"
  ): void {
    this.error(res, "Not Found", message, 404);
  }

  static badRequest(
    res: Response,
    message: string = "잘못된 요청입니다"
  ): void {
    this.error(res, "Bad Request", message, 400);
  }

  static unauthorized(
    res: Response,
    message: string = "인증이 필요합니다"
  ): void {
    this.error(res, "Unauthorized", message, 401);
  }

  static forbidden(res: Response, message: string = "권한이 없습니다"): void {
    this.error(res, "Forbidden", message, 403);
  }

  static internalError(
    res: Response,
    message: string = "서버 내부 오류가 발생했습니다"
  ): void {
    this.error(res, "Internal Server Error", message, 500);
  }
}

// 간단한 응답 생성 함수 (기존 코드 호환성을 위해)
export function createResponse<T>(
  success: boolean,
  message: string,
  data?: T,
  error?: string
): ApiResponse<T> | ApiError {
  if (success) {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  } else {
    return {
      success: false,
      error: error || 'Unknown Error',
      message,
      timestamp: new Date().toISOString(),
    };
  }
}
