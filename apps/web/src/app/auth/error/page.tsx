"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

/**
 * 인증 에러 페이지
 * Single Responsibility Principle: 인증 에러 표시만 담당
 */
function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  const getErrorMessage = () => {
    if (message) {
      return decodeURIComponent(message);
    }

    switch (error) {
      case "Configuration":
        return "서버 설정에 문제가 있습니다. 잠시 후 다시 시도해주세요.";
      case "AccessDenied":
        return "접근이 거부되었습니다. 권한을 확인해주세요.";
      case "Verification":
        return "인증에 실패했습니다. 다시 시도해주세요.";
      case "Default":
      default:
        return "로그인 중 오류가 발생했습니다. 다시 시도해주세요.";
    }
  };

  const handleRetry = () => {
    window.location.href = "/auth/signin";
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            로그인 오류
          </h2>
          <p className="mt-2 text-sm text-gray-600">{getErrorMessage()}</p>
        </div>

        <div className="mt-8 space-y-4">
          <Button onClick={handleRetry} className="w-full">
            <RefreshCw className="w-5 h-5 mr-2" />
            다시 시도
          </Button>

          <Button onClick={handleGoHome} variant="outline" className="w-full">
            <Home className="w-5 h-5 mr-2" />
            홈으로 돌아가기
          </Button>
        </div>

        {/* 도움말 섹션 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            문제가 계속 발생하나요?
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 브라우저의 쿠키와 캐시를 삭제해보세요</li>
            <li>• 다른 브라우저로 시도해보세요</li>
            <li>• 네트워크 연결을 확인해보세요</li>
            <li>• 잠시 후 다시 시도해보세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
