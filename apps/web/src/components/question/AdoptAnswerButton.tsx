"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AdoptAnswerButton - 답변 채택 버튼 컴포넌트
 * 
 * @description
 * - 질문자만 답변을 채택할 수 있음
 * - 채택 상태 시각적 표시
 * - 채택/채택 취소 기능
 */
interface AdoptAnswerButtonProps {
  answerId: string;
  questionId: string;
  isAccepted: boolean;
  isQuestionAuthor: boolean;
  onAdopt?: (answerId: string) => void;
  onUnadopt?: (answerId: string) => void;
  className?: string;
}

export function AdoptAnswerButton({
  answerId,
  questionId,
  isAccepted,
  isQuestionAuthor,
  onAdopt,
  onUnadopt,
  className
}: AdoptAnswerButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleAdopt = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      if (isAccepted) {
        // 채택 취소
        const response = await fetch(`/api/answers/${answerId}/adopt`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          onUnadopt?.(answerId);
        }
      } else {
        // 채택
        const response = await fetch(`/api/answers/${answerId}/adopt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionId: questionId,
          }),
        });
        
        if (response.ok) {
          onAdopt?.(answerId);
        }
      }
    } catch (error) {
      console.error('채택 처리 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 질문자가 아니면 버튼을 표시하지 않음
  if (!isQuestionAuthor) {
    return null;
  }

  return (
    <Button
      variant={isAccepted ? "default" : "outline"}
      size="sm"
      onClick={handleAdopt}
      disabled={loading}
      className={cn(
        "transition-all duration-200",
        isAccepted 
          ? "bg-green-500 hover:bg-green-600 text-white" 
          : "hover:bg-green-50 hover:border-green-300",
        className
      )}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isAccepted ? (
        <>
          <CheckCheck className="h-4 w-4 mr-1" />
          채택됨
        </>
      ) : (
        <>
          <Check className="h-4 w-4 mr-1" />
          채택하기
        </>
      )}
    </Button>
  );
}

/**
 * AdoptAnswerButtonCompact - 컴팩트한 채택 버튼
 */
export function AdoptAnswerButtonCompact({
  answerId,
  questionId,
  isAccepted,
  isQuestionAuthor,
  onAdopt,
  onUnadopt,
  className
}: AdoptAnswerButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleAdopt = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      if (isAccepted) {
        const response = await fetch(`/api/answers/${answerId}/adopt`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          onUnadopt?.(answerId);
        }
      } else {
        const response = await fetch(`/api/answers/${answerId}/adopt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionId: questionId,
          }),
        });
        
        if (response.ok) {
          onAdopt?.(answerId);
        }
      }
    } catch (error) {
      console.error('채택 처리 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isQuestionAuthor) {
    return null;
  }

  return (
    <button
      onClick={handleAdopt}
      disabled={loading}
      className={cn(
        "p-1 rounded-full transition-all duration-200",
        isAccepted 
          ? "bg-green-500 text-white hover:bg-green-600" 
          : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600",
        className
      )}
      title={isAccepted ? "채택 취소" : "채택하기"}
    >
      {loading ? (
        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isAccepted ? (
        <CheckCheck className="h-3 w-3" />
      ) : (
        <Check className="h-3 w-3" />
      )}
    </button>
  );
}
