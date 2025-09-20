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
