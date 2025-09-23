/**
 * UserCard 컴포넌트
 * 
 * @description
 * - 사용자 프로필을 표시하는 카드 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <UserCard
 *   user={{
 *     id: '1',
 *     name: '김철수',
 *     avatar: '/avatar.jpg',
 *     level: 5,
 *     points: 1250,
 *     questions: 12,
 *     answers: 45,
 *     likes: 234
 *   }}
 *   onUserClick={handleUserClick}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Avatar, Text, Heading, Button } from '../atoms';
import { UserProfile } from '../molecules';

/**
 * 사용자 카드 컴포넌트 스타일 variants 정의
 */
const userCardVariants = cva(
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
 * UserCard 컴포넌트 Props 타입 정의
 */
export interface UserCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof userCardVariants> {
  /**
   * 사용자 데이터
   */
  user: UserData;
  
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
   * 사용자 전체 너비 사용 여부
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * 사용자 소개 최대 길이
   * @default 100
   */
  maxBioLength?: number;
  
  /**
   * 팔로우 버튼 표시 여부
   * @default true
   */
  showFollowButton?: boolean;
  
  /**
   * 메시지 버튼 표시 여부
   * @default false
   */
  showMessageButton?: boolean;
  
  /**
   * 차단 버튼 표시 여부
   * @default false
   */
  showBlockButton?: boolean;
  
  /**
   * 통계 표시 여부
   * @default true
   */
  showStats?: boolean;
  
  /**
   * 소셜 링크 표시 여부
   * @default true
   */
  showSocialLinks?: boolean;
}

/**
 * UserCard 컴포넌트
 * 
 * @param props - UserCard 컴포넌트 props
 * @returns JSX.Element
 */
const UserCard = React.forwardRef<HTMLDivElement, UserCardProps>(
  (
    {
      className,
      user,
      onUserClick,
      onFollow,
      onBlock,
      onMessage,
      fullWidth = false,
      maxBioLength = 100,
      showFollowButton = true,
      showMessageButton = false,
      showBlockButton = false,
      showStats = true,
      showSocialLinks = true,
      size,
      variant,
      clickable,
      ...props
    },
    ref
  ) => {
    // 사용자 소개 요약
    const truncatedBio = React.useMemo(() => {
      if (!user.bio || user.bio.length <= maxBioLength) {
        return user.bio;
      }
      return user.bio.substring(0, maxBioLength) + '...';
    }, [user.bio, maxBioLength]);
    
    // 사용자 클릭 핸들러
    const handleUserClick = () => {
      onUserClick?.(user.id);
    };
    
    // 팔로우 핸들러
    const handleFollow = () => {
      onFollow?.(user.id, !user.followed);
    };
    
    // 차단 핸들러
    const handleBlock = () => {
      onBlock?.(user.id, !user.blocked);
    };
    
    // 메시지 핸들러
    const handleMessage = () => {
      onMessage?.(user.id);
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          userCardVariants({
            size,
            variant,
            clickable: clickable || !!onUserClick,
            className,
          }),
          fullWidth && 'w-full'
        )}
        onClick={onUserClick ? handleUserClick : undefined}
        role={onUserClick ? 'button' : undefined}
        tabIndex={onUserClick ? 0 : undefined}
        {...props}
      >
        {/* 사용자 프로필 */}
        <UserProfile
          name={user.name}
          avatar={user.avatar}
          email={user.email}
          title={user.title}
          badge={user.badge}
          status={user.status}
          level={user.level}
          points={user.points}
          bio={truncatedBio}
          location={user.location}
          joinDate={user.joinDate instanceof Date ? user.joinDate.toISOString() : user.joinDate}
          lastActive={user.lastActive instanceof Date ? user.lastActive.toISOString() : user.lastActive}
          socialLinks={showSocialLinks ? user.socialLinks : undefined}
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
          orientation="horizontal"
          clickable={!!onUserClick}
          fullWidth={fullWidth}
        />
        
        {/* 사용자 통계 */}
        {showStats && user.stats && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">
                {user.stats.questions}
              </div>
              <div className="text-xs text-muted-foreground">질문</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">
                {user.stats.answers}
              </div>
              <div className="text-xs text-muted-foreground">답변</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">
                {user.stats.likes}
              </div>
              <div className="text-xs text-muted-foreground">좋아요</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">
                {user.stats.followers}
              </div>
              <div className="text-xs text-muted-foreground">팔로워</div>
            </div>
          </div>
        )}
        
        {/* 액션 버튼들 */}
        <div className="mt-4 flex items-center gap-2">
          {showFollowButton && (
            <Button
              onClick={handleFollow}
              variant={user.followed ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
            >
              {user.followed ? '팔로우 중' : '팔로우'}
            </Button>
          )}
          
          {showMessageButton && (
            <Button
              onClick={handleMessage}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              메시지
            </Button>
          )}
          
          {showBlockButton && (
            <Button
              onClick={handleBlock}
              variant="ghost"
              size="sm"
              className="text-error-500 hover:text-error-600"
            >
              {user.blocked ? '차단 해제' : '차단'}
            </Button>
          )}
        </div>
      </div>
    );
  }
);

UserCard.displayName = 'UserCard';

export { UserCard, userCardVariants };
