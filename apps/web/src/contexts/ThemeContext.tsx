"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * 테마 타입
 */
export type Theme = "light" | "dark" | "system";

/**
 * ThemeContext 타입
 */
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: "light" | "dark"; // 실제 적용된 테마
}

/**
 * ThemeContext 생성
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider Props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

/**
 * ThemeProvider 컴포넌트
 * 
 * @description
 * - 테마 상태를 관리하는 Context Provider
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 시스템 테마 감지 및 로컬 스토리지 지속성 지원
 * 
 * @example
 * ```tsx
 * <ThemeProvider defaultTheme="system">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "system",
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  /**
   * 컴포넌트 마운트 시 초기화
   */
  useEffect(() => {
    setMounted(true);
    
    // 로컬 스토리지에서 테마 설정 불러오기
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  /**
   * 테마 변경 핸들러
   */
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    // 실제 적용될 테마 계산
    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setActualTheme(systemTheme);
      document.documentElement.classList.toggle("dark", systemTheme === "dark");
    } else {
      setActualTheme(newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
  };

  /**
   * 시스템 테마 변경 감지
   */
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      
      const handleChange = (e: MediaQueryListEvent) => {
        const systemTheme = e.matches ? "dark" : "light";
        setActualTheme(systemTheme);
        document.documentElement.classList.toggle("dark", systemTheme === "dark");
      };
      
      // 초기 시스템 테마 설정
      const systemTheme = mediaQuery.matches ? "dark" : "light";
      setActualTheme(systemTheme);
      document.documentElement.classList.toggle("dark", systemTheme === "dark");
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      setActualTheme(theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  // SSR 대응
  if (!mounted) {
    return <>{children}</>;
  }

  const value: ThemeContextType = {
    theme,
    setTheme: handleThemeChange,
    actualTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme 훅
 * 
 * @description
 * - ThemeContext를 사용하기 위한 커스텀 훅
 * - 컴포넌트에서 테마 상태에 접근할 수 있도록 함
 * 
 * @returns ThemeContextType
 * @throws Error - ThemeProvider 외부에서 사용 시
 * 
 * @example
 * ```tsx
 * const { theme, setTheme, actualTheme } = useTheme();
 * ```
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
};
