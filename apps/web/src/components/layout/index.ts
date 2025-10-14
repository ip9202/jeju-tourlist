/**
 * Layout 컴포넌트 내보내기
 *
 * @description
 * - 레이아웃 관련 컴포넌트들을 중앙에서 관리
 * - SOLID 원칙 중 ISP(인터페이스 분리 원칙) 준수
 * - 필요한 컴포넌트만 선택적으로 import 가능
 */

export { Header } from "./Header";
export { Footer } from "./Footer";
export { Sidebar } from "./Sidebar";
export { MainLayout, ContentLayout, DashboardLayout } from "./MainLayout";
export { HeaderUserBadge, HeaderBadgeNotification, HeaderBadgeStats } from "./HeaderUserBadge";
