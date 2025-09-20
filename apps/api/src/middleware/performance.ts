/**
 * 성능 최적화 미들웨어
 *
 * @description
 * - API 성능 최적화를 위한 미들웨어들
 * - 캐싱, 압축, 요청 최적화 등
 * - SRP: 각 미들웨어는 특정 성능 최적화 작업만 담당
 */

import { Request, Response, NextFunction } from "express";
import { performance } from "perf_hooks";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

/**
 * 응답 시간 측정 미들웨어
 *
 * @description
 * - API 응답 시간을 측정하고 로깅
 * - 성능 모니터링을 위한 메트릭 수집
 * - 느린 요청 감지 및 알림
 */
export function responseTimeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = performance.now();

  // 응답 완료 시 실행
  res.on("finish", () => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    // 응답 시간 로깅
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration.toFixed(2)}ms`);

    // 느린 요청 감지 (1초 이상)
    if (duration > 1000) {
      console.warn(`Slow request detected: ${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
    }

    // 성능 메트릭 전송 (예: 분석 서비스)
    if (process.env.NODE_ENV === "production") {
      // TODO: 성능 메트릭을 분석 서비스로 전송
      // sendMetricsToAnalytics({
      //   method: req.method,
      //   path: req.path,
      //   statusCode: res.statusCode,
      //   duration,
      //   timestamp: new Date().toISOString(),
      // });
    }
  });

  next();
}

/**
 * 메모리 사용량 모니터링 미들웨어
 *
 * @description
 * - 메모리 사용량을 모니터링하고 로깅
 * - 메모리 누수 감지
 * - 가비지 컬렉션 트리거
 */
export function memoryMonitoringMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024),
  };

  // 메모리 사용량이 높은 경우 경고
  if (memUsageMB.heapUsed > 500) { // 500MB 이상
    console.warn(`High memory usage detected: ${JSON.stringify(memUsageMB)}`);
    
    // 가비지 컬렉션 강제 실행
    if (global.gc) {
      global.gc();
      console.log("Garbage collection triggered");
    }
  }

  // 메모리 사용량을 응답 헤더에 추가 (개발 환경에서만)
  if (process.env.NODE_ENV === "development") {
    res.set("X-Memory-Usage", JSON.stringify(memUsageMB));
  }

  next();
}

/**
 * 쿼리 최적화 미들웨어
 *
 * @description
 * - 데이터베이스 쿼리 최적화
 * - N+1 문제 감지
 * - 쿼리 성능 모니터링
 */
export function queryOptimizationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const originalQuery = console.log;
  const queryLog: string[] = [];

  // Prisma 쿼리 로깅 오버라이드
  if (process.env.NODE_ENV === "development") {
    console.log = (...args) => {
      if (args[0] && typeof args[0] === "string" && args[0].includes("prisma:query")) {
        queryLog.push(args[0]);
      }
      originalQuery(...args);
    };
  }

  // 응답 완료 시 쿼리 분석
  res.on("finish", () => {
    if (queryLog.length > 0) {
      console.log(`Query count for ${req.method} ${req.path}: ${queryLog.length}`);
      
      // N+1 문제 감지 (같은 쿼리가 여러 번 실행되는 경우)
      const queryCounts = queryLog.reduce((acc, query) => {
        const queryType = query.split(" ")[1]; // SELECT, INSERT, UPDATE, DELETE
        acc[queryType] = (acc[queryType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(queryCounts).forEach(([type, count]) => {
        if (count > 10) { // 10개 이상의 같은 쿼리
          console.warn(`Potential N+1 problem detected: ${count} ${type} queries`);
        }
      });
    }
  });

  next();
}

/**
 * 압축 미들웨어 설정
 *
 * @description
 * - 응답 데이터 압축으로 전송량 최적화
 * - Gzip 압축 설정
 * - 압축 레벨 및 필터 설정
 */
export const compressionMiddleware = compression({
  // 압축 레벨 (1-9, 6이 기본값)
  level: 6,
  
  // 압축할 MIME 타입
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    
    // JSON, HTML, CSS, JS 등 압축
    const contentType = res.getHeader("content-type") as string;
    return /json|html|css|javascript|text/.test(contentType || "");
  },
  
  // 압축 임계값 (1KB 이상만 압축)
  threshold: 1024,
});

/**
 * 보안 헤더 미들웨어
 *
 * @description
 * - 보안 헤더 설정으로 성능과 보안 최적화
 * - CSP, HSTS 등 보안 정책 설정
 * - 캐싱 정책 설정
 */
export const securityHeadersMiddleware = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000,
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
});

/**
 * Rate Limiting 미들웨어
 *
 * @description
 * - API 요청 제한으로 서버 보호
 * - DDoS 공격 방지
 * - 공정한 리소스 사용 보장
 */
export const rateLimitMiddleware = rateLimit({
  // 시간 윈도우 (15분)
  windowMs: 15 * 60 * 1000,
  
  // 최대 요청 수
  max: 100,
  
  // 메시지
  message: {
    success: false,
    message: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.",
  },
  
  // 표준 헤더 설정
  standardHeaders: true,
  legacyHeaders: false,
  
  // IP별 제한
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || "unknown";
  },
  
  // 스킵 조건 (개발 환경에서 스킵)
  skip: (req) => {
    return process.env.NODE_ENV === "development" && req.ip === "::1";
  },
});

/**
 * 캐시 헤더 미들웨어
 *
 * @description
 * - 적절한 캐시 헤더 설정
 * - 정적 리소스 캐싱 최적화
 * - API 응답 캐싱 설정
 */
export function cacheHeadersMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 정적 리소스 캐싱
  if (req.path.startsWith("/static/") || req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
    res.set({
      "Cache-Control": "public, max-age=31536000", // 1년
      "Expires": new Date(Date.now() + 31536000000).toUTCString(),
    });
  }
  // API 응답 캐싱
  else if (req.path.startsWith("/api/")) {
    // GET 요청만 캐싱
    if (req.method === "GET") {
      res.set({
        "Cache-Control": "public, max-age=300", // 5분
        "ETag": `"${Date.now()}"`,
      });
    }
    // POST, PUT, DELETE 요청은 캐싱하지 않음
    else {
      res.set({
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      });
    }
  }

  next();
}

/**
 * 요청 크기 제한 미들웨어
 *
 * @description
 * - 요청 본문 크기 제한
 * - 메모리 사용량 제한
 * - DoS 공격 방지
 */
export function requestSizeLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const contentLength = parseInt(req.headers["content-length"] || "0");
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      message: "요청 크기가 너무 큽니다. 최대 10MB까지 허용됩니다.",
    });
  }

  next();
}

/**
 * 성능 최적화 미들웨어 조합
 *
 * @description
 * - 모든 성능 최적화 미들웨어를 조합
 * - 순서가 중요한 미들웨어들의 올바른 순서 보장
 */
export const performanceMiddlewares = [
  // 1. 보안 헤더 (가장 먼저)
  securityHeadersMiddleware,
  
  // 2. 압축 (응답 크기 최적화)
  compressionMiddleware,
  
  // 3. 캐시 헤더 (캐싱 정책 설정)
  cacheHeadersMiddleware,
  
  // 4. Rate Limiting (요청 제한)
  rateLimitMiddleware,
  
  // 5. 요청 크기 제한
  requestSizeLimitMiddleware,
  
  // 6. 성능 모니터링
  responseTimeMiddleware,
  memoryMonitoringMiddleware,
  queryOptimizationMiddleware,
];
