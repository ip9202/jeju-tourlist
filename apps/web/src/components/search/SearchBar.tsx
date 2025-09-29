"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@jeju-tourlist/ui";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

/**
 * SearchBar 컴포넌트
 *
 * @description
 * - 헤더에 사용되는 검색 바 컴포넌트
 * - 검색어 입력 및 검색 페이지로 이동
 * - 반응형 디자인 지원
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "제주 여행에 대해 질문해보세요...",
  onSearch,
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      return;
    }

    // 검색 페이지로 이동
    const searchUrl = `/search?q=${encodeURIComponent(query.trim())}`;
    router.push(searchUrl);

    // 콜백 함수 호출
    if (onSearch) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <Input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-12 pr-16 py-4 w-full text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg bg-white"
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 pr-4 flex items-center bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-colors duration-200 font-medium"
          aria-label="검색"
        >
          <Search className="h-4 w-4 mr-2" />
          검색
        </button>
      </div>
    </form>
  );
};
