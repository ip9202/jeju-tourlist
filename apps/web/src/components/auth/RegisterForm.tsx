'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

export function RegisterForm() {
  const { form, onSubmit, isSubmitting, submitError } = useRegisterForm();
  const { register, formState: { errors }, watch } = form;
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const password = watch('password');

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* 에러 메시지 */}
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* 이메일 */}
      <div className="space-y-2">
        <Label htmlFor="register-email">이메일</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="example@email.com"
          {...register('email')}
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* 비밀번호 */}
      <div className="space-y-2">
        <Label htmlFor="register-password">비밀번호</Label>
        <div className="relative">
          <Input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="영문, 숫자, 특수문자 조합 8자 이상"
            {...register('password')}
            disabled={isSubmitting}
            aria-invalid={!!errors.password}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isSubmitting}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
        <PasswordStrengthIndicator password={password} />
      </div>

      {/* 비밀번호 확인 */}
      <div className="space-y-2">
        <Label htmlFor="register-password-confirm">비밀번호 확인</Label>
        <div className="relative">
          <Input
            id="register-password-confirm"
            type={showPasswordConfirm ? 'text' : 'password'}
            placeholder="비밀번호를 다시 입력해주세요"
            {...register('passwordConfirm')}
            disabled={isSubmitting}
            aria-invalid={!!errors.passwordConfirm}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            disabled={isSubmitting}
          >
            {showPasswordConfirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.passwordConfirm && (
          <p className="text-sm text-destructive">{errors.passwordConfirm.message}</p>
        )}
      </div>

      {/* 이름 */}
      <div className="space-y-2">
        <Label htmlFor="register-name">이름</Label>
        <Input
          id="register-name"
          type="text"
          placeholder="홍길동"
          {...register('name')}
          disabled={isSubmitting}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* 닉네임 */}
      <div className="space-y-2">
        <Label htmlFor="register-nickname">닉네임</Label>
        <Input
          id="register-nickname"
          type="text"
          placeholder="제주여행러"
          {...register('nickname')}
          disabled={isSubmitting}
          aria-invalid={!!errors.nickname}
        />
        {errors.nickname && (
          <p className="text-sm text-destructive">{errors.nickname.message}</p>
        )}
      </div>

      {/* 이용약관 동의 */}
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="register-terms"
            {...register('agreeToTerms')}
            disabled={isSubmitting}
            aria-invalid={!!errors.agreeToTerms}
          />
          <div className="space-y-1">
            <Label
              htmlFor="register-terms"
              className="text-sm font-normal cursor-pointer"
            >
              이용약관에 동의합니다. <span className="text-destructive">*</span>
            </Label>
            {errors.agreeToTerms && (
              <p className="text-sm text-destructive">{errors.agreeToTerms.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="register-privacy"
            {...register('agreeToPrivacy')}
            disabled={isSubmitting}
            aria-invalid={!!errors.agreeToPrivacy}
          />
          <div className="space-y-1">
            <Label
              htmlFor="register-privacy"
              className="text-sm font-normal cursor-pointer"
            >
              개인정보처리방침에 동의합니다. <span className="text-destructive">*</span>
            </Label>
            {errors.agreeToPrivacy && (
              <p className="text-sm text-destructive">{errors.agreeToPrivacy.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="register-marketing"
            {...register('agreeToMarketing')}
            disabled={isSubmitting}
          />
          <div className="space-y-1">
            <Label
              htmlFor="register-marketing"
              className="text-sm font-normal cursor-pointer"
            >
              마케팅 정보 수신에 동의합니다. (선택)
            </Label>
          </div>
        </div>
      </div>

      {/* 제출 버튼 */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            회원가입 중...
          </>
        ) : (
          '회원가입'
        )}
      </Button>
    </form>
  );
}
