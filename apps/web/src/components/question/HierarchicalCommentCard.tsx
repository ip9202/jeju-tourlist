"use client";

import React, { useState } from "react";
import { Button } from "@jeju-tourlist/ui";
import {
  Heart,
  Reply,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

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
  parentId?: string; // 부모 댓글 ID (답글인 경우)
  replies?: HierarchicalComment[]; // 답글 목록
  replyCount?: number; // 답글 수
  depth: number; // 계층 깊이 (0: 최상위, 1: 답글, 2: 답글의 답글)
}

/**
 * HierarchicalCommentCard 컴포넌트 Props
 */
interface HierarchicalCommentCardProps {
  comment: HierarchicalComment;
  onLike?: (commentId: string) => void;
  onEdit?: (commentId: string, newContent: string) => void;
  onDelete?: (commentId: string) => void;
  onReply?: (commentId: string, content: string) => void;
  className?: string;
  maxDepth?: number; // 최대 계층 깊이
}

/**
 * HierarchicalCommentCard 컴포넌트
 *
 * @description
 * - 계층구조 댓글을 표시하는 카드 컴포넌트
 * - SNS 스타일의 답글 달기 기능
 * - 들여쓰기로 계층 구조 시각화
 * - 답글 펼치기/접기 기능
 */
export const HierarchicalCommentCard: React.FC<
  HierarchicalCommentCardProps
> = ({
  comment,
  onLike,
  onEdit,
  onDelete,
  onReply,
  className = "",
  maxDepth = 3,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showActions, setShowActions] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // 임시 사용자 정보 (실제로는 AuthContext에서 가져와야 함)
  const currentUser = {
    id: "current-user",
    name: "현재 사용자",
  };

  /**
   * 시간 포맷팅 함수
   */
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}일 전`;
  };

  /**
   * 좋아요 핸들러
   */
  const handleLike = () => {
    onLike?.(comment.id);
  };

  /**
   * 수정 핸들러
   */
  const handleEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit?.(comment.id, editContent.trim());
      setIsEditing(false);
    }
  };

  /**
   * 삭제 핸들러
   */
  const handleDelete = () => {
    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      onDelete?.(comment.id);
    }
  };

  /**
   * 답글 제출 핸들러
   */
  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;

    setIsSubmittingReply(true);
    try {
      await onReply?.(comment.id, replyContent.trim());
      setReplyContent("");
      setShowReplyForm(false);
    } catch (error) {
      console.error("답글 제출 실패:", error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  /**
   * 답글 취소 핸들러
   */
  const handleReplyCancel = () => {
    setReplyContent("");
    setShowReplyForm(false);
  };

  /**
   * 수정 취소 핸들러
   */
  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  /**
   * 답글 토글 핸들러
   */
  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  /**
   * 답글 폼 토글 핸들러
   */
  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
  };

  // 최대 깊이 초과 시 답글 작성 불가 (개발 중에는 항상 허용)
  const canReply =
    process.env.NODE_ENV === "development" ? true : comment.depth < maxDepth;

  return (
    <div className={`${className}`}>
      {/* 댓글 카드 */}
      <div
        className={`bg-gray-50 rounded-lg p-4 ${
          comment.depth > 0 ? "border-l-2 border-blue-200" : ""
        }`}
        style={{ marginLeft: `${comment.depth * 40}px` }}
      >
        {/* 댓글 헤더 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {comment.author.name.charAt(0)}
            </div>
            <div>
              <span className="font-medium text-sm">{comment.author.name}</span>
              <span className="text-xs text-gray-500 ml-2">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>
          </div>

          {/* 액션 버튼 */}
          {comment.isAuthor && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActions(!showActions)}
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>

              {showActions && (
                <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(true);
                      setShowActions(false);
                    }}
                    className="w-full justify-start"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    수정
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleDelete();
                      setShowActions(false);
                    }}
                    className="w-full justify-start text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 댓글 내용 */}
        {isEditing ? (
          <div className="mb-3">
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none"
              rows={3}
              placeholder="댓글을 수정하세요..."
            />
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={handleEdit}>
                저장
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                취소
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        )}

        {/* 댓글 액션 */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`h-8 px-2 ${
              comment.isLiked ? "text-red-500" : "text-gray-500"
            }`}
          >
            <Heart
              className={`h-4 w-4 mr-1 ${
                comment.isLiked ? "fill-current" : ""
              }`}
            />
            {comment.likeCount > 0 && comment.likeCount}
          </Button>

          {canReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleReplyForm}
              className="h-8 px-2 text-gray-500"
            >
              <Reply className="h-4 w-4 mr-1" />
              답글
            </Button>
          )}
        </div>

        {/* 답글 작성 폼 */}
        {showReplyForm && (
          <div className="mt-4 p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {currentUser.name.charAt(0)}
              </div>
              <span className="text-sm font-medium">{currentUser.name}</span>
            </div>

            <textarea
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              placeholder={`${comment.author.name}님에게 답글 달기...`}
              rows={2}
              className="w-full p-2 border rounded-lg resize-none text-sm"
              maxLength={1000}
            />

            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-gray-500">
                {replyContent.length}/1000자
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReplyCancel}
                  disabled={isSubmittingReply}
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={handleReplySubmit}
                  disabled={isSubmittingReply || !replyContent.trim()}
                >
                  {isSubmittingReply ? "등록 중..." : "답글 등록"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 답글 목록 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {/* 답글 펼치기/접기 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleReplies}
            className="text-gray-500 hover:text-gray-700"
            style={{ marginLeft: "16px" }}
          >
            {showReplies ? (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                답글 숨기기
              </>
            ) : (
              <>
                <ChevronRight className="h-4 w-4 mr-1" />
                답글 {comment.replyCount}개 보기
              </>
            )}
          </Button>

          {/* 답글들 */}
          {showReplies && (
            <div className="mt-2 space-y-2">
              {comment.replies.map(reply => (
                <HierarchicalCommentCard
                  key={reply.id}
                  comment={reply}
                  onLike={onLike}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReply={onReply}
                  maxDepth={maxDepth}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
