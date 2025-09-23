/**
 * 전역 타입 선언
 */

declare global {
  interface Window {
    __AUTH_STATE__?: {
      user: {
        id: string;
        name: string;
        email: string;
        profileImage?: string;
      };
      isAuthenticated: boolean;
      isLoading: boolean;
    };
  }
}

export {};
