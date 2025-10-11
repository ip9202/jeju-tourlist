"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider
      // 세션 자동 갱신 간격 (5분으로 복원)
      refetchInterval={5 * 60}
      // 창이 포커스될 때 세션 갱신
      refetchOnWindowFocus={true}
      // 오프라인일 때도 세션 갱신 시도
      refetchWhenOffline={false}
      // API 경로 명시
      basePath="/api/auth"
    >
      {children}
    </NextAuthSessionProvider>
  );
}
