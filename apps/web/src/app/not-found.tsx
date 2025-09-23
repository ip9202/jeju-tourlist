'use client';

import Link from 'next/link';
import { Button, Heading, Text } from '@jeju-tourlist/ui';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        {/* 404 아이콘 */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-6xl font-bold text-indigo-600">404</span>
          </div>
        </div>

        {/* 에러 메시지 */}
        <Heading level={1} className="text-3xl font-bold text-gray-900 mb-4">
          페이지를 찾을 수 없습니다
        </Heading>
        
        <Text className="text-gray-600 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </Text>

        {/* 액션 버튼들 */}
        <div className="space-y-4">
          <Link href="/">
            <Button 
              className="w-full"
              data-testid="go-home-button"
            >
              <Home className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </Link>
          
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전 페이지로
          </Button>
        </div>

        {/* 도움말 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <Text className="text-sm text-blue-800">
            문제가 지속되면 고객센터로 문의해주세요.
          </Text>
        </div>
      </div>
    </div>
  );
}
