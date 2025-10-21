"use client";

import React, { useState } from "react";
import { FacebookAnswerCardProps } from "./types";
import FacebookBadge from "./FacebookBadge";
import { getBadgeType } from "./utils";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Heart, ThumbsDown, MoreHorizontal } from "lucide-react";

export const FacebookAnswerCard: React.FC<FacebookAnswerCardProps> = ({
  answer,
  isNested = false,
  depth = 0,
  onLike,
  onDislike,
  onReply,
  onMore,
  isLoading = false,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(answer.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  const handleLike = () => {
    if (onLike) {
      onLike(answer.id, !answer.isLiked);
    }
  };

  const handleDislike = () => {
    if (onDislike) {
      onDislike(answer.id, !answer.isDisliked);
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply(answer.id);
    }
  };

  const handleMore = () => {
    if (onMore) {
      onMore(answer.id);
    }
  };

  // 중첩 댓글일 경우 왼쪽 마진 적용
  const marginLeft =
    isNested && depth > 0 ? `ml-${Math.min(depth * 8, 32)}` : "";

  return (
    <div
      className={`flex gap-3 py-3 md:gap-2 md:py-2 sm:gap-1.5 sm:py-1.5 ${marginLeft}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Avatar */}
      <img
        src={
          answer.author.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(answer.author.name)}&background=0a66c2&color=fff`
        }
        alt={answer.author.name}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 md:w-7 md:h-7 sm:w-6 sm:h-6"
      />

      {/* Content Bubble */}
      <div className="flex-1">
        <div
          className={`
            rounded-2xl px-4 py-2 transition-colors md:rounded-xl md:px-3 md:py-1.5 sm:rounded-lg sm:px-2.5 sm:py-1
            ${isHovering ? "bg-gray-200" : "bg-gray-100"}
          `}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-1 md:gap-1.5 md:mb-0.5 sm:gap-1 sm:mb-0.5">
            <span className="font-semibold text-sm text-gray-900 md:text-sm sm:text-xs">
              {answer.author.name}
            </span>

            {/* Badges */}
            {(() => {
              const badgeType = getBadgeType(answer);
              return badgeType ? (
                <FacebookBadge type={badgeType} size="sm" />
              ) : null;
            })()}
          </div>

          {/* Content */}
          <p className="text-sm text-gray-800 leading-relaxed mb-2 md:text-sm md:mb-1.5 sm:text-xs sm:mb-1">
            {answer.content}
          </p>

          {/* Image */}
          {answer.imageUrl && (
            <img
              src={answer.imageUrl}
              alt="Answer image"
              className="rounded-lg max-w-xs mb-2 md:max-w-sm md:mb-1.5 sm:max-w-xs sm:mb-1"
            />
          )}
        </div>

        {/* Metadata and Actions */}
        <div className="flex items-center gap-4 mt-1 pl-3 text-xs text-gray-600 md:gap-2 md:mt-0.5 md:pl-2 sm:gap-1 sm:mt-0.5 sm:pl-1.5 sm:text-xs">
          {/* Time */}
          <span>{timeAgo}</span>

          {/* Reactions Count */}
          {(answer.likeCount > 0 || answer.dislikeCount > 0) && (
            <div className="flex items-center gap-1">
              {answer.likeCount > 0 && (
                <span className="flex items-center gap-1">
                  <Heart size={12} className="fill-red-500 text-red-500" />
                  {answer.likeCount}
                </span>
              )}
              {answer.dislikeCount > 0 && (
                <span className="flex items-center gap-1">
                  <ThumbsDown
                    size={12}
                    className="fill-gray-400 text-gray-400"
                  />
                  {answer.dislikeCount}
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <button
            onClick={handleLike}
            disabled={isLoading}
            className={`font-semibold hover:text-red-600 transition-colors md:text-xs sm:text-xs ${
              answer.isLiked ? "text-red-600" : ""
            }`}
            title="좋아요"
          >
            좋아요
          </button>

          <button
            onClick={handleDislike}
            disabled={isLoading}
            className={`font-semibold hover:text-gray-600 transition-colors md:text-xs sm:text-xs ${
              answer.isDisliked ? "text-gray-600" : ""
            }`}
            title="싫어요"
          >
            싫어요
          </button>

          <button
            onClick={handleReply}
            disabled={isLoading}
            className="font-semibold hover:text-blue-600 transition-colors md:text-xs sm:text-xs"
            title="답글"
          >
            답글
          </button>

          {isHovering && (
            <button
              onClick={handleMore}
              disabled={isLoading}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <MoreHorizontal size={16} className="text-gray-600" />
            </button>
          )}
        </div>

        {/* Reply Count */}
        {(answer.replyCount || 0) > 0 && (
          <button className="mt-2 pl-3 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors md:mt-1 md:pl-2 sm:mt-0.5 sm:pl-1.5 sm:text-xs">
            답글 {answer.replyCount}개 보기
          </button>
        )}
      </div>
    </div>
  );
};

export default FacebookAnswerCard;
