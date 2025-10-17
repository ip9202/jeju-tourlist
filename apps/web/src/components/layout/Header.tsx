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
  LogOut,
  User,
  ChevronDown,
  ChevronUp,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HeaderUserBadge,
  HeaderBadgeNotification,
  HeaderBadgeStats,
} from "./HeaderUserBadge";

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = React.useState({
    top: 0,
    right: 0,
  });

  // 드롭다운 위치 계산
  React.useEffect(() => {
    if (isUserMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isUserMenuOpen]);

  // 외부 클릭 감지
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/questions?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
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

          {/* 중앙: 데스크톱 네비게이션 */}
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

          {/* 우측: 검색 + 질문하기 + 사용자 프로필 + 햄버거 */}
          <div className="flex items-center space-x-4">
            {/* 검색 (데스크톱만) */}
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

            {/* 질문하기 버튼 (데스크톱만) */}
            <Link
              href={
                isAuthenticated
                  ? "/questions/new"
                  : `/auth/signin?callbackUrl=${encodeURIComponent("/questions/new")}`
              }
              className="hidden md:block"
            >
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                질문하기
              </Button>
            </Link>

            {/* 사용자 프로필 (항상 표시) */}
            {isAuthenticated ? (
              <>
                <button
                  ref={buttonRef}
                  onClick={() => {
                    console.log("🔵 사용자 프로필 버튼 클릭됨!");
                    console.log("🔵 현재 isUserMenuOpen:", isUserMenuOpen);
                    setIsUserMenuOpen(!isUserMenuOpen);
                    console.log("🔵 변경 후 isUserMenuOpen:", !isUserMenuOpen);
                  }}
                  className="flex items-center space-x-2 py-1 px-3 rounded-full border-2 border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                  {isUserMenuOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>

                {/* 드롭다운 메뉴 (fixed 포지션으로 body에 렌더링) */}
                {isUserMenuOpen && (
                  <div
                    ref={userMenuRef}
                    className="fixed w-56 bg-white rounded-lg shadow-2xl border-2 border-blue-500 py-2"
                    style={{
                      zIndex: 99999,
                      top: `${dropdownPosition.top}px`,
                      right: `${dropdownPosition.right}px`,
                    }}
                  >
                    <div className="px-4 py-3 border-b border-gray-100 bg-blue-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {user?.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <HeaderBadgeNotification userId={user?.id || ""} />
                      </div>
                      <div className="mt-2">
                        <HeaderBadgeStats userId={user?.id || ""} />
                      </div>
                    </div>

                    {/* 배지 섹션 */}
                    <HeaderUserBadge userId={user?.id || ""} />

                    <div className="border-t border-gray-100 my-1"></div>

                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      프로필 설정
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      로그아웃
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href={`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`}
                className="flex items-center space-x-2 py-2 px-4 rounded-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <span className="text-sm font-medium">로그인</span>
              </Link>
            )}

            {/* 햄버거 메뉴 버튼 (모바일만) */}
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

        {/* 모바일 메뉴 (네비게이션만) */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-3">
              {/* 모바일 검색 */}
              <form
                onSubmit={handleSearch}
                className="px-2 pb-3 border-b border-gray-100"
              >
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

              {/* 질문하기 버튼 */}
              <Link
                href={
                  isAuthenticated
                    ? "/questions/new"
                    : `/auth/signin?callbackUrl=${encodeURIComponent("/questions/new")}`
                }
                className="mx-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
                  질문하기
                </Button>
              </Link>

              {/* 전문가 대시보드 링크 */}
              <Link
                href="/experts"
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === "/experts"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Trophy className="w-4 h-4" />
                <span>전문가 대시보드</span>
              </Link>

              {/* 네비게이션 링크 */}
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
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
