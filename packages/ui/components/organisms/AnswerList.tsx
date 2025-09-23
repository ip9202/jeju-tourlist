/**
 * AnswerList 컴포넌트
 * 
 * @description
 * - 답변 목록을 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <AnswerList
 *   answers={[
 *     {
 *       id: '1',
 *       content: '제주도 여행 추천드립니다...',
 *       author: { id: '1', name: '김철수', avatar: '/avatar.jpg' },
 *       likes: 12,
 *       dislikes: 2,
 *       createdAt: '2024-01-01T00:00:00Z',
 *       isAccepted: false
 *     }
 *   ]}
 *   onAnswerClick={handleAnswerClick}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Text, Button } from '../atoms';
import { UserProfile, TimestampDisplay, Pagination } from '../molecules';

/**
 * 답변 목록 컴포넌트 스타일 variants 정의
 */
const answerListVariants = cva(
  // 기본 스타일
  'bg-card text-card-foreground border border-border rounded-lg shadow-sm',
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
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
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
 * AnswerList 컴포넌트 Props 타입 정의
 */
export interface AnswerListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof answerListVariants> {
  /**
   * 답변 데이터 배열
   */
  answers: AnswerData[];
  
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
   * 답변 목록 전체 너비 사용 여부
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * 답변 목록 제목
   * @default '답변 목록'
   */
  title?: string;
  
  /**
   * 답변 목록 설명
   */
  description?: string;
  
  /**
   * 답변 목록 빈 상태 메시지
   * @default '답변이 없습니다.'
   */
  emptyMessage?: string;
  
  /**
   * 답변 목록 로딩 상태
   * @default false
   */
  isLoading?: boolean;
  
  /**
   * 답변 목록 에러 상태
   * @default false
   */
  hasError?: boolean;
  
  /**
   * 답변 목록 에러 메시지
   * @default '답변 목록을 불러오는 중 오류가 발생했습니다.'
   */
  errorMessage?: string;
  
  /**
   * 답변 목록 페이지네이션 여부
   * @default false
   */
  showPagination?: boolean;
  
  /**
   * 답변 목록 현재 페이지
   * @default 1
   */
  currentPage?: number;
  
  /**
   * 답변 목록 총 페이지 수
   * @default 1
   */
  totalPages?: number;
  
  /**
   * 답변 목록 페이지 변경 핸들러
   */
  onPageChange?: (page: number) => void;
  
  /**
   * 답변 목록 페이지 크기
   * @default 10
   */
  pageSize?: number;
  
  /**
   * 답변 목록 페이지 크기 변경 핸들러
   */
  onPageSizeChange?: (size: number) => void;
  
  /**
   * 답변 목록 페이지 크기 옵션들
   * @default [10, 20, 50, 100]
   */
  pageSizeOptions?: number[];
  
  /**
   * 답변 목록 정렬 옵션들
   */
  sortOptions?: {
    value: string;
    label: string;
  }[];
  
  /**
   * 답변 목록 현재 정렬
   */
  currentSort?: string;
  
  /**
   * 답변 목록 정렬 변경 핸들러
   */
  onSortChange?: (sort: string) => void;
  
  /**
   * 답변 목록 필터 옵션들
   */
  filterOptions?: {
    value: string;
    label: string;
  }[];
  
  /**
   * 답변 목록 현재 필터
   */
  currentFilter?: string;
  
  /**
   * 답변 목록 필터 변경 핸들러
   */
  onFilterChange?: (filter: string) => void;
  
  /**
   * 답변 목록 검색어
   */
  searchQuery?: string;
  
  /**
   * 답변 목록 검색 변경 핸들러
   */
  onSearchChange?: (query: string) => void;
  
  /**
   * 답변 목록 검색 플레이스홀더
   * @default '답변 검색...'
   */
  searchPlaceholder?: string;
  
  /**
   * 답변 목록 검색 표시 여부
   * @default true
   */
  showSearch?: boolean;
  
  /**
   * 답변 목록 정렬 표시 여부
   * @default true
   */
  showSort?: boolean;
  
  /**
   * 답변 목록 필터 표시 여부
   * @default true
   */
  showFilter?: boolean;
  
  /**
   * 답변 목록 페이지네이션 표시 여부
   * @default true
   */
  showPaginationControls?: boolean;
  
  /**
   * 답변 목록 페이지 크기 선택 표시 여부
   * @default true
   */
  showPageSizeSelect?: boolean;
  
  /**
   * 답변 목록 페이지 정보 표시 여부
   * @default true
   */
  showPageInfo?: boolean;
  
  /**
   * 답변 목록 답변당 표시할 정보
   * @default 'all'
   */
  answerDisplayMode?: 'compact' | 'detailed' | 'all';
  
  /**
   * 답변 목록 답변당 표시할 액션 버튼들
   * @default ['like', 'dislike', 'bookmark', 'follow', 'accept']
   */
  answerActions?: ('like' | 'dislike' | 'bookmark' | 'follow' | 'accept')[];
  
  /**
   * 답변 목록 답변당 표시할 통계
   * @default ['likes', 'dislikes', 'comments']
   */
  answerStats?: ('likes' | 'dislikes' | 'comments')[];
  
  /**
   * 답변 목록 답변당 표시할 작성자
   * @default true
   */
  showAuthor?: boolean;
  
  /**
   * 답변 목록 답변당 표시할 시간
   * @default true
   */
  showTimestamp?: boolean;
  
  /**
   * 답변 목록 답변당 표시할 댓글
   * @default false
   */
  showComments?: boolean;
}

/**
 * AnswerList 컴포넌트
 * 
 * @param props - AnswerList 컴포넌트 props
 * @returns JSX.Element
 */
const AnswerList = React.forwardRef<HTMLDivElement, AnswerListProps>(
  (
    {
      className,
      answers,
      onAnswerClick,
      onAuthorClick,
      onLike,
      onDislike,
      onBookmark,
      onFollow,
      onAccept,
      fullWidth = false,
      title = '답변 목록',
      description,
      emptyMessage = '답변이 없습니다.',
      isLoading = false,
      hasError = false,
      errorMessage = '답변 목록을 불러오는 중 오류가 발생했습니다.',
      showPagination = false,
      currentPage = 1,
      totalPages = 1,
      onPageChange,
      pageSize = 10,
      onPageSizeChange,
      pageSizeOptions = [10, 20, 50, 100],
      sortOptions = [
        { value: 'createdAt', label: '생성일' },
        { value: 'updatedAt', label: '수정일' },
        { value: 'likes', label: '좋아요 수' },
        { value: 'dislikes', label: '싫어요 수' },
        { value: 'comments', label: '댓글 수' },
        { value: 'priority', label: '우선순위' },
        { value: 'status', label: '상태' },
      ],
      currentSort = 'createdAt',
      onSortChange,
      filterOptions = [
        { value: 'all', label: '전체' },
        { value: 'accepted', label: '채택됨' },
        { value: 'pending', label: '대기 중' },
        { value: 'urgent', label: '긴급' },
        { value: 'high', label: '높음' },
        { value: 'normal', label: '보통' },
        { value: 'low', label: '낮음' },
      ],
      currentFilter = 'all',
      onFilterChange,
      searchQuery = '',
      onSearchChange,
      searchPlaceholder = '답변 검색...',
      showSearch = true,
      showSort = true,
      showFilter = true,
      showPaginationControls = true,
      showPageSizeSelect = true,
      showPageInfo = true,
      answerDisplayMode = 'all',
      answerActions = ['like', 'dislike', 'bookmark', 'follow', 'accept'],
      answerStats = ['likes', 'dislikes', 'comments'],
      showAuthor = true,
      showTimestamp = true,
      showComments = false,
      size,
      variant,
      ...props
    },
    ref
  ) => {
    // 답변 클릭 핸들러
    const handleAnswerClick = (answerId: string) => {
      onAnswerClick?.(answerId);
    };
    
    // 작성자 클릭 핸들러
    const handleAuthorClick = (authorId: string) => {
      onAuthorClick?.(authorId);
    };
    
    // 좋아요 핸들러
    const handleLike = (answerId: string, liked: boolean) => {
      onLike?.(answerId, liked);
    };
    
    // 싫어요 핸들러
    const handleDislike = (answerId: string, disliked: boolean) => {
      onDislike?.(answerId, disliked);
    };
    
    // 북마크 핸들러
    const handleBookmark = (answerId: string, bookmarked: boolean) => {
      onBookmark?.(answerId, bookmarked);
    };
    
    // 팔로우 핸들러
    const handleFollow = (answerId: string, followed: boolean) => {
      onFollow?.(answerId, followed);
    };
    
    // 채택 핸들러
    const handleAccept = (answerId: string, accepted: boolean) => {
      onAccept?.(answerId, accepted);
    };
    
    // 페이지 변경 핸들러
    const handlePageChange = (page: number) => {
      onPageChange?.(page);
    };
    
    // 페이지 크기 변경 핸들러
    const handlePageSizeChange = (size: number) => {
      onPageSizeChange?.(size);
    };
    
    // 정렬 변경 핸들러
    const handleSortChange = (sort: string) => {
      onSortChange?.(sort);
    };
    
    // 필터 변경 핸들러
    const handleFilterChange = (filter: string) => {
      onFilterChange?.(filter);
    };
    
    // 검색 변경 핸들러
    const handleSearchChange = (query: string) => {
      onSearchChange?.(query);
    };
    
    // 로딩 상태
    if (isLoading) {
      return (
        <div
          ref={ref}
          className={cn(
            answerListVariants({
              size,
              variant,
              className,
            }),
            fullWidth && 'w-full'
          )}
          {...props}
        >
          <div className="flex items-center justify-center p-8">
            <Text as="p" size="sm" className="text-muted-foreground">
              답변 목록을 불러오는 중...
            </Text>
          </div>
        </div>
      );
    }
    
    // 에러 상태
    if (hasError) {
      return (
        <div
          ref={ref}
          className={cn(
            answerListVariants({
              size,
              variant,
              className,
            }),
            fullWidth && 'w-full'
          )}
          {...props}
        >
          <div className="flex items-center justify-center p-8">
            <Text as="p" size="sm" className="text-error-500">
              {errorMessage}
            </Text>
          </div>
        </div>
      );
    }
    
    // 빈 상태
    if (answers.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            answerListVariants({
              size,
              variant,
              className,
            }),
            fullWidth && 'w-full'
          )}
          {...props}
        >
          <div className="flex items-center justify-center p-8">
            <Text as="p" size="sm" className="text-muted-foreground">
              {emptyMessage}
            </Text>
          </div>
        </div>
      );
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          answerListVariants({
            size,
            variant,
            className,
          }),
          fullWidth && 'w-full'
        )}
        {...props}
      >
        {/* 답변 목록 헤더 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
        
        {/* 답변 목록 컨트롤 */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          {/* 검색 */}
          {showSearch && (
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {/* 정렬 */}
          {showSort && (
            <div className="min-w-32">
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* 필터 */}
          {showFilter && (
            <div className="min-w-32">
              <select
                value={currentFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {/* 답변 목록 */}
        <div className="space-y-4">
          {answers.map((answer) => (
            <div
              key={answer.id}
              className={cn(
                "flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors",
                answer.isAccepted && "bg-success-50 border-success-200"
              )}
            >
              {/* 답변 정보 */}
              <div className="flex-1">
                {/* 답변 내용 */}
                <Text
                  as="p"
                  size="sm"
                  className="mb-2 line-clamp-4 cursor-pointer hover:text-primary-600"
                  onClick={() => handleAnswerClick(answer.id)}
                >
                  {answer.content}
                </Text>
                
                {/* 답변 작성자 */}
                {showAuthor && (
                  <div className="mb-2">
                    <UserProfile
                      name={answer.author.name}
                      avatar={answer.author.avatar}
                      level={answer.author.level}
                      points={answer.author.points}
                      size="sm"
                      orientation="horizontal"
                      clickable={!!onAuthorClick}
                      onClick={() => handleAuthorClick(answer.author.id)}
                    />
                  </div>
                )}
                
                {/* 답변 통계 */}
                {answerDisplayMode !== 'compact' && (
                  <div className="mb-2 flex items-center gap-4 text-sm text-muted-foreground">
                    {answerStats.map((stat) => (
                      <span key={stat}>
                        {stat === 'likes' && `좋아요 ${answer.likes}`}
                        {stat === 'dislikes' && `싫어요 ${answer.dislikes}`}
                        {stat === 'comments' && `댓글 ${answer.comments?.length || 0}`}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* 답변 시간 */}
                {showTimestamp && (
                  <div className="mb-2">
                    <TimestampDisplay
                      timestamp={answer.createdAt}
                      format="relative"
                      size="xs"
                    />
                  </div>
                )}
                
                {/* 답변 댓글들 */}
                {showComments && answer.comments && answer.comments.length > 0 && (
                  <div className="mt-2 border-t pt-2">
                    <h4 className="text-xs font-semibold mb-1">
                      댓글 ({answer.comments.length})
                    </h4>
                    <div className="space-y-1">
                      {answer.comments.slice(0, 3).map((comment) => (
                        <div key={comment.id} className="flex items-start gap-1">
                          <UserProfile
                            name={comment.author.name}
                            avatar={comment.author.avatar}
                            size="sm"
                            orientation="horizontal"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">
                              {comment.content}
                            </p>
                    <TimestampDisplay
                      timestamp={comment.createdAt}
                      format="relative"
                      size="xs"
                    />
                          </div>
                        </div>
                      ))}
                      {answer.comments.length > 3 && (
                        <p className="text-xs text-gray-500">
                          댓글 {answer.comments.length - 3}개 더 보기
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* 답변 액션 버튼들 */}
              <div className="flex items-center gap-2">
                {answerActions.includes('like') && (
                  <Button
                    onClick={() => handleLike(answer.id, !answer.liked)}
                    variant={answer.liked ? 'default' : 'outline'}
                    size="sm"
                  >
                    좋아요 {answer.likes}
                  </Button>
                )}
                
                {answerActions.includes('dislike') && (
                  <Button
                    onClick={() => handleDislike(answer.id, !answer.disliked)}
                    variant={answer.disliked ? 'default' : 'outline'}
                    size="sm"
                  >
                    싫어요 {answer.dislikes}
                  </Button>
                )}
                
                {answerActions.includes('bookmark') && (
                  <Button
                    onClick={() => handleBookmark(answer.id, !answer.bookmarked)}
                    variant={answer.bookmarked ? 'default' : 'outline'}
                    size="sm"
                  >
                    북마크
                  </Button>
                )}
                
                {answerActions.includes('follow') && (
                  <Button
                    onClick={() => handleFollow(answer.id, !answer.followed)}
                    variant={answer.followed ? 'default' : 'outline'}
                    size="sm"
                  >
                    팔로우
                  </Button>
                )}
                
                {answerActions.includes('accept') && (
                  <Button
                    onClick={() => handleAccept(answer.id, !answer.isAccepted)}
                    variant={answer.isAccepted ? 'default' : 'outline'}
                    size="sm"
                    className={answer.isAccepted ? 'bg-success-500 text-white' : ''}
                  >
                    {answer.isAccepted ? '채택됨' : '채택하기'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* 답변 목록 페이지네이션 */}
        {showPagination && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    );
  }
);

AnswerList.displayName = 'AnswerList';

export { AnswerList, answerListVariants };
