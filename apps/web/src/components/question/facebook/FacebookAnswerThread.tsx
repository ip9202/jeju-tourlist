// @CODE:ANSWER-INTERACTION-001-FACEBOOK-THREAD
// @SPEC:SPEC-ANSWER-INTERACTION-001-PHASE7
// Facebook-style answer thread with nested replies and badge-based sorting

import React, { useState, useMemo, useCallback } from "react";
import { FacebookAnswerThreadProps, Answer } from "./types";
import { sortByBadgePriority } from "./utils";
import FacebookAnswerInput from "./FacebookAnswerInput";
import FacebookAnswerCard from "./FacebookAnswerCard";
import { ChevronDown, ChevronUp } from "lucide-react";

export const FacebookAnswerThread: React.FC<FacebookAnswerThreadProps> = ({
  answers,
  question,
  currentUser,
  onSubmitAnswer,
  onLike,
  onDislike,
  onAdopt,
  onUnadopt,
  onReply,
  isLoading = false,
  maxDepth = 2,
}) => {
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );

  // 최상위 답변과 중첩 답변 분리 + 배지 우선순위로 정렬
  const { topLevelAnswers, answerMap } = useMemo(() => {
    const map = new Map<string, Answer[]>();
    const topLevel: Answer[] = [];

    answers.forEach(answer => {
      if (!answer.parentId) {
        topLevel.push(answer);
      } else if (answer.parentId) {
        if (!map.has(answer.parentId)) {
          map.set(answer.parentId, []);
        }
        const replies = map.get(answer.parentId);
        if (replies) {
          replies.push(answer);
        }
      }
    });

    // 배지 우선순위로 정렬 (채택됨 > 전문가 > 신입)
    const sortedTopLevel = sortByBadgePriority(topLevel);

    return { topLevelAnswers: sortedTopLevel, answerMap: map };
  }, [answers]);

  const handleSubmitAnswer = useCallback(
    async (content: string) => {
      try {
        await onSubmitAnswer(content, replyingToId || undefined);
        setReplyingToId(null);
      } catch (error) {
        console.error("Failed to submit answer:", error);
      }
    },
    [replyingToId, onSubmitAnswer]
  );

  const handleReply = useCallback(
    (answerId: string) => {
      setReplyingToId(answerId);
      if (onReply) {
        onReply(answerId);
      }
    },
    [onReply]
  );

  const toggleExpandReplies = useCallback((answerId: string) => {
    setExpandedReplies(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(answerId)) {
        newExpanded.delete(answerId);
      } else {
        newExpanded.add(answerId);
      }
      return newExpanded;
    });
  }, []);

  const renderAnswer = (answer: Answer, depth: number = 0): React.ReactNode => {
    const replies = answerMap.get(answer.id) || [];
    const isReply = replyingToId === answer.id;
    const isExpanded = expandedReplies.has(answer.id);
    const canShowReplies = depth < maxDepth && replies.length > 0;

    return (
      <div key={answer.id}>
        {/* Answer Card */}
        <FacebookAnswerCard
          answer={{ ...answer, replyCount: replies.length }}
          isNested={depth > 0}
          depth={depth}
          currentUser={currentUser}
          questionAuthor={question.author}
          onLike={onLike}
          onDislike={onDislike}
          onAdopt={onAdopt}
          onUnadopt={onUnadopt}
          onReply={handleReply}
          isLoading={isLoading}
        />

        {/* Reply Input - Placed right after answer card with cascade indentation */}
        {isReply && (
          <div className="ml-10 mt-2 md:ml-8 md:mt-1.5 sm:ml-6 sm:mt-1">
            <FacebookAnswerInput
              placeholder={`${answer.author.name}님에게 답글...`}
              onSubmit={handleSubmitAnswer}
              user={currentUser}
              isLoading={isLoading}
              isReply={true}
              parentAuthorName={answer.author.name}
              onCancel={() => setReplyingToId(null)}
            />
          </div>
        )}

        {/* Replies */}
        {canShowReplies && (
          <div className="ml-10 mt-2 space-y-2 md:ml-8 md:mt-1.5 sm:ml-6 sm:mt-1">
            {replies.length > 0 && (
              <>
                <button
                  onClick={() => toggleExpandReplies(answer.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  답글 {replies.length}개 {isExpanded ? "숨기기" : "보기"}
                </button>

                {isExpanded && (
                  <div className="space-y-2">
                    {replies.map(reply => renderAnswer(reply, depth + 1))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-3 sm:space-y-2">
      {/* Input */}
      <FacebookAnswerInput
        placeholder="댓글을 작성해주세요..."
        onSubmit={handleSubmitAnswer}
        user={currentUser}
        isLoading={isLoading}
      />

      {/* Answers */}
      {topLevelAnswers.length > 0 ? (
        <div className="border-t border-gray-200 pt-4 md:pt-3 sm:pt-2">
          {topLevelAnswers.map(answer => renderAnswer(answer, 0))}
        </div>
      ) : (
        <div className="text-center py-8 md:py-6 sm:py-4">
          <p className="text-gray-500 text-sm md:text-sm sm:text-xs">
            아직 답변이 없습니다.
          </p>
          <p className="text-gray-400 text-xs mt-1 md:text-xs sm:text-xs md:mt-0.5 sm:mt-0.5">
            가장 먼저 답변을 작성해보세요!
          </p>
        </div>
      )}
    </div>
  );
};

export default FacebookAnswerThread;
