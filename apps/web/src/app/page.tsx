import { NotificationBell } from '@/components/notification/NotificationBell';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with NotificationBell */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">동네물어봐</h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          제주도 여행 Q&A 커뮤니티
        </h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            서버가 정상적으로 실행되었습니다! 🎉
          </h2>
          <p className="text-gray-600 mb-4">
            이제 E2E 테스트를 실행할 수 있습니다.
          </p>
          <div className="space-y-2">
            <div className="p-3 bg-green-100 rounded-md">
              <span className="text-green-800 font-medium">✅ Next.js 서버 실행 성공</span>
            </div>
            <div className="p-3 bg-blue-100 rounded-md">
              <span className="text-blue-800 font-medium">✅ 포트 3000에서 접근 가능</span>
            </div>
            <div className="p-3 bg-yellow-100 rounded-md">
              <span className="text-yellow-800 font-medium">⚠️ TypeScript 경고는 무시 가능</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}