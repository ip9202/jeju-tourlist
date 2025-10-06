"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@jeju-tourlist/ui";
import { MapPin, Menu, Search } from "lucide-react";

export const Header: React.FC = () => {
  const router = useRouter();
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
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 왼쪽: 로고 & 네비게이션 */}
        <div className="flex items-center space-x-8">
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <MapPin className="h-6 w-6 text-indigo-600" />
            <span className="hidden font-bold text-lg sm:inline-block text-gray-900">
              동네물어봐
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/questions"
              className="flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors h-10 px-3 rounded-md hover:bg-gray-50"
            >
              질문
            </Link>
            <Link
              href="/categories"
              className="flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors h-10 px-3 rounded-md hover:bg-gray-50"
            >
              카테고리
            </Link>
          </nav>
        </div>

        {/* 가운데: 검색창 (데스크톱에서만) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative flex">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                placeholder="제주 여행에 대해 질문해보세요..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 h-10 pl-10 pr-12 py-2 text-sm border border-gray-300 rounded-l-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="h-10 px-4 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                aria-label="검색"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        {/* 오른쪽: 액션 버튼 & 모바일 메뉴 */}
        <div className="flex items-center space-x-4">
          {/* 액션 버튼 */}
          <div className="hidden sm:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link href="/questions/new">
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    질문하기
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <Link href="/auth/signin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  로그인
                </Button>
              </Link>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="메뉴 열기"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t bg-white shadow-lg md:hidden">
          <div className="px-4 py-6 space-y-4">
            {/* 모바일 검색창 */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  placeholder="제주 여행에 대해 질문해보세요..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* 모바일 네비게이션 */}
            <nav className="space-y-3">
              <Link
                href="/questions"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                질문
              </Link>
              <Link
                href="/categories"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                카테고리
              </Link>
            </nav>

            {/* 모바일 액션 버튼 */}
            <div className="pt-4 border-t space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/questions/new"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                      질문하기
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full text-gray-600 hover:text-gray-900"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full text-gray-600 hover:text-gray-900"
                  >
                    로그인
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
