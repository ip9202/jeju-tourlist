"use client";

import React from "react";
import { BadgeProgressProps } from "@/types/badge";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

/**
 * BadgeProgress - 배지 진행률 바 컴포넌트
 * 
 * @description
 * - 배지 획득까지의 진행률을 시각적으로 표시
 * - 현재 진행률과 필요 조건을 명확히 보여줌
 * - 완료된 배지는 특별한 스타일링 적용
 */
export function BadgeProgress({ 
  progress, 
  showPercentage = true, 
  showRequired = true,
  className 
}: BadgeProgressProps) {
  const { badge, currentProgress, requiredProgress, progressPercentage, isEarned } = progress;

  const getProgressColor = () => {
    if (isEarned) return "bg-green-500";
    if (progressPercentage >= 80) return "bg-blue-500";
    if (progressPercentage >= 50) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const getProgressTextColor = () => {
    if (isEarned) return "text-green-600";
    if (progressPercentage >= 80) return "text-blue-600";
    if (progressPercentage >= 50) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* 배지 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{badge.emoji}</span>
          <div>
            <h4 className="font-medium text-sm">{badge.name}</h4>
            {badge.category && (
              <p className="text-xs text-gray-500">{badge.category}</p>
            )}
          </div>
        </div>
        
        {isEarned && (
          <div className="flex items-center gap-1">
            <span className="text-green-500 text-sm">✓</span>
            <span className="text-xs text-green-600 font-medium">완료</span>
          </div>
        )}
      </div>

      {/* 진행률 바 */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className={cn("font-medium", getProgressTextColor())}>
            {isEarned ? "완료!" : `${currentProgress}/${requiredProgress}`}
          </span>
          
          {showPercentage && (
            <span className={cn("font-medium", getProgressTextColor())}>
              {progressPercentage}%
            </span>
          )}
        </div>

        <div className="relative">
          <Progress 
            value={progressPercentage} 
            className="h-2"
          />
          <div 
            className={cn(
              "absolute top-0 left-0 h-2 rounded-full transition-all duration-300",
              getProgressColor()
            )}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>

        {/* 필요 조건 표시 */}
        {showRequired && !isEarned && (
          <div className="text-xs text-gray-500">
            {badge.requiredAnswers - currentProgress}개 더 답변하면 획득!
          </div>
        )}

        {/* 완료된 배지 추가 정보 */}
        {isEarned && progress.earnedAt && (
          <div className="text-xs text-gray-500">
            획득일: {new Date(progress.earnedAt).toLocaleDateString('ko-KR')}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * BadgeProgressCompact - 컴팩트한 진행률 표시
 */
export function BadgeProgressCompact({ 
  progress, 
  className 
}: Omit<BadgeProgressProps, 'showPercentage' | 'showRequired'>) {
  const { badge, progressPercentage, isEarned } = progress;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm">{badge.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium truncate">{badge.name}</span>
          <span className={cn(
            "font-medium",
            isEarned ? "text-green-600" : "text-gray-600"
          )}>
            {isEarned ? "완료" : `${progressPercentage}%`}
          </span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-1"
        />
      </div>
    </div>
  );
}

/**
 * BadgeProgressList - 여러 배지의 진행률을 리스트로 표시
 */
export function BadgeProgressList({ 
  progresses, 
  className 
}: { 
  progresses: BadgeProgressProps['progress'][];
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {progresses.map((progress) => (
        <BadgeProgressCompact 
          key={progress.badgeId} 
          progress={progress} 
        />
      ))}
    </div>
  );
}
