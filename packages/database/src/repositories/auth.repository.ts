/**
 * AuthRepository - 인증 관련 데이터 접근 계층
 *
 * SOLID Principles:
 * - SRP: 인증 관련 DB 접근만 담당
 * - ISP: 클라이언트가 필요한 메서드만 의존하도록 인터페이스 분리
 * - DIP: Prisma 구현 세부사항을 추상화
 */

import {
  PrismaClient,
  User,
  EmailVerificationToken,
  PasswordResetToken,
} from "@prisma/client";

/**
 * 인증 Repository 인터페이스
 */
export interface IAuthRepository {
  // ============================================
  // User 관련 메서드
  // ============================================

  /**
   * 이메일로 사용자 조회
   * @param email 이메일 주소
   * @returns Promise<User | null>
   */
  findUserByEmail(email: string): Promise<User | null>;

  /**
   * 닉네임으로 사용자 조회
   * @param nickname 닉네임
   * @returns Promise<User | null>
   */
  findUserByNickname(nickname: string): Promise<User | null>;

  /**
   * 이메일 기반 사용자 생성
   * @param data 사용자 생성 데이터
   * @returns Promise<User>
   */
  createEmailUser(data: {
    email: string;
    password: string;
    name: string;
    nickname: string;
  }): Promise<User>;

  /**
   * 이메일 인증 상태 업데이트
   * @param userId 사용자 ID
   * @returns Promise<User>
   */
  markEmailAsVerified(userId: string): Promise<User>;

  /**
   * 마지막 로그인 시간 업데이트
   * @param userId 사용자 ID
   * @returns Promise<void>
   */
  updateLastLoginAt(userId: string): Promise<void>;

  // ============================================
  // EmailVerificationToken 관련 메서드
  // ============================================

  /**
   * 이메일 인증 토큰 생성
   * @param data 토큰 생성 데이터
   * @returns Promise<EmailVerificationToken>
   */
  createEmailVerificationToken(data: {
    userId: string;
    email: string;
    token: string;
    expiresAt: Date;
  }): Promise<EmailVerificationToken>;

  /**
   * 토큰으로 이메일 인증 토큰 조회
   * @param token 토큰 문자열
   * @returns Promise<EmailVerificationToken | null>
   */
  findEmailVerificationToken(
    token: string
  ): Promise<EmailVerificationToken | null>;

  /**
   * 이메일 인증 토큰 사용 처리
   * @param tokenId 토큰 ID
   * @returns Promise<EmailVerificationToken>
   */
  markTokenAsUsed(tokenId: string): Promise<EmailVerificationToken>;

  /**
   * 사용자의 미사용 이메일 인증 토큰 조회
   * @param userId 사용자 ID
   * @returns Promise<EmailVerificationToken | null>
   */
  findUnusedEmailVerificationToken(
    userId: string
  ): Promise<EmailVerificationToken | null>;

  // ============================================
  // PasswordResetToken 관련 메서드
  // ============================================

  /**
   * 비밀번호 재설정 토큰 생성
   * @param data 토큰 생성 데이터
   * @returns Promise<PasswordResetToken>
   */
  createPasswordResetToken(data: {
    userId: string;
    email: string;
    token: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken>;

  /**
   * 토큰으로 비밀번호 재설정 토큰 조회
   * @param token 토큰 문자열
   * @returns Promise<PasswordResetToken | null>
   */
  findPasswordResetToken(token: string): Promise<PasswordResetToken | null>;

  /**
   * 비밀번호 재설정 토큰 사용 처리
   * @param tokenId 토큰 ID
   * @returns Promise<PasswordResetToken>
   */
  markPasswordResetTokenAsUsed(tokenId: string): Promise<PasswordResetToken>;

  /**
   * 비밀번호 업데이트
   * @param userId 사용자 ID
   * @param hashedPassword 해싱된 새 비밀번호
   * @returns Promise<User>
   */
  updatePassword(userId: string, hashedPassword: string): Promise<User>;
}

/**
 * AuthRepository 구현
 */
export class AuthRepository implements IAuthRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // ============================================
  // User 관련 메서드 구현
  // ============================================

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserByNickname(nickname: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { nickname },
    });
  }

  async createEmailUser(data: {
    email: string;
    password: string;
    name: string;
    nickname: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        nickname: data.nickname,
        provider: "email",
        providerId: null,
        isVerified: false,
        isActive: true,
      },
    });
  }

  async markEmailAsVerified(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        emailVerified: new Date(),
      },
    });
  }

  async updateLastLoginAt(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  // ============================================
  // EmailVerificationToken 관련 메서드 구현
  // ============================================

  async createEmailVerificationToken(data: {
    userId: string;
    email: string;
    token: string;
    expiresAt: Date;
  }): Promise<EmailVerificationToken> {
    return this.prisma.emailVerificationToken.create({
      data: {
        userId: data.userId,
        email: data.email,
        token: data.token,
        expiresAt: data.expiresAt,
        isUsed: false,
      },
    });
  }

  async findEmailVerificationToken(
    token: string
  ): Promise<EmailVerificationToken | null> {
    return this.prisma.emailVerificationToken.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });
  }

  async markTokenAsUsed(tokenId: string): Promise<EmailVerificationToken> {
    return this.prisma.emailVerificationToken.update({
      where: { id: tokenId },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });
  }

  async findUnusedEmailVerificationToken(
    userId: string
  ): Promise<EmailVerificationToken | null> {
    return this.prisma.emailVerificationToken.findFirst({
      where: {
        userId,
        isUsed: false,
        expiresAt: {
          gt: new Date(), // 만료되지 않은 토큰만
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // ============================================
  // PasswordResetToken 관련 메서드 구현
  // ============================================

  async createPasswordResetToken(data: {
    userId: string;
    email: string;
    token: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken> {
    return this.prisma.passwordResetToken.create({
      data: {
        userId: data.userId,
        email: data.email,
        token: data.token,
        expiresAt: data.expiresAt,
        isUsed: false,
      },
    });
  }

  async findPasswordResetToken(
    token: string
  ): Promise<PasswordResetToken | null> {
    return this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });
  }

  async markPasswordResetTokenAsUsed(
    tokenId: string
  ): Promise<PasswordResetToken> {
    return this.prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
  }
}
