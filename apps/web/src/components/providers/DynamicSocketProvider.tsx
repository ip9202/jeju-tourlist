"use client";

import { ReactNode, useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface DynamicSocketProviderProps {
  children: ReactNode;
  socketUrl?: string;
  autoConnect?: boolean;
}

export function DynamicSocketProvider({
  children,
  socketUrl = "http://localhost:4000",
  autoConnect = true
}: DynamicSocketProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <LoadingSpinner size="sm" />;
  }

  // 클라이언트에서만 SocketProvider 로드
  const { SocketProvider } = require('@/contexts/SocketContext');

  return (
    <SocketProvider socketUrl={socketUrl} autoConnect={autoConnect}>
      {children}
    </SocketProvider>
  );
}