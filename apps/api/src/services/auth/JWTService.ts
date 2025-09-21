import jwt from "jsonwebtoken";
// 타입 정의
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

type UserRole = 'user' | 'admin' | 'moderator';
// 환경변수 설정
const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/jeju_tourlist',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'your-super-secret-key-here-must-be-at-least-32-characters-long',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:4000',
  SOCKET_URL: process.env.SOCKET_URL || 'http://localhost:4001',
  SOCKET_PORT: process.env.SOCKET_PORT || '4001',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || '6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DB: process.env.REDIS_DB || '0',
};

/**
 * JWT 토큰 관리 서비스
 * Single Responsibility Principle: JWT 토큰 생성, 검증, 갱신만 담당
 */
export class JWTService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = env.NEXTAUTH_SECRET;
    this.refreshTokenSecret = env.NEXTAUTH_SECRET + "_refresh";
    this.accessTokenExpiry = "15m"; // 15분
    this.refreshTokenExpiry = "7d"; // 7일
  }

  /**
   * 액세스 토큰과 리프레시 토큰 쌍 생성
   */
  generateTokenPair(user: User): TokenPair {
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15분
    };

    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(
      { sub: user.id, type: "refresh" },
      this.refreshTokenSecret,
      { expiresIn: this.refreshTokenExpiry } as jwt.SignOptions
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15분 (초 단위)
    };
  }

  /**
   * 액세스 토큰 검증
   */
  verifyAccessToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as JWTPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * 리프레시 토큰 검증
   */
  verifyRefreshToken(token: string): { sub: string; type: string } | null {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret) as any;
      if (decoded.type !== "refresh") {
        return null;
      }
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * 토큰에서 사용자 ID 추출
   */
  extractUserId(token: string): string | null {
    const payload = this.verifyAccessToken(token);
    return payload?.sub || null;
  }

  /**
   * 토큰 만료 시간 확인
   */
  isTokenExpired(_token: string): boolean {
    try {
      const decoded = jwt.decode(_token) as any;
      if (!decoded || !decoded.exp) {
        return true;
      }
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

  /**
   * 토큰에서 역할 정보 추출
   */
  extractUserRole(token: string): UserRole | null {
    const payload = this.verifyAccessToken(token);
    return payload?.role || null;
  }

  /**
   * 토큰 블랙리스트 관리 (로그아웃 시 사용)
   */
  blacklistToken(_token: string): void {
    // Redis에 토큰을 블랙리스트로 저장하는 로직
    // 현재는 메모리 기반으로 구현
    // TODO: Redis 연동 시 구현
  }

  /**
   * 토큰이 블랙리스트에 있는지 확인
   */
  isTokenBlacklisted(_token: string): boolean {
    // Redis에서 토큰 블랙리스트 확인
    // TODO: Redis 연동 시 구현
    return false;
  }
}
