"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  UserRole,
  AuthProvider as AuthProviderEnum,
} from "@jeju-tourlist/types";

/**
 * 인증 컨텍스트 타입 정의
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (provider: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

/**
 * 인증 컨텍스트 생성
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 인증 컨텍스트 프로바이더
 * Single Responsibility Principle: 인증 상태 관리만 담당
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // NextAuth 세션을 User 타입으로 변환
  useEffect(() => {
    console.log("🔄 AuthContext 세션 업데이트:", {
      status,
      hasSession: !!session,
      sessionUser: session?.user,
      timestamp: new Date().toISOString(),
    });

    // 테스트 환경에서 인증 상태 강제 설정
    if (typeof window !== "undefined" && window.__AUTH_STATE__) {
      const testAuthState = window.__AUTH_STATE__;
      if (testAuthState.isAuthenticated && testAuthState.user) {
        const userData: User = {
          id: testAuthState.user.id || "",
          email: testAuthState.user.email || "",
          name: testAuthState.user.name || "",
          profileImage: testAuthState.user.profileImage || undefined,
          provider: AuthProviderEnum.LOCAL,
          providerId: testAuthState.user.id || "",
          role: UserRole.USER,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        console.log("🧪 테스트 사용자 설정:", userData);
        setUser(userData);
        setIsLoading(false);
        return;
      }
    }

    if (status === "loading") {
      console.log("⏳ 세션 로딩 중...");
      setIsLoading(true);
      return;
    }

    if (status === "unauthenticated") {
      console.log("❌ 인증되지 않음 - 사용자 null 설정");
      setUser(null);
      setIsLoading(false);
      return;
    }

    // 세션은 있지만 사용자 정보가 없는 경우 (비정상 상태)
    if (session && !session.user) {
      console.log("⚠️ 세션은 있지만 사용자 정보 없음 - 로그아웃 처리");
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (session?.user) {
      const userData: User = {
        id: (session.user as any).id || "",
        email: session.user.email || "",
        name: session.user.name || "",
        profileImage: session.user.image || undefined,
        provider: (session.user as any).provider || "local",
        providerId: (session.user as any).providerId || "",
        role: "user" as UserRole,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      console.log("✅ 사용자 데이터 설정:", {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      });
      setUser(userData);
    } else {
      // session이 null이면 로그아웃 상태
      console.log("ℹ️ 세션 없음 - 로그아웃 상태");
      setUser(null);
    }

    setIsLoading(false);
  }, [session, status]);

  const login = (provider: string) => {
    // NextAuth의 signIn 함수 사용
    import("next-auth/react").then(({ signIn }) => {
      signIn(provider);
    });
  };

  const logout = async () => {
    console.log("🚪 로그아웃 함수 호출됨");
    try {
      // 로컬 상태 즉시 초기화
      setUser(null);
      setIsLoading(false);

      // NextAuth의 signOut 함수 사용
      const { signOut } = await import("next-auth/react");
      console.log("🔓 signOut 함수 호출 시작");

      // signOut 호출 - redirect 없이 세션만 삭제
      await signOut({
        redirect: false,
      });

      console.log("✅ signOut 완료 - 페이지 리로드");

      // 강제 페이지 리로드로 완전한 로그아웃
      window.location.href = "/";
    } catch (error) {
      console.error("❌ Logout error:", error);
      // 에러 발생 시에도 강제 리다이렉트
      window.location.href = "/";
    }
  };

  const refreshUser = async () => {
    // 사용자 정보 새로고침
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.data);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    role: user?.role || null,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * 인증 컨텍스트 훅
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * 인증 상태 확인 훅
 */
export function useRequireAuth() {
  const { user, isLoading } = useAuth();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
