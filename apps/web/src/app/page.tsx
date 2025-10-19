import React from "react";
import { Search, Star, Clock, Users, Heart, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";

// 타입 정의
interface Category {
  id: string;
  name: string;
}

interface Question {
  id: string;
  title: string;
  categoryId: string;
  answerCount: number;
  viewCount: number;
  createdAt: string;
  author?: {
    nickname: string;
  };
}

interface Expert {
  id: string;
  nickname: string;
}

// 카테고리별 아이콘 매핑
const categoryIcons: Record<string, string> = {
  관광지: "🏛️",
  맛집: "🍽️",
  숙박: "🏨",
  교통: "🚗",
  액티비티: "🏄",
  쇼핑: "🛍️",
  날씨: "🌤️",
  안전: "🛡️",
  기타: "📝",
};

// 카테고리별 배경 색상 (플랫 디자인)
const categoryColors: Record<string, { bg: string; icon: string }> = {
  관광지: { bg: "from-blue-50 to-blue-100", icon: "text-blue-200" },
  맛집: { bg: "from-orange-50 to-orange-100", icon: "text-orange-200" },
  숙박: { bg: "from-purple-50 to-purple-100", icon: "text-purple-200" },
  교통: { bg: "from-red-50 to-red-100", icon: "text-red-200" },
  쇼핑: { bg: "from-pink-50 to-pink-100", icon: "text-pink-200" },
  액티비티: { bg: "from-green-50 to-green-100", icon: "text-green-200" },
  날씨: { bg: "from-cyan-50 to-cyan-100", icon: "text-cyan-200" },
  안전: { bg: "from-yellow-50 to-yellow-100", icon: "text-yellow-200" },
  기타: { bg: "from-gray-50 to-gray-100", icon: "text-gray-200" },
};

// 카테고리 ID -> 한글명 매핑
const categoryNames: Record<string, string> = {
  cat_001: "관광지",
  cat_002: "맛집",
  cat_003: "숙박",
  cat_004: "교통",
  cat_005: "쇼핑",
  cat_006: "액티비티",
  cat_007: "날씨",
  cat_008: "안전",
  cat_009: "기타",
};

// 시간 포매팅 함수
function formatTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return past.toLocaleDateString("ko-KR");
}

async function fetchCategoriesWithCounts(): Promise<Category[]> {
  try {
    const res = await fetch("http://localhost:4000/api/categories", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("카테고리 조회 실패");
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("카테고리 조회 실패:", error);
    return [];
  }
}

async function fetchPopularQuestions(): Promise<Question[]> {
  try {
    const res = await fetch(
      "http://localhost:4000/api/questions?page=1&limit=6",
      {
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error("질문 조회 실패");
    const data = await res.json();
    return (data.data || []).slice(0, 3);
  } catch (error) {
    console.error("질문 조회 실패:", error);
    return [];
  }
}

async function fetchPopularExperts(): Promise<Expert[]> {
  try {
    const res = await fetch("http://localhost:4000/api/users?limit=4", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("전문가 조회 실패");
    const data = await res.json();
    return (data.data || []).slice(0, 4);
  } catch (error) {
    console.error("전문가 조회 실패:", error);
    return [];
  }
}

export default async function Home() {
  const [categories, questions, experts] = await Promise.all([
    fetchCategoriesWithCounts(),
    fetchPopularQuestions(),
    fetchPopularExperts(),
  ]);

  // 카테고리 선택 (최대 6개)
  const displayCategories = categories.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header />

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
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-800">
                검색
              </button>
            </div>
          </div>
        </div>

        {/* 카테고리 섹션 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">인기 카테고리</h3>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-gray-900 font-medium flex items-center"
            >
              모두 보기 <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayCategories.map((category: Category) => {
              const categoryName = category.name || "기타";
              const icon = categoryIcons[categoryName] || "📝";
              return (
                <Link
                  key={category.id}
                  href="/categories"
                  className="relative h-32 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-gray-100 block group"
                >
                  {/* 그래디언트 배경 */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      categoryColors[categoryName]?.bg ||
                      categoryColors["기타"].bg
                    }`}
                  ></div>

                  {/* 큰 아이콘 배경 */}
                  <div
                    className={`absolute -right-6 -bottom-6 opacity-20 ${
                      categoryColors[categoryName]?.icon ||
                      categoryColors["기타"].icon
                    }`}
                  >
                    <div className="w-32 h-32">
                      {icon === "📝" ? (
                        "?"
                      ) : (
                        <div className="text-4xl">{icon}</div>
                      )}
                    </div>
                  </div>

                  {/* 콘텐츠 */}
                  <div className="absolute inset-0 flex flex-col justify-between p-3 z-10">
                    <div className="text-2xl">{icon}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {categoryName}
                      </h4>
                      <p className="text-gray-600 text-xs">
                        {Math.floor(Math.random() * 20 + 5)}개 질문
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 인기 질문 섹션 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">인기 질문</h3>
            <Link
              href="/questions"
              className="text-gray-700 hover:text-gray-900 font-medium flex items-center"
            >
              더보기 <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions && questions.length > 0 ? (
              questions.map((question: Question) => (
                <Link
                  key={question.id}
                  href={`/questions/${question.id}`}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100 block"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {categoryNames[question.categoryId] || "기타"}
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
                        {question.answerCount}개 답변
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTimeAgo(question.createdAt)}
                      </span>
                    </div>
                    <span>{question.viewCount} 조회</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                        {question.author?.nickname?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {question.author?.nickname || "익명"}
                        </p>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-500 ml-1">
                            4.5
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                      답변보기
                    </button>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-gray-500">
                <p>등록된 질문이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* 전문가 섹션 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">인기 전문가</h3>
            <Link
              href="/experts"
              className="text-gray-700 hover:text-gray-900 font-medium flex items-center"
            >
              전문가 더보기 <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {experts && experts.length > 0 ? (
              experts.map((expert: Expert) => (
                <div
                  key={expert.id}
                  className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                    {expert.nickname?.charAt(0) || "?"}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {expert.nickname}
                  </h4>
                  <p className="text-sm text-gray-500 mb-3">제주 전문가</p>
                  <div className="flex items-center justify-center mb-3">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm font-medium text-gray-900">
                      4.8
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      ({Math.floor(Math.random() * 50 + 10)}개 답변)
                    </span>
                  </div>
                  <Link
                    href="/auth/signin?callbackUrl=/questions/new"
                    className="w-full bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors block text-center text-sm font-medium"
                  >
                    질문하기
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-12 text-gray-500">
                <p>등록된 전문가가 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            제주 여행의 모든 것을 한 번에!
          </h3>
          <p className="text-gray-300 mb-6">
            현지 전문가들과 함께하는 스마트한 제주 여행 계획
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/questions"
              className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
            >
              지금 시작하기
            </Link>
            <Link
              href="/experts"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-800 transition-colors text-center"
            >
              전문가 되기
            </Link>
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
            <p>&copy; 2025 동네물어봐. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
