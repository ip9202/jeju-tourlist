"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageCircle,
  TrendingUp,
  Clock,
  Star,
  MapPin,
  Camera,
  Utensils,
  Car,
  Hotel,
  ShoppingBag,
} from "lucide-react";

/**
 * Sidebar 컴포넌트
 *
 * @description
 * - 사이드바 네비게이션을 담당
 * - 필터링, 카테고리, 정렬 옵션을 제공
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 현재 경로에 따른 활성 상태 관리
 *
 * @example
 * ```tsx
 * <Sidebar />
 * ```
 */
export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  /**
   * 카테고리 데이터
   */
  const categories = [
    { id: "all", name: "전체", icon: Home, href: "/questions" },
    {
      id: "general",
      name: "일반",
      icon: MessageCircle,
      href: "/questions?category=general",
    },
    {
      id: "travel",
      name: "여행",
      icon: MapPin,
      href: "/questions?category=travel",
    },
    {
      id: "food",
      name: "맛집",
      icon: Utensils,
      href: "/questions?category=food",
    },
    {
      id: "accommodation",
      name: "숙박",
      icon: Hotel,
      href: "/questions?category=accommodation",
    },
    {
      id: "transportation",
      name: "교통",
      icon: Car,
      href: "/questions?category=transportation",
    },
    {
      id: "shopping",
      name: "쇼핑",
      icon: ShoppingBag,
      href: "/questions?category=shopping",
    },
    {
      id: "photo",
      name: "포토스팟",
      icon: Camera,
      href: "/questions?category=photo",
    },
  ];

  /**
   * 정렬 옵션 데이터
   */
  const sortOptions = [
    { id: "latest", name: "최신순", icon: Clock, value: "createdAt" },
    { id: "popular", name: "인기순", icon: TrendingUp, value: "popularity" },
    { id: "answered", name: "답변완료", icon: Star, value: "answered" },
  ];

  /**
   * 링크가 활성 상태인지 확인
   */
  const isActiveLink = (href: string) => {
    if (href === "/questions") {
      return pathname === "/questions" || pathname === "/";
    }
    return pathname.startsWith(href.split("?")[0]);
  };

  /**
   * 카테고리 링크 클릭 핸들러
   */
  const handleCategoryClick = (_categoryId: string) => {
    // 카테고리 필터링 로직 (구현 필요)
  };

  /**
   * 정렬 옵션 변경 핸들러
   */
  const handleSortChange = (_sortValue: string) => {
    // 정렬 로직 (구현 필요)
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6">
        {/* 카테고리 섹션 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리</h3>
          <nav className="space-y-1">
            {categories.map(category => {
              const Icon = category.icon;
              const isActive = isActiveLink(category.href);

              return (
                <Link
                  key={category.id}
                  href={category.href}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {category.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 정렬 옵션 섹션 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">정렬</h3>
          <div className="space-y-1">
            {sortOptions.map(option => {
              const Icon = option.icon;

              return (
                <button
                  key={option.id}
                  onClick={() => handleSortChange(option.value)}
                  className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {option.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 필터 섹션 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">필터</h3>

          {/* 답변 상태 필터 */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              답변 상태
            </h4>
            <div className="space-y-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">답변 완료</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">답변 대기</span>
              </label>
            </div>
          </div>

          {/* 지역 필터 */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">지역</h4>
            <div className="space-y-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">제주시</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">서귀포시</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">전체</span>
              </label>
            </div>
          </div>

          {/* 날짜 필터 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">기간</h4>
            <div className="space-y-1">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateFilter"
                  className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">전체</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateFilter"
                  className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">오늘</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateFilter"
                  className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">이번 주</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateFilter"
                  className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">이번 달</span>
              </label>
            </div>
          </div>
        </div>

        {/* 통계 섹션 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            오늘의 통계
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>새 질문</span>
              <span className="font-medium">24개</span>
            </div>
            <div className="flex justify-between">
              <span>새 답변</span>
              <span className="font-medium">156개</span>
            </div>
            <div className="flex justify-between">
              <span>활성 사용자</span>
              <span className="font-medium">1,234명</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
