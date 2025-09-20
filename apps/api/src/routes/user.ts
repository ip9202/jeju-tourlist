import { Router } from "express";
import { UserController } from "../controllers/userController";
import { UserRepository } from "../services/user/UserRepository";
import { AuthService } from "../services/auth/AuthService";
import { JWTService } from "../services/auth/JWTService";
import { PasswordService } from "../services/auth/PasswordService";
import { createAuthMiddleware } from "../middleware/auth";

/**
 * 사용자 라우터
 * Single Responsibility Principle: 사용자 관련 라우팅만 담당
 */
export function createUserRouter(): Router {
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
  const userController = new UserController(userRepository, authService);
  const authMiddleware = createAuthMiddleware(authService);

  // 모든 사용자 라우트는 인증 필요
  router.use(authMiddleware.authenticate);

  // 개인 사용자 정보 관련 라우트
  router.get("/me", userController.getCurrentUser);
  router.put("/me", userController.updateProfile);
  router.delete("/me", userController.deleteAccount);
  router.get("/me/stats", userController.getUserStats);

  // 공개 사용자 정보 라우트
  router.get("/:id/profile", userController.getUserProfile);

  // 관리자 전용 라우트
  router.get("/", authMiddleware.requireAdmin, userController.getUsers);

  return router;
}
