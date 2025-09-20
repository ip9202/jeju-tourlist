import { NextRequest, NextResponse } from 'next/server';
import { generateSitemap } from '@/lib/seo';

/**
 * 사이트맵 XML 생성 API
 * 
 * @description
 * - 동적 사이트맵 생성
 * - 검색 엔진 크롤링 최적화
 * - 실시간 페이지 목록 반환
 * 
 * @route GET /sitemap.xml
 * @returns XML 사이트맵
 */
export async function GET(request: NextRequest) {
  try {
    // 정적 페이지 목록
    const staticPages = [
      {
        url: 'https://dongnemulurowa.com',
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: 'https://dongnemulurowa.com/search',
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: 'https://dongnemulurowa.com/questions',
        lastModified: new Date().toISOString(),
        changeFrequency: 'hourly' as const,
        priority: 0.9,
      },
    ];

    // TODO: 실제 데이터베이스에서 동적 페이지 목록 가져오기
    // const questions = await getQuestions();
    // const users = await getUsers();
    
    // 동적 페이지 목록 (현재는 Mock 데이터)
    const dynamicPages = [
      // 질문 페이지들
      {
        url: 'https://dongnemulurowa.com/questions/1',
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: 'https://dongnemulurowa.com/questions/2',
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      // 사용자 프로필 페이지들
      {
        url: 'https://dongnemulurowa.com/profile/1',
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
    ];

    // 전체 페이지 목록
    const allPages = [...staticPages, ...dynamicPages];

    // 사이트맵 XML 생성
    const sitemapXml = generateSitemap(allPages);

    return new NextResponse(sitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('사이트맵 생성 오류:', error);
    
    // 오류 발생 시 기본 사이트맵 반환
    const fallbackSitemap = generateSitemap([
      {
        url: 'https://dongnemulurowa.com',
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
    ]);

    return new NextResponse(fallbackSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  }
}
