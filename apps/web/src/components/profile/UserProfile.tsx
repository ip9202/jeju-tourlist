"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, Button } from "@jeju-tourlist/ui";
import { safeFormatDate } from "@/lib/dateUtils";
import { CheckCircle, Calendar, MapPin, Edit, Settings } from "lucide-react";

/**
 * 사용자 프로필 데이터 타입
 */
interface UserProfileData {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  bio?: string;
  location?: string;
  joinDate: string;
  isVerified: boolean;
  stats: {
    questionCount: number;
    answerCount: number;
    likeCount: number;
    bookmarkCount: number;
    pointCount: number;
  };
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
  }>;
  isOwnProfile: boolean;
}

/**
 * UserProfile 컴포넌트 Props
 */
interface UserProfileProps {
  userId?: string;
  className?: string;
}

/**
 * UserProfile 컴포넌트
 *
 * @description
 * - 사용자의 기본 프로필 정보를 표시하는 컴포넌트
 * - 통계, 배지, 기본 정보를 포함
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 본인 프로필과 타인 프로필 구분 처리
 *
 * @example
 * ```tsx
 * <UserProfile userId="123" />
 * ```
 */
export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  className = "",
}) => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 목업 데이터 (실제로는 API에서 가져올 데이터)
   */
  const mockProfile: UserProfileData = {
    id: userId || currentUser?.id || "user1",
    name: "김제주",
    email: "kimjeju@example.com",
    profileImage: "/avatars/kim-jeju.jpg",
    bio: "제주도에서 20년째 살고 있는 현지인입니다. 제주 여행에 대한 모든 것을 알고 있어요!",
    location: "제주시 연동",
    joinDate: "2023-01-15T00:00:00Z",
    isVerified: true,
    stats: {
      questionCount: 45,
      answerCount: 234,
      likeCount: 1234,
      bookmarkCount: 67,
      pointCount: 5670,
    },
    badges: [
      {
        id: "1",
        name: "제주 전문가",
        description: "제주 관련 질문에 100개 이상 답변",
        icon: "🏝️",
        earnedAt: "2023-06-15T00:00:00Z",
      },
      {
        id: "2",
        name: "도움이 되는 답변",
        description: "채택된 답변 50개 이상",
        icon: "⭐",
        earnedAt: "2023-08-20T00:00:00Z",
      },
      {
        id: "3",
        name: "활발한 사용자",
        description: "연속 30일 활동",
        icon: "🔥",
        earnedAt: "2023-12-01T00:00:00Z",
      },
    ],
    isOwnProfile: userId === currentUser?.id || !userId,
  };

  /**
   * 컴포넌트 마운트 시 프로필 데이터 로드
   */
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile(mockProfile);
      setLoading(false);
    };

    loadProfile();
  }, [userId, currentUser?.id]);

  /**
   * 프로필 수정 핸들러
   */
  const handleEditProfile = () => {
    // 프로필 수정 페이지로 이동 (구현 필요)
  };

  /**
   * 설정 핸들러
   */
  const handleSettings = () => {
    // 설정 페이지로 이동 (구현 필요)
  };

  /**
   * 날짜 포맷팅 함수
   */
  const formatJoinDate = (dateString: string) => {
    return safeFormatDate(dateString, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full mr-4"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className={`bg-white rounded-xl shadow-md p-6 text-center ${className}`}
      >
        <p className="text-gray-500">사용자 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-md ${className}`}>
      {/* 프로필 헤더 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Avatar
              src={profile.profileImage}
              alt={profile.name}
              size="xl"
              className="mr-6"
            />
            <div>
              <div className="flex items-center mb-2">
                <h1 className="text-2xl font-bold text-gray-900 mr-2">
                  {profile.name}
                </h1>
                {profile.isVerified && (
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                )}
              </div>

              <div className="flex items-center text-gray-600 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatJoinDate(profile.joinDate)} 가입</span>
              </div>

              {profile.location && (
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.bio && (
                <p className="text-gray-700 max-w-md">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center space-x-3">
            {profile.isOwnProfile ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleEditProfile}
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  프로필 수정
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSettings}
                  className="flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  설정
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  // 팔로우/언팔로우 기능 (구현 필요)
                }}
              >
                팔로우
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 통계 섹션 */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">활동 통계</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">
              {profile.stats.questionCount}
            </div>
            <div className="text-sm text-gray-600">질문</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {profile.stats.answerCount}
            </div>
            <div className="text-sm text-gray-600">답변</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {profile.stats.likeCount}
            </div>
            <div className="text-sm text-gray-600">받은 좋아요</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {profile.stats.bookmarkCount}
            </div>
            <div className="text-sm text-gray-600">북마크</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {profile.stats.pointCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">포인트</div>
          </div>
        </div>
      </div>

      {/* 배지 섹션 */}
      {profile.badges.length > 0 && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            획득한 배지
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.badges.map(badge => (
              <div
                key={badge.id}
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="text-2xl mr-3">{badge.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{badge.name}</h4>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatJoinDate(badge.earnedAt)} 획득
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
