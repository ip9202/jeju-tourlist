import { NextRequest, NextResponse } from 'next/server';
import { generateRobotsTxt } from '@/lib/seo';

/**
 * robots.txt 생성 API
 * 
 * @description
 * - 검색 엔진 크롤러 가이드라인 제공
 * - 사이트맵 위치 안내
 * - 크롤링 제한 설정
 * 
 * @route GET /robots.txt
 * @returns robots.txt 내용
 */
export async function GET(request: NextRequest) {
  try {
    // robots.txt 생성
    const robotsTxt = generateRobotsTxt();

    return new NextResponse(robotsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24시간 캐시
      },
    });
  } catch (error) {
    console.error('robots.txt 생성 오류:', error);
    
    // 오류 발생 시 기본 robots.txt 반환
    const fallbackRobotsTxt = `User-agent: *
Allow: /

Sitemap: https://dongnemulurowa.com/sitemap.xml`;

    return new NextResponse(fallbackRobotsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  }
}
