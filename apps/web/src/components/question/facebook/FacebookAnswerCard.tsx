// @CODE:ANSWER-INTERACTION-001-FACEBOOK-CARD
// @SPEC:SPEC-ANSWER-INTERACTION-001-PHASE7
// Facebook-style answer card with like/dislike reactions and adoption indicator

"use client";

import React, { useState } from "react";
import { FacebookAnswerCardProps } from "./types";
import FacebookBadge from "./FacebookBadge";
import { getBadgeType } from "./utils";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Heart, ThumbsDown, ThumbsUp, CheckCircle } from "lucide-react";

/**
 * FacebookAnswerCard Component
 *
 * Displays a single answer in a Facebook-style Q&A interface.
 * Supports nested replies, like/dislike reactions, and answer adoption.
 *
 * Phase 4 Features:
 * - Like/Dislike icon buttons (U2) with visual feedback
 * - Adoption indicator with CheckCircle icon (S2)
 * - Adopt/Unadopt button for question authors (E1)
 *
 * @component
 * @example
 * const answer = {
 *   id: 'ans-1',
 *   content: 'This is an answer',
 *   author: { id: 'u-1', name: 'John', avatar: '...' },
 *   createdAt: new Date().toISOString(),
 *   likeCount: 5,
 *   dislikeCount: 1,
 *   isLiked: false,
 *   isDisliked: false,
 *   isAccepted: false,
 * };
 *
 * return <FacebookAnswerCard answer={answer} onLike={(id, isLiked) => {...}} />;
 */
// @TAG:CODE-ANSWER-INTERACTION-001-U2: FacebookAnswerCard component with icon buttons
// @TAG:CODE-ANSWER-INTERACTION-001-S2: FacebookAnswerCard component with adoption indicator
// @TAG:CODE-ANSWER-INTERACTION-001-E1: FacebookAnswerCard component with adopt button
// DEBUG: Force rebuild
const FacebookAnswerCardComponent: React.FC<FacebookAnswerCardProps> = ({
  answer,
  isNested = false,
  depth = 0,
  onLike,
  onDislike,
  onReply,
  isLoading = false,
  questionAuthor,
  currentUser,
  onAdopt,
  onUnadopt,
}) => {
  // DEBUG: Log render start
  if (typeof window !== "undefined") {
    console.log(
      `[FacebookAnswerCard] ${answer.author.name} - isNested: ${isNested}, depth: ${depth}`
    );
    (window as any).__facebookCardRender = {
      answerId: answer.id,
      questionAuthor,
      currentUser,
      isNested,
      depth,
    };
  }

  const [isHovering, setIsHovering] = useState(false);

  // Calculate if this is a nested reply based on parentId
  // This is more reliable than relying on the isNested prop
  const isActuallyNested = !!answer.parentId;

  // DEBUG: Log values to understand why conditional rendering isn't working
  if (typeof window !== "undefined" && answer.content.length < 50) {
    console.log(
      `[DEBUG] answerId: ${answer.id}, parentId: ${answer.parentId}, isActuallyNested: ${isActuallyNested}`
    );
  }

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

  const handleAdopt = () => {
    if (onAdopt) {
      onAdopt(answer.id);
    }
  };

  const handleUnadopt = () => {
    if (onUnadopt) {
      onUnadopt(answer.id);
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
            {/* Adoption Indicator - Phase 4 @REQ:ANSWER-INTERACTION-001-S2 */}
            {answer.isAccepted && (
              <div className="flex items-center gap-1">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-xs text-green-600 font-semibold">
                  채택됨
                </span>
              </div>
            )}

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
        <div className="!h-fit flex items-center gap-1 mt-1 pl-3 text-xs text-gray-600 md:gap-1 md:mt-0.5 md:pl-2 sm:gap-1 sm:mt-0.5 sm:pl-1.5 sm:text-xs">
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

          {/* Action Buttons - Phase 4 Icon Buttons @REQ:ANSWER-INTERACTION-001-U2 */}
          <button
            onClick={handleLike}
            disabled={isLoading}
            className={`!p-0 !m-0 !leading-none !h-fit !w-fit flex items-center gap-1 hover:text-red-600 transition-colors md:text-xs sm:text-xs ${
              answer.isLiked ? "text-red-600" : "text-gray-600"
            }`}
            title="좋아요"
            aria-label="좋아요"
          >
            <ThumbsUp
              size={16}
              className={answer.isLiked ? "fill-red-600" : ""}
            />
          </button>

          <button
            onClick={handleDislike}
            disabled={isLoading}
            className={`!p-0 !m-0 !leading-none !h-fit !w-fit flex items-center gap-1 hover:text-gray-600 transition-colors md:text-xs sm:text-xs ${
              answer.isDisliked ? "text-gray-600" : "text-gray-400"
            }`}
            title="싫어요"
            aria-label="싫어요"
          >
            <ThumbsDown
              size={16}
              className={answer.isDisliked ? "fill-gray-600" : ""}
            />
          </button>

          <button
            onClick={handleReply}
            disabled={isLoading}
            className="font-semibold hover:text-blue-600 transition-colors md:text-xs sm:text-xs"
            title="답글"
          >
            답글
          </button>

          {/* Phase 4 Adopt Button @REQ:ANSWER-INTERACTION-001-E1 */}
          {/* Only show adopt button for top-level answers (not nested replies) */}
          {/* isActuallyNested calculated from answer.parentId to ensure correct rendering */}
          {!isActuallyNested && (
            <>
              {answer.isAccepted ? (
                <button
                  onClick={handleUnadopt}
                  disabled={isLoading}
                  className="flex items-center gap-1 font-semibold text-green-600 hover:text-green-700 transition-colors md:text-xs sm:text-xs"
                  title="채택 취소"
                  aria-label="채택 취소"
                >
                  <CheckCircle size={16} className="fill-green-600" />
                  <span>채택 해제</span>
                </button>
              ) : (
                <button
                  onClick={handleAdopt}
                  disabled={isLoading}
                  className="flex items-center gap-1 font-semibold hover:text-green-600 transition-colors md:text-xs sm:text-xs"
                  title="채택"
                  aria-label="답변 채택"
                >
                  <CheckCircle size={16} />
                  <span>채택</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const FacebookAnswerCard = FacebookAnswerCardComponent;

export default FacebookAnswerCard;
