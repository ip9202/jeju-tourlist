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
  providers: [
    // 이메일 기반 로그인 (Credentials Provider)
    CredentialsProvider({
      id: "credentials",
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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // API 서버에 로그인 요청
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/email/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          if (data.success && data.data?.user) {
            return {
              id: data.data.user.id,
              email: data.data.user.email,
              name: data.data.user.name,
              nickname: data.data.user.nickname,
              image: null, // 이메일 로그인은 프로필 이미지 없음
            };
          }

          return null;
        } catch (error) {
          console.error("Credentials authorize error:", error);
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
    async jwt({ token, account, profile, user }) {
      // OAuth 로그인 시 사용자 정보 저장
      if (account && profile) {
        token.provider = account.provider;
        token.providerId = account.providerAccountId;
        token.picture = (profile as any).picture || (profile as any).avatar_url;
      }

      // Credentials 로그인 시 사용자 정보 저장
      if (account?.provider === "credentials" && user) {
        token.provider = "email";
        token.providerId = user.id;
        token.picture = user.image;
      }

      return token;
    },
    async session({ session, token }) {
      // 세션에 사용자 정보 추가
      if (token && session.user) {
        (session.user as any).id = token.sub!;
        (session.user as any).provider = token.provider as string;
        (session.user as any).providerId = token.providerId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7일
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7일
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
