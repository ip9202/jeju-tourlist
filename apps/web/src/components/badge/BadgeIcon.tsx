"use client";

import React from "react";
import { BadgeIconProps } from "@/types/badge";
import { cn } from "@/lib/utils";
import { BadgeTooltip } from "./BadgeTooltip";

const sizeClasses = {
  sm: "w-6 h-6 text-sm",
  md: "w-8 h-8 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
};

const rarityColors = {
  COMMON: "border-gray-300 bg-gray-50",
  RARE: "border-blue-300 bg-blue-50",
  EPIC: "border-purple-300 bg-purple-50",
  LEGENDARY: "border-yellow-300 bg-yellow-50",
};

/**
 * BadgeIcon - 배지 아이콘 표시 컴포넌트
 * 
 * @description
 * - 배지의 이모지와 기본 정보를 표시
 * - 크기별 변형 지원 (sm, md, lg, xl)
 * - 툴팁 옵션 지원
 * - 배지 타입별 스타일링
 */
export function BadgeIcon({ 
  badge, 
  size = 'md', 
  showTooltip = true, 
  className 
}: BadgeIconProps) {
  const getRarity = (type: string): keyof typeof rarityColors => {
    switch (type) {
      case 'CATEGORY_EXPERT':
        return 'RARE';
      case 'ACTIVITY_LEVEL':
        return 'COMMON';
      case 'ACHIEVEMENT':
        return 'EPIC';
      case 'SPECIAL':
        return 'LEGENDARY';
      default:
        return 'COMMON';
    }
  };

  const rarity = getRarity(badge.type);
  const sizeClass = sizeClasses[size];

  const iconElement = (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-105",
        rarityColors[rarity],
        sizeClass,
        className
      )}
      role="img"
      aria-label={`${badge.name} 배지`}
    >
      <span className="select-none">{badge.emoji}</span>
    </div>
  );

  if (showTooltip) {
    return (
      <BadgeTooltip badge={badge}>
        {iconElement}
      </BadgeTooltip>
    );
  }

  return iconElement;
}

/**
 * BadgeIconSmall - 작은 크기 배지 아이콘 (기본값)
 */
export function BadgeIconSmall(props: Omit<BadgeIconProps, 'size'>) {
  return <BadgeIcon {...props} size="sm" />;
}

/**
 * BadgeIconMedium - 중간 크기 배지 아이콘
 */
export function BadgeIconMedium(props: Omit<BadgeIconProps, 'size'>) {
  return <BadgeIcon {...props} size="md" />;
}

/**
 * BadgeIconLarge - 큰 크기 배지 아이콘
 */
export function BadgeIconLarge(props: Omit<BadgeIconProps, 'size'>) {
  return <BadgeIcon {...props} size="lg" />;
}

/**
 * BadgeIconExtraLarge - 매우 큰 크기 배지 아이콘
 */
export function BadgeIconExtraLarge(props: Omit<BadgeIconProps, 'size'>) {
  return <BadgeIcon {...props} size="xl" />;
}
