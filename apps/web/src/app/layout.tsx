import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { DynamicSocketProvider } from "@/components/providers/DynamicSocketProvider";
import "@fontsource/pretendard/400.css";
import "@fontsource/pretendard/500.css";
import "@fontsource/pretendard/600.css";
import "@fontsource/pretendard/700.css";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "동네물어봐 - 제주 여행 Q&A 커뮤니티",
  description: "제주 여행에 대한 모든 질문과 답변을 공유하는 커뮤니티입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${jetBrainsMono.variable} antialiased`}
        style={{
          fontFamily:
            "Pretendard Variable, Pretendard, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans KR, Helvetica Neue, Arial, sans-serif",
        }}
      >
        <SessionProvider>
          <AuthProvider>
            <DynamicSocketProvider>{children}</DynamicSocketProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
