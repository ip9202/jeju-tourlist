import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

/**
 * Rate Limiting 미들웨어
 *
 * @description
 * - API 요청 빈도를 제한하여 서버 보호
 * - DDoS 공격 및 과도한 요청 방지
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 */

/**
 * 일반 API 요청 제한 (15분에 100회)
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100회 요청
  message: {
    success: false,
    error: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.",
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.",
      message: "Rate limit exceeded. Please try again later.",
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * 인증 관련 요청 제한 (15분에 5회)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5회 요청
  message: {
    success: false,
    error: "인증 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "인증 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
      message: "Authentication rate limit exceeded. Please try again later.",
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * 질문/답변 생성 제한 (1시간에 10회)
 */
export const createContentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 10, // 최대 10회 요청
  message: {
    success: false,
    error: "콘텐츠 생성 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "콘텐츠 생성 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
      message: "Content creation rate limit exceeded. Please try again later.",
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * 검색 요청 제한 (1분에 30회)
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 30, // 최대 30회 요청
  message: {
    success: false,
    error: "검색 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "검색 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
      message: "Search rate limit exceeded. Please try again later.",
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * 사용자별 요청 제한 (IP 기반)
 */
export const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 200, // 최대 200회 요청
  keyGenerator: (req: Request) => {
    // IP 주소 기반으로 제한
    return req.ip || req.connection.remoteAddress || "unknown";
  },
  message: {
    success: false,
    error: "사용자 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "사용자 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
      message: "User rate limit exceeded. Please try again later.",
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * 관리자 요청 제한 (더 관대한 제한)
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 500, // 최대 500회 요청
  message: {
    success: false,
    error: "관리자 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "관리자 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
      message: "Admin rate limit exceeded. Please try again later.",
      timestamp: new Date().toISOString(),
    });
  },
});
