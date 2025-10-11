"use client";

import React from "react";
import { Search, Star, Clock, Users, Heart, ChevronRight } from "lucide-react";

// 여기요 스타일의 메인 페이지 컴포넌트
export default function YeogiDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">동네물어봐</h1>
              <span className="ml-2 text-sm text-gray-500">
                제주도 여행 Q&A
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                홈
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                인기질문
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                카테고리
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                전문가
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                로그인
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 검색 섹션 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              제주도 여행, 무엇이든 물어보세요!
            </h2>
            <p className="text-gray-600">현지 전문가들이 직접 답변해드립니다</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="궁금한 제주 여행 정보를 검색해보세요"
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                검색
              </button>
            </div>
          </div>
        </div>

        {/* 카테고리 섹션 */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            인기 카테고리
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "맛집", icon: "🍽️", count: 45 },
              { name: "관광지", icon: "🏛️", count: 32 },
              { name: "숙박", icon: "🏨", count: 28 },
              { name: "교통", icon: "🚗", count: 21 },
              { name: "액티비티", icon: "🏄", count: 18 },
              { name: "쇼핑", icon: "🛍️", count: 15 },
            ].map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <h4 className="font-semibold text-gray-900">{category.name}</h4>
                <p className="text-sm text-gray-500">{category.count}개 질문</p>
              </div>
            ))}
          </div>
        </div>

        {/* 인기 질문 섹션 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">인기 질문</h3>
            <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
              더보기 <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "제주도에서 꼭 가봐야 할 맛집 추천해주세요!",
                category: "맛집",
                answers: 12,
                views: 1250,
                time: "2시간 전",
                expert: "제주맛집마스터",
              },
              {
                title: "제주도 렌터카 vs 대중교통, 어떤게 나을까요?",
                category: "교통",
                answers: 8,
                views: 980,
                time: "4시간 전",
                expert: "제주교통전문가",
              },
              {
                title: "제주도 3박4일 일정 추천해주세요",
                category: "관광지",
                answers: 15,
                views: 2100,
                time: "6시간 전",
                expert: "제주여행플래너",
              },
            ].map((question, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {question.category}
                  </span>
                  <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
                </div>

                <h4 className="font-semibold text-gray-900 mb-3 line-clamp-2">
                  {question.title}
                </h4>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {question.answers}개 답변
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {question.time}
                    </span>
                  </div>
                  <span>{question.views} 조회</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      {question.expert.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {question.expert}
                      </p>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-500 ml-1">4.9</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    답변보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 전문가 섹션 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">인기 전문가</h3>
            <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
              전문가 더보기 <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "제주맛집마스터",
                specialty: "맛집 추천",
                answers: 156,
                rating: 4.9,
                avatar: "🍽️",
              },
              {
                name: "제주여행플래너",
                specialty: "일정 계획",
                answers: 98,
                rating: 4.8,
                avatar: "🗺️",
              },
              {
                name: "제주교통전문가",
                specialty: "교통 정보",
                answers: 87,
                rating: 4.7,
                avatar: "🚗",
              },
              {
                name: "제주액티비티가이드",
                specialty: "액티비티",
                answers: 72,
                rating: 4.9,
                avatar: "🏄",
              },
            ].map((expert, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                  {expert.avatar}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {expert.name}
                </h4>
                <p className="text-sm text-gray-500 mb-3">{expert.specialty}</p>
                <div className="flex items-center justify-center mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm font-medium text-gray-900">
                    {expert.rating}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    ({expert.answers}개 답변)
                  </span>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  질문하기
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            제주 여행의 모든 것을 한 번에!
          </h3>
          <p className="text-blue-100 mb-6">
            현지 전문가들과 함께하는 스마트한 제주 여행 계획
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              지금 시작하기
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              전문가 되기
            </button>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">동네물어봐</h4>
              <p className="text-gray-400 text-sm">
                제주도 여행자와 현지 주민을 연결하는 실시간 Q&A 커뮤니티
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">서비스</h5>
              <ul className="space-y-2 text-sm text-gray-400">
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
              <h5 className="font-semibold mb-4">지원</h5>
              <ul className="space-y-2 text-sm text-gray-400">
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
              <h5 className="font-semibold mb-4">회사</h5>
              <ul className="space-y-2 text-sm text-gray-400">
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
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 동네물어봐. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
