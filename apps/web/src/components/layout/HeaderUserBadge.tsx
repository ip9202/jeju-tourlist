"use client";

import React, { useState, useEffect } from "react";
import { BadgeIcon } from "@/components/badge";
import { BadgeInfo, UserBadgeInfo } from "@/types/badge";
import { cn } from "@/lib/utils";
import { Trophy, ChevronRight } from "lucide-react";
import Link from "next/link";

/**
 * HeaderUserBadge - 헤더 사용자 배지 표시 컴포넌트
 * 
 * @description
 * - 사용자 드롭다운 메뉴에 최고 등급 배지 표시
 * - 배지 클릭 시 프로필 페이지 이동
 * - 알림 배지 표시
 */
interface HeaderUserBadgeProps {
  userId: string;
  className?: string;
}

export function HeaderUserBadge({ userId, className }: HeaderUserBadgeProps) {
  const [userBadges, setUserBadges] = useState<UserBadgeInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // 사용자 배지 로드
  useEffect(() => {
    const loadUserBadges = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/badges/users/${userId}`);
        const data = await response.json();
        
        if (data.success) {
          setUserBadges(data.data.badges || []);
        }
      } catch (error) {
        console.error('사용자 배지 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUserBadges();
    }
  }, [userId]);

  // 최고 등급 배지 선택 (가장 높은 포인트 배지)
  const topBadge = userBadges
    .sort((a, b) => b.badge.bonusPoints - a.badge.bonusPoints)[0];

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-500">배지 로딩중...</span>
      </div>
    );
  }

  if (!topBadge) {
    return (
      <Link
        href="/profile"
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors",
          className
        )}
      >
        <Trophy className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-600">배지 획득하기</span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </Link>
    );
  }

  return (
    <Link
      href="/profile"
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group",
        className
      )}
    >
      <BadgeIcon 
        badge={topBadge.badge} 
        size="sm" 
        showTooltip={true}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 truncate">
            {topBadge.badge.name}
          </span>
          {userBadges.length > 1 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
              +{userBadges.length - 1}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">
          최고 등급 배지
        </p>
      </div>
      
      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
    </Link>
  );
}

/**
 * HeaderBadgeNotification - 헤더 배지 알림 컴포넌트
 * 
 * @description
 * - 새로운 배지 획득 알림 표시
 * - 알림 배지 클릭 시 프로필 페이지 이동
 */
interface HeaderBadgeNotificationProps {
  userId: string;
  className?: string;
}

export function HeaderBadgeNotification({ userId, className }: HeaderBadgeNotificationProps) {
  const [hasNewBadge, setHasNewBadge] = useState(false);
  const [loading, setLoading] = useState(true);

  // 새로운 배지 알림 확인
  useEffect(() => {
    const checkNewBadge = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/badges/users/${userId}`);
        const data = await response.json();
        
        if (data.success) {
          const badges = data.data.badges || [];
          // 최근 24시간 내에 획득한 배지가 있는지 확인
          const recentBadges = badges.filter((badge: UserBadgeInfo) => {
            const earnedAt = new Date(badge.earnedAt);
            const now = new Date();
            const diffHours = (now.getTime() - earnedAt.getTime()) / (1000 * 60 * 60);
            return diffHours <= 24 && !badge.notified;
          });
          
          setHasNewBadge(recentBadges.length > 0);
        }
      } catch (error) {
        console.error('배지 알림 확인 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      checkNewBadge();
    }
  }, [userId]);

  if (loading || !hasNewBadge) {
    return null;
  }

  return (
    <Link
      href="/profile"
      className={cn(
        "relative inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full hover:bg-red-600 transition-colors animate-pulse",
        className
      )}
      title="새로운 배지를 획득했습니다!"
    >
      !
    </Link>
  );
}

/**
 * HeaderBadgeStats - 헤더 배지 통계 컴포넌트
 * 
 * @description
 * - 사용자의 배지 통계를 간단히 표시
 * - 배지 개수와 완료율 표시
 */
interface HeaderBadgeStatsProps {
  userId: string;
  className?: string;
}

export function HeaderBadgeStats({ userId, className }: HeaderBadgeStatsProps) {
  const [stats, setStats] = useState({
    earned: 0,
    total: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        
        const [badgesResponse, userBadgesResponse] = await Promise.all([
          fetch('/api/badges'),
          fetch(`/api/badges/users/${userId}`)
        ]);
        
        const badgesData = await badgesResponse.json();
        const userBadgesData = await userBadgesResponse.json();
        
        if (badgesData.success && userBadgesData.success) {
          const total = badgesData.data.length;
          const earned = userBadgesData.data.badges?.length || 0;
          const completionRate = total > 0 ? Math.round((earned / total) * 100) : 0;
          
          setStats({ earned, total, completionRate });
        }
      } catch (error) {
        console.error('배지 통계 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadStats();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
        <span className="text-xs text-gray-500">로딩중...</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 text-xs text-gray-500", className)}>
      <Trophy className="w-3 h-3" />
      <span>{stats.earned}/{stats.total}</span>
      <span>({stats.completionRate}%)</span>
    </div>
  );
}
