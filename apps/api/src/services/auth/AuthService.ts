import {
  User,
  AuthProvider,
  OAuthProfile,
  LoginRequest,
  LoginResponse,
  AuthError,
  UserRole,
} from "@jeju-tourlist/types";
import { JWTService } from "./JWTService";
import { PasswordService } from "./PasswordService";
import { OAuthServiceFactory } from "./OAuthService";
import { UserRepository } from "../user/UserRepository";

/**
 * 통합 인증 서비스
 * Single Responsibility Principle: 인증 관련 비즈니스 로직만 담당
 * Dependency Inversion Principle: 구체적인 구현체가 아닌 추상화에 의존
 */
export class AuthService {
  constructor(
    private readonly jwtService: JWTService,
    private readonly passwordService: PasswordService,
    private readonly userRepository: UserRepository
  ) {}

  /**
   * OAuth 로그인 처리
   */
  async loginWithOAuth(request: LoginRequest): Promise<LoginResponse> {
    try {
      if (!request.code) {
        throw this.createAuthError(
          "MISSING_AUTH_CODE",
          "인증 코드가 필요합니다."
        );
      }

      // OAuth 제공업체에서 사용자 프로필 가져오기
      const oauthProvider = OAuthServiceFactory.createProvider(
        request.provider
      );
      const accessToken = await oauthProvider.getAccessToken(request.code);
      const oauthProfile = await oauthProvider.getUserProfile(accessToken);

      // 기존 사용자 확인 또는 새 사용자 생성
      let user = await this.userRepository.findByProviderAndProviderId(
        oauthProfile.provider,
        oauthProfile.providerId
      );

      const isNewUser = !user;

      if (!user) {
        // 새 사용자 생성
        user = await this.createUserFromOAuthProfile(oauthProfile);
      } else {
        // 기존 사용자 정보 업데이트
        user = await this.updateUserFromOAuthProfile(user, oauthProfile);
      }

      // JWT 토큰 생성
      const tokens = this.jwtService.generateTokenPair(user);

      return {
        user,
        tokens,
        isNewUser,
      };
    } catch (error) {
      throw this.createAuthError(
        "OAUTH_LOGIN_FAILED",
        "OAuth 로그인에 실패했습니다.",
        { originalError: error }
      );
    }
  }

  /**
   * 로컬 로그인 처리 (이메일/비밀번호)
   */
  async loginWithLocal(
    email: string,
    _password: string
  ): Promise<LoginResponse> {
    try {
      // 사용자 조회
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw this.createAuthError(
          "USER_NOT_FOUND",
          "사용자를 찾을 수 없습니다."
        );
      }

      if (!user.isActive) {
        throw this.createAuthError("USER_INACTIVE", "비활성화된 사용자입니다.");
      }

      // 비밀번호 검증 (로컬 사용자인 경우)
      if (user.provider !== AuthProvider.LOCAL) {
        throw this.createAuthError(
          "INVALID_LOGIN_METHOD",
          "소셜 로그인을 사용해주세요."
        );
      }

      // TODO: 비밀번호 검증 로직 추가 (로컬 로그인 구현 시)
      // const isValidPassword = await this.passwordService.verifyPassword(password, user.password);
      // if (!isValidPassword) {
      //   throw this.createAuthError('INVALID_PASSWORD', '비밀번호가 올바르지 않습니다.');
      // }

      // JWT 토큰 생성
      const tokens = this.jwtService.generateTokenPair(user);

      return {
        user,
        tokens,
        isNewUser: false,
      };
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        throw error;
      }
      throw this.createAuthError(
        "LOCAL_LOGIN_FAILED",
        "로컬 로그인에 실패했습니다.",
        { originalError: error }
      );
    }
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const decoded = this.jwtService.verifyRefreshToken(refreshToken);
      if (!decoded) {
        throw this.createAuthError(
          "INVALID_REFRESH_TOKEN",
          "유효하지 않은 리프레시 토큰입니다."
        );
      }

      const user = await this.userRepository.findById(decoded.sub);
      if (!user || !user.isActive) {
        throw this.createAuthError(
          "USER_NOT_FOUND",
          "사용자를 찾을 수 없습니다."
        );
      }

      const tokens = this.jwtService.generateTokenPair(user);

      return {
        user,
        tokens,
        isNewUser: false,
      };
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        throw error;
      }
      throw this.createAuthError(
        "TOKEN_REFRESH_FAILED",
        "토큰 갱신에 실패했습니다.",
        { originalError: error }
      );
    }
  }

  /**
   * 로그아웃 처리
   */
  async logout(accessToken: string): Promise<void> {
    try {
      // 토큰을 블랙리스트에 추가
      this.jwtService.blacklistToken(accessToken);
    } catch (error) {
      throw this.createAuthError("LOGOUT_FAILED", "로그아웃에 실패했습니다.", {
        originalError: error,
      });
    }
  }

  /**
   * 토큰 검증
   */
  async validateToken(token: string): Promise<User | null> {
    try {
      if (this.jwtService.isTokenBlacklisted(token)) {
        return null;
      }

      const payload = this.jwtService.verifyAccessToken(token);
      if (!payload) {
        return null;
      }

      const user = await this.userRepository.findById(payload.sub);
      if (!user || !user.isActive) {
        return null;
      }

      return user;
    } catch {
      return null;
    }
  }

  /**
   * OAuth 프로필로부터 사용자 생성
   */
  private async createUserFromOAuthProfile(
    oauthProfile: OAuthProfile
  ): Promise<User> {
    const userData = {
      email: oauthProfile.email,
      name: oauthProfile.name,
      profileImage: oauthProfile.profileImage,
      provider: oauthProfile.provider,
      providerId: oauthProfile.providerId,
      role: UserRole.USER,
      isActive: true,
    };

    return await this.userRepository.create(userData);
  }

  /**
   * OAuth 프로필로부터 기존 사용자 정보 업데이트
   */
  private async updateUserFromOAuthProfile(
    user: User,
    oauthProfile: OAuthProfile
  ): Promise<User> {
    const updateData = {
      name: oauthProfile.name,
      profileImage: oauthProfile.profileImage,
    };

    return await this.userRepository.update(user.id, updateData);
  }

  /**
   * 인증 에러 생성
   */
  private createAuthError(
    code: string,
    message: string,
    details?: Record<string, any>
  ): AuthError {
    return {
      code,
      message,
      details,
    };
  }
}
