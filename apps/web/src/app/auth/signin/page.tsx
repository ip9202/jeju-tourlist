"use client";

import Link from "next/link";
import { MapPin, Mail, Lock } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { EmailLoginForm } from "@/components/auth/EmailLoginForm";
import { Header } from "@/components/layout/Header";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 공통 헤더 */}
      <Header />

      {/* 메인 컨텐츠 */}
      <div className="flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* 로그인 카드 */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* 헤더 섹션 */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-8 py-8 sm:py-12 text-center text-white">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                로그인
              </h1>
              <p className="text-sm sm:text-base text-blue-100">
                제주 여행의 모든 것을 경험하세요
              </p>
            </div>

            {/* 폼 섹션 */}
            <div className="px-4 sm:px-8 py-6 sm:py-8">
              <EmailLoginForm callbackUrl={callbackUrl} />

              {/* 회원가입 링크 */}
              <div className="mt-6 sm:mt-8 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">또는</span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6">
                  <p className="text-xs sm:text-sm text-gray-600">
                    아직 계정이 없으신가요?
                  </p>
                  <Link
                    href="/auth/signup"
                    className="mt-2 inline-block bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    회원가입하기
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="mt-6 sm:mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-3 sm:p-4 bg-white rounded-lg border border-gray-100">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-1">
                  빠른 로그인
                </h3>
                <p className="text-xs text-gray-500">이메일로 간편하게</p>
              </div>

              <div className="text-center p-3 sm:p-4 bg-white rounded-lg border border-gray-100">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-1">
                  안전한 보안
                </h3>
                <p className="text-xs text-gray-500">개인정보 보호</p>
              </div>

              <div className="text-center p-3 sm:p-4 bg-white rounded-lg border border-gray-100">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-1">
                  제주 전문
                </h3>
                <p className="text-xs text-gray-500">현지 정보 제공</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                동네물어봐
              </h4>
              <p className="text-gray-400 text-xs sm:text-sm">
                제주도 여행자와 현지 주민을 연결하는 실시간 Q&A 커뮤니티
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                서비스
              </h5>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    질문하기
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    답변하기
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    전문가
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    커뮤니티
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                지원
              </h5>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    고객센터
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    이용가이드
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    자주묻는질문
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    문의하기
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                회사
              </h5>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    회사소개
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    채용정보
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    이용약관
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    개인정보처리방침
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>&copy; 2024 동네물어봐. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
