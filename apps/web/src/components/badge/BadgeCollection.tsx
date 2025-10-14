"use client";

import React from "react";
import { BadgeCollectionProps } from "@/types/badge";
import { cn } from "@/lib/utils";
import { BadgeCard } from "./BadgeCard";
import { BadgeCardCompact } from "./BadgeCard";
import { BadgeIcon } from "./BadgeIcon";

/**
 * BadgeCollection - 배지 컬렉션 그리드 컴포넌트
 * 
 * @description
 * - 여러 배지를 그리드 형태로 표시
 * - 사용자 배지와 진행률 정보 통합 표시
 * - 반응형 그리드 레이아웃
 * - 필터링 및 정렬 옵션 지원
 */
export function BadgeCollection({ 
  badges, 
  userBadges = [], 
  showProgress = false, 
  columns = 3,
  className 
}: BadgeCollectionProps) {
  // 사용자 배지 맵 생성
  const userBadgeMap = new Map(
    userBadges.map(ub => [ub.badgeId, ub])
  );

  // 배지별 진행률 정보 생성
  const getBadgeProgress = (badge: any) => {
    const userBadge = userBadgeMap.get(badge.id);
    
    if (userBadge) {
      return {
        badgeId: badge.id,
        badge: badge,
        currentProgress: badge.requiredAnswers,
        requiredProgress: badge.requiredAnswers,
        progressPercentage: 100,
        isEarned: true,
        earnedAt: userBadge.earnedAt,
      };
    }

    // TODO: 실제 진행률 계산 로직 구현
    // 현재는 임시로 0%로 설정
    return {
      badgeId: badge.id,
      badge: badge,
      currentProgress: 0,
      requiredProgress: badge.requiredAnswers,
      progressPercentage: 0,
      isEarned: false,
    };
  };

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
  };

  return (
    <div className={cn(
      "grid gap-4",
      gridCols[columns as keyof typeof gridCols] || gridCols[3],
      className
    )}>
      {badges.map((badge) => {
        const progress = getBadgeProgress(badge);
        
        if (showProgress) {
          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              progress={progress}
              showProgress={true}
              showDescription={true}
            />
          );
        }

        return (
          <BadgeCardCompact
            key={badge.id}
            badge={badge}
          />
        );
      })}
    </div>
  );
}

/**
 * BadgeCollectionGrid - 그리드 형태의 배지 컬렉션
 */
export function BadgeCollectionGrid({ 
  badges, 
  userBadges = [], 
  columns = 4,
  className 
}: Omit<BadgeCollectionProps, 'showProgress'>) {
  const userBadgeMap = new Map(
    userBadges.map(ub => [ub.badgeId, ub])
  );

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
  };

  return (
    <div className={cn(
      "grid gap-3",
      gridCols[columns as keyof typeof gridCols] || gridCols[4],
      className
    )}>
      {badges.map((badge) => {
        const userBadge = userBadgeMap.get(badge.id);
        const isEarned = !!userBadge;

        return (
          <div
            key={badge.id}
            className={cn(
              "flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md",
              isEarned 
                ? "border-green-200 bg-green-50" 
                : "border-gray-200 bg-gray-50"
            )}
          >
            <BadgeIcon 
              badge={badge} 
              size="lg" 
              showTooltip={true}
            />
            
            <div className="mt-2 text-center">
              <h4 className="font-medium text-sm">{badge.name}</h4>
              {isEarned && (
                <p className="text-xs text-green-600 mt-1">
                  획득 완료
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * BadgeCollectionList - 리스트 형태의 배지 컬렉션
 */
export function BadgeCollectionList({ 
  badges, 
  userBadges = [], 
  className 
}: Omit<BadgeCollectionProps, 'showProgress' | 'columns'>) {
  const userBadgeMap = new Map(
    userBadges.map(ub => [ub.badgeId, ub])
  );

  return (
    <div className={cn("space-y-2", className)}>
      {badges.map((badge) => {
        const userBadge = userBadgeMap.get(badge.id);
        const isEarned = !!userBadge;

        return (
          <div
            key={badge.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm",
              isEarned 
                ? "border-green-200 bg-green-50" 
                : "border-gray-200 bg-gray-50"
            )}
          >
            <BadgeIcon 
              badge={badge} 
              size="md" 
              showTooltip={true}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">{badge.name}</h4>
                {isEarned && (
                  <span className="text-green-500 text-xs">✓</span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">
                {badge.description}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-xs font-medium text-green-600">
                +{badge.bonusPoints}P
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
