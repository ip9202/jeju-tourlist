"use client";

import React, { useState } from "react";
import { FacebookQuestionCardProps } from "./types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Eye,
} from "lucide-react";

const FacebookQuestionCardComponent: React.FC<FacebookQuestionCardProps> = ({
  question,
  onShare,
  onBookmark,
  onLike,
  isLoading = false,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(question.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  const handleLike = () => {
    if (onLike) {
      onLike(question.id, !question.isLiked);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(question.id);
    }
  };

  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark(question.id, !question.isBookmarked);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow mb-4 md:rounded-md md:mb-3 sm:rounded-none sm:mb-2 sm:border-t sm:border-b sm:border-x-0"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 md:p-3 sm:p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={
                question.author.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(question.author.name)}&background=0a66c2&color=fff`
              }
              alt={question.author.name}
              className="w-10 h-10 rounded-full object-cover md:w-9 md:h-9 sm:w-8 sm:h-8"
            />
            <div>
              <p className="font-semibold text-sm text-gray-900 md:text-sm sm:text-xs">
                {question.author.name}
              </p>
              <p className="text-xs text-gray-500 md:text-xs sm:text-xs">
                {timeAgo}
              </p>
            </div>
          </div>
          {isHovering && (
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreHorizontal size={18} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-3 sm:p-2">
        <h3 className="text-base font-bold text-gray-900 mb-2 md:text-base sm:text-sm">
          {question.title}
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-3 md:text-sm sm:text-xs md:mb-2 sm:mb-2">
          {question.content}
        </p>

        {/* Images */}
        {question.images && question.images.length > 0 && (
          <div
            className={`grid gap-2 mb-3 md:gap-1 md:mb-2 sm:gap-1 sm:mb-2 ${
              question.images.length === 1
                ? "grid-cols-1"
                : question.images.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3 md:grid-cols-2 sm:grid-cols-1"
            }`}
          >
            {question.images.map((image, idx) => (
              <img
                key={idx}
                src={image}
                alt={`Image ${idx + 1}`}
                loading="lazy"
                className="rounded-md w-full h-48 object-cover md:h-40 sm:h-32"
              />
            ))}
          </div>
        )}

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap md:gap-1 md:mb-2 sm:gap-1 sm:mb-2">
            {question.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center text-xs bg-blue-50 text-blue-600 rounded-full px-2 py-1 md:px-1.5 md:py-0.5 sm:text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 py-3 border-t border-b border-gray-100 flex items-center justify-between text-xs text-gray-600 md:px-3 md:py-2 sm:px-2 sm:py-1.5 sm:text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Heart
              size={16}
              className={question.isLiked ? "fill-red-500 text-red-500" : ""}
            />
            {question.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={16} />
            {question.answerCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={16} />
            {question.viewCount}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-2 flex items-center gap-2 md:px-3 md:py-1.5 md:gap-1 sm:px-2 sm:py-1 sm:gap-0.5">
        <button
          onClick={handleLike}
          disabled={isLoading}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-colors md:gap-0 md:py-1.5 md:text-xs sm:gap-0 sm:py-1.5 sm:min-h-[44px] sm:rounded-md ${
            question.isLiked
              ? "text-red-600 bg-red-50 hover:bg-red-100"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="좋아요"
        >
          <Heart
            size={18}
            className={`${question.isLiked ? "fill-red-600" : ""} md:w-5 md:h-5 sm:w-6 sm:h-6`}
          />
          <span className="md:hidden">좋아요</span>
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors md:gap-0 md:py-1.5 md:text-xs sm:gap-0 sm:py-1.5 sm:min-h-[44px] sm:rounded-md"
          title="댓글"
        >
          <MessageCircle size={18} className="md:w-5 md:h-5 sm:w-6 sm:h-6" />
          <span className="md:hidden">댓글</span>
        </button>
        <button
          onClick={handleShare}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors md:gap-0 md:py-1.5 md:text-xs sm:gap-0 sm:py-1.5 sm:min-h-[44px] sm:rounded-md"
          title="공유"
        >
          <Share2 size={18} className="md:w-5 md:h-5 sm:w-6 sm:h-6" />
          <span className="md:hidden">공유</span>
        </button>
        <button
          onClick={handleBookmark}
          disabled={isLoading}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-colors md:gap-0 md:py-1.5 md:text-xs sm:gap-0 sm:py-1.5 sm:min-h-[44px] sm:rounded-md ${
            question.isBookmarked
              ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="저장"
        >
          <Bookmark
            size={18}
            className={`${question.isBookmarked ? "fill-blue-600" : ""} md:w-5 md:h-5 sm:w-6 sm:h-6`}
          />
          <span className="md:hidden">저장</span>
        </button>
      </div>
    </div>
  );
};

export const FacebookQuestionCard = React.memo(FacebookQuestionCardComponent);

export default FacebookQuestionCard;
