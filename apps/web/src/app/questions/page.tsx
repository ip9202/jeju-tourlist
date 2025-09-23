'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Heading, Text } from '@jeju-tourlist/ui';
import { Search, Plus, Filter } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  category: string;
  answerCount: number;
  createdAt: string;
  views: number;
  likes: number;
  isAnswered: boolean;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: 'all'
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    
    try {
      // 목업 데이터
      const mockQuestions: Question[] = [
        {
          id: '1',
          title: '제주도 3박 4일 여행 코스 추천해주세요',
          content: '가족과 함께 제주도 3박 4일 여행을 계획하고 있습니다. 7세 아이와 60대 어머니가 함께 가는데, 모두가 즐길 수 있는 코스를 추천해주세요.',
          author: {
            id: 'user1',
            name: '김제주'
          },
          category: '여행',
          answerCount: 5,
          createdAt: new Date().toISOString(),
          views: 156,
          likes: 12,
          isAnswered: true
        },
        {
          id: '2',
          title: '제주도 맛집 추천 부탁드립니다',
          content: '제주도에서 꼭 가봐야 할 맛집들을 알려주세요. 특히 해산물 요리와 제주 전통 음식을 맛볼 수 있는 곳을 찾고 있습니다.',
          author: {
            id: 'user2',
            name: '제주맘'
          },
          category: '맛집',
          answerCount: 8,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          views: 89,
          likes: 7,
          isAnswered: true
        },
        {
          id: '3',
          title: '제주도 렌터카 추천 업체는?',
          content: '제주도 렌터카 업체 중에서 신뢰할 수 있는 곳을 추천해주세요. 가격도 합리적이고 서비스도 좋은 곳을 찾고 있습니다.',
          author: {
            id: 'user3',
            name: '제주여행자'
          },
          category: '교통',
          answerCount: 3,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          views: 45,
          likes: 4,
          isAnswered: false
        },
        {
          id: '4',
          title: '제주도 숙박 추천해주세요',
          content: '제주도에서 좋은 숙박시설을 찾고 있습니다. 가족 단위로 이용할 수 있고, 조식이 맛있는 곳이면 좋겠습니다.',
          author: {
            id: 'user4',
            name: '제주가족'
          },
          category: '숙박',
          answerCount: 6,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          views: 78,
          likes: 9,
          isAnswered: true
        },
        {
          id: '5',
          title: '제주도 날씨는 어떤가요?',
          content: '다음 주에 제주도 여행을 가는데 날씨가 궁금합니다. 우산을 준비해야 할까요?',
          author: {
            id: 'user5',
            name: '날씨궁금'
          },
          category: '날씨',
          answerCount: 2,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          views: 34,
          likes: 2,
          isAnswered: false
        }
      ];

      setQuestions(mockQuestions);
    } catch (error) {
      console.error('질문 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제 검색 구현
    console.log('검색어:', searchTerm);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredQuestions = questions.filter(question => {
    if (filters.category && question.category !== filters.category) return false;
    if (filters.status === 'answered' && !question.isAnswered) return false;
    if (filters.status === 'unanswered' && question.isAnswered) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Heading level={1} className="text-3xl font-bold text-gray-900">
              질문 목록
            </Heading>
            <Link href="/questions/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                질문하기
              </Button>
            </Link>
          </div>

          {/* 검색 및 필터 */}
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex space-x-4">
              <div className="flex-1">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="질문을 검색하세요..."
                  className="w-full"
                />
              </div>
              <Button type="submit">
                <Search className="w-4 h-4 mr-2" />
                검색
              </Button>
            </form>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">카테고리:</span>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">전체</option>
                  <option value="여행">여행</option>
                  <option value="맛집">맛집</option>
                  <option value="교통">교통</option>
                  <option value="숙박">숙박</option>
                  <option value="날씨">날씨</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">상태:</span>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">전체</option>
                  <option value="answered">답변완료</option>
                  <option value="unanswered">답변대기</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 질문 목록 */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <Text className="text-gray-600 mt-2">질문을 불러오는 중...</Text>
            </div>
          )}

          {!loading && filteredQuestions.length === 0 && (
            <div className="text-center py-8">
              <Text className="text-gray-600">질문이 없습니다.</Text>
            </div>
          )}

          {!loading && filteredQuestions.map((question) => (
            <div key={question.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <Link href={`/questions/${question.id}`} className="flex-1">
                  <Heading level={3} className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                    {question.title}
                  </Heading>
                </Link>
                <div className="flex items-center space-x-2 ml-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                    {question.category}
                  </span>
                  {question.isAnswered ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      답변완료
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      답변대기
                    </span>
                  )}
                </div>
              </div>
              
              <Text className="text-gray-600 mb-4 line-clamp-2">
                {question.content}
              </Text>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>작성자: {question.author.name}</span>
                  <span>답변 {question.answerCount}개</span>
                  <span>조회 {question.views}</span>
                  <span>좋아요 {question.likes}</span>
                </div>
                <span>{new Date(question.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
