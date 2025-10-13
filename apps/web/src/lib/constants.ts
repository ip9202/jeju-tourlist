/**
 * 애플리케이션 상수
 */

export const AUTH_CONSTANTS = {
  TOKEN_KEY: "auth_token",
  REFRESH_TOKEN_KEY: "refresh_token",
  TOKEN_EXPIRY_KEY: "token_expiry",
} as const;

export const API_CONSTANTS = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  TIMEOUT: 30000,
} as const;
