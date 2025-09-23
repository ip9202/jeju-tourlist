"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin,
  Star,
  Clock,
  Phone,
  Globe,
  Heart,
  Bookmark,
  Share2,
  Navigation,
  Camera,
  Users,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 위치 데이터 타입
 */
export interface LocationData {
  id: string;
  name: string;
  description: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  category: string;
  tags: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  priceRange: "무료" | "저렴" | "보통" | "비쌈";
  operatingHours: {
    open: string;
    close: string;
    closedDays?: string[];
  };
  contact: {
    phone?: string;
    website?: string;
  };
  amenities: string[];
  isBookmarked: boolean;
  isLiked: boolean;
  likeCount: number;
  questionCount: number;
  answerCount: number;
  distance?: number; // km
}

/**
 * LocationCard 컴포넌트 Props
 */
export interface LocationCardProps {
  location: LocationData;
  variant?: "default" | "compact" | "detailed" | "minimal";
  showActions?: boolean;
  showDistance?: boolean;
  onLike?: (locationId: string) => void;
  onBookmark?: (locationId: string) => void;
  onShare?: (locationId: string) => void;
  onNavigate?: (locationId: string) => void;
  className?: string;
}

/**
 * LocationCard 컴포넌트
 * 
 * @description
 * - 관광지/위치 정보를 카드 형태로 표시하는 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 다양한 variant 지원 (default, compact, detailed, minimal)
 * - 접근성 및 반응형 디자인 적용
 * 
 * @example
 * ```tsx
 * <LocationCard 
 *   location={locationData} 
 *   variant="default"
 *   showDistance={true}
 *   onLike={handleLike}
 * />
 * ```
 */
export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  variant = "default",
  showActions = true,
  showDistance = false,
  onLike,
  onBookmark,
  onShare,
  onNavigate,
  className,
}) => {
  /**
   * 가격 범위 색상 반환
   */
  const getPriceRangeColor = (priceRange: string) => {
    switch (priceRange) {
      case "무료":
        return "bg-green-100 text-green-700";
      case "저렴":
        return "bg-blue-100 text-blue-700";
      case "보통":
        return "bg-yellow-100 text-yellow-700";
      case "비쌈":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  /**
   * 거리 포맷팅 함수
   */
  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  /**
   * 좋아요 핸들러
   */
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(location.id);
  };

  /**
   * 북마크 핸들러
   */
  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark?.(location.id);
  };

  /**
   * 공유 핸들러
   */
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(location.id);
  };

  /**
   * 내비게이션 핸들러
   */
  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate?.(location.id);
  };

  // Minimal variant 렌더링
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center space-x-3", className)}>
        <div className="flex-shrink-0">
          {location.images.length > 0 ? (
            <div className="h-8 w-8 rounded bg-cover bg-center" 
                 style={{ backgroundImage: `url(${location.images[0]})` }} />
          ) : (
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">
            {location.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {location.address}
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <div className="flex items-center">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <span className="text-xs text-muted-foreground ml-1">
              {location.rating.toFixed(1)}
            </span>
          </div>
          {showDistance && location.distance && (
            <span className="text-xs text-muted-foreground">
              {formatDistance(location.distance)}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Compact variant 렌더링
  if (variant === "compact") {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <Link href={`/locations/${location.id}`}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {location.images.length > 0 ? (
                  <div className="h-16 w-16 rounded bg-cover bg-center" 
                       style={{ backgroundImage: `url(${location.images[0]})` }} />
                ) : (
                  <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground line-clamp-1 mb-1">
                  {location.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                  {location.address}
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                    <span>{location.rating.toFixed(1)}</span>
                    <span className="ml-1">({location.reviewCount})</span>
                  </div>
                  <span>•</span>
                  <Badge variant="outline" className={cn("text-xs", getPriceRangeColor(location.priceRange))}>
                    {location.priceRange}
                  </Badge>
                </div>
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
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {location.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                {location.address}
              </p>
              
              {/* 평점 및 리뷰 */}
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="ml-1 font-medium text-foreground">
                    {location.rating.toFixed(1)}
                  </span>
                  <span className="ml-1 text-sm text-muted-foreground">
                    ({location.reviewCount}개 리뷰)
                  </span>
                </div>
                <Badge variant="outline" className={getPriceRangeColor(location.priceRange)}>
                  {location.priceRange}
                </Badge>
                {showDistance && location.distance && (
                  <span className="text-sm text-muted-foreground">
                    {formatDistance(location.distance)} 거리
                  </span>
                )}
              </div>

              {/* 카테고리 및 태그 */}
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="default">{location.category}</Badge>
                {location.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {location.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{location.tags.length - 3}개 더
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* 설명 */}
          <p className="text-foreground mb-4 line-clamp-3">
            {location.description}
          </p>

          {/* 운영시간 */}
          <div className="mb-4">
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              <Clock className="h-4 w-4 mr-1" />
              <span>운영시간</span>
            </div>
            <p className="text-sm text-foreground">
              {location.operatingHours.open} - {location.operatingHours.close}
            </p>
            {location.operatingHours.closedDays && location.operatingHours.closedDays.length > 0 && (
              <p className="text-xs text-muted-foreground">
                휴무일: {location.operatingHours.closedDays.join(", ")}
              </p>
            )}
          </div>

          {/* 연락처 */}
          {(location.contact.phone || location.contact.website) && (
            <div className="mb-4">
              <div className="flex items-center space-x-4 text-sm">
                {location.contact.phone && (
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="h-4 w-4 mr-1" />
                    <span>{location.contact.phone}</span>
                  </div>
                )}
                {location.contact.website && (
                  <div className="flex items-center text-muted-foreground">
                    <Globe className="h-4 w-4 mr-1" />
                    <a href={location.contact.website} className="hover:text-primary">
                      웹사이트
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 편의시설 */}
          {location.amenities.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-foreground mb-2">편의시설</h4>
              <div className="flex flex-wrap gap-1">
                {location.amenities.slice(0, 5).map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
                {location.amenities.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    +{location.amenities.length - 5}개 더
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 통계 및 액션 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{location.questionCount} 질문</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{location.answerCount} 답변</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{location.likeCount}</span>
              </div>
            </div>

            {showActions && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={cn(
                    "h-8 px-2",
                    location.isLiked && "text-red-500 hover:text-red-600"
                  )}
                >
                  <Heart className={cn("h-4 w-4 mr-1", location.isLiked && "fill-current")} />
                  {location.likeCount}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={cn(
                    "h-8 px-2",
                    location.isBookmarked && "text-yellow-500 hover:text-yellow-600"
                  )}
                >
                  <Bookmark className={cn("h-4 w-4", location.isBookmarked && "fill-current")} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="h-8 px-2"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNavigate}
                  className="h-8 px-2"
                >
                  <Navigation className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant 렌더링
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <Link href={`/locations/${location.id}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* 헤더 */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
                  {location.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                  {location.address}
                </p>
                
                {/* 평점 및 가격 */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="ml-1 text-sm font-medium text-foreground">
                      {location.rating.toFixed(1)}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({location.reviewCount})
                    </span>
                  </div>
                  <Badge variant="outline" className={cn("text-xs", getPriceRangeColor(location.priceRange))}>
                    {location.priceRange}
                  </Badge>
                  {showDistance && location.distance && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistance(location.distance)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {location.category}
                </Badge>
              </div>
            </div>

            {/* 이미지 미리보기 */}
            {location.images.length > 0 && (
              <div className="relative">
                <div className="h-32 w-full rounded bg-cover bg-center" 
                     style={{ backgroundImage: `url(${location.images[0]})` }} />
                {location.images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    +{location.images.length - 1}
                  </div>
                )}
              </div>
            )}

            {/* 설명 */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {location.description}
            </p>

            {/* 태그 */}
            {location.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {location.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {location.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{location.tags.length - 3}개 더
                  </span>
                )}
              </div>
            )}

            {/* 통계 및 액션 */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{location.questionCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{location.answerCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>{location.likeCount}</span>
                </div>
              </div>

              {showActions && (
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={cn(
                      "h-6 px-2 text-xs",
                      location.isLiked && "text-red-500 hover:text-red-600"
                    )}
                  >
                    <Heart className={cn("h-3 w-3 mr-1", location.isLiked && "fill-current")} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBookmark}
                    className={cn(
                      "h-6 px-2 text-xs",
                      location.isBookmarked && "text-yellow-500 hover:text-yellow-600"
                    )}
                  >
                    <Bookmark className={cn("h-3 w-3", location.isBookmarked && "fill-current")} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="h-6 px-2 text-xs"
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNavigate}
                    className="h-6 px-2 text-xs"
                  >
                    <Navigation className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
