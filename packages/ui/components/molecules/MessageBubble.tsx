/**
 * MessageBubble 컴포넌트
 * 
 * @description
 * - 채팅 메시지를 표시하는 말풍선 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <MessageBubble
 *   message="안녕하세요!"
 *   sender="김철수"
 *   timestamp="2024-01-01 12:00"
 *   variant="sent"
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Avatar } from '../atoms';

/**
 * 메시지 버블 컴포넌트 스타일 variants 정의
 */
const messageBubbleVariants = cva(
  // 기본 스타일
  'relative max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm',
  {
    variants: {
      variant: {
        sent: 'bg-primary-500 text-white ml-auto',
        received: 'bg-muted text-foreground mr-auto',
      },
      size: {
        sm: 'text-sm px-3 py-1.5',
        md: 'text-base px-4 py-2',
        lg: 'text-lg px-5 py-3',
      },
      shape: {
        rounded: 'rounded-lg',
        'rounded-full': 'rounded-full',
        square: 'rounded-none',
      },
    },
    defaultVariants: {
      variant: 'received',
      size: 'md',
      shape: 'rounded',
    },
  }
);

/**
 * MessageBubble 컴포넌트 Props 타입 정의
 */
export interface MessageBubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof messageBubbleVariants> {
  /**
   * 메시지 내용
   */
  message: string;
  
  /**
   * 발신자 이름
   */
  sender?: string;
  
  /**
   * 발신자 아바타 URL
   */
  senderAvatar?: string;
  
  /**
   * 메시지 타임스탬프
   */
  timestamp?: string;
  
  /**
   * 메시지 상태
   */
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  
  /**
   * 메시지 타입
   */
  type?: 'text' | 'image' | 'file' | 'system';
  
  /**
   * 메시지 읽음 여부
   * @default false
   */
  isRead?: boolean;
  
  /**
   * 메시지 편집 가능 여부
   * @default false
   */
  editable?: boolean;
  
  /**
   * 메시지 삭제 가능 여부
   * @default false
   */
  deletable?: boolean;
  
  /**
   * 메시지 편집 핸들러
   */
  onEdit?: (message: string) => void;
  
  /**
   * 메시지 삭제 핸들러
   */
  onDelete?: () => void;
  
  /**
   * 메시지 반응 핸들러
   */
  onReact?: (reaction: string) => void;
  
  /**
   * 메시지 전체 너비 사용 여부
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * MessageBubble 컴포넌트
 * 
 * @param props - MessageBubble 컴포넌트 props
 * @returns JSX.Element
 */
const MessageBubble = React.forwardRef<HTMLDivElement, MessageBubbleProps>(
  (
    {
      className,
      message,
      sender,
      senderAvatar,
      timestamp,
      status = 'sent',
      type: _type = 'text',
      isRead = false,
      editable = false,
      deletable = false,
      onEdit,
      onDelete,
      onReact,
      fullWidth = false,
      variant,
      size,
      shape,
      ...props
    },
    ref
  ) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editMessage, setEditMessage] = React.useState(message);
    
    // 편집 모드 토글
    const handleEditToggle = () => {
      setIsEditing(!isEditing);
      if (isEditing) {
        setEditMessage(message);
      }
    };
    
    // 편집 저장
    const handleEditSave = () => {
      if (editMessage.trim() && editMessage !== message) {
        onEdit?.(editMessage);
      }
      setIsEditing(false);
    };
    
    // 편집 취소
    const handleEditCancel = () => {
      setEditMessage(message);
      setIsEditing(false);
    };
    
    // 상태 아이콘
    const getStatusIcon = () => {
      switch (status) {
        case 'sending':
          return (
            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          );
        case 'sent':
          return (
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          );
        case 'delivered':
          return (
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          );
        case 'read':
          return (
            <svg className="h-3 w-3 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          );
        case 'failed':
          return (
            <svg className="h-3 w-3 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          );
        default:
          return null;
      }
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-end gap-2',
          variant === 'sent' ? 'flex-row-reverse' : 'flex-row',
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {/* 발신자 아바타 */}
        {senderAvatar && (
          <Avatar
            src={senderAvatar}
            alt={sender || '발신자'}
            size="sm"
            className="shrink-0"
          />
        )}
        
        {/* 메시지 컨테이너 */}
        <div className={cn(
          'flex flex-col gap-1',
          variant === 'sent' ? 'items-end' : 'items-start'
        )}>
          {/* 발신자 이름 */}
          {sender && (
            <span className="text-xs text-muted-foreground px-1">
              {sender}
            </span>
          )}
          
          {/* 메시지 버블 */}
          <div className="relative group">
            <div
              className={cn(
                messageBubbleVariants({
                  variant,
                  size,
                  shape,
                })
              )}
            >
              {/* 편집 모드 */}
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    className="w-full bg-transparent border-none outline-none resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleEditSave}
                      className="px-2 py-1 text-xs bg-white/20 rounded hover:bg-white/30"
                    >
                      저장
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="px-2 py-1 text-xs bg-white/20 rounded hover:bg-white/30"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">
                  {message}
                </div>
              )}
            </div>
            
            {/* 메시지 액션 버튼들 */}
            <div className={cn(
              'absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1',
              variant === 'sent' ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
            )}>
              {editable && (
                <button
                  onClick={handleEditToggle}
                  className="p-1 bg-muted hover:bg-muted/80 rounded text-xs"
                  title="편집"
                >
                  ✏️
                </button>
              )}
              {deletable && (
                <button
                  onClick={onDelete}
                  className="p-1 bg-muted hover:bg-muted/80 rounded text-xs"
                  title="삭제"
                >
                  🗑️
                </button>
              )}
              <button
                onClick={() => onReact?.('👍')}
                className="p-1 bg-muted hover:bg-muted/80 rounded text-xs"
                title="반응"
              >
                👍
              </button>
            </div>
          </div>
          
          {/* 메시지 정보 */}
          <div className={cn(
            'flex items-center gap-1 text-xs text-muted-foreground',
            variant === 'sent' ? 'flex-row-reverse' : 'flex-row'
          )}>
            {/* 타임스탬프 */}
            {timestamp && (
              <span>{timestamp}</span>
            )}
            
            {/* 상태 아이콘 */}
            {variant === 'sent' && (
              <span className="flex items-center">
                {getStatusIcon()}
              </span>
            )}
            
            {/* 읽음 표시 */}
            {isRead && variant === 'sent' && (
              <span className="text-blue-500">읽음</span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

MessageBubble.displayName = 'MessageBubble';

export { MessageBubble, messageBubbleVariants };
