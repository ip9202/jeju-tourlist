"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Clock, User } from "lucide-react";

/**
 * 실시간 질문 데이터 타입
 */
interface RealtimeQuestion {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  createdAt: string;
  category: string;
  answerCount: number;
}

/**
 * RealtimeBanner 컴포넌트 Props
 */
interface RealtimeBannerProps {
  className?: string;
}

/**
 * RealtimeBanner 컴포넌트
 *
 * @description
 * - 실시간으로 등록되는 질문들을 표시하는 배너
 * - 자동 스크롤과 애니메이션 효과 포함
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 실시간 데이터 업데이트 처리
 *
 * @example
 * ```tsx
 * <RealtimeBanner />
 * ```
 */
export const RealtimeBanner: React.FC<RealtimeBannerProps> = ({
  className = "",
}) => {
  const [questions, setQuestions] = useState<RealtimeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * 목업 데이터 (실제로는 API에서 가져올 데이터)
   */
  const mockQuestions: RealtimeQuestion[] = [
    {
      id: "1",
      title: "제주도 3박 4일 여행 코스 추천해주세요",
      author: "김제주",
      authorAvatar: "/avatars/kim-jeju.jpg",
      createdAt: "2분 전",
      category: "여행",
      answerCount: 3,
    },
    {
      id: "2",
      title: "제주도 렌터카 vs 대중교통 어떤 게 좋을까요?",
      author: "박여행",
      authorAvatar: "/avatars/park-travel.jpg",
      createdAt: "5분 전",
      category: "교통",
      answerCount: 7,
    },
    {
      id: "3",
      title: "제주도 날씨 12월에 어떤가요?",
      author: "이현지",
      authorAvatar: "/avatars/lee-local.jpg",
      createdAt: "8분 전",
      category: "일반",
      answerCount: 5,
    },
    {
      id: "4",
      title: "제주도 맛집 추천해주세요!",
      author: "최맛집",
      authorAvatar: "/avatars/choi-food.jpg",
      createdAt: "12분 전",
      category: "맛집",
      answerCount: 12,
    },
    {
      id: "5",
      title: "제주도 포토스팟 어디가 좋을까요?",
      author: "정포토",
      authorAvatar: "/avatars/jung-photo.jpg",
      createdAt: "15분 전",
      category: "포토스팟",
      answerCount: 8,
    },
  ];

  /**
   * 컴포넌트 마운트 시 목업 데이터 설정
   */
  useEffect(() => {
    setQuestions(mockQuestions);
  }, []);

  /**
   * 자동 스크롤 효과
   */
  useEffect(() => {
    if (questions.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % questions.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [questions.length]);

  /**
   * 시간 포맷팅 함수
   */
  const formatTime = (timeString: string) => {
    return timeString;
  };

  /**
   * 현재 표시할 질문
   */
  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return null;
  }

  return (
    <div
      className={`bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-white/20 rounded-full p-2 mr-3">
            <MessageCircle className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold">실시간 질문</h3>
        </div>
        <div className="flex items-center text-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          <span>LIVE</span>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="transition-all duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            display: "flex",
            width: `${questions.length * 100}%`,
          }}
        >
          {questions.map((question, _index) => (
            <div
              key={question.id}
              className="w-full flex-shrink-0"
              style={{ width: `${100 / questions.length}%` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Link
                    href={`/questions/${question.id}`}
                    className="block hover:opacity-90 transition-opacity"
                  >
                    <h4 className="text-lg font-medium mb-2 line-clamp-2">
                      {question.title}
                    </h4>
                    <div className="flex items-center text-sm text-white/80">
                      <div className="flex items-center mr-4">
                        <User className="h-4 w-4 mr-1" />
                        <span>{question.author}</span>
                      </div>
                      <div className="flex items-center mr-4">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatTime(question.createdAt)}</span>
                      </div>
                      <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                        {question.category}
                      </span>
                    </div>
                  </Link>
                </div>

                <div className="ml-4 text-right">
                  <div className="text-2xl font-bold">
                    {question.answerCount}
                  </div>
                  <div className="text-sm text-white/80">답변</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 인디케이터 */}
      <div className="flex justify-center mt-4 space-x-2">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-white"
                : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`질문 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </div>
  );
};
