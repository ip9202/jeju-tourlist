import axios from "axios";
import { OAuthProfile, AuthProvider } from "@jeju-tourlist/types";
import { env } from "@jeju-tourlist/config";

/**
 * OAuth 제공업체 통합 서비스
 * Open/Closed Principle: 새로운 OAuth 제공업체 추가 시 확장 가능
 */
export abstract class OAuthProvider {
  abstract getAccessToken(code: string): Promise<string>;
  abstract getUserProfile(accessToken: string): Promise<OAuthProfile>;
  abstract getAuthUrl(state?: string): string;
}

/**
 * 카카오 OAuth 서비스
 */
export class KakaoOAuthService extends OAuthProvider {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor() {
    super();
    this.clientId = env.KAKAO_CLIENT_ID || "";
    this.clientSecret = env.KAKAO_CLIENT_SECRET || "";
    this.redirectUri = `${env.NEXTAUTH_URL}/api/auth/callback/kakao`;
  }

  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: "profile_nickname,account_email",
      ...(state && { state }),
    });

    return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<string> {
    const response = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      {
        grant_type: "authorization_code",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  }

  async getUserProfile(accessToken: string): Promise<OAuthProfile> {
    const response = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = response.data;

    return {
      provider: AuthProvider.KAKAO,
      providerId: profile.id.toString(),
      email: profile.kakao_account?.email || "",
      name:
        profile.kakao_account?.profile?.nickname ||
        profile.properties?.nickname ||
        "",
      profileImage:
        profile.kakao_account?.profile?.profile_image_url ||
        profile.properties?.profile_image,
      rawProfile: profile,
    };
  }
}

/**
 * 네이버 OAuth 서비스
 */
export class NaverOAuthService extends OAuthProvider {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor() {
    super();
    this.clientId = env.NAVER_CLIENT_ID || "";
    this.clientSecret = env.NAVER_CLIENT_SECRET || "";
    this.redirectUri = `${env.NEXTAUTH_URL}/api/auth/callback/naver`;
  }

  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: state || "random_state",
    });

    return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<string> {
    const response = await axios.post(
      "https://nid.naver.com/oauth2.0/token",
      {
        grant_type: "authorization_code",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  }

  async getUserProfile(accessToken: string): Promise<OAuthProfile> {
    const response = await axios.get("https://openapi.naver.com/v1/nid/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = response.data.response;

    return {
      provider: AuthProvider.NAVER,
      providerId: profile.id,
      email: profile.email || "",
      name: profile.name || profile.nickname || "",
      profileImage: profile.profile_image,
      rawProfile: profile,
    };
  }
}

/**
 * 구글 OAuth 서비스
 */
export class GoogleOAuthService extends OAuthProvider {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor() {
    super();
    this.clientId = env.GOOGLE_CLIENT_ID || "";
    this.clientSecret = env.GOOGLE_CLIENT_SECRET || "";
    this.redirectUri = `${env.NEXTAUTH_URL}/api/auth/callback/google`;
  }

  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      ...(state && { state }),
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<string> {
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: "authorization_code",
        code,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  }

  async getUserProfile(accessToken: string): Promise<OAuthProfile> {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const profile = response.data;

    return {
      provider: AuthProvider.GOOGLE,
      providerId: profile.id,
      email: profile.email || "",
      name: profile.name || "",
      profileImage: profile.picture,
      rawProfile: profile,
    };
  }
}

/**
 * OAuth 서비스 팩토리
 * Factory Pattern을 사용하여 OAuth 제공업체 인스턴스 생성
 */
export class OAuthServiceFactory {
  static createProvider(provider: AuthProvider): OAuthProvider {
    switch (provider) {
      case AuthProvider.KAKAO:
        return new KakaoOAuthService();
      case AuthProvider.NAVER:
        return new NaverOAuthService();
      case AuthProvider.GOOGLE:
        return new GoogleOAuthService();
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }

  static getSupportedProviders(): AuthProvider[] {
    return [AuthProvider.KAKAO, AuthProvider.NAVER, AuthProvider.GOOGLE];
  }
}
