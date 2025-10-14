'use client';

import { useState, useEffect, useCallback } from 'react';
import { debounce } from '@/lib/debounce';

export type EmailCheckState = 'idle' | 'checking' | 'available' | 'unavailable' | 'error';

export function useEmailCheck() {
  const [state, setState] = useState<EmailCheckState>('idle');
  const [isLoading, setIsLoading] = useState(false);

  const checkEmail = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) {
      setState('idle');
      return;
    }

    setIsLoading(true);
    setState('checking');

    try {
      const response = await fetch(`http://localhost:4000/api/auth/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('🔍 [DEBUG] API 응답:', responseData);
        console.log('🔍 [DEBUG] data 객체:', responseData.data);
        console.log('🔍 [DEBUG] available 값:', responseData.data?.available);
        console.log('🔍 [DEBUG] 설정할 상태:', responseData.data?.available ? 'available' : 'unavailable');
        setState(responseData.data?.available ? 'available' : 'unavailable');
      } else {
        console.log('🔍 [DEBUG] API 에러 응답:', response.status, response.statusText);
        setState('error');
      }
    } catch (error) {
      console.error('이메일 중복체크 에러:', error);
      setState('error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 500ms 디바운스된 체크 함수
  const debouncedCheckEmail = useCallback(
    debounce((email: string) => {
      checkEmail(email);
    }, 500),
    [checkEmail]
  );

  const reset = useCallback(() => {
    setState('idle');
    setIsLoading(false);
  }, []);

  return {
    state,
    isLoading,
    available: state === 'available',
    unavailable: state === 'unavailable',
    checking: state === 'checking',
    error: state === 'error',
    checkEmail: debouncedCheckEmail,
    reset,
  };
}
