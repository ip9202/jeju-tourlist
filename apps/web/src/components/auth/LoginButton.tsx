"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";

/**
 * 로그인/로그아웃 버튼 컴포넌트
 * Single Responsibility Principle: 로그인/로그아웃 UI만 담당
 */
export function LoginButton() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  if (isLoading) {
    return (
      <Button disabled variant="outline" size="sm">
        <User className="w-4 h-4 mr-2" />
        로딩 중...
      </Button>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          {user.profileImage && (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm font-medium">{user.name}</span>
        </div>
        <Button onClick={logout} variant="outline" size="sm">
          <LogOut className="w-4 h-4 mr-2" />
          로그아웃
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => login("kakao")} variant="outline" size="sm">
        <LogIn className="w-4 h-4 mr-2" />
        카카오 로그인
      </Button>
      <Button onClick={() => login("naver")} variant="outline" size="sm">
        <LogIn className="w-4 h-4 mr-2" />
        네이버 로그인
      </Button>
      <Button onClick={() => login("google")} variant="outline" size="sm">
        <LogIn className="w-4 h-4 mr-2" />
        구글 로그인
      </Button>
    </div>
  );
}
