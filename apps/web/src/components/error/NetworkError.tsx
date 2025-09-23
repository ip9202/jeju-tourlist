'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@jeju-tourlist/ui';

interface NetworkErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ 
  message = '서버 오류가 발생했습니다', 
  onRetry 
}) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4" data-testid="network-error">
      <div className="flex items-center">
        <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {message}
          </h3>
          <p className="text-sm text-red-600 mt-1">
            잠시 후 다시 시도해주세요.
          </p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-3"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
        )}
      </div>
    </div>
  );
};
