// 인증 관련 타입 정의

export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  provider: AuthProvider;
  providerId: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  location?: string;
  website?: string;
  birthDate?: Date;
  gender?: Gender;
  interests: string[];
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  theme: ThemeSettings;
}

export interface UpdateUserData {
  name?: string;
  profileImage?: string;
  isActive?: boolean;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  newQuestion: boolean;
  newAnswer: boolean;
  newLike: boolean;
  newFollow: boolean;
}

export interface PrivacySettings {
  profileVisibility: "public" | "friends" | "private";
  showEmail: boolean;
  showLocation: boolean;
  showActivity: boolean;
}

export interface ThemeSettings {
  mode: "light" | "dark" | "system";
  primaryColor: string;
}

export enum AuthProvider {
  KAKAO = "kakao",
  NAVER = "naver",
  GOOGLE = "google",
  LOCAL = "local",
}

export enum UserRole {
  USER = "user",
  MODERATOR = "moderator",
  ADMIN = "admin",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
  PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

// JWT 토큰 관련
export interface JWTPayload {
  sub: string; // user id
  email: string;
  name: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// OAuth 관련
export interface OAuthProfile {
  provider: AuthProvider;
  providerId: string;
  email: string;
  name: string;
  profileImage?: string;
  rawProfile: Record<string, any>;
}

// 인증 요청/응답 DTO
export interface LoginRequest {
  provider: AuthProvider;
  code?: string; // OAuth authorization code
  email?: string; // Local login
  password?: string; // Local login
}

export interface LoginResponse {
  user: User;
  tokens: TokenPair;
  isNewUser: boolean;
}

export interface RegisterRequest {
  provider: AuthProvider;
  code: string;
  profile?: Partial<UserProfile>;
}

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// 세션 관련
export interface SessionData {
  user: User;
  tokens: TokenPair;
  lastActivity: Date;
}

// 권한 관련
export interface Permission {
  resource: string;
  action: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

// API 응답 타입
export interface AuthApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AuthError;
  message?: string;
  timestamp?: string;
}
