'use client';

import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordStrength {
  score: number; // 0-4 (약함-강함)
  label: string;
  color: string;
  percentage: number;
}

function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  let label = '매우 약함';
  let color = 'bg-red-500';

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  // 점수에 따른 레이블과 색상 설정
  if (score >= 4) {
    label = '강함';
    color = 'bg-green-500';
  } else if (score >= 3) {
    label = '보통';
    color = 'bg-yellow-500';
  } else if (score >= 2) {
    label = '약함';
    color = 'bg-orange-500';
  } else if (score >= 1) {
    label = '매우 약함';
    color = 'bg-red-500';
  }

  const percentage = (score / 4) * 100;

  return {
    score,
    label,
    color,
    percentage,
  };
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  if (!password) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${strength.color.replace('bg-', 'text-')}`}>
          {strength.label}
        </span>
        <span className="text-muted-foreground">
          {strength.score === 4
            ? '안전한 비밀번호입니다.'
            : '영문, 숫자, 특수문자를 조합하세요.'}
        </span>
      </div>
      <Progress 
        value={strength.percentage} 
        className="h-2"
      />
    </div>
  );
}
