'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

// Zod 스키마 정의
export const registerFormSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식이 아닙니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.'
    ),
  passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다.')
    .max(20, '이름은 최대 20자까지 입력 가능합니다.'),
  nickname: z
    .string()
    .min(2, '닉네임은 최소 2자 이상이어야 합니다.')
    .max(20, '닉네임은 최대 20자까지 입력 가능합니다.')
    .regex(
      /^[가-힣a-zA-Z0-9]+$/,
      '닉네임은 한글, 영문, 숫자만 사용 가능합니다.'
    ),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: '이용약관에 동의해주세요.',
  }),
  agreeToPrivacy: z.boolean().refine((val) => val === true, {
    message: '개인정보처리방침에 동의해주세요.',
  }),
  agreeToMarketing: z.boolean().optional().default(false),
}).refine((data) => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['passwordConfirm'],
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;

export function useRegisterForm(callbackUrl: string = '/') {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema as any),
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
      name: '',
      nickname: '',
      agreeToTerms: false,
      agreeToPrivacy: false,
      agreeToMarketing: false,
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(
        `http://localhost:4000/api/auth/email/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            passwordConfirm: data.passwordConfirm,
            name: data.name,
            nickname: data.nickname,
            agreeToTerms: data.agreeToTerms,
            agreeToPrivacy: data.agreeToPrivacy,
            agreeToMarketing: data.agreeToMarketing,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '회원가입에 실패했습니다.');
      }

      // 성공 시 로그인 페이지로 리다이렉트 (callbackUrl 포함)
      const loginUrl = `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}&message=회원가입이 완료되었습니다. 로그인해주세요.`;
      router.push(loginUrl);
    } catch (error) {
      console.error('회원가입 에러:', error);
      setSubmitError(
        error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    submitError,
  };
}
