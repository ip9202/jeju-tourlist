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

export const FacebookQuestionCard: React.FC<FacebookQuestionCardProps> = ({
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
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow mb-4"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={
                question.author.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(question.author.name)}&background=0a66c2&color=fff`
              }
              alt={question.author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-sm text-gray-900">
                {question.author.name}
              </p>
              <p className="text-xs text-gray-500">{timeAgo}</p>
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
      <div className="p-4">
        <h3 className="text-base font-bold text-gray-900 mb-2">
          {question.title}
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          {question.content}
        </p>

        {/* Images */}
        {question.images && question.images.length > 0 && (
          <div
            className={`grid gap-2 mb-3 ${
              question.images.length === 1
                ? "grid-cols-1"
                : question.images.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3"
            }`}
          >
            {question.images.map((image, idx) => (
              <img
                key={idx}
                src={image}
                alt={`Image ${idx + 1}`}
                className="rounded-md w-full h-48 object-cover"
              />
            ))}
          </div>
        )}

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex gap-2 mb-3">
            {question.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center text-xs bg-blue-50 text-blue-600 rounded-full px-2 py-1"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 py-3 border-t border-b border-gray-100 flex items-center justify-between text-xs text-gray-600">
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
      <div className="px-4 py-2 flex items-center gap-2">
        <button
          onClick={handleLike}
          disabled={isLoading}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-colors ${
            question.isLiked
              ? "text-red-600 bg-red-50 hover:bg-red-100"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Heart size={18} className={question.isLiked ? "fill-red-600" : ""} />
          좋아요
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
          <MessageCircle size={18} />
          댓글
        </button>
        <button
          onClick={handleShare}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Share2 size={18} />
          공유
        </button>
        <button
          onClick={handleBookmark}
          disabled={isLoading}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-colors ${
            question.isBookmarked
              ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Bookmark
            size={18}
            className={question.isBookmarked ? "fill-blue-600" : ""}
          />
          저장
        </button>
      </div>
    </div>
  );
};

export default FacebookQuestionCard;
