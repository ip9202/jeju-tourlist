import { Request, Response, NextFunction } from "express";
import { User } from "@jeju-tourlist/types";
import { AuthService } from "../services/auth/AuthService";

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
export class AuthMiddleware {
  constructor(private readonly authService: AuthService) {}

  /**
   * JWT 토큰 검증 미들웨어
   */
  authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = this.extractToken(req);

      if (!token) {
        res.status(401).json({
          success: false,
          error: {
            code: "MISSING_TOKEN",
            message: "인증 토큰이 필요합니다.",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await this.authService.validateToken(token);

      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "유효하지 않은 토큰입니다.",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      req.user = user;
      next();
    } catch {
      res.status(500).json({
        success: false,
        error: {
          code: "AUTH_ERROR",
          message: "인증 처리 중 오류가 발생했습니다.",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
   */
  optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = this.extractToken(req);

      if (token) {
        const user = await this.authService.validateToken(token);
        if (user) {
          req.user = user;
        }
      }

      next();
    } catch {
      // 선택적 인증이므로 에러가 발생해도 다음으로 진행
      next();
    }
  };

  /**
   * 역할 기반 접근 제어 미들웨어
   */
  requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "인증이 필요합니다.",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!allowedRoles.includes((req.user as any).role)) {
        res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "접근 권한이 없습니다.",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      next();
    };
  };

  /**
   * 관리자 권한 확인 미들웨어
   */
  requireAdmin = this.requireRole(["admin"]);

  /**
   * 모더레이터 이상 권한 확인 미들웨어
   */
  requireModerator = this.requireRole(["admin", "moderator"]);

  /**
   * 사용자 본인 또는 관리자 확인 미들웨어
   */
  requireOwnershipOrAdmin = (userIdParam: string = "userId") => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "인증이 필요합니다.",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const targetUserId = req.params[userIdParam];
      const isOwner = (req.user as any).id === targetUserId;
      const isAdmin = (req.user as any).role === "admin";

      if (!isOwner && !isAdmin) {
        res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "본인의 정보만 접근할 수 있습니다.",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      next();
    };
  };

  /**
   * 요청에서 JWT 토큰 추출
   */
  private extractToken(req: Request): string | null {
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
}

/**
 * 인증 미들웨어 팩토리 함수
 */
export function createAuthMiddleware(authService: AuthService): AuthMiddleware {
  return new AuthMiddleware(authService);
}
