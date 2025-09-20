import { QuestionPage } from "@/components/question";

/**
 * 질문 상세 페이지
 *
 * @description
 * - 동적 라우트를 통한 질문 상세 페이지
 * - URL 파라미터에서 질문 ID를 추출하여 QuestionPage 컴포넌트에 전달
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 *
 * @param params - URL 파라미터 (id: 질문 ID)
 */
interface PageProps {
  params: {
    id: string;
  };
}

export default function QuestionDetailPage({ params }: PageProps) {
  return <QuestionPage questionId={params.id} />;
}
