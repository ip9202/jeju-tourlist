'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmailLoginForm } from '@/components/auth/EmailLoginForm';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Link>
        </div>

        {/* 로그인 카드 */}
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">로그인</CardTitle>
            <CardDescription className="text-muted-foreground">
              이메일로 로그인하고 제주 여행의 모든 것을 경험하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailLoginForm callbackUrl={callbackUrl} />
            
            {/* 회원가입 링크 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                아직 계정이 없으신가요?{' '}
                <Link 
                  href="/auth/signup" 
                  className="text-primary hover:underline font-medium"
                >
                  회원가입하기
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
