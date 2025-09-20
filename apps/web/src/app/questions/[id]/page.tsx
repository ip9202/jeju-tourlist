import { Metadata } from "next";
import { QuestionPage } from "@/components/question";
import { generateMetadata, generateQuestionStructuredData } from "@/lib/seo";

/**
 * 질문 상세 페이지
 *
 * @description
 * - 동적 라우트를 통한 질문 상세 페이지
 * - URL 파라미터에서 질문 ID를 추출하여 QuestionPage 컴포넌트에 전달
 * - SEO 최적화된 동적 메타데이터 생성
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 *
 * @param params - URL 파라미터 (id: 질문 ID)
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
 * - 질문 데이터를 기반으로 동적 메타데이터 생성
 * - SEO 최적화를 위한 구조화된 데이터 포함
 * 
 * @param params - URL 파라미터
 * @returns Next.js Metadata 객체
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params;
  
  try {
    // TODO: 실제 API에서 질문 데이터 가져오기
    // const question = await getQuestionById(id);
    
    // Mock 데이터 (실제 구현 시 API 호출로 대체)
    const question = {
      id,
      title: `제주 여행 질문 #${id}`,
      content: "제주 여행에 대한 질문입니다.",
      author: "익명",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return generateMetadata({
      title: question.title,
      description: question.content.length > 160 
        ? `${question.content.substring(0, 160)}...` 
        : question.content,
      keywords: ["제주여행", "제주질문", "제주답변", "제주관광"],
      url: `/questions/${id}`,
      type: "article",
      publishedTime: question.createdAt,
      modifiedTime: question.updatedAt,
      author: question.author,
      section: "제주여행",
      tags: ["제주여행", "질문", "답변"],
    });
  } catch (error) {
    console.error('메타데이터 생성 오류:', error);
    
    // 오류 발생 시 기본 메타데이터 반환
    return generateMetadata({
      title: `질문 #${id}`,
      description: "제주 여행에 대한 질문과 답변을 확인하세요.",
      url: `/questions/${id}`,
      type: "article",
    });
  }
}

/**
 * 질문 상세 페이지 컴포넌트
 * 
 * @description
 * - 서버 컴포넌트로 렌더링
 * - SEO 최적화된 구조
 * - 구조화된 데이터 포함
 */
export default async function QuestionDetailPage({ params }: PageProps) {
  const { id } = params;
  
  try {
    // TODO: 실제 API에서 질문 데이터 가져오기
    // const question = await getQuestionById(id);
    // const answers = await getAnswersByQuestionId(id);
    
    // Mock 데이터 (실제 구현 시 API 호출로 대체)
    const question = {
      id,
      title: `제주 여행 질문 #${id}`,
      content: "제주 여행에 대한 질문입니다.",
      author: "익명",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      answers: [
        {
          id: "1",
          content: "제주 여행에 대한 답변입니다.",
          author: "제주현지인",
          createdAt: new Date().toISOString(),
        },
      ],
    };

    // 구조화된 데이터 생성
    const structuredData = generateQuestionStructuredData(question);

    return (
      <>
        {/* 구조화된 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
        
        <QuestionPage questionId={id} />
      </>
    );
  } catch (error) {
    console.error('질문 데이터 로딩 오류:', error);
    
    // 오류 발생 시 기본 페이지 렌더링
    return <QuestionPage questionId={id} />;
  }
}
