'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // 알림 시뮬레이션을 위한 useEffect
  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      console.log('알림 수신:', event.detail);
      const notification = event.detail;
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    // 테스트용 알림 생성
    const testNotifications = [
      {
        id: 'test-notif-1',
        type: 'system',
        title: '테스트 알림',
        message: '알림 시스템이 정상 작동합니다.',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: 'test-notif-2',
        type: 'answer',
        title: '새로운 답변',
        message: '질문에 답변이 작성되었습니다.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        read: false
      }
    ];
    
    // 초기 알림 추가
    setNotifications(testNotifications);
    setUnreadCount(testNotifications.length);

    window.addEventListener('notification', handleNotification as EventListener);
    
    return () => {
      window.removeEventListener('notification', handleNotification as EventListener);
    };
  }, []);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'answer':
        return '💬';
      case 'accept':
        return '✅';
      case 'system':
        return '📢';
      default:
        return '📢';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className="relative" style={{ display: 'block', visibility: 'visible' }}>
      {/* 알림 벨 버튼 */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        data-testid="notification-bell"
        style={{ 
          display: 'block !important', 
          visibility: 'visible !important',
          opacity: '1 !important',
          position: 'relative !important'
        }}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            data-testid="notification-badge"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* 알림 드롭다운 */}
      {isOpen && (
        <div
          data-testid="notification-dropdown"
          className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
        >
          {/* 헤더 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">알림</h3>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                    data-testid="mark-all-read-button"
                  >
                    모두 읽음
                  </button>
                )}
                <button
                  onClick={handleClearAll}
                  className="text-sm text-gray-500 hover:text-gray-700"
                  data-testid="clear-all-button"
                >
                  전체 삭제
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                  data-testid="close-notifications-button"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500" data-testid="no-notifications">
                알림이 없습니다
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  data-testid="notification-item"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    <div className="ml-3 flex-grow">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full ml-2 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
