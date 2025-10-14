"use client";

import React from "react";
import { BadgeTooltipProps } from "@/types/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * BadgeTooltip - 배지 툴팁 컴포넌트
 * 
 * @description
 * - 배지에 대한 상세 정보를 툴팁으로 표시
 * - 배지 이름, 설명, 획득 조건 등을 보여줌
 * - 접근성 고려한 키보드 네비게이션 지원
 */
export function BadgeTooltip({ 
  badge, 
  children, 
  delayDuration = 300 
}: BadgeTooltipProps) {
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
        return 'text-blue-600';
      case 'ACTIVITY_LEVEL':
        return 'text-gray-600';
      case 'ACHIEVEMENT':
        return 'text-purple-600';
      case 'SPECIAL':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs p-4"
          sideOffset={8}
        >
          <div className="space-y-2">
            {/* 배지 헤더 */}
            <div className="flex items-center gap-2">
              <span className="text-lg">{badge.emoji}</span>
              <div>
                <h4 className="font-semibold text-sm">{badge.name}</h4>
                <p className={cn("text-xs", getRarityColor(badge.type))}>
                  {getTypeLabel(badge.type)}
                </p>
              </div>
            </div>

            {/* 배지 설명 */}
            <p className="text-sm text-gray-600 leading-relaxed">
              {badge.description}
            </p>

            {/* 획득 조건 */}
            <div className="space-y-1 pt-2 border-t border-gray-200">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">필요 답변:</span>
                <span className="font-medium">{badge.requiredAnswers}개</span>
              </div>
              
              {badge.requiredAdoptRate && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">채택률:</span>
                  <span className="font-medium">{badge.requiredAdoptRate}%</span>
                </div>
              )}
              
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">보상 포인트:</span>
                <span className="font-medium text-green-600">
                  +{badge.bonusPoints}P
                </span>
              </div>
            </div>

            {/* 특별 요구사항 */}
            {(badge.requiresGpsAuth || badge.requiresSocialAuth || badge.requiresDocAuth) && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">특별 요구사항:</p>
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
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
