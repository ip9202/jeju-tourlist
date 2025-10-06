"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@jeju-tourlist/ui";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { AnswerCommentCard } from "./AnswerCommentCard";
import { AnswerCommentForm } from "./AnswerCommentForm";

/**
 * 답변 댓글 데이터 타입
 */
interface AnswerComment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
  isAuthor?: boolean;
}

/**
 * AnswerCommentList 컴포넌트 Props
 */
interface AnswerCommentListProps {
  answerId: string;
  comments?: AnswerComment[];
  onCommentSubmit?: (content: string) => Promise<void>;
  onCommentLike?: (commentId: string) => Promise<void>;
  onCommentEdit?: (commentId: string, newContent: string) => Promise<void>;
  onCommentDelete?: (commentId: string) => Promise<void>;
  className?: string;
  showForm?: boolean;
  maxVisibleComments?: number;
}

/**
 * AnswerCommentList 컴포넌트
 *
 * @description
 * - 답변에 대한 댓글 목록을 표시하는 컴포넌트
 * - 댓글 작성, 수정, 삭제, 좋아요 기능 포함
 * - 댓글 펼치기/접기 기능
 */
export const AnswerCommentList: React.FC<AnswerCommentListProps> = ({
  answerId,
  comments = [],
  onCommentSubmit,
  onCommentLike,
  onCommentEdit,
  onCommentDelete,
  className = "",
  showForm = true,
  maxVisibleComments = 5,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState<AnswerComment[]>(comments);

  // 댓글 목록 업데이트
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  /**
   * 댓글 제출 핸들러
   */
  const handleCommentSubmit = async (content: string) => {
    if (!onCommentSubmit) return;

    setIsSubmitting(true);
    try {
      await onCommentSubmit(content);
      // 성공 시 로컬 상태 업데이트는 부모 컴포넌트에서 처리
    } catch (error) {
      console.error("댓글 제출 실패:", error);
      throw error; // AnswerCommentForm에서 에러 처리
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 댓글 좋아요 핸들러
   */
  const handleCommentLike = async (commentId: string) => {
    if (!onCommentLike) return;

    try {
      await onCommentLike(commentId);
      // 로컬 상태 업데이트
      setLocalComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: !comment.isLiked,
                likeCount: comment.isLiked
                  ? comment.likeCount - 1
                  : comment.likeCount + 1,
              }
            : comment
        )
      );
    } catch (error) {
      console.error("댓글 좋아요 실패:", error);
    }
  };

  /**
   * 댓글 수정 핸들러
   */
  const handleCommentEdit = async (commentId: string, newContent: string) => {
    if (!onCommentEdit) return;

    try {
      await onCommentEdit(commentId, newContent);
      // 로컬 상태 업데이트
      setLocalComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                content: newContent,
                updatedAt: new Date().toISOString(),
              }
            : comment
        )
      );
    } catch (error) {
      console.error("댓글 수정 실패:", error);
    }
  };

  /**
   * 댓글 삭제 핸들러
   */
  const handleCommentDelete = async (commentId: string) => {
    if (!onCommentDelete) return;

    try {
      await onCommentDelete(commentId);
      // 로컬 상태에서 제거
      setLocalComments(prev =>
        prev.filter(comment => comment.id !== commentId)
      );
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
    }
  };

  /**
   * 표시할 댓글 목록 계산
   */
  const visibleComments = isExpanded
    ? localComments
    : localComments.slice(0, maxVisibleComments);

  /**
   * 더 보기/접기 토글
   */
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 댓글 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            댓글 {localComments.length}개
          </span>
        </div>

        {localComments.length > maxVisibleComments && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                접기
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />더 보기 (
                {localComments.length - maxVisibleComments}개)
              </>
            )}
          </Button>
        )}
      </div>

      {/* 댓글 목록 */}
      {visibleComments.length > 0 && (
        <div className="space-y-3">
          {visibleComments.map(comment => (
            <AnswerCommentCard
              key={comment.id}
              comment={comment}
              onLike={handleCommentLike}
              onEdit={handleCommentEdit}
              onDelete={handleCommentDelete}
            />
          ))}
        </div>
      )}

      {/* 댓글 작성 폼 */}
      {showForm && (
        <AnswerCommentForm
          answerId={answerId}
          onSubmit={handleCommentSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {/* 댓글이 없는 경우 */}
      {localComments.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">아직 댓글이 없습니다</p>
          <p className="text-xs">첫 번째 댓글을 작성해보세요!</p>
        </div>
      )}
    </div>
  );
};
