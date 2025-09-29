"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Avatar } from "@jeju-tourlist/ui";
import { SearchBar } from "../search/SearchBar";
import { MapPin, Menu, User, LogOut } from "lucide-react";
import { NotificationBell } from "../notification/NotificationBell";

/**
 * Header 컴포넌트
 *
 * @description
 * - 애플리케이션의 상단 네비게이션을 담당
 * - 로고, 검색바, 사용자 메뉴를 포함
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 반응형 디자인으로 모바일/데스크톱 대응
 *
 * @example
 * ```tsx
 * <Header />
 * ```
 */
export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  /**
   * 모바일 메뉴 토글 핸들러
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  /**
   * 로그아웃 핸들러
   */
  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 섹션 */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <MapPin className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">
                동네물어봐
              </span>
            </Link>
          </div>

          {/* 데스크톱 검색바 */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <SearchBar
              placeholder="제주 여행에 대해 질문해보세요..."
              onSearch={query => {
                // TODO: 검색 페이지로 이동
                console.log("검색 쿼리:", query);
              }}
            />
          </div>

          {/* 데스크톱 네비게이션 */}
          <div className="hidden sm:flex items-center space-x-6">
            <Link
              href="/questions"
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium text-sm"
            >
              질문목록
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium text-sm"
            >
              카테고리
            </Link>

            {/* 알림 벨 - 항상 표시 */}
            <NotificationBell />

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/questions/new"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                >
                  질문하기
                </Link>

                {/* 사용자 드롭다운 메뉴 */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors">
                    <Avatar
                      src={user?.profileImage}
                      alt={user?.name || "사용자"}
                      size="sm"
                    />
                    <span className="font-medium">{user?.name}</span>
                  </button>

                  {/* 드롭다운 메뉴 */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4 mr-2" />
                      프로필
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      로그아웃
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-indigo-600 transition-colors font-medium text-sm"
                >
                  로그인
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    // TODO: 회원가입 페이지로 이동
                    window.location.href = "/auth/signin";
                  }}
                >
                  시작하기
                </Button>
              </div>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-indigo-600 transition-colors"
              aria-label="메뉴 열기"
              data-testid="mobile-menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 py-4">
            {/* 모바일 검색바 */}
            <div className="mb-4">
              <SearchBar
                placeholder="제주 여행에 대해 질문해보세요..."
                onSearch={query => {
                  console.log("검색 쿼리:", query);
                  setIsMobileMenuOpen(false);
                }}
              />
            </div>

            {/* 모바일 네비게이션 링크 */}
            <div className="space-y-2">
              <Link
                href="/questions"
                className="block px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                질문목록
              </Link>
              <Link
                href="/categories"
                className="block px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                카테고리
              </Link>

              {/* 모바일 알림 벨 - 항상 표시 */}
              <div className="px-3 py-2">
                <NotificationBell />
              </div>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/questions/new"
                    className="block px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    질문하기
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    프로필
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="block px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <button
                    onClick={() => {
                      window.location.href = "/auth/signin";
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    시작하기
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
