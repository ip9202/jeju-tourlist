/**
 * Auth Schema - 인증 관련 Zod 스키마 정의
 *
 * SOLID Principles:
 * - SRP: 회원가입, 로그인, 비밀번호 재설정 등 인증 관련 스키마만 관리
 * - OCP: 새로운 인증 방식 추가 시 기존 스키마 수정 없이 확장 가능
 * - DIP: 인터페이스 기반 설계로 구현 세부사항에 의존하지 않음
 */

import { z } from "zod";

// ============================================
// 회원가입 스키마
// ============================================

/**
 * 이메일 회원가입 요청 스키마
 *
 * 검증 규칙:
 * - email: 유효한 이메일 형식
 * - password: 최소 8자, 영문+숫자+특수문자 조합
 * - passwordConfirm: password와 일치
 * - nickname: 2~20자, 한글/영문/숫자만 허용
 * - name: 1~50자, 실명
 * - terms: 필수 약관 동의 (개인정보, 서비스 이용)
 */
export const RegisterSchema = z
  .object({
    email: z
      .string()
      .email({ message: "유효한 이메일 주소를 입력해주세요" })
      .min(1, { message: "이메일은 필수 입력 항목입니다" }),

    password: z
      .string()
      .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다" })
      .max(100, { message: "비밀번호는 100자를 초과할 수 없습니다" })
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/, {
        message: "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다",
      }),

    passwordConfirm: z
      .string()
      .min(1, { message: "비밀번호 확인은 필수 입력 항목입니다" }),

    nickname: z
      .string()
      .min(2, { message: "닉네임은 최소 2자 이상이어야 합니다" })
      .max(20, { message: "닉네임은 20자를 초과할 수 없습니다" })
      .regex(/^[가-힣a-zA-Z0-9]+$/, {
        message: "닉네임은 한글, 영문, 숫자만 사용 가능합니다",
      }),

    name: z
      .string()
      .min(1, { message: "이름은 필수 입력 항목입니다" })
      .max(50, { message: "이름은 50자를 초과할 수 없습니다" }),

    // 약관 동의
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: "서비스 이용약관에 동의해주세요",
    }),

    agreeToPrivacy: z.boolean().refine(val => val === true, {
      message: "개인정보 처리방침에 동의해주세요",
    }),

    agreeToMarketing: z.boolean().optional().default(false),
  })
  .refine(data => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordConfirm"],
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;

// ============================================
// 로그인 스키마
// ============================================

/**
 * 이메일 로그인 요청 스키마
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .email({ message: "유효한 이메일 주소를 입력해주세요" })
    .min(1, { message: "이메일은 필수 입력 항목입니다" }),

  password: z.string().min(1, { message: "비밀번호는 필수 입력 항목입니다" }),

  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ============================================
// 비밀번호 재설정 스키마
// ============================================

/**
 * 비밀번호 재설정 요청 스키마 (이메일 발송)
 */
export const PasswordResetRequestSchema = z.object({
  email: z
    .string()
    .email({ message: "유효한 이메일 주소를 입력해주세요" })
    .min(1, { message: "이메일은 필수 입력 항목입니다" }),
});

export type PasswordResetRequestInput = z.infer<
  typeof PasswordResetRequestSchema
>;

/**
 * 비밀번호 재설정 확인 스키마 (토큰 + 새 비밀번호)
 */
export const PasswordResetConfirmSchema = z
  .object({
    token: z.string().min(1, { message: "토큰이 유효하지 않습니다" }),

    password: z
      .string()
      .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다" })
      .max(100, { message: "비밀번호는 100자를 초과할 수 없습니다" })
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/, {
        message: "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다",
      }),

    passwordConfirm: z
      .string()
      .min(1, { message: "비밀번호 확인은 필수 입력 항목입니다" }),
  })
  .refine(data => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordConfirm"],
  });

export type PasswordResetConfirmInput = z.infer<
  typeof PasswordResetConfirmSchema
>;

// ============================================
// 이메일 인증 스키마
// ============================================

/**
 * 이메일 인증 토큰 스키마
 */
export const EmailVerificationSchema = z.object({
  token: z.string().min(1, { message: "토큰이 유효하지 않습니다" }),
});

export type EmailVerificationInput = z.infer<typeof EmailVerificationSchema>;

/**
 * 이메일 인증 재발송 스키마
 */
export const ResendVerificationSchema = z.object({
  email: z
    .string()
    .email({ message: "유효한 이메일 주소를 입력해주세요" })
    .min(1, { message: "이메일은 필수 입력 항목입니다" }),
});

export type ResendVerificationInput = z.infer<typeof ResendVerificationSchema>;
