import { z } from "zod";

// 알림 생성 스키마
export const CreateNotificationSchema = z.object({
  userId: z.string().cuid(),
  type: z.enum([
    "QUESTION_ANSWERED",
    "ANSWER_LIKED",
    "ANSWER_ACCEPTED",
    "QUESTION_BOOKMARKED",
    "BADGE_EARNED",
    "SYSTEM_ANNOUNCEMENT",
  ]),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  data: z.record(z.string(), z.any()).optional(),
});

export type CreateNotificationData = z.infer<typeof CreateNotificationSchema>;

// 알림 업데이트 스키마
export const UpdateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
});

export type UpdateNotificationData = z.infer<typeof UpdateNotificationSchema>;

// 알림 검색 옵션
export interface NotificationSearchOptions {
  userId?: string;
  type?:
    | "QUESTION_ANSWERED"
    | "ANSWER_LIKED"
    | "ANSWER_ACCEPTED"
    | "QUESTION_BOOKMARKED"
    | "BADGE_EARNED"
    | "SYSTEM_ANNOUNCEMENT";
  isRead?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: "createdAt" | "isRead";
  sortOrder?: "asc" | "desc";
  pagination?: {
    page: number;
    limit: number;
  };
}

// 알림 통계
export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  readNotifications: number;
  notificationsByType: Record<string, number>;
  averageReadTime?: number; // 평균 읽기 시간 (분)
}

// 알림 목록 아이템
export interface NotificationListItem {
  id: string;
  type:
    | "QUESTION_ANSWERED"
    | "ANSWER_LIKED"
    | "ANSWER_ACCEPTED"
    | "QUESTION_BOOKMARKED"
    | "BADGE_EARNED"
    | "SYSTEM_ANNOUNCEMENT";
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

// 알림 설정 스키마
export const NotificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  questionAnswered: z.boolean(),
  answerLiked: z.boolean(),
  answerAccepted: z.boolean(),
  questionBookmarked: z.boolean(),
  badgeEarned: z.boolean(),
  systemAnnouncement: z.boolean(),
});

export type NotificationSettingsData = z.infer<
  typeof NotificationSettingsSchema
>;
