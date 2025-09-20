"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@jeju-tourlist/types";
import { Button } from "@/components/ui/button";
import { LogIn, Shield } from "lucide-react";

/**
 * 보호된 라우트 컴포넌트
 * Single Responsibility Principle: 인증 기반 라우트 보호만 담당
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
  _redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallback,
  _redirectTo = "/auth/signin",
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, login } = useAuth();

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우
  if (!isAuthenticated || !user) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              로그인이 필요합니다
            </h2>
            <p className="text-gray-600 mb-6">
              이 페이지에 접근하려면 로그인해주세요.
            </p>
            <div className="space-y-3">
              <Button onClick={() => login("kakao")} className="w-full">
                <LogIn className="w-4 h-4 mr-2" />
                카카오로 로그인
              </Button>
              <Button
                onClick={() => login("naver")}
                variant="outline"
                className="w-full"
              >
                <LogIn className="w-4 h-4 mr-2" />
                네이버로 로그인
              </Button>
              <Button
                onClick={() => login("google")}
                variant="outline"
                className="w-full"
              >
                <LogIn className="w-4 h-4 mr-2" />
                구글로 로그인
              </Button>
            </div>
          </div>
        </div>
      )
    );
  }

  // 역할 기반 접근 제어
  if (requiredRole) {
    const hasRequiredRole = checkUserRole(user.role, requiredRole);

    if (!hasRequiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              접근 권한이 없습니다
            </h2>
            <p className="text-gray-600 mb-6">
              이 페이지에 접근하려면 {getRoleDisplayName(requiredRole)} 권한이
              필요합니다.
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              이전 페이지로 돌아가기
            </Button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

/**
 * 사용자 역할 확인
 */
function checkUserRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    moderator: 2,
    admin: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * 역할 표시 이름 반환
 */
function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    user: "일반 사용자",
    moderator: "모더레이터",
    admin: "관리자",
  };

  return roleNames[role];
}
