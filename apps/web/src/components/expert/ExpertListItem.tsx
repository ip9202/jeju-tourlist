/**
 * ExpertListItem 컴포넌트
 *
 * @description
 * - 전문가 정보를 리스트 아이템 형태로 표시하는 컴포넌트
 * - LSP(Liskov Substitution Principle) 적용
 * - ExpertCard와 호환 가능한 인터페이스 제공
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
  ChevronRight,
  MapPin,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpertListItemProps {
  expert: Expert;
  rank?: number;
  showRank?: boolean;
  showBadges?: boolean;
  showStats?: boolean;
  showActions?: boolean;
  variant?: "default" | "compact" | "detailed";
  className?: string;
  onClick?: (expert: Expert) => void;
  onActionClick?: (expert: Expert, action: string) => void;
}

export const ExpertListItem: React.FC<ExpertListItemProps> = ({
  expert,
  rank,
  showRank = true,
  showBadges = true,
  showStats = true,
  showActions = false,
  variant = "default",
  className = "",
  onClick,
  onActionClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(expert);
    }
  };

  const handleActionClick = (action: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onActionClick) {
      onActionClick(expert, action);
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return "bg-yellow-500";
    if (rank <= 10) return "bg-blue-500";
    return "bg-gray-500";
  };

  const getPrimaryBadgeColor = (badge: BadgeInfo | null) => {
    if (!badge?.category) return "#6b7280";
    return (
      CATEGORY_COLORS[badge.category as keyof typeof CATEGORY_COLORS] ||
      "#6b7280"
    );
  };

  const formatJoinDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
    });
  };

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0",
          className
        )}
        onClick={handleClick}
      >
        {/* 랭킹 */}
        {showRank && rank && (
          <div className="flex-shrink-0 w-8 text-center">
            <span className="text-sm font-semibold text-gray-500">{rank}</span>
          </div>
        )}

        {/* 아바타 */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {expert.avatar ? (
              <img
                src={expert.avatar}
                alt={expert.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                {expert.nickname.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {expert.nickname}
            </h3>
            {expert.primaryBadge && (
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: getPrimaryBadgeColor(expert.primaryBadge),
                }}
              >
                <Award className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* 통계 */}
        {showStats && (
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{expert.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <span>{expert.totalAnswers}</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>{expert.adoptRate.toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* 포인트 */}
        <div className="flex-shrink-0 text-right">
          <div className="text-sm font-semibold text-blue-600">
            {expert.points.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">포인트</div>
        </div>

        {/* 액션 */}
        {showActions && (
          <div className="flex-shrink-0">
            <button
              onClick={e => handleActionClick("view", e)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div
        className={cn(
          "p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0",
          className
        )}
        onClick={handleClick}
      >
        <div className="flex items-start space-x-4">
          {/* 랭킹 */}
          {showRank && rank && (
            <div className="flex-shrink-0 w-8 text-center pt-1">
              <span className="text-lg font-bold text-gray-500">{rank}</span>
            </div>
          )}

          {/* 아바타 */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {expert.avatar ? (
                <img
                  src={expert.avatar}
                  alt={expert.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                  {expert.nickname.charAt(0)}
                </div>
              )}
            </div>
            {rank && rank <= 10 && (
              <div
                className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${getRankBadgeColor(rank)} flex items-center justify-center text-xs font-bold text-white`}
              >
                {rank}
              </div>
            )}
          </div>

          {/* 메인 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900 truncate">
                    {expert.nickname}
                  </h3>
                  {expert.primaryBadge && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: getPrimaryBadgeColor(
                          expert.primaryBadge
                        ),
                      }}
                    >
                      <Award className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
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

              {/* 포인트 */}
              <div className="text-right ml-4">
                <div className="text-xl font-bold text-blue-600">
                  {expert.points.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">포인트</div>
              </div>
            </div>

            {/* 통계 */}
            {showStats && (
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold text-gray-900">
                      {expert.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">평점</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-gray-900">
                      {expert.totalAnswers}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">답변수</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
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
                {expert.badges.slice(0, 4).map(badge => (
                  <div
                    key={badge.id}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                  >
                    <span>{badge.emoji}</span>
                    <span className="text-gray-700">{badge.name}</span>
                  </div>
                ))}
                {expert.badges.length > 4 && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                    <span className="text-gray-500">
                      +{expert.badges.length - 4}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 액션 */}
          {showActions && (
            <div className="flex-shrink-0 ml-4">
              <button
                onClick={e => handleActionClick("view", e)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 기본 variant
  return (
    <div
      className={cn(
        "flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0",
        className
      )}
      onClick={handleClick}
    >
      {/* 랭킹 */}
      {showRank && rank && (
        <div className="flex-shrink-0 w-8 text-center">
          <span className="text-lg font-bold text-gray-500">{rank}</span>
        </div>
      )}

      {/* 아바타 */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
          {expert.avatar ? (
            <img
              src={expert.avatar}
              alt={expert.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
              {expert.nickname.charAt(0)}
            </div>
          )}
        </div>
        {rank && rank <= 10 && (
          <div
            className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${getRankBadgeColor(rank)} flex items-center justify-center text-xs font-bold text-white`}
          >
            {rank}
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
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

        {/* 통계 */}
        {showStats && (
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{expert.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <span>{expert.totalAnswers}</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>{expert.adoptRate.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* 포인트 */}
      <div className="flex-shrink-0 text-right">
        <div className="text-lg font-bold text-blue-600">
          {expert.points.toLocaleString()}
        </div>
        <div className="text-sm text-gray-500">포인트</div>
      </div>

      {/* 액션 */}
      {showActions && (
        <div className="flex-shrink-0">
          <button
            onClick={e => handleActionClick("view", e)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
};
