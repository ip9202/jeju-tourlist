"use client";

import React, { useState, useMemo } from "react";
import { FacebookAnswerThreadProps, Answer } from "./types";
import FacebookAnswerInput from "./FacebookAnswerInput";
import FacebookAnswerCard from "./FacebookAnswerCard";

export const FacebookAnswerThread: React.FC<FacebookAnswerThreadProps> = ({
  answers,
  question: _question,
  currentUser,
  onSubmitAnswer,
  onLike,
  onDislike,
  onReply,
  isLoading = false,
  maxDepth = 2,
}) => {
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );

  // 최상위 답변과 중첩 답변 분리
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

    return { topLevelAnswers: topLevel, answerMap: map };
  }, [answers]);

  const handleSubmitAnswer = async (content: string) => {
    try {
      await onSubmitAnswer(content, replyingToId || undefined);
      setReplyingToId(null);
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const handleReply = (answerId: string) => {
    setReplyingToId(answerId);
    if (onReply) {
      onReply(answerId);
    }
  };

  const toggleExpandReplies = (answerId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(answerId)) {
      newExpanded.delete(answerId);
    } else {
      newExpanded.add(answerId);
    }
    setExpandedReplies(newExpanded);
  };

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
          onLike={onLike}
          onDislike={onDislike}
          onReply={handleReply}
          isLoading={isLoading}
        />

        {/* Reply Input */}
        {isReply && (
          <div className="ml-10 mt-2">
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
          <div className="mt-2">
            {!isExpanded && replies.length > 0 && (
              <button
                onClick={() => toggleExpandReplies(answer.id)}
                className="ml-10 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                답글 {replies.length}개 보기
              </button>
            )}

            {isExpanded && replies.length > 0 && (
              <div className="ml-10 mt-2 space-y-0">
                {replies.map(reply => renderAnswer(reply, depth + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <FacebookAnswerInput
        placeholder="댓글을 작성해주세요..."
        onSubmit={handleSubmitAnswer}
        user={currentUser}
        isLoading={isLoading}
      />

      {/* Answers */}
      {topLevelAnswers.length > 0 ? (
        <div className="border-t border-gray-200 pt-4">
          {topLevelAnswers.map(answer => renderAnswer(answer, 0))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">아직 답변이 없습니다.</p>
          <p className="text-gray-400 text-xs mt-1">
            가장 먼저 답변을 작성해보세요!
          </p>
        </div>
      )}
    </div>
  );
};

export default FacebookAnswerThread;
