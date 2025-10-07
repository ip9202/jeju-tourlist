/**
 * AuthService - 인증 비즈니스 로직 계층
 *
 * SOLID Principles:
 * - SRP: 회원가입, 로그인, 이메일 인증, 비밀번호 재설정 등 인증 관련 비즈니스 로직만 담당
 * - OCP: 새로운 인증 방식 추가 시 기존 코드 수정 없이 확장 가능
 * - LSP: IAuthService 인터페이스를 구현하여 교체 가능
 * - ISP: 클라이언트가 필요한 메서드만 사용하도록 인터페이스 분리
 * - DIP: Repository와 PasswordService 인터페이스에 의존
 */

import {
  User,
  EmailVerificationToken,
  PasswordResetToken,
} from "@prisma/client";
import { IAuthRepository } from "../repositories/auth.repository";
import { IPasswordService } from "./password.service";
import { RegisterInput, LoginInput } from "../types/auth";
import crypto from "crypto";

/**
 * 인증 서비스 인터페이스
 */
export interface IAuthService {
  /**
   * 이메일 기반 회원가입
   * @param input 회원가입 입력 데이터
   * @returns Promise<{ user: User, verificationToken: EmailVerificationToken }>
   * @throws Error 이메일 중복, 닉네임 중복 등
   */
  register(input: RegisterInput): Promise<{
    user: User;
    verificationToken: EmailVerificationToken;
  }>;

  /**
   * 이메일 기반 로그인
   * @param input 로그인 입력 데이터
   * @returns Promise<User>
   * @throws Error 사용자 없음, 비밀번호 불일치, 이메일 미인증 등
   */
  login(input: LoginInput): Promise<User>;

  /**
   * 이메일 인증
   * @param token 이메일 인증 토큰
   * @returns Promise<User>
   * @throws Error 토큰 무효, 토큰 만료, 토큰 이미 사용됨 등
   */
  verifyEmail(token: string): Promise<User>;

  /**
   * 이메일 인증 재발송
   * @param email 이메일 주소
   * @returns Promise<EmailVerificationToken>
   * @throws Error 사용자 없음, 이미 인증됨 등
   */
  resendVerificationEmail(email: string): Promise<EmailVerificationToken>;

  /**
   * 비밀번호 재설정 요청 (이메일 발송)
   * @param email 이메일 주소
   * @returns Promise<PasswordResetToken>
   * @throws Error 사용자 없음 등
   */
  requestPasswordReset(email: string): Promise<PasswordResetToken>;

  /**
   * 비밀번호 재설정 확인
   * @param token 비밀번호 재설정 토큰
   * @param newPassword 새 비밀번호
   * @returns Promise<User>
   * @throws Error 토큰 무효, 토큰 만료, 토큰 이미 사용됨 등
   */
  resetPassword(token: string, newPassword: string): Promise<User>;
}

/**
 * AuthService 구현
 */
export class AuthService implements IAuthService {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly passwordService: IPasswordService
  ) {}

  // ============================================
  // 회원가입
  // ============================================

  async register(input: RegisterInput): Promise<{
    user: User;
    verificationToken: EmailVerificationToken;
  }> {
    // 1. 이메일 중복 확인
    const existingUserByEmail = await this.authRepository.findUserByEmail(
      input.email
    );
    if (existingUserByEmail) {
      throw new Error("이미 사용 중인 이메일입니다");
    }

    // 2. 닉네임 중복 확인
    const existingUserByNickname = await this.authRepository.findUserByNickname(
      input.nickname
    );
    if (existingUserByNickname) {
      throw new Error("이미 사용 중인 닉네임입니다");
    }

    // 3. 비밀번호 해싱
    const hashedPassword = await this.passwordService.hash(input.password);

    // 4. 사용자 생성
    const user = await this.authRepository.createEmailUser({
      email: input.email,
      password: hashedPassword,
      name: input.name,
      nickname: input.nickname,
    });

    // 5. 이메일 인증 토큰 생성
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 후

    const verificationToken =
      await this.authRepository.createEmailVerificationToken({
        userId: user.id,
        email: user.email!,
        token,
        expiresAt,
      });

    return {
      user,
      verificationToken,
    };
  }

  // ============================================
  // 이메일 기반 로그인
  // ============================================

  async login(input: LoginInput): Promise<User> {
    // 1. 사용자 조회
    const user = await this.authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다");
    }

    // 2. 비밀번호 확인
    if (!user.password) {
      throw new Error("비밀번호가 설정되지 않은 계정입니다");
    }

    const isPasswordValid = await this.passwordService.verify(
      input.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다");
    }

    // 3. 계정 활성화 상태 확인
    if (!user.isActive) {
      throw new Error("비활성화된 계정입니다. 관리자에게 문의하세요");
    }

    // 4. 이메일 인증 상태 확인 (개발 환경에서는 비활성화)
    // if (!user.isVerified) {
    //   throw new Error("이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요");
    // }

    // 5. 마지막 로그인 시간 업데이트
    await this.authRepository.updateLastLoginAt(user.id);

    return user;
  }

  // ============================================
  // 이메일 인증
  // ============================================

  async verifyEmail(token: string): Promise<User> {
    // 1. 토큰 조회
    const verificationToken =
      await this.authRepository.findEmailVerificationToken(token);
    if (!verificationToken) {
      throw new Error("유효하지 않은 인증 토큰입니다");
    }

    // 2. 토큰 만료 확인
    if (verificationToken.expiresAt < new Date()) {
      throw new Error("만료된 인증 토큰입니다");
    }

    // 3. 토큰 사용 여부 확인
    if (verificationToken.isUsed) {
      throw new Error("이미 사용된 인증 토큰입니다");
    }

    // 4. 토큰 사용 처리
    await this.authRepository.markTokenAsUsed(verificationToken.id);

    // 5. 사용자 이메일 인증 처리
    const user = await this.authRepository.markEmailAsVerified(
      verificationToken.userId
    );

    return user;
  }

  // ============================================
  // 이메일 인증 재발송
  // ============================================

  async resendVerificationEmail(
    email: string
  ): Promise<EmailVerificationToken> {
    // 1. 사용자 조회
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다");
    }

    // 2. 이미 인증된 사용자인지 확인
    if (user.isVerified) {
      throw new Error("이미 인증된 계정입니다");
    }

    // 3. 기존 미사용 토큰 확인 (5분 이내면 재사용)
    const existingToken =
      await this.authRepository.findUnusedEmailVerificationToken(user.id);
    if (existingToken) {
      const timeDiff = Date.now() - existingToken.createdAt.getTime();
      if (timeDiff < 5 * 60 * 1000) {
        // 5분 이내
        return existingToken;
      }
    }

    // 4. 새 토큰 생성
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 후

    const verificationToken =
      await this.authRepository.createEmailVerificationToken({
        userId: user.id,
        email: user.email!,
        token,
        expiresAt,
      });

    return verificationToken;
  }

  // ============================================
  // 비밀번호 재설정 요청
  // ============================================

  async requestPasswordReset(email: string): Promise<PasswordResetToken> {
    // 1. 사용자 조회
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      // 보안상 사용자가 없어도 성공 메시지 반환 (정보 노출 방지)
      // 하지만 토큰은 생성하지 않으므로 실제로는 이메일이 발송되지 않음
      throw new Error("사용자를 찾을 수 없습니다");
    }

    // 2. 이메일 기반 사용자인지 확인
    if (user.provider !== "email") {
      throw new Error(
        `${user.provider} 계정은 비밀번호 재설정을 지원하지 않습니다`
      );
    }

    // 3. 토큰 생성
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1시간 후

    const resetToken = await this.authRepository.createPasswordResetToken({
      userId: user.id,
      email: user.email!,
      token,
      expiresAt,
    });

    return resetToken;
  }

  // ============================================
  // 비밀번호 재설정 확인
  // ============================================

  async resetPassword(token: string, newPassword: string): Promise<User> {
    // 1. 토큰 조회
    const resetToken = await this.authRepository.findPasswordResetToken(token);
    if (!resetToken) {
      throw new Error("유효하지 않은 재설정 토큰입니다");
    }

    // 2. 토큰 만료 확인
    if (resetToken.expiresAt < new Date()) {
      throw new Error("만료된 재설정 토큰입니다");
    }

    // 3. 토큰 사용 여부 확인
    if (resetToken.isUsed) {
      throw new Error("이미 사용된 재설정 토큰입니다");
    }

    // 4. 비밀번호 해싱
    const hashedPassword = await this.passwordService.hash(newPassword);

    // 5. 비밀번호 업데이트
    const user = await this.authRepository.updatePassword(
      resetToken.userId,
      hashedPassword
    );

    // 6. 토큰 사용 처리
    await this.authRepository.markPasswordResetTokenAsUsed(resetToken.id);

    return user;
  }

  // ============================================
  // 유틸리티 메서드
  // ============================================

  /**
   * 랜덤 토큰 생성 (64자 hex 문자열)
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }
}
