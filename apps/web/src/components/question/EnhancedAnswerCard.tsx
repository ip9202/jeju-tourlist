"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@jeju-tourlist/ui";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Edit,
  Trash2,
  Check,
} from "lucide-react";
import { HierarchicalCommentList } from "./HierarchicalCommentList";

/**
 * 답변 데이터 타입
 */
interface Answer {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  isAccepted?: boolean;
  isLiked?: boolean;
  isDisliked?: boolean;
  isAuthor?: boolean;
  isQuestionAuthor?: boolean;
}

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
 * EnhancedAnswerCard 컴포넌트 Props
 */
interface EnhancedAnswerCardProps {
  answer: Answer;
  onLike?: (answerId: string) => Promise<void>;
  onDislike?: (answerId: string) => Promise<void>;
  onAccept?: (answerId: string) => Promise<void>;
  onEdit?: (answerId: string) => void;
  onDelete?: (answerId: string) => Promise<void>;
  onBookmark?: (answerId: string) => Promise<void>;
  onShare?: (answerId: string) => void;
  onReport?: (answerId: string) => void;
  className?: string;
  showComments?: boolean;
  maxComments?: number;
}

/**
 * EnhancedAnswerCard 컴포넌트
 *
 * @description
 * - 답변을 표시하는 카드 컴포넌트
 * - 댓글 기능이 통합된 확장된 답변 카드
 * - 좋아요, 싫어요, 채택, 댓글 등 모든 상호작용 기능 포함
 */
export const EnhancedAnswerCard: React.FC<EnhancedAnswerCardProps> = ({
  answer,
  onLike,
  onDislike: _onDislike,
  onAccept,
  onEdit,
  onDelete,
  onBookmark,
  onShare,
  onReport: _onReport,
  className = "",
  showComments = true,
  maxComments = 5,
}) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState<HierarchicalComment[]>([]);
  const [showCommentForm, setShowCommentForm] = useState(false);
  // const [isLoadingComments, setIsLoadingComments] = useState(false);

  /**
   * Flat 댓글 배열을 계층구조로 변환
   */
  const buildCommentTree = (
    flatComments: Array<Record<string, unknown>>
  ): HierarchicalComment[] => {
    const commentMap = new Map<string, HierarchicalComment>();
    const rootComments: HierarchicalComment[] = [];

    // 1단계: 모든 댓글을 Map에 저장하고 replies 배열 초기화
    flatComments.forEach(comment => {
      commentMap.set(comment.id as string, {
        id: comment.id as string,
        content: comment.content as string,
        author: comment.author as { id: string; name: string; avatar?: string },
        likeCount: comment.likeCount as number,
        createdAt: comment.createdAt as string,
        updatedAt: comment.updatedAt as string,
        parentId: comment.parentId as string | undefined,
        depth: comment.depth as number,
        replies: [],
        replyCount: 0,
      });
    });

    // 2단계: 부모-자식 관계 설정
    flatComments.forEach(comment => {
      const commentNode = commentMap.get(comment.id as string);
      if (!commentNode) return;

      if (comment.parentId) {
        // 답글인 경우: 부모 댓글의 replies에 추가
        const parent = commentMap.get(comment.parentId as string);
        if (parent && parent.replies) {
          parent.replies.push(commentNode);
          parent.replyCount = (parent.replyCount || 0) + 1;
        }
      } else {
        // 최상위 댓글인 경우: root에 추가
        rootComments.push(commentNode);
      }
    });

    return rootComments;
  };

  /**
   * 댓글 불러오기
   */
  useEffect(() => {
    const fetchComments = async () => {
      if (!showComments) return;

      // setIsLoadingComments(true);
      try {
        const response = await fetch(
          `/api/answers/${answer.id}/comments?limit=50`
        );
        if (!response.ok) {
          throw new Error("댓글 로드 실패");
        }

        const result = await response.json();

        // Flat 배열을 계층구조로 변환
        const tree = buildCommentTree(result.data || []);
        setComments(tree);
      } catch (error) {
        console.error("댓글 로드 실패:", error);
      } finally {
        // setIsLoadingComments(false);
      }
    };

    fetchComments();
  }, [answer.id, showComments, maxComments]);

  /**
   * 시간 포맷팅 함수
   */
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "방금 전";
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}일 전`;
  };

  /**
   * 댓글 목록 로드
   */
  const loadComments = async () => {
    // setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/answers/${answer.id}/comments`);
      if (response.ok) {
        const result = await response.json();
        setComments(result.data || []);
      }
    } catch (error) {
      console.error("댓글 로드 실패:", error);
    } finally {
      // setIsLoadingComments(false);
    }
  };

  /**
   * 댓글 제출 핸들러
   */
  const handleCommentSubmit = async (content: string) => {
    // 로그인 체크
    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }

    try {
      const response = await fetch("/api/answer-comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          answerId: answer.id,
          authorId: session.user.id,
          parentId: null, // 최상위 댓글
          depth: 0,
        }),
      });

      if (!response.ok) {
        throw new Error("댓글 작성에 실패했습니다");
      }

      const result = await response.json();

      // 새 댓글을 목록에 추가
      if (result.data) {
        const newComment: HierarchicalComment = {
          ...result.data,
          depth: 0,
          replies: [],
          replyCount: 0,
        };
        setComments(prev => [newComment, ...prev]);
      }
    } catch (error) {
      console.error("댓글 제출 실패:", error);
      throw error;
    }
  };

  /**
   * 댓글 트리에서 특정 댓글 찾기 (재귀)
   */
  const findCommentById = (
    comments: HierarchicalComment[],
    targetId: string
  ): HierarchicalComment | null => {
    for (const comment of comments) {
      if (comment.id === targetId) {
        return comment;
      }
      if (comment.replies && comment.replies.length > 0) {
        const found = findCommentById(comment.replies, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  /**
   * 댓글 트리에 답글 추가 (재귀)
   */
  const addReplyToComment = (
    comments: HierarchicalComment[],
    parentId: string,
    newReply: HierarchicalComment
  ): HierarchicalComment[] => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
          replyCount: (comment.replyCount || 0) + 1,
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReplyToComment(comment.replies, parentId, newReply),
        };
      }
      return comment;
    });
  };

  /**
   * 답글 제출 핸들러
   */
  const handleReplySubmit = async (parentId: string, content: string) => {
    // 로그인 체크
    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }

    try {
      // 부모 댓글 찾기
      const parentComment = findCommentById(comments, parentId);
      const parentDepth = parentComment?.depth ?? 0;

      const response = await fetch("/api/answer-comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          answerId: answer.id,
          authorId: session.user.id,
          parentId: parentId,
          depth: parentDepth + 1, // 부모 depth + 1
        }),
      });

      if (!response.ok) {
        throw new Error("답글 작성에 실패했습니다");
      }

      const result = await response.json();

      // 답글을 부모 댓글에 추가
      if (result.data) {
        const newReply: HierarchicalComment = {
          ...result.data,
          depth: parentDepth + 1,
          replies: [],
          replyCount: 0,
        };

        setComments(prev => addReplyToComment(prev, parentId, newReply));
      }
    } catch (error) {
      console.error("답글 제출 실패:", error);
      throw error;
    }
  };

  /**
   * 댓글 좋아요 핸들러
   */
  const handleCommentLike = async (commentId: string) => {
    try {
      const response = await fetch(
        `/api/answer-comments/${commentId}/reaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isLike: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("댓글 좋아요에 실패했습니다");
      }

      // 로컬 상태 업데이트
      setComments(prev =>
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
    try {
      const response = await fetch(`/api/answer-comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newContent,
        }),
      });

      if (!response.ok) {
        throw new Error("댓글 수정에 실패했습니다");
      }

      // 로컬 상태 업데이트
      setComments(prev =>
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
    try {
      const response = await fetch(`/api/answer-comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("댓글 삭제에 실패했습니다");
      }

      // 로컬 상태에서 제거
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
    }
  };

  /**
   * 좋아요 핸들러
   */
  const handleLike = async () => {
    if (onLike) {
      await onLike(answer.id);
    }
  };

  /**
   * 싫어요 핸들러 (향후 구현 예정)
   */
  // const handleDislike = async () => {
  //   if (onDislike) {
  //     await onDislike(answer.id);
  //   }
  // };

  /**
   * 채택 핸들러
   */
  const handleAccept = async () => {
    if (onAccept) {
      await onAccept(answer.id);
    }
  };

  /**
   * 댓글 토글 핸들러
   */
  const toggleComments = () => {
    if (!showCommentForm && comments.length === 0) {
      loadComments();
    }
    setShowCommentForm(!showCommentForm);
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-visible ${className}`}
    >
      {/* 답변 헤더 */}
      <div className="p-4 border-b border-gray-100 overflow-visible">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              {answer.author.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{answer.author.name}</span>
                {answer.isAccepted && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    채택됨
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {formatTimeAgo(answer.createdAt)}
              </span>
            </div>
          </div>

          {/* 액션 버튼 (작���자만) */}
          {answer.isAuthor && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(answer.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(answer.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* 답변 내용 */}
        <div className="mb-4">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {answer.content}
          </p>
        </div>

        {/* 답변 액션 */}
        <div className="flex items-center justify-between overflow-visible">
          <div className="flex items-center gap-4 overflow-visible">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`${answer.isLiked ? "text-red-500" : "text-gray-500"}`}
            >
              <Heart
                className={`h-4 w-4 mr-1 ${answer.isLiked ? "fill-current" : ""}`}
              />
              {answer.likeCount > 0 && answer.likeCount}
            </Button>

            <div className="relative inline-block overflow-visible">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleComments}
                className={`${showCommentForm ? "text-blue-600" : "text-gray-500"} overflow-visible`}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              {comments.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center border-2 border-white shadow-sm z-50">
                  {comments.length}
                </span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBookmark?.(answer.id)}
              className="text-gray-500"
            >
              <Bookmark className="h-4 w-4 mr-1" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare?.(answer.id)}
              className="text-gray-500"
            >
              <Share2 className="h-4 w-4 mr-1" />
            </Button>
          </div>

          {/* 채택 버튼 (질문 작성자만) */}
          {answer.isQuestionAuthor && !answer.isAccepted && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAccept}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <Check className="h-4 w-4 mr-1" />
              채택
            </Button>
          )}
        </div>
      </div>

      {/* 댓글 섹션 */}
      {showCommentForm && (
        <div className="p-4">
          <HierarchicalCommentList
            answerId={answer.id}
            comments={comments}
            onCommentSubmit={handleCommentSubmit}
            onCommentLike={handleCommentLike}
            onCommentEdit={handleCommentEdit}
            onCommentDelete={handleCommentDelete}
            onReplySubmit={handleReplySubmit}
            maxDepth={3}
          />
        </div>
      )}
    </div>
  );
};
