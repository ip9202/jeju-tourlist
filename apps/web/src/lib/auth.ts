import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import GoogleProvider from "next-auth/providers/google";

/**
 * NextAuth.js 설정
 * Single Responsibility Principle: 인증 설정만 담당
 */
export const authOptions: NextAuthOptions = {
  providers: [
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
    async jwt({ token, account, profile }) {
      // OAuth 로그인 시 사용자 정보 저장
      if (account && profile) {
        token.provider = account.provider;
        token.providerId = account.providerAccountId;
        token.picture = (profile as any).picture || (profile as any).avatar_url;
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
