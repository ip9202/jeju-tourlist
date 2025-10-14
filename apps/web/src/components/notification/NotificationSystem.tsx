"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { BadgeInfo, UserBadgeInfo } from "@/types/badge";
import { BadgeEarnedNotification, BadgeNotificationList } from "./BadgeEarnedNotification";
import { io, Socket } from "socket.io-client";

/**
 * 알림 관련 타입 정의
 */
interface NotificationData {
  badge: BadgeInfo;
  userBadge: UserBadgeInfo;
}

interface NotificationSettings {
  badgeEarned: boolean;
  progressUpdate: boolean;
  soundEnabled: boolean;
  duration: number;
}

interface NotificationContextType {
  notifications: NotificationData[];
  settings: NotificationSettings;
  addNotification: (notification: NotificationData) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  isConnected: boolean;
}

/**
 * NotificationContext - 알림 시스템 컨텍스트
 */
const NotificationContext = createContext<NotificationContextType | null>(null);

/**
 * NotificationProvider - 알림 시스템 프로바이더
 * 
 * @description
 * - 실시간 알림 관리
 * - Socket.io 연결 관리
 * - 알림 설정 관리
 * - 알림 히스토리 관리
 */
interface NotificationProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export function NotificationProvider({ children, userId }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    badgeEarned: true,
    progressUpdate: true,
    soundEnabled: true,
    duration: 5000,
  });

  // Socket.io 연결 설정
  useEffect(() => {
    if (!userId) return;

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('🔔 알림 소켓 연결됨');
      setIsConnected(true);
      
      // 사용자별 알림 룸 참여
      newSocket.emit('join-notification-room', userId);
    });

    newSocket.on('disconnect', () => {
      console.log('🔔 알림 소켓 연결 끊김');
      setIsConnected(false);
    });

    // 배지 획득 알림 수신
    newSocket.on('badge-earned', (data: NotificationData) => {
      console.log('🎉 배지 획득 알림 수신:', data);
      
      if (settings.badgeEarned) {
        addNotification(data);
        
        // 사운드 재생
        if (settings.soundEnabled) {
          playNotificationSound();
        }
      }
    });

    // 배지 진행률 업데이트 알림 수신
    newSocket.on('badge-progress-update', (data: {
      badgeId: string;
      progress: number;
      userId: string;
    }) => {
      console.log('📊 배지 진행률 업데이트:', data);
      
      if (settings.progressUpdate && data.progress >= 80) {
        // 80% 이상 달성 시 알림
        showProgressNotification(data);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId, settings.badgeEarned, settings.progressUpdate, settings.soundEnabled]);

  // 알림 추가
  const addNotification = useCallback((notification: NotificationData) => {
    setNotifications(prev => {
      // 중복 알림 방지
      const exists = prev.some(n => n.userBadge.id === notification.userBadge.id);
      if (exists) return prev;
      
      return [...prev, notification];
    });
  }, []);

  // 알림 제거
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.userBadge.id !== id));
  }, []);

  // 모든 알림 제거
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // 설정 업데이트
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // 로컬 스토리지에 저장
    localStorage.setItem('notification-settings', JSON.stringify({
      ...settings,
      ...newSettings
    }));
  }, [settings]);

  // 알림 사운드 재생
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // 사운드 재생 실패 시 무시
      });
    } catch (error) {
      console.log('사운드 재생 실패:', error);
    }
  };

  // 진행률 알림 표시
  const showProgressNotification = (data: {
    badgeId: string;
    progress: number;
    userId: string;
  }) => {
    // 진행률 알림은 별도 컴포넌트로 구현
    console.log('진행률 알림:', data);
  };

  // 로컬 스토리지에서 설정 로드
  useEffect(() => {
    const savedSettings = localStorage.getItem('notification-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('설정 로드 실패:', error);
      }
    }
  }, []);

  const contextValue: NotificationContextType = {
    notifications,
    settings,
    addNotification,
    removeNotification,
    clearAllNotifications,
    updateSettings,
    isConnected,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* 알림 표시 */}
      {notifications.length > 0 && (
        <BadgeNotificationList
          notifications={notifications}
          onCloseAll={clearAllNotifications}
        />
      )}
    </NotificationContext.Provider>
  );
}

/**
 * useNotification - 알림 시스템 훅
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

/**
 * NotificationSettings - 알림 설정 컴포넌트
 */
export function NotificationSettings() {
  const { settings, updateSettings, isConnected } = useNotification();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">배지 획득 알림</h3>
          <p className="text-xs text-gray-500">새로운 배지를 획득했을 때 알림</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.badgeEarned}
            onChange={(e) => updateSettings({ badgeEarned: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">진행률 알림</h3>
          <p className="text-xs text-gray-500">배지 진행률 80% 달성 시 알림</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.progressUpdate}
            onChange={(e) => updateSettings({ progressUpdate: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">알림 사운드</h3>
          <p className="text-xs text-gray-500">알림 시 사운드 재생</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">알림 지속 시간</h3>
          <p className="text-xs text-gray-500">알림이 표시되는 시간</p>
        </div>
        <select
          value={settings.duration}
          onChange={(e) => updateSettings({ duration: parseInt(e.target.value) })}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value={3000}>3초</option>
          <option value={5000}>5초</option>
          <option value={10000}>10초</option>
        </select>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span>{isConnected ? '실시간 연결됨' : '연결 끊김'}</span>
      </div>
    </div>
  );
}
