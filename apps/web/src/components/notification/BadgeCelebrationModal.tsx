"use client";

import React, { useState, useEffect } from "react";
import { BadgeInfo, UserBadgeInfo } from "@/types/badge";
import { BadgeIcon } from "@/components/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Star, Sparkles, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

/**
 * BadgeCelebrationModal - 배지 획득 축하 모달 컴포넌트
 * 
 * @description
 * - 배지 획득 시 축하 모달 표시
 * - 배지 이미지 애니메이션
 * - 획득 메시지 및 포인트 표시
 * - 프로필 보기 버튼
 * - 모달 자동 닫기 타이머
 */
interface BadgeCelebrationModalProps {
  badge: BadgeInfo;
  userBadge: UserBadgeInfo;
  isOpen: boolean;
  onClose: () => void;
  onViewProfile?: () => void;
  autoClose?: boolean;
  duration?: number;
  className?: string;
}

export function BadgeCelebrationModal({
  badge,
  userBadge,
  isOpen,
  onClose,
  onViewProfile,
  autoClose = true,
  duration = 8000,
  className
}: BadgeCelebrationModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration / 1000);

  // 애니메이션 시작
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setTimeout(() => setShowContent(true), 500);
    } else {
      setIsAnimating(false);
      setShowContent(false);
    }
  }, [isOpen]);

  // 자동 닫기 타이머
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, autoClose]);

  const handleClose = () => {
    setIsAnimating(false);
    setShowContent(false);
    setTimeout(() => {
      onClose();
      setTimeLeft(duration / 1000);
    }, 300);
  };

  const handleViewProfile = () => {
    onViewProfile?.();
    handleClose();
  };

  const getRarityColor = (type: string) => {
    switch (type) {
      case 'CATEGORY_EXPERT':
        return 'from-blue-400 to-blue-600';
      case 'ACTIVITY_LEVEL':
        return 'from-gray-400 to-gray-600';
      case 'ACHIEVEMENT':
        return 'from-purple-400 to-purple-600';
      case 'SPECIAL':
        return 'from-yellow-400 to-yellow-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityGlow = (type: string) => {
    switch (type) {
      case 'CATEGORY_EXPERT':
        return 'shadow-blue-500/50';
      case 'ACTIVITY_LEVEL':
        return 'shadow-gray-500/50';
      case 'ACHIEVEMENT':
        return 'shadow-purple-500/50';
      case 'SPECIAL':
        return 'shadow-yellow-500/50';
      default:
        return 'shadow-gray-500/50';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "max-w-md mx-auto p-0 overflow-hidden",
        className
      )}>
        {/* 배경 애니메이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 opacity-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-yellow-200/30"></div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="relative z-10 p-6 text-center">
          {/* 축하 메시지 */}
          <div className={cn(
            "transition-all duration-1000 ease-out",
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
              <h2 className="text-2xl font-bold text-gray-900">
                축하합니다! 🎉
              </h2>
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
            
            <p className="text-gray-600 mb-6">
              새로운 배지를 획득했습니다!
            </p>
          </div>

          {/* 배지 애니메이션 */}
          <div className={cn(
            "mb-6 transition-all duration-1000 ease-out",
            showContent ? "opacity-100 scale-100" : "opacity-0 scale-50"
          )}>
            <div className={cn(
              "relative inline-block",
              isAnimating && "animate-bounce"
            )}>
              {/* 배지 그라데이션 배경 */}
              <div className={cn(
                "absolute inset-0 rounded-full bg-gradient-to-r blur-lg opacity-60",
                getRarityColor(badge.type),
                getRarityGlow(badge.type),
                "shadow-2xl"
              )}></div>
              
              {/* 배지 아이콘 */}
              <div className="relative z-10">
                <BadgeIcon 
                  badge={badge} 
                  size="xl" 
                  showTooltip={false}
                  className="transform hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              {/* 별 애니메이션 */}
              <div className="absolute -top-2 -right-2">
                <Star className="w-4 h-4 text-yellow-400 animate-spin" />
              </div>
              <div className="absolute -bottom-2 -left-2">
                <Star className="w-3 h-3 text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* 배지 정보 */}
          <div className={cn(
            "transition-all duration-1000 ease-out delay-500",
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {badge.name}
            </h3>
            
            <p className="text-gray-600 mb-4 leading-relaxed">
              {badge.description}
            </p>

            {/* 포인트 및 정보 */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6 border border-green-200">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    +{badge.bonusPoints}
                  </div>
                  <div className="text-xs text-gray-500">포인트</div>
                </div>
                
                <div className="w-px h-8 bg-gray-300"></div>
                
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">
                    {badge.category || '일반'}
                  </div>
                  <div className="text-xs text-gray-500">카테고리</div>
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className={cn(
            "transition-all duration-1000 ease-out delay-700",
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <div className="flex gap-3">
              <Button
                onClick={handleViewProfile}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                <Trophy className="w-4 h-4 mr-2" />
                프로필 보기
              </Button>
              
              <Button
                variant="outline"
                onClick={handleClose}
                className="px-6"
              >
                닫기
              </Button>
            </div>
          </div>

          {/* 자동 닫기 타이머 */}
          {autoClose && (
            <div className="mt-4 text-xs text-gray-500">
              {timeLeft}초 후 자동으로 닫힙니다
            </div>
          )}
        </div>

        {/* 파티클 효과 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping",
                `top-${Math.floor(Math.random() * 100)}%`,
                `left-${Math.floor(Math.random() * 100)}%`,
                `animation-delay-${i * 100}`
              )}
              style={{
                animationDelay: `${i * 100}ms`,
                animationDuration: '2s',
                top: `${Math.floor(Math.random() * 100)}%`,
                left: `${Math.floor(Math.random() * 100)}%`,
              }}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * BadgeCelebrationModalCompact - 컴팩트한 축하 모달
 */
export function BadgeCelebrationModalCompact({
  badge,
  userBadge,
  isOpen,
  onClose,
  className
}: Omit<BadgeCelebrationModalProps, 'onViewProfile' | 'autoClose' | 'duration'>) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-sm mx-auto", className)}>
        <div className="text-center p-4">
          <div className={cn(
            "mb-4 transition-all duration-500",
            isAnimating ? "scale-110" : "scale-100"
          )}>
            <BadgeIcon 
              badge={badge} 
              size="lg" 
              showTooltip={false}
            />
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            🎉 {badge.name} 획득!
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            {badge.description}
          </p>
          
          <div className="bg-green-50 rounded-lg p-3 mb-4">
            <div className="text-lg font-bold text-green-600">
              +{badge.bonusPoints}P 획득
            </div>
          </div>
          
          <Button onClick={onClose} className="w-full">
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
