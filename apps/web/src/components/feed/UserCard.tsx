"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle,
  MapPin,
  Calendar,
  MessageCircle,
  Heart,
  Star,
  Users,
  Award,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 사용자 데이터 타입
 */
export interface UserData {
  id: string;
  name: string;
  username: string;
  profileImage?: string;
  bio?: string;
  location?: string;
  joinedAt: string;
  isVerified: boolean;
  isExpert: boolean;
  stats: {
    questionCount: number;
    answerCount: number;
    likeCount: number;
    helpfulCount: number;
    followerCount: number;
    followingCount: number;
  };
  badges: string[];
  expertise: string[];
  recentActivity: {
    type: "question" | "answer" | "like";
    title: string;
    createdAt: string;
  }[];
}

/**
 * UserCard 컴포넌트 Props
 */
export interface UserCardProps {
  user: UserData;
  variant?: "default" | "compact" | "detailed" | "minimal";
  showStats?: boolean;
  showRecentActivity?: boolean;
  showFollowButton?: boolean;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  className?: string;
}

/**
 * UserCard 컴포넌트
 * 
 * @description
 * - 사용자 정보를 카드 형태로 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 다양한 variant 지원 (default, compact, detailed, minimal)
 * - 접근성 및 반응형 디자인 적용
 * 
 * @example
 * ```tsx
 * <UserCard 
 *   user={userData} 
 *   variant="default"
 *   showStats={true}
 *   onFollow={handleFollow}
 * />
 * ```
 */
export const UserCard: React.FC<UserCardProps> = ({
  user,
  variant = "default",
  showStats = true,
  showRecentActivity = false,
  showFollowButton = false,
  onFollow,
  onUnfollow,
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
   * 가입일 포맷팅 함수
   */
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * 팔로우 핸들러
   */
  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFollow?.(user.id);
  };

  /**
   * 언팔로우 핸들러
   */
  const handleUnfollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onUnfollow?.(user.id);
  };

  // Minimal variant 렌더링
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center space-x-3", className)}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.profileImage} />
          <AvatarFallback>
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1">
            <span className="font-medium text-foreground truncate">
              {user.name}
            </span>
            {user.isVerified && (
              <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
            )}
            {user.isExpert && (
              <Badge variant="outline" className="text-xs">
                전문가
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            @{user.username}
          </p>
        </div>
      </div>
    );
  }

  // Compact variant 렌더링
  if (variant === "compact") {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <Link href={`/users/${user.id}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profileImage} />
                <AvatarFallback>
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="font-medium text-foreground truncate">
                    {user.name}
                  </span>
                  {user.isVerified && (
                    <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                  )}
                  {user.isExpert && (
                    <Badge variant="outline" className="text-xs">
                      전문가
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  @{user.username}
                </p>
                {user.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {user.bio}
                  </p>
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
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.profileImage} />
                <AvatarFallback className="text-lg">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {user.name}
                  </h3>
                  {user.isVerified && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                  {user.isExpert && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      <Award className="h-3 w-3 mr-1" />
                      전문가
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  @{user.username}
                </p>
                {user.bio && (
                  <p className="text-sm text-foreground mb-2">
                    {user.bio}
                  </p>
                )}
                {user.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>
            </div>
            
            {showFollowButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleFollow}
                className="h-8"
              >
                팔로우
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* 전문 분야 */}
          {user.expertise.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-foreground mb-2">전문 분야</h4>
              <div className="flex flex-wrap gap-1">
                {user.expertise.map((expertise) => (
                  <Badge key={expertise} variant="secondary" className="text-xs">
                    {expertise}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 통계 */}
          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {user.stats.questionCount}
                </div>
                <div className="text-xs text-muted-foreground">질문</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {user.stats.answerCount}
                </div>
                <div className="text-xs text-muted-foreground">답변</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {user.stats.likeCount}
                </div>
                <div className="text-xs text-muted-foreground">좋아요</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {user.stats.helpfulCount}
                </div>
                <div className="text-xs text-muted-foreground">도움됨</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {user.stats.followerCount}
                </div>
                <div className="text-xs text-muted-foreground">팔로워</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {user.stats.followingCount}
                </div>
                <div className="text-xs text-muted-foreground">팔로잉</div>
              </div>
            </div>
          )}

          {/* 최근 활동 */}
          {showRecentActivity && user.recentActivity.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">최근 활동</h4>
              <div className="space-y-2">
                {user.recentActivity.slice(0, 3).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="flex-shrink-0">
                      {activity.type === "question" && (
                        <MessageCircle className="h-3 w-3 text-blue-500" />
                      )}
                      {activity.type === "answer" && (
                        <Heart className="h-3 w-3 text-green-500" />
                      )}
                      {activity.type === "like" && (
                        <Star className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-foreground line-clamp-1 flex-1">
                      {activity.title}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 가입일 */}
          <div className="flex items-center text-xs text-muted-foreground mt-4 pt-4 border-t">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{formatJoinDate(user.joinedAt)} 가입</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant 렌더링
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <Link href={`/users/${user.id}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* 헤더 */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.profileImage} />
                <AvatarFallback>
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1 mb-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {user.name}
                  </h3>
                  {user.isVerified && (
                    <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                  )}
                  {user.isExpert && (
                    <Badge variant="outline" className="text-xs">
                      전문가
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  @{user.username}
                </p>
                {user.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>

            {/* 전문 분야 */}
            {user.expertise.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {user.expertise.slice(0, 3).map((expertise) => (
                  <Badge key={expertise} variant="secondary" className="text-xs">
                    {expertise}
                  </Badge>
                ))}
                {user.expertise.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{user.expertise.length - 3}개 더
                  </span>
                )}
              </div>
            )}

            {/* 통계 */}
            {showStats && (
              <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                <div className="text-center">
                  <div className="text-sm font-semibold text-foreground">
                    {user.stats.questionCount}
                  </div>
                  <div className="text-xs text-muted-foreground">질문</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-foreground">
                    {user.stats.answerCount}
                  </div>
                  <div className="text-xs text-muted-foreground">답변</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-foreground">
                    {user.stats.likeCount}
                  </div>
                  <div className="text-xs text-muted-foreground">좋아요</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
