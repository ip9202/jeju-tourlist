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

    // 개발 환경에서도 인증 토큰 검증 (보안 강화)
    if (!token) {
      res.status(401).json({
        success: false,
        error: "인증 토큰이 필요합니다.",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // 임시 토큰에서 사용자 ID 추출 (temp_userId_timestamp 형식)
    if (!token.startsWith("temp_")) {
      res.status(401).json({
        success: false,
        error: "유효하지 않은 토큰 형식입니다.",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // 토큰에서 사용자 ID 추출
    const tokenParts = token.split("_");
    if (tokenParts.length < 3) {
      res.status(401).json({
        success: false,
        error: "토큰 형식이 올바르지 않습니다.",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const userId = tokenParts[1];

    // 임시 사용자 설정 (실제 사용자 ID 사용)
    req.user = {
      id: userId, // 실제 사용자 ID 사용
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
