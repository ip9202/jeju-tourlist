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
  const { data: session, status, update } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 세션 강제 갱신 (한 번만)
  useEffect(() => {
    console.log("🔄 AuthProvider 마운트됨 - 세션 갱신 시작");
    // 세션 갱신을 비동기로 처리
    const refreshSession = async () => {
      try {
        console.log("🔄 세션 갱신 시도...");
        await update();
        console.log("✅ 세션 갱신 완료");

        // 추가로 1초 후에 한 번 더 갱신 시도
        setTimeout(async () => {
          console.log("🔄 추가 세션 갱신 시도...");
          await update();
          console.log("✅ 추가 세션 갱신 완료");
        }, 1000);
      } catch (error) {
        console.error("❌ 세션 갱신 실패:", error);
      }
    };
    refreshSession();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, []);

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

    // 세션이 존재하고 사용자 정보가 있는 경우 (인증됨)
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

    // status가 unauthenticated이거나 session이 없는 경우
    if (status === "unauthenticated" || !session) {
      console.log("❌ 인증되지 않음 - 사용자 null 설정");
      setUser(null);
      setIsLoading(false);
      return;
    }

    // 기타 경우
    console.log("ℹ️ 기타 상태 - 사용자 null 설정");
    setUser(null);
    setIsLoading(false);
  }, [session, status]);

  // 세션 상태가 unauthenticated일 때 강제로 세션 갱신 시도
  useEffect(() => {
    if (status === "unauthenticated" && !isLoading) {
      console.log("🔄 unauthenticated 상태 감지 - 세션 강제 갱신 시도");
      const forceRefresh = async () => {
        try {
          console.log("🔄 강제 세션 갱신 시작...");
          await update();
          console.log("✅ 강제 세션 갱신 완료");
        } catch (error) {
          console.error("❌ 강제 세션 갱신 실패:", error);
        }
      };
      forceRefresh();
    }
  }, [status, isLoading, update]);

  // 로그인 후 세션 갱신을 위한 추가 useEffect
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      console.log("🔄 인증된 상태 감지 - 세션 갱신 시도");
      const refreshAfterAuth = async () => {
        try {
          console.log("🔄 인증 후 세션 갱신 시작...");
          await update();
          console.log("✅ 인증 후 세션 갱신 완료");
        } catch (error) {
          console.error("❌ 인증 후 세션 갱신 실패:", error);
        }
      };
      // 약간의 지연 후 갱신 (토큰 생성 완료 후)
      setTimeout(refreshAfterAuth, 100);
    }
  }, [status, session?.user, update]);

  // 주기적 세션 갱신 비활성화 (너무 자주 갱신되어 문제 발생)
  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     console.log("🔄 주기적 세션 갱신 시도", { status, hasSession: !!session?.user });
  //     try {
  //       await update();
  //       console.log("✅ 주기적 세션 갱신 완료");
  //     } catch (error) {
  //       console.error("❌ 주기적 세션 갱신 실패:", error);
  //     }
  //   }, 2000); // 2초마다 갱신

  //   return () => clearInterval(interval);
  // }, [status, session?.user, update]);

  const login = (provider: string) => {
    // NextAuth의 signIn 함수 사용
    import("next-auth/react").then(({ signIn }) => {
      signIn(provider);
    });
  };

  const logout = async () => {
    console.log("🚪 로그아웃 함수 호출됨");
    try {
      // NextAuth의 signOut 함수 사용
      const { signOut } = await import("next-auth/react");
      console.log("🔓 signOut 함수 호출 시작");

      // signOut 호출 - redirect 없이 세션만 삭제
      await signOut({
        redirect: false,
      });

      console.log("✅ signOut 완료");

      // 로그아웃 후 세션 강제 갱신
      console.log("🔄 로그아웃 후 세션 갱신 시도...");
      await update();
      console.log("✅ 로그아웃 후 세션 갱신 완료");

      // 로컬 상태 즉시 초기화
      setUser(null);
      setIsLoading(false);

      console.log("📊 현재 상태:", {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      console.log("⏰ 3초 후 리다이렉트 예정...");
      setTimeout(() => {
        console.log("🔄 리다이렉트 실행");
        window.location.href = "/";
      }, 3000);
    } catch (error) {
      console.error("❌ Logout error:", error);
      console.error(
        "❌ Error stack:",
        error instanceof Error ? error.stack : "No stack"
      );

      // 에러 발생 시에도 로컬 상태 초기화
      setUser(null);
      setIsLoading(false);

      // 에러 발생 시에도 3초 후 리다이렉트
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
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
