import { Metadata } from "next";
import { SearchPage } from "@/components/search";
import { generateMetadata } from "@/lib/seo";

/**
 * 검색 페이지 메타데이터
 * 
 * @description
 * - SEO 최적화된 검색 페이지 메타데이터
 * - 검색 엔진 최적화를 위한 키워드 설정
 */
export const metadata: Metadata = generateMetadata({
  title: "제주 여행 검색 - 동네물어봐",
  description: "제주 여행에 대한 질문과 답변을 검색하세요. 맛집, 숙소, 관광지 등 제주 여행 정보를 쉽게 찾아보세요.",
  keywords: ["제주여행검색", "제주맛집검색", "제주숙소검색", "제주관광지검색", "제주질문검색"],
  url: "/search",
  type: "website",
});

/**
 * 검색 페이지
 *
 * @description
 * - 검색 기능을 제공하는 페이지
 * - SearchPage 컴포넌트를 렌더링
 * - SEO 최적화된 구조
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 */
export default function Search() {
  return <SearchPage />;
}
