/**
 * 에러 처리 강화 컴포넌트들
 * 
 * @description
 * - 전문가 대시보드의 에러 처리를 강화하기 위한 컴포넌트들
 * - 에러 바운더리, 폴백 UI, 에러 복구 메커니즘 구현
 * - 사용자 친화적인 에러 메시지 및 복구 옵션 제공
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

"use client";

import React, { Component, ErrorInfo, ReactNode, useState, useEffect, useCallback } from "react";
import { Expert } from "@/types/expert";
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  ArrowLeft,
  Wifi,
  WifiOff,
  Server,
  Database,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 에러 바운더리 컴포넌트
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 에러 로깅
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // 외부 에러 리포팅 서비스에 전송 (예: Sentry, LogRocket 등)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retryCount={this.state.retryCount}
          maxRetries={this.props.maxRetries || 3}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * 에러 폴백 컴포넌트
 */
interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onReset: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  retryCount,
  maxRetries,
  onRetry,
  onReset,
}) => {
  const getErrorType = (error: Error | null) => {
    if (!error) return "unknown";
    
    const message = error.message.toLowerCase();
    if (message.includes("network") || message.includes("fetch")) return "network";
    if (message.includes("timeout")) return "timeout";
    if (message.includes("unauthorized") || message.includes("403")) return "auth";
    if (message.includes("not found") || message.includes("404")) return "notfound";
    return "unknown";
  };

  const errorType = getErrorType(error);

  const getErrorIcon = () => {
    switch (errorType) {
      case "network":
        return <WifiOff className="w-16 h-16 text-red-500" />;
      case "timeout":
        return <AlertTriangle className="w-16 h-16 text-orange-500" />;
      case "auth":
        return <AlertCircle className="w-16 h-16 text-yellow-500" />;
      case "notfound":
        return <Database className="w-16 h-16 text-blue-500" />;
      default:
        return <XCircle className="w-16 h-16 text-red-500" />;
    }
  };

  const getErrorMessage = () => {
    switch (errorType) {
      case "network":
        return {
          title: "네트워크 연결 오류",
          description: "인터넷 연결을 확인하고 다시 시도해주세요.",
          suggestion: "Wi-Fi 또는 모바일 데이터 연결 상태를 확인해주세요.",
        };
      case "timeout":
        return {
          title: "요청 시간 초과",
          description: "서버 응답이 지연되고 있습니다.",
          suggestion: "잠시 후 다시 시도해주세요.",
        };
      case "auth":
        return {
          title: "인증 오류",
          description: "로그인이 필요하거나 권한이 없습니다.",
          suggestion: "로그인 페이지로 이동하여 다시 로그인해주세요.",
        };
      case "notfound":
        return {
          title: "데이터를 찾을 수 없음",
          description: "요청하신 전문가 정보를 찾을 수 없습니다.",
          suggestion: "다른 검색어로 시도하거나 홈으로 돌아가주세요.",
        };
      default:
        return {
          title: "예상치 못한 오류",
          description: "일시적인 문제가 발생했습니다.",
          suggestion: "페이지를 새로고침하거나 잠시 후 다시 시도해주세요.",
        };
    }
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          {getErrorIcon()}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {errorMessage.title}
        </h1>
        
        <p className="text-gray-600 mb-4">
          {errorMessage.description}
        </p>
        
        <p className="text-sm text-gray-500 mb-6">
          {errorMessage.suggestion}
        </p>

        <div className="space-y-3">
          {retryCount < maxRetries && (
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>다시 시도 ({retryCount + 1}/{maxRetries})</span>
            </button>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>새로고침</span>
            </button>
            
            <button
              onClick={() => window.location.href = "/"}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>홈으로</span>
            </button>
          </div>
        </div>

        {/* 개발 모드에서만 에러 상세 정보 표시 */}
        {process.env.NODE_ENV === "development" && error && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer">
              개발자 정보 (클릭하여 펼치기)
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-auto max-h-40">
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              <div className="mb-2">
                <strong>Stack:</strong>
                <pre className="whitespace-pre-wrap">{error.stack}</pre>
              </div>
              {errorInfo && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

/**
 * 네트워크 상태 감지 컴포넌트
 */
interface NetworkStatusProps {
  children: ReactNode;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      {children}
      {showOfflineMessage && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="w-5 h-5" />
            <span>인터넷 연결이 끊어졌습니다. 연결을 확인해주세요.</span>
            <button
              onClick={() => setShowOfflineMessage(false)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * API 에러 처리 훅
 */
interface UseApiErrorReturn {
  error: Error | null;
  isError: boolean;
  clearError: () => void;
  handleError: (error: Error) => void;
}

export const useApiError = (): UseApiErrorReturn => {
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error("API Error:", error);
    setError(error);
  }, []);

  return {
    error,
    isError: error !== null,
    clearError,
    handleError,
  };
};

/**
 * 에러 토스트 컴포넌트
 */
interface ErrorToastProps {
  error: Error | null;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onClose,
  autoClose = true,
  duration = 5000,
}) => {
  useEffect(() => {
    if (error && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [error, autoClose, duration, onClose]);

  if (!error) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-red-600 text-white rounded-lg shadow-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold">오류 발생</h4>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 flex-shrink-0"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 로딩 상태 관리 컴포넌트
 */
interface LoadingStateProps {
  isLoading: boolean;
  error: Error | null;
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  children,
  fallback,
  errorFallback,
}) => {
  if (error) {
    return errorFallback || (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            오류가 발생했습니다
          </h3>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">로딩 중...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * 재시도 가능한 컴포넌트
 */
interface RetryableProps {
  children: ReactNode;
  onRetry: () => void;
  maxRetries?: number;
  retryDelay?: number;
}

export const Retryable: React.FC<RetryableProps> = ({
  children,
  onRetry,
  maxRetries = 3,
  retryDelay = 1000,
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (retryCount >= maxRetries) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            문제가 발생했습니다
          </h3>
          <p className="text-gray-600 mb-4">
            다시 시도해주세요 ({retryCount}/{maxRetries})
          </p>
          <button
            onClick={handleRetry}
            disabled={isRetrying || retryCount >= maxRetries}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRetrying ? "재시도 중..." : "다시 시도"}
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};
