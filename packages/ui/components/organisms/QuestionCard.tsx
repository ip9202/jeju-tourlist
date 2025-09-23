"use client";

/**
 * QuestionCard 컴포넌트
 *
 * @description
 * - 질문을 표시하는 카드 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 *
 * @example
 * ```tsx
 * <QuestionCard
 *   question={{
 *     id: '1',
 *     title: '제주도 여행 추천',
 *     content: '제주도 여행을 계획하고 있습니다...',
 *     author: { id: '1', name: '김철수', avatar: '/avatar.jpg' },
 *     tags: ['제주도', '여행', '추천'],
 *     likes: 12,
 *     answers: 5,
 *     views: 234,
 *     createdAt: '2024-01-01T00:00:00Z',
 *     updatedAt: '2024-01-01T00:00:00Z'
 *   }}
 *   onQuestionClick={handleQuestionClick}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Text, Heading, Button } from '../atoms';
import { UserProfile, HashtagList, TimestampDisplay } from '../molecules';

/**
 * 질문 카드 컴포넌트 스타일 variants 정의
 */
const questionCardVariants = cva(
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
 * 질문 데이터 타입 정의
 */
export interface QuestionData {
  /**
   * 질문 ID
   */
  id: string;
  
  /**
   * 질문 제목
   */
  title: string;
  
  /**
   * 질문 내용
   */
  content: string;
  
  /**
   * 질문 작성자
   */
  author: {
    id: string;
    name: string;
    avatar?: string;
    level?: number;
    points?: number;
  };
  
  /**
   * 질문 태그들
   */
  tags?: string[];
  
  /**
   * 질문 좋아요 수
   */
  likes: number;
  
  /**
   * 질문 답변 수
   */
  answers: number;
  
  /**
   * 질문 조회 수
   */
  views: number;
  
  /**
   * 질문 생성일
   */
  createdAt: string | Date;
  
  /**
   * 질문 수정일
   */
  updatedAt: string | Date;
  
  /**
   * 질문 상태
   */
  status?: 'open' | 'closed' | 'resolved' | 'duplicate';
  
  /**
   * 질문 우선순위
   */
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  
  /**
   * 질문 카테고리
   */
  category?: string;
  
  /**
   * 질문 위치
   */
  location?: string;
  
  /**
   * 질문 이미지들
   */
  images?: string[];
  
  /**
   * 질문 첨부파일들
   */
  attachments?: {
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
  
  /**
   * 질문 수정 이력
   */
  editHistory?: {
    editedAt: string | Date;
    editedBy: string;
    reason?: string;
  }[];
  
  /**
   * 질문 답변들
   */
  answerList?: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
    likes: number;
    createdAt: string | Date;
    isAccepted?: boolean;
  }[];
  
  /**
   * 질문 팔로우 여부
   */
  followed?: boolean;
  
  /**
   * 질문 북마크 여부
   */
  bookmarked?: boolean;
  
  /**
   * 질문 좋아요 여부
   */
  liked?: boolean;
}

/**
 * QuestionCard 컴포넌트 Props 타입 정의
 */
export interface QuestionCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questionCardVariants> {
  /**
   * 질문 데이터
   */
  question: QuestionData;
  
  /**
   * 질문 클릭 핸들러
   */
  onQuestionClick?: (questionId: string) => void;
  
  /**
   * 작성자 클릭 핸들러
   */
  onAuthorClick?: (authorId: string) => void;
  
  /**
   * 태그 클릭 핸들러
   */
  onTagClick?: (tag: string) => void;
  
  /**
   * 좋아요 핸들러
   */
  onLike?: (questionId: string, liked: boolean) => void;
  
  /**
   * 북마크 핸들러
   */
  onBookmark?: (questionId: string, bookmarked: boolean) => void;
  
  /**
   * 팔로우 핸들러
   */
  onFollow?: (questionId: string, followed: boolean) => void;
  
  /**
   * 질문 전체 너비 사용 여부
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * 질문 내용 최대 길이
   * @default 200
   */
  maxContentLength?: number;
  
  /**
   * 태그 최대 표시 개수
   * @default 5
   */
  maxTags?: number;
  
  /**
   * 좋아요 버튼 표시 여부
   * @default true
   */
  showLikeButton?: boolean;
  
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
   * 태그 표시 여부
   * @default true
   */
  showTags?: boolean;
  
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
}

/**
 * QuestionCard 컴포넌트
 * 
 * @param props - QuestionCard 컴포넌트 props
 * @returns JSX.Element
 */
const QuestionCard = React.forwardRef<HTMLDivElement, QuestionCardProps>(
  (
    {
      className,
      question,
      onQuestionClick,
      onAuthorClick,
      onTagClick,
      onLike,
      onBookmark,
      onFollow,
      fullWidth = false,
      maxContentLength = 200,
      maxTags = 5,
      showLikeButton = true,
      showBookmarkButton = true,
      showFollowButton = true,
      showTags = true,
      showAuthor = true,
      showStats = true,
      showTimestamp = true,
      size,
      variant,
      clickable,
      ...props
    },
    ref
  ) => {
    // 질문 내용 요약
    const truncatedContent = React.useMemo(() => {
      if (question.content.length <= maxContentLength) {
        return question.content;
      }
      return question.content.substring(0, maxContentLength) + '...';
    }, [question.content, maxContentLength]);
    
    // 표시할 태그들
    const displayTags = React.useMemo(() => {
      if (!question.tags || question.tags.length === 0) return [];
      return question.tags.slice(0, maxTags);
    }, [question.tags, maxTags]);
    
    // 질문 클릭 핸들러
    const handleQuestionClick = () => {
      onQuestionClick?.(question.id);
    };
    
    // 작성자 클릭 핸들러
    const handleAuthorClick = () => {
      onAuthorClick?.(question.author.id);
    };
    
    // 태그 클릭 핸들러
    const handleTagClick = (tag: string) => {
      onTagClick?.(tag);
    };
    
    // 좋아요 핸들러
    const handleLike = () => {
      onLike?.(question.id, !question.liked);
    };
    
    // 북마크 핸들러
    const handleBookmark = () => {
      onBookmark?.(question.id, !question.bookmarked);
    };
    
    // 팔로우 핸들러
    const handleFollow = () => {
      onFollow?.(question.id, !question.followed);
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          questionCardVariants({
            size,
            variant,
            clickable: clickable || !!onQuestionClick,
            className,
          }),
          fullWidth && 'w-full'
        )}
        onClick={onQuestionClick ? handleQuestionClick : undefined}
        role={onQuestionClick ? 'button' : undefined}
        tabIndex={onQuestionClick ? 0 : undefined}
        {...props}
      >
        {/* 질문 제목 */}
        <Heading
          level={3}
          size={size === 'sm' ? 'md' : size === 'lg' ? 'xl' : 'lg'}
          className="mb-2 line-clamp-2"
        >
          {question.title}
        </Heading>
        
        {/* 질문 내용 */}
        <Text
          as="p"
          size="sm"
          className="mb-4 text-muted-foreground line-clamp-3"
        >
          {truncatedContent}
        </Text>
        
        {/* 질문 태그들 */}
        {showTags && displayTags.length > 0 && (
          <div className="mb-4">
            <HashtagList
              hashtags={displayTags.map(tag => ({ id: tag, name: tag, text: tag }))}
              onHashtagClick={({ text }) => handleTagClick(text)}
              size="sm"
            />
          </div>
        )}
        
        {/* 질문 작성자 */}
        {showAuthor && (
          <div className="mb-4">
            <UserProfile
              name={question.author.name}
              avatar={question.author.avatar}
              level={question.author.level}
              points={question.author.points}
              size={size === 'sm' ? 'sm' : 'md'}
              orientation="horizontal"
              clickable={!!onAuthorClick}
              onClick={onAuthorClick ? handleAuthorClick : undefined}
            />
          </div>
        )}
        
        {/* 질문 통계 */}
        {showStats && (
          <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>좋아요 {question.likes}</span>
            <span>답변 {question.answers}</span>
            <span>조회 {question.views}</span>
          </div>
        )}
        
        {/* 질문 시간 */}
        {showTimestamp && (
          <div className="mb-4">
            <TimestampDisplay
              timestamp={question.createdAt}
              format="relative"
              size="xs"
            />
          </div>
        )}
        
        {/* 액션 버튼들 */}
        <div className="flex items-center gap-2">
          {showLikeButton && (
            <Button
              onClick={handleLike}
              variant={question.liked ? 'default' : 'outline'}
              size="sm"
            >
              좋아요 {question.likes}
            </Button>
          )}
          
          {showBookmarkButton && (
            <Button
              onClick={handleBookmark}
              variant={question.bookmarked ? 'default' : 'outline'}
              size="sm"
            >
              북마크
            </Button>
          )}
          
          {showFollowButton && (
            <Button
              onClick={handleFollow}
              variant={question.followed ? 'default' : 'outline'}
              size="sm"
            >
              팔로우
            </Button>
          )}
        </div>
      </div>
    );
  }
);

QuestionCard.displayName = 'QuestionCard';

export { QuestionCard, questionCardVariants };