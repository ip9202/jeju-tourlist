"use client";

/**
 * UserProfile 컴포넌트
 *
 * @description
 * - 사용자 프로필 정보를 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 *
 * @example
 * ```tsx
 * <UserProfile
 *   name="김철수"
 *   avatar="/avatar.jpg"
 *   badge="VIP"
 *   status="online"
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Avatar, Text, Heading } from '../atoms';

/**
 * 사용자 프로필 컴포넌트 스타일 variants 정의
 */
const userProfileVariants = cva(
  // 기본 스타일
  'flex items-center gap-3',
  {
    variants: {
      size: {
        sm: 'gap-2',
        md: 'gap-3',
        lg: 'gap-4',
      },
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col text-center',
      },
      clickable: {
        true: 'cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-colors',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      orientation: 'horizontal',
      clickable: false,
    },
  }
);

/**
 * 사용자 프로필 컴포넌트 Props 타입 정의
 */
export interface UserProfileProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof userProfileVariants> {
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
   * 사용자 배지
   */
  badge?: string;
  
  /**
   * 사용자 상태
   */
  status?: 'online' | 'offline' | 'away' | 'busy';
  
  /**
   * 사용자 레벨/등급
   */
  level?: number;
  
  /**
   * 사용자 포인트
   */
  points?: number;
  
  /**
   * 사용자 가입일
   */
  joinDate?: string;
  
  /**
   * 사용자 마지막 활동
   */
  lastActive?: string;
  
  /**
   * 사용자 소개
   */
  bio?: string;
  
  /**
   * 사용자 위치
   */
  location?: string;
  
  /**
   * 사용자 웹사이트
   */
  website?: string;
  
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
   * 프로필 클릭 핸들러
   */
  onClick?: () => void;
  
  /**
   * 프로필 전체 너비 사용 여부
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * UserProfile 컴포넌트
 * 
 * @param props - UserProfile 컴포넌트 props
 * @returns JSX.Element
 */
const UserProfile = React.forwardRef<HTMLDivElement, UserProfileProps>(
  (
    {
      className,
      name,
      avatar,
      email,
      title,
      badge,
      status,
      level,
      points,
      joinDate,
      lastActive,
      bio,
      location,
      website,
      socialLinks,
      onClick,
      fullWidth = false,
      size,
      orientation,
      clickable,
      ...props
    },
    ref
  ) => {
    // 아바타 크기 결정
    const avatarSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
    
    // 텍스트 크기 결정
    const textSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
    
    // 제목 크기 결정
    const headingSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
    
    return (
      <div
        ref={ref}
        className={cn(
          userProfileVariants({
            size,
            orientation,
            clickable: clickable || !!onClick,
            className,
          }),
          fullWidth && 'w-full'
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        {...props}
      >
        {/* 아바타 */}
        <Avatar
          src={avatar}
          alt={name}
          size={avatarSize}
          status={status}
          showBadge={!!badge}
          badgeColor="info"
        />
        
        {/* 사용자 정보 */}
        <div className={cn(
          'flex flex-col gap-1',
          orientation === 'vertical' && 'items-center',
          fullWidth && 'flex-1'
        )}>
          {/* 이름과 배지 */}
          <div className={cn(
            'flex items-center gap-2',
            orientation === 'vertical' && 'flex-col'
          )}>
            <Heading
              level={size === 'sm' ? 6 : size === 'lg' ? 4 : 5}
              size={headingSize}
              className="font-semibold"
            >
              {name}
            </Heading>
            
            {badge && (
              <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                {badge}
              </span>
            )}
          </div>
          
          {/* 직책/역할 */}
          {title && (
            <Text
              size={textSize}
              color="muted"
              className="font-medium"
            >
              {title}
            </Text>
          )}
          
          {/* 이메일 */}
          {email && (
            <Text
              size={textSize}
              color="muted"
              className="font-mono"
            >
              {email}
            </Text>
          )}
          
          {/* 소개 */}
          {bio && (
            <Text
              size={textSize}
              color="muted"
              className="line-clamp-2"
            >
              {bio}
            </Text>
          )}
          
          {/* 위치 */}
          {location && (
            <div className="flex items-center gap-1">
              <svg className="h-3 w-3 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <Text size={textSize} color="muted">
                {location}
              </Text>
            </div>
          )}
          
          {/* 레벨과 포인트 */}
          {(level || points) && (
            <div className="flex items-center gap-2">
              {level && (
                <span className="px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded">
                  Lv.{level}
                </span>
              )}
              {points && (
                <span className="px-2 py-1 text-xs font-medium bg-warning-100 text-warning-700 rounded">
                  {points.toLocaleString()}P
                </span>
              )}
            </div>
          )}
          
          {/* 가입일 */}
          {joinDate && (
            <Text size={textSize} color="muted">
              가입일: {joinDate}
            </Text>
          )}
          
          {/* 마지막 활동 */}
          {lastActive && (
            <Text size={textSize} color="muted">
              마지막 활동: {lastActive}
            </Text>
          )}
          
          {/* 웹사이트 */}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-500 hover:text-primary-600 text-sm underline"
            >
              {website}
            </a>
          )}
          
          {/* 소셜 링크들 */}
          {socialLinks && (
            <div className="flex items-center gap-2">
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Twitter"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              )}
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="GitHub"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="LinkedIn"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Instagram"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

UserProfile.displayName = 'UserProfile';

export { UserProfile, userProfileVariants };
