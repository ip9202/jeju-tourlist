"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { User, UserRole } from "@jeju-tourlist/types";

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
    if (status === "loading") {
      setIsLoading(true);
      return;
    }

    if (status === "unauthenticated") {
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
        role: "user" as UserRole, // 기본값, 실제로는 API에서 가져와야 함
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setUser(userData);
    }

    setIsLoading(false);
  }, [session, status]);

  const login = (provider: string) => {
    // NextAuth의 signIn 함수 사용
    import("next-auth/react").then(({ signIn }) => {
      signIn(provider);
    });
  };

  const logout = () => {
    // NextAuth의 signOut 함수 사용
    import("next-auth/react").then(({ signOut }) => {
      signOut();
    });
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
