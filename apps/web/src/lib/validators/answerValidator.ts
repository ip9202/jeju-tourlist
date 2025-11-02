// @CODE:ANSWER-VALIDATOR-VALID-001
// @CODE:ANSWER-VALIDATOR-REQUIRED-001
// @CODE:ANSWER-VALIDATOR-DEFAULTS-001
// @CODE:ANSWER-VALIDATOR-NULLABLE-001

/**
 * Validated Answer Interface
 *
 * Represents a fully validated answer/comment with guaranteed type safety
 */
export interface ValidatedAnswer {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    nickname: string;
    avatar: string | null;
  };
  createdAt: Date;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  isAccepted: boolean;
  isLiked: boolean;
  isDisliked: boolean;
  isAuthor: boolean;
  isQuestionAuthor: boolean;
  parentId?: string | null;
  replyCount: number;
}

/**
 * Validate and normalize answer data from API
 *
 * This function ensures:
 * 1. All required fields are present
 * 2. Boolean fields have explicit values (not undefined)
 * 3. Numeric fields have default values
 * 4. Nullable fields are safely handled
 *
 * @param rawAnswer - Raw answer data from API
 * @returns Validated and normalized answer object
 * @throws Error if required fields are missing
 */
export function validateAnswerData(rawAnswer: any): ValidatedAnswer {
  // @CODE:ANSWER-VALIDATOR-REQUIRED-001
  // Validate required fields
  if (!rawAnswer.id) {
    throw new Error("Answer ID is required");
  }

  if (!rawAnswer.content) {
    throw new Error("Answer content is required");
  }

  if (!rawAnswer.author) {
    throw new Error("Answer author is required");
  }

  if (!rawAnswer.createdAt) {
    throw new Error("Answer createdAt is required");
  }

  // @CODE:ANSWER-VALIDATOR-DEFAULTS-001
  // @CODE:ANSWER-VALIDATOR-NULLABLE-001
  // Normalize with default values and null coalescing
  const validated: ValidatedAnswer = {
    id: rawAnswer.id,
    content: rawAnswer.content,
    author: {
      id: rawAnswer.author.id,
      name: rawAnswer.author.name,
      nickname: rawAnswer.author.nickname,
      avatar: rawAnswer.author.avatar ?? null,
    },
    createdAt:
      rawAnswer.createdAt instanceof Date
        ? rawAnswer.createdAt
        : new Date(rawAnswer.createdAt),
    likeCount: rawAnswer.likeCount ?? 0,
    dislikeCount: rawAnswer.dislikeCount ?? 0,
    commentCount: rawAnswer.commentCount ?? 0,
    isAccepted: rawAnswer.isAccepted ?? false,
    isLiked: rawAnswer.isLiked ?? false,
    isDisliked: rawAnswer.isDisliked ?? false,
    isAuthor: rawAnswer.isAuthor ?? false,
    isQuestionAuthor: rawAnswer.isQuestionAuthor ?? false,
    replyCount: rawAnswer.replyCount ?? 0,
  };

  // Preserve parentId (undefined for top-level answers, string for comments)
  if (rawAnswer.parentId !== undefined) {
    validated.parentId = rawAnswer.parentId;
  }

  return validated;
}

/**
 * Filter top-level answers (exclude comments with parentId)
 *
 * @param answers - Array of validated answers
 * @returns Array of top-level answers only
 */
export function filterTopLevelAnswers(
  answers: ValidatedAnswer[]
): ValidatedAnswer[] {
  return answers.filter(answer => !answer.parentId || answer.parentId === null);
}

/**
 * Filter comments for a specific answer
 *
 * @param answers - Array of validated answers
 * @param answerId - Parent answer ID
 * @returns Array of comments for the specified answer
 */
export function filterCommentsByAnswerId(
  answers: ValidatedAnswer[],
  answerId: string
): ValidatedAnswer[] {
  return answers.filter(answer => answer.parentId === answerId);
}
