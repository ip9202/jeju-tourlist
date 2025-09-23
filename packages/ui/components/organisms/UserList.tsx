/**
 * UserList 컴포넌트
 * 
 * @description
 * - 사용자 목록을 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <UserList
 *   users={[
 *     {
 *       id: '1',
 *       name: '김철수',
 *       avatar: '/avatar.jpg',
 *       level: 5,
 *       points: 1250,
 *       questions: 12,
 *       answers: 45,
 *       likes: 234
 *     }
 *   ]}
 *   onUserClick={handleUserClick}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Text, Button } from '../atoms';
import { UserProfile, Pagination } from '../molecules';

/**
 * 사용자 목록 컴포넌트 스타일 variants 정의
 */
const userListVariants = cva(
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
 * 사용자 데이터 타입 정의
 */
export interface UserData {
  /**
   * 사용자 ID
   */
  id: string;
  
  /**
   * 사용자 이름
   */
  name: string;
  
  /**
   * 사용자 아바타 URL
   */
  avatar?: string;
  
  /**
   * 사용자 이메일
   */
  email?: string;
  
  /**
   * 사용자 직책/역할
   */
  title?: string;
  
  /**
   * 사용자 레벨
   */
  level?: number;
  
  /**
   * 사용자 포인트
   */
  points?: number;
  
  /**
   * 사용자 배지
   */
  badge?: string;
  
  /**
   * 사용자 상태
   */
  status?: 'online' | 'offline' | 'away' | 'busy';
  
  /**
   * 사용자 소개
   */
  bio?: string;
  
  /**
   * 사용자 위치
   */
  location?: string;
  
  /**
   * 사용자 가입일
   */
  joinDate?: string | Date;
  
  /**
   * 사용자 마지막 활동
   */
  lastActive?: string | Date;
  
  /**
   * 사용자 통계
   */
  stats?: {
    questions: number;
    answers: number;
    likes: number;
    followers: number;
    following: number;
  };
  
  /**
   * 사용자 소셜 링크들
   */
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
  };
  
  /**
   * 사용자 팔로우 여부
   */
  followed?: boolean;
  
  /**
   * 사용자 차단 여부
   */
  blocked?: boolean;
}

/**
 * UserList 컴포넌트 Props 타입 정의
 */
export interface UserListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof userListVariants> {
  /**
   * 사용자 데이터 배열
   */
  users: UserData[];
  
  /**
   * 사용자 클릭 핸들러
   */
  onUserClick?: (userId: string) => void;
  
  /**
   * 팔로우 핸들러
   */
  onFollow?: (userId: string, followed: boolean) => void;
  
  /**
   * 차단 핸들러
   */
  onBlock?: (userId: string, blocked: boolean) => void;
  
  /**
   * 메시지 핸들러
   */
  onMessage?: (userId: string) => void;
  
  /**
   * 사용자 목록 전체 너비 사용 여부
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * 사용자 목록 제목
   * @default '사용자 목록'
   */
  title?: string;
  
  /**
   * 사용자 목록 설명
   */
  description?: string;
  
  /**
   * 사용자 목록 빈 상태 메시지
   * @default '사용자가 없습니다.'
   */
  emptyMessage?: string;
  
  /**
   * 사용자 목록 로딩 상태
   * @default false
   */
  isLoading?: boolean;
  
  /**
   * 사용자 목록 에러 상태
   * @default false
   */
  hasError?: boolean;
  
  /**
   * 사용자 목록 에러 메시지
   * @default '사용자 목록을 불러오는 중 오류가 발생했습니다.'
   */
  errorMessage?: string;
  
  /**
   * 사용자 목록 페이지네이션 여부
   * @default false
   */
  showPagination?: boolean;
  
  /**
   * 사용자 목록 현재 페이지
   * @default 1
   */
  currentPage?: number;
  
  /**
   * 사용자 목록 총 페이지 수
   * @default 1
   */
  totalPages?: number;
  
  /**
   * 사용자 목록 페이지 변경 핸들러
   */
  onPageChange?: (page: number) => void;
  
  /**
   * 사용자 목록 페이지 크기
   * @default 10
   */
  pageSize?: number;
  
  /**
   * 사용자 목록 페이지 크기 변경 핸들러
   */
  onPageSizeChange?: (size: number) => void;
  
  /**
   * 사용자 목록 페이지 크기 옵션들
   * @default [10, 20, 50, 100]
   */
  pageSizeOptions?: number[];
  
  /**
   * 사용자 목록 정렬 옵션들
   */
  sortOptions?: {
    value: string;
    label: string;
  }[];
  
  /**
   * 사용자 목록 현재 정렬
   */
  currentSort?: string;
  
  /**
   * 사용자 목록 정렬 변경 핸들러
   */
  onSortChange?: (sort: string) => void;
  
  /**
   * 사용자 목록 필터 옵션들
   */
  filterOptions?: {
    value: string;
    label: string;
  }[];
  
  /**
   * 사용자 목록 현재 필터
   */
  currentFilter?: string;
  
  /**
   * 사용자 목록 필터 변경 핸들러
   */
  onFilterChange?: (filter: string) => void;
  
  /**
   * 사용자 목록 검색어
   */
  searchQuery?: string;
  
  /**
   * 사용자 목록 검색 변경 핸들러
   */
  onSearchChange?: (query: string) => void;
  
  /**
   * 사용자 목록 검색 플레이스홀더
   * @default '사용자 검색...'
   */
  searchPlaceholder?: string;
  
  /**
   * 사용자 목록 검색 표시 여부
   * @default true
   */
  showSearch?: boolean;
  
  /**
   * 사용자 목록 정렬 표시 여부
   * @default true
   */
  showSort?: boolean;
  
  /**
   * 사용자 목록 필터 표시 여부
   * @default true
   */
  showFilter?: boolean;
  
  /**
   * 사용자 목록 페이지네이션 표시 여부
   * @default true
   */
  showPaginationControls?: boolean;
  
  /**
   * 사용자 목록 페이지 크기 선택 표시 여부
   * @default true
   */
  showPageSizeSelect?: boolean;
  
  /**
   * 사용자 목록 페이지 정보 표시 여부
   * @default true
   */
  showPageInfo?: boolean;
  
  /**
   * 사용자 목록 사용자당 표시할 정보
   * @default 'all'
   */
  userDisplayMode?: 'compact' | 'detailed' | 'all';
  
  /**
   * 사용자 목록 사용자당 표시할 액션 버튼들
   * @default ['follow', 'message', 'block']
   */
  userActions?: ('follow' | 'message' | 'block')[];
  
  /**
   * 사용자 목록 사용자당 표시할 통계
   * @default ['questions', 'answers', 'likes', 'followers']
   */
  userStats?: ('questions' | 'answers' | 'likes' | 'followers' | 'following')[];
  
  /**
   * 사용자 목록 사용자당 표시할 소셜 링크
   * @default ['twitter', 'github', 'linkedin', 'instagram']
   */
  userSocialLinks?: ('twitter' | 'github' | 'linkedin' | 'instagram')[];
}

/**
 * UserList 컴포넌트
 * 
 * @param props - UserList 컴포넌트 props
 * @returns JSX.Element
 */
const UserList = React.forwardRef<HTMLDivElement, UserListProps>(
  (
    {
      className,
      users,
      onUserClick,
      onFollow,
      onBlock,
      onMessage,
      fullWidth = false,
      title = '사용자 목록',
      description,
      emptyMessage = '사용자가 없습니다.',
      isLoading = false,
      hasError = false,
      errorMessage = '사용자 목록을 불러오는 중 오류가 발생했습니다.',
      showPagination = false,
      currentPage = 1,
      totalPages = 1,
      onPageChange,
      pageSize = 10,
      onPageSizeChange,
      pageSizeOptions = [10, 20, 50, 100],
      sortOptions = [
        { value: 'name', label: '이름' },
        { value: 'level', label: '레벨' },
        { value: 'points', label: '포인트' },
        { value: 'questions', label: '질문 수' },
        { value: 'answers', label: '답변 수' },
        { value: 'likes', label: '좋아요 수' },
        { value: 'followers', label: '팔로워 수' },
        { value: 'joinDate', label: '가입일' },
        { value: 'lastActive', label: '마지막 활동' },
      ],
      currentSort = 'name',
      onSortChange,
      filterOptions = [
        { value: 'all', label: '전체' },
        { value: 'online', label: '온라인' },
        { value: 'offline', label: '오프라인' },
        { value: 'verified', label: '인증됨' },
        { value: 'premium', label: '프리미엄' },
      ],
      currentFilter = 'all',
      onFilterChange,
      searchQuery = '',
      onSearchChange,
      searchPlaceholder = '사용자 검색...',
      showSearch = true,
      showSort = true,
      showFilter = true,
      showPaginationControls = true,
      showPageSizeSelect = true,
      showPageInfo = true,
      userDisplayMode = 'all',
      userActions = ['follow', 'message', 'block'],
      userStats = ['questions', 'answers', 'likes', 'followers'],
      userSocialLinks = ['twitter', 'github', 'linkedin', 'instagram'],
      size,
      variant,
      ...props
    },
    ref
  ) => {
    // 사용자 클릭 핸들러
    const handleUserClick = (userId: string) => {
      onUserClick?.(userId);
    };
    
    // 팔로우 핸들러
    const handleFollow = (userId: string, followed: boolean) => {
      onFollow?.(userId, followed);
    };
    
    // 차단 핸들러
    const handleBlock = (userId: string, blocked: boolean) => {
      onBlock?.(userId, blocked);
    };
    
    // 메시지 핸들러
    const handleMessage = (userId: string) => {
      onMessage?.(userId);
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
            userListVariants({
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
              사용자 목록을 불러오는 중...
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
            userListVariants({
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
    if (users.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            userListVariants({
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
          userListVariants({
            size,
            variant,
            className,
          }),
          fullWidth && 'w-full'
        )}
        {...props}
      >
        {/* 사용자 목록 헤더 */}
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
        
        {/* 사용자 목록 컨트롤 */}
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
        
        {/* 사용자 목록 */}
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* 사용자 정보 */}
              <div className="flex-1">
                <UserProfile
                  name={user.name}
                  avatar={user.avatar}
                  email={user.email}
                  title={user.title}
                  badge={user.badge}
                  status={user.status}
                  level={user.level}
                  points={user.points}
                  bio={user.bio}
                  location={user.location}
                  joinDate={user.joinDate instanceof Date ? user.joinDate.toISOString() : user.joinDate}
                  lastActive={user.lastActive instanceof Date ? user.lastActive.toISOString() : user.lastActive}
                  socialLinks={userSocialLinks.reduce((acc, link) => {
                    if (user.socialLinks?.[link]) {
                      acc[link] = user.socialLinks[link];
                    }
                    return acc;
                  }, {} as any)}
                  size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
                  orientation="horizontal"
                  clickable={!!onUserClick}
                  onClick={() => handleUserClick(user.id)}
                />
                
                {/* 사용자 통계 */}
                {userDisplayMode !== 'compact' && user.stats && (
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    {userStats.map((stat) => (
                      <span key={stat}>
                        {stat === 'questions' && `질문 ${user.stats?.questions || 0}`}
                        {stat === 'answers' && `답변 ${user.stats?.answers || 0}`}
                        {stat === 'likes' && `좋아요 ${user.stats?.likes || 0}`}
                        {stat === 'followers' && `팔로워 ${user.stats?.followers || 0}`}
                        {stat === 'following' && `팔로잉 ${user.stats?.following || 0}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 사용자 액션 버튼들 */}
              <div className="flex items-center gap-2">
                {userActions.includes('follow') && (
                  <Button
                    onClick={() => handleFollow(user.id, !user.followed)}
                    variant={user.followed ? 'default' : 'outline'}
                    size="sm"
                  >
                    {user.followed ? '팔로우 중' : '팔로우'}
                  </Button>
                )}
                
                {userActions.includes('message') && (
                  <Button
                    onClick={() => handleMessage(user.id)}
                    variant="outline"
                    size="sm"
                  >
                    메시지
                  </Button>
                )}
                
                {userActions.includes('block') && (
                  <Button
                    onClick={() => handleBlock(user.id, !user.blocked)}
                    variant="ghost"
                    size="sm"
                    className="text-error-500 hover:text-error-600"
                  >
                    {user.blocked ? '차단 해제' : '차단'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* 사용자 목록 페이지네이션 */}
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

UserList.displayName = 'UserList';

export { UserList, userListVariants };
