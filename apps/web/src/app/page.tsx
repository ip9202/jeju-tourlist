import { HeroSection, FeatureCards, PopularQuestions, RealtimeBanner } from '@/components/home';
import { MainLayout } from '@/components/layout/MainLayout';
import { DynamicSocketProvider } from '@/components/providers/DynamicSocketProvider';

export default function Home() {
  return (
    <DynamicSocketProvider socketUrl="http://localhost:4000" autoConnect={true}>
      <MainLayout showSidebar={true}>
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-8 overflow-x-hidden">
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