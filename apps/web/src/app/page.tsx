import { HeroSection, FeatureCards, PopularQuestions, RealtimeBanner } from '@/components/home';
import { MainLayout } from '@/components/layout/MainLayout';
import { DynamicSocketProvider } from '@/components/providers/DynamicSocketProvider';

export default function Home() {
  return (
    <DynamicSocketProvider socketUrl="http://localhost:4000" autoConnect={true}>
      <MainLayout showSidebar={true}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <HeroSection />

          {/* Realtime Banner */}
          <RealtimeBanner />

          {/* Feature Cards */}
          <FeatureCards />

          {/* Popular Questions */}
          <PopularQuestions limit={6} showViewAll={true} />
        </div>
      </MainLayout>
    </DynamicSocketProvider>
  );
}