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
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await onSubmit(content);
      setContent("");
      setIsExpanded(false);
      setIsFocused(false);
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const handleCancel = () => {
    setContent("");
    setIsExpanded(false);
    setIsFocused(false);
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

  return (
    <div
      className={`
        rounded-lg bg-white border transition-all
        ${isFocused ? "border-blue-400 shadow-md" : "border-gray-200 shadow-sm"}
        ${isReply ? "ml-10" : "mb-4"}
      `}
    >
      {/* Reply Header */}
      {isReply && parentAuthorName && (
        <div className="px-4 pt-3 pb-0 text-xs text-gray-600 flex items-center justify-between">
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
      <div className="p-3 flex gap-3">
        {/* Avatar */}
        {user && (
          <img
            src={
              user.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0a66c2&color=fff`
            }
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        )}

        {/* Input Area */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setIsExpanded(true);
            }}
            onBlur={() => {
              if (!content.trim()) {
                setIsFocused(false);
                setIsExpanded(false);
              }
            }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={placeholder}
            className={`
              w-full bg-gray-100 border-0 rounded-full focus:bg-white focus:outline-none
              focus:ring-2 focus:ring-blue-400 px-4 py-2 text-sm resize-none
              transition-all placeholder-gray-500
              ${isExpanded ? "py-3 rounded-lg" : "py-2 rounded-full"}
            `}
            rows={isExpanded ? 3 : 1}
          />

          {/* Action Buttons */}
          {isExpanded && (
            <div className="mt-2 flex items-center justify-between">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Smile size={18} className="text-gray-600" />
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:opacity-50 flex items-center gap-2"
                >
                  <Send size={16} />
                  등록
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
