"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { UserProfile } from "./UserProfile";
import { ActivityHistory } from "./ActivityHistory";
import { Breadcrumb, Button } from "@jeju-tourlist/ui";
import { ArrowLeft, Share2 } from "lucide-react";

/**
 * ProfilePage 컴포넌트 Props
 */
interface ProfilePageProps {
  userId?: string;
}

/**
 * ProfilePage 컴포넌트
 *
 * @description
 * - 사용자 프로필 페이지의 전체 레이아웃을 담당
 * - 프로필 정보와 활동 이력을 조합
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 브레드크럼 네비게이션과 액션 버튼 포함
 *
 * @example
 * ```tsx
 * <ProfilePage userId="123" />
 * ```
 */
export const ProfilePage: React.FC<ProfilePageProps> = ({ userId }) => {
  const params = useParams();
  const [user, setUser] = useState<{
    id: string;
    name: string;
    isOwnProfile: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // URL 파라미터에서 userId 가져오기
  const actualUserId = userId || (params?.id as string);

  /**
   * 컴포넌트 마운트 시 사용자 데이터 로드
   */
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 목업 데이터
      const mockUser = {
        id: actualUserId,
        name: "김제주",
        isOwnProfile: !actualUserId || actualUserId === "current",
      };

      setUser(mockUser);
      setLoading(false);
    };

    if (actualUserId) {
      loadUser();
    }
  }, [actualUserId]);

  /**
   * 뒤로가기 핸들러
   */
  const handleGoBack = () => {
    window.history.back();
  };

  /**
   * 공유 핸들러
   */
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user?.name}님의 프로필`,
        url: window.location.href,
      });
    } else {
      // 클립보드에 URL 복사
      navigator.clipboard.writeText(window.location.href);
      alert("링크가 클립보드에 복사되었습니다.");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              사용자를 찾을 수 없습니다
            </h1>
            <p className="text-gray-600 mb-8">
              요청하신 사용자가 존재하지 않거나 삭제되었습니다.
            </p>
            <Button onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 브레드크럼 네비게이션 */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: "홈", href: "/" },
              { label: "사용자", href: "/users" },
              { label: user.name, href: `/profile/${user.id}` },
            ]}
          />
        </div>

        {/* 사용자 프로필 */}
        <div className="mb-8">
          <UserProfile userId={actualUserId} />
        </div>

        {/* 활동 이력 */}
        <div className="mb-8">
          <ActivityHistory userId={actualUserId} />
        </div>

        {/* 하단 액션 버튼 */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>

          <Button
            variant="outline"
            onClick={handleShare}
            className="flex items-center"
          >
            <Share2 className="h-4 w-4 mr-2" />
            공유
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};
