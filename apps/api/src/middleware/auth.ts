import { Request, Response, NextFunction } from "express";
import { User } from "@jeju-tourlist/types";

// Express Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * JWT 인증 미들웨어
 * Single Responsibility Principle: 인증 검증만 담당
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    // 개발 환경에서는 토큰 없이도 동작 (임시 처리)
    if (!token && process.env.NODE_ENV === "development") {
      console.log("[Auth] 개발 환경 - 실제 사용자로 인증 우회");
      req.user = {
        id: "cmgivfdih000021pz0w3uxk36", // 실제 사용자 ID 사용
        email: "test1@jeju.com",
        name: "김제주",
        avatar: undefined,
        role: "user",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      next();
      return;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: "인증 토큰이 필요합니다.",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // TODO: 실제 JWT 검증 로직 구현
    // 임시로 더미 사용자 설정
    req.user = {
      id: "temp-user-id",
      email: "temp@example.com",
      name: "임시 사용자",
      avatar: undefined,
      role: "user",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    next();
  } catch {
    res.status(500).json({
      success: false,
      error: "인증 처리 중 오류가 발생했습니다.",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * 요청에서 JWT 토큰 추출
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // 쿠키에서 토큰 추출 (선택적)
  const cookieToken = req.cookies?.accessToken;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

// Backward compatibility alias
export const authenticate = authMiddleware;
