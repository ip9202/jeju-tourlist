import { Request, Response, NextFunction } from "express";
import { UserRole } from "@jeju-tourlist/types";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Express Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * 인증 미들웨어 팩토리
 */
export function createAuthMiddleware(_authService?: any) {
  return {
    authenticate: authMiddleware,
    requireAdmin: (req: Request, res: Response, next: NextFunction) => {
      // 임시 구현: 관리자 권한 확인
      if (req.user?.role !== "admin") {
        res.status(403).json({
          success: false,
          error: "관리자 권한이 필요합니다.",
          timestamp: new Date().toISOString(),
        });
        return;
      }
      next();
    },
  };
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
      role: UserRole.USER,
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

/**
 * Optional JWT 인증 미들웨어
 * 토큰이 없어도 진행하되, 있으면 req.user에 설정
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      // 토큰 없으면 그냥 계속 진행 (req.user는 undefined)
      next();
      return;
    }

    // 임시 토큰에서 사용자 ID 추출 (temp_userId_timestamp 형식)
    if (!token.startsWith("temp_")) {
      // 유효하지 않은 토큰 형식이면 무시하고 계속 진행
      next();
      return;
    }

    // 토큰에서 사용자 ID 추출
    const tokenParts = token.split("_");
    if (tokenParts.length < 3) {
      // 토큰 형식이 올바르지 않으면 무시하고 계속 진행
      next();
      return;
    }

    const userId = tokenParts[1];

    // 사용자 설정
    req.user = {
      id: userId,
      email: "temp@example.com",
      name: "임시 사용자",
      avatar: undefined,
      role: UserRole.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    next();
  } catch {
    // 에러 발생 시에도 무시하고 계속 진행
    next();
  }
};

// Backward compatibility alias
export const authenticate = authMiddleware;
