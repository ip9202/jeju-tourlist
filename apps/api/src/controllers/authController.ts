import { Request, Response } from "express";
import { AuthService } from "../services/auth/AuthService";
import {
  LoginRequest,
  LoginResponse,
  AuthApiResponse,
} from "@jeju-tourlist/types";

/**
 * 인증 컨트롤러
 * Single Responsibility Principle: 인증 관련 HTTP 요청 처리만 담당
 */
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * OAuth 로그인
   * POST /api/auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginRequest: LoginRequest = req.body;

      // 입력 검증
      if (!loginRequest.provider) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_PROVIDER",
            message: "OAuth 제공업체가 필요합니다.",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      let result: LoginResponse;

      if (loginRequest.provider === "local") {
        // 로컬 로그인
        if (!loginRequest.email || !loginRequest.password) {
          res.status(400).json({
            success: false,
            error: {
              code: "MISSING_CREDENTIALS",
              message: "이메일과 비밀번호가 필요합니다.",
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }

        result = await this.authService.loginWithLocal(
          loginRequest.email,
          loginRequest.password
        );
      } else {
        // OAuth 로그인
        if (!loginRequest.code) {
          res.status(400).json({
            success: false,
            error: {
              code: "MISSING_AUTH_CODE",
              message: "인증 코드가 필요합니다.",
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }

        result = await this.authService.loginWithOAuth(loginRequest);
      }

      // 응답 설정
      res.status(200).json({
        success: true,
        data: result,
        message: result.isNewUser
          ? "회원가입이 완료되었습니다."
          : "로그인이 완료되었습니다.",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Login error:", error);

      const statusCode = this.getErrorStatusCode(error.code);
      const response: AuthApiResponse = {
        success: false,
        error: {
          code: error.code || "LOGIN_FAILED",
          message: error.message || "로그인에 실패했습니다.",
          details: error.details,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(statusCode).json(response);
    }
  };

  /**
   * 토큰 갱신
   * POST /api/auth/refresh
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_REFRESH_TOKEN",
            message: "리프레시 토큰이 필요합니다.",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: result,
        message: "토큰이 갱신되었습니다.",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Token refresh error:", error);

      const statusCode = this.getErrorStatusCode(error.code);
      const response: AuthApiResponse = {
        success: false,
        error: {
          code: error.code || "TOKEN_REFRESH_FAILED",
          message: error.message || "토큰 갱신에 실패했습니다.",
          details: error.details,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(statusCode).json(response);
    }
  };

  /**
   * 로그아웃
   * POST /api/auth/logout
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = this.extractToken(req);

      if (!token) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_TOKEN",
            message: "인증 토큰이 필요합니다.",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await this.authService.logout(token);

      res.status(200).json({
        success: true,
        message: "로그아웃이 완료되었습니다.",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Logout error:", error);

      const statusCode = this.getErrorStatusCode(error.code);
      const response: AuthApiResponse = {
        success: false,
        error: {
          code: error.code || "LOGOUT_FAILED",
          message: error.message || "로그아웃에 실패했습니다.",
          details: error.details,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(statusCode).json(response);
    }
  };

  /**
   * 현재 사용자 정보 조회
   * GET /api/auth/me
   */
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
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

      res.status(200).json({
        success: true,
        data: req.user,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Get current user error:", error);

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "사용자 정보 조회에 실패했습니다.",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * OAuth 제공업체 목록 조회
   * GET /api/auth/providers
   */
  getProviders = async (req: Request, res: Response): Promise<void> => {
    try {
      const providers = [
        {
          id: "kakao",
          name: "카카오",
          authUrl: "/api/auth/kakao",
        },
        {
          id: "naver",
          name: "네이버",
          authUrl: "/api/auth/naver",
        },
        {
          id: "google",
          name: "구글",
          authUrl: "/api/auth/google",
        },
      ];

      res.status(200).json({
        success: true,
        data: providers,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Get providers error:", error);

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "OAuth 제공업체 목록 조회에 실패했습니다.",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * 요청에서 토큰 추출
   */
  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    return null;
  }

  /**
   * 에러 코드에 따른 HTTP 상태 코드 반환
   */
  private getErrorStatusCode(errorCode: string): number {
    const statusCodeMap: Record<string, number> = {
      MISSING_TOKEN: 400,
      INVALID_TOKEN: 401,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      USER_NOT_FOUND: 404,
      USER_INACTIVE: 403,
      INVALID_PASSWORD: 401,
      MISSING_AUTH_CODE: 400,
      OAUTH_LOGIN_FAILED: 400,
      LOCAL_LOGIN_FAILED: 401,
      TOKEN_REFRESH_FAILED: 401,
      LOGOUT_FAILED: 500,
    };

    return statusCodeMap[errorCode] || 500;
  }
}
