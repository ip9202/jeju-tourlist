"use client";

import React from "react";
import Link from "next/link";
import { LoginButton } from "@/components/auth/LoginButton";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, MessageCircle, Users, Star, User } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">
                동네물어봐
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <Link
                  href="/profile"
                  className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  <User className="w-5 h-5 mr-1" />
                  프로필
                </Link>
              )}
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 히어로 섹션 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            제주 여행, 궁금한 게 있으신가요?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            제주도 현지인과 여행자들이 함께 만드는 가장 신뢰할 수 있는 여행 정보
            커뮤니티
          </p>

          {isAuthenticated ? (
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                {user?.profileImage && (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    안녕하세요, {user?.name}님!
                  </h3>
                  <p className="text-sm text-gray-600">
                    제주 여행에 대해 질문해보세요
                  </p>
                </div>
              </div>
              <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                질문하기
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                로그인하고 제주 여행 정보를 공유해보세요
              </p>
              <LoginButton />
            </div>
          )}
        </div>

        {/* 기능 소개 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <MessageCircle className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              실시간 Q&A
            </h3>
            <p className="text-gray-600">
              제주 여행에 대한 모든 질문을 실시간으로 답변받으세요
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              현지인 커뮤니티
            </h3>
            <p className="text-gray-600">
              제주도 현지인들의 생생한 정보와 추천을 만나보세요
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Star className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              검증된 정보
            </h3>
            <p className="text-gray-600">
              커뮤니티가 검증한 신뢰할 수 있는 여행 정보만 제공합니다
            </p>
          </div>
        </div>

        {/* 최신 질문 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">최신 질문</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-indigo-500 pl-4 py-2">
              <p className="text-gray-800 font-medium">
                제주도 3박 4일 여행 코스 추천해주세요
              </p>
              <p className="text-sm text-gray-600 mt-1">2시간 전 • 답변 3개</p>
            </div>
            <div className="border-l-4 border-indigo-500 pl-4 py-2">
              <p className="text-gray-800 font-medium">
                제주도 렌터카 vs 대중교통 어떤 게 좋을까요?
              </p>
              <p className="text-sm text-gray-600 mt-1">4시간 전 • 답변 7개</p>
            </div>
            <div className="border-l-4 border-indigo-500 pl-4 py-2">
              <p className="text-gray-800 font-medium">
                제주도 날씨 12월에 어떤가요?
              </p>
              <p className="text-sm text-gray-600 mt-1">6시간 전 • 답변 5개</p>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <MapPin className="h-6 w-6 text-indigo-400 mr-2" />
            <span className="text-lg font-semibold">동네물어봐</span>
          </div>
          <p className="text-gray-400">제주 여행 정보를 공유하는 커뮤니티</p>
        </div>
      </footer>
    </div>
  );
}
