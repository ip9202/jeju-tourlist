// 배지 시스템 컴포넌트 내보내기
export { BadgeIcon, BadgeIconSmall, BadgeIconMedium, BadgeIconLarge, BadgeIconExtraLarge } from './BadgeIcon';
export { BadgeTooltip } from './BadgeTooltip';
export { BadgeProgress, BadgeProgressCompact, BadgeProgressList } from './BadgeProgress';
export { BadgeCard, BadgeCardCompact } from './BadgeCard';
export { BadgeCollection, BadgeCollectionGrid, BadgeCollectionList } from './BadgeCollection';

// 타입 내보내기
export type { 
  BadgeInfo, 
  UserBadgeInfo, 
  BadgeProgress as BadgeProgressType,
  BadgeType,
  BadgeRarity,
  BadgeIconProps,
  BadgeCardProps,
  BadgeProgressProps,
  BadgeCollectionProps,
  BadgeTooltipProps
} from '@/types/badge';
