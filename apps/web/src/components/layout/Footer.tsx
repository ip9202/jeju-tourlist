import React from "react";
import Link from "next/link";
import {
  MapPin,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";

/**
 * Footer 컴포넌트
 *
 * @description
 * - 애플리케이션의 하단 정보를 담당
 * - 링크, 연락처, 소셜 미디어 정보를 포함
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성과 SEO를 고려한 구조화된 마크업
 *
 * @example
 * ```tsx
 * <Footer />
 * ```
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 브랜드 섹션 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <MapPin className="h-8 w-8 text-indigo-400 mr-2" />
              <span className="text-2xl font-bold">동네물어봐</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              제주 여행에 대한 모든 질문과 답변을 공유하는 커뮤니티입니다.
              현지인과 여행자들이 함께 만드는 신뢰할 수 있는 여행 정보를
              제공합니다.
            </p>

            {/* 소셜 미디어 링크 */}
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/jeju_tourlist"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="인스타그램"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://facebook.com/jeju_tourlist"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="페이스북"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://twitter.com/jeju_tourlist"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="트위터"
              >
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* 서비스 링크 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">서비스</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/questions"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  질문목록
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  카테고리
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  검색
                </Link>
              </li>
              <li>
                <Link
                  href="/popular"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  인기 질문
                </Link>
              </li>
            </ul>
          </div>

          {/* 지원 링크 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">지원</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  도움말
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  문의하기
                </Link>
              </li>
              <li>
                <Link
                  href="/report"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  신고하기
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 구분선 및 저작권 */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} 동네물어봐. All rights reserved.
            </div>

            {/* 법적 링크 */}
            <div className="flex space-x-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors"
              >
                이용약관
              </Link>
              <Link
                href="/cookies"
                className="text-gray-400 hover:text-white transition-colors"
              >
                쿠키 정책
              </Link>
            </div>
          </div>
        </div>

        {/* 연락처 정보 */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-8 text-sm text-gray-400">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              <span>support@dongnemulurowa.com</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              <span>1588-0000</span>
            </div>
            <div className="text-center">
              <span>제주특별자치도 제주시 연동 123-45</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
