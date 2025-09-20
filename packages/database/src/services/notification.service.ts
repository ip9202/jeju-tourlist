/**
 * 알림 서비스
 * 
 * @description
 * - 다채널 알림 시스템 관리
 * - 알림 개인화 및 설정 관리
 * - 실시간 알림 전송 및 큐 관리
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { PrismaClient, NotificationType, User, Notification } from '@prisma/client';
import { BaseService } from './base.service';

/**
 * 알림 생성 데이터
 */
export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels?: NotificationChannel[];
}

/**
 * 알림 채널 타입
 */
export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms';

/**
 * 알림 설정 데이터
 */
export interface NotificationSettings {
  userId: string;
  channels: {
    in_app: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  types: {
    [key in NotificationType]: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM 형식
    end: string;   // HH:MM 형식
  };
  frequency: {
    email: 'instant' | 'hourly' | 'daily' | 'weekly';
    push: 'instant' | 'hourly' | 'daily';
  };
}

/**
 * 알림 전송 결과
 */
export interface NotificationSendResult {
  success: boolean;
  channel: NotificationChannel;
  messageId?: string;
  error?: string;
}

/**
 * 알림 통계 데이터
 */
export interface NotificationStats {
  total: number;
  unread: number;
  byType: Array<{
    type: NotificationType;
    count: number;
  }>;
  byChannel: Array<{
    channel: NotificationChannel;
    count: number;
  }>;
  recentActivity: Array<{
    type: NotificationType;
    title: string;
    createdAt: Date;
    isRead: boolean;
  }>;
}

/**
 * 알림 서비스
 * 
 * @description
 * - 알림 관련 모든 비즈니스 로직 처리
 * - 다채널 알림 전송 및 관리
 * - 알림 설정 및 개인화 관리
 */
export class NotificationService extends BaseService {
  /**
   * 알림 생성 및 전송
   * 
   * @description
   * - 새로운 알림 생성
   * - 사용자 설정에 따른 채널 선택
   * - 실시간 전송 및 큐 관리
   * 
   * @param data - 알림 생성 데이터
   * @returns 생성된 알림
   */
  async createNotification(data: CreateNotificationData) {
    return await this.prisma.$transaction(async (tx) => {
      // 알림 생성
      const notification = await tx.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data,
        },
      });

      // 사용자 알림 설정 조회
      const settings = await this.getUserNotificationSettings(data.userId);

      // 선택된 채널에 따라 전송
      const channels = data.channels || this.selectChannels(data.type, settings);
      const sendResults = await this.sendToChannels(notification, channels, settings);

      return {
        notification,
        sendResults,
      };
    });
  }

  /**
   * 사용자 알림 목록 조회
   * 
   * @description
   * - 사용자별 알림 목록 조회
   * - 읽음/읽지 않음 필터링
   * - 페이지네이션 지원
   * 
   * @param userId - 사용자 ID
   * @param options - 조회 옵션
   * @returns 알림 목록
   */
  async getUserNotifications(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      isRead?: boolean;
      type?: NotificationType;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    const {
      page = 1,
      limit = 20,
      isRead,
      type,
      startDate,
      endDate,
    } = options;

    const where: any = { userId };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 알림 읽음 처리
   * 
   * @description
   * - 특정 알림을 읽음으로 표시
   * - 읽음 시간 기록
   * 
   * @param notificationId - 알림 ID
   * @param userId - 사용자 ID
   * @returns 업데이트된 알림
   */
  async markAsRead(notificationId: string, userId: string) {
    return await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * 모든 알림 읽음 처리
   * 
   * @description
   * - 사용자의 모든 미읽음 알림을 읽음으로 표시
   * 
   * @param userId - 사용자 ID
   * @returns 업데이트된 알림 수
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * 알림 삭제
   * 
   * @description
   * - 특정 알림 삭제
   * - 사용자 본인의 알림만 삭제 가능
   * 
   * @param notificationId - 알림 ID
   * @param userId - 사용자 ID
   * @returns 삭제 결과
   */
  async deleteNotification(notificationId: string, userId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });

    return result.count > 0;
  }

  /**
   * 사용자 알림 설정 조회
   * 
   * @description
   * - 사용자의 알림 설정 조회
   * - 기본값 제공
   * 
   * @param userId - 사용자 ID
   * @returns 알림 설정
   */
  async getUserNotificationSettings(userId: string): Promise<NotificationSettings> {
    // 실제 구현에서는 별도 설정 테이블 사용
    // 현재는 기본값 반환
    return {
      userId,
      channels: {
        in_app: true,
        email: true,
        push: true,
        sms: false,
      },
      types: {
        QUESTION_ANSWERED: true,
        ANSWER_LIKED: true,
        ANSWER_ACCEPTED: true,
        QUESTION_BOOKMARKED: false,
        BADGE_EARNED: true,
        SYSTEM_ANNOUNCEMENT: true,
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
      frequency: {
        email: 'instant',
        push: 'instant',
      },
    };
  }

  /**
   * 사용자 알림 설정 업데이트
   * 
   * @description
   * - 사용자의 알림 설정 변경
   * - 채널별, 타입별 설정 관리
   * 
   * @param userId - 사용자 ID
   * @param settings - 새로운 설정
   * @returns 업데이트된 설정
   */
  async updateUserNotificationSettings(
    userId: string,
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    // 실제 구현에서는 별도 설정 테이블 사용
    // 현재는 메모리에 저장 (실제로는 데이터베이스에 저장)
    console.log(`사용자 ${userId}의 알림 설정 업데이트:`, settings);
    
    const currentSettings = await this.getUserNotificationSettings(userId);
    const updatedSettings = { ...currentSettings, ...settings };
    
    return updatedSettings;
  }

  /**
   * 알림 통계 조회
   * 
   * @description
   * - 사용자별 알림 통계
   * - 타입별, 채널별 분포
   * - 최근 활동 현황
   * 
   * @param userId - 사용자 ID
   * @param period - 조회 기간 (일)
   * @returns 알림 통계
   */
  async getNotificationStats(userId: string, period: number = 30): Promise<NotificationStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const [
      total,
      unread,
      byType,
      byChannel,
      recentActivity,
    ] = await Promise.all([
      // 전체 알림 수
      this.prisma.notification.count({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
      }),
      
      // 미읽음 알림 수
      this.prisma.notification.count({
        where: {
          userId,
          isRead: false,
          createdAt: { gte: startDate },
        },
      }),
      
      // 타입별 통계
      this.prisma.notification.groupBy({
        by: ['type'],
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        _count: { id: true },
      }),
      
      // 채널별 통계 (실제 구현에서는 별도 테이블 필요)
      [],
      
      // 최근 활동
      this.prisma.notification.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        select: {
          type: true,
          title: true,
          createdAt: true,
          isRead: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      total,
      unread,
      byType: byType.map(item => ({
        type: item.type,
        count: item._count.id,
      })),
      byChannel: [], // 실제 구현 필요
      recentActivity: recentActivity.map(item => ({
        type: item.type,
        title: item.title,
        createdAt: item.createdAt,
        isRead: item.isRead,
      })),
    };
  }

  /**
   * 채널 선택 로직
   * 
   * @description
   * - 알림 타입과 사용자 설정에 따른 채널 선택
   * - 우선순위 기반 채널 선택
   * 
   * @param type - 알림 타입
   * @param settings - 사용자 설정
   * @returns 선택된 채널 목록
   */
  private selectChannels(
    type: NotificationType,
    settings: NotificationSettings
  ): NotificationChannel[] {
    const channels: NotificationChannel[] = [];

    // 인앱 알림은 항상 활성화
    if (settings.channels.in_app) {
      channels.push('in_app');
    }

    // 이메일 알림 (중요한 알림만)
    if (settings.channels.email && settings.types[type]) {
      const emailTypes: NotificationType[] = [
        'QUESTION_ANSWERED',
        'ANSWER_ACCEPTED',
        'BADGE_EARNED',
        'SYSTEM_ANNOUNCEMENT',
      ];
      
      if (emailTypes.includes(type)) {
        channels.push('email');
      }
    }

    // 푸시 알림
    if (settings.channels.push && settings.types[type]) {
      channels.push('push');
    }

    // SMS 알림 (긴급한 알림만)
    if (settings.channels.sms) {
      const smsTypes: NotificationType[] = [
        'SYSTEM_ANNOUNCEMENT',
      ];
      
      if (smsTypes.includes(type)) {
        channels.push('sms');
      }
    }

    return channels;
  }

  /**
   * 채널별 알림 전송
   * 
   * @description
   * - 선택된 채널에 알림 전송
   * - 채널별 전송 로직 구현
   * 
   * @param notification - 알림 정보
   * @param channels - 전송할 채널 목록
   * @param settings - 사용자 설정
   * @returns 전송 결과
   */
  private async sendToChannels(
    notification: Notification,
    channels: NotificationChannel[],
    settings: NotificationSettings
  ): Promise<NotificationSendResult[]> {
    const results: NotificationSendResult[] = [];

    for (const channel of channels) {
      try {
        const result = await this.sendToChannel(notification, channel, settings);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          channel,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * 개별 채널 알림 전송
   * 
   * @description
   * - 특정 채널로 알림 전송
   * - 채널별 구현 로직
   * 
   * @param notification - 알림 정보
   * @param channel - 전송 채널
   * @param settings - 사용자 설정
   * @returns 전송 결과
   */
  private async sendToChannel(
    notification: Notification,
    channel: NotificationChannel,
    settings: NotificationSettings
  ): Promise<NotificationSendResult> {
    switch (channel) {
      case 'in_app':
        // 인앱 알림은 이미 데이터베이스에 저장됨
        return {
          success: true,
          channel,
          messageId: notification.id,
        };

      case 'email':
        // 이메일 전송 로직 (실제 구현 필요)
        console.log(`이메일 전송: ${notification.title}`);
        return {
          success: true,
          channel,
          messageId: `email_${notification.id}`,
        };

      case 'push':
        // 푸시 알림 전송 로직 (실제 구현 필요)
        console.log(`푸시 전송: ${notification.title}`);
        return {
          success: true,
          channel,
          messageId: `push_${notification.id}`,
        };

      case 'sms':
        // SMS 전송 로직 (실제 구현 필요)
        console.log(`SMS 전송: ${notification.title}`);
        return {
          success: true,
          channel,
          messageId: `sms_${notification.id}`,
        };

      default:
        return {
          success: false,
          channel,
          error: 'Unknown channel',
        };
    }
  }

  /**
   * 알림 템플릿 생성
   * 
   * @description
   * - 알림 타입별 템플릿 생성
   * - 개인화된 메시지 생성
   * 
   * @param type - 알림 타입
   * @param data - 알림 데이터
   * @returns 알림 템플릿
   */
  async createNotificationTemplate(
    type: NotificationType,
    data: Record<string, any>
  ): Promise<{ title: string; message: string }> {
    switch (type) {
      case 'QUESTION_ANSWERED':
        return {
          title: '새로운 답변이 등록되었습니다',
          message: `"${data.questionTitle}"에 새로운 답변이 등록되었습니다.`,
        };

      case 'ANSWER_LIKED':
        return {
          title: '답변에 좋아요를 받았습니다',
          message: `"${data.answerContent}"에 좋아요를 받았습니다.`,
        };

      case 'ANSWER_ACCEPTED':
        return {
          title: '답변이 채택되었습니다',
          message: `"${data.questionTitle}"에 대한 답변이 채택되었습니다!`,
        };

      case 'QUESTION_BOOKMARKED':
        return {
          title: '질문이 북마크되었습니다',
          message: `"${data.questionTitle}"이 북마크되었습니다.`,
        };

      case 'BADGE_EARNED':
        return {
          title: '새로운 배지를 획득했습니다',
          message: `"${data.badgeName}" 배지를 획득했습니다!`,
        };

      case 'SYSTEM_ANNOUNCEMENT':
        return {
          title: data.title || '시스템 공지사항',
          message: data.message || '새로운 공지사항이 있습니다.',
        };

      default:
        return {
          title: '알림',
          message: '새로운 알림이 있습니다.',
        };
    }
  }

  /**
   * 알림 정리 작업
   * 
   * @description
   * - 오래된 알림 정리
   * - 읽은 알림 자동 삭제
   * - 배치 작업용
   * 
   * @param days - 보관 기간 (일)
   * @returns 정리된 알림 수
   */
  async cleanupNotifications(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.prisma.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: { lt: cutoffDate },
      },
    });

    return result.count;
  }
}
