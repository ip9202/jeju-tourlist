/**
 * Facebook 스타일 Q&A 컴포넌트 타입 정의
 */

export type BadgeType = "accepted" | "expert" | "newbie";

export interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  createdAt?: string; // 계정 생성 날짜 (신입 판별용)
  badge?: BadgeType; // 사용자 배지 (전문가)
}

export interface Question {
  id: string;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt?: string;
  category?: string;
  images?: string[];
  likeCount: number;
  answerCount: number;
  viewCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  tags?: string[];
}

export interface Answer {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt?: string;
  parentId?: string; // 부모 답변 ID (중첩 댓글용)
  isNested?: boolean; // 중첩 댓글 여부
  likeCount: number;
  dislikeCount: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  badge?: BadgeType; // 채택됨, 전문가, 신입
  replyCount?: number; // 답글 개수
  isAccepted?: boolean; // 채택 여부
  imageUrl?: string; // 이미지 첨부 (옵션)
}

export interface FacebookQuestionCardProps {
  question: Question;
  onShare?: (questionId: string) => void;
  onBookmark?: (questionId: string, isBookmarked: boolean) => void;
  onLike?: (questionId: string, isLiked: boolean) => void;
  isLoading?: boolean;
}

/**
 * Props for FacebookAnswerCard component
 * 
 * @interface FacebookAnswerCardProps
 * @property {Answer} answer - The answer object to display
 * @property {boolean} [isNested=false] - Whether this is a nested reply
 * @property {number} [depth=0] - Nesting level (0: top-level, 1+: replies)
 * @property {Function} [onLike] - Callback when like button is clicked
 * @property {Function} [onDislike] - Callback when dislike button is clicked
 * @property {Function} [onReply] - Callback when reply button is clicked
 * @property {Function} [onMore] - Callback when more options button is clicked
 * @property {boolean} [isLoading=false] - Loading state
 * @property {User} [questionAuthor] - The question author (for adoption feature)
 * @property {User} [currentUser] - Current logged-in user
 * @property {Function} [onAdopt] - Callback when adopt button is clicked (Phase 4)
 * @property {Function} [onUnadopt] - Callback when unadopt button is clicked (Phase 4)
 */
export interface FacebookAnswerCardProps {
  answer: Answer;
  isNested?: boolean;
  depth?: number; // 중첩 레벨 (0: 최상위, 1+: 답글)
  onLike?: (answerId: string, isLiked: boolean) => void;
  onDislike?: (answerId: string, isDisliked: boolean) => void;
  onReply?: (answerId: string) => void;
  onMore?: (answerId: string) => void;
  isLoading?: boolean;
  // Phase 4: Adoption feature
  questionAuthor?: User;
  currentUser?: User;
  onAdopt?: (answerId: string) => void;
  onUnadopt?: (answerId: string) => void;
}

export interface FacebookAnswerInputProps {
  placeholder?: string;
  onSubmit: (content: string) => Promise<void>;
  user?: User;
  isLoading?: boolean;
  isReply?: boolean; // 답글 모드 여부
  parentAuthorName?: string; // 답글 대상 작성자명
  onCancel?: () => void;
}

export interface FacebookAnswerThreadProps {
  answers: Answer[];
  question: Question;
  currentUser?: User;
  onSubmitAnswer: (content: string, parentId?: string) => Promise<void>;
  onLike?: (answerId: string, isLiked: boolean) => void;
  onDislike?: (answerId: string, isDisliked: boolean) => void;
  onReply?: (answerId: string) => void;
  isLoading?: boolean;
  maxDepth?: number; // 최대 중첩 레벨 (기본값: 2)
}

export interface FacebookBadgeProps {
  type: BadgeType;
  size?: "sm" | "md" | "lg";
}
