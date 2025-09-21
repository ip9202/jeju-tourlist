import { Metadata } from "next";
import { ProfilePage } from "@/components/profile";
import { generateMetadata as generateSEOMetadata, generateProfileStructuredData } from "@/lib/seo";

/**
 * 사용자 프로필 페이지
 *
 * @description
 * - 동적 라우트를 통한 사용자 프로필 페이지
 * - URL 파라미터에서 사용자 ID를 추출하여 ProfilePage 컴포넌트에 전달
 * - SEO 최적화된 동적 메타데이터 생성
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 *
 * @param params - URL 파라미터 (id: 사용자 ID)
 */
interface PageProps {
  params: {
    id: string;
  };
}

/**
 * 동적 메타데이터 생성
 * 
 * @description
 * - 사용자 데이터를 기반으로 동적 메타데이터 생성
 * - SEO 최적화를 위한 구조화된 데이터 포함
 * 
 * @param params - URL 파라미터
 * @returns Next.js Metadata 객체
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params;
  
  try {
    // TODO: 실제 API에서 사용자 데이터 가져오기
    // const user = await getUserById(id);
    
    // Mock 데이터 (실제 구현 시 API 호출로 대체)
    const user = {
      id,
      name: `사용자 #${id}`,
      bio: "제주 여행을 사랑하는 사용자입니다.",
      stats: {
        questionsCount: 10,
        answersCount: 25,
        likesCount: 150,
      },
    };

    return generateSEOMetadata({
      title: `${user.name}의 프로필`,
      description: user.bio || `${user.name}님의 제주 여행 질문과 답변을 확인하세요.`,
      keywords: ["제주여행", "사용자프로필", "제주커뮤니티", user.name],
      url: `/profile/${id}`,
      type: "profile",
      author: user.name,
    });
  } catch (error) {
    console.error('메타데이터 생성 오류:', error);
    
    // 오류 발생 시 기본 메타데이터 반환
    return generateSEOMetadata({
      title: `사용자 #${id}의 프로필`,
      description: "제주 여행 커뮤니티 사용자 프로필을 확인하세요.",
      url: `/profile/${id}`,
      type: "profile",
    });
  }
}

/**
 * 사용자 프로필 페이지 컴포넌트
 * 
 * @description
 * - 서버 컴포넌트로 렌더링
 * - SEO 최적화된 구조
 * - 구조화된 데이터 포함
 */
export default async function UserProfilePage({ params }: PageProps) {
  const { id } = params;
  
  try {
    // TODO: 실제 API에서 사용자 데이터 가져오기
    // const user = await getUserById(id);
    
    // Mock 데이터 (실제 구현 시 API 호출로 대체)
    const user = {
      id,
      name: `사용자 #${id}`,
      email: `user${id}@example.com`,
      avatar: `/avatars/user-${id}.jpg`,
      bio: "제주 여행을 사랑하는 사용자입니다.",
      stats: {
        questionsCount: 10,
        answersCount: 25,
        likesCount: 150,
      },
    };

    // 구조화된 데이터 생성
    const structuredData = generateProfileStructuredData(user);

    return (
      <>
        {/* 구조화된 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
        
        <ProfilePage userId={id} />
      </>
    );
  } catch (error) {
    console.error('사용자 데이터 로딩 오류:', error);
    
    // 오류 발생 시 기본 페이지 렌더링
    return <ProfilePage userId={id} />;
  }
}
