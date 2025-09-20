/**
 * SEO 최적화 유틸리티
 * 
 * @description
 * - 동적 메타데이터 생성 및 관리
 * - Open Graph 및 Twitter Card 메타데이터 생성
 * - 구조화된 데이터 (JSON-LD) 생성
 * - 사이트맵 자동 생성 기능
 * 
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import { Metadata } from 'next';

/**
 * 기본 SEO 설정
 */
export const DEFAULT_SEO = {
  title: '동네물어봐 - 제주 여행 Q&A 커뮤니티',
  description: '제주 여행에 대한 모든 질문과 답변을 공유하는 커뮤니티입니다. 현지인과 여행자들이 함께 만들어가는 제주 여행 정보 플랫폼.',
  keywords: ['제주여행', '제주관광', '제주맛집', '제주숙소', '제주질문', '제주답변', '제주커뮤니티'],
  author: '동네물어봐',
  siteName: '동네물어봐',
  url: 'https://dongnemulurowa.com',
  image: '/og-image.jpg',
  locale: 'ko_KR',
  type: 'website',
} as const;

/**
 * 페이지별 메타데이터 생성 인터페이스
 */
export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

/**
 * 동적 메타데이터 생성기
 * 
 * @description
 * - 페이지별 맞춤형 메타데이터 생성
 * - Open Graph 및 Twitter Card 자동 생성
 * - 구조화된 데이터 포함
 * 
 * @param config - SEO 설정 객체
 * @returns Next.js Metadata 객체
 */
export function generateMetadata(config: SEOConfig = {}): Metadata {
  const {
    title = DEFAULT_SEO.title,
    description = DEFAULT_SEO.description,
    keywords = DEFAULT_SEO.keywords,
    image = DEFAULT_SEO.image,
    url = DEFAULT_SEO.url,
    type = DEFAULT_SEO.type,
    publishedTime,
    modifiedTime,
    author = DEFAULT_SEO.author,
    section,
    tags = [],
  } = config;

  // 전체 키워드 배열 생성
  const allKeywords = [...DEFAULT_SEO.keywords, ...keywords, ...tags].join(', ');

  // 완전한 URL 생성
  const fullUrl = url.startsWith('http') ? url : `${DEFAULT_SEO.url}${url}`;
  const fullImageUrl = image.startsWith('http') ? image : `${DEFAULT_SEO.url}${image}`;

  return {
    title: {
      default: DEFAULT_SEO.title,
      template: `%s | ${DEFAULT_SEO.siteName}`,
    },
    description,
    keywords: allKeywords,
    authors: [{ name: author }],
    creator: author,
    publisher: DEFAULT_SEO.author,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(DEFAULT_SEO.url),
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      type,
      locale: DEFAULT_SEO.locale,
      url: fullUrl,
      title,
      description,
      siteName: DEFAULT_SEO.siteName,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImageUrl],
      creator: '@dongnemulurowa',
      site: '@dongnemulurowa',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },
  };
}

/**
 * 구조화된 데이터 (JSON-LD) 생성
 * 
 * @description
 * - Schema.org 표준을 따른 구조화된 데이터 생성
 * - 검색 엔진 최적화 및 리치 스니펫 지원
 * 
 * @param type - Schema.org 타입
 * @param data - 구조화된 데이터 객체
 * @returns JSON-LD 문자열
 */
export function generateStructuredData(type: string, data: Record<string, any>): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return JSON.stringify(structuredData, null, 2);
}

/**
 * 웹사이트 구조화된 데이터 생성
 */
export function generateWebsiteStructuredData() {
  return generateStructuredData('WebSite', {
    name: DEFAULT_SEO.siteName,
    description: DEFAULT_SEO.description,
    url: DEFAULT_SEO.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${DEFAULT_SEO.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: DEFAULT_SEO.author,
      url: DEFAULT_SEO.url,
    },
  });
}

/**
 * 질문 페이지 구조화된 데이터 생성
 */
export function generateQuestionStructuredData(question: {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  answers: Array<{
    id: string;
    content: string;
    author: string;
    createdAt: string;
  }>;
}) {
  return generateStructuredData('QAPage', {
    mainEntity: {
      '@type': 'Question',
      name: question.title,
      text: question.content,
      dateCreated: question.createdAt,
      dateModified: question.updatedAt,
      author: {
        '@type': 'Person',
        name: question.author,
      },
      acceptedAnswer: question.answers.length > 0 ? {
        '@type': 'Answer',
        text: question.answers[0].content,
        dateCreated: question.answers[0].createdAt,
        author: {
          '@type': 'Person',
          name: question.answers[0].author,
        },
      } : undefined,
      suggestedAnswer: question.answers.slice(1).map(answer => ({
        '@type': 'Answer',
        text: answer.content,
        dateCreated: answer.createdAt,
        author: {
          '@type': 'Person',
          name: answer.author,
        },
      })),
    },
  });
}

/**
 * 사용자 프로필 구조화된 데이터 생성
 */
export function generateProfileStructuredData(user: {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  stats: {
    questionsCount: number;
    answersCount: number;
    likesCount: number;
  };
}) {
  return generateStructuredData('ProfilePage', {
    mainEntity: {
      '@type': 'Person',
      identifier: user.id,
      name: user.name,
      email: user.email,
      image: user.avatar,
      description: user.bio,
      knowsAbout: ['제주여행', '제주관광', '제주맛집', '제주숙소'],
      interactionStatistic: [
        {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/AskAction',
          userInteractionCount: user.stats.questionsCount,
        },
        {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/AnswerAction',
          userInteractionCount: user.stats.answersCount,
        },
      ],
    },
  });
}

/**
 * 사이트맵 생성기
 * 
 * @description
 * - 동적 사이트맵 생성
 * - 검색 엔진 크롤링 최적화
 * 
 * @param pages - 페이지 목록
 * @returns 사이트맵 XML 문자열
 */
export function generateSitemap(pages: Array<{
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}>): string {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
</urlset>`;

  return sitemap;
}

/**
 * 로봇.txt 생성기
 * 
 * @description
 * - 검색 엔진 크롤러 가이드라인 제공
 * - 사이트맵 위치 안내
 * 
 * @returns robots.txt 내용
 */
export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

# 사이트맵
Sitemap: ${DEFAULT_SEO.url}/sitemap.xml

# 크롤링 지연 (서버 부하 방지)
Crawl-delay: 1

# 제외할 경로
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/`;
}
