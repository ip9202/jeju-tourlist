import { ProfilePage } from "@/components/profile";

/**
 * 사용자 프로필 페이지
 *
 * @description
 * - 동적 라우트를 통한 사용자 프로필 페이지
 * - URL 파라미터에서 사용자 ID를 추출하여 ProfilePage 컴포넌트에 전달
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 *
 * @param params - URL 파라미터 (id: 사용자 ID)
 */
interface PageProps {
  params: {
    id: string;
  };
}

export default function UserProfilePage({ params }: PageProps) {
  return <ProfilePage userId={params.id} />;
}
