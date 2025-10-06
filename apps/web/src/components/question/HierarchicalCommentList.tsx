"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@jeju-tourlist/ui";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { HierarchicalCommentCard } from "./HierarchicalCommentCard";
import { AnswerCommentForm } from "./AnswerCommentForm";

/**
 * 계층구조 댓글 데이터 타입
 */
interface HierarchicalComment {
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
  parentId?: string;
  replies?: HierarchicalComment[];
  replyCount?: number;
  depth: number;
}

/**
 * HierarchicalCommentList 컴포넌트 Props
 */
interface HierarchicalCommentListProps {
  answerId: string;
  comments?: HierarchicalComment[];
  onCommentSubmit?: (content: string) => Promise<void>;
  onCommentLike?: (commentId: string) => Promise<void>;
  onCommentEdit?: (commentId: string, newContent: string) => Promise<void>;
  onCommentDelete?: (commentId: string) => Promise<void>;
  onReplySubmit?: (parentId: string, content: string) => Promise<void>;
  className?: string;
  showForm?: boolean;
  maxDepth?: number;
}

/**
 * HierarchicalCommentList 컴포넌트
 *
 * @description
 * - 계층구조 댓글 목록을 표시하는 컴포넌트
 * - SNS 스타일의 답글 달기 기능
 * - 댓글 펼치기/접기 기능
 * - 최상위 댓글과 답글을 구분하여 표시
 */
export const HierarchicalCommentList: React.FC<
  HierarchicalCommentListProps
> = ({
  answerId,
  comments = [],
  onCommentSubmit,
  onCommentLike,
  onCommentEdit,
  onCommentDelete,
  onReplySubmit,
  className = "",
  showForm = true,
  maxDepth = 3,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState<HierarchicalComment[]>([]);

  // 댓글 목록 업데이트
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  /**
   * 이미 계층구조로 변환된 댓글 목록 사용
   * (부모 컴포넌트에서 buildCommentTree로 변환 완료)
   */
  const hierarchicalComments = localComments;

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
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 답글 제출 핸들러
   */
  const handleReplySubmit = async (parentId: string, content: string) => {
    if (!onReplySubmit) return;

    try {
      await onReplySubmit(parentId, content);
      // 성공 시 로컬 상태 업데이트는 부모 컴포넌트에서 처리
    } catch (error) {
      console.error("답글 제출 실패:", error);
      throw error;
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
   * 더 보기/접기 토글
   */
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  /**
   * 표시할 댓글 수 계산
   */
  const maxVisibleComments = 3;
  const visibleComments = isExpanded
    ? hierarchicalComments
    : hierarchicalComments.slice(0, maxVisibleComments);

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

        {hierarchicalComments.length > maxVisibleComments && (
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
                {hierarchicalComments.length - maxVisibleComments}개)
              </>
            )}
          </Button>
        )}
      </div>

      {/* 댓글이 없는 경우 안내 메시지 */}
      {localComments.length === 0 && (
        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">아직 댓글이 없습니다</p>
          <p className="text-xs">첫 번째 댓글을 작성해보세요!</p>
        </div>
      )}

      {/* 댓글 목록 */}
      {visibleComments.length > 0 && (
        <div className="space-y-3">
          {visibleComments.map(comment => (
            <HierarchicalCommentCard
              key={comment.id}
              comment={comment}
              onLike={handleCommentLike}
              onEdit={handleCommentEdit}
              onDelete={handleCommentDelete}
              onReply={(parentId, content) =>
                handleReplySubmit(parentId, content)
              }
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}

      {/* 댓글 작성 폼 (항상 표시) */}
      {showForm && (
        <AnswerCommentForm
          answerId={answerId}
          onSubmit={handleCommentSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
