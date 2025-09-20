"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, Mail, Lock } from "lucide-react";

/**
 * 로그인 페이지
 * Single Responsibility Principle: 로그인 UI만 담당
 */
export default function SignInPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            동네물어봐에 로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            제주 여행 정보를 공유하고 질문해보세요
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* 소셜 로그인 버튼들 */}
          <div className="space-y-3">
            <Button
              onClick={() => login("kakao")}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
            >
              <LogIn className="w-5 h-5 mr-2" />
              카카오로 로그인
            </Button>

            <Button
              onClick={() => login("naver")}
              variant="outline"
              className="w-full border-green-500 text-green-600 hover:bg-green-50"
            >
              <LogIn className="w-5 h-5 mr-2" />
              네이버로 로그인
            </Button>

            <Button
              onClick={() => login("google")}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <LogIn className="w-5 h-5 mr-2" />
              구글로 로그인
            </Button>
          </div>

          {/* 구분선 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">또는</span>
            </div>
          </div>

          {/* 이메일 로그인 폼 (향후 구현) */}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                이메일 주소
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="이메일 주소"
                  disabled
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="비밀번호"
                  disabled
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled>
              <LogIn className="w-5 h-5 mr-2" />
              이메일로 로그인 (준비 중)
            </Button>
          </div>

          {/* 안내 메시지 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              아직 계정이 없으신가요?{" "}
              <span className="text-indigo-600 hover:text-indigo-500 cursor-pointer">
                소셜 로그인으로 간편하게 시작하세요
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
