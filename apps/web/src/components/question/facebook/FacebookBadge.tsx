"use client";

import React from "react";
import { FacebookBadgeProps } from "./types";

const badgeConfig = {
  accepted: {
    label: "채택됨",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    icon: "✓",
  },
  expert: {
    label: "전문가",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    icon: "⭐",
  },
  newbie: {
    label: "신입",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    icon: "🌟",
  },
};

const sizeConfig = {
  sm: {
    fontSize: "text-xs",
    padding: "px-2 py-1",
    icon: "text-xs",
  },
  md: {
    fontSize: "text-sm",
    padding: "px-2.5 py-1.5",
    icon: "text-sm",
  },
  lg: {
    fontSize: "text-base",
    padding: "px-3 py-2",
    icon: "text-base",
  },
};

export const FacebookBadge: React.FC<FacebookBadgeProps> = ({
  type,
  size = "md",
}) => {
  const badge = badgeConfig[type];
  const sizes = sizeConfig[size];

  if (!badge) return null;

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-semibold
        ${badge.bgColor} ${badge.textColor}
        ${sizes.fontSize} ${sizes.padding}
      `}
    >
      <span className={sizes.icon}>{badge.icon}</span>
      {badge.label}
    </span>
  );
};

export default FacebookBadge;
