'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function TestLoginPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: 'playwright@test.com',
        password: 'password123!',
        redirect: false,
      });
      console.log('로그인 결과:', result);
    } catch (error) {
      console.error('로그인 에러:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">로그인 테스트 페이지</h1>
      
      <div className="space-y-4">
        <div>
          <strong>세션 상태:</strong> {status}
        </div>
        
        <div>
          <strong>세션 데이터:</strong>
          <pre className="bg-gray-100 p-2 rounded mt-2">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
        
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '로그인 중...' : '로그인 테스트'}
        </button>
      </div>
    </div>
  );
}
