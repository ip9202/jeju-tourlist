"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@jeju-tourlist/ui";
import {
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
import { PopularSearchTerms } from "./PopularSearchTerms";

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = React.useState({
    top: 0,
    right: 0,
  });

  // @TAG-FE-COMPONENT-MODIFIED: Removed hardcoded popularSearches, now using PopularSearchTerms component
  // Old implementation replaced with real-time data from API

  // 카테고리
  const categories = [
    { id: "", name: "전체" },
    { id: "tourist", name: "관광지" },
    { id: "restaurant", name: "맛집" },
    { id: "accommodation", name: "숙박" },
    { id: "transport", name: "교통" },
    { id: "shopping", name: "쇼핑" },
  ];

  // URL 파라미터에서 검색어 동기화
  React.useEffect(() => {
    const query = searchParams.get("query");
    const categoryId = searchParams.get("categoryId");

    if (query) {
      setSearchQuery(decodeURIComponent(query));
    } else {
      setSearchQuery("");
    }

    if (categoryId) {
      setSelectedCategory(categoryId);
    } else {
      setSelectedCategory("");
    }
  }, [searchParams]);

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

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log(
        "🔍 헤더 검색 실행:",
        searchQuery,
        "카테고리:",
        selectedCategory
      );
      const params = new URLSearchParams();
      params.append("query", encodeURIComponent(searchQuery.trim()));
      if (selectedCategory) {
        params.append("categoryId", selectedCategory);
      }
      router.push(`/questions?${params.toString()}`);
    } else {
      console.warn("⚠️ 검색어가 비어있습니다");
    }
  };

  // @TAG-FE-COMPONENT-MODIFIED: handlePopularSearch removed - now handled by SearchTermBadge component

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Row 1: 로고 + 네비게이션 + 액션 */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex h-16 items-center justify-between">
            {/* 로고 */}
            <Link
              href="/"
              className="flex items-center space-x-2 group flex-shrink-0"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  {/* 왼쪽 물음표 (좌측으로 30도 기울임) */}
                  <text
                    x="4"
                    y="6"
                    fontSize="8"
                    fontWeight="bold"
                    fill="currentColor"
                    textAnchor="middle"
                    transform="rotate(-30 4 6)"
                  >
                    ?
                  </text>
                  {/* 오른쪽 느낌표 (우측으로 30도 기울임) */}
                  <text
                    x="20"
                    y="6"
                    fontSize="8"
                    fontWeight="bold"
                    fill="currentColor"
                    textAnchor="middle"
                    transform="rotate(30 20 6)"
                  >
                    !
                  </text>
                  {/* 스마일 얼굴 원 */}
                  <circle
                    cx="12"
                    cy="14"
                    r="8.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  {/* 왼쪽 눈 */}
                  <circle cx="9.5" cy="12" r="1" fill="currentColor" />
                  {/* 오른쪽 눈 */}
                  <circle cx="14.5" cy="12" r="1" fill="currentColor" />
                  {/* 입 (웃는 모양) */}
                  <path
                    d="M 9 16 Q 12 18 15 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                동네물어봐
              </span>
              <span className="hidden sm:inline-block text-sm text-gray-500 ml-1">
                제주 여행 Q&A
              </span>
            </Link>

            {/* 중앙: 데스크톱 네비게이션 */}
            <nav className="hidden md:flex items-center justify-center flex-1 space-x-8">
              <Link
                href="/questions"
                className={cn(
                  "flex items-center h-16 text-sm font-medium transition-colors hover:text-blue-600",
                  pathname === "/questions" ? "text-blue-600" : "text-gray-700"
                )}
              >
                질문 목록
              </Link>
              <Link
                href="/categories"
                className={cn(
                  "flex items-center h-16 text-sm font-medium transition-colors hover:text-blue-600",
                  pathname === "/categories" ? "text-blue-600" : "text-gray-700"
                )}
              >
                카테고리
              </Link>
              <Link
                href="/experts"
                className={cn(
                  "flex items-center h-16 text-sm font-medium transition-colors hover:text-blue-600",
                  pathname === "/experts" ? "text-blue-600" : "text-gray-700"
                )}
              >
                전문가
              </Link>
            </nav>

            {/* 우측: 질문하기 + 사용자 프로필 + 햄버거 */}
            <div className="flex items-center space-x-4">
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
                      setIsUserMenuOpen(!isUserMenuOpen);
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

                  {/* 드롭다운 메뉴 */}
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
                  <div className="relative overflow-visible">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="search"
                      placeholder="제주 여행 정보 검색..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 transition-all"
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
                  <Trophy className="h-4 w-4" />
                  <span>전문가</span>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: 검색 + 필터 + 검색버튼 */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <form
            onSubmit={handleSearch}
            className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 bg-white"
          >
            {/* 카테고리선택 (검색창 왼쪽) */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="hidden sm:block px-3 py-2 border-0 text-sm font-medium text-gray-700 transition-colors flex-shrink-0 bg-white focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* 검색 입력창 */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="제주 여행 정보 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-0 text-sm focus:outline-none transition-all"
              />
            </div>

            {/* 검색 버튼 */}
            <button
              type="submit"
              className="flex items-center justify-center px-4 py-2 bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 font-medium transition-colors flex-shrink-0 border-0"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* 인기검색어 - Real-time data from API */}
          <div className="relative">
            <div className="overflow-hidden">
              <div className="inline-flex items-center py-0 pr-10 overflow-x-auto scrollbar-hide">
                <span className="text-xs font-medium text-gray-500 mr-4 flex-shrink-0">
                  인기 검색어
                </span>
                {/* @TAG-FE-COMPONENT-MODIFIED: Integrated PopularSearchTerms component with real API data */}
                <PopularSearchTerms className="flex items-center gap-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
