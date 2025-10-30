import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { AuthService } from "../services/auth/AuthService";
import { JWTService } from "../services/auth/JWTService";
import { PasswordService } from "../services/auth/PasswordService";
import { UserRepository } from "../services/user/UserRepository";
import { createAuthMiddleware } from "../middleware/auth";
import { AuthProvider } from "@jeju-tourlist/types";

/**
 * 인증 라우터
 * Single Responsibility Principle: 인증 관련 라우팅만 담당
 */
export function createAuthRouter(): Router {
  const router = Router();

  // 의존성 주입 (Dependency Inversion Principle)
  const userRepository = new UserRepository();
  const jwtService = new JWTService();
  const passwordService = new PasswordService();
  const authService = new AuthService(
    jwtService,
    passwordService,
    userRepository
  );
  const authController = new AuthController(authService);
  const authMiddleware = createAuthMiddleware(authService);

  // 공개 라우트 (인증 불필요)
  router.post("/login", authController.login);
  router.post("/refresh", authController.refreshToken);
  router.get("/providers", authController.getProviders);
  router.post("/check", authController.checkEmail);

  // OAuth 콜백 라우트 (인증 불필요)
  router.get("/kakao", async (req, res) => {
    // 카카오 OAuth URL로 리다이렉트
    const { OAuthServiceFactory } = await import(
      "../services/auth/OAuthService"
    );
    const kakaoService = OAuthServiceFactory.createProvider(AuthProvider.KAKAO);
    const authUrl = kakaoService.getAuthUrl();
    res.redirect(authUrl);
  });

  router.get("/naver", async (req, res) => {
    // 네이버 OAuth URL로 리다이렉트
    const { OAuthServiceFactory } = await import(
      "../services/auth/OAuthService"
    );
    const naverService = OAuthServiceFactory.createProvider(AuthProvider.NAVER);
    const authUrl = naverService.getAuthUrl();
    res.redirect(authUrl);
  });

  router.get("/google", async (req, res) => {
    // 구글 OAuth URL로 리다이렉트
    const { OAuthServiceFactory } = await import(
      "../services/auth/OAuthService"
    );
    const googleService = OAuthServiceFactory.createProvider(
      AuthProvider.GOOGLE
    );
    const authUrl = googleService.getAuthUrl();
    res.redirect(authUrl);
  });

  // OAuth 콜백 처리
  router.get("/callback/kakao", async (req, res) => {
    try {
      const { code } = req.query;

      if (!code) {
        return res.status(400).json({
          success: false,
          error: {
            code: "MISSING_AUTH_CODE",
            message: "인증 코드가 필요합니다.",
          },
          timestamp: new Date().toISOString(),
        });
      }

      const result = await authService.loginWithOAuth({
        provider: AuthProvider.KAKAO,
        code: code as string,
      });

      // 성공 시 프론트엔드로 리다이렉트 (토큰 포함)
      const redirectUrl = `${process.env.NEXTAUTH_URL}/auth/callback?token=${result.tokens.accessToken}&refresh=${result.tokens.refreshToken}`;
      res.redirect(redirectUrl);
    } catch (error: any) {
      console.error("Kakao callback error:", error);

      // 에러 시 프론트엔드 에러 페이지로 리다이렉트
      const errorUrl = `${process.env.NEXTAUTH_URL}/auth/error?message=${encodeURIComponent(error.message)}`;
      res.redirect(errorUrl);
    }
  });

  router.get("/callback/naver", async (req, res) => {
    try {
      const { code } = req.query;

      if (!code) {
        return res.status(400).json({
          success: false,
          error: {
            code: "MISSING_AUTH_CODE",
            message: "인증 코드가 필요합니다.",
          },
          timestamp: new Date().toISOString(),
        });
      }

      const result = await authService.loginWithOAuth({
        provider: AuthProvider.NAVER,
        code: code as string,
      });

      const redirectUrl = `${process.env.NEXTAUTH_URL}/auth/callback?token=${result.tokens.accessToken}&refresh=${result.tokens.refreshToken}`;
      res.redirect(redirectUrl);
    } catch (error: any) {
      console.error("Naver callback error:", error);

      const errorUrl = `${process.env.NEXTAUTH_URL}/auth/error?message=${encodeURIComponent(error.message)}`;
      res.redirect(errorUrl);
    }
  });

  router.get("/callback/google", async (req, res) => {
    try {
      const { code } = req.query;

      if (!code) {
        return res.status(400).json({
          success: false,
          error: {
            code: "MISSING_AUTH_CODE",
            message: "인증 코드가 필요합니다.",
          },
          timestamp: new Date().toISOString(),
        });
      }

      const result = await authService.loginWithOAuth({
        provider: AuthProvider.GOOGLE,
        code: code as string,
      });

      const redirectUrl = `${process.env.NEXTAUTH_URL}/auth/callback?token=${result.tokens.accessToken}&refresh=${result.tokens.refreshToken}`;
      res.redirect(redirectUrl);
    } catch (error: any) {
      console.error("Google callback error:", error);

      const errorUrl = `${process.env.NEXTAUTH_URL}/auth/error?message=${encodeURIComponent(error.message)}`;
      res.redirect(errorUrl);
    }
  });

  // 보호된 라우트 (인증 필요)
  router.use(authMiddleware.authenticate);

  router.get("/me", authController.getCurrentUser);
  router.post("/logout", authController.logout);

  return router;
}
