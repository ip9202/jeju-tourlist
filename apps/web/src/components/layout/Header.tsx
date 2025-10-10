"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@jeju-tourlist/ui";
import {
  MapPin,
  Menu,
  Search,
  MessageSquare,
  Grid3x3,
  LogIn,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const isAuthenticated = status === "authenticated";

  // 디버깅
  React.useEffect(() => {
    console.log("🎯 Header 세션 상태:", {
      status,
      isAuthenticated,
      hasSession: !!session,
      sessionUser: session?.user,
    });
  }, [status, session, isAuthenticated]);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    console.log("🔴 로그아웃 시작");
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/questions?search=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-6 md:px-8">
        <Link href="/" className="mr-8 flex items-center space-x-2">
          <MapPin className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">동네물어봐</span>
        </Link>

        <nav className="mr-8 hidden md:flex items-center gap-2 text-sm">
          <Link
            href="/questions"
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              pathname === "/questions"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            질문
          </Link>
          <Link
            href="/categories"
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              pathname === "/categories"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <Grid3x3 className="h-4 w-4" />
            카테고리
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-4">
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-8 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </form>

          {/* 질문하기 버튼 - 항상 질문하기 페이지로 리다이렉트 */}
          <Link
            href={
              isAuthenticated
                ? "/questions/new"
                : `/auth/signin?callbackUrl=${encodeURIComponent("/questions/new")}`
            }
          >
            <Button size="sm" className="hidden md:inline-flex">
              질문하기
            </Button>
          </Link>

          <nav className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                )}
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </button>
            ) : (
              <Link
                href={`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                )}
              >
                <LogIn className="h-4 w-4" />
                로그인
              </Link>
            )}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="container border-t py-4 md:hidden px-6">
          <nav className="flex flex-col space-y-2">
            <Link
              href="/questions"
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                pathname === "/questions"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <MessageSquare className="h-4 w-4" />
              질문
            </Link>
            <Link
              href="/categories"
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                pathname === "/categories"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Grid3x3 className="h-4 w-4" />
              카테고리
            </Link>
            <Link
              href={
                isAuthenticated
                  ? "/questions/new"
                  : `/auth/signin?callbackUrl=${encodeURIComponent("/questions/new")}`
              }
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              질문하기
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
