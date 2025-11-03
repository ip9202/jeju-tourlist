"use client";

import React from "react";
import { FacebookBadgeProps } from "./types";

// Badge configuration with tooltip descriptions
const badgeConfig = {
  accepted: {
    label: "채택됨",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-700 dark:text-green-400",
    icon: "✓",
    tooltip: "질문 작성자가 채택한 답변입니다",
    priority: 1, // Highest priority
  },
  verified: {
    label: "인증",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-700 dark:text-purple-400",
    icon: "✓",
    tooltip: "신원이 인증된 전문가입니다",
    priority: 2,
  },
  expert: {
    label: "전문가",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-700 dark:text-blue-400",
    icon: "⭐",
    tooltip: "질문 작성자입니다",
    priority: 3,
  },
  popular: {
    label: "인기",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    textColor: "text-orange-700 dark:text-orange-400",
    icon: "🔥",
    tooltip: "많은 좋아요를 받은 답변입니다",
    priority: 4,
  },
  newbie: {
    label: "신입",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-700 dark:text-yellow-400",
    icon: "🌟",
    tooltip: "최근에 활동을 시작한 사용자입니다",
    priority: 5, // Lowest priority
  },
};

const sizeConfig = {
  sm: {
    fontSize: "text-xs",
    padding: "px-2 py-0.5",
    icon: "text-xs",
  },
  md: {
    fontSize: "text-sm",
    padding: "px-2.5 py-1",
    icon: "text-sm",
  },
  lg: {
    fontSize: "text-base",
    padding: "px-3 py-1.5",
    icon: "text-base",
  },
};

const FacebookBadgeComponent: React.FC<FacebookBadgeProps> = ({
  type,
  size = "md",
  showTooltip = false,
}) => {
  const badge = badgeConfig[type];
  const sizes = sizeConfig[size];
  const [isHovered, setIsHovered] = React.useState(false);

  if (!badge) return null;

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className={`
          inline-flex items-center gap-1 rounded-full font-semibold
          transition-all duration-200 ease-in-out
          ${badge.bgColor} ${badge.textColor}
          ${sizes.fontSize} ${sizes.padding}
          hover:shadow-md hover:scale-105
          cursor-help
        `}
        title={showTooltip ? undefined : badge.tooltip}
      >
        <span className={sizes.icon}>{badge.icon}</span>
        <span>{badge.label}</span>
      </span>

      {/* Tooltip (only show if showTooltip is true and hovered) */}
      {showTooltip && isHovered && (
        <span
          className="
            absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
            px-3 py-1.5 text-xs text-white bg-gray-900 dark:bg-gray-700
            rounded-md shadow-lg whitespace-nowrap z-50
            pointer-events-none
            animate-in fade-in duration-150
          "
        >
          {badge.tooltip}
          {/* Arrow */}
          <span
            className="
              absolute top-full left-1/2 transform -translate-x-1/2
              border-4 border-transparent border-t-gray-900 dark:border-t-gray-700
            "
          />
        </span>
      )}
    </span>
  );
};

export const FacebookBadge = React.memo(FacebookBadgeComponent);

export default FacebookBadge;
