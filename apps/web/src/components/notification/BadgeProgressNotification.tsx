"use client";

import React, { useState, useEffect } from "react";
import { BadgeInfo, BadgeProgress } from "@/types/badge";
import { BadgeIcon } from "@/components/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, CheckCircle } from "lucide-react";

/**
 * BadgeProgressNotification - 배지 진행률 알림 컴포넌트
 * 
 * @description
 * - 배지 진행률 80% 달성 시 알림
 * - 목표 달성까지 남은 활동량 표시
 * - 진행률 알림 설정 지원
 */
interface BadgeProgressNotificationProps {
  progress: BadgeProgress;
  onClose?: () => void;
  onViewProfile?: () => void;
  autoClose?: boolean;
  duration?: number;
  className?: string;
}

export function BadgeProgressNotification({
  progress,
  onClose,
  onViewProfile,
  autoClose = true,
  duration = 4000,
  className
}: BadgeProgressNotificationProps) {
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

  const remainingAnswers = progress.requiredProgress - progress.currentProgress;
  const isNearGoal = progress.progressPercentage >= 80;

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
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              isNearGoal ? "bg-blue-100" : "bg-yellow-100"
            )}>
              {isNearGoal ? (
                <TrendingUp className="w-5 h-5 text-blue-600" />
              ) : (
                <Target className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900">
                {isNearGoal ? "목표 달성 임박!" : "진행률 업데이트"}
              </h3>
              <p className="text-xs text-gray-500">
                {isNearGoal ? "거의 다 왔어요! 🎯" : "좋은 진전이에요! 📈"}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            ×
          </Button>
        </div>

        {/* 배지 정보 */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <BadgeIcon 
            badge={progress.badge} 
            size="md" 
            showTooltip={false}
          />
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 truncate">
              {progress.badge.name}
            </h4>
            <p className="text-xs text-gray-600 truncate">
              {progress.badge.description}
            </p>
          </div>
        </div>

        {/* 진행률 표시 */}
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-gray-700">
              {progress.currentProgress}/{progress.requiredProgress} 답변
            </span>
            <span className={cn(
              "font-medium",
              isNearGoal ? "text-blue-600" : "text-gray-600"
            )}>
              {progress.progressPercentage}%
            </span>
          </div>
          
          <Progress 
            value={progress.progressPercentage} 
            className="h-2"
          />
          
          {remainingAnswers > 0 && (
            <div className="text-xs text-gray-500 text-center">
              {remainingAnswers}개 더 답변하면 배지 획득! 🏆
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewProfile}
            className="flex-1 text-xs"
          >
            <Target className="w-3 h-3 mr-1" />
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
 * BadgeProgressNotificationCompact - 컴팩트한 진행률 알림
 */
export function BadgeProgressNotificationCompact({
  progress,
  onClose,
  className
}: Omit<BadgeProgressNotificationProps, 'onViewProfile' | 'autoClose' | 'duration'>) {
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

  const remainingAnswers = progress.requiredProgress - progress.currentProgress;
  const isNearGoal = progress.progressPercentage >= 80;

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 transform transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <BadgeIcon 
          badge={progress.badge} 
          size="sm" 
          showTooltip={false}
        />
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {progress.badge.name}
          </p>
          <div className="flex items-center gap-2">
            <Progress 
              value={progress.progressPercentage} 
              className="h-1 flex-1"
            />
            <span className="text-xs text-gray-500">
              {progress.progressPercentage}%
            </span>
          </div>
          {remainingAnswers > 0 && (
            <p className="text-xs text-gray-500">
              {remainingAnswers}개 남음
            </p>
          )}
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
          ×
        </Button>
      </div>
    </div>
  );
}

/**
 * BadgeProgressNotificationSettings - 진행률 알림 설정 컴포넌트
 */
export function BadgeProgressNotificationSettings() {
  const [settings, setSettings] = useState({
    enabled: true,
    threshold: 80,
    frequency: 'once', // 'once', 'daily', 'weekly'
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // 로컬 스토리지에 저장
    localStorage.setItem('progress-notification-settings', JSON.stringify({
      ...settings,
      [key]: value
    }));
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('progress-notification-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('설정 로드 실패:', error);
      }
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">진행률 알림</h3>
          <p className="text-xs text-gray-500">배지 진행률 업데이트 알림</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => handleSettingChange('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">알림 임계값</h3>
          <p className="text-xs text-gray-500">진행률 몇 %에서 알림할지</p>
        </div>
        <select
          value={settings.threshold}
          onChange={(e) => handleSettingChange('threshold', parseInt(e.target.value))}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value={50}>50%</option>
          <option value={70}>70%</option>
          <option value={80}>80%</option>
          <option value={90}>90%</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">알림 빈도</h3>
          <p className="text-xs text-gray-500">알림을 얼마나 자주 받을지</p>
        </div>
        <select
          value={settings.frequency}
          onChange={(e) => handleSettingChange('frequency', e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="once">한 번만</option>
          <option value="daily">매일</option>
          <option value="weekly">주간</option>
        </select>
      </div>
    </div>
  );
}
