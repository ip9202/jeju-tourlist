"use client";

import React, { useState } from "react";
import { Button } from "@jeju-tourlist/ui";
import { Heart, Reply, MoreHorizontal, Edit, Trash2 } from "lucide-react";

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
 * AnswerCommentCard 컴포넌트 Props
 */
interface AnswerCommentCardProps {
  comment: AnswerComment;
  onLike?: (commentId: string) => void;
  onEdit?: (commentId: string, newContent: string) => void;
  onDelete?: (commentId: string) => void;
  onReply?: (commentId: string) => void;
  className?: string;
}

/**
 * AnswerCommentCard 컴포넌트
 *
 * @description
 * - 답변에 대한 댓글을 표시하는 카드 컴포넌트
 * - 좋아요, 수정, 삭제, 답글 기능 포함
 * - 작성자 권한에 따른 액션 버튼 표시
 */
export const AnswerCommentCard: React.FC<AnswerCommentCardProps> = ({
  comment,
  onLike,
  onEdit,
  onDelete,
  onReply,
  className = "",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showActions, setShowActions] = useState(false);

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
   * 답글 핸들러
   */
  const handleReply = () => {
    onReply?.(comment.id);
  };

  /**
   * 수정 취소 핸들러
   */
  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
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
            className={`h-4 w-4 mr-1 ${comment.isLiked ? "fill-current" : ""}`}
          />
          {comment.likeCount > 0 && comment.likeCount}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleReply}
          className="h-8 px-2 text-gray-500"
        >
          <Reply className="h-4 w-4 mr-1" />
          답글
        </Button>
      </div>
    </div>
  );
};
