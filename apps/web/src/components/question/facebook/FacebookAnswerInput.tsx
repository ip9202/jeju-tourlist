// @CODE:ANSWER-INTERACTION-001-FACEBOOK-INPUT
// @SPEC:SPEC-ANSWER-INTERACTION-001-PHASE7
// Facebook-style answer input component with expandable textarea

"use client";

import React, { useState } from "react";
import { FacebookAnswerInputProps } from "./types";
import { Smile, Send, X } from "lucide-react";

export const FacebookAnswerInput: React.FC<FacebookAnswerInputProps> = ({
  placeholder = "댓글을 작성해주세요...",
  onSubmit,
  user,
  isLoading = false,
  isReply = false,
  parentAuthorName,
  onCancel,
}) => {
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await onSubmit(content);
      setContent("");
      setIsExpanded(false);
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const handleCancel = () => {
    setContent("");
    setIsExpanded(false);
    if (onCancel) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  // 로그인이 필요한 경우
  if (!user) {
    return (
      <div
        className={`
        rounded-lg bg-gray-50 border border-gray-200 p-4 md:rounded-md md:p-3 sm:rounded-none sm:p-2
        ${isReply ? "ml-10 md:ml-8 sm:ml-6" : "mb-4 md:mb-3 sm:mb-2"}
      `}
      >
        <p className="text-gray-600 text-sm text-center">
          답변을 작성하려면 로그인이 필요합니다.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`
        rounded-lg bg-white border border-gray-300 transition-all md:rounded-md sm:rounded-none
        shadow-sm
        ${isReply ? "ml-10 md:ml-8 sm:ml-6" : "mb-4 md:mb-3 sm:mb-2"}
      `}
    >
      {/* Reply Header */}
      {isReply && parentAuthorName && (
        <div className="px-4 pt-3 pb-0 text-xs text-gray-600 flex items-center justify-between md:px-3 md:pt-2 md:text-xs sm:px-2 sm:pt-1.5 sm:text-xs">
          <span>
            <span className="font-semibold text-gray-900">
              @{parentAuthorName}
            </span>
            에게 답글 중
          </span>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
      )}

      {/* Input Container */}
      <div className="p-3 flex gap-3 md:p-2 md:gap-2 sm:p-1.5 sm:gap-1.5">
        {/* Avatar */}
        {user && (
          <img
            src={
              user.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0a66c2&color=fff`
            }
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 md:w-7 md:h-7 sm:w-6 sm:h-6"
          />
        )}

        {/* Input Area */}
        <div className="flex-1 border border-blue-500 rounded-lg transition-all focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden p-2">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => {
              setIsExpanded(true);
            }}
            onBlur={() => {
              if (!content.trim()) {
                setIsExpanded(false);
              }
            }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={placeholder}
            className={`
              w-full bg-gray-100 border-0 rounded-full focus:bg-white focus:outline-none
              px-3 py-2 text-sm resize-none
              transition-all placeholder-gray-500 md:px-2 md:py-1.5 md:text-sm sm:px-2 sm:py-1 sm:text-xs
              ${isExpanded ? "py-2 rounded-lg md:py-2 sm:py-1.5" : "py-2 rounded-full"}
            `}
            rows={isExpanded ? 3 : 1}
          />

          {/* Action Buttons */}
          {isExpanded && (
            <div className="mt-2 flex items-center justify-between md:mt-1.5 sm:mt-1">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors md:p-1.5 sm:p-1">
                <Smile
                  size={18}
                  className="text-gray-600 md:w-5 md:h-5 sm:w-4 sm:h-4"
                />
              </button>

              <div className="flex gap-2 md:gap-1.5 sm:gap-1">
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 md:px-3 md:py-1.5 md:text-xs sm:px-2 sm:py-1 sm:text-xs"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:opacity-50 flex items-center gap-2 md:px-3 md:py-1.5 md:text-xs sm:px-2 sm:py-1 sm:text-xs sm:min-h-[44px]"
                >
                  <Send size={16} className="md:w-4 md:h-4 sm:w-4 sm:h-4" />
                  <span className="sm:hidden">등록</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacebookAnswerInput;
