'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Input, Heading, Text } from '@jeju-tourlist/ui';
import { Search, Filter, ArrowLeft } from 'lucide-react';
import { NetworkError } from '@/components/error/NetworkError';
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
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'recent'
  });

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
      handleSearch(query);
    }
  }, [searchParams]);

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setError('검색어를 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 네트워크 에러 시뮬레이션
      if (term === 'network-error') {
        throw new Error('서버 오류가 발생했습니다');
      }

      // 목업 데이터
      const mockQuestions: Question[] = [
        {
          id: '1',
          title: '제주도 3박 4일 여행 코스 추천해주세요',
          content: '가족과 함께 제주도 3박 4일 여행을 계획하고 있습니다...',
          author: {
            id: 'user1',
            name: '김제주'
          },
          category: '여행',
          answerCount: 5,
          createdAt: new Date().toISOString(),
          views: 156,
          likes: 12
        },
        {
          id: '2',
          title: '제주도 맛집 추천 부탁드립니다',
          content: '제주도에서 꼭 가봐야 할 맛집들을 알려주세요...',
          author: {
            id: 'user2',
            name: '제주맘'
          },
          category: '맛집',
          answerCount: 8,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          views: 89,
          likes: 7
        },
        {
          id: '3',
          title: '제주도 렌터카 추천 업체는?',
          content: '제주도 렌터카 업체 중에서 신뢰할 수 있는 곳을 추천해주세요...',
          author: {
            id: 'user3',
            name: '제주여행자'
          },
          category: '교통',
          answerCount: 3,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          views: 45,
          likes: 4
        }
      ];

      // 검색어 필터링
      const filteredQuestions = mockQuestions.filter(q => 
        q.title.toLowerCase().includes(term.toLowerCase()) ||
        q.content.toLowerCase().includes(term.toLowerCase())
      );

      setQuestions(filteredQuestions);
    } catch (err) {
      setError('검색 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError('검색어를 입력해주세요');
      return;
    }
    handleSearch(searchTerm);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Button
              variant="secondary"
              onClick={() => window.history.back()}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로가기
            </Button>
            <Heading level={1} className="text-2xl font-bold text-gray-900">
              검색 결과
            </Heading>
          </div>

          {/* 검색 폼 */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="검색어를 입력하세요..."
                  className="w-full"
                  data-testid="search-input"
                />
              </div>
              <Button type="submit" data-testid="search-button">
                <Search className="w-4 h-4 mr-2" />
                검색
              </Button>
            </div>
          </form>

          {/* 필터 */}
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
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">정렬:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="recent">최신순</option>
                <option value="popular">인기순</option>
                <option value="views">조회순</option>
              </select>
            </div>
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="space-y-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <Text className="text-gray-600 mt-2">검색 중...</Text>
            </div>
          )}

          {error && (
            <div className="py-8">
              <NetworkError message={error} onRetry={() => handleSearch(searchTerm)} />
            </div>
          )}

          {!loading && !error && questions.length === 0 && (
            <div className="text-center py-8">
              <Text className="text-gray-600">검색 결과가 없습니다.</Text>
            </div>
          )}

          {!loading && !error && questions.length > 0 && (
            <div className="space-y-4">
              <Text className="text-gray-600">
                '{searchTerm}'에 대한 검색 결과 {questions.length}개
              </Text>
              
              {questions.map((question) => (
                <div key={question.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <Link href={`/questions/${question.id}`} className="flex-1">
                      <Heading level={3} className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                        {question.title}
                      </Heading>
                    </Link>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 ml-4">
                      {question.category}
                    </span>
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
          )}
        </div>
      </div>
    </div>
  );
}