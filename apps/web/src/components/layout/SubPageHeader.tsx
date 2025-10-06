"use client";

import React from "react";
import Link from "next/link";
import { Button, Heading } from "@jeju-tourlist/ui";
import { ArrowLeft, Home, MapPin } from "lucide-react";

/**
 * SubPageHeader 컴포넌트 Props
 */
interface SubPageHeaderProps {
  /** 페이지 제목 */
  title: string;
  /** 뒤로가기 버튼 클릭 핸들러 (기본값: window.history.back()) */
  onBack?: () => void;
  /** 홈 버튼 표시 여부 (기본값: true) */
  showHomeButton?: boolean;
  /** 뒤로가기 버튼 표시 여부 (기본값: true) */
  showBackButton?: boolean;
  /** 추가 액션 버튼들 */
  actions?: React.ReactNode;
  /** 커스텀 클래스명 */
  className?: string;
}

/**
 * SubPageHeader 컴포넌트
 *
 * @description
 * - 서브페이지에서 사용하는 간결한 헤더 컴포넌트
 * - 뒤로가기, 홈 버튼, 페이지 제목을 포함
 * - 메인페이지로의 쉬운 네비게이션 제공
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 *
 * @example
 * ```tsx
 * <SubPageHeader
 *   title="검색 결과"
 *   onBack={() => router.back()}
 *   showHomeButton={true}
 * />
 * ```
 */
export const SubPageHeader: React.FC<SubPageHeaderProps> = ({
  title,
  onBack,
  showHomeButton = true,
  showBackButton = true,
  actions,
  className = "",
}) => {
  /**
   * 기본 뒤로가기 핸들러
   */
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <header
      className={`bg-white border-b border-gray-100 sticky top-16 z-40 ${className}`}
      data-testid="subpage-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10">
          {/* 왼쪽: 네비게이션 버튼들 - 컴팩트 */}
          <div className="flex items-center space-x-1">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 p-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}

            {showHomeButton && (
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center text-gray-600 hover:text-gray-900 p-1"
                >
                  <Home className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>

          {/* 가운데: 페이지 제목 - 축소 */}
          <div className="flex-1 flex justify-center">
            <Heading
              level={1}
              className="text-sm font-semibold text-gray-900 truncate max-w-md"
            >
              {title}
            </Heading>
          </div>

          {/* 오른쪽: 추가 액션들 */}
          <div className="flex items-center space-x-2">
            {actions}

            {/* 로고 (홈 버튼이 없을 때만 표시) */}
            {!showHomeButton && (
              <Link
                href="/"
                className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700"
              >
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">
                  동네물어봐
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * 간단한 서브페이지 헤더 (제목만)
 *
 * @description
 * - 최소한의 요소만 포함하는 간단한 헤더
 * - 뒤로가기와 홈 버튼만 제공
 *
 * @example
 * ```tsx
 * <SimpleSubPageHeader title="페이지 제목" />
 * ```
 */
export const SimpleSubPageHeader: React.FC<
  Pick<SubPageHeaderProps, "title" | "className">
> = ({ title, className = "" }) => {
  return (
    <SubPageHeader
      title={title}
      showBackButton={true}
      showHomeButton={true}
      className={className}
    />
  );
};
