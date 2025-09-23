"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Heart, 
  Bookmark, 
  Share2, 
  CheckCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Edit,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 답변 데이터 타입
 */
export interface AnswerData {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    profileImage?: string;
    isVerified?: boolean;
    isExpert?: boolean;
  };
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  dislikeCount: number;
  isLiked: boolean;
  isDisliked: boolean;
  isBookmarked: boolean;
  isAccepted: boolean;
  isAuthor: boolean;
  helpfulCount: number;
  isHelpful: boolean;
}

/**
 * AnswerCard 컴포넌트 Props
 */
export interface AnswerCardProps {
  answer: AnswerData;
  variant?: "default" | "compact" | "detailed";
  showActions?: boolean;
  onLike?: (answerId: string) => void;
  onDislike?: (answerId: string) => void;
  onBookmark?: (answerId: string) => void;
  onShare?: (answerId: string) => void;
  onReport?: (answerId: string) => void;
  onEdit?: (answerId: string) => void;
  onDelete?: (answerId: string) => void;
  onAccept?: (answerId: string) => void;
  onHelpful?: (answerId: string) => void;
  className?: string;
}

/**
 * AnswerCard 컴포넌트
 * 
 * @description
 * - 답변을 카드 형태로 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 다양한 variant 지원 (default, compact, detailed)
 * - 접근성 및 반응형 디자인 적용
 * 
 * @example
 * ```tsx
 * <AnswerCard 
 *   answer={answerData} 
 *   variant="default"
 *   onLike={handleLike}
 * />
 * ```
 */
export const AnswerCard: React.FC<AnswerCardProps> = ({
  answer,
  variant = "default",
  showActions = true,
  onLike,
  onDislike,
  onBookmark,
  onShare,
  onReport,
  onEdit,
  onDelete,
  onAccept,
  onHelpful,
  className,
}) => {
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
   * 좋아요 핸들러
   */
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(answer.id);
  };

  /**
   * 싫어요 핸들러
   */
  const handleDislike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDislike?.(answer.id);
  };

  /**
   * 북마크 핸들러
   */
  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark?.(answer.id);
  };

  /**
   * 공유 핸들러
   */
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(answer.id);
  };

  /**
   * 신고 핸들러
   */
  const handleReport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onReport?.(answer.id);
  };

  /**
   * 수정 핸들러
   */
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(answer.id);
  };

  /**
   * 삭제 핸들러
   */
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(answer.id);
  };

  /**
   * 채택 핸들러
   */
  const handleAccept = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAccept?.(answer.id);
  };

  /**
   * 도움됨 핸들러
   */
  const handleHelpful = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onHelpful?.(answer.id);
  };

  // Compact variant 렌더링
  if (variant === "compact") {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-foreground line-clamp-2 mb-2">
                {answer.content}
              </p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{answer.author.name}</span>
                <span>•</span>
                <Clock className="h-3 w-3" />
                <span>{formatTimeAgo(answer.createdAt)}</span>
                <span>•</span>
                <Heart className="h-3 w-3" />
                <span>{answer.likeCount}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 ml-2">
              {answer.isAccepted && (
                <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                  채택됨
                </Badge>
              )}
              {answer.author.isExpert && (
                <Badge variant="outline" className="text-xs">
                  전문가
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Detailed variant 렌더링
  if (variant === "detailed") {
    return (
      <Card className={cn(
        "hover:shadow-lg transition-all duration-200",
        answer.isAccepted && "ring-2 ring-green-200 bg-green-50/50",
        className
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* 작성자 정보 */}
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={answer.author.profileImage} />
                  <AvatarFallback>
                    {answer.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-foreground">
                    {answer.author.name}
                  </span>
                  {answer.author.isVerified && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                  {answer.author.isExpert && (
                    <Badge variant="outline" className="text-xs">
                      전문가
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {formatTimeAgo(answer.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {answer.isAccepted && (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  채택됨
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* 답변 내용 */}
          <div className="prose max-w-none mb-4">
            <p className="text-foreground leading-relaxed whitespace-pre-line">
              {answer.content}
            </p>
          </div>

          {/* 통계 및 액션 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <ThumbsUp className="h-4 w-4" />
                <span>{answer.likeCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ThumbsDown className="h-4 w-4" />
                <span>{answer.dislikeCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>도움됨 {answer.helpfulCount}</span>
              </div>
            </div>

            {showActions && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={cn(
                    "h-8 px-2",
                    answer.isLiked && "text-blue-500 hover:text-blue-600"
                  )}
                >
                  <ThumbsUp className={cn("h-4 w-4 mr-1", answer.isLiked && "fill-current")} />
                  {answer.likeCount}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDislike}
                  className={cn(
                    "h-8 px-2",
                    answer.isDisliked && "text-red-500 hover:text-red-600"
                  )}
                >
                  <ThumbsDown className={cn("h-4 w-4", answer.isDisliked && "fill-current")} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={cn(
                    "h-8 px-2",
                    answer.isBookmarked && "text-yellow-500 hover:text-yellow-600"
                  )}
                >
                  <Bookmark className={cn("h-4 w-4", answer.isBookmarked && "fill-current")} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="h-8 px-2"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleHelpful}
                  className={cn(
                    "h-8 px-2",
                    answer.isHelpful && "text-green-500 hover:text-green-600"
                  )}
                >
                  <CheckCircle className={cn("h-4 w-4", answer.isHelpful && "fill-current")} />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant 렌더링
  return (
    <Card className={cn(
      "hover:shadow-md transition-shadow",
      answer.isAccepted && "ring-1 ring-green-200 bg-green-50/30",
      className
    )}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* 헤더 */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* 작성자 정보 */}
              <div className="flex items-center space-x-2 mb-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={answer.author.profileImage} />
                  <AvatarFallback className="text-xs">
                    {answer.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">
                  {answer.author.name}
                </span>
                {answer.author.isVerified && (
                  <CheckCircle className="h-3 w-3 text-primary" />
                )}
                {answer.author.isExpert && (
                  <Badge variant="outline" className="text-xs">
                    전문가
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(answer.createdAt)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {answer.isAccepted && (
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  채택됨
                </Badge>
              )}
            </div>
          </div>

          {/* 답변 내용 */}
          <p className="text-foreground text-sm line-clamp-3 leading-relaxed">
            {answer.content}
          </p>

          {/* 통계 및 액션 */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <ThumbsUp className="h-3 w-3" />
                <span>{answer.likeCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ThumbsDown className="h-3 w-3" />
                <span>{answer.dislikeCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>도움됨 {answer.helpfulCount}</span>
              </div>
            </div>

            {showActions && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={cn(
                    "h-6 px-2 text-xs",
                    answer.isLiked && "text-blue-500 hover:text-blue-600"
                  )}
                >
                  <ThumbsUp className={cn("h-3 w-3 mr-1", answer.isLiked && "fill-current")} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDislike}
                  className={cn(
                    "h-6 px-2 text-xs",
                    answer.isDisliked && "text-red-500 hover:text-red-600"
                  )}
                >
                  <ThumbsDown className={cn("h-3 w-3", answer.isDisliked && "fill-current")} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={cn(
                    "h-6 px-2 text-xs",
                    answer.isBookmarked && "text-yellow-500 hover:text-yellow-600"
                  )}
                >
                  <Bookmark className={cn("h-3 w-3", answer.isBookmarked && "fill-current")} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="h-6 px-2 text-xs"
                >
                  <Share2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleHelpful}
                  className={cn(
                    "h-6 px-2 text-xs",
                    answer.isHelpful && "text-green-500 hover:text-green-600"
                  )}
                >
                  <CheckCircle className={cn("h-3 w-3", answer.isHelpful && "fill-current")} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
