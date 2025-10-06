"use client";

import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";

/**
 * MainLayout 컴포넌트 Props
 */
interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  className?: string;
}

/**
 * MainLayout 컴포넌트
 *
 * @description
 * - 애플리케이션의 전체 레이아웃을 담당
 * - Header, Sidebar, Footer를 조합하여 일관된 레이아웃 제공
 * - SOLID 원칙 중 OCP(개방/폐쇄 원칙) 준수 - 확장에는 열려있고 수정에는 닫혀있음
 * - 반응형 디자인으로 다양한 화면 크기 대응
 *
 * @example
 * ```tsx
 * <MainLayout showSidebar={true}>
 *   <div>메인 콘텐츠</div>
 * </MainLayout>
 * ```
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showSidebar = true,
  className = "",
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <Header />

      {/* 메인 콘텐츠 영역 */}
      {showSidebar ? (
        <div className="flex-1 flex">
          {/* 사이드바 (데스크톱에서만 표시) */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {/* 메인 콘텐츠 */}
          <main className={`flex-1 ${className}`}>{children}</main>
        </div>
      ) : (
        /* 사이드바 없는 경우 - 서브헤더가 메인헤더 바로 아래에 오도록 */
        <main className={`flex-1 ${className}`}>{children}</main>
      )}

      {/* 푸터 */}
      <Footer />
    </div>
  );
};

/**
 * 콘텐츠 전용 레이아웃 (사이드바 없는 페이지용)
 *
 * @description
 * - 로그인, 회원가입 등 사이드바가 필요 없는 페이지용
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 *
 * @example
 * ```tsx
 * <ContentLayout>
 *   <LoginForm />
 * </ContentLayout>
 * ```
 */
export const ContentLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

/**
 * 대시보드 레이아웃 (관리자 페이지용)
 *
 * @description
 * - 관리자 대시보드나 특별한 레이아웃이 필요한 페이지용
 * - SOLID 원칙 중 OCP(개방/폐쇄 원칙) 준수
 *
 * @example
 * ```tsx
 * <DashboardLayout>
 *   <AdminPanel />
 * </DashboardLayout>
 * ```
 */
export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};
