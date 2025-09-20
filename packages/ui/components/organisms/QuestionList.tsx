/**
 * QuestionList 컴포넌트
 * 
 * @description
 * - 질문 목록을 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <QuestionList
 *   questions={[
 *     {
 *       id: '1',
 *       title: '제주도 여행 추천',
 *       content: '제주도 여행을 계획하고 있습니다...',
 *       author: { id: '1', name: '김철수', avatar: '/avatar.jpg' },
 *       tags: ['제주도', '여행', '추천'],
 *       likes: 12,
 *       answers: 5,
 *       views: 234,
 *       createdAt: '2024-01-01T00:00:00Z'
 *     }
 *   ]}
 *   onQuestionClick={handleQuestionClick}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Text, Button } from '../atoms';
import { UserProfile, HashtagList, TimestampDisplay, Pagination } from '../molecules';

/**
 * 질문 목록 컴포넌트 스타일 variants 정의
 */
const questionListVariants = cva(
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
  answers?: {
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
 * QuestionList 컴포넌트 Props 타입 정의
 */
export interface QuestionListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questionListVariants> {
  /**
   * 질문 데이터 배열
   */
  questions: QuestionData[];
  
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
   * 질문 목록 전체 너비 사용 여부
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * 질문 목록 제목
   * @default '질문 목록'
   */
  title?: string;
  
  /**
   * 질문 목록 설명
   */
  description?: string;
  
  /**
   * 질문 목록 빈 상태 메시지
   * @default '질문이 없습니다.'
   */
  emptyMessage?: string;
  
  /**
   * 질문 목록 로딩 상태
   * @default false
   */
  isLoading?: boolean;
  
  /**
   * 질문 목록 에러 상태
   * @default false
   */
  hasError?: boolean;
  
  /**
   * 질문 목록 에러 메시지
   * @default '질문 목록을 불러오는 중 오류가 발생했습니다.'
   */
  errorMessage?: string;
  
  /**
   * 질문 목록 페이지네이션 여부
   * @default false
   */
  showPagination?: boolean;
  
  /**
   * 질문 목록 현재 페이지
   * @default 1
   */
  currentPage?: number;
  
  /**
   * 질문 목록 총 페이지 수
   * @default 1
   */
  totalPages?: number;
  
  /**
   * 질문 목록 페이지 변경 핸들러
   */
  onPageChange?: (page: number) => void;
  
  /**
   * 질문 목록 페이지 크기
   * @default 10
   */
  pageSize?: number;
  
  /**
   * 질문 목록 페이지 크기 변경 핸들러
   */
  onPageSizeChange?: (size: number) => void;
  
  /**
   * 질문 목록 페이지 크기 옵션들
   * @default [10, 20, 50, 100]
   */
  pageSizeOptions?: number[];
  
  /**
   * 질문 목록 정렬 옵션들
   */
  sortOptions?: {
    value: string;
    label: string;
  }[];
  
  /**
   * 질문 목록 현재 정렬
   */
  currentSort?: string;
  
  /**
   * 질문 목록 정렬 변경 핸들러
   */
  onSortChange?: (sort: string) => void;
  
  /**
   * 질문 목록 필터 옵션들
   */
  filterOptions?: {
    value: string;
    label: string;
  }[];
  
  /**
   * 질문 목록 현재 필터
   */
  currentFilter?: string;
  
  /**
   * 질문 목록 필터 변경 핸들러
   */
  onFilterChange?: (filter: string) => void;
  
  /**
   * 질문 목록 검색어
   */
  searchQuery?: string;
  
  /**
   * 질문 목록 검색 변경 핸들러
   */
  onSearchChange?: (query: string) => void;
  
  /**
   * 질문 목록 검색 플레이스홀더
   * @default '질문 검색...'
   */
  searchPlaceholder?: string;
  
  /**
   * 질문 목록 검색 표시 여부
   * @default true
   */
  showSearch?: boolean;
  
  /**
   * 질문 목록 정렬 표시 여부
   * @default true
   */
  showSort?: boolean;
  
  /**
   * 질문 목록 필터 표시 여부
   * @default true
   */
  showFilter?: boolean;
  
  /**
   * 질문 목록 페이지네이션 표시 여부
   * @default true
   */
  showPaginationControls?: boolean;
  
  /**
   * 질문 목록 페이지 크기 선택 표시 여부
   * @default true
   */
  showPageSizeSelect?: boolean;
  
  /**
   * 질문 목록 페이지 정보 표시 여부
   * @default true
   */
  showPageInfo?: boolean;
  
  /**
   * 질문 목록 질문당 표시할 정보
   * @default 'all'
   */
  questionDisplayMode?: 'compact' | 'detailed' | 'all';
  
  /**
   * 질문 목록 질문당 표시할 액션 버튼들
   * @default ['like', 'bookmark', 'follow']
   */
  questionActions?: ('like' | 'bookmark' | 'follow')[];
  
  /**
   * 질문 목록 질문당 표시할 통계
   * @default ['likes', 'answers', 'views']
   */
  questionStats?: ('likes' | 'answers' | 'views')[];
  
  /**
   * 질문 목록 질문당 표시할 태그
   * @default true
   */
  showTags?: boolean;
  
  /**
   * 질문 목록 질문당 표시할 작성자
   * @default true
   */
  showAuthor?: boolean;
  
  /**
   * 질문 목록 질문당 표시할 시간
   * @default true
   */
  showTimestamp?: boolean;
}

/**
 * QuestionList 컴포넌트
 * 
 * @param props - QuestionList 컴포넌트 props
 * @returns JSX.Element
 */
const QuestionList = React.forwardRef<HTMLDivElement, QuestionListProps>(
  (
    {
      className,
      questions,
      onQuestionClick,
      onAuthorClick,
      onTagClick,
      onLike,
      onBookmark,
      onFollow,
      fullWidth = false,
      title = '질문 목록',
      description,
      emptyMessage = '질문이 없습니다.',
      isLoading = false,
      hasError = false,
      errorMessage = '질문 목록을 불러오는 중 오류가 발생했습니다.',
      showPagination = false,
      currentPage = 1,
      totalPages = 1,
      onPageChange,
      pageSize = 10,
      onPageSizeChange,
      pageSizeOptions = [10, 20, 50, 100],
      sortOptions = [
        { value: 'title', label: '제목' },
        { value: 'createdAt', label: '생성일' },
        { value: 'updatedAt', label: '수정일' },
        { value: 'likes', label: '좋아요 수' },
        { value: 'answers', label: '답변 수' },
        { value: 'views', label: '조회 수' },
        { value: 'priority', label: '우선순위' },
        { value: 'status', label: '상태' },
      ],
      currentSort = 'createdAt',
      onSortChange,
      filterOptions = [
        { value: 'all', label: '전체' },
        { value: 'open', label: '열림' },
        { value: 'closed', label: '닫힘' },
        { value: 'resolved', label: '해결됨' },
        { value: 'duplicate', label: '중복' },
        { value: 'urgent', label: '긴급' },
        { value: 'high', label: '높음' },
        { value: 'normal', label: '보통' },
        { value: 'low', label: '낮음' },
      ],
      currentFilter = 'all',
      onFilterChange,
      searchQuery = '',
      onSearchChange,
      searchPlaceholder = '질문 검색...',
      showSearch = true,
      showSort = true,
      showFilter = true,
      showPaginationControls = true,
      showPageSizeSelect = true,
      showPageInfo = true,
      questionDisplayMode = 'all',
      questionActions = ['like', 'bookmark', 'follow'],
      questionStats = ['likes', 'answers', 'views'],
      showTags = true,
      showAuthor = true,
      showTimestamp = true,
      size,
      variant,
      ...props
    },
    ref
  ) => {
    // 질문 클릭 핸들러
    const handleQuestionClick = (questionId: string) => {
      onQuestionClick?.(questionId);
    };
    
    // 작성자 클릭 핸들러
    const handleAuthorClick = (authorId: string) => {
      onAuthorClick?.(authorId);
    };
    
    // 태그 클릭 핸들러
    const handleTagClick = (tag: string) => {
      onTagClick?.(tag);
    };
    
    // 좋아요 핸들러
    const handleLike = (questionId: string, liked: boolean) => {
      onLike?.(questionId, liked);
    };
    
    // 북마크 핸들러
    const handleBookmark = (questionId: string, bookmarked: boolean) => {
      onBookmark?.(questionId, bookmarked);
    };
    
    // 팔로우 핸들러
    const handleFollow = (questionId: string, followed: boolean) => {
      onFollow?.(questionId, followed);
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
            questionListVariants({
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
              질문 목록을 불러오는 중...
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
            questionListVariants({
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
    if (questions.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            questionListVariants({
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
          questionListVariants({
            size,
            variant,
            className,
          }),
          fullWidth && 'w-full'
        )}
        {...props}
      >
        {/* 질문 목록 헤더 */}
        <div className="mb-6">
          <Text as="h2" size="lg" weight="semibold" className="mb-2">
            {title}
          </Text>
          {description && (
            <Text as="p" size="sm" className="text-muted-foreground">
              {description}
            </Text>
          )}
        </div>
        
        {/* 질문 목록 컨트롤 */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          {/* 검색 */}
          {showSearch && (
            <div className="flex-1 min-w-64">
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full"
              />
            </div>
          )}
          
          {/* 정렬 */}
          {showSort && (
            <div className="min-w-32">
              <Select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          )}
          
          {/* 필터 */}
          {showFilter && (
            <div className="min-w-32">
              <Select
                value={currentFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="w-full"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>
        
        {/* 질문 목록 */}
        <div className="space-y-4">
          {questions.map((question) => (
            <div
              key={question.id}
              className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* 질문 정보 */}
              <div className="flex-1">
                {/* 질문 제목 */}
                <Text
                  as="h3"
                  size="lg"
                  weight="semibold"
                  className="mb-2 line-clamp-2 cursor-pointer hover:text-primary-600"
                  onClick={() => handleQuestionClick(question.id)}
                >
                  {question.title}
                </Text>
                
                {/* 질문 내용 */}
                {questionDisplayMode !== 'compact' && (
                  <Text
                    as="p"
                    size="sm"
                    className="mb-2 text-muted-foreground line-clamp-2"
                  >
                    {question.content}
                  </Text>
                )}
                
                {/* 질문 태그 */}
                {showTags && question.tags && question.tags.length > 0 && (
                  <div className="mb-2">
                    <HashtagList
                      hashtags={question.tags.map(tag => ({ id: tag, name: tag }))}
                      onHashtagClick={({ name }) => handleTagClick(name)}
                      size="sm"
                      variant="outline"
                    />
                  </div>
                )}
                
                {/* 질문 작성자 */}
                {showAuthor && (
                  <div className="mb-2">
                    <UserProfile
                      name={question.author.name}
                      avatar={question.author.avatar}
                      level={question.author.level}
                      points={question.author.points}
                      size="sm"
                      orientation="horizontal"
                      clickable={!!onAuthorClick}
                      onClick={() => handleAuthorClick(question.author.id)}
                    />
                  </div>
                )}
                
                {/* 질문 통계 */}
                {questionDisplayMode !== 'compact' && (
                  <div className="mb-2 flex items-center gap-4 text-sm text-muted-foreground">
                    {questionStats.map((stat) => (
                      <span key={stat}>
                        {stat === 'likes' && `좋아요 ${question.likes}`}
                        {stat === 'answers' && `답변 ${question.answers}`}
                        {stat === 'views' && `조회 ${question.views}`}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* 질문 시간 */}
                {showTimestamp && (
                  <div className="mb-2">
                    <TimestampDisplay
                      datetime={question.createdAt}
                      formatType="relative"
                      size="xs"
                    />
                  </div>
                )}
              </div>
              
              {/* 질문 액션 버튼들 */}
              <div className="flex items-center gap-2">
                {questionActions.includes('like') && (
                  <Button
                    onClick={() => handleLike(question.id, !question.liked)}
                    variant={question.liked ? 'default' : 'outline'}
                    size="sm"
                  >
                    좋아요 {question.likes}
                  </Button>
                )}
                
                {questionActions.includes('bookmark') && (
                  <Button
                    onClick={() => handleBookmark(question.id, !question.bookmarked)}
                    variant={question.bookmarked ? 'default' : 'outline'}
                    size="sm"
                  >
                    북마크
                  </Button>
                )}
                
                {questionActions.includes('follow') && (
                  <Button
                    onClick={() => handleFollow(question.id, !question.followed)}
                    variant={question.followed ? 'default' : 'outline'}
                    size="sm"
                  >
                    팔로우
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* 질문 목록 페이지네이션 */}
        {showPagination && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showControls={showPaginationControls}
              showPageSizeSelect={showPageSizeSelect}
              showPageInfo={showPageInfo}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={pageSizeOptions}
            />
          </div>
        )}
      </div>
    );
  }
);

QuestionList.displayName = 'QuestionList';

export { QuestionList, questionListVariants };
