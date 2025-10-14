"use client";

import React from "react";
import { BadgeCardProps } from "@/types/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BadgeIcon } from "./BadgeIcon";
import { BadgeProgress } from "./BadgeProgress";

/**
 * BadgeCard - 배지 상세 카드 컴포넌트
 * 
 * @description
 * - 배지의 상세 정보를 카드 형태로 표시
 * - 진행률 표시 옵션 지원
 * - 설명 표시 옵션 지원
 * - 반응형 디자인 적용
 */
export function BadgeCard({ 
  badge, 
  progress, 
  showProgress = false, 
  showDescription = true,
  className 
}: BadgeCardProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'CATEGORY_EXPERT':
        return '카테고리 전문가';
      case 'ACTIVITY_LEVEL':
        return '활동 레벨';
      case 'ACHIEVEMENT':
        return '업적';
      case 'SPECIAL':
        return '특별 배지';
      case 'SOCIAL':
        return '소셜 배지';
      case 'VERIFICATION':
        return '인증 배지';
      default:
        return '배지';
    }
  };

  const getRarityColor = (type: string) => {
    switch (type) {
      case 'CATEGORY_EXPERT':
        return 'border-blue-200 bg-blue-50';
      case 'ACTIVITY_LEVEL':
        return 'border-gray-200 bg-gray-50';
      case 'ACHIEVEMENT':
        return 'border-purple-200 bg-purple-50';
      case 'SPECIAL':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const isEarned = progress?.isEarned || false;

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      getRarityColor(badge.type),
      isEarned && "ring-2 ring-green-200",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <BadgeIcon 
            badge={badge} 
            size="lg" 
            showTooltip={false}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{badge.name}</h3>
              {isEarned && (
                <span className="text-green-500 text-sm">✓</span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="px-2 py-1 bg-white rounded-full text-xs font-medium">
                {getTypeLabel(badge.type)}
              </span>
              {badge.category && (
                <span className="px-2 py-1 bg-white rounded-full text-xs">
                  {badge.category}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 배지 설명 */}
        {showDescription && (
          <p className="text-sm text-gray-700 leading-relaxed">
            {badge.description}
          </p>
        )}

        {/* 진행률 표시 */}
        {showProgress && progress && (
          <BadgeProgress 
            progress={progress}
            showPercentage={true}
            showRequired={true}
          />
        )}

        {/* 배지 정보 */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">필요 답변:</span>
              <span className="font-medium">{badge.requiredAnswers}개</span>
            </div>
            
            {badge.requiredAdoptRate && (
              <div className="flex justify-between">
                <span className="text-gray-500">채택률:</span>
                <span className="font-medium">{badge.requiredAdoptRate}%</span>
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">보상 포인트:</span>
              <span className="font-medium text-green-600">
                +{badge.bonusPoints}P
              </span>
            </div>
            
            {badge.adoptBonusPoints && (
              <div className="flex justify-between">
                <span className="text-gray-500">채택 보너스:</span>
                <span className="font-medium text-blue-600">
                  +{badge.adoptBonusPoints}P
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 특별 요구사항 */}
        {(badge.requiresGpsAuth || badge.requiresSocialAuth || badge.requiresDocAuth) && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">특별 요구사항:</p>
            <div className="flex flex-wrap gap-1">
              {badge.requiresGpsAuth && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  위치 인증
                </span>
              )}
              {badge.requiresSocialAuth && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                  소셜 인증
                </span>
              )}
              {badge.requiresDocAuth && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                  문서 인증
                </span>
              )}
            </div>
          </div>
        )}

        {/* 완료된 배지 추가 정보 */}
        {isEarned && progress?.earnedAt && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">획득일:</span>
              <span className="font-medium">
                {new Date(progress.earnedAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * BadgeCardCompact - 컴팩트한 배지 카드
 */
export function BadgeCardCompact({ 
  badge, 
  className 
}: Omit<BadgeCardProps, 'showProgress' | 'showDescription'>) {
  return (
    <Card className={cn(
      "p-3 transition-all duration-200 hover:shadow-md",
      className
    )}>
      <div className="flex items-center gap-3">
        <BadgeIcon 
          badge={badge} 
          size="md" 
          showTooltip={true}
        />
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{badge.name}</h4>
          <p className="text-xs text-gray-500 truncate">
            {badge.description}
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-xs font-medium text-green-600">
            +{badge.bonusPoints}P
          </div>
        </div>
      </div>
    </Card>
  );
}
