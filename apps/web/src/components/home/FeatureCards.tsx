"use client";

import React from "react";
import { MessageCircle, Users, Star, Shield, Zap, Heart } from "lucide-react";

/**
 * FeatureCard 컴포넌트 Props
 */
interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  className?: string;
}

/**
 * FeatureCard 컴포넌트
 *
 * @description
 * - 개별 기능 카드를 담당
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 재사용 가능한 카드 컴포넌트
 *
 * @example
 * ```tsx
 * <FeatureCard
 *   icon={MessageCircle}
 *   title="실시간 Q&A"
 *   description="..."
 * />
 * ```
 */
const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow ${className}`}
    >
      <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <Icon className="h-8 w-8 text-indigo-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

/**
 * FeatureCards 컴포넌트 Props
 */
interface FeatureCardsProps {
  className?: string;
}

/**
 * FeatureCards 컴포넌트
 *
 * @description
 * - 서비스의 주요 기능들을 카드 형태로 표시
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 반응형 그리드 레이아웃 적용
 *
 * @example
 * ```tsx
 * <FeatureCards />
 * ```
 */
export const FeatureCards: React.FC<FeatureCardsProps> = ({
  className = "",
}) => {
  /**
   * 기능 데이터
   */
  const features = [
    {
      icon: MessageCircle,
      title: "실시간 Q&A",
      description:
        "제주 여행에 대한 모든 질문을 실시간으로 답변받으세요. 현지인과 여행자들이 함께 도움을 드립니다.",
    },
    {
      icon: Users,
      title: "현지인 커뮤니티",
      description:
        "제주도 현지인들의 생생한 정보와 추천을 만나보세요. 가장 정확하고 최신의 정보를 제공합니다.",
    },
    {
      icon: Star,
      title: "검증된 정보",
      description:
        "커뮤니티가 검증한 신뢰할 수 있는 여행 정보만 제공합니다. 가짜 정보는 차단하고 품질을 보장합니다.",
    },
    {
      icon: Shield,
      title: "안전한 커뮤니티",
      description:
        "건전하고 안전한 커뮤니티 환경을 위해 지속적으로 관리하고 있습니다. 신고 기능으로 함께 지켜주세요.",
    },
    {
      icon: Zap,
      title: "빠른 답변",
      description:
        "평균 30분 이내의 빠른 답변을 제공합니다. 급한 질문도 빠르게 해결할 수 있습니다.",
    },
    {
      icon: Heart,
      title: "따뜻한 소통",
      description:
        "서로를 존중하고 도움을 주는 따뜻한 커뮤니티입니다. 함께 만들어가는 제주 여행 정보 공유 공간입니다.",
    },
  ];

  return (
    <section className={`py-16 ${className}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          왜 동네물어봐일까요?
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          제주 여행에 특화된 전문 커뮤니티로
          <br />더 정확하고 신뢰할 수 있는 정보를 제공합니다
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            className="hover:scale-105 transition-transform duration-200"
          />
        ))}
      </div>
    </section>
  );
};
