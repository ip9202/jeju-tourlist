/**
 * Organisms 컴포넌트 내보내기
 *
 * @description
 * - Atomic Design의 Organisms 레벨 컴포넌트들을 내보냄
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 각 컴포넌트는 독립적으로 사용 가능
 */

// 카드 컴포넌트들
export { UserCard, userCardVariants } from './UserCard';
export type { UserCardProps, UserData } from './UserCard';

export { QuestionCard, questionCardVariants } from './QuestionCard';
export type { QuestionCardProps, QuestionData } from './QuestionCard';

export { AnswerCard, answerCardVariants } from './AnswerCard';
export type { AnswerCardProps, AnswerData } from './AnswerCard';

// 폼 컴포넌트들
export { QuestionForm, questionFormVariants } from './QuestionForm';
export type { QuestionFormProps, QuestionFormData, QuestionFormErrors } from './QuestionForm';

export { AnswerForm, answerFormVariants } from './AnswerForm';
export type { AnswerFormProps, AnswerFormData, AnswerFormErrors } from './AnswerForm';

// 리스트 컴포넌트들
export { UserList, userListVariants } from './UserList';
export type { UserListProps, UserData as UserListUserData } from './UserList';

export { QuestionList, questionListVariants } from './QuestionList';
export type { QuestionListProps, QuestionData as QuestionListQuestionData } from './QuestionList';

export { AnswerList, answerListVariants } from './AnswerList';
export type { AnswerListProps, AnswerData as AnswerListAnswerData } from './AnswerList';

export { MessageList, messageListVariants } from './MessageList';
export type { MessageListProps, MessageData } from './MessageList';
