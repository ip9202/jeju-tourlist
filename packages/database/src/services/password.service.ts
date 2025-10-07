/**
 * PasswordService - 비밀번호 해싱 및 검증 서비스
 *
 * SOLID Principles:
 * - SRP: 비밀번호 해싱과 검증만 담당
 * - OCP: 인터페이스 기반으로 확장 가능 (예: Argon2 추가)
 * - DIP: 구현 세부사항(bcrypt)을 추상화
 */

import bcrypt from "bcrypt";

/**
 * 비밀번호 서비스 인터페이스
 */
export interface IPasswordService {
  /**
   * 비밀번호 해싱
   * @param plainPassword 평문 비밀번호
   * @returns Promise<해싱된 비밀번호>
   */
  hash(plainPassword: string): Promise<string>;

  /**
   * 비밀번호 검증
   * @param plainPassword 평문 비밀번호
   * @param hashedPassword 해싱된 비밀번호
   * @returns Promise<검증 결과 (true: 일치, false: 불일치)>
   */
  verify(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

/**
 * bcrypt 기반 비밀번호 서비스 구현
 */
export class BcryptPasswordService implements IPasswordService {
  private readonly saltRounds: number;

  /**
   * @param saltRounds bcrypt salt rounds (기본값: 10)
   */
  constructor(saltRounds: number = 10) {
    this.saltRounds = saltRounds;
  }

  /**
   * 비밀번호 해싱
   * @param plainPassword 평문 비밀번호
   * @returns Promise<해싱된 비밀번호>
   * @throws Error 해싱 실패 시
   */
  async hash(plainPassword: string): Promise<string> {
    try {
      const hashedPassword = await bcrypt.hash(plainPassword, this.saltRounds);
      return hashedPassword;
    } catch (error) {
      throw new Error(
        `비밀번호 해싱 실패: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * 비밀번호 검증
   * @param plainPassword 평문 비밀번호
   * @param hashedPassword 해싱된 비밀번호
   * @returns Promise<검증 결과 (true: 일치, false: 불일치)>
   * @throws Error 검증 실패 시
   */
  async verify(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      throw new Error(
        `비밀번호 검증 실패: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

/**
 * 싱글톤 PasswordService 인스턴스
 *
 * 사용 예시:
 * ```typescript
 * import { passwordService } from "@jeju-tourlist/database/services/password.service";
 *
 * // 비밀번호 해싱
 * const hashedPassword = await passwordService.hash("myPassword123!");
 *
 * // 비밀번호 검증
 * const isValid = await passwordService.verify("myPassword123!", hashedPassword);
 * ```
 */
export const passwordService = new BcryptPasswordService(10);

/**
 * 기본 내보내기 (편의용)
 */
export default passwordService;
