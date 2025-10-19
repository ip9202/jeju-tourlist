/**
 * 인증 컨텍스트
 * 간단한 인증 상태 관리 및 API 연동
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/lib/apiClient";
import { AUTH_CONSTANTS } from "@/lib/constants";

// 타입 정의
export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  provider?: string;
  createdAt?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// API 응답 타입
interface ApiResponseData<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface LoginResponseData {
  user: User;
  message?: string;
}

interface MeResponseData {
  user: User;
  expiresAt?: string;
}

type LoginResponse = ApiResponseData<LoginResponseData>;
type MeResponse = ApiResponseData<MeResponseData>;

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 인증 상태 계산
  const isAuthenticated = !!user;

  // 초기 로드 시 사용자 정보 확인
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 클라이언트 사이드에서만 localStorage 접근
        if (typeof window === "undefined") {
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await api.get<MeResponse>("/auth/me");
        const userData = response.data as MeResponseData | undefined;
        if (response.success && userData?.user) {
          setUser(userData.user);
        } else {
          // 토큰이 유효하지 않으면 제거
          localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (typeof window !== "undefined") {
          localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 로그인 함수
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const response = await api.post<LoginResponse>("/api/auth/login", {
        email,
        password,
      });

      const loginData = response.data as LoginResponseData | undefined;
      if (response.success && loginData?.user) {
        // 클라이언트 사이드에서만 localStorage 접근
        if (typeof window !== "undefined") {
          // 임시로 사용자 ID를 토큰으로 사용 (나중에 JWT로 변경 필요)
          const tempToken = `temp_${loginData.user.id}_${Date.now()}`;
          localStorage.setItem(AUTH_CONSTANTS.TOKEN_KEY, tempToken);
        }
        // 사용자 정보 설정
        setUser(loginData.user);
        return { success: true, message: "로그인이 완료되었습니다" };
      } else {
        return {
          success: false,
          message: response.message || "로그인에 실패했습니다",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "로그인 중 오류가 발생했습니다.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = async (): Promise<void> => {
    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token");
        if (token) {
          await api.post("/api/auth/logout");
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // 로컬 상태 정리
      if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
      }
      setUser(null);
    }
  };

  // 세션 갱신 함수 (현재는 사용하지 않음 - JWT 토큰 구현 시 필요)
  const refreshSession = async (): Promise<void> => {
    try {
      // TODO: JWT 토큰 갱신 API 구현 필요
      console.log("Session refresh not implemented yet");
    } catch (error) {
      console.error("Session refresh error:", error);
      await logout();
    }
  };

  // 사용자 정보 갱신 함수
  const refreshUser = async (): Promise<void> => {
    try {
      const response = await api.get<MeResponse>("/auth/me");
      const userData = response.data as MeResponseData | undefined;
      if (response.success && userData?.user) {
        setUser(userData.user);
      } else {
        // 사용자 정보 조회 실패 시 로그아웃
        await logout();
      }
    } catch (error) {
      console.error("User refresh error:", error);
      // 사용자 정보 조회 실패 시 로그아웃
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshSession,
    refreshUser,
  };

  // Hydration 에러 방지를 위해 로딩 상태에서도 children 렌더링
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth 훅
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
