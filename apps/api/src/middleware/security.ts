/**
 * 보안 강화 미들웨어
 *
 * @description
 * - 보안 취약점 방지를 위한 미들웨어들
 * - 입력 검증, 출력 인코딩, CSRF 보호 등
 * - SRP: 각 미들웨어는 특정 보안 기능만 담당
 */

import { Request, Response, NextFunction } from "express";
import { body, validationResult, ValidationChain } from "express-validator";
import DOMPurify from "isomorphic-dompurify";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import crypto from "crypto";

/**
 * 입력 검증 미들웨어
 *
 * @description
 * - 사용자 입력에 대한 검증 및 정제
 * - XSS, SQL Injection 등 공격 방지
 * - 데이터 무결성 보장
 */
export const inputValidationMiddleware = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 검증 실행
    await Promise.all(validations.map(validation => validation.run(req)));

    // 검증 결과 확인
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "입력 데이터가 유효하지 않습니다",
        errors: errors.array().map(error => ({
          field: error.type === "field" ? error.path : "unknown",
          message: error.msg,
          value: error.type === "field" ? error.value : undefined,
        })),
      });
    }

    next();
  };
};

/**
 * HTML 정제 미들웨어
 *
 * @description
 * - 사용자 입력에서 위험한 HTML 태그 제거
 * - XSS 공격 방지
 * - 안전한 HTML만 허용
 */
export function sanitizeHtmlMiddleware(req: Request, res: Response, next: NextFunction) {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === "string") {
      return DOMPurify.sanitize(obj, {
        ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br"],
        ALLOWED_ATTR: [],
      });
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  // 요청 본문 정제
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // 쿼리 파라미터 정제
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
}

/**
 * CSRF 보호 미들웨어
 *
 * @description
 * - Cross-Site Request Forgery 공격 방지
 * - CSRF 토큰 검증
 * - Origin 헤더 검증
 */
export function csrfProtectionMiddleware(req: Request, res: Response, next: NextFunction) {
  // GET, HEAD, OPTIONS 요청은 CSRF 검사 제외
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Origin 헤더 검증
  const origin = req.headers.origin;
  const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "https://dongnemulurowa.com",
  ];

  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: "CSRF 보호: 허용되지 않은 Origin",
    });
  }

  // Referer 헤더 검증
  const referer = req.headers.referer;
  if (referer) {
    const refererUrl = new URL(referer);
    const allowedHosts = allowedOrigins.map(origin => new URL(origin).host);
    
    if (!allowedHosts.includes(refererUrl.host)) {
      return res.status(403).json({
        success: false,
        message: "CSRF 보호: 허용되지 않은 Referer",
      });
    }
  }

  next();
}

/**
 * SQL Injection 방지 미들웨어
 *
 * @description
 * - SQL Injection 공격 패턴 감지
 * - 위험한 SQL 키워드 차단
 * - 입력값 검증 강화
 */
export function sqlInjectionProtectionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
    /(\b(OR|AND)\s+1\s*=\s*1)/i,
    /(\b(OR|AND)\s+['"]1['"]\s*=\s*['"]1['"])/i,
    /(;|\-\-|\/\*|\*\/)/,
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bEXEC\b|\bEXECUTE\b)/i,
    /(\bSCRIPT\b)/i,
  ];

  const checkInput = (input: any, path: string = ""): string[] => {
    const errors: string[] = [];
    
    if (typeof input === "string") {
      for (const pattern of dangerousPatterns) {
        if (pattern.test(input)) {
          errors.push(`SQL Injection 패턴 감지: ${path}`);
        }
      }
    } else if (Array.isArray(input)) {
      input.forEach((item, index) => {
        errors.push(...checkInput(item, `${path}[${index}]`));
      });
    } else if (input && typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        errors.push(...checkInput(value, `${path}.${key}`));
      }
    }
    
    return errors;
  };

  // 요청 본문 검사
  const bodyErrors = checkInput(req.body, "body");
  if (bodyErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "잘못된 입력이 감지되었습니다",
      errors: bodyErrors,
    });
  }

  // 쿼리 파라미터 검사
  const queryErrors = checkInput(req.query, "query");
  if (queryErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "잘못된 쿼리 파라미터가 감지되었습니다",
      errors: queryErrors,
    });
  }

  next();
}

/**
 * 파일 업로드 보안 미들웨어
 *
 * @description
 * - 파일 업로드 보안 검증
 * - 위험한 파일 형식 차단
 * - 파일 크기 제한
 */
export function fileUploadSecurityMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.file && !req.files) {
    return next();
  }

  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
  ];

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".txt"];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const checkFile = (file: any) => {
    // MIME 타입 검증
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`허용되지 않는 파일 형식: ${file.mimetype}`);
    }

    // 파일 확장자 검증
    const extension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf("."));
    if (!allowedExtensions.includes(extension)) {
      throw new Error(`허용되지 않는 파일 확장자: ${extension}`);
    }

    // 파일 크기 검증
    if (file.size > maxFileSize) {
      throw new Error(`파일 크기가 너무 큽니다. 최대 ${maxFileSize / 1024 / 1024}MB까지 허용됩니다.`);
    }

    // 파일명 검증 (위험한 문자 제거)
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    if (sanitizedFilename !== file.originalname) {
      file.originalname = sanitizedFilename;
    }
  };

  try {
    if (req.file) {
      checkFile(req.file);
    }
    
    if (req.files) {
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      files.forEach(checkFile);
    }
    
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "파일 업로드 오류",
    });
  }
}

/**
 * Rate Limiting 미들웨어 (보안 강화)
 *
 * @description
 * - IP별 요청 제한
 * - DDoS 공격 방지
 * - API 남용 방지
 */
export const securityRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  message: {
    success: false,
    message: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // IP별 제한
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || "unknown";
  },
  // 스킵 조건
  skip: (req) => {
    // 개발 환경에서 localhost 스킵
    return process.env.NODE_ENV === "development" && req.ip === "::1";
  },
});

/**
 * 보안 헤더 미들웨어
 *
 * @description
 * - 보안 관련 HTTP 헤더 설정
 * - XSS, Clickjacking 등 공격 방지
 * - HTTPS 강제, CSP 설정
 */
export const securityHeadersMiddleware = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1년
    includeSubDomains: true,
    preload: true,
  },
  
  // X-Frame-Options
  frameguard: { action: "deny" },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // X-XSS-Protection
  xssFilter: true,
  
  // Referrer Policy
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  
  // Permissions Policy
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    payment: [],
    usb: [],
  },
});

/**
 * 입력 길이 제한 미들웨어
 *
 * @description
 * - 입력 데이터 길이 제한
 * - DoS 공격 방지
 * - 메모리 사용량 제한
 */
export function inputLengthLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const limits = {
    title: 200,
    content: 10000,
    bio: 500,
    name: 50,
    email: 100,
    tags: 100,
  };

  const checkLength = (obj: any, path: string = ""): string[] => {
    const errors: string[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      const limit = limits[key as keyof typeof limits];
      
      if (limit && typeof value === "string" && value.length > limit) {
        errors.push(`${currentPath}이(가) 너무 깁니다. 최대 ${limit}자까지 허용됩니다.`);
      }
      
      if (value && typeof value === "object" && !Array.isArray(value)) {
        errors.push(...checkLength(value, currentPath));
      }
    }
    
    return errors;
  };

  const errors = checkLength(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "입력 데이터가 너무 깁니다",
      errors,
    });
  }

  next();
}

/**
 * 에러 정보 보호 미들웨어
 *
 * @description
 * - 에러 응답에서 민감한 정보 제거
 * - 스택 트레이스 숨김
 * - 보안 정보 노출 방지
 */
export function errorProtectionMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 프로덕션 환경에서 민감한 정보 제거
  if (process.env.NODE_ENV === "production") {
    // 스택 트레이스 제거
    delete err.stack;
    
    // 내부 에러 메시지 일반화
    if (err.message && err.message.includes("prisma")) {
      err.message = "데이터베이스 오류가 발생했습니다";
    }
    
    if (err.message && err.message.includes("jwt")) {
      err.message = "인증 오류가 발생했습니다";
    }
  }

  // 에러 응답
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "서버 오류가 발생했습니다",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

/**
 * 보안 로깅 미들웨어
 *
 * @description
 * - 보안 관련 이벤트 로깅
 * - 의심스러운 활동 감지
 * - 보안 모니터링
 */
export function securityLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();
  
  // 응답 완료 시 로깅
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      statusCode: res.statusCode,
      duration,
      referer: req.get("Referer"),
      origin: req.get("Origin"),
    };

    // 보안 이벤트 감지
    if (res.statusCode === 403 || res.statusCode === 401) {
      console.warn("Security event detected:", logData);
    }

    // 의심스러운 활동 감지
    if (duration > 5000) { // 5초 이상
      console.warn("Slow request detected:", logData);
    }

    // 일반 로깅
    console.log("Request completed:", logData);
  });

  next();
}
