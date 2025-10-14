import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { ApiResponse } from "../types";

/**
 * 입력값 검증 미들웨어
 *
 * @description
 * - 요청 데이터의 유효성을 검증
 * - XSS, SQL Injection 등 보안 위협 방지
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 */

/**
 * Zod 스키마를 사용한 요청 데이터 검증
 *
 * @param schema - Zod 검증 스키마
 * @param target - 검증할 데이터 위치 ('body', 'query', 'params')
 * @returns Express 미들웨어 함수
 */
export function validateRequest(
  schema: ZodSchema,
  target: "body" | "query" | "params" = "body"
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[target];
      const validatedData = schema.parse(dataToValidate);

      // 검증된 데이터를 원래 위치에 다시 할당
      req[target] = validatedData;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: "입력 데이터가 올바르지 않습니다.",
          message: error.issues
            .map(e => `${e.path.join(".")}: ${e.message}`)
            .join(", "),
          timestamp: new Date().toISOString(),
        };
        return res.status(400).json(response);
      }

      const response: ApiResponse = {
        success: false,
        error: "데이터 검증 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };
      return res.status(500).json(response);
    }
  };
}

/**
 * HTML 태그 제거 및 XSS 방지
 *
 * @param text - 처리할 텍스트
 * @returns 정제된 텍스트
 */
export function sanitizeHtml(text: string): string {
  if (typeof text !== "string") return text;

  return text
    .replace(/[<>]/g, "") // 기본 HTML 태그 제거
    .replace(/javascript:/gi, "") // JavaScript URL 제거
    .replace(/on\w+=/gi, "") // 이벤트 핸들러 제거
    .trim();
}

/**
 * SQL Injection 방지를 위한 문자열 이스케이프
 *
 * @param str - 이스케이프할 문자열
 * @returns 이스케이프된 문자열
 */
export function escapeSql(str: string): string {
  if (typeof str !== "string") return str;

  return (
    str
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\0/g, "\\0")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      // eslint-disable-next-line no-control-regex
      .replace(/\x1A/g, "\\Z")
  );
}

/**
 * 이메일 형식 검증
 *
 * @param email - 검증할 이메일
 * @returns 유효한 이메일 여부
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * URL 형식 검증
 *
 * @param url - 검증할 URL
 * @returns 유효한 URL 여부
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 파일 확장자 검증
 *
 * @param filename - 검증할 파일명
 * @param allowedExtensions - 허용된 확장자 배열
 * @returns 유효한 파일 확장자 여부
 */
export function isValidFileExtension(
  filename: string,
  allowedExtensions: string[]
): boolean {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
}

/**
 * 파일 크기 검증
 *
 * @param fileSize - 파일 크기 (bytes)
 * @param maxSize - 최대 허용 크기 (bytes)
 * @returns 유효한 파일 크기 여부
 */
export function isValidFileSize(fileSize: number, maxSize: number): boolean {
  return fileSize <= maxSize;
}

/**
 * 비밀번호 강도 검증
 *
 * @param password - 검증할 비밀번호
 * @returns 비밀번호 강도 점수 (0-100)
 */
export function validatePasswordStrength(password: string): number {
  let score = 0;

  // 길이 검증
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;

  // 문자 종류 검증
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 10;

  // 복잡성 검증
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/.test(password)) {
    score += 20;
  }

  // 연속 문자 검증 (점수 차감)
  if (/(.)\1{2,}/.test(password)) score -= 10;

  // 일반적인 패턴 검증 (점수 차감)
  if (/123|abc|qwe|asd|zxc/i.test(password)) score -= 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * 사용자 입력 정제 미들웨어
 *
 * @param fields - 정제할 필드명 배열
 * @returns Express 미들웨어 함수
 */
export function sanitizeInput(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // body 데이터 정제
      if (req.body) {
        fields.forEach(field => {
          if (req.body[field] && typeof req.body[field] === "string") {
            req.body[field] = sanitizeHtml(req.body[field]);
          }
        });
      }

      // query 데이터 정제
      if (req.query) {
        Object.keys(req.query).forEach(key => {
          if (typeof req.query[key] === "string") {
            req.query[key] = sanitizeHtml(req.query[key] as string);
          }
        });
      }

      next();
    } catch {
      const response: ApiResponse = {
        success: false,
        error: "입력 데이터 정제 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      };
      return res.status(500).json(response);
    }
  };
}

/**
 * CORS 설정 검증
 *
 * @param origin - 요청 Origin
 * @param allowedOrigins - 허용된 Origin 배열
 * @returns 허용된 Origin 여부
 */
export function isValidOrigin(
  origin: string,
  allowedOrigins: string[]
): boolean {
  if (!origin) return false;

  return allowedOrigins.some(allowed => {
    if (allowed === "*") return true;
    if (allowed.includes("*")) {
      const pattern = allowed.replace(/\*/g, ".*");
      return new RegExp(`^${pattern}$`).test(origin);
    }
    return allowed === origin;
  });
}

/**
 * 요청 크기 제한 검증
 *
 * @param contentLength - 요청 크기
 * @param maxSize - 최대 허용 크기
 * @returns 유효한 요청 크기 여부
 */
export function isValidRequestSize(
  contentLength: number,
  maxSize: number
): boolean {
  return contentLength <= maxSize;
}
