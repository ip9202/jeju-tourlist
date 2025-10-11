"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@jeju-tourlist/ui";
import {
  MapPin,
  Menu,
  Search,
  MessageSquare,
  Grid3x3,
  LogIn,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  // 디버깅
  React.useEffect(() => {
    console.log("🎯 Header AuthContext 상태:", {
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      user: user
        ? {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        : null,
    });
  }, [isAuthenticated, isLoading, user]);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    console.log("🔴 Header에서 로그아웃 시작");
    await logout();
    setIsUserMenuOpen(false);
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
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              동네물어봐
            </span>
            <span className="hidden sm:inline-block text-sm text-gray-500 ml-1">
              제주 여행 Q&A
            </span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/questions"
              className={cn(
                "text-sm font-medium transition-colors hover:text-blue-600",
                pathname === "/questions" ? "text-blue-600" : "text-gray-700"
              )}
            >
              질문 목록
            </Link>
            <Link
              href="/categories"
              className={cn(
                "text-sm font-medium transition-colors hover:text-blue-600",
                pathname === "/categories" ? "text-blue-600" : "text-gray-700"
              )}
            >
              카테고리
            </Link>
            <Link
              href="/experts"
              className={cn(
                "text-sm font-medium transition-colors hover:text-blue-600",
                pathname === "/experts" ? "text-blue-600" : "text-gray-700"
              )}
            >
              전문가
            </Link>
          </nav>

          {/* 검색 및 액션 버튼들 */}
          <div className="flex items-center space-x-4">
            {/* 검색 */}
            <form onSubmit={handleSearch} className="hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="제주 여행 정보 검색..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* 질문하기 버튼 */}
            <Link
              href={
                isAuthenticated
                  ? "/questions/new"
                  : `/auth/signin?callbackUrl=${encodeURIComponent("/questions/new")}`
              }
            >
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                질문하기
              </Button>
            </Link>

            {/* 사용자 메뉴 */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="hidden sm:block">{user?.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="inline w-4 h-4 mr-2" />
                      프로필
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut className="inline w-4 h-4 mr-2" />
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`}
                className="flex items-center space-x-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>로그인</span>
              </Link>
            )}

            {/* 모바일 메뉴 버튼 */}
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

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-3">
              {/* 모바일 검색 */}
              <form onSubmit={handleSearch} className="px-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="제주 여행 정보 검색..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>

              <Link
                href="/questions"
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname === "/questions"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageSquare className="h-4 w-4" />
                <span>질문 목록</span>
              </Link>

              <Link
                href="/categories"
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname === "/categories"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Grid3x3 className="h-4 w-4" />
                <span>카테고리</span>
              </Link>

              <Link
                href="/experts"
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname === "/experts"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                <span>전문가</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>프로필</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>로그아웃</span>
                  </button>
                </>
              ) : (
                <Link
                  href={`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="h-4 w-4" />
                  <span>로그인</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
