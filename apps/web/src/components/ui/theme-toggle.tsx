"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Sun, 
  Moon, 
  Monitor,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 테마 타입
 */
export type Theme = "light" | "dark" | "system";

/**
 * ThemeToggle 컴포넌트 Props
 */
export interface ThemeToggleProps {
  variant?: "default" | "compact" | "minimal";
  showLabel?: boolean;
  className?: string;
}

/**
 * ThemeToggle 컴포넌트
 * 
 * @description
 * - 다크/라이트/시스템 테마 전환 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성 및 반응형 디자인 적용
 * 
 * @example
 * ```tsx
 * <ThemeToggle variant="default" showLabel={true} />
 * ```
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "default",
  showLabel = true,
  className,
}) => {
  const [theme, setTheme] = React.useState<Theme>("system");
  const [mounted, setMounted] = React.useState(false);

  /**
   * 컴포넌트 마운트 확인
   */
  React.useEffect(() => {
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
    
    // 시스템 테마 감지
    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      document.documentElement.classList.toggle("dark", systemTheme === "dark");
    } else {
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
  };

  /**
   * 시스템 테마 변경 감지
   */
  React.useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle("dark", e.matches);
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  // SSR 대응
  if (!mounted) {
    return null;
  }

  // Minimal variant 렌더링
  if (variant === "minimal") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleThemeChange(theme === "light" ? "dark" : "light")}
        className={cn("h-8 w-8 p-0", className)}
      >
        {theme === "light" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
        <span className="sr-only">테마 전환</span>
      </Button>
    );
  }

  // Compact variant 렌더링
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center space-x-1", className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleThemeChange("light")}
          className={cn(
            "h-8 px-2",
            theme === "light" && "bg-accent text-accent-foreground"
          )}
        >
          <Sun className="h-3 w-3 mr-1" />
          {showLabel && <span className="text-xs">라이트</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleThemeChange("dark")}
          className={cn(
            "h-8 px-2",
            theme === "dark" && "bg-accent text-accent-foreground"
          )}
        >
          <Moon className="h-3 w-3 mr-1" />
          {showLabel && <span className="text-xs">다크</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleThemeChange("system")}
          className={cn(
            "h-8 px-2",
            theme === "system" && "bg-accent text-accent-foreground"
          )}
        >
          <Monitor className="h-3 w-3 mr-1" />
          {showLabel && <span className="text-xs">시스템</span>}
        </Button>
      </div>
    );
  }

  // Default variant 렌더링
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleThemeChange("light")}
        className={cn(
          "h-9 px-3",
          theme === "light" && "bg-accent text-accent-foreground"
        )}
      >
        <Sun className="h-4 w-4 mr-2" />
        {showLabel && <span>라이트</span>}
        {theme === "light" && <Check className="h-3 w-3 ml-1" />}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleThemeChange("dark")}
        className={cn(
          "h-9 px-3",
          theme === "dark" && "bg-accent text-accent-foreground"
        )}
      >
        <Moon className="h-4 w-4 mr-2" />
        {showLabel && <span>다크</span>}
        {theme === "dark" && <Check className="h-3 w-3 ml-1" />}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleThemeChange("system")}
        className={cn(
          "h-9 px-3",
          theme === "system" && "bg-accent text-accent-foreground"
        )}
      >
        <Monitor className="h-4 w-4 mr-2" />
        {showLabel && <span>시스템</span>}
        {theme === "system" && <Check className="h-3 w-3 ml-1" />}
      </Button>
    </div>
  );
};
