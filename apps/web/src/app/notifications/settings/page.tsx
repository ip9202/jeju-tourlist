'use client';

import React, { useState } from 'react';
import { Button, Heading, Text, Switch } from '@jeju-tourlist/ui';
import { ArrowLeft, Bell, Mail, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    questionAnswers: true,
    questionLikes: true,
    questionComments: false,
    systemUpdates: true,
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // TODO: 실제 API 호출
    console.log('설정 저장:', settings);
    alert('설정이 저장되었습니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Heading level={1} className="text-2xl font-bold text-gray-900">
            알림 설정
          </Heading>
          <div></div> {/* Space for alignment */}
        </div>

        {/* 설명 */}
        <div className="mb-8 text-center">
          <Text className="text-gray-600 mt-2">
            받고 싶은 알림을 선택해주세요.
          </Text>
        </div>

        {/* 알림 설정 폼 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            {/* 이메일 알림 */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center mb-4">
                <Mail className="w-5 h-5 text-gray-600 mr-3" />
                <Heading level={2} className="text-lg font-semibold text-gray-900">
                  이메일 알림
                </Heading>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="font-medium text-gray-900">이메일 알림 받기</Text>
                    <Text className="text-sm text-gray-500">새로운 답변과 좋아요를 이메일로 받습니다</Text>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
              </div>
            </div>

            {/* 푸시 알림 */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center mb-4">
                <Smartphone className="w-5 h-5 text-gray-600 mr-3" />
                <Heading level={2} className="text-lg font-semibold text-gray-900">
                  푸시 알림
                </Heading>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="font-medium text-gray-900">푸시 알림 받기</Text>
                    <Text className="text-sm text-gray-500">브라우저에서 푸시 알림을 받습니다</Text>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>
              </div>
            </div>

            {/* 알림 유형 */}
            <div>
              <div className="flex items-center mb-4">
                <Bell className="w-5 h-5 text-gray-600 mr-3" />
                <Heading level={2} className="text-lg font-semibold text-gray-900">
                  알림 유형
                </Heading>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="font-medium text-gray-900">질문에 대한 답변</Text>
                    <Text className="text-sm text-gray-500">내 질문에 답변이 달렸을 때</Text>
                  </div>
                  <Switch
                    checked={settings.questionAnswers}
                    onCheckedChange={(checked) => handleSettingChange('questionAnswers', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="font-medium text-gray-900">질문에 대한 좋아요</Text>
                    <Text className="text-sm text-gray-500">내 질문에 좋아요가 달렸을 때</Text>
                  </div>
                  <Switch
                    checked={settings.questionLikes}
                    onCheckedChange={(checked) => handleSettingChange('questionLikes', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="font-medium text-gray-900">질문에 대한 댓글</Text>
                    <Text className="text-sm text-gray-500">내 질문에 댓글이 달렸을 때</Text>
                  </div>
                  <Switch
                    checked={settings.questionComments}
                    onCheckedChange={(checked) => handleSettingChange('questionComments', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="font-medium text-gray-900">시스템 업데이트</Text>
                    <Text className="text-sm text-gray-500">서비스 점검 및 업데이트 공지</Text>
                  </div>
                  <Switch
                    checked={settings.systemUpdates}
                    onCheckedChange={(checked) => handleSettingChange('systemUpdates', checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end mt-8">
            <Button onClick={handleSave} data-testid="save-settings">
              설정 저장
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}