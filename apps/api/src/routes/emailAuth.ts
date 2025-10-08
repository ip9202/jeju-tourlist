/**
 * EmailAuth Router - 이메일 기반 인증 라우터
 *
 * SOLID Principles:
 * - SRP: 이메일 기반 인증 라우팅만 담당
 * - DIP: 의존성 주입을 통한 느슨한 결합
 */

import { Router } from "express";
import { EmailAuthController } from "../controllers/emailAuthController";
import { AuthService } from "@jeju-tourlist/database/services/auth.service";
import { AuthRepository } from "@jeju-tourlist/database/repositories/auth.repository";
import { passwordService } from "@jeju-tourlist/database/services/password.service";
import { prisma } from "@jeju-tourlist/database";
import { emailRegisterLimiter, emailLoginLimiter } from "../middleware/rateLimiter";

/**
 * 이메일 인증 라우터 생성
 */
export function createEmailAuthRouter(): Router {
  const router = Router();

  // 의존성 주입 (Dependency Inversion Principle)
  const authRepository = new AuthRepository(prisma);
  const authService = new AuthService(authRepository, passwordService);
  const emailAuthController = new EmailAuthController(authService);

  // 공개 라우트 (인증 불필요) - Rate Limiter 적용
  router.post("/register", emailRegisterLimiter, emailAuthController.register);
  router.post("/login", emailLoginLimiter, emailAuthController.login);
  router.get("/verify", emailAuthController.verifyEmail);
  router.post("/resend-verification", emailAuthController.resendVerification);
  router.post("/password-reset", emailAuthController.requestPasswordReset);
  router.post("/password-reset/confirm", emailAuthController.confirmPasswordReset);

  return router;
}
