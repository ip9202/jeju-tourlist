/**
 * ExpertCard 컴포넌트
 *
 * @description
 * - 전문가 정보를 카드 형태로 표시하는 컴포넌트
 * - SRP(Single Responsibility Principle) 적용
 * - 전문가 정보 표시에만 집중
 * - 플랫 모던 디자인 적용
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

"use client";

import React from "react";
import { Expert, CATEGORY_COLORS } from "@/types/expert";
import { BadgeInfo } from "@/types/badge";
import {
  Star,
  MessageCircle,
  TrendingUp,
  Award,
  MapPin,
  Calendar,
} from "lucide-react";

interface ExpertCardProps {
  expert: Expert;
  variant?: "default" | "compact" | "detailed";
  showRank?: boolean;
  showBadges?: boolean;
  showStats?: boolean;
  className?: string;
  onClick?: (expert: Expert) => void;
}

export const ExpertCard: React.FC<ExpertCardProps> = ({
  expert,
  variant = "default",
  showRank = true,
  showBadges = true,
  showStats = true,
  className = "",
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(expert);
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return "bg-yellow-500";
    if (rank <= 10) return "bg-blue-500";
    return "bg-gray-500";
  };

  const getRankBadgeText = (rank: number) => {
    if (rank <= 3) return "text-white";
    if (rank <= 10) return "text-white";
    return "text-white";
  };

  const formatJoinDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
    });
  };

  const getPrimaryBadgeColor = (badge: BadgeInfo | null) => {
    if (!badge?.category) return "#6b7280";
    return (
      CATEGORY_COLORS[badge.category as keyof typeof CATEGORY_COLORS] ||
      "#6b7280"
    );
  };

  if (variant === "compact") {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer ${className}`}
        onClick={handleClick}
      >
        <div className="flex items-center space-x-3">
          {/* 아바타 */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {expert.avatar ? (
                <img
                  src={expert.avatar}
                  alt={expert.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                  {expert.name.charAt(0)}
                </div>
              )}
            </div>
            {showRank && expert.rank <= 10 && (
              <div
                className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${getRankBadgeColor(expert.rank)} flex items-center justify-center text-xs font-bold ${getRankBadgeText(expert.rank)}`}
              >
                {expert.rank}
              </div>
            )}
          </div>

          {/* 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {expert.name}
              </h3>
              {expert.primaryBadge && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: getPrimaryBadgeColor(expert.primaryBadge),
                  }}
                >
                  <Award className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">{expert.nickname}</p>
            {showStats && (
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Star className="w-3 h-3" />
                  <span>{expert.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <MessageCircle className="w-3 h-3" />
                  <span>{expert.totalAnswers}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <TrendingUp className="w-3 h-3" />
                  <span>{expert.adoptRate.toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div
        className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer ${className}`}
        onClick={handleClick}
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* 아바타 */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {expert.avatar ? (
                  <img
                    src={expert.avatar}
                    alt={expert.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xl">
                    {expert.name.charAt(0)}
                  </div>
                )}
              </div>
              {showRank && expert.rank <= 10 && (
                <div
                  className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${getRankBadgeColor(expert.rank)} flex items-center justify-center text-sm font-bold ${getRankBadgeText(expert.rank)}`}
                >
                  {expert.rank}
                </div>
              )}
            </div>

            {/* 기본 정보 */}
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {expert.name}
                </h3>
                {expert.primaryBadge && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: getPrimaryBadgeColor(
                        expert.primaryBadge
                      ),
                    }}
                  >
                    <Award className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-2">{expert.nickname}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatJoinDate(expert.joinDate)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>제주도</span>
                </div>
              </div>
            </div>
          </div>

          {/* 포인트 */}
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {expert.points.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">포인트</div>
          </div>
        </div>

        {/* 통계 */}
        {showStats && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold text-gray-900">
                  {expert.rating.toFixed(1)}
                </span>
              </div>
              <div className="text-xs text-gray-500">평점</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-gray-900">
                  {expert.totalAnswers}
                </span>
              </div>
              <div className="text-xs text-gray-500">답변수</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-gray-900">
                  {expert.adoptRate.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-gray-500">채택률</div>
            </div>
          </div>
        )}

        {/* 배지 */}
        {showBadges && expert.badges.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              대표 배지
            </h4>
            <div className="flex flex-wrap gap-2">
              {expert.badges.slice(0, 3).map(badge => (
                <div
                  key={badge.id}
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                >
                  <span>{badge.emoji}</span>
                  <span className="text-gray-700">{badge.name}</span>
                </div>
              ))}
              {expert.badges.length > 3 && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                  <span className="text-gray-500">
                    +{expert.badges.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 최근 활동 */}
        <div className="text-sm text-gray-500">
          최근 활동: {formatJoinDate(expert.joinDate)}
        </div>
      </div>
    );
  }

  // 기본 variant
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* 아바타 */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {expert.avatar ? (
                <img
                  src={expert.avatar}
                  alt={expert.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {expert.name.charAt(0)}
                </div>
              )}
            </div>
            {showRank && expert.rank <= 10 && (
              <div
                className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${getRankBadgeColor(expert.rank)} flex items-center justify-center text-xs font-bold ${getRankBadgeText(expert.rank)}`}
              >
                {expert.rank}
              </div>
            )}
          </div>

          {/* 이름과 배지 */}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{expert.name}</h3>
              {expert.primaryBadge && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: getPrimaryBadgeColor(expert.primaryBadge),
                  }}
                >
                  <Award className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">{expert.nickname}</p>
          </div>
        </div>

        {/* 포인트 */}
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            {expert.points.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">포인트</div>
        </div>
      </div>

      {/* 통계 */}
      {showStats && (
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold text-gray-900">
                {expert.rating.toFixed(1)}
              </span>
            </div>
            <div className="text-xs text-gray-500">평점</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-gray-900">
                {expert.totalAnswers}
              </span>
            </div>
            <div className="text-xs text-gray-500">답변수</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-gray-900">
                {expert.adoptRate.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-500">채택률</div>
          </div>
        </div>
      )}

      {/* 배지 */}
      {showBadges && expert.badges.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {expert.badges.slice(0, 3).map(badge => (
            <div
              key={badge.id}
              className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
            >
              <span>{badge.emoji}</span>
              <span className="text-gray-700">{badge.name}</span>
            </div>
          ))}
          {expert.badges.length > 3 && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
              <span className="text-gray-500">+{expert.badges.length - 3}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
