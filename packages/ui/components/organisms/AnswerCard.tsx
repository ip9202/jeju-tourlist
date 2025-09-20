/**
 * AnswerCard 컴포넌트
 * 
 * @description
 * - 답변을 표시하는 카드 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <AnswerCard
 *   answer={{
 *     id: '1',
 *     content: '제주도 여행 추천드립니다...',
 *     author: { id: '1', name: '김철수', avatar: '/avatar.jpg' },
 *     likes: 12,
 *     dislikes: 2,
 *     createdAt: '2024-01-01T00:00:00Z',
 *     isAccepted: false
 *   }}
 *   onAnswerClick={handleAnswerClick}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Text, Button } from '../atoms';
import { UserProfile, TimestampDisplay } from '../molecules';

/**
 * 답변 카드 컴포넌트 스타일 variants 정의
 */
const answerCardVariants = cva(
  // 기본 스타일
  'bg-card text-card-foreground border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow',
  {
    variants: {
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      variant: {
        default: 'bg-card',
        highlighted: 'bg-primary-50 border-primary-200',
        featured: 'bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-300',
        accepted: 'bg-success-50 border-success-200',
      },
      clickable: {
        true: 'cursor-pointer hover:border-primary-300',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
      clickable: false,
    },
  }
);

/**
 * 답변 데이터 타입 정의
 */
export interface AnswerData {
  /**
   * 답변 ID
   */
  id: string;
  
  /**
   * 답변 내용
   */
  content: string;
  
  /**
   * 답변 작성자
   */
  author: {
    id: string;
    name: string;
    avatar?: string;
    level?: number;
    points?: number;
  };
  
  /**
   * 답변 좋아요 수
   */
  likes: number;
  
  /**
   * 답변 싫어요 수
   */
  dislikes: number;
  
  /**
   * 답변 생성일
   */
  createdAt: string | Date;
  
  /**
   * 답변 수정일
   */
  updatedAt: string | Date;
  
  /**
   * 답변 채택 여부
   */
  isAccepted?: boolean;
  
  /**
   * 답변 상태
   */
  status?: 'draft' | 'published' | 'hidden' | 'deleted';
  
  /**
   * 답변 우선순위
   */
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  
  /**
   * 답변 카테고리
   */
  category?: string;
  
  /**
   * 답변 위치
   */
  location?: string;
  
  /**
   * 답변 이미지들
   */
  images?: string[];
  
  /**
   * 답변 첨부파일들
   */
  attachments?: {
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
  
  /**
   * 답변 수정 이력
   */
  editHistory?: {
    editedAt: string | Date;
    editedBy: string;
    reason?: string;
  }[];
  
  /**
   * 답변 댓글들
   */
  comments?: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
    likes: number;
    createdAt: string | Date;
  }[];
  
  /**
   * 답변 팔로우 여부
   */
  followed?: boolean;
  
  /**
   * 답변 북마크 여부
   */
  bookmarked?: boolean;
  
  /**
   * 답변 좋아요 여부
   */
  liked?: boolean;
  
  /**
   * 답변 싫어요 여부
   */
  disliked?: boolean;
}

/**
 * AnswerCard 컴포넌트 Props 타입 정의
 */
export interface AnswerCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof answerCardVariants> {
  /**
   * 답변 데이터
   */
  answer: AnswerData;
  
  /**
   * 답변 클릭 핸들러
   */
  onAnswerClick?: (answerId: string) => void;
  
  /**
   * 작성자 클릭 핸들러
   */
  onAuthorClick?: (authorId: string) => void;
  
  /**
   * 좋아요 핸들러
   */
  onLike?: (answerId: string, liked: boolean) => void;
  
  /**
   * 싫어요 핸들러
   */
  onDislike?: (answerId: string, disliked: boolean) => void;
  
  /**
   * 북마크 핸들러
   */
  onBookmark?: (answerId: string, bookmarked: boolean) => void;
  
  /**
   * 팔로우 핸들러
   */
  onFollow?: (answerId: string, followed: boolean) => void;
  
  /**
   * 채택 핸들러
   */
  onAccept?: (answerId: string, accepted: boolean) => void;
  
  /**
   * 답변 전체 너비 사용 여부
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * 답변 내용 최대 길이
   * @default 300
   */
  maxContentLength?: number;
  
  /**
   * 좋아요 버튼 표시 여부
   * @default true
   */
  showLikeButton?: boolean;
  
  /**
   * 싫어요 버튼 표시 여부
   * @default true
   */
  showDislikeButton?: boolean;
  
  /**
   * 북마크 버튼 표시 여부
   * @default true
   */
  showBookmarkButton?: boolean;
  
  /**
   * 팔로우 버튼 표시 여부
   * @default true
   */
  showFollowButton?: boolean;
  
  /**
   * 채택 버튼 표시 여부
   * @default true
   */
  showAcceptButton?: boolean;
  
  /**
   * 작성자 정보 표시 여부
   * @default true
   */
  showAuthor?: boolean;
  
  /**
   * 통계 표시 여부
   * @default true
   */
  showStats?: boolean;
  
  /**
   * 시간 표시 여부
   * @default true
   */
  showTimestamp?: boolean;
  
  /**
   * 댓글 표시 여부
   * @default false
   */
  showComments?: boolean;
}

/**
 * AnswerCard 컴포넌트
 * 
 * @param props - AnswerCard 컴포넌트 props
 * @returns JSX.Element
 */
const AnswerCard = React.forwardRef<HTMLDivElement, AnswerCardProps>(
  (
    {
      className,
      answer,
      onAnswerClick,
      onAuthorClick,
      onLike,
      onDislike,
      onBookmark,
      onFollow,
      onAccept,
      fullWidth = false,
      maxContentLength = 300,
      showLikeButton = true,
      showDislikeButton = true,
      showBookmarkButton = true,
      showFollowButton = true,
      showAcceptButton = true,
      showAuthor = true,
      showStats = true,
      showTimestamp = true,
      showComments = false,
      size,
      variant,
      clickable,
      ...props
    },
    ref
  ) => {
    // 답변 내용 요약
    const truncatedContent = React.useMemo(() => {
      if (answer.content.length <= maxContentLength) {
        return answer.content;
      }
      return answer.content.substring(0, maxContentLength) + '...';
    }, [answer.content, maxContentLength]);
    
    // 답변 클릭 핸들러
    const handleAnswerClick = () => {
      onAnswerClick?.(answer.id);
    };
    
    // 작성자 클릭 핸들러
    const handleAuthorClick = () => {
      onAuthorClick?.(answer.author.id);
    };
    
    // 좋아요 핸들러
    const handleLike = () => {
      onLike?.(answer.id, !answer.liked);
    };
    
    // 싫어요 핸들러
    const handleDislike = () => {
      onDislike?.(answer.id, !answer.disliked);
    };
    
    // 북마크 핸들러
    const handleBookmark = () => {
      onBookmark?.(answer.id, !answer.bookmarked);
    };
    
    // 팔로우 핸들러
    const handleFollow = () => {
      onFollow?.(answer.id, !answer.followed);
    };
    
    // 채택 핸들러
    const handleAccept = () => {
      onAccept?.(answer.id, !answer.isAccepted);
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          answerCardVariants({
            size,
            variant: answer.isAccepted ? 'accepted' : variant,
            clickable: clickable || !!onAnswerClick,
            className,
          }),
          fullWidth && 'w-full'
        )}
        onClick={onAnswerClick ? handleAnswerClick : undefined}
        role={onAnswerClick ? 'button' : undefined}
        tabIndex={onAnswerClick ? 0 : undefined}
        {...props}
      >
        {/* 답변 내용 */}
        <Text
          as="p"
          size="sm"
          className="mb-4 line-clamp-4"
        >
          {truncatedContent}
        </Text>
        
        {/* 답변 작성자 */}
        {showAuthor && (
          <div className="mb-4">
            <UserProfile
              name={answer.author.name}
              avatar={answer.author.avatar}
              level={answer.author.level}
              points={answer.author.points}
              size={size === 'sm' ? 'sm' : 'md'}
              orientation="horizontal"
              clickable={!!onAuthorClick}
              onClick={onAuthorClick ? handleAuthorClick : undefined}
            />
          </div>
        )}
        
        {/* 답변 통계 */}
        {showStats && (
          <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>좋아요 {answer.likes}</span>
            <span>싫어요 {answer.dislikes}</span>
            {answer.comments && answer.comments.length > 0 && (
              <span>댓글 {answer.comments.length}</span>
            )}
          </div>
        )}
        
        {/* 답변 시간 */}
        {showTimestamp && (
          <div className="mb-4">
            <TimestampDisplay
              datetime={answer.createdAt}
              formatType="relative"
              size="xs"
            />
          </div>
        )}
        
        {/* 액션 버튼들 */}
        <div className="flex items-center gap-2">
          {showLikeButton && (
            <Button
              onClick={handleLike}
              variant={answer.liked ? 'default' : 'outline'}
              size="sm"
            >
              좋아요 {answer.likes}
            </Button>
          )}
          
          {showDislikeButton && (
            <Button
              onClick={handleDislike}
              variant={answer.disliked ? 'default' : 'outline'}
              size="sm"
            >
              싫어요 {answer.dislikes}
            </Button>
          )}
          
          {showBookmarkButton && (
            <Button
              onClick={handleBookmark}
              variant={answer.bookmarked ? 'default' : 'outline'}
              size="sm"
            >
              북마크
            </Button>
          )}
          
          {showFollowButton && (
            <Button
              onClick={handleFollow}
              variant={answer.followed ? 'default' : 'outline'}
              size="sm"
            >
              팔로우
            </Button>
          )}
          
          {showAcceptButton && (
            <Button
              onClick={handleAccept}
              variant={answer.isAccepted ? 'default' : 'outline'}
              size="sm"
              className={answer.isAccepted ? 'bg-success-500 text-white' : ''}
            >
              {answer.isAccepted ? '채택됨' : '채택하기'}
            </Button>
          )}
        </div>
        
        {/* 답변 댓글들 */}
        {showComments && answer.comments && answer.comments.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <Text as="h4" size="sm" weight="semibold" className="mb-2">
              댓글 ({answer.comments.length})
            </Text>
            <div className="space-y-2">
              {answer.comments.slice(0, 3).map((comment) => (
                <div key={comment.id} className="flex items-start gap-2">
                  <UserProfile
                    name={comment.author.name}
                    avatar={comment.author.avatar}
                    size="sm"
                    orientation="horizontal"
                  />
                  <div className="flex-1">
                    <Text as="p" size="xs" className="text-muted-foreground">
                      {comment.content}
                    </Text>
                    <TimestampDisplay
                      datetime={comment.createdAt}
                      formatType="relative"
                      size="xs"
                    />
                  </div>
                </div>
              ))}
              {answer.comments.length > 3 && (
                <Text as="p" size="xs" className="text-muted-foreground">
                  댓글 {answer.comments.length - 3}개 더 보기
                </Text>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

AnswerCard.displayName = 'AnswerCard';

export { AnswerCard, answerCardVariants };