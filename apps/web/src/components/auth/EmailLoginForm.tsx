"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";

// Zod 스키마 정의
const emailLoginSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해주세요.")
    .email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

type EmailLoginFormData = z.infer<typeof emailLoginSchema>;

interface EmailLoginFormProps {
  callbackUrl?: string;
}

export function EmailLoginForm({ callbackUrl = "/" }: EmailLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailLoginFormData>({
    resolver: zodResolver(emailLoginSchema as any),
    mode: "onBlur",
  });

  const onSubmit = async (data: EmailLoginFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      console.log("로그인 결과:", result);

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setSubmitError("이메일 또는 비밀번호가 올바르지 않습니다.");
        } else {
          setSubmitError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
      } else if (result?.ok) {
        console.log("✅ 로그인 성공 - 3초 후 페이지 리다이렉트");
        setSubmitError("로그인 성공! 3초 후 메인 페이지로 이동합니다...");

        // 3초 대기 후 리다이렉트
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log("🔄 리다이렉트 시작");
        // 로그인 성공 시 전체 페이지 리다이렉트 (쿠키 적용 보장)
        window.location.href = callbackUrl;
      }
    } catch (error) {
      console.error("Login error:", error);
      setSubmitError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 에러/성공 메시지 */}
      {submitError && (
        <Alert
          variant={submitError.includes("성공") ? "default" : "destructive"}
        >
          {submitError.includes("성공") ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* 이메일 입력 */}
      <div className="space-y-2">
        <Label htmlFor="login-email">이메일</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="example@email.com"
          {...register("email")}
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* 비밀번호 입력 */}
      <div className="space-y-2">
        <Label htmlFor="login-password">비밀번호</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호를 입력하세요"
            {...register("password")}
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
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
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
      </div>

      {/* 로그인 버튼 */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
        aria-disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            로그인 중...
          </>
        ) : (
          "로그인"
        )}
      </Button>
    </form>
  );
}
