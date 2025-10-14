"use client";

import React, { useState, useEffect } from "react";
import { BadgeInfo, UserBadgeInfo } from "@/types/badge";
import { BadgeIcon } from "@/components/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Trophy, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

/**
 * BadgeEarnedNotification - 배지 획득 알림 컴포넌트
 * 
 * @description
 * - 배지 획득 시 실시간 알림 표시
 * - 토스트 형태의 알림 메시지
 * - 자동 사라짐 및 수동 닫기 기능
 * - 프로필 페이지 이동 링크
 */
interface BadgeEarnedNotificationProps {
  badge: BadgeInfo;
  userBadge: UserBadgeInfo;
  onClose?: () => void;
  onViewProfile?: () => void;
  autoClose?: boolean;
  duration?: number;
  className?: string;
}

export function BadgeEarnedNotification({
  badge,
  userBadge,
  onClose,
  onViewProfile,
  autoClose = true,
  duration = 5000,
  className
}: BadgeEarnedNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // 자동 닫기 타이머
  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, isVisible]);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const handleViewProfile = () => {
    onViewProfile?.();
    handleClose();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200 transform transition-all duration-300 ease-in-out",
        isAnimating ? "translate-x-full opacity-0" : "translate-x-0 opacity-100",
        className
      )}
    >
      <div className="p-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900">
                새로운 배지 획득!
              </h3>
              <p className="text-xs text-gray-500">
                축하합니다! 🎉
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 배지 정보 */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <BadgeIcon 
            badge={badge} 
            size="lg" 
            showTooltip={false}
          />
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 truncate">
              {badge.name}
            </h4>
            <p className="text-xs text-gray-600 truncate">
              {badge.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-green-600">
                +{badge.bonusPoints}P 획득
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                {new Date(userBadge.earnedAt).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewProfile}
            className="flex-1 text-xs"
          >
            <Trophy className="w-3 h-3 mr-1" />
            프로필 보기
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-xs"
          >
            나중에
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * BadgeEarnedNotificationCompact - 컴팩트한 배지 획득 알림
 */
export function BadgeEarnedNotificationCompact({
  badge,
  userBadge,
  onClose,
  className
}: Omit<BadgeEarnedNotificationProps, 'onViewProfile' | 'autoClose' | 'duration'>) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 transform transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <BadgeIcon 
          badge={badge} 
          size="sm" 
          showTooltip={false}
        />
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {badge.name} 획득!
          </p>
          <p className="text-xs text-green-600">
            +{badge.bonusPoints}P
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

/**
 * BadgeNotificationList - 여러 배지 알림 리스트
 */
export function BadgeNotificationList({
  notifications,
  onCloseAll,
  className
}: {
  notifications: Array<{
    badge: BadgeInfo;
    userBadge: UserBadgeInfo;
  }>;
  onCloseAll?: () => void;
  className?: string;
}) {
  const [visibleNotifications, setVisibleNotifications] = useState(notifications);

  const handleClose = (index: number) => {
    setVisibleNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const handleCloseAll = () => {
    setVisibleNotifications([]);
    onCloseAll?.();
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={cn("fixed top-4 right-4 z-50 space-y-2 max-w-sm", className)}>
      {visibleNotifications.length > 1 && (
        <div className="flex justify-between items-center bg-gray-100 rounded-lg p-2">
          <span className="text-xs font-medium text-gray-600">
            {visibleNotifications.length}개의 새 배지
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseAll}
            className="h-6 px-2 text-xs"
          >
            모두 닫기
          </Button>
        </div>
      )}
      
      {visibleNotifications.map((notification, index) => (
        <BadgeEarnedNotificationCompact
          key={notification.userBadge.id}
          badge={notification.badge}
          userBadge={notification.userBadge}
          onClose={() => handleClose(index)}
        />
      ))}
    </div>
  );
}
