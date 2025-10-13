/**
 * EmailAuthController - 이메일 기반 인증 컨트롤러
 *
 * SOLID Principles:
 * - SRP: 이메일 기반 인증 HTTP 요청 처리만 담당
 * - DIP: AuthService 인터페이스에 의존
 */

import { Request, Response } from "express";
import { IAuthService } from "@jeju-tourlist/database/services/auth.service";
import {
  RegisterSchema,
  LoginSchema,
} from "@jeju-tourlist/database/types/auth";
import { z } from "zod";

/**
 * 이메일 인증 컨트롤러
 */
export class EmailAuthController {
  constructor(private readonly authService: IAuthService) {}

  /**
   * 이메일 회원가입
   * POST /api/auth/register
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      // Zod 검증
      const validatedData = RegisterSchema.parse(req.body);

      // 회원가입 처리
      const result = await this.authService.register(validatedData);

      // 성공 응답
      res.status(201).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            nickname: result.user.nickname,
            isVerified: result.user.isVerified,
          },
          verificationToken: result.verificationToken.token,
          message: "회원가입이 완료되었습니다. 이메일 인증을 진행해주세요.",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Register error:", error);

      // Zod 검증 에러 처리
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "입력 데이터가 유효하지 않습니다",
            details: error.issues.map(issue => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 비즈니스 로직 에러 처리
      const statusCode = this.getErrorStatusCode(error.message);
      res.status(statusCode).json({
        success: false,
        error: {
          code: error.code || "REGISTER_FAILED",
          message: error.message || "회원가입에 실패했습니다",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * 이메일 중복체크
   * POST /api/auth/email/check
   */
  checkEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_EMAIL",
            message: "이메일 주소가 필요합니다",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_EMAIL",
            message: "올바른 이메일 형식이 아닙니다",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 이메일 중복체크
      const isAvailable = await this.authService.checkEmailAvailability(email);

      // 성공 응답
      res.status(200).json({
        success: true,
        data: {
          email,
          available: isAvailable,
          message: isAvailable
            ? "사용 가능한 이메일입니다"
            : "이미 사용 중인 이메일입니다",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Check email error:", error);

      res.status(500).json({
        success: false,
        error: {
          code: "CHECK_FAILED",
          message: "이메일 중복체크에 실패했습니다",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * 이메일 로그인
   * POST /api/auth/email/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      // Zod 검증
      const validatedData = LoginSchema.parse(req.body);

      // 로그인 처리
      const user = await this.authService.login(validatedData);

      // 성공 응답
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            nickname: user.nickname,
            isVerified: user.isVerified,
          },
          message: "로그인이 완료되었습니다",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Login error:", error);

      // Zod 검증 에러 처리
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "입력 데이터가 유효하지 않습니다",
            details: error.issues.map(issue => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 비즈니스 로직 에러 처리
      const statusCode = this.getErrorStatusCode(error.message);
      res.status(statusCode).json({
        success: false,
        error: {
          code: error.code || "LOGIN_FAILED",
          message: error.message || "로그인에 실패했습니다",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * 이메일 인증
   * GET /api/auth/email/verify?token=xxx
   */
  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_TOKEN",
            message: "인증 토큰이 필요합니다",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 이메일 인증 처리
      const user = await this.authService.verifyEmail(token);

      // 성공 응답
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            nickname: user.nickname,
            isVerified: user.isVerified,
          },
          message: "이메일 인증이 완료되었습니다",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Verify email error:", error);

      const statusCode = this.getErrorStatusCode(error.message);
      res.status(statusCode).json({
        success: false,
        error: {
          code: error.code || "VERIFY_FAILED",
          message: error.message || "이메일 인증에 실패했습니다",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * 이메일 인증 재발송
   * POST /api/auth/email/resend-verification
   */
  resendVerification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_EMAIL",
            message: "이메일 주소가 필요합니다",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 이메일 인증 재발송 처리
      const verificationToken =
        await this.authService.resendVerificationEmail(email);

      // 성공 응답
      res.status(200).json({
        success: true,
        data: {
          token: verificationToken.token,
          message: "인증 이메일이 재발송되었습니다",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Resend verification error:", error);

      const statusCode = this.getErrorStatusCode(error.message);
      res.status(statusCode).json({
        success: false,
        error: {
          code: error.code || "RESEND_FAILED",
          message: error.message || "인증 이메일 재발송에 실패했습니다",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * 비밀번호 재설정 요청
   * POST /api/auth/email/password-reset
   */
  requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_EMAIL",
            message: "이메일 주소가 필요합니다",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 비밀번호 재설정 요청 처리
      const resetToken = await this.authService.requestPasswordReset(email);

      // 성공 응답
      res.status(200).json({
        success: true,
        data: {
          token: resetToken.token,
          message: "비밀번호 재설정 이메일이 발송되었습니다",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Password reset request error:", error);

      // 보안상 사용자가 없어도 성공 메시지 반환
      res.status(200).json({
        success: true,
        data: {
          message: "비밀번호 재설정 이메일이 발송되었습니다",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * 비밀번호 재설정 확인
   * POST /api/auth/email/password-reset/confirm
   */
  confirmPasswordReset = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_FIELDS",
            message: "토큰과 새 비밀번호가 필요합니다",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 비밀번호 재설정 처리
      const user = await this.authService.resetPassword(token, password);

      // 성공 응답
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            nickname: user.nickname,
          },
          message: "비밀번호가 재설정되었습니다",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Password reset confirm error:", error);

      const statusCode = this.getErrorStatusCode(error.message);
      res.status(statusCode).json({
        success: false,
        error: {
          code: error.code || "RESET_FAILED",
          message: error.message || "비밀번호 재설정에 실패했습니다",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * 로그아웃
   * POST /api/auth/logout
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      // 클라이언트에서 localStorage 삭제하도록 성공 응답만 반환
      res.status(200).json({
        success: true,
        data: {
          message: "로그아웃이 완료되었습니다",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Logout error:", error);

      res.status(500).json({
        success: false,
        error: {
          code: "LOGOUT_FAILED",
          message: "로그아웃에 실패했습니다",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * 현재 사용자 정보 조회
   * GET /api/auth/me
   */
  me = async (req: Request, res: Response): Promise<void> => {
    try {
      // 토큰은 클라이언트에서 관리하므로, 여기서는 간단한 응답만 반환
      // TODO: JWT 토큰 구현 시 토큰 검증 추가 필요
      res.status(200).json({
        success: true,
        data: {
          user: null,
          message: "JWT 토큰 인증이 아직 구현되지 않았습니다",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Get user info error:", error);

      res.status(500).json({
        success: false,
        error: {
          code: "GET_USER_FAILED",
          message: "사용자 정보 조회에 실패했습니다",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * 에러 메시지에 따른 HTTP 상태 코드 반환
   */
  private getErrorStatusCode(errorMessage: string): number {
    if (errorMessage.includes("중복")) {
      return 409; // Conflict
    }
    if (errorMessage.includes("찾을 수 없습니다")) {
      return 404; // Not Found
    }
    if (errorMessage.includes("올바르지 않습니다")) {
      return 401; // Unauthorized
    }
    if (errorMessage.includes("인증이 필요합니다")) {
      return 401; // Unauthorized
    }
    if (errorMessage.includes("만료")) {
      return 410; // Gone
    }
    if (errorMessage.includes("이미 사용")) {
      return 410; // Gone
    }
    if (errorMessage.includes("유효하지 않")) {
      return 400; // Bad Request
    }

    return 500; // Internal Server Error
  }
}
