import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * NextAuth.js 설정
 * Single Responsibility Principle: 인증 설정만 담당
 */
export const authOptions: NextAuthOptions = {
  debug: true, // 디버그 모드 활성화
  session: {
    strategy: "jwt", // JWT 전략으로 다시 변경
    maxAge: 7 * 24 * 60 * 60, // 7일
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7일
  },
  useSecureCookies: false, // 개발 환경이므로 false
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false, // 개발 환경이므로 false
      },
    },
  },
  providers: [
    // 이메일 기반 로그인 (Credentials Provider)
    CredentialsProvider({
      name: "이메일 로그인",
      credentials: {
        email: {
          label: "이메일",
          type: "email",
          placeholder: "example@email.com",
        },
        password: {
          label: "비밀번호",
          type: "password",
        },
      },
      async authorize(credentials) {
        console.log("🔐 NextAuth authorize 호출:", {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
        });

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ 인증 정보 누락");
          return null;
        }

        try {
          console.log("🌐 API 서버에 로그인 요청 중...");
          console.log("📧 이메일:", credentials.email);
          console.log("🔑 비밀번호 길이:", credentials.password?.length);

          // API 서버에 로그인 요청 - 타임아웃과 에러 처리 강화
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

          const response = await fetch(
            "http://localhost:4000/api/auth/email/login",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          console.log("📡 API 응답 상태:", response.status);
          console.log("📡 API 응답 URL:", response.url);
          console.log(
            "📡 API 응답 헤더:",
            Object.fromEntries(response.headers.entries())
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.log("❌ API 응답 실패:", response.status, errorText);
            return null;
          }

          // 응답 본문 읽기 전에 Content-Type 확인
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            console.log("❌ API 응답이 JSON이 아님:", contentType);
            return null;
          }

          const data = await response.json();
          console.log("📦 API 응답 데이터:", JSON.stringify(data, null, 2));

          // 응답 데이터 구조 검증 강화
          if (!data) {
            console.log("❌ API 응답 데이터가 null/undefined");
            return null;
          }

          if (!data.success) {
            console.log(
              "❌ API 응답 success가 false:",
              data.message || "알 수 없는 오류"
            );
            return null;
          }

          if (!data.data || !data.data.user) {
            console.log("❌ API 응답에 사용자 데이터 없음:", data);
            return null;
          }

          const user = {
            id: data.data.user.id,
            email: data.data.user.email,
            name: data.data.user.name || data.data.user.nickname || "사용자",
            nickname: data.data.user.nickname,
            image: null, // 이메일 로그인은 프로필 이미지 없음
          };

          console.log(
            "✅ 인증 성공, 사용자 반환:",
            JSON.stringify(user, null, 2)
          );
          return user;
        } catch (error) {
          console.error("❌ Credentials authorize error:", error);

          if (error.name === "AbortError") {
            console.error("❌ API 서버 요청 타임아웃 (10초)");
          } else if (error.code === "ECONNREFUSED") {
            console.error("❌ API 서버 연결 거부 - 서버가 실행 중인지 확인");
          } else if (error.code === "ENOTFOUND") {
            console.error("❌ API 서버를 찾을 수 없음 - URL 확인");
          } else {
            console.error(
              "❌ Error stack:",
              error instanceof Error ? error.stack : "No stack trace"
            );
          }

          return null;
        }
      },
    }),
    // OAuth 제공업체들
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID || "",
      clientSecret: process.env.NAVER_CLIENT_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("🔐 signIn 콜백 호출:", {
        hasUser: !!user,
        hasAccount: !!account,
        hasProfile: !!profile,
        userId: user?.id,
        userEmail: user?.email,
        userName: user?.name,
        accountProvider: account?.provider,
        accountType: account?.type,
      });

      // 사용자 객체가 없으면 로그인 실패
      if (!user) {
        console.log("❌ signIn 콜백에서 사용자 객체가 없음 - 로그인 실패");
        return false;
      }

      // 사용자 ID가 없으면 로그인 실패
      if (!user.id) {
        console.log("❌ signIn 콜백에서 사용자 ID가 없음 - 로그인 실패");
        return false;
      }

      console.log("✅ signIn 콜백에서 로그인 허용");
      return true; // 로그인 허용
    },
    async jwt({ token, account, profile, user, trigger }) {
      console.log("🔑 JWT 콜백 호출:", {
        hasToken: !!token,
        hasAccount: !!account,
        hasProfile: !!profile,
        hasUser: !!user,
        accountProvider: account?.provider,
        userId: user?.id,
        trigger,
        tokenSub: token?.sub,
        tokenId: token?.id,
      });

      // 첫 로그인 시 (user 객체가 있을 때) 사용자 정보를 토큰에 저장
      if (user) {
        console.log("🔑 사용자 객체 존재 - 토큰에 정보 저장");

        // user 객체가 있다는 것은 authorize나 OAuth에서 방금 인증된 것
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;

        // Credentials 로그인인지 OAuth 로그인인지 구분
        if (account?.provider === "credentials") {
          token.provider = "email";
          token.providerId = user.id;
          console.log("🔑 Credentials 로그인 - 사용자 정보 저장:", {
            id: user.id,
            email: user.email,
            name: user.name,
            nickname: user.nickname,
          });
        } else if (account && profile) {
          // OAuth 로그인
          token.provider = account.provider;
          token.providerId = account.providerAccountId;
          console.log("🔑 OAuth 로그인 처리:", token.provider);
        }
      } else {
        console.log("🔑 사용자 객체 없음 - 기존 토큰 유지");

        // 사용자 객체가 없는 경우 (세션 갱신 등)
        // 기존 토큰 정보가 있는지 확인
        if (!token.id && token.sub) {
          console.log("🔑 토큰에 ID가 없고 sub만 있음 - sub를 ID로 사용");
          token.id = token.sub;
        }
      }

      // 토큰 유효성 검증
      if (!token.id && !token.sub) {
        console.log("❌ 토큰에 ID와 sub가 모두 없음");
        return token;
      }

      console.log("🔑 최종 토큰:", {
        sub: token.sub,
        id: token.id,
        email: token.email,
        name: token.name,
        provider: token.provider,
        providerId: token.providerId,
        hasValidId: !!(token.id || token.sub),
      });

      return token;
    },
    async session({ session, token }) {
      console.log("📋 세션 콜백 호출:", {
        hasSession: !!session,
        hasToken: !!token,
        tokenSub: token?.sub,
        tokenId: token?.id,
        tokenEmail: token?.email,
        tokenName: token?.name,
        tokenProvider: token?.provider,
        sessionUser: session?.user,
      });

      // 토큰 유효성 검증
      if (!token) {
        console.log("❌ 토큰이 없음 - 빈 세션 반환");
        return session;
      }

      if (!session || !session.user) {
        console.log("❌ 세션이나 사용자 객체가 없음 - 빈 세션 반환");
        return session;
      }

      // 토큰에서 사용자 ID 추출
      const userId = token.id || token.sub;
      if (!userId) {
        console.log("❌ 토큰에 사용자 ID가 없음 - 빈 세션 반환");
        return session;
      }

      // 토큰의 정보를 세션에 복사
      session.user.id = userId as string;
      session.user.email = (token.email as string) || "";
      session.user.name = (token.name as string) || "사용자";
      session.user.image = (token.picture as string) || null;

      console.log("📋 세션 사용자 정보 설정 완료:", {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        hasValidId: !!session.user.id,
      });

      console.log("📋 최종 세션:", {
        user: session.user,
        expires: session.expires,
      });

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
