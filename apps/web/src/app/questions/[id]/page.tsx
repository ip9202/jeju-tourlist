'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button, Heading, Text } from '@jeju-tourlist/ui';
import { ArrowLeft, Share2, Bookmark, Heart, MessageCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

interface Question {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    profileImage?: string;
  };
  category: string;
  isAnswered: boolean;
  answerCount: number;
  createdAt: string;
  views: number;
  likes: number;
}

interface Answer {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    profileImage?: string;
    isVerified: boolean;
  };
  createdAt: string;
  likes: number;
  isAccepted: boolean;
}

export default function QuestionDetailPage() {
  const params = useParams();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answerError, setAnswerError] = useState('');

  useEffect(() => {
    const loadQuestion = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 잘못된 ID인 경우 에러 시뮬레이션
        if (params.id === 'invalid-id') {
          throw new Error('질문을 찾을 수 없습니다');
        }

        // 목업 데이터
        const mockQuestion: Question = {
          id: params.id as string,
          title: "제주도 3박 4일 여행 코스 추천해주세요",
          content: "가족과 함께 제주도 3박 4일 여행을 계획하고 있습니다. 7세 아이와 60대 어머니가 함께 가는데, 모두가 즐길 수 있는 코스를 추천해주세요. 렌터카를 이용할 예정이고, 숙박은 제주시와 서귀포 각각 2박씩 생각하고 있습니다.",
          author: {
            id: "user1",
            name: "김제주",
            profileImage: "/avatars/default.png"
          },
          category: "여행",
          isAnswered: true,
          answerCount: 3,
      createdAt: new Date().toISOString(),
          views: 156,
          likes: 12
        };

        const mockAnswers: Answer[] = [
          {
            id: "answer1",
            content: "3박 4일 가족 여행이라면 다음과 같은 코스를 추천드립니다:\n\n**1일차: 제주시 중심**\n- 오전: 제주공항 도착 → 렌터카 픽업 → 제주시내 숙소 체크인\n- 오후: 제주도립미술관 (아이들이 좋아할 만한 전시)\n- 저녁: 동문시장에서 저녁식사\n\n**2일차: 동부 해안**\n- 오전: 성산일출봉 (일출 명소)\n- 오후: 섭지코지 (드라마 촬영지)\n- 저녁: 서귀포로 이동\n\n**3일차: 서부 해안**\n- 오전: 한라산 등반 (체력에 따라 조절)\n- 오후: 중문관광단지\n- 저녁: 서귀포 시장 탐방\n\n**4일차: 마무리**\n- 오전: 제주시로 이동하며 중간 관광지 방문\n- 오후: 공항으로 이동",
            author: {
              id: "expert1",
              name: "제주현지인",
              profileImage: "/avatars/jeju-guide.jpg",
              isVerified: true
            },
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            likes: 8,
            isAccepted: true
          },
          {
            id: "answer2",
            content: "7세 아이와 60대 어머니를 고려하면 체력적으로 부담이 적은 코스가 좋겠네요. 제가 추천하는 코스는:\n\n1. **제주시 2박**: 도심 관광과 가까운 관광지 위주\n2. **서귀포 2박**: 자연 경관과 해변 위주\n\n특히 한라산 등반은 체력에 따라 조절하시고, 아이들이 좋아할 만한 테마파크나 수족관도 고려해보세요.",
            author: {
              id: "user2",
              name: "제주맘",
              profileImage: "/avatars/mom-blogger.jpg",
              isVerified: false
            },
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            likes: 5,
            isAccepted: false
          }
        ];

        setQuestion(mockQuestion);
        setAnswers(mockAnswers);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadQuestion();
    }
  }, [params.id]);

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 답변 검증
    if (!newAnswer.trim()) {
      setAnswerError('답변을 입력해주세요');
      return;
    }
    
    if (newAnswer.trim().length < 10) {
      setAnswerError('답변을 10자 이상 입력해주세요');
      return;
    }
    
    if (isSubmitting) return;

    setIsSubmitting(true);
    setAnswerError('');
    
    try {
      // TODO: 실제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAnswerObj: Answer = {
        id: `answer${Date.now()}`,
        content: newAnswer,
        author: {
          id: "current-user",
          name: "현재 사용자",
          profileImage: "/avatars/default.png",
          isVerified: false
        },
        createdAt: new Date().toISOString(),
        likes: 0,
        isAccepted: false
      };
      
      setAnswers(prev => [newAnswerObj, ...prev]);
      setNewAnswer('');
    } catch (error) {
      console.error('답변 작성 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12" data-testid="loading-spinner">
            <LoadingSpinner size="lg" className="mb-4" />
            <Text className="text-gray-600">질문을 불러오는 중...</Text>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center" data-testid="question-not-found">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error}
            </h1>
            <p className="text-gray-600 mb-8">
              요청하신 질문이 존재하지 않거나 삭제되었습니다.
            </p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              이전 페이지로
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              질문을 찾을 수 없습니다
            </h1>
            <p className="text-gray-600 mb-8">
              요청하신 질문이 존재하지 않거나 삭제되었습니다.
            </p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              이전 페이지로
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
        </div>

        {/* 질문 상세 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <Heading level={1} className="text-2xl font-bold text-gray-900 mb-4">
                {question.title}
              </Heading>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span>조회 {question.views}</span>
                <span>좋아요 {question.likes}</span>
                <span>답변 {question.answerCount}</span>
                <span>{new Date(question.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                공유
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 mr-2" />
                북마크
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <Text className="text-gray-700 leading-relaxed whitespace-pre-line">
              {question.content}
            </Text>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {question.author.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900">{question.author.name}</div>
                <div className="text-sm text-gray-500">{question.category}</div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4 mr-2" />
              좋아요
            </Button>
          </div>
        </div>

        {/* 답변 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <Heading level={2} className="text-xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              답변 {answers.length}개
            </Heading>
          </div>

          {/* 답변 목록 */}
          <div className="space-y-6" data-testid="answer-list">
            {answers.map((answer) => (
              <div key={answer.id} className="border-b border-gray-200 pb-6 last:border-b-0" data-testid="answer-item">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3" data-testid="answer-author">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {answer.author.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{answer.author.name}</div>
                      {answer.author.isVerified && (
                        <span 
                          data-testid="verification-badge"
                          className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
                        >
                          검증된 현지인
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {new Date(answer.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                    {answer.isAccepted && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        채택됨
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-gray-700 leading-relaxed whitespace-pre-line mb-4">
                  {answer.content}
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4 mr-2" />
                    좋아요 {answer.likes}
                  </Button>
                  <Button variant="outline" size="sm">
                    답변하기
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 답변 작성 폼 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <Heading level={3} className="text-lg font-bold text-gray-900 mb-4">
            답변 작성
          </Heading>
          <form onSubmit={handleAnswerSubmit} className="space-y-4">
            <div>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="답변을 작성해주세요..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                data-testid="answer-content"
                disabled={isSubmitting}
              />
            </div>
            {answerError && (
              <div className="text-red-600 text-sm mt-2" data-testid="answer-error">
                {answerError}
              </div>
            )}
            <div className="flex justify-end">
              <Button
                type="submit"
                data-testid="submit-answer"
                disabled={isSubmitting}
              >
                {isSubmitting ? '작성 중...' : '답변 작성'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}