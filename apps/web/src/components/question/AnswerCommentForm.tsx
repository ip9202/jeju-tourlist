"use client";

import React, { useState } from "react";
import { Button, Textarea } from "@jeju-tourlist/ui";
import { Send, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * AnswerCommentForm 컴포넌트 Props
 */
interface AnswerCommentFormProps {
  answerId: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  isSubmitting?: boolean;
}

/**
 * AnswerCommentForm 컴포넌트
 *
 * @description
 * - 답변에 대한 댓글을 작성하는 폼 컴포넌트
 * - 실시간 글자 수 표시 및 검증
 * - 제출 및 취소 기능
 */
export const AnswerCommentForm: React.FC<AnswerCommentFormProps> = ({
  answerId: _answerId,
  onSubmit,
  onCancel,
  placeholder = "댓글을 작성하세요...",
  className = "",
  isSubmitting = false,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 검증
    if (!content.trim()) {
      setError("댓글 내용을 입력해주세요");
      return;
    }

    if (content.trim().length < 2) {
      setError("댓글을 2자 이상 입력해주세요");
      return;
    }

    if (content.trim().length > 1000) {
      setError("댓글은 1000자 이하로 입력해주세요");
      return;
    }

    try {
      setError("");
      await onSubmit(content.trim());
      setContent(""); // 성공 시 폼 초기화
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글 작성에 실패했습니다");
    }
  };

  /**
   * 취소 핸들러
   */
  const handleCancel = () => {
    setContent("");
    setError("");
    onCancel?.();
  };

  /**
   * 내용 변경 핸들러
   */
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (error) setError(""); // 에러 메시지 초기화
  };

  // 인증되지 않은 사용자는 로그인 안내만 표시 (댓글 목록은 상위 컴포넌트에서 표시)
  if (!isAuthenticated) {
    return (
      <div
        className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}
      >
        <p className="text-sm text-blue-700 text-center">
          💡 댓글을 작성하려면{" "}
          <button className="underline font-medium">로그인</button>이 필요합니다
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-gray-50 rounded-lg p-4 ${className}`}
    >
      {/* 사용자 정보 */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user?.name?.charAt(0) || "U"}
        </div>
        <span className="text-sm font-medium">{user?.name || "사용자"}</span>
      </div>

      {/* 댓글 입력 */}
      <div className="mb-3">
        <Textarea
          value={content}
          onChange={handleContentChange}
          placeholder={placeholder}
          rows={3}
          className="resize-none"
          maxLength={1000}
        />

        {/* 글자 수 표시 */}
        <div className="flex justify-between items-center mt-1">
          <div className="text-xs text-gray-500">{content.length}/1000자</div>

          {/* 에러 메시지 */}
          {error && <div className="text-xs text-red-500">{error}</div>}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-1" />
            취소
          </Button>
        )}

        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !content.trim()}
        >
          <Send className="h-4 w-4 mr-1" />
          {isSubmitting ? "등록 중..." : "댓글 등록"}
        </Button>
      </div>
    </form>
  );
};
