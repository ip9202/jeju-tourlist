/**
 * Atoms 컴포넌트 내보내기
 * 
 * @description
 * - Atomic Design의 Atoms 레벨 컴포넌트들을 내보냄
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 각 컴포넌트는 독립적으로 사용 가능
 */

// 기본 컴포넌트들
export { Button, buttonVariants } from './Button';
export type { ButtonProps } from './Button';

export { Input, inputVariants } from './Input';
export type { InputProps } from './Input';

export { Avatar, avatarVariants, avatarBadgeVariants } from './Avatar';
export type { AvatarProps } from './Avatar';

export { Icon, iconVariants } from './Icon';
export type { IconProps, IconName } from './Icon';

// 타이포그래피 컴포넌트들
export { Text, textVariants } from './Text';
export type { TextProps } from './Text';

export { Heading, headingVariants } from './Heading';
export type { HeadingProps } from './Heading';

export { Link, linkVariants } from './Link';
export type { LinkProps } from './Link';

export { Code, codeVariants } from './Code';
export type { CodeProps } from './Code';

// 폼 컴포넌트들
export { Label, labelVariants } from './Label';
export type { LabelProps } from './Label';

export { Select, selectVariants } from './Select';
export type { SelectProps, SelectOption } from './Select';

export { Checkbox, checkboxVariants } from './Checkbox';
export type { CheckboxProps } from './Checkbox';

export { RadioGroup, radioGroupVariants, radioVariants } from './RadioGroup';
export type { RadioGroupProps, RadioOption } from './RadioGroup';

export { Textarea, textareaVariants } from './Textarea';
export type { TextareaProps } from './Textarea';

export { Badge, badgeVariants } from './Badge';
export type { BadgeProps } from './Badge';

export { Switch, switchVariants } from './Switch';
export type { SwitchProps } from './Switch';
