import bcrypt from "bcryptjs";

/**
 * 비밀번호 암호화 및 검증 서비스
 * Single Responsibility Principle: 비밀번호 관련 작업만 담당
 */
export class PasswordService {
  private readonly saltRounds: number = 12;

  /**
   * 비밀번호 해시화
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * 비밀번호 검증
   */
  async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * 비밀번호 강도 검증
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("비밀번호는 최소 8자 이상이어야 합니다.");
    }

    if (password.length > 128) {
      errors.push("비밀번호는 최대 128자까지 가능합니다.");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("비밀번호는 대문자를 포함해야 합니다.");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("비밀번호는 소문자를 포함해야 합니다.");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("비밀번호는 숫자를 포함해야 합니다.");
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push("비밀번호는 특수문자를 포함해야 합니다.");
    }

    // 연속된 문자나 숫자 체크
    if (/(.)\1{2,}/.test(password)) {
      errors.push(
        "비밀번호에 연속된 3개 이상의 동일한 문자가 포함될 수 없습니다."
      );
    }

    // 일반적인 패턴 체크
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /admin/i,
      /user/i,
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        errors.push("비밀번호에 일반적인 패턴이 포함되어 있습니다.");
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 비밀번호가 이전 비밀번호와 다른지 확인
   */
  async isPasswordDifferent(
    newPassword: string,
    currentHashedPassword: string
  ): Promise<boolean> {
    return !(await this.verifyPassword(newPassword, currentHashedPassword));
  }

  /**
   * 비밀번호 힌트 생성 (보안을 위해 일부만 표시)
   */
  generatePasswordHint(password: string): string {
    if (password.length <= 2) {
      return "*".repeat(password.length);
    }

    const firstChar = password[0];
    const lastChar = password[password.length - 1];
    const middleChars = "*".repeat(password.length - 2);

    return `${firstChar}${middleChars}${lastChar}`;
  }
}
