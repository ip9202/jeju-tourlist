"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@jeju-tourlist/ui";
import { MapPin, Menu, Search } from "lucide-react";

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

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
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <MapPin className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">동네물어봐</span>
        </Link>

        <nav className="mr-6 hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/questions"
            className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center h-10"
          >
            질문
          </Link>
          <Link
            href="/categories"
            className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center h-10"
          >
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
          <Link href={isAuthenticated ? "/questions/new" : `/auth/signin?callbackUrl=${encodeURIComponent('/questions/new')}`}>
            <Button size="sm" className="hidden md:inline-flex">
              질문하기
            </Button>
          </Link>

          <nav className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button variant="ghost" size="sm" onClick={logout}>
                로그아웃
              </Button>
            ) : (
              <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`}>
                <Button variant="ghost" size="sm">
                  로그인
                </Button>
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
        <div className="container border-t py-4 md:hidden">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/questions"
              className="text-foreground/60 transition-colors hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              질문
            </Link>
            <Link
              href="/categories"
              className="text-foreground/60 transition-colors hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              카테고리
            </Link>
            <Link
              href={isAuthenticated ? "/questions/new" : `/auth/signin?callbackUrl=${encodeURIComponent('/questions/new')}`}
              className="text-foreground/60 transition-colors hover:text-foreground"
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
