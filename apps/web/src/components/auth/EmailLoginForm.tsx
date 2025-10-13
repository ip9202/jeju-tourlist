"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
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
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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
    setIsSuccess(false);

    try {
      const result = await login(data.email, data.password);

      console.log("로그인 결과:", result);

      if (!result.success) {
        setSubmitError(
          result.message || "이메일 또는 비밀번호가 올바르지 않습니다."
        );
      } else {
        console.log("✅ 로그인 성공 - 페이지 리다이렉트");
        setIsSuccess(true);
        setSubmitError("로그인 성공! 페이지를 이동합니다...");

        // 잠시 대기 후 리다이렉트
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log("🔄 리다이렉트 시작:", callbackUrl);
        router.push(callbackUrl);
        router.refresh();
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
        <Alert variant={isSuccess ? "default" : "destructive"}>
          {isSuccess ? (
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
