/**
 * MessageList 컴포넌트
 * 
 * @description
 * - 메시지 목록을 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <MessageList
 *   messages={[
 *     {
 *       id: '1',
 *       content: '안녕하세요!',
 *       author: { id: '1', name: '김철수', avatar: '/avatar.jpg' },
 *       createdAt: '2024-01-01T00:00:00Z',
 *       type: 'text'
 *     }
 *   ]}
 *   onMessageClick={handleMessageClick}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Text, Button } from '../atoms';
import { MessageBubble, UserProfile, TimestampDisplay } from '../molecules';

/**
 * 메시지 목록 컴포넌트 스타일 variants 정의
 */
const messageListVariants = cva(
  // 기본 스타일
  'flex flex-col gap-2 p-4 bg-background',
  {
    variants: {
      size: {
        sm: 'gap-1 p-2',
        md: 'gap-2 p-4',
        lg: 'gap-3 p-6',
      },
      variant: {
        default: 'bg-background',
        card: 'bg-card border border-border rounded-lg',
        chat: 'bg-chat-background',
      },
      orientation: {
        vertical: 'flex-col',
        horizontal: 'flex-row',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
      orientation: 'vertical',
    },
  }
);

/**
 * 메시지 데이터 타입 정의
 */
export interface MessageData {
  /**
   * 메시지 ID
   */
  id: string;
  
  /**
   * 메시지 내용
   */
  content: string;
  
  /**
   * 메시지 작성자
   */
  author: {
    id: string;
    name: string;
    avatar?: string;
    level?: number;
    points?: number;
  };
  
  /**
   * 메시지 생성일
   */
  createdAt: string | Date;
  
  /**
   * 메시지 수정일
   */
  updatedAt?: string | Date;
  
  /**
   * 메시지 타입
   */
  type?: 'text' | 'image' | 'file' | 'link' | 'code' | 'quote';
  
  /**
   * 메시지 상태
   */
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  
  /**
   * 메시지 우선순위
   */
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  
  /**
   * 메시지 카테고리
   */
  category?: string;
  
  /**
   * 메시지 태그들
   */
  tags?: string[];
  
  /**
   * 메시지 위치
   */
  location?: string;
  
  /**
   * 메시지 이미지들
   */
  images?: string[];
  
  /**
   * 메시지 첨부파일들
   */
  attachments?: {
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
  
  /**
   * 메시지 수정 이력
   */
  editHistory?: {
    editedAt: string | Date;
    editedBy: string;
    reason?: string;
  }[];
  
  /**
   * 메시지 댓글들
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
   * 메시지 팔로우 여부
   */
  followed?: boolean;
  
  /**
   * 메시지 북마크 여부
   */
  bookmarked?: boolean;
  
  /**
   * 메시지 좋아요 여부
   */
  liked?: boolean;
  
  /**
   * 메시지 싫어요 여부
   */
  disliked?: boolean;
  
  /**
   * 메시지 신고 여부
   */
  reported?: boolean;
}

/**
 * MessageList 컴포넌트 Props 타입 정의
 */
export interface MessageListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof messageListVariants> {
  /**
   * 메시지 데이터 배열
   */
  messages: MessageData[];
  
  /**
   * 메시지 클릭 핸들러
   */
  onMessageClick?: (messageId: string) => void;
  
  /**
   * 작성자 클릭 핸들러
   */
  onAuthorClick?: (authorId: string) => void;
  
  /**
   * 좋아요 핸들러
   */
  onLike?: (messageId: string, liked: boolean) => void;
  
  /**
   * 싫어요 핸들러
   */
  onDislike?: (messageId: string, disliked: boolean) => void;
  
  /**
   * 북마크 핸들러
   */
  onBookmark?: (messageId: string, bookmarked: boolean) => void;
  
  /**
   * 팔로우 핸들러
   */
  onFollow?: (messageId: string, followed: boolean) => void;
  
  /**
   * 신고 핸들러
   */
  onReport?: (messageId: string, reported: boolean) => void;
  
  /**
   * 메시지 전체 너비 사용 여부
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * 메시지 내용 최대 길이
   * @default 200
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
   * 신고 버튼 표시 여부
   * @default true
   */
  showReportButton?: boolean;
  
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
  
  /**
   * 메시지 그룹핑 여부
   * @default true
   */
  groupMessages?: boolean;
  
  /**
   * 메시지 그룹 간격 (분)
   * @default 5
   */
  groupInterval?: number;
}

/**
 * MessageList 컴포넌트
 * 
 * @param props - MessageList 컴포넌트 props
 * @returns JSX.Element
 */
const MessageList = React.forwardRef<HTMLDivElement, MessageListProps>(
  (
    {
      className,
      messages,
      onMessageClick,
      onAuthorClick,
      onLike,
      onDislike,
      onBookmark,
      onFollow,
      onReport,
      fullWidth = false,
      maxContentLength = 200,
      showLikeButton = true,
      showDislikeButton = true,
      showBookmarkButton = true,
      showFollowButton = true,
      showReportButton = true,
      showAuthor = true,
      showStats = true,
      showTimestamp = true,
      showComments = false,
      groupMessages = true,
      groupInterval = 5,
      size,
      variant,
      orientation,
      ...props
    },
    ref
  ) => {
    // 메시지 그룹핑
    const groupedMessages = React.useMemo(() => {
      if (!groupMessages || messages.length === 0) {
        return messages.map((message, index) => ({ message, group: index }));
      }
      
      const groups: { message: MessageData; group: number }[] = [];
      let currentGroup = 0;
      let lastMessageTime = new Date(messages[0].createdAt);
      
      messages.forEach((message, index) => {
        const messageTime = new Date(message.createdAt);
        const timeDiff = Math.abs(messageTime.getTime() - lastMessageTime.getTime()) / (1000 * 60); // 분 단위
        
        if (timeDiff > groupInterval) {
          currentGroup++;
        }
        
        groups.push({ message, group: currentGroup });
        lastMessageTime = messageTime;
      });
      
      return groups;
    }, [messages, groupMessages, groupInterval]);
    
    // 메시지 클릭 핸들러
    const handleMessageClick = (messageId: string) => {
      onMessageClick?.(messageId);
    };
    
    // 작성자 클릭 핸들러
    const handleAuthorClick = (authorId: string) => {
      onAuthorClick?.(authorId);
    };
    
    // 좋아요 핸들러
    const handleLike = (messageId: string, liked: boolean) => {
      onLike?.(messageId, liked);
    };
    
    // 싫어요 핸들러
    const handleDislike = (messageId: string, disliked: boolean) => {
      onDislike?.(messageId, disliked);
    };
    
    // 북마크 핸들러
    const handleBookmark = (messageId: string, bookmarked: boolean) => {
      onBookmark?.(messageId, bookmarked);
    };
    
    // 팔로우 핸들러
    const handleFollow = (messageId: string, followed: boolean) => {
      onFollow?.(messageId, followed);
    };
    
    // 신고 핸들러
    const handleReport = (messageId: string, reported: boolean) => {
      onReport?.(messageId, reported);
    };
    
    if (messages.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            messageListVariants({
              size,
              variant,
              orientation,
              className,
            }),
            fullWidth && 'w-full'
          )}
          {...props}
        >
          <Text as="p" size="sm" className="text-center text-muted-foreground">
            메시지가 없습니다.
          </Text>
        </div>
      );
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          messageListVariants({
            size,
            variant,
            orientation,
            className,
          }),
          fullWidth && 'w-full'
        )}
        {...props}
      >
        {groupedMessages.map(({ message, group }, index) => (
          <div key={message.id} className="message-item">
            {/* 메시지 그룹 구분선 */}
            {groupMessages && group > 0 && index > 0 && groupedMessages[index - 1].group !== group && (
              <div className="my-4 border-t border-border" />
            )}
            
            {/* 메시지 내용 */}
            <MessageBubble
              message={message.content}
              variant={message.author.id === 'current-user' ? 'sent' : 'received'}
              onClick={() => handleMessageClick(message.id)}
              className="mb-2"
            />
            
            {/* 메시지 작성자 */}
            {showAuthor && (
              <div className="mb-2">
                <UserProfile
                  name={message.author.name}
                  avatar={message.author.avatar}
                  level={message.author.level}
                  points={message.author.points}
                  size={size === 'sm' ? 'sm' : 'md'}
                  orientation="horizontal"
                  clickable={!!onAuthorClick}
                  onClick={() => handleAuthorClick(message.author.id)}
                />
              </div>
            )}
            
            {/* 메시지 통계 */}
            {showStats && (
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>좋아요 {message.liked ? 1 : 0}</span>
                <span>싫어요 {message.disliked ? 1 : 0}</span>
                {message.comments && message.comments.length > 0 && (
                  <span>댓글 {message.comments.length}</span>
                )}
              </div>
            )}
            
            {/* 메시지 시간 */}
            {showTimestamp && (
              <div className="mb-2">
                <TimestampDisplay
                  timestamp={message.createdAt}
                  format="relative"
                  size="xs"
                />
              </div>
            )}
            
            {/* 액션 버튼들 */}
            <div className="flex items-center gap-1">
              {showLikeButton && (
                <Button
                  onClick={() => handleLike(message.id, !message.liked)}
                  variant={message.liked ? 'default' : 'outline'}
                  size="sm"
                >
                  좋아요
                </Button>
              )}
              
              {showDislikeButton && (
                <Button
                  onClick={() => handleDislike(message.id, !message.disliked)}
                  variant={message.disliked ? 'default' : 'outline'}
                  size="sm"
                >
                  싫어요
                </Button>
              )}
              
              {showBookmarkButton && (
                <Button
                  onClick={() => handleBookmark(message.id, !message.bookmarked)}
                  variant={message.bookmarked ? 'default' : 'outline'}
                  size="sm"
                >
                  북마크
                </Button>
              )}
              
              {showFollowButton && (
                <Button
                  onClick={() => handleFollow(message.id, !message.followed)}
                  variant={message.followed ? 'default' : 'outline'}
                  size="sm"
                >
                  팔로우
                </Button>
              )}
              
              {showReportButton && (
                <Button
                  onClick={() => handleReport(message.id, !message.reported)}
                  variant={message.reported ? 'default' : 'outline'}
                  size="sm"
                  className="text-error-500 hover:text-error-600"
                >
                  신고
                </Button>
              )}
            </div>
            
            {/* 메시지 댓글들 */}
            {showComments && message.comments && message.comments.length > 0 && (
              <div className="mt-2 border-t pt-2">
                <h4 className="text-xs font-semibold mb-1">
                  댓글 ({message.comments.length})
                </h4>
                <div className="space-y-1">
                  {message.comments.slice(0, 3).map((comment) => (
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
                  {message.comments.length > 3 && (
                    <p className="text-xs text-gray-500">
                      댓글 {message.comments.length - 3}개 더 보기
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
);

MessageList.displayName = 'MessageList';

export { MessageList, messageListVariants };
