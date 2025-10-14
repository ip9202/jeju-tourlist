"use client";

import React, { useState, useEffect } from "react";
import { BadgeIcon } from "@/components/badge";
import { BadgeInfo, UserBadgeInfo } from "@/types/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * AnswerAuthorBadge - 답변자 배지 표시 컴포넌트
 * 
 * @description
 * - 답변자 이름 옆에 대표 배지 표시
 * - 호버 시 전체 배지 목록 툴팁
 * - 채택 상태 시각적 표시
 */
interface AnswerAuthorBadgeProps {
  userId: string;
  userName: string;
  isAccepted?: boolean;
  className?: string;
}

export function AnswerAuthorBadge({ 
  userId, 
  userName, 
  isAccepted = false,
  className 
}: AnswerAuthorBadgeProps) {
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

  // 대표 배지 선택 (가장 높은 포인트 배지)
  const primaryBadge = userBadges
    .sort((a, b) => b.badge.bonusPoints - a.badge.bonusPoints)[0];

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="font-medium">{userName}</span>
        <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (!primaryBadge) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="font-medium">{userName}</span>
        {isAccepted && (
          <span className="text-green-500 text-sm" title="채택된 답변">
            ✓
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="font-medium">{userName}</span>
      
      {/* 대표 배지 */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <BadgeIcon 
                badge={primaryBadge.badge} 
                size="sm" 
                showTooltip={false}
              />
              {userBadges.length > 1 && (
                <span className="text-xs text-gray-500">
                  +{userBadges.length - 1}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">{userName}님의 배지</h4>
              <div className="space-y-1">
                {userBadges.map((userBadge) => (
                  <div key={userBadge.id} className="flex items-center gap-2">
                    <span className="text-sm">{userBadge.badge.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {userBadge.badge.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        +{userBadge.badge.bonusPoints}P
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* 채택 상태 표시 */}
      {isAccepted && (
        <span className="text-green-500 text-sm" title="채택된 답변">
          ✓
        </span>
      )}
    </div>
  );
}

/**
 * AnswerAuthorBadgeCompact - 컴팩트한 답변자 배지 표시
 */
export function AnswerAuthorBadgeCompact({ 
  userId, 
  userName, 
  isAccepted = false,
  className 
}: AnswerAuthorBadgeProps) {
  const [primaryBadge, setPrimaryBadge] = useState<BadgeInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrimaryBadge = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/badges/users/${userId}`);
        const data = await response.json();
        
        if (data.success && data.data.badges?.length > 0) {
          const badges = data.data.badges;
          const highestBadge = badges.sort((a: any, b: any) => 
            b.badge.bonusPoints - a.badge.bonusPoints
          )[0];
          setPrimaryBadge(highestBadge.badge);
        }
      } catch (error) {
        console.error('배지 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadPrimaryBadge();
    }
  }, [userId]);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span className="font-medium text-sm">{userName}</span>
      
      {!loading && primaryBadge && (
        <BadgeIcon 
          badge={primaryBadge} 
          size="sm" 
          showTooltip={true}
        />
      )}
      
      {isAccepted && (
        <span className="text-green-500 text-xs">✓</span>
      )}
    </div>
  );
}
