"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Eye, 
  Heart, 
  Bookmark, 
  Share2, 
  CheckCircle,
  Clock,
  MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 질문 데이터 타입
 */
export interface QuestionData {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    profileImage?: string;
    isVerified?: boolean;
  };
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isAnswered: boolean;
  answerCount: number;
  isAuthor: boolean;
}

/**
 * QuestionCard 컴포넌트 Props
 */
export interface QuestionCardProps {
  question: QuestionData;
  variant?: "default" | "compact" | "detailed";
  showActions?: boolean;
  onLike?: (questionId: string) => void;
  onBookmark?: (questionId: string) => void;
  onShare?: (questionId: string) => void;
  onReport?: (questionId: string) => void;
  onEdit?: (questionId: string) => void;
  onDelete?: (questionId: string) => void;
  className?: string;
}

/**
 * QuestionCard 컴포넌트
 * 
 * @description
 * - 질문을 카드 형태로 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 다양한 variant 지원 (default, compact, detailed)
 * - 접근성 및 반응형 디자인 적용
 * 
 * @example
 * ```tsx
 * <QuestionCard 
 *   question={questionData} 
 *   variant="default"
 *   onLike={handleLike}
 * />
 * ```
 */
export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  variant = "default",
  showActions = true,
  onLike,
  onBookmark,
  onShare,
  onReport,
  onEdit,
  onDelete,
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
    onLike?.(question.id);
  };

  /**
   * 북마크 핸들러
   */
  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark?.(question.id);
  };

  /**
   * 공유 핸들러
   */
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(question.id);
  };

  /**
   * 신고 핸들러
   */
  const handleReport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onReport?.(question.id);
  };

  /**
   * 수정 핸들러
   */
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(question.id);
  };

  /**
   * 삭제 핸들러
   */
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(question.id);
  };

  // Compact variant 렌더링
  if (variant === "compact") {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <Link href={`/questions/${question.id}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground line-clamp-2 mb-2">
                  {question.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{question.author.name}</span>
                  <span>•</span>
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(question.createdAt)}</span>
                  <span>•</span>
                  <MessageCircle className="h-3 w-3" />
                  <span>{question.answerCount}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 ml-2">
                <Badge variant="secondary" className="text-xs">
                  {question.category}
                </Badge>
                {question.isAnswered && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  // Detailed variant 렌더링
  if (variant === "detailed") {
    return (
      <Card className={cn("hover:shadow-lg transition-all duration-200", className)}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-foreground mb-3 line-clamp-2">
                {question.title}
              </h2>
              
              {/* 작성자 정보 */}
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={question.author.profileImage} />
                  <AvatarFallback>
                    {question.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-foreground">
                    {question.author.name}
                  </span>
                  {question.author.isVerified && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {formatTimeAgo(question.createdAt)}
                  </span>
                </div>
              </div>

              {/* 카테고리 및 태그 */}
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="default">{question.category}</Badge>
                {question.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {question.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{question.tags.length - 3}개 더
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* 질문 내용 미리보기 */}
          <p className="text-muted-foreground line-clamp-3 mb-4">
            {question.content}
          </p>

          {/* 통계 및 액션 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{question.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{question.answerCount}</span>
              </div>
              {question.isAnswered && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>답변완료</span>
                </div>
              )}
            </div>

            {showActions && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={cn(
                    "h-8 px-2",
                    question.isLiked && "text-red-500 hover:text-red-600"
                  )}
                >
                  <Heart className={cn("h-4 w-4 mr-1", question.isLiked && "fill-current")} />
                  {question.likeCount}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={cn(
                    "h-8 px-2",
                    question.isBookmarked && "text-yellow-500 hover:text-yellow-600"
                  )}
                >
                  <Bookmark className={cn("h-4 w-4", question.isBookmarked && "fill-current")} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="h-8 px-2"
                >
                  <Share2 className="h-4 w-4" />
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
    <Card className={cn("hover:shadow-mobile transition-shadow", className)}>
      <Link href={`/questions/${question.id}`}>
        <CardContent className="p-mobile">
          <div className="space-mobile">
            {/* 헤더 */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-mobile-lg font-semibold text-foreground mb-2 line-clamp-2">
                  {question.title}
                </h3>
                
                {/* 작성자 정보 */}
                <div className="flex items-center space-x-2 mb-3">
                  <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                    <AvatarImage src={question.author.profileImage} />
                    <AvatarFallback className="text-xs">
                      {question.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">
                    {question.author.name}
                  </span>
                  {question.author.isVerified && (
                    <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(question.createdAt)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {question.category}
                </Badge>
                {question.isAnswered && (
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                )}
              </div>
            </div>

            {/* 질문 내용 미리보기 */}
            <p className="text-muted-foreground text-mobile line-clamp-2">
              {question.content}
            </p>

            {/* 태그 */}
            {question.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {question.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {question.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{question.tags.length - 3}개 더
                  </span>
                )}
              </div>
            )}

            {/* 통계 및 액션 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{question.viewCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{question.answerCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>{question.likeCount}</span>
                </div>
              </div>

              {showActions && (
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={cn(
                      "h-8 px-2 text-xs touch-target",
                      question.isLiked && "text-red-500 hover:text-red-600"
                    )}
                  >
                    <Heart className={cn("h-3 w-3 mr-1", question.isLiked && "fill-current")} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBookmark}
                    className={cn(
                      "h-8 px-2 text-xs touch-target",
                      question.isBookmarked && "text-yellow-500 hover:text-yellow-600"
                    )}
                  >
                    <Bookmark className={cn("h-3 w-3", question.isBookmarked && "fill-current")} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="h-8 px-2 text-xs touch-target"
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
